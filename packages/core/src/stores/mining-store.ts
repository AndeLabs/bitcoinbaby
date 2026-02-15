import { create } from 'zustand';
import type { MiningStats } from '../types';

interface MiningStore {
  stats: MiningStats;
  isInitialized: boolean;

  // Actions
  startMining: () => void;
  stopMining: () => void;
  updateStats: (stats: Partial<MiningStats>) => void;
  addHashes: (count: number) => void;
  addTokens: (amount: number) => void;
  reset: () => void;
}

const initialStats: MiningStats = {
  hashrate: 0,
  totalHashes: 0,
  tokensEarned: 0,
  difficulty: 1,
  uptime: 0,
  isActive: false,
  minerType: 'cpu',
};

export const useMiningStore = create<MiningStore>((set) => ({
  stats: initialStats,
  isInitialized: false,

  startMining: () =>
    set((s) => ({
      stats: { ...s.stats, isActive: true },
      isInitialized: true,
    })),

  stopMining: () =>
    set((s) => ({
      stats: { ...s.stats, isActive: false, hashrate: 0 },
    })),

  updateStats: (newStats) =>
    set((s) => ({
      stats: { ...s.stats, ...newStats },
    })),

  addHashes: (count) =>
    set((s) => ({
      stats: { ...s.stats, totalHashes: s.stats.totalHashes + count },
    })),

  addTokens: (amount) =>
    set((s) => ({
      stats: { ...s.stats, tokensEarned: s.stats.tokensEarned + amount },
    })),

  reset: () =>
    set({
      stats: initialStats,
      isInitialized: false,
    }),
}));
