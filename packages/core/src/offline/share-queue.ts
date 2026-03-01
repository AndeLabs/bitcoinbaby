/**
 * ShareQueue - Offline-First Share Storage
 *
 * Production-ready offline queue for mining shares using IndexedDB.
 * Based on 2025 best practices:
 * - Dexie.js for IndexedDB operations
 * - Persistent storage survives browser restart
 * - Deduplication by hash
 * - Queue ordering by timestamp
 *
 * @see https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/
 * @see https://medium.com/@sohail_saifii/implementing-offline-first-with-indexeddb-and-sync
 */

import Dexie, { type Table } from "dexie";

// =============================================================================
// TYPES
// =============================================================================

export interface QueuedShare {
  /** Unique ID (auto-generated) */
  id?: number;
  /** Mining proof hash (unique constraint) */
  hash: string;
  /** Nonce that solved the puzzle */
  nonce: number;
  /** Difficulty achieved */
  difficulty: number;
  /** Block data for verification */
  blockData: string;
  /** Calculated reward */
  reward: string;
  /** When share was found */
  timestamp: number;
  /** Wallet address */
  address: string;
  /** Sync status */
  status: "pending" | "syncing" | "synced" | "failed";
  /** Number of sync attempts */
  attempts: number;
  /** Last sync attempt timestamp */
  lastAttempt: number | null;
  /** Error message if failed */
  error: string | null;
  /** When to retry next (for backoff) */
  nextRetry: number | null;
}

export interface QueueStats {
  pending: number;
  syncing: number;
  synced: number;
  failed: number;
  total: number;
  oldestPending: number | null;
  totalReward: bigint;
}

export interface QueueError {
  type: "quota_exceeded" | "database_error" | "unknown";
  message: string;
  recoverable: boolean;
}

// =============================================================================
// DATABASE
// =============================================================================

class ShareQueueDB extends Dexie {
  shares!: Table<QueuedShare, number>;

  constructor() {
    super("BitcoinBabyShareQueue");

    // Schema versioning for migrations
    this.version(1).stores({
      // Indexed fields for efficient queries
      shares: "++id, &hash, status, address, timestamp, nextRetry",
    });
  }
}

// Singleton database instance
let db: ShareQueueDB | null = null;

function getDB(): ShareQueueDB {
  if (!db) {
    db = new ShareQueueDB();
  }
  return db;
}

// =============================================================================
// SHARE QUEUE API
// =============================================================================

/**
 * Check if an error is a quota exceeded error
 */
function isQuotaExceededError(error: unknown): boolean {
  if (error instanceof DOMException) {
    // Standard quota exceeded error names
    return (
      error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED" || // Firefox
      error.code === 22 // Legacy code for quota exceeded
    );
  }
  // Dexie wraps errors, check message
  if (error instanceof Error) {
    return (
      error.message.includes("QuotaExceeded") ||
      error.message.includes("quota") ||
      error.message.includes("storage")
    );
  }
  return false;
}

/**
 * Check if an error is a constraint violation (duplicate key)
 * This handles race condition when two concurrent calls try to add same hash
 */
function isConstraintError(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === "ConstraintError";
  }
  // Dexie wraps errors, check message
  if (error instanceof Error) {
    return (
      error.message.includes("ConstraintError") ||
      error.message.includes("uniqueness") ||
      error.message.includes("unique constraint") ||
      error.message.includes("Key already exists")
    );
  }
  return false;
}

/**
 * Attempt to free up space by cleaning old synced shares
 * Returns true if space was freed
 */
