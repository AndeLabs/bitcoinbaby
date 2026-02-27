/**
 * Withdraw Pool Durable Object
 *
 * Manages batched withdrawal requests.
 * Users add their withdrawal requests to a pool.
 * Pool is processed weekly/monthly to minimize Bitcoin fees.
 *
 * Pool Types:
 * - weekly: Processed every Sunday at 00:00 UTC
 * - monthly: Processed on 1st of each month
 * - low_fee: Processed when Bitcoin fees drop below threshold
 */

import { DurableObject } from "cloudflare:workers";
import type {
  Env,
  WithdrawRequest,
  WithdrawStatus,
  PoolType,
  ApiResponse,
  WithdrawResponse,
  PoolStatusResponse,
  FeeEstimate,
} from "../lib/types";

// Pool configuration
const POOL_CONFIG = {
  weekly: {
    name: "Weekly Pool",
    description: "Processed every Sunday - Lowest fees",
    processingDay: 0, // Sunday
  },
  monthly: {
    name: "Monthly Pool",
    description: "Processed on 1st of month - Lowest fees",
    processingDay: 1, // 1st of month
  },
  low_fee: {
    name: "Low Fee Pool",
    description: "Processed when fees are low",
    maxFeeRate: 5, // sat/vB
  },
  immediate: {
    name: "Immediate",
    description: "Process ASAP - Higher fees",
    maxWaitMs: 60 * 60 * 1000, // 1 hour max wait
  },
};

export class WithdrawPoolDO extends DurableObject<Env> {
  private sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;

