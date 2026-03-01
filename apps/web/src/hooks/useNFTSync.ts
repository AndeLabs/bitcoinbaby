"use client";

/**
 * useNFTSync Hook
 *
 * Professional NFT sync using TanStack Query:
 * - Auto-sync on mount when wallet connected
 * - Smart caching (stale-while-revalidate)
 * - Background refetch on window focus
 * - Optimistic updates after mint
 * - Automatic retry with exponential backoff
 */

import { useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useNFTStore,
  useWalletStore,
  usePendingTxStore,
} from "@bitcoinbaby/core";
import {
  createCharmsClient,
  GENESIS_BABIES_TESTNET4,
  type BabyNFTState,
} from "@bitcoinbaby/bitcoin";

// =============================================================================
// TYPES
// =============================================================================

export interface UseNFTSyncReturn {
  /** NFTs from blockchain */
  nfts: BabyNFTState[];
  /** Is fetching from blockchain */
  isLoading: boolean;
  /** Is refetching in background */
  isFetching: boolean;
  /** Error message if sync failed */
  error: string | null;
  /** Last successful sync timestamp */
  lastSynced: number | null;
  /** Trigger manual refresh */
  refresh: () => Promise<void>;
  /** Number of NFTs found */
  count: number;
  /** Is data stale (needs refresh) */
  isStale: boolean;
}

// =============================================================================
// CHARMS CLIENT
// =============================================================================

const charmsClient = createCharmsClient({
  network: "testnet4",
});

// =============================================================================
// QUERY KEY
// =============================================================================

const NFT_QUERY_KEY = "owned-nfts";

function getNFTQueryKey(address: string | undefined) {
  return [NFT_QUERY_KEY, address, GENESIS_BABIES_TESTNET4.appId];
}

// =============================================================================
// FETCH FUNCTION
// =============================================================================

async function fetchOwnedNFTs(address: string): Promise<BabyNFTState[]> {
  const nfts = await charmsClient.getOwnedNFTs(
    address,
    GENESIS_BABIES_TESTNET4.appId,
  );
  return nfts;
}

// =============================================================================
// HOOK
// =============================================================================

export function useNFTSync(): UseNFTSyncReturn {
  const queryClient = useQueryClient();

  // Stores
  const { setOwnedNFTs, ownedNFTs: localNFTs } = useNFTStore();
  const wallet = useWalletStore((s) => s.wallet);
  const pendingTransactions = usePendingTxStore((s) => s.transactions);

  // Track last confirmed tx to trigger refetch
  const lastConfirmedTxRef = useRef<string | null>(null);

  // Query for NFTs
  const {
    data: blockchainNFTs = [],
    isLoading,
    isFetching,
    error,
    dataUpdatedAt,
    isStale,
    refetch,
  } = useQuery({
    queryKey: getNFTQueryKey(wallet?.address),
    queryFn: () => fetchOwnedNFTs(wallet!.address),
    enabled: !!wallet?.address,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  /**
   * Merge blockchain NFTs with local store
   * Blockchain is source of truth, but keep pending local mints
   */
  useEffect(() => {
    if (blockchainNFTs.length > 0) {
      // Keep local NFTs that aren't on-chain yet (pending mints)
      const onChainIds = new Set(blockchainNFTs.map((n) => n.tokenId));
      const pendingLocalNFTs = localNFTs.filter(
        (n) => !onChainIds.has(n.tokenId),
      );

      // Merge: blockchain NFTs (source of truth) + pending local
      const mergedNFTs = [...blockchainNFTs, ...pendingLocalNFTs];

      // Only update if different
      if (JSON.stringify(mergedNFTs) !== JSON.stringify(localNFTs)) {
        setOwnedNFTs(mergedNFTs);
      }
    }
  }, [blockchainNFTs, localNFTs, setOwnedNFTs]);

  /**
   * Refetch when NFT transactions confirm
   */
  useEffect(() => {
    const confirmedNFTTx = pendingTransactions.find(
      (tx) =>
        (tx.type === "nft_mint" || tx.type === "nft_purchase") &&
        tx.status === "confirmed" &&
        tx.txid !== lastConfirmedTxRef.current,
    );

    if (confirmedNFTTx) {
      lastConfirmedTxRef.current = confirmedNFTTx.txid;
      // Wait for blockchain to index, then refetch
      setTimeout(() => {
        refetch();
      }, 5000);
    }
  }, [pendingTransactions, refetch]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Use local NFTs for display (includes pending mints)
  const displayNFTs = localNFTs;

  return {
    nfts: displayNFTs,
    isLoading,
    isFetching,
    error: error ? (error as Error).message : null,
    lastSynced: dataUpdatedAt || null,
    refresh,
    count: displayNFTs.length,
    isStale,
  };
}

/**
 * Hook to invalidate NFT cache (call after successful mint)
 */
export function useInvalidateNFTs() {
  const queryClient = useQueryClient();
  const wallet = useWalletStore((s) => s.wallet);

  return useCallback(() => {
    if (wallet?.address) {
      queryClient.invalidateQueries({
        queryKey: getNFTQueryKey(wallet.address),
      });
    }
  }, [queryClient, wallet?.address]);
}

export default useNFTSync;
