/**
 * Wallet Store
 *
 * Manages wallet state, connection, and transaction signing.
 */

import { create } from "zustand";
import type { WalletInfo } from "../types";

// =============================================================================
// TYPES
// =============================================================================

export type SignPsbtFn = (psbtHex: string) => Promise<string | null>;
export type BroadcastTxFn = (txHex: string) => Promise<string | null>;

interface WalletStore {
  // State
  wallet: WalletInfo | null;
  isConnected: boolean;
  isLoading: boolean;
  isLocked: boolean;
  error: string | null;

  // Signing functions (set by wallet provider)
  signPsbt: SignPsbtFn | null;
  broadcastTx: BroadcastTxFn | null;

  // Actions
  setWallet: (wallet: WalletInfo) => void;
  disconnect: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLocked: (locked: boolean) => void;
  updateBalance: (balance: bigint) => void;
  updateBabyTokens: (tokens: bigint) => void;

  // Signing setup
  setSigningFunctions: (
    signPsbt: SignPsbtFn,
    broadcastTx?: BroadcastTxFn,
  ) => void;
}

// =============================================================================
// STORE
// =============================================================================

export const useWalletStore = create<WalletStore>((set) => ({
  // Initial state
  wallet: null,
  isConnected: false,
  isLoading: false,
  isLocked: true,
  error: null,
  signPsbt: null,
  broadcastTx: null,

  // Set wallet (after successful connection/unlock)
  setWallet: (wallet) =>
    set({
      wallet,
      isConnected: true,
      isLoading: false,
      isLocked: false,
      error: null,
    }),

  // Disconnect/lock wallet
  disconnect: () =>
    set({
      wallet: null,
      isConnected: false,
      isLocked: true,
      error: null,
      signPsbt: null,
      broadcastTx: null,
    }),

  // Loading state
  setLoading: (isLoading) => set({ isLoading }),

  // Error state
  setError: (error) => set({ error, isLoading: false }),

  // Lock state (without full disconnect)
  setLocked: (isLocked) => set({ isLocked }),

  // Update BTC balance
  updateBalance: (balance) =>
    set((s) => (s.wallet ? { wallet: { ...s.wallet, balance } } : s)),

  // Update BABY token balance
  updateBabyTokens: (babyTokens) =>
    set((s) => (s.wallet ? { wallet: { ...s.wallet, babyTokens } } : s)),

  // Set signing functions (called by wallet provider after connection)
  setSigningFunctions: (signPsbt, broadcastTx) =>
    set({
      signPsbt,
      broadcastTx: broadcastTx || null,
    }),
}));