async function freeUpSpace(): Promise<boolean> {
  try {
    // First, try cleaning up very old synced shares (older than 1 day)
    const deletedRecent = await cleanupSyncedShares(1);
    if (deletedRecent > 0) {
      console.log(
        `[ShareQueue] Freed space by deleting ${deletedRecent} old synced shares`,
      );
      return true;
    }

    // If that didn't help, clean all synced shares
    const database = getDB();
    const syncedShares = await database.shares
      .where("status")
      .equals("synced")
      .toArray();

    if (syncedShares.length > 0) {
      const ids = syncedShares.map((s) => s.id!);
      await database.shares.bulkDelete(ids);
      console.log(
        `[ShareQueue] Emergency cleanup: deleted ${ids.length} synced shares`,
      );
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Add a share to the queue
 * Automatically deduplicates by hash
 * Handles quota exceeded errors by attempting to free space
 */
export async function queueShare(
  share: Omit<
    QueuedShare,
    "id" | "status" | "attempts" | "lastAttempt" | "error" | "nextRetry"
  >,
): Promise<{
  queued: boolean;
  duplicate: boolean;
  id?: number;
  error?: QueueError;
}> {
  const database = getDB();

  // Check for duplicate (same hash)
  try {
    const existing = await database.shares
      .where("hash")
      .equals(share.hash)
      .first();

    if (existing) {
      return { queued: false, duplicate: true, id: existing.id };
    }
  } catch (error) {
    console.error("[ShareQueue] Error checking duplicate:", error);
    // Continue to try adding anyway
  }

  // Try to add to queue
  const addShare = async (): Promise<number> => {
    return database.shares.add({
      ...share,
      status: "pending",
      attempts: 0,
      lastAttempt: null,
      error: null,
      nextRetry: null,
    });
  };

  try {
    const id = await addShare();
    return { queued: true, duplicate: false, id };
  } catch (error) {
    // FIX: Handle constraint error (race condition - duplicate was added concurrently)
    // The &hash unique constraint catches this even if the initial check passed
    if (isConstraintError(error)) {
      // Another concurrent call added the same hash - this is a duplicate
      const existing = await database.shares
        .where("hash")
        .equals(share.hash)
        .first();
      return { queued: false, duplicate: true, id: existing?.id };
    }

    // Handle quota exceeded error
    if (isQuotaExceededError(error)) {
      console.warn("[ShareQueue] Quota exceeded, attempting to free space...");

      // Try to free up space
      const freedSpace = await freeUpSpace();
      if (freedSpace) {
        // Retry adding the share
        try {
          const id = await addShare();
          console.log(
            "[ShareQueue] Successfully queued share after freeing space",
          );
          return { queued: true, duplicate: false, id };
        } catch (retryError) {
          // Still failed after freeing space
          console.error(
            "[ShareQueue] Still failed after freeing space:",
            retryError,
          );
          return {
            queued: false,
            duplicate: false,
            error: {
              type: "quota_exceeded",
              message:
                "Storage quota exceeded. Please sync pending shares or clear browser data.",
              recoverable: false,
            },
          };
        }
      }

      // Couldn't free space
      return {
        queued: false,
        duplicate: false,
        error: {
          type: "quota_exceeded",
          message: "Storage quota exceeded. Please sync pending shares.",
          recoverable: true, // User can trigger sync
        },
      };
    }

    // Other database errors
    console.error("[ShareQueue] Database error:", error);
    return {
      queued: false,
      duplicate: false,
      error: {
        type: "database_error",
        message:
          error instanceof Error ? error.message : "Unknown database error",
        recoverable: false,
      },
    };
  }
}

/**
 * Get all pending shares ready for sync
 * Returns shares that are pending and past their retry time
 */
export async function getPendingShares(
  address?: string,
  limit: number = 50,
): Promise<QueuedShare[]> {
  const database = getDB();
  const now = Date.now();

  let query = database.shares
    .where("status")
    .equals("pending")
    .filter((share) => !share.nextRetry || share.nextRetry <= now);

  if (address) {
    query = database.shares
      .where(["status", "address"])
      .equals(["pending", address])
      .filter((share) => !share.nextRetry || share.nextRetry <= now);
  }

  return query.limit(limit).sortBy("timestamp");
}

/**
 * Mark share as syncing (in progress)
 */
export async function markSyncing(id: number): Promise<void> {
  const database = getDB();
  await database.shares.update(id, {
    status: "syncing",
    lastAttempt: Date.now(),
  });
}

/**
 * Mark share as successfully synced
 */
export async function markSynced(id: number): Promise<void> {
  const database = getDB();
  await database.shares.update(id, {
    status: "synced",
    error: null,
  });
}

/**
 * Mark share as failed with exponential backoff
 * Backoff delays: 1s, 5s, 15s, 60s, 5min, 15min, 1hr
 */
export async function markFailed(
  id: number,
  error: string,
  currentAttempts: number,
): Promise<void> {
  const database = getDB();
  const backoffDelays = [1000, 5000, 15000, 60000, 300000, 900000, 3600000];
  const delayIndex = Math.min(currentAttempts, backoffDelays.length - 1);
  const delay = backoffDelays[delayIndex];

  await database.shares.update(id, {
    status: "pending", // Back to pending for retry
    attempts: currentAttempts + 1,
    error,
    nextRetry: Date.now() + delay,
  });
}

/**
 * Mark share as permanently failed (too many attempts)
 */
export async function markPermanentlyFailed(
  id: number,
  error: string,
): Promise<void> {
  const database = getDB();
  await database.shares.update(id, {
    status: "failed",
    error,
  });
}

/**
 * Get queue statistics
 */
export async function getQueueStats(address?: string): Promise<QueueStats> {
  const database = getDB();

  let shares: QueuedShare[];
  if (address) {
    shares = await database.shares.where("address").equals(address).toArray();
  } else {
    shares = await database.shares.toArray();
  }

  const stats: QueueStats = {
    pending: 0,
    syncing: 0,
    synced: 0,
    failed: 0,
    total: shares.length,
    oldestPending: null,
    totalReward: 0n,
  };

  for (const share of shares) {
    stats[share.status]++;

    if (share.status === "pending" || share.status === "syncing") {
      stats.totalReward += BigInt(share.reward);
      if (!stats.oldestPending || share.timestamp < stats.oldestPending) {
        stats.oldestPending = share.timestamp;
      }
    }
  }

  return stats;
}

/**
 * Clean up old synced shares (keep last N days)
 */
export async function cleanupSyncedShares(
  daysToKeep: number = 7,
): Promise<number> {
  const database = getDB();
  const cutoff = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

  const toDelete = await database.shares
    .where("status")
    .equals("synced")
    .filter((share) => share.timestamp < cutoff)
    .toArray();

  const ids = toDelete.map((s) => s.id!);
  await database.shares.bulkDelete(ids);

  return ids.length;
}

/**
 * Get total pending reward (for UI display)
 */
export async function getPendingReward(address: string): Promise<bigint> {
  const database = getDB();
  const pending = await database.shares
    .where(["status", "address"])
    .anyOf([
      ["pending", address],
      ["syncing", address],
    ])
    .toArray();

  return pending.reduce((sum, share) => sum + BigInt(share.reward), 0n);
}

/**
 * Check if a hash already exists in queue
 */
export async function isHashQueued(hash: string): Promise<boolean> {
  const database = getDB();
  const existing = await database.shares.where("hash").equals(hash).first();
  return !!existing;
}

/**
 * Clear all data (for testing/reset)
 */
export async function clearQueue(): Promise<void> {
  const database = getDB();
  await database.shares.clear();
}

/**
 * Export queue for debugging
 */
export async function exportQueue(): Promise<QueuedShare[]> {
  const database = getDB();
  return database.shares.toArray();
}
