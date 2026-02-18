/**
 * Mining State Persistence
 *
 * Uses IndexedDB to persist mining state across browser sessions.
 * This allows mining to resume from where it left off after:
 * - Closing and reopening the browser
 * - Page refresh
 * - Tab crash
 *
 * Critical for user experience - no lost progress!
 */

// =============================================================================
// TYPES
// =============================================================================

export interface PersistedMiningState {
  /** Last nonce used in mining */
  lastNonce: number;
  /** Total hashes computed across all sessions */
  totalHashes: number;
  /** Total shares found across all sessions */
  totalShares: number;
  /** Current difficulty setting */
  difficulty: number;
  /** Last block data being mined */
  lastBlockData: string;
  /** Timestamp of last save */
  lastSavedAt: number;
  /** Total session uptime in seconds */
  sessionUptime: number;
  /** Accumulated tokens/rewards */
  tokensEarned: number;
}

export interface PersistedSession {
  /** Unique session ID */
  id: string;
  /** Session start timestamp */
  startedAt: number;
  /** Session end timestamp (null if ongoing) */
  endedAt: number | null;
  /** Hashes in this session */
  hashes: number;
  /** Shares in this session */
  shares: number;
  /** Duration in seconds */
  duration: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DB_NAME = "bitcoinbaby-mining";
const DB_VERSION = 1;
const STORE_STATE = "mining-state";
const STORE_SESSIONS = "mining-sessions";
const STATE_KEY = "current";

// =============================================================================
// PERSISTENCE CLASS
// =============================================================================

export class MiningStatePersistence {
  private db: IDBDatabase | null = null;
  private saveInterval: ReturnType<typeof setInterval> | null = null;
  private isOpen = false;

  /**
   * Open the IndexedDB database
   */
  async open(): Promise<void> {
    if (this.isOpen) return;

    return new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        console.warn("[Persistence] IndexedDB not available");
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // State store
        if (!db.objectStoreNames.contains(STORE_STATE)) {
          db.createObjectStore(STORE_STATE);
        }

        // Sessions store
        if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
          const sessionsStore = db.createObjectStore(STORE_SESSIONS, {
            keyPath: "id",
          });
          sessionsStore.createIndex("startedAt", "startedAt", {
            unique: false,
          });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isOpen = true;
        console.log("[Persistence] IndexedDB opened successfully");
        resolve();
      };

      request.onerror = () => {
        console.error("[Persistence] Failed to open IndexedDB:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.stopAutoSave();
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isOpen = false;
    }
  }

  /**
   * Save mining state
   */
  async saveState(state: PersistedMiningState): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction(STORE_STATE, "readwrite");
        const store = tx.objectStore(STORE_STATE);
        const request = store.put(
          { ...state, lastSavedAt: Date.now() },
          STATE_KEY,
        );

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Load mining state
   */
  async loadState(): Promise<PersistedMiningState | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction(STORE_STATE, "readonly");
        const store = tx.objectStore(STORE_STATE);
        const request = store.get(STATE_KEY);

        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Clear saved state
   */
  async clearState(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction(STORE_STATE, "readwrite");
        const store = tx.objectStore(STORE_STATE);
        const request = store.delete(STATE_KEY);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Start auto-saving state at regular intervals
   */
  startAutoSave(
    getState: () => Partial<PersistedMiningState>,
    intervalMs: number = 10_000,
  ): void {
    this.stopAutoSave();

    this.saveInterval = setInterval(async () => {
      try {
        const currentState = getState();
        const savedState = (await this.loadState()) || this.getDefaultState();

        await this.saveState({
          ...savedState,
          ...currentState,
          lastSavedAt: Date.now(),
        });
      } catch (err) {
        console.warn("[Persistence] Auto-save failed:", err);
      }
    }, intervalMs);

    console.log(
      `[Persistence] Auto-save started (every ${intervalMs / 1000}s)`,
    );
  }

  /**
   * Stop auto-saving
   */
  stopAutoSave(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
      console.log("[Persistence] Auto-save stopped");
    }
  }

  /**
   * Save a completed mining session
   */
  async saveSession(session: PersistedSession): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction(STORE_SESSIONS, "readwrite");
        const store = tx.objectStore(STORE_SESSIONS);
        const request = store.add(session);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Get recent mining sessions
   */
  async getRecentSessions(limit: number = 10): Promise<PersistedSession[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction(STORE_SESSIONS, "readonly");
        const store = tx.objectStore(STORE_SESSIONS);
        const index = store.index("startedAt");
        const request = index.openCursor(null, "prev");
        const sessions: PersistedSession[] = [];

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
            .result;
          if (cursor && sessions.length < limit) {
            sessions.push(cursor.value);
            cursor.continue();
          } else {
            resolve(sessions);
          }
        };

        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Get lifetime mining statistics
   */
  async getLifetimeStats(): Promise<{
    totalHashes: number;
    totalShares: number;
    totalDuration: number;
    sessionCount: number;
  }> {
    const sessions = await this.getRecentSessions(1000);
    const state = await this.loadState();

    return {
      totalHashes:
        sessions.reduce((sum, s) => sum + s.hashes, 0) +
        (state?.totalHashes || 0),
      totalShares:
        sessions.reduce((sum, s) => sum + s.shares, 0) +
        (state?.totalShares || 0),
      totalDuration: sessions.reduce((sum, s) => sum + s.duration, 0),
      sessionCount: sessions.length,
    };
  }

  /**
   * Get default state
   */
  private getDefaultState(): PersistedMiningState {
    return {
      lastNonce: 0,
      totalHashes: 0,
      totalShares: 0,
      difficulty: 16,
      lastBlockData: "",
      lastSavedAt: Date.now(),
      sessionUptime: 0,
      tokensEarned: 0,
    };
  }

  /**
   * Check if persistence is available
   */
  isAvailable(): boolean {
    return typeof indexedDB !== "undefined";
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let persistenceInstance: MiningStatePersistence | null = null;

export function getMiningPersistence(): MiningStatePersistence {
  if (!persistenceInstance) {
    persistenceInstance = new MiningStatePersistence();
  }
  return persistenceInstance;
}

export async function initMiningPersistence(): Promise<MiningStatePersistence> {
  const persistence = getMiningPersistence();
  await persistence.open();
  return persistence;
}
