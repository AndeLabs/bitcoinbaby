/**
 * Virtual Balance Durable Object
 *
 * Manages each user's virtual $BABY token balance.
 * Tokens are accumulated here until user decides to withdraw to Bitcoin.
 *
 * Storage: SQLite (free tier on Cloudflare)
 * One instance per user address.
 */

import { DurableObject } from "cloudflare:workers";
import type {
  Env,
  VirtualBalance,
  MiningProof,
  ApiResponse,
  BalanceResponse,
} from "../lib/types";

// Minimum withdraw amount (from env)
const DEFAULT_MIN_WITHDRAW = 100n;

export class VirtualBalanceDO extends DurableObject<Env> {
  private sql: SqlStorage;
  private address: string | null = null;

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
    // Balance table (includes streak for efficiency)
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS balance (
        address TEXT PRIMARY KEY,
        virtual_balance TEXT NOT NULL DEFAULT '0',
        total_mined TEXT NOT NULL DEFAULT '0',
        total_withdrawn TEXT NOT NULL DEFAULT '0',
        pending_withdraw TEXT NOT NULL DEFAULT '0',
        streak_count INTEGER NOT NULL DEFAULT 0,
        last_mining_at INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Add streak_count if not exists (migration)
    try {
      this.sql.exec(
        `ALTER TABLE balance ADD COLUMN streak_count INTEGER NOT NULL DEFAULT 0`,
      );
    } catch {
      // Column already exists
    }

    // Mining proofs table (for audit trail)
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS mining_proofs (
        id TEXT PRIMARY KEY,
        hash TEXT NOT NULL,
        nonce INTEGER NOT NULL,
        difficulty INTEGER NOT NULL,
        block_data TEXT NOT NULL,
        reward TEXT NOT NULL,
        credited INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        UNIQUE(hash, nonce)
      )
    `);

    // Indexes
    this.sql.exec(`
      CREATE INDEX IF NOT EXISTS idx_proofs_credited
      ON mining_proofs(credited)
    `);
  }

  /**
   * Get or create balance record (SINGLE DB READ)
   */
  private getOrCreateBalance(address: string): VirtualBalance {
    const now = Date.now();

    // Try to get existing - single read
    const rows = this.sql
      .exec("SELECT * FROM balance WHERE address = ? LIMIT 1", address)
      .toArray();

    if (rows.length > 0) {
      const row = rows[0];
      return {
        address: row.address as string,
        virtualBalance: BigInt(row.virtual_balance as string),
        totalMined: BigInt(row.total_mined as string),
        totalWithdrawn: BigInt(row.total_withdrawn as string),
        pendingWithdraw: BigInt(row.pending_withdraw as string),
        streakCount: (row.streak_count as number) || 0,
        lastMiningAt: row.last_mining_at as number,
        createdAt: row.created_at as number,
        updatedAt: row.updated_at as number,
      };
    }

    // Create new
    this.sql.exec(
      `INSERT INTO balance (address, streak_count, created_at, updated_at) VALUES (?, 0, ?, ?)`,
      address,
      now,
      now,
    );

    return {
      address,
      virtualBalance: 0n,
      totalMined: 0n,
      totalWithdrawn: 0n,
      pendingWithdraw: 0n,
      streakCount: 0,
      lastMiningAt: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Update balance in database (SINGLE DB WRITE)
   */
  private updateBalance(balance: VirtualBalance): void {
    this.sql.exec(
      `UPDATE balance SET
        virtual_balance = ?,
        total_mined = ?,
        total_withdrawn = ?,
        pending_withdraw = ?,
        streak_count = ?,
        last_mining_at = ?,
        updated_at = ?
       WHERE address = ?`,
      balance.virtualBalance.toString(),
      balance.totalMined.toString(),
      balance.totalWithdrawn.toString(),
      balance.pendingWithdraw.toString(),
      balance.streakCount,
      balance.lastMiningAt,
      Date.now(),
      balance.address,
    );
  }

  /**
   * Handle incoming requests
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Extract address from path: /balance/{address}/...
      const pathParts = path.split("/").filter(Boolean);
      if (pathParts.length < 2 || pathParts[0] !== "balance") {
        return this.errorResponse("Invalid path", 400);
      }

      this.address = pathParts[1];
      const action = pathParts[2] || "get";

      switch (request.method) {
        case "GET":
          if (action === "get" || action === "") {
            return this.handleGetBalance();
          }
          break;

        case "POST":
          if (action === "credit") {
            return this.handleCreditMining(request);
          }
          if (action === "reserve") {
            return this.handleReserveWithdraw(request);
          }
          if (action === "confirm-withdraw") {
            return this.handleConfirmWithdraw(request);
          }
          if (action === "cancel-withdraw") {
            return this.handleCancelWithdraw(request);
          }
          break;
      }

      return this.errorResponse("Not found", 404);
    } catch (error) {
      console.error("[VirtualBalance] Error:", error);
      return this.errorResponse(
        error instanceof Error ? error.message : "Internal error",
        500,
      );
    }
  }

  /**
   * GET /balance/{address} - Get current balance
   */
  private handleGetBalance(): Response {
    if (!this.address) {
      return this.errorResponse("Address required", 400);
    }

    const balance = this.getOrCreateBalance(this.address);
    const available = balance.virtualBalance - balance.pendingWithdraw;

    const response: ApiResponse<BalanceResponse> = {
      success: true,
      data: {
        address: balance.address,
        virtualBalance: balance.virtualBalance.toString(),
        pendingWithdraw: balance.pendingWithdraw.toString(),
        availableToWithdraw: (available > 0n ? available : 0n).toString(),
        totalMined: balance.totalMined.toString(),
        totalWithdrawn: balance.totalWithdrawn.toString(),
      },
      timestamp: Date.now(),
    };

    return Response.json(response);
  }

  /**
   * POST /balance/{address}/credit - Credit mining reward
   */
  private async handleCreditMining(request: Request): Promise<Response> {
    if (!this.address) {
      return this.errorResponse("Address required", 400);
    }

    const body = (await request.json()) as {
      proof: MiningProof;
    };

    const { proof } = body;

    // Validate proof (use explicit checks to handle nonce=0 correctly)
    if (
      !proof ||
      !proof.hash ||
      typeof proof.nonce !== "number" ||
      !proof.reward
    ) {
      return this.errorResponse("Invalid proof", 400);
    }

    // =========================================================================
    // STREAK BONUS SYSTEM - OPTIMIZED (minimal DB reads)
    // Streak stored in balance table, not calculated from proofs
    // =========================================================================

    const now = Date.now();
    const STREAK_RESET_MS = 30 * 60 * 1000; // 30 minutes

    // Get balance (includes streak info) - SINGLE READ
    const balance = this.getOrCreateBalance(this.address);

    // Check if streak is still active (within 30 min of last mining)
    const streakActive = now - balance.lastMiningAt < STREAK_RESET_MS;
    const consecutiveShares = streakActive ? this.getStreakCount(balance) : 0;

    // Calculate streak multiplier (1.0x to 2.0x)
    const streakMultiplier = this.getStreakMultiplier(consecutiveShares);

    // =========================================================================
    // SUSTAINABLE EMISSION - NO LIMITS
    // Base reward: 100 $BABY, Difficulty: D22
    // La dificultad controla la emision naturalmente
    // =========================================================================

    // Apply streak bonus to reward
    const baseReward = BigInt(proof.reward);
    const boostedReward = BigInt(
      Math.floor(Number(baseReward) * streakMultiplier),
    );

    // Daily total from balance (no extra query needed)
    const dailyTotal = balance.totalMined;

    // =========================================================================

    // Store proof - UNIQUE index prevents duplicates (NO SELECT needed)
    const proofId = crypto.randomUUID();

    try {
      this.sql.exec(
        `INSERT INTO mining_proofs
         (id, hash, nonce, difficulty, block_data, reward, credited, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
        proofId,
        proof.hash,
        proof.nonce,
        proof.difficulty,
        proof.blockData || "",
        boostedReward.toString(),
        now,
      );
    } catch (e) {
      // UNIQUE constraint violation = duplicate proof
      if (e instanceof Error && e.message.includes("UNIQUE")) {
        return this.errorResponse("Proof already credited", 409);
      }
      throw e;
    }

