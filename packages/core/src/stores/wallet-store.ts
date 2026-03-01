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
export type CleanupFn = () => void;

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

  // Cleanup callbacks for external subscriptions
  cleanupCallbacks: CleanupFn[];

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

  // Cleanup registration
  registerCleanup: (cleanup: CleanupFn) => void;
}

// =============================================================================
// STORE
// =============================================================================

export const useWalletStore = create<WalletStore>((set, get) => ({
  // Initial state
  wallet: null,
  isConnected: false,
  isLoading: false,
  isLocked: true,
  error: null,
  signPsbt: null,
  broadcastTx: null,
  cleanupCallbacks: [],

  // Set wallet (after successful connection/unlock)
  setWallet: (wallet) =>
    set({
      wallet,
      isConnected: true,
      isLoading: false,
      isLocked: false,
      error: null,
    }),

  // Disconnect/lock wallet - run all cleanup callbacks first
  disconnect: () => {
    const state = get();

    // Run all cleanup callbacks to prevent memory leaks
    state.cleanupCallbacks.forEach((cleanup) => {
      try {
        cleanup();
      } catch (e) {
        console.warn("[WalletStore] Cleanup error:", e);
      }
    });

    set({
      wallet: null,
      isConnected: false,
      isLocked: true,
      error: null,
      signPsbt: null,
      broadcastTx: null,
      cleanupCallbacks: [],
    });
  },

  // Loading state
  setLoading: (isLoading) => set({ isLoading }),

  // Error state
  setError: (error) => set({ error, isLoading: false }),

  // Lock state (without full disconnect)
  setLocked: (isLocked) => set({ isLocked }),

  // Update BTC balance (with race condition protection)
  updateBalance: (balance) =>
    set((s) => {
      if (!s.wallet || !s.isConnected) {
        console.warn(
          "[WalletStore] Attempted balance update on disconnected wallet",
        );
        return s;
      }
      return { wallet: { ...s.wallet, balance } };
    }),

  // Update BABY token balance (with race condition protection)
  updateBabyTokens: (babyTokens) =>
    set((s) => {
      if (!s.wallet || !s.isConnected) {
        console.warn(
          "[WalletStore] Attempted token update on disconnected wallet",
        );
        return s;
      }
      return { wallet: { ...s.wallet, babyTokens } };
    }),

  // Set signing functions (called by wallet provider after connection)
  setSigningFunctions: (signPsbt, broadcastTx) =>
    set({
      signPsbt,
      broadcastTx: broadcastTx || null,
    }),

  // Register a cleanup callback to run on disconnect
  registerCleanup: (cleanup) =>
    set((s) => ({
      cleanupCallbacks: [...s.cleanupCallbacks, cleanup],
    })),
}));