    // Initialize database schema
    this.ctx.blockConcurrencyWhile(async () => {
      await this.initializeSchema();
    });
  }

  /**
   * Initialize SQLite schema
   */
  private async initializeSchema(): Promise<void> {
    // Withdrawal requests table
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS withdraw_requests (
        id TEXT PRIMARY KEY,
        from_address TEXT NOT NULL,
        to_address TEXT NOT NULL,
        amount TEXT NOT NULL,
        pool_type TEXT NOT NULL,
        max_fee_rate INTEGER,
        status TEXT NOT NULL DEFAULT 'pending',
        batch_id TEXT,
        txid TEXT,
        error TEXT,
        requested_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Batch transactions table
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS batch_transactions (
        id TEXT PRIMARY KEY,
        total_amount TEXT NOT NULL,
        recipient_count INTEGER NOT NULL,
        tx_hex TEXT,
        txid TEXT,
        fee_rate INTEGER NOT NULL,
        total_fee INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'building',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Indexes
    this.sql.exec(`
      CREATE INDEX IF NOT EXISTS idx_requests_status
      ON withdraw_requests(status)
    `);
    this.sql.exec(`
      CREATE INDEX IF NOT EXISTS idx_requests_pool
      ON withdraw_requests(pool_type, status)
    `);
  }

  /**
   * Handle incoming requests
   *
   * Path format: /pool/{poolType}/{action}
   * Examples:
   *   GET  /pool/weekly/status
   *   GET  /pool/weekly/requests?address=xxx
   *   POST /pool/weekly/request
   *   POST /pool/weekly/cancel
   *   POST /pool/weekly/process
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Path: /pool/{poolType}/{action}
      const pathParts = path.split("/").filter(Boolean);
      if (pathParts.length < 2 || pathParts[0] !== "pool") {
        return this.errorResponse("Invalid path", 400);
      }

      const poolType = pathParts[1] as PoolType;
      const action = pathParts[2] || "status";

      switch (request.method) {
        case "GET":
          if (action === "status") {
            return this.handleGetPoolStatus(poolType);
          }
          if (action === "request" && pathParts[3]) {
            return this.handleGetRequest(pathParts[3]);
          }
          if (action === "requests") {
            const address = url.searchParams.get("address");
            if (!address) return this.errorResponse("Address required", 400);
            return this.handleGetUserRequests(address);
          }
          break;

        case "POST":
          if (action === "request") {
            return this.handleCreateRequest(request, poolType);
          }
          if (action === "cancel") {
            return this.handleCancelRequest(request);
          }
          if (action === "process") {
            return this.handleProcessPool(poolType);
          }
          break;
      }

      return this.errorResponse("Not found", 404);
    } catch (error) {
      console.error("[WithdrawPool] Error:", error);
      return this.errorResponse(
        error instanceof Error ? error.message : "Internal error",
        500,
      );
    }
  }

  /**
   * GET /pool/status - Get pool status
   */
  private handleGetPoolStatus(poolType: PoolType): Response {
    const pending = this.sql
      .exec(
        `SELECT COUNT(*) as count, COALESCE(SUM(CAST(amount AS INTEGER)), 0) as total
         FROM withdraw_requests
         WHERE pool_type = ? AND status = 'pending'`,
        poolType,
      )
      .toArray()[0];

    const nextProcessingTime = this.getNextProcessingTime(poolType);
    const feeRate = 5; // TODO: Fetch real fee rate

    const poolConfig = POOL_CONFIG[poolType];
    const response: ApiResponse<
      PoolStatusResponse & { name: string; description: string }
    > = {
      success: true,
      data: {
        poolType,
        name: poolConfig.name,
        description: poolConfig.description,
        pendingRequests: pending.count as number,
        totalAmount: (pending.total || 0).toString(),
        nextProcessingTime: new Date(nextProcessingTime).toISOString(),
        currentFeeRate: feeRate,
        estimatedFeePerUser: this.estimateFeePerUser(
          pending.count as number,
          feeRate,
        ),
      },
      timestamp: Date.now(),
    };

    return Response.json(response);
  }

  /**
   * GET /pool/request/{id} - Get specific request
   */
  private handleGetRequest(requestId: string): Response {
    const rows = this.sql
      .exec("SELECT * FROM withdraw_requests WHERE id = ?", requestId)
      .toArray();

    if (rows.length === 0) {
      return this.errorResponse("Request not found", 404);
    }

    const row = rows[0];
    const response: ApiResponse<WithdrawRequest> = {
      success: true,
      data: {
        id: row.id as string,
        fromAddress: row.from_address as string,
        toAddress: row.to_address as string,
        amount: BigInt(row.amount as string),
        poolType: row.pool_type as PoolType,
        maxFeeRate: row.max_fee_rate as number | null,
        status: row.status as WithdrawStatus,
        txid: row.txid as string | null,
        error: row.error as string | null,
        requestedAt: row.requested_at as number,
        updatedAt: row.updated_at as number,
      },
      timestamp: Date.now(),
    };

    return Response.json(response);
  }

  /**
   * GET /pool/user-requests - Get all requests for a user
   */
  private handleGetUserRequests(address: string): Response {
    const rows = this.sql
      .exec(
        `SELECT * FROM withdraw_requests
         WHERE from_address = ?
         ORDER BY requested_at DESC
         LIMIT 50`,
        address,
      )
      .toArray();

    const requests: WithdrawRequest[] = rows.map((row) => ({
      id: row.id as string,
      fromAddress: row.from_address as string,
      toAddress: row.to_address as string,
      amount: BigInt(row.amount as string),
      poolType: row.pool_type as PoolType,
      maxFeeRate: row.max_fee_rate as number | null,
      status: row.status as WithdrawStatus,
      txid: row.txid as string | null,
      error: row.error as string | null,
      requestedAt: row.requested_at as number,
      updatedAt: row.updated_at as number,
    }));

    const response: ApiResponse<{ requests: WithdrawRequest[] }> = {
      success: true,
      data: { requests },
      timestamp: Date.now(),
    };

    return Response.json(response);
  }

  /**
   * POST /pool/{poolType}/request - Create withdrawal request
   */
  private async handleCreateRequest(
    request: Request,
    poolType: PoolType,
  ): Promise<Response> {
    const body = (await request.json()) as {
      fromAddress: string;
      toAddress: string;
      amount: string;
      maxFeeRate?: number;
    };

    // Validate
    if (!body.fromAddress || !body.toAddress || !body.amount) {
      return this.errorResponse("Missing required fields", 400);
    }

    if (!["weekly", "monthly", "low_fee", "immediate"].includes(poolType)) {
      return this.errorResponse("Invalid pool type", 400);
    }

    const now = Date.now();
    const requestId = crypto.randomUUID();

    // Insert request
    this.sql.exec(
      `INSERT INTO withdraw_requests
       (id, from_address, to_address, amount, pool_type, max_fee_rate, status, requested_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      requestId,
      body.fromAddress,
      body.toAddress,
      body.amount,
      poolType,
      body.maxFeeRate || null,
      now,
      now,
    );

    // Get position in queue
    const position = this.sql
      .exec(
        `SELECT COUNT(*) as pos FROM withdraw_requests
         WHERE pool_type = ? AND status = 'pending' AND requested_at <= ?`,
        poolType,
        now,
      )
      .toArray()[0].pos as number;

    const nextProcessingTime = this.getNextProcessingTime(poolType);
    const feeRate = 5; // TODO: Fetch real

    const response: ApiResponse<WithdrawResponse> = {
      success: true,
      data: {
        requestId,
        amount: body.amount,
        poolType,
        estimatedProcessingTime: new Date(nextProcessingTime).toISOString(),
        estimatedFee: this.estimateFeePerUser(position, feeRate),
        position,
      },
      timestamp: now,
    };

    return Response.json(response, { status: 201 });
  }

  /**
   * POST /pool/cancel - Cancel pending request
   */
  private async handleCancelRequest(request: Request): Promise<Response> {
    const body = (await request.json()) as {
      requestId: string;
      address: string;
    };

    // Verify ownership and status
    const rows = this.sql
      .exec(
        `SELECT * FROM withdraw_requests
         WHERE id = ? AND from_address = ? AND status = 'pending'`,
        body.requestId,
        body.address,
      )
      .toArray();

    if (rows.length === 0) {
      return this.errorResponse(
        "Request not found or cannot be cancelled",
        404,
      );
    }

    // Update status
    this.sql.exec(
      `UPDATE withdraw_requests
       SET status = 'cancelled', updated_at = ?
       WHERE id = ?`,
      Date.now(),
      body.requestId,
    );

    const response: ApiResponse<{ cancelled: boolean; amount: string }> = {
      success: true,
      data: {
        cancelled: true,
        amount: rows[0].amount as string,
      },
      timestamp: Date.now(),
    };

    return Response.json(response);
  }

  /**
   * POST /pool/process - Process pool (called by cron or manually)
   */
  private async handleProcessPool(poolType: PoolType): Promise<Response> {
    // Check if it's time to process
    if (!this.shouldProcessNow(poolType)) {
      return Response.json({
        success: true,
        data: { processed: false, reason: "Not time to process yet" },
        timestamp: Date.now(),
      });
    }

    // Get pending requests for this pool
    const rows = this.sql
      .exec(
        `SELECT * FROM withdraw_requests
         WHERE pool_type = ? AND status = 'pending'
         ORDER BY requested_at ASC`,
        poolType,
      )
      .toArray();

    if (rows.length === 0) {
      return Response.json({
        success: true,
        data: { processed: false, reason: "No pending requests" },
        timestamp: Date.now(),
      });
    }

    // Create batch transaction
    const batchId = crypto.randomUUID();
    const now = Date.now();

    let totalAmount = 0n;
    const requests: WithdrawRequest[] = rows.map((row) => {
      const amount = BigInt(row.amount as string);
      totalAmount += amount;
      return {
        id: row.id as string,
        fromAddress: row.from_address as string,
        toAddress: row.to_address as string,
        amount,
        poolType: row.pool_type as PoolType,
        maxFeeRate: row.max_fee_rate as number | null,
        status: row.status as WithdrawStatus,
        txid: null,
        error: null,
        requestedAt: row.requested_at as number,
        updatedAt: row.updated_at as number,
      };
    });

    // Get current fee rate
    const feeRate = await this.getCurrentFeeRate();
    const totalFee = this.estimateTotalFee(requests.length, feeRate);

    // Create batch record
    this.sql.exec(
      `INSERT INTO batch_transactions
       (id, total_amount, recipient_count, fee_rate, total_fee, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'building', ?, ?)`,
      batchId,
      totalAmount.toString(),
      requests.length,
      feeRate,
      totalFee,
      now,
      now,
    );

    // Update all requests to processing
    for (const req of requests) {
      this.sql.exec(
        `UPDATE withdraw_requests
         SET status = 'processing', batch_id = ?, updated_at = ?
         WHERE id = ?`,
        batchId,
        now,
        req.id,
      );
    }

    // TODO: Actually build and broadcast the transaction
    // This would call your existing Charms/Bitcoin transaction code
    // For now, we mark as ready for manual processing

    this.sql.exec(
      `UPDATE batch_transactions
       SET status = 'ready', updated_at = ?
       WHERE id = ?`,
      now,
      batchId,
    );

    const response: ApiResponse<{
      processed: boolean;
      batchId: string;
      requestCount: number;
      totalAmount: string;
      estimatedFee: number;
      feePerUser: number;
    }> = {
      success: true,
      data: {
        processed: true,
        batchId,
        requestCount: requests.length,
        totalAmount: totalAmount.toString(),
        estimatedFee: totalFee,
        feePerUser: Math.ceil(totalFee / requests.length),
      },
      timestamp: now,
    };

    return Response.json(response);
  }

  /**
   * Handle scheduled cron events
   */
  async alarm(): Promise<void> {
    // Process pools that are due
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const dayOfMonth = now.getUTCDate();

    // Weekly pool - Sunday
    if (dayOfWeek === 0) {
      await this.processPoolInternal("weekly");
    }

    // Monthly pool - 1st of month
    if (dayOfMonth === 1) {
      await this.processPoolInternal("monthly");
    }

    // Low fee pool - check if fees are low
    const feeRate = await this.getCurrentFeeRate();
    const maxFeeRate = parseInt(this.env.MAX_FEE_RATE_SAT_VB || "5");
    if (feeRate <= maxFeeRate) {
      await this.processPoolInternal("low_fee");
    }

    // Immediate pool - always try to process
    await this.processPoolInternal("immediate");
  }

  /**
   * Internal pool processing
   */
  private async processPoolInternal(poolType: PoolType): Promise<void> {
    const request = new Request(
      `http://internal/pool/process?pool=${poolType}`,
      {
        method: "POST",
      },
    );
    await this.fetch(request);
  }

  /**
   * Calculate next processing time for pool type
   */
  private getNextProcessingTime(poolType: PoolType): number {
    const now = new Date();

    switch (poolType) {
      case "weekly": {
        // Next Sunday at 00:00 UTC
        const daysUntilSunday = (7 - now.getUTCDay()) % 7 || 7;
        const nextSunday = new Date(now);
        nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
        nextSunday.setUTCHours(0, 0, 0, 0);
        return nextSunday.getTime();
      }

      case "monthly": {
        // 1st of next month at 00:00 UTC
        const nextMonth = new Date(now);
        nextMonth.setUTCMonth(now.getUTCMonth() + 1, 1);
        nextMonth.setUTCHours(0, 0, 0, 0);
        return nextMonth.getTime();
      }

      case "low_fee": {
        // Next 6-hour check
        const nextCheck = new Date(now);
        nextCheck.setUTCHours(Math.ceil(now.getUTCHours() / 6) * 6, 0, 0, 0);
        if (nextCheck <= now) {
          nextCheck.setUTCHours(nextCheck.getUTCHours() + 6);
        }
        return nextCheck.getTime();
      }

      case "immediate": {
        // Within 1 hour
        return now.getTime() + 60 * 60 * 1000;
      }

      default:
        return now.getTime() + 7 * 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Check if pool should be processed now
   */
  private shouldProcessNow(poolType: PoolType): boolean {
    const now = new Date();

    switch (poolType) {
      case "weekly":
        return now.getUTCDay() === 0 && now.getUTCHours() < 1;
      case "monthly":
        return now.getUTCDate() === 1 && now.getUTCHours() < 1;
      case "low_fee":
        return true; // Always check, will verify fee rate
      case "immediate":
        return true;
      default:
        return false;
    }
  }

  /**
   * Get current Bitcoin fee rate
   */
  private async getCurrentFeeRate(): Promise<number> {
    try {
      // Use mempool.space API
      const response = await fetch(
        "https://mempool.space/api/v1/fees/recommended",
      );
      if (response.ok) {
        const fees = (await response.json()) as FeeEstimate;
        return fees.economyFee;
      }
    } catch (error) {
      console.error("[WithdrawPool] Failed to fetch fee rate:", error);
    }
    return 5; // Default fallback
  }

  /**
   * Estimate fee per user based on pool size
   */
  private estimateFeePerUser(userCount: number, feeRate: number): number {
    if (userCount === 0) return 0;

    // Estimate TX size: ~10 bytes base + ~34 bytes per output
    const baseTxSize = 100;
    const perOutputSize = 34;
    const totalSize = baseTxSize + perOutputSize * Math.max(userCount, 1);
    const totalFee = totalSize * feeRate;

    return Math.ceil(totalFee / Math.max(userCount, 1));
  }

  /**
   * Estimate total fee for batch
   */
  private estimateTotalFee(userCount: number, feeRate: number): number {
    const baseTxSize = 100;
    const perOutputSize = 34;
    const totalSize = baseTxSize + perOutputSize * userCount;
    return totalSize * feeRate;
  }

  /**
   * Helper to create error response
   */
  private errorResponse(message: string, status: number): Response {
    const response: ApiResponse = {
      success: false,
      error: message,
      timestamp: Date.now(),
    };
    return Response.json(response, { status });
  }
}
