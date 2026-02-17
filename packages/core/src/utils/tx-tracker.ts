/**
 * Transaction Confirmation Tracker
 *
 * Monitors Bitcoin transactions and tracks confirmations.
 * Provides event callbacks for UI updates.
 */

import { createLogger, type Logger } from "./logger";
import { retry, type RetryOptions } from "./retry";
import { TransactionError, ErrorCode, type AppError } from "./errors";

// =============================================================================
// TYPES
// =============================================================================

export type TxStatus =
  | "pending" // Just submitted, not yet in mempool
  | "mempool" // In mempool, waiting for confirmation
  | "confirming" // 1-5 confirmations
  | "confirmed" // 6+ confirmations (considered final)
  | "failed" // Failed to broadcast or rejected
  | "replaced"; // Replaced by another transaction (RBF)

export interface TrackedTransaction {
  txid: string;
  status: TxStatus;
  confirmations: number;
  blockHeight?: number;
  blockHash?: string;
  submittedAt: number;
  confirmedAt?: number;
  failedAt?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface TxTrackerEvents {
  /** Called when transaction status changes */
  onStatusChange?: (tx: TrackedTransaction) => void;
  /** Called when transaction reaches target confirmations */
  onConfirmed?: (tx: TrackedTransaction) => void;
  /** Called when transaction fails */
  onFailed?: (tx: TrackedTransaction, error: AppError) => void;
  /** Called on each confirmation update */
  onConfirmationUpdate?: (tx: TrackedTransaction) => void;
}

export interface TxTrackerOptions {
  /** Polling interval in ms (default: 30000) */
  pollInterval?: number;
  /** Target confirmations for "confirmed" status (default: 6) */
  targetConfirmations?: number;
  /** Maximum age before removing from tracking (default: 24h) */
  maxAge?: number;
  /** API endpoint for checking transactions */
  apiEndpoint?: string;
  /** Custom fetch function for checking transaction status */
  fetchTransaction?: (txid: string) => Promise<TxApiResponse>;
  /** Events */
  events?: TxTrackerEvents;
  /** Retry options for API calls */
  retryOptions?: RetryOptions;
}

export interface TxApiResponse {
  txid: string;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
  };
  fee?: number;
}

// =============================================================================
// DEFAULT OPTIONS
// =============================================================================

const DEFAULT_OPTIONS: Required<
  Omit<TxTrackerOptions, "fetchTransaction" | "events" | "retryOptions">
> = {
  pollInterval: 30000,
  targetConfirmations: 6,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  apiEndpoint: "https://mempool.space/testnet4/api",
};

// =============================================================================
// TRANSACTION TRACKER
// =============================================================================

/**
 * Transaction Confirmation Tracker
 *
 * @example
 * ```typescript
 * const tracker = createTxTracker({
 *   events: {
 *     onConfirmed: (tx) => {
 *       console.log(`Transaction ${tx.txid} confirmed!`);
 *     },
 *     onFailed: (tx, error) => {
 *       console.error(`Transaction ${tx.txid} failed: ${error.message}`);
 *     }
 *   }
 * });
 *
 * tracker.track('abc123...', { type: 'mining_reward' });
 * tracker.start();
 * ```
 */
export class TxTracker {
  private options: Required<
    Omit<TxTrackerOptions, "fetchTransaction" | "events" | "retryOptions">
  >;
  private fetchTransaction?: (txid: string) => Promise<TxApiResponse>;
  private events: TxTrackerEvents;
  private retryOptions: RetryOptions;
  private transactions: Map<string, TrackedTransaction> = new Map();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;
  private currentBlockHeight = 0;
  private logger: Logger;

  constructor(options: TxTrackerOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.fetchTransaction = options.fetchTransaction;
    this.events = options.events ?? {};
    this.retryOptions = options.retryOptions ?? { maxRetries: 2 };
    this.logger = createLogger({ context: "TxTracker" });
  }

  /**
   * Start tracking transactions
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.logger.info("Transaction tracker started");

    // Initial check
    this.checkAll();

    // Set up polling
    this.intervalId = setInterval(
      () => this.checkAll(),
      this.options.pollInterval,
    );
  }

  /**
   * Stop tracking
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.logger.info("Transaction tracker stopped");
  }

  /**
   * Add a transaction to track
   */
  track(txid: string, metadata?: Record<string, unknown>): TrackedTransaction {
    const existing = this.transactions.get(txid);
    if (existing) {
      return existing;
    }

    const tx: TrackedTransaction = {
      txid,
      status: "pending",
      confirmations: 0,
      submittedAt: Date.now(),
      metadata,
    };

    this.transactions.set(txid, tx);
    this.logger.info("Tracking transaction", {
      txid: tx.txid.substring(0, 16),
    });

    // Immediately check this transaction
    this.checkTransaction(txid);

    return tx;
  }

  /**
   * Stop tracking a specific transaction
   */
  untrack(txid: string): void {
    this.transactions.delete(txid);
  }

  /**
   * Get a tracked transaction
   */
  get(txid: string): TrackedTransaction | undefined {
    return this.transactions.get(txid);
  }

  /**
   * Get all tracked transactions
   */
  getAll(): TrackedTransaction[] {
    return Array.from(this.transactions.values());
  }

  /**
   * Get transactions by status
   */
  getByStatus(status: TxStatus): TrackedTransaction[] {
    return this.getAll().filter((tx) => tx.status === status);
  }

  /**
   * Get pending count (not yet confirmed)
   */
  getPendingCount(): number {
    return this.getAll().filter(
      (tx) =>
        tx.status === "pending" ||
        tx.status === "mempool" ||
        tx.status === "confirming",
    ).length;
  }

