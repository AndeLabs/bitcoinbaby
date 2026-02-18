/**
 * @deprecated This hook has been moved to @bitcoinbaby/core as useNFTMinting
 * Please import from '@bitcoinbaby/core' instead:
 *
 * ```tsx
 * import { useNFTMinting } from '@bitcoinbaby/core';
 * ```
 *
 * This file provides a DEMO implementation for backwards compatibility.
 * The core version provides full blockchain integration.
 */

"use client";

import { useState, useCallback } from "react";
import type { BabyNFTState } from "@bitcoinbaby/bitcoin";

// Re-export the canonical hook
export {
  useNFTMinting,
  type UseNFTMintingOptions,
  type UseNFTMintingReturn,
  type NFTMintResult,
} from "@bitcoinbaby/core";

// Legacy types for backwards compatibility
export interface MintState {
  isLoading: boolean;
  error: string | null;
  lastMinted: BabyNFTState | null;
  txid: string | null;
}

export interface MintResult {
  success: boolean;
  nft?: BabyNFTState;
  txid?: string;
  error?: string;
}

// Demo bloodlines and types
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

function generateRandomNFT(tokenId: number): BabyNFTState {
  const pick = <T>(arr: readonly T[]) =>
    arr[Math.floor(Math.random() * arr.length)] as T;

  return {
    tokenId,
    dna: Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join(""),
    bloodline: pick(BLOODLINES),
    baseType: pick(BASE_TYPES),
    rarityTier: pick(RARITIES),
    genesisBlock: 850000 + Math.floor(Math.random() * 1000),
    level: 1,
    xp: 0,
    totalXp: 0,
    workCount: 0,
    lastWorkBlock: 0,
    evolutionCount: 0,
    tokensEarned: BigInt(0),
  };
}

/**
 * @deprecated Use useNFTMinting from @bitcoinbaby/core
 *
 * This provides a DEMO implementation for the NFTs page.
 */
export function useMintNFT() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMinted, setLastMinted] = useState<BabyNFTState | null>(null);
  const [txid, setTxid] = useState<string | null>(null);
  const [nextTokenId, setNextTokenId] = useState(1);

  // Preview generates a random NFT
  const preview = useCallback((): BabyNFTState => {
    return generateRandomNFT(nextTokenId);
  }, [nextTokenId]);

  // Mint creates the NFT (demo: just generates and returns it)
  const mint = useCallback(async (): Promise<MintResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 1500));

      const nft = generateRandomNFT(nextTokenId);
      const fakeTxid = `demo_${Date.now().toString(16)}`;

      setLastMinted(nft);
      setTxid(fakeTxid);
      setNextTokenId((id) => id + 1);

      return { success: true, nft, txid: fakeTxid };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Mint failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [nextTokenId]);

  // Reset state
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
    preview,
    reset,
    canMint: true, // Demo always allows minting
  };
}
