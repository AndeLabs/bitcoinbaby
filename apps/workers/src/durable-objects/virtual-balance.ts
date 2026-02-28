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
    // Balance table
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS balance (
        address TEXT PRIMARY KEY,
        virtual_balance TEXT NOT NULL DEFAULT '0',
        total_mined TEXT NOT NULL DEFAULT '0',
        total_withdrawn TEXT NOT NULL DEFAULT '0',
        pending_withdraw TEXT NOT NULL DEFAULT '0',
        last_mining_at INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

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
   * Get or create balance record
   */
  private getOrCreateBalance(address: string): VirtualBalance {
    const now = Date.now();

    // Try to get existing
    const rows = this.sql
      .exec("SELECT * FROM balance WHERE address = ?", address)
      .toArray();

    if (rows.length > 0) {
      const row = rows[0];
      return {
        address: row.address as string,
        virtualBalance: BigInt(row.virtual_balance as string),
        totalMined: BigInt(row.total_mined as string),
        totalWithdrawn: BigInt(row.total_withdrawn as string),
        pendingWithdraw: BigInt(row.pending_withdraw as string),
        lastMiningAt: row.last_mining_at as number,
        createdAt: row.created_at as number,
        updatedAt: row.updated_at as number,
      };
    }

    // Create new
    this.sql.exec(
      `INSERT INTO balance (address, created_at, updated_at) VALUES (?, ?, ?)`,
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
      lastMiningAt: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Update balance in database
   */
  private updateBalance(balance: VirtualBalance): void {
    this.sql.exec(
      `UPDATE balance SET
        virtual_balance = ?,
        total_mined = ?,
        total_withdrawn = ?,
        pending_withdraw = ?,
        last_mining_at = ?,
        updated_at = ?
       WHERE address = ?`,
      balance.virtualBalance.toString(),
      balance.totalMined.toString(),
      balance.totalWithdrawn.toString(),
      balance.pendingWithdraw.toString(),
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

    // Check for duplicate
    const existing = this.sql
      .exec(
        "SELECT id FROM mining_proofs WHERE hash = ? AND nonce = ?",
        proof.hash,
        proof.nonce,
      )
      .toArray();

    if (existing.length > 0) {
      return this.errorResponse("Proof already credited", 409);
    }

    // Store proof
    const proofId = crypto.randomUUID();
    const now = Date.now();

    this.sql.exec(
      `INSERT INTO mining_proofs
       (id, hash, nonce, difficulty, block_data, reward, credited, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      proofId,
      proof.hash,
      proof.nonce,
      proof.difficulty,
      proof.blockData || "",
      proof.reward.toString(),
      now,
    );

    // Update balance
    const balance = this.getOrCreateBalance(this.address);
    const reward = BigInt(proof.reward);

    balance.virtualBalance += reward;
    balance.totalMined += reward;
    balance.lastMiningAt = now;

    this.updateBalance(balance);

    const response: ApiResponse<{
      credited: string;
      newBalance: string;
      proofId: string;
    }> = {
      success: true,
      data: {
        credited: reward.toString(),
        newBalance: balance.virtualBalance.toString(),
        proofId,
      },
      timestamp: now,
    };

    return Response.json(response);
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