  /**
   * Check all tracked transactions
   */
  async checkAll(): Promise<void> {
    // Update current block height
    await this.updateBlockHeight();

    // Clean up old transactions
    this.cleanup();

    // Check each pending transaction
    const pendingTxs = this.getAll().filter(
      (tx) =>
        tx.status !== "confirmed" &&
        tx.status !== "failed" &&
        tx.status !== "replaced",
    );

    await Promise.all(pendingTxs.map((tx) => this.checkTransaction(tx.txid)));
  }

  /**
   * Check a specific transaction
   */
  async checkTransaction(txid: string): Promise<void> {
    const tx = this.transactions.get(txid);
    if (!tx) return;

    try {
      const response = await this.fetchTxStatus(txid);

      const oldStatus = tx.status;
      const oldConfirmations = tx.confirmations;

      if (response.status.confirmed) {
        tx.blockHeight = response.status.block_height;
        tx.blockHash = response.status.block_hash;

        // Calculate confirmations
        if (tx.blockHeight && this.currentBlockHeight > 0) {
          tx.confirmations = this.currentBlockHeight - tx.blockHeight + 1;
        }

        // Determine status based on confirmations
        if (tx.confirmations >= this.options.targetConfirmations) {
          tx.status = "confirmed";
          if (!tx.confirmedAt) {
            tx.confirmedAt = Date.now();
          }
        } else if (tx.confirmations > 0) {
          tx.status = "confirming";
        }
      } else {
        // In mempool but not confirmed
        if (tx.status === "pending") {
          tx.status = "mempool";
        }
      }

      // Notify changes
      if (oldStatus !== tx.status) {
        this.events.onStatusChange?.(tx);

        if (tx.status === "confirmed") {
          this.logger.info("Transaction confirmed", {
            txid: tx.txid.substring(0, 16),
            confirmations: tx.confirmations,
          });
          this.events.onConfirmed?.(tx);
        }
      }

      if (oldConfirmations !== tx.confirmations) {
        this.events.onConfirmationUpdate?.(tx);
      }
    } catch (error) {
      // Check if it's a 404 (transaction not found)
      const isNotFound =
        error instanceof TransactionError &&
        error.code === ErrorCode.TX_NOT_FOUND;

      // If transaction is very old and still not found, mark as failed
      const age = Date.now() - tx.submittedAt;
      if (isNotFound && age > 10 * 60 * 1000) {
        // 10 minutes
        tx.status = "failed";
        tx.failedAt = Date.now();
        tx.error = "Transaction not found in mempool";

        this.logger.warn("Transaction failed", {
          txid: tx.txid.substring(0, 16),
          error: tx.error,
        });

        this.events.onFailed?.(tx, error as AppError);
      }
    }
  }

  /**
   * Fetch transaction status from API
   */
  private async fetchTxStatus(txid: string): Promise<TxApiResponse> {
    if (this.fetchTransaction) {
      return this.fetchTransaction(txid);
    }

    const result = await retry(async () => {
      const url = `${this.options.apiEndpoint}/tx/${txid}`;
      const response = await fetch(url);

      if (response.status === 404) {
        throw new TransactionError(
          ErrorCode.TX_NOT_FOUND,
          `Transaction ${txid} not found`,
        );
      }

      if (!response.ok) {
        throw new TransactionError(
          ErrorCode.API_ERROR,
          `API error: ${response.status}`,
        );
      }

      return response.json() as Promise<TxApiResponse>;
    }, this.retryOptions);

    if (!result.success || !result.data) {
      throw (
        result.error ??
        new TransactionError(
          ErrorCode.TX_NOT_FOUND,
          "Failed to fetch transaction",
        )
      );
    }

    return result.data;
  }

  /**
   * Update current block height
   */
  private async updateBlockHeight(): Promise<void> {
    try {
      const result = await retry(async () => {
        const url = `${this.options.apiEndpoint}/blocks/tip/height`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to get block height: ${response.status}`);
        }

        const text = await response.text();
        return parseInt(text, 10);
      }, this.retryOptions);

      if (result.success && result.data) {
        this.currentBlockHeight = result.data;
      }
    } catch (error) {
      this.logger.warn("Failed to update block height", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Clean up old transactions
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = this.options.maxAge;

    for (const [txid, tx] of this.transactions) {
      const age = now - tx.submittedAt;

      // Remove very old confirmed transactions
      if (tx.status === "confirmed" && age > maxAge) {
        this.transactions.delete(txid);
      }

      // Remove old failed transactions
      if (tx.status === "failed" && age > maxAge / 4) {
        this.transactions.delete(txid);
      }
    }
  }

  /**
   * Force refresh all transactions
   */
  async refresh(): Promise<void> {
    await this.checkAll();
  }

  /**
   * Get tracker stats
   */
  getStats(): {
    total: number;
    pending: number;
    mempool: number;
    confirming: number;
    confirmed: number;
    failed: number;
    currentBlockHeight: number;
  } {
    const all = this.getAll();

    return {
      total: all.length,
      pending: all.filter((tx) => tx.status === "pending").length,
      mempool: all.filter((tx) => tx.status === "mempool").length,
      confirming: all.filter((tx) => tx.status === "confirming").length,
      confirmed: all.filter((tx) => tx.status === "confirmed").length,
      failed: all.filter((tx) => tx.status === "failed").length,
      currentBlockHeight: this.currentBlockHeight,
    };
  }
}

// =============================================================================
// FACTORY
// =============================================================================

/**
 * Create a transaction tracker instance
 */
export function createTxTracker(options?: TxTrackerOptions): TxTracker {
  return new TxTracker(options);
}
