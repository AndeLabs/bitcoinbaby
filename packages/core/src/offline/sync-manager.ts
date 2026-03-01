/**
 * SyncManager - Background Sync for Mining Shares
 *
 * Production-ready sync manager with:
 * - Online/offline detection
 * - Exponential backoff retries
 * - Batch processing
 * - Health checks
 * - Event-driven architecture
 *
 * @see https://developer.chrome.com/docs/workbox/modules/workbox-background-sync
 */

import {
  queueShare,
  getPendingShares,
  markSyncing,
  markSynced,
  markFailed,
  markPermanentlyFailed,
  getQueueStats,
  cleanupSyncedShares,
  type QueuedShare,
  type QueueStats,
} from "./share-queue";
import { getApiClient } from "../api/client";
import { MIN_DIFFICULTY } from "../tokenomics/constants";

// =============================================================================
// TYPES
// =============================================================================

export interface SyncManagerConfig {
  /** Sync interval in ms (default: 5000) */
  syncInterval: number;
  /** Health check interval in ms (default: 30000) */
  healthCheckInterval: number;
  /** Max concurrent syncs (default: 3) */
  maxConcurrent: number;
  /** Max retry attempts before permanent failure (default: 10) */
  maxRetries: number;
  /** Batch size for sync (default: 10) */
  batchSize: number;
}

export interface SyncEvent {
  type:
    | "sync_start"
    | "sync_complete"
    | "sync_error"
    | "online"
    | "offline"
    | "health_ok"
    | "health_fail";
  timestamp: number;
  data?: {
    synced?: number;
    failed?: number;
    pending?: number;
    error?: string;
    reward?: string;
  };
}

export type SyncEventHandler = (event: SyncEvent) => void;

// =============================================================================
// SYNC MANAGER
// =============================================================================

const DEFAULT_CONFIG: SyncManagerConfig = {
  syncInterval: 5000,
  healthCheckInterval: 30000,
  maxConcurrent: 3,
  maxRetries: 10,
  batchSize: 10,
};

class SyncManager {
  private config: SyncManagerConfig;
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private healthTimer: ReturnType<typeof setInterval> | null = null;
  private eventHandlers: Set<SyncEventHandler> = new Set();
  private address: string | null = null;
  private apiHealthy: boolean = true;
  // Circuit breaker for rate limiting (503 errors)
  private circuitBreakerUntil: number = 0;
  private consecutiveFailures: number = 0;

