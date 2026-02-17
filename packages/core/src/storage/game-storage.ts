/**
 * Game Storage
 *
 * IndexedDB-based persistence for game state.
 * Falls back to localStorage if IndexedDB is unavailable.
 */

import type { GameState } from '../game/types';
import { DEFAULT_GAME_STATE } from '../game/types';

const DB_NAME = 'bitcoinbaby';
const DB_VERSION = 1;
const STORE_NAME = 'gameState';
const STATE_KEY = 'current';

// localStorage fallback key
const LS_KEY = 'bitcoinbaby_game_state';

/**
 * Check if IndexedDB is available
 */
function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Open IndexedDB connection
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Serialize BigInt values for JSON storage
 */
function serializeState(state: GameState): string {
  return JSON.stringify(state, (_, value) =>
    typeof value === 'bigint' ? { __bigint__: value.toString() } : value
  );
}

/**
 * Deserialize BigInt values from JSON storage
 */
function deserializeState(json: string): GameState {
  return JSON.parse(json, (_, value) => {
    if (value && typeof value === 'object' && '__bigint__' in value) {
      return BigInt(value.__bigint__);
    }
    return value;
  });
}

/**
 * Save game state to IndexedDB
 */
async function saveToIndexedDB(state: GameState): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const serialized = serializeState(state);
    const request = store.put(serialized, STATE_KEY);

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
    request.onsuccess = () => resolve();

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => db.close();
  });
}

/**
 * Load game state from IndexedDB
 */
async function loadFromIndexedDB(): Promise<GameState | null> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(STATE_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(deserializeState(result));
        } else {
          resolve(null);
        }
      };

      transaction.oncomplete = () => db.close();
    });
  } catch {
    return null;
  }
}

/**
 * Save to localStorage (fallback)
 */
function saveToLocalStorage(state: GameState): void {
  try {
    localStorage.setItem(LS_KEY, serializeState(state));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * Load from localStorage (fallback)
 */
function loadFromLocalStorage(): GameState | null {
  try {
    const data = localStorage.getItem(LS_KEY);
    if (data) {
      return deserializeState(data);
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  return null;
}

/**
 * Game Storage API
 */
export const GameStorage = {
  /**
   * Save game state
   */
  async save(state: GameState): Promise<void> {
    const stateToSave: GameState = {
      ...state,
      lastSaved: Date.now(),
    };

    if (isIndexedDBAvailable()) {
      try {
        await saveToIndexedDB(stateToSave);
        return;
      } catch (error) {
        console.warn('IndexedDB save failed, falling back to localStorage:', error);
      }
    }

    saveToLocalStorage(stateToSave);
  },

  /**
   * Load game state
   */
  async load(): Promise<GameState> {
    let state: GameState | null = null;

    if (isIndexedDBAvailable()) {
      try {
        state = await loadFromIndexedDB();
      } catch (error) {
        console.warn('IndexedDB load failed, trying localStorage:', error);
      }
    }

    if (!state) {
      state = loadFromLocalStorage();
    }

    if (!state) {
      return { ...DEFAULT_GAME_STATE };
    }

    // Migrate if needed
    return migrateState(state);
  },

  /**
   * Clear all saved data
   */
  async clear(): Promise<void> {
    if (isIndexedDBAvailable()) {
      try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.delete(STATE_KEY);
        transaction.oncomplete = () => db.close();
      } catch (error) {
        console.warn('IndexedDB clear failed:', error);
      }
    }

    try {
      localStorage.removeItem(LS_KEY);
    } catch (error) {
      console.warn('localStorage clear failed:', error);
    }
  },

  /**
   * Check if saved data exists
   */
  async exists(): Promise<boolean> {
    const state = await this.load();
    return state.baby !== null;
  },
};

/**
 * Migrate old state to current version
 */
function migrateState(state: GameState): GameState {
  // Handle migrations between versions
  if (!state.version) {
    state.version = 1;
  }

  // Ensure all required fields exist
  if (!state.miningStats) {
    state.miningStats = DEFAULT_GAME_STATE.miningStats;
  }

  if (!state.settings) {
    state.settings = DEFAULT_GAME_STATE.settings;
  }

  // Ensure BigInt fields are proper BigInts
  if (typeof state.miningStats.totalTokensEarned !== 'bigint') {
    const tokenValue = state.miningStats.totalTokensEarned as unknown;
    state.miningStats.totalTokensEarned = BigInt(
      tokenValue?.toString?.() || '0'
    );
  }

  return state;
}

export default GameStorage;
