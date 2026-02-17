"use client";

/**
 * useMiningWithNFTs - Combined Mining + NFT Boost Hook
 *
 * Automatically applies NFT boost from user's Genesis Babies to mining hashrate.
 */

import { useEffect } from "react";
import { useMiningBoost } from "@bitcoinbaby/core";
import { useMining, type UseMiningOptions } from "./useMining";
import { useWalletStore } from "@bitcoinbaby/core";

interface UseMiningWithNFTsOptions extends Omit<UseMiningOptions, "nftBoost"> {
  /** NFT app ID for Genesis Babies */
  nftAppId?: string;
}

export function useMiningWithNFTs(options: UseMiningWithNFTsOptions = {}) {
  const { nftAppId = "genesis-babies", ...miningOptions } = options;

  // Get wallet address
  const address = useWalletStore((s) => s.wallet?.address ?? null);

  // Get NFT boost from owned Genesis Babies
  const {
    boost,
    nftCount,
    loading: boostLoading,
  } = useMiningBoost(address, nftAppId);

  // Initialize mining with NFT boost
  const mining = useMining({
    ...miningOptions,
    nftBoost: boost,
  });

  // Sync boost when it changes
  useEffect(() => {
    mining.setNFTBoost(boost);
  }, [boost, mining.setNFTBoost]);

  return {
    // Mining state
    ...mining,

    // NFT boost info
    nftCount,
    boostLoading,

    // Computed
    boostMultiplier: 1 + boost / 100,
  };
}

export type { UseMiningWithNFTsOptions };
