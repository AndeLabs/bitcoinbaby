import { create } from 'zustand';
import type { Baby, BabyState } from '../types';

interface BabyStore {
  baby: Baby | null;
  setBaby: (baby: Baby) => void;
  updateState: (state: BabyState) => void;
  addExperience: (xp: number) => void;
  levelUp: () => void;
  feed: () => void;
}

export const useBabyStore = create<BabyStore>((set) => ({
  baby: null,

  setBaby: (baby) => set({ baby }),

  updateState: (state) =>
    set((s) => (s.baby ? { baby: { ...s.baby, state } } : s)),

  addExperience: (xp) =>
    set((s) => {
      if (!s.baby) return s;
      const newXp = s.baby.experience + xp;
      const xpToLevel = s.baby.level * 100;

      if (newXp >= xpToLevel) {
        return {
          baby: {
            ...s.baby,
            experience: newXp - xpToLevel,
            level: s.baby.level + 1,
            state: 'evolving' as BabyState,
          },
        };
      }

      return { baby: { ...s.baby, experience: newXp } };
    }),

  levelUp: () =>
    set((s) =>
      s.baby
        ? { baby: { ...s.baby, level: s.baby.level + 1, state: 'evolving' } }
        : s
    ),

  feed: () =>
    set((s) =>
      s.baby
        ? { baby: { ...s.baby, lastFed: new Date(), state: 'happy' } }
        : s
    ),
}));
