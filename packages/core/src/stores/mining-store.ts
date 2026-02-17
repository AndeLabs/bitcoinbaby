import { create } from "zustand";
import type { MiningSession } from "../types";

interface MiningStore {
  stats: MiningSession;
  isInitialized: boolean;

  // NFT Boost
  nftBoost: number; // Percentage boost from NFTs (0-200)
  effectiveHashrate: number; // hashrate * (1 + boost/100)

  // Actions
  startMining: () => void;
  stopMining: () => void;
  updateStats: (stats: Partial<MiningSession>) => void;
  addHashes: (count: number) => void;
  addTokens: (amount: number) => void;
  setNFTBoost: (boost: number) => void;
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

export const useMiningStore = create<MiningStore>((set) => ({
  stats: initialStats,
  isInitialized: false,
  nftBoost: 0,
  effectiveHashrate: 0,

  startMining: () =>
    set((s) => ({
      stats: { ...s.stats, isActive: true },
      isInitialized: true,
    })),

  stopMining: () =>
    set((s) => ({
      stats: { ...s.stats, isActive: false, hashrate: 0 },
      effectiveHashrate: 0,
    })),

  updateStats: (newStats) =>
    set((s) => {
      const updatedStats = { ...s.stats, ...newStats };
      const effectiveHashrate = updatedStats.hashrate * (1 + s.nftBoost / 100);

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
      effectiveHashrate: s.stats.hashrate * (1 + boost / 100),
    })),

  reset: () =>
    set({
      stats: initialStats,
      isInitialized: false,
      nftBoost: 0,
      effectiveHashrate: 0,
    }),
}));
