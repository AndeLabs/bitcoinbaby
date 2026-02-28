/**
 * useMintNFT Hook
 *
 * NFT minting hook that integrates with wallet for real transactions.
 * Falls back to demo mode when wallet is not connected.
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import {
  createNFTMintService,
  createMempoolClient,
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
  preview: () => BabyNFTState;
  reset: () => void;
  canMint: boolean;
  /** Is using real blockchain or demo mode */
  isDemo: boolean;
}

// =============================================================================
// DEMO DATA
// =============================================================================

const BLOODLINES = ["royal", "warrior", "rogue", "mystic"] as const;
const BASE_TYPES = ["human", "animal", "robot", "mystic", "alien"] as const;
const RARITIES = [
  "common",
  "common",
  "common",
  "uncommon",
  "uncommon",
  "rare",
  "epic",
  "legendary",
] as const;

/**
 * Generate secure random bytes using WebCrypto API
 * This prevents manipulation of demo NFT traits
 */
function secureRandom(max: number): number {
  const randomBytes = new Uint32Array(1);
  crypto.getRandomValues(randomBytes);
  return randomBytes[0] % max;
}

function generateSecureDNA(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function generateDemoNFT(tokenId: number): BabyNFTState {
  // Use cryptographically secure random to prevent manipulation
  const pick = <T>(arr: readonly T[]) => arr[secureRandom(arr.length)] as T;

  return {
    tokenId,
    dna: generateSecureDNA(),
    bloodline: pick(BLOODLINES),
    baseType: pick(BASE_TYPES),
    rarityTier: pick(RARITIES),
    genesisBlock: 850000 + secureRandom(1000),
    level: 1,
    xp: 0,
    totalXp: 0,
    workCount: 0,
    lastWorkBlock: 0,
    evolutionCount: 0,
    tokensEarned: BigInt(0),
  };
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
  const [nextTokenId, setNextTokenId] = useState(1);
  const [currentPreview, setCurrentPreview] = useState<BabyNFTState | null>(
    null,
  );

  // Wallet
  const wallet = useWalletStore((s) => s.wallet);
  const signPsbt = useWalletStore((s) => s.signPsbt);

  // Services
  const mintService = useMemo(
    () => createNFTMintService({ network: "testnet4" }),
    [],
  );

  const mempoolClient = useMemo(
    () => createMempoolClient({ network: "testnet4" }),
    [],
  );

  // Is using real blockchain?
  const isDemo = !wallet?.address || !signPsbt;

  /**
   * Preview NFT
   */
  const preview = useCallback((): BabyNFTState => {
    if (isDemo) {
      const nft = generateDemoNFT(nextTokenId);
      setCurrentPreview(nft);
      return nft;
    }

    const result = mintService.preview();
    setCurrentPreview(result.nft);
    return result.nft;
  }, [isDemo, nextTokenId, mintService]);

  /**
   * Mint NFT
   */
  const mint = useCallback(async (): Promise<MintResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Demo mode
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 1500));
        const nft = currentPreview || generateDemoNFT(nextTokenId);
        const fakeTxid = `demo_${Date.now().toString(16)}`;

        setLastMinted(nft);
        setTxid(fakeTxid);
        setNextTokenId((id) => id + 1);
        setCurrentPreview(null);

        return { success: true, nft, txid: fakeTxid };
      }

      // Real mode - get UTXOs and create PSBT
      const utxos = await mempoolClient.getUTXOs(wallet!.address);

      if (!utxos || utxos.length === 0) {
        throw new Error("No UTXOs available. Please fund your wallet first.");
      }

      const mintResult = await mintService.createMintPSBT({
        buyerAddress: wallet!.address,
        utxos,
        dna: currentPreview?.dna,
        feeRate: 10,
      });

      if (!mintResult.success || !mintResult.psbtHex) {
        throw new Error(mintResult.error || "Failed to create transaction");
      }

      // Sign PSBT
      const signedPsbt = await signPsbt!(mintResult.psbtHex);
      if (!signedPsbt) {
        throw new Error("Failed to sign transaction");
      }

      // Broadcast
      const broadcastTxid =
        await mempoolClient.broadcastTransaction(signedPsbt);
      if (!broadcastTxid) {
        throw new Error("Failed to broadcast transaction");
      }

      setLastMinted(mintResult.nft!);
      setTxid(broadcastTxid);
      setNextTokenId((id) => id + 1);
      setCurrentPreview(null);

      return { success: true, nft: mintResult.nft, txid: broadcastTxid };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Mint failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [
    isDemo,
    currentPreview,
    nextTokenId,
    wallet,
    signPsbt,
    mintService,
    mempoolClient,
  ]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setLastMinted(null);
    setTxid(null);
    setCurrentPreview(null);
  }, []);

  return {
    isLoading,
    error,
    lastMinted,
    txid,
    mint,
    preview,
    reset,
    canMint: !isLoading,
    isDemo,
  };
}

export default useMintNFT;
