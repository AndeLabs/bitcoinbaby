import { create } from 'zustand';
import type { WalletInfo } from '../types';

interface WalletStore {
  wallet: WalletInfo | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setWallet: (wallet: WalletInfo) => void;
  disconnect: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateBalance: (balance: bigint) => void;
  updateBabyTokens: (tokens: bigint) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  wallet: null,
  isConnected: false,
  isLoading: false,
  error: null,

  setWallet: (wallet) =>
    set({
      wallet,
      isConnected: true,
      isLoading: false,
      error: null,
    }),

  disconnect: () =>
    set({
      wallet: null,
      isConnected: false,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  updateBalance: (balance) =>
    set((s) =>
      s.wallet ? { wallet: { ...s.wallet, balance } } : s
    ),

  updateBabyTokens: (babyTokens) =>
    set((s) =>
      s.wallet ? { wallet: { ...s.wallet, babyTokens } } : s
    ),
}));
