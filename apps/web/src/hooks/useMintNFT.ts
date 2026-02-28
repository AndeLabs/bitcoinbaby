/**
 * useMintNFT Hook
 *
 * NFT minting hook for testnet4 production.
 * Requires connected wallet - no demo mode.
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import {
  createNFTMintService,
  createMempoolClient,
  Psbt,
  type BabyNFTState,
} from "@bitcoinbaby/bitcoin";
import { useWalletStore } from "@bitcoinbaby/core";

// =============================================================================
// TYPES
// =============================================================================

export interface MintResult {
  success: boolean;
  nft?: BabyNFTState;
  txid?: string;
  error?: string;
}

export interface UseMintNFTReturn {
  isLoading: boolean;
  error: string | null;
  lastMinted: BabyNFTState | null;
  txid: string | null;
  mint: () => Promise<MintResult>;
  reset: () => void;
  /** Can mint (wallet connected and not loading) */
  canMint: boolean;
  /** Is wallet connected */
  isWalletConnected: boolean;
}

// =============================================================================
// HOOK
// =============================================================================

export function useMintNFT(): UseMintNFTReturn {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMinted, setLastMinted] = useState<BabyNFTState | null>(null);
  const [txid, setTxid] = useState<string | null>(null);

  // Wallet
  const wallet = useWalletStore((s) => s.wallet);
  const signPsbt = useWalletStore((s) => s.signPsbt);

  // Services - testnet4 production
  const mintService = useMemo(
    () => createNFTMintService({ network: "testnet4" }),
    [],
  );

  const mempoolClient = useMemo(
    () => createMempoolClient({ network: "testnet4" }),
    [],
  );

  // Wallet connection check
  const isWalletConnected = Boolean(wallet?.address && signPsbt);

  /**
   * Mint NFT - requires wallet connection
   */
  const mint = useCallback(async (): Promise<MintResult> => {
    // Require wallet
    if (!wallet?.address || !signPsbt) {
      return {
        success: false,
        error: "Please connect your wallet first",
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get UTXOs for the transaction
      const utxos = await mempoolClient.getUTXOs(wallet.address);

      if (!utxos || utxos.length === 0) {
        throw new Error(
          "No tBTC available. Get testnet coins from the faucet first.",
        );
      }

      // Create mint transaction
      const mintResult = await mintService.createMintPSBT({
        buyerAddress: wallet.address,
        utxos,
        feeRate: 10,
      });

      if (!mintResult.success || !mintResult.psbtHex) {
        throw new Error(mintResult.error || "Failed to create transaction");
      }

      // Sign PSBT with wallet
      const signedPsbtHex = await signPsbt(mintResult.psbtHex);
      if (!signedPsbtHex) {
        throw new Error("Transaction was cancelled or failed to sign");
      }

      // Extract raw transaction from finalized PSBT
      const signedPsbt = Psbt.fromHex(signedPsbtHex);
      const rawTxHex = signedPsbt.extractTransaction().toHex();

      // Broadcast to network
      const broadcastTxid = await mempoolClient.broadcastTransaction(rawTxHex);
      if (!broadcastTxid) {
        throw new Error("Failed to broadcast transaction to the network");
      }

      setLastMinted(mintResult.nft!);
      setTxid(broadcastTxid);

      return { success: true, nft: mintResult.nft, txid: broadcastTxid };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Mint failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [wallet, signPsbt, mintService, mempoolClient]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setLastMinted(null);
    setTxid(null);
  }, []);

  return {
    isLoading,
    error,
    lastMinted,
    txid,
    mint,
    reset,
    canMint: isWalletConnected && !isLoading,
    isWalletConnected,
  };
}

export default useMintNFT;