  constructor(config: Partial<SyncManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Setup online/offline detection
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine;

      window.addEventListener("online", () => {
        this.isOnline = true;
        this.emit({ type: "online", timestamp: Date.now() });
        this.triggerSync();
      });

      window.addEventListener("offline", () => {
        this.isOnline = false;
        this.emit({ type: "offline", timestamp: Date.now() });
      });
    }
  }

  /**
   * Start the sync manager
   */
  start(address: string): void {
    this.address = address;

    // Start sync loop
    if (!this.syncTimer) {
      this.syncTimer = setInterval(() => {
        this.triggerSync();
      }, this.config.syncInterval);

      // Initial sync
      this.triggerSync();
    }

    // Start health check loop
    if (!this.healthTimer) {
      this.healthTimer = setInterval(() => {
        this.checkHealth();
      }, this.config.healthCheckInterval);

      // Initial health check
      this.checkHealth();
    }

    // Schedule cleanup of old synced shares
    this.scheduleCleanup();
  }

  /**
   * Stop the sync manager
   */
  stop(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }
  }

  /**
   * Add a share to queue (called when mining finds a share)
   */
  async addShare(share: {
    hash: string;
    nonce: number;
    difficulty: number;
    blockData: string;
    reward: bigint;
    timestamp: number;
  }): Promise<{ queued: boolean; duplicate: boolean }> {
    if (!this.address) {
      return { queued: false, duplicate: false };
    }

    // Reject shares below minimum difficulty (server will reject anyway)
    if (share.difficulty < MIN_DIFFICULTY) {
      console.warn(
        `[SyncManager] Share rejected: D${share.difficulty} < MIN_DIFFICULTY (${MIN_DIFFICULTY})`,
      );
      return { queued: false, duplicate: false };
    }

    const result = await queueShare({
      ...share,
      reward: share.reward.toString(),
      address: this.address,
    });

    // Trigger immediate sync if online
    if (result.queued && this.isOnline && this.apiHealthy) {
      this.triggerSync();
    }

    return result;
  }

  /**
   * Get current queue stats
   */
  async getStats(): Promise<QueueStats> {
    return getQueueStats(this.address || undefined);
  }

  /**
   * Subscribe to sync events
   */
  subscribe(handler: SyncEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => this.eventHandlers.delete(handler);
  }

  /**
   * Check if API is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const client = getApiClient();
      // Use the same API URL as the client for health check
      const baseUrl =
        typeof window !== "undefined" &&
        window.location.hostname !== "localhost"
          ? "https://bitcoinbaby-api.andeanlabs-58f.workers.dev"
          : "http://localhost:8787";
      const response = await fetch(`${baseUrl}/health`, { method: "GET" });

      const wasHealthy = this.apiHealthy;
      this.apiHealthy = response.ok;

      if (!wasHealthy && this.apiHealthy) {
        this.emit({ type: "health_ok", timestamp: Date.now() });
        this.triggerSync(); // Sync immediately when API becomes healthy
      } else if (wasHealthy && !this.apiHealthy) {
        this.emit({
          type: "health_fail",
          timestamp: Date.now(),
          data: { error: "API unavailable" },
        });
      }

      return this.apiHealthy;
    } catch {
      this.apiHealthy = false;
      this.emit({
        type: "health_fail",
        timestamp: Date.now(),
        data: { error: "Health check failed" },
      });
      return false;
    }
  }

  /**
   * Trigger a sync cycle
   */
  private async triggerSync(): Promise<void> {
    // Skip if already syncing, offline, or API unhealthy
    if (this.isSyncing || !this.isOnline || !this.apiHealthy || !this.address) {
      return;
    }

    // Check circuit breaker (rate limit protection)
    if (Date.now() < this.circuitBreakerUntil) {
      return;
    }

    this.isSyncing = true;

    try {
      const pending = await getPendingShares(
        this.address,
        this.config.batchSize,
      );

      if (pending.length === 0) {
        this.isSyncing = false;
        return;
      }

      this.emit({
        type: "sync_start",
        timestamp: Date.now(),
        data: { pending: pending.length },
      });

      let synced = 0;
      let failed = 0;
      let totalReward = 0n;

      // Process in batches with concurrency limit
      const results = await this.processBatch(pending);

      for (const result of results) {
        if (result.success) {
          synced++;
          totalReward += BigInt(result.reward);
        } else {
          failed++;
        }
      }

      // Reset circuit breaker on successful syncs
      if (synced > 0) {
        this.consecutiveFailures = 0;
        this.circuitBreakerUntil = 0;
      }

      this.emit({
        type: "sync_complete",
        timestamp: Date.now(),
        data: {
          synced,
          failed,
          pending: pending.length - synced,
          reward: totalReward.toString(),
        },
      });
    } catch (error) {
      this.emit({
        type: "sync_error",
        timestamp: Date.now(),
        data: { error: error instanceof Error ? error.message : "Sync failed" },
      });
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process a batch of shares with concurrency limit
   */
  private async processBatch(
    shares: QueuedShare[],
  ): Promise<Array<{ success: boolean; reward: string }>> {
    const results: Array<{ success: boolean; reward: string }> = [];
    const client = getApiClient();

    // Process with concurrency limit
    for (let i = 0; i < shares.length; i += this.config.maxConcurrent) {
      const batch = shares.slice(i, i + this.config.maxConcurrent);
      const batchResults = await Promise.all(
        batch.map((share) => this.syncShare(share, client)),
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Sync a single share to the API
   */
  private async syncShare(
    share: QueuedShare,
    client: ReturnType<typeof getApiClient>,
  ): Promise<{ success: boolean; reward: string }> {
    try {
      // Mark as syncing
      await markSyncing(share.id!);

      // Send to API
      const response = await client.creditMining(share.address, {
        hash: share.hash,
        nonce: share.nonce,
        difficulty: share.difficulty,
        blockData: share.blockData,
        reward: share.reward,
      });

      if (response.success) {
        await markSynced(share.id!);

        // Update leaderboard (non-blocking - fire and forget)
        // This should not fail the mining flow if leaderboard update fails
        this.updateLeaderboardNonBlocking(
          share.address,
          share.difficulty,
          share.reward,
        );

        return { success: true, reward: share.reward };
      } else {
        // Check if it's a duplicate (already synced)
        if (response.error?.includes("already")) {
          await markSynced(share.id!);
          return { success: true, reward: share.reward };
        }

        // Check for rate limiting (trigger circuit breaker)
        // Note: Case-insensitive check for "rate limit" variations
        const errorLower = response.error?.toLowerCase() ?? "";
        if (
          response.error?.includes("503") ||
          errorLower.includes("rate limit") ||
          response.error?.includes("free tier") ||
          response.error?.includes("Exceeded")
        ) {
          this.consecutiveFailures++;
          const breakerDelays = [60000, 300000, 900000, 1800000, 3600000];
          const delayIndex = Math.min(
            this.consecutiveFailures - 1,
            breakerDelays.length - 1,
          );
          this.circuitBreakerUntil = Date.now() + breakerDelays[delayIndex];
          console.log(
            `[SyncManager] Circuit breaker activated for ${breakerDelays[delayIndex] / 1000}s`,
          );
          await markFailed(share.id!, "API rate limited - will retry later", 0);
          return { success: false, reward: "0" };
        }

        // Check if max retries exceeded
        if (share.attempts >= this.config.maxRetries) {
          await markPermanentlyFailed(
            share.id!,
            response.error || "Max retries exceeded",
          );
        } else {
          await markFailed(
            share.id!,
            response.error || "Unknown error",
            share.attempts,
          );
        }

        return { success: false, reward: "0" };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Network error";

      // Check for rate limiting (trigger circuit breaker)
      // Note: Case-insensitive check for "rate limit" variations
      const errorMsgLower = errorMsg.toLowerCase();
      if (
        errorMsg.includes("503") ||
        errorMsgLower.includes("rate limit") ||
        errorMsg.includes("free tier") ||
        errorMsg.includes("Exceeded")
      ) {
        this.consecutiveFailures++;
        // Exponential circuit breaker: 1min, 5min, 15min, 30min, 1hr
        const breakerDelays = [60000, 300000, 900000, 1800000, 3600000];
        const delayIndex = Math.min(
          this.consecutiveFailures - 1,
          breakerDelays.length - 1,
        );
        this.circuitBreakerUntil = Date.now() + breakerDelays[delayIndex];
        console.log(
          `[SyncManager] Circuit breaker activated for ${breakerDelays[delayIndex] / 1000}s`,
        );
        // Don't increment share attempts for rate limiting
        await markFailed(share.id!, "API rate limited - will retry later", 0);
        return { success: false, reward: "0" };
      }

      // Check for permanent failures (validation errors won't be fixed by retry)
      if (
        errorMsg.includes("Invalid proof") ||
        errorMsg.includes("Hash mismatch")
      ) {
        await markPermanentlyFailed(share.id!, errorMsg);
      } else if (share.attempts >= this.config.maxRetries) {
        await markPermanentlyFailed(share.id!, errorMsg);
      } else {
        await markFailed(share.id!, errorMsg, share.attempts);
      }

      return { success: false, reward: "0" };
    }
  }

  /**
   * Schedule cleanup of old synced shares
   */
  private scheduleCleanup(): void {
    // Run cleanup once per hour
    setInterval(
      async () => {
        try {
          const deleted = await cleanupSyncedShares(7); // Keep 7 days
          if (deleted > 0) {
            console.log(
              `[SyncManager] Cleaned up ${deleted} old synced shares`,
            );
          }
        } catch (error) {
          console.error("[SyncManager] Cleanup error:", error);
        }
      },
      60 * 60 * 1000,
    );
  }

  /**
   * Emit event to all subscribers
   */
  private emit(event: SyncEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("[SyncManager] Event handler error:", error);
      }
    }
  }

  /**
   * Get current state
   */
  getState(): {
    isOnline: boolean;
    isSyncing: boolean;
    apiHealthy: boolean;
    address: string | null;
  } {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      apiHealthy: this.apiHealthy,
      address: this.address,
    };
  }

  /**
   * Force immediate sync
   */
  forceSync(): void {
    this.triggerSync();
  }

  /**
   * Update leaderboard in a non-blocking way
   * This is fire-and-forget - errors are logged but don't affect mining
   *
   * @param address - User's Bitcoin address
   * @param hashesIncrement - Number of hashes to add (difficulty represents hash count)
   * @param tokensEarned - Tokens earned from this share (as string)
   */
  private updateLeaderboardNonBlocking(
    address: string,
    hashesIncrement: number,
    tokensEarned: string,
  ): void {
    // Use the same API URL as the main API client
    const apiUrl =
      typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? "https://bitcoinbaby-api.andeanlabs-58f.workers.dev"
        : "http://localhost:8787";

    // Fire and forget - wrap in try-catch and don't await
    Promise.all([
      // Update miners leaderboard (total hashes)
      fetch(`${apiUrl}/api/leaderboard/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          category: "miners",
          score: hashesIncrement,
        }),
      }).catch((err) => {
        console.warn("[SyncManager] Failed to update miners leaderboard:", err);
      }),

      // Update earners leaderboard (tokens earned)
      fetch(`${apiUrl}/api/leaderboard/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          category: "earners",
          score: Number(tokensEarned),
        }),
      }).catch((err) => {
        console.warn(
          "[SyncManager] Failed to update earners leaderboard:",
          err,
        );
      }),
    ]).catch((err) => {
      // This should never happen since individual promises catch their errors
      console.warn("[SyncManager] Leaderboard update failed:", err);
    });
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

let syncManagerInstance: SyncManager | null = null;

/**
 * Get the sync manager singleton
 */
export function getSyncManager(
  config?: Partial<SyncManagerConfig>,
): SyncManager {
  if (!syncManagerInstance) {
    syncManagerInstance = new SyncManager(config);
  }
  return syncManagerInstance;
}

/**
 * Reset sync manager (for testing)
 */
export function resetSyncManager(): void {
  if (syncManagerInstance) {
    syncManagerInstance.stop();
    syncManagerInstance = null;
  }
}

export type { SyncManager };