    // Update balance with boosted reward and streak
    balance.virtualBalance += boostedReward;
    balance.totalMined += boostedReward;
    balance.lastMiningAt = now;

    // Update streak count in balance
    this.updateStreakCount(balance, streakActive);
    this.updateBalance(balance);

    // Response includes streak info for UI (NO LIMITS, just stats)
    const response: ApiResponse<{
      credited: string;
      newBalance: string;
      proofId: string;
      streakInfo: {
        consecutiveShares: number;
        multiplier: number;
        baseReward: string;
        boostedReward: string;
        nextTierAt: number;
      };
      dailyStats: {
        totalToday: string;
        sharesCount: number;
      };
    }> = {
      success: true,
      data: {
        credited: boostedReward.toString(),
        newBalance: balance.virtualBalance.toString(),
        proofId,
        streakInfo: {
          consecutiveShares: consecutiveShares + 1,
          multiplier: streakMultiplier,
          baseReward: baseReward.toString(),
          boostedReward: boostedReward.toString(),
          nextTierAt: this.getNextStreakTier(consecutiveShares + 1),
        },
        dailyStats: {
          totalToday: (dailyTotal + boostedReward).toString(),
          sharesCount: consecutiveShares + 1,
        },
      },
      timestamp: now,
    };

    return Response.json(response);
  }

  /**
   * Get streak count from balance (NO DB READ - uses cached balance)
   */
  private getStreakCount(balance: VirtualBalance): number {
    return balance.streakCount;
  }

  /**
   * Update streak count in balance object
   */
  private updateStreakCount(
    balance: VirtualBalance,
    streakActive: boolean,
  ): void {
    if (streakActive) {
      // Increment streak
      balance.streakCount += 1;
    } else {
      // Reset streak to 1 (this is the first share of new streak)
      balance.streakCount = 1;
    }
  }

  /**
   * Calculate streak multiplier based on consecutive shares
   *
   * 0-9 shares:    1.0x (base)
   * 10-49 shares:  1.2x (+20%)
   * 50-99 shares:  1.5x (+50%)
   * 100-249:       1.75x (+75%)
   * 250-499:       1.9x (+90%)
   * 500+:          2.0x (+100%) MAX
   */
  private getStreakMultiplier(consecutiveShares: number): number {
    const tiers = [10, 50, 100, 250, 500];
    const multipliers = [1.0, 1.2, 1.5, 1.75, 1.9, 2.0];

    for (let i = tiers.length - 1; i >= 0; i--) {
      if (consecutiveShares >= tiers[i]) {
        return multipliers[i + 1];
      }
    }
    return multipliers[0];
  }

  /**
   * Get next streak tier threshold
   */
  private getNextStreakTier(currentShares: number): number {
    const tiers = [10, 50, 100, 250, 500];
    for (const tier of tiers) {
      if (currentShares < tier) return tier;
    }
    return 500; // Max tier reached
  }

  /**
   * POST /balance/{address}/reserve - Reserve amount for withdrawal
   */
  private async handleReserveWithdraw(request: Request): Promise<Response> {
    if (!this.address) {
      return this.errorResponse("Address required", 400);
    }

    const body = (await request.json()) as {
      amount: string;
      requestId: string;
    };

    const amount = BigInt(body.amount);
    const minWithdraw = BigInt(
      this.env.MIN_WITHDRAW_AMOUNT || DEFAULT_MIN_WITHDRAW,
    );

    // Validate amount
    if (amount < minWithdraw) {
      return this.errorResponse(
        `Minimum withdrawal is ${minWithdraw} tokens`,
        400,
      );
    }

    const balance = this.getOrCreateBalance(this.address);
    const available = balance.virtualBalance - balance.pendingWithdraw;

    if (amount > available) {
      return this.errorResponse(
        `Insufficient balance. Available: ${available}`,
        400,
      );
    }

    // Reserve the amount
    balance.pendingWithdraw += amount;
    this.updateBalance(balance);

    const response: ApiResponse<{
      reserved: string;
      pendingTotal: string;
      availableAfter: string;
    }> = {
      success: true,
      data: {
        reserved: amount.toString(),
        pendingTotal: balance.pendingWithdraw.toString(),
        availableAfter: (
          balance.virtualBalance - balance.pendingWithdraw
        ).toString(),
      },
      timestamp: Date.now(),
    };

    return Response.json(response);
  }

  /**
   * POST /balance/{address}/confirm-withdraw - Confirm withdrawal completed
   */
  private async handleConfirmWithdraw(request: Request): Promise<Response> {
    if (!this.address) {
      return this.errorResponse("Address required", 400);
    }

    const body = (await request.json()) as {
      amount: string;
      txid: string;
    };

    const amount = BigInt(body.amount);
    const balance = this.getOrCreateBalance(this.address);

    // Validate
    if (amount > balance.pendingWithdraw) {
      return this.errorResponse("Amount exceeds pending withdrawal", 400);
    }

    // Confirm withdrawal
    balance.pendingWithdraw -= amount;
    balance.virtualBalance -= amount;
    balance.totalWithdrawn += amount;

    this.updateBalance(balance);

    const response: ApiResponse<{
      withdrawn: string;
      txid: string;
      newBalance: string;
    }> = {
      success: true,
      data: {
        withdrawn: amount.toString(),
        txid: body.txid,
        newBalance: balance.virtualBalance.toString(),
      },
      timestamp: Date.now(),
    };

    return Response.json(response);
  }

  /**
   * POST /balance/{address}/cancel-withdraw - Cancel pending withdrawal
   */
  private async handleCancelWithdraw(request: Request): Promise<Response> {
    if (!this.address) {
      return this.errorResponse("Address required", 400);
    }

    const body = (await request.json()) as {
      amount: string;
      requestId: string;
    };

    const amount = BigInt(body.amount);
    const balance = this.getOrCreateBalance(this.address);

    // Validate
    if (amount > balance.pendingWithdraw) {
      return this.errorResponse("Amount exceeds pending withdrawal", 400);
    }

    // Release the reserved amount
    balance.pendingWithdraw -= amount;
    this.updateBalance(balance);

    const response: ApiResponse<{
      released: string;
      availableNow: string;
    }> = {
      success: true,
      data: {
        released: amount.toString(),
        availableNow: (
          balance.virtualBalance - balance.pendingWithdraw
        ).toString(),
      },
      timestamp: Date.now(),
    };

    return Response.json(response);
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
