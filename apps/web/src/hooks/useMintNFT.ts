"use client";

/**
 * useMintNFT - Hook for minting Genesis Baby NFTs
 *
 * Generates random traits and creates the mint transaction.
 */

import { useState, useCallback } from "react";
import { useWalletStore } from "@bitcoinbaby/core";
import {
  createNFTGenesisSpell,
  GENESIS_BABIES_CONFIG,
  type Bloodline,
  type BaseType,
  type RarityTier,
  type BabyNFTState,
} from "@bitcoinbaby/bitcoin";

interface MintState {
  isLoading: boolean;
  error: string | null;
  lastMinted: BabyNFTState | null;
  txid: string | null;
}

interface MintResult {
  success: boolean;
  nft?: BabyNFTState;
  txid?: string;
  error?: string;
}

// =============================================================================
// RANDOM GENERATION
// =============================================================================

/**
 * Generate random DNA hash
 */
function generateDNA(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Pick random item based on weights
 */
function weightedRandom<T extends string>(
  items: Record<T, { weight: number }>,
): T {
  const entries = Object.entries(items) as [T, { weight: number }][];
  const totalWeight = entries.reduce((sum, [, v]) => sum + v.weight, 0);

  let random = Math.random() * totalWeight;

  for (const [key, { weight }] of entries) {
    random -= weight;
    if (random <= 0) return key;
  }

  return entries[0][0];
}

/**
 * Generate random bloodline
 */
function randomBloodline(): Bloodline {
  const bloodlines: Bloodline[] = ["royal", "warrior", "rogue", "mystic"];
  return bloodlines[Math.floor(Math.random() * bloodlines.length)];
}

/**
 * Generate random base type based on weights
 */
function randomBaseType(): BaseType {
  return weightedRandom(GENESIS_BABIES_CONFIG.baseTypes);
}

/**
 * Generate random rarity based on weights
 */
function randomRarity(): RarityTier {
  return weightedRandom(GENESIS_BABIES_CONFIG.rarityTiers);
}

// =============================================================================
// HOOK
// =============================================================================

export function useMintNFT() {
  const [state, setState] = useState<MintState>({
    isLoading: false,
    error: null,
    lastMinted: null,
    txid: null,
  });

  const wallet = useWalletStore((s) => s.wallet);

  /**
   * Preview a random NFT (without minting)
   */
  const preview = useCallback((): BabyNFTState => {
    return {
      dna: generateDNA(),
      bloodline: randomBloodline(),
      baseType: randomBaseType(),
      rarityTier: randomRarity(),
      genesisBlock: 0, // Will be set at mint
      tokenId: Math.floor(Math.random() * 10000) + 1,
      level: 1,
      xp: 0,
      totalXp: 0,
      workCount: 0,
      lastWorkBlock: 0,
      evolutionCount: 0,
      tokensEarned: 0n,
    };
  }, []);

  /**
   * Mint a new Genesis Baby NFT
   */
  const mint = useCallback(async (): Promise<MintResult> => {
    if (!wallet) {
      return { success: false, error: "Wallet not connected" };
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // Generate random traits
      const dna = generateDNA();
      const bloodline = randomBloodline();
      const baseType = randomBaseType();
      const rarityTier = randomRarity();

      // For demo: use mock token ID and genesis block
      // In production: fetch from chain/indexer
      const tokenId = Math.floor(Math.random() * 10000) + 1;
      const genesisBlock = Date.now(); // Mock block number

      // Create the NFT state
      const nftState: BabyNFTState = {
        dna,
        bloodline,
        baseType,
        rarityTier,
        genesisBlock,
        tokenId,
        level: 1,
        xp: 0,
        totalXp: 0,
        workCount: 0,
        lastWorkBlock: genesisBlock,
        evolutionCount: 0,
        tokensEarned: 0n,
      };

      // Create the genesis spell
      const spell = createNFTGenesisSpell({
        appId: "genesis-babies",
        appVk: "demo-vk", // Production: actual verification key
        ownerAddress: wallet.address,
        tokenId,
        dna,
        bloodline,
        baseType,
        rarityTier,
        genesisBlock,
      });

      // TODO: In production, this would:
      // 1. Build a PSBT with the spell data
      // 2. Sign with wallet
      // 3. Broadcast to Bitcoin network
      // 4. Return actual txid

      // For demo: simulate successful mint
      await new Promise((r) => setTimeout(r, 2000));

      const mockTxid = `demo_${Date.now().toString(16)}`;

      setState({
        isLoading: false,
        error: null,
        lastMinted: nftState,
        txid: mockTxid,
      });

      return {
        success: true,
        nft: nftState,
        txid: mockTxid,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }));

      return { success: false, error: errorMsg };
    }
  }, [wallet]);

  /**
   * Reset the mint state
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      lastMinted: null,
      txid: null,
    });
  }, []);

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    lastMinted: state.lastMinted,
    txid: state.txid,

    // Actions
    mint,
    preview,
    reset,

    // Wallet check
    canMint: !!wallet,
  };
}

export type { MintState, MintResult };
