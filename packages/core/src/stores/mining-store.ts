import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MiningSession } from "../types";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Cumulative stats that persist across sessions
 */
interface PersistedMiningStats {
  lifetimeHashes: number;
  lifetimeTokens: number;
  lifetimeUptime: number; // Total seconds mined
  lastSessionAt: number; // Timestamp
}

interface MiningStore {
  stats: MiningSession;
  isInitialized: boolean;

  // Persisted lifetime stats
  persistedStats: PersistedMiningStats;

  // NFT Boost
  nftBoost: number; // Percentage boost from NFTs (0-200)
  effectiveHashrate: number; // hashrate * boosts

  // Cosmic Energy Integration
  cosmicMultiplier: number; // From cosmic energy (0.5 - 2.0)
  cosmicStatus: "thriving" | "normal" | "struggling" | "critical";
  activeCosmicEffects: string[];

  // Actions
  startMining: () => void;
  stopMining: () => void;
  updateStats: (stats: Partial<MiningSession>) => void;
  addHashes: (count: number) => void;
  addTokens: (amount: number) => void;
  setNFTBoost: (boost: number) => void;
  setCosmicEnergy: (
    multiplier: number,
    status: MiningStore["cosmicStatus"],
    effects: string[],
  ) => void;
  saveLifetimeStats: () => void;
  reset: () => void;
}

const initialStats: MiningSession = {
  hashrate: 0,
  totalHashes: 0,
  tokensEarned: 0,
  difficulty: 1,
  uptime: 0,
  isActive: false,
  minerType: "cpu",
};

const initialPersistedStats: PersistedMiningStats = {
  lifetimeHashes: 0,
  lifetimeTokens: 0,
  lifetimeUptime: 0,
  lastSessionAt: 0,
};

/**
 * Calculate effective hashrate with all boosts
 */
function calculateEffectiveHashrate(
  baseHashrate: number,
  nftBoost: number,
  cosmicMultiplier: number,
): number {
  // NFT boost is percentage (0-200), cosmic is multiplier (0.5-2.0)
  return baseHashrate * (1 + nftBoost / 100) * cosmicMultiplier;
}

export const useMiningStore = create<MiningStore>()(
  persist(
    (set, get) => ({
      stats: initialStats,
      isInitialized: false,
      persistedStats: initialPersistedStats,
      nftBoost: 0,
      effectiveHashrate: 0,
      cosmicMultiplier: 1.0,
      cosmicStatus: "normal",
      activeCosmicEffects: [],

      startMining: () =>
        set((s) => ({
          stats: { ...s.stats, isActive: true },
          isInitialized: true,
        })),

      stopMining: () =>
        set((s) => {
          // Save lifetime stats before stopping
          const newLifetime = {
            lifetimeHashes:
              s.persistedStats.lifetimeHashes + s.stats.totalHashes,
            lifetimeTokens:
              s.persistedStats.lifetimeTokens + s.stats.tokensEarned,
            lifetimeUptime: s.persistedStats.lifetimeUptime + s.stats.uptime,
            lastSessionAt: Date.now(),
          };

          return {
            stats: { ...s.stats, isActive: false, hashrate: 0 },
            effectiveHashrate: 0,
            persistedStats: newLifetime,
          };
        }),

      updateStats: (newStats) =>
        set((s) => {
          const updatedStats = { ...s.stats, ...newStats };
          const effectiveHashrate = calculateEffectiveHashrate(
            updatedStats.hashrate,
            s.nftBoost,
            s.cosmicMultiplier,
          );

          return {
            stats: updatedStats,
            effectiveHashrate,
          };
        }),

      addHashes: (count) =>
        set((s) => ({
          stats: { ...s.stats, totalHashes: s.stats.totalHashes + count },
        })),

      addTokens: (amount) =>
        set((s) => ({
          stats: { ...s.stats, tokensEarned: s.stats.tokensEarned + amount },
        })),

      setNFTBoost: (boost) =>
        set((s) => ({
          nftBoost: boost,
          effectiveHashrate: calculateEffectiveHashrate(
            s.stats.hashrate,
            boost,
            s.cosmicMultiplier,
          ),
        })),

      setCosmicEnergy: (multiplier, status, effects) =>
        set((s) => ({
          cosmicMultiplier: multiplier,
          cosmicStatus: status,
          activeCosmicEffects: effects,
          effectiveHashrate: calculateEffectiveHashrate(
            s.stats.hashrate,
            s.nftBoost,
            multiplier,
          ),
        })),

      saveLifetimeStats: () =>
        set((s) => ({
          persistedStats: {
            lifetimeHashes:
              s.persistedStats.lifetimeHashes + s.stats.totalHashes,
            lifetimeTokens:
              s.persistedStats.lifetimeTokens + s.stats.tokensEarned,
            lifetimeUptime: s.persistedStats.lifetimeUptime + s.stats.uptime,
            lastSessionAt: Date.now(),
          },
        })),

      reset: () =>
        set({
          stats: initialStats,
          isInitialized: false,
          nftBoost: 0,
          effectiveHashrate: 0,
          cosmicMultiplier: 1.0,
          cosmicStatus: "normal",
          activeCosmicEffects: [],
          // Note: persistedStats are NOT reset - they're lifetime stats
        }),
    }),
    {
      name: "bitcoinbaby-mining-store",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Only persist lifetime stats, not session stats
      partialize: (state) => ({
        persistedStats: state.persistedStats,
      }),
    },
  ),
);
