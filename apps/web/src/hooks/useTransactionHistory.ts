"use client";

/**
 * useTransactionHistory Hook
 *
 * Fetches and manages transaction history from Mempool.space API.
 * Supports pagination via "load more" pattern with cursor-based loading.
 *
 * Features:
 * - Automatic calculation of incoming vs outgoing amounts
 * - Confirmation tracking based on current block height
 * - Mining submission detection (based on OP_RETURN patterns)
 * - Paginated loading with cursor support
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  createMempoolClient,
  type TransactionInfo,
  type BitcoinNetwork,
} from "@bitcoinbaby/bitcoin";
import type { TransactionDisplay } from "@bitcoinbaby/ui";

/**
 * Extended transaction info from Mempool API
 * (includes vin/vout which aren't in the base TransactionInfo type)
 */
interface ExtendedTransactionInfo extends TransactionInfo {
  vin: Array<{
    txid: string;
    vout: number;
    prevout?: {
      scriptpubkey_address?: string;
      value: number;
    };
    witness?: string[];
  }>;
  vout: Array<{
    scriptpubkey: string;
    scriptpubkey_address?: string;
    scriptpubkey_type: string;
    value: number;
  }>;
}

/**
 * Hook state
 */
export interface TransactionHistoryState {
  /** Processed transactions ready for display */
  transactions: TransactionDisplay[];
  /** Raw transaction data from API */
  rawTransactions: ExtendedTransactionInfo[];
  /** Whether initial load is in progress */
  isLoading: boolean;
  /** Whether more transactions are being loaded */
  isLoadingMore: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Whether more transactions can be loaded */
  hasMore: boolean;
  /** Current block height (for confirmation calculation) */
  currentBlockHeight: number | null;
  /** Last refresh timestamp */
  lastUpdated: number | null;
}

/**
 * Hook actions
 */
export interface TransactionHistoryActions {
  /** Load more transactions (pagination) */
  loadMore: () => Promise<void>;
  /** Refresh all transactions */
  refresh: () => Promise<void>;
}

export type UseTransactionHistoryReturn = TransactionHistoryState &
  TransactionHistoryActions;

/**
 * Hook options
 */
export interface UseTransactionHistoryOptions {
  /** Bitcoin address to fetch transactions for */
  address: string | undefined;
  /** Network to use */
  network: BitcoinNetwork;
  /** Whether to auto-refresh periodically */
  autoRefresh?: boolean;
  /** Auto-refresh interval in ms (default: 60000) */
  refreshInterval?: number;
  /** Whether to fetch on mount */
  fetchOnMount?: boolean;
}

/**
 * Number of transactions per page (Mempool API default is 25)
 */
const PAGE_SIZE = 25;

/**
 * Check if a transaction is a mining submission
 * (looks for OP_RETURN outputs with specific patterns)
 */
function isMiningSubmission(tx: ExtendedTransactionInfo): boolean {
  return tx.vout.some(
    (output) =>
      output.scriptpubkey_type === "op_return" ||
      // Check for Charms/Scrolls pattern
      output.scriptpubkey?.startsWith("6a"), // OP_RETURN opcode
  );
}

/**
 * Calculate transaction amount relative to an address
 * Returns positive for incoming, negative for outgoing
 */
function calculateAmount(
  tx: ExtendedTransactionInfo,
  address: string,
): { amount: number; type: "incoming" | "outgoing" | "self" } {
  // Sum of inputs from this address
  const inputSum = tx.vin
    .filter((input) => input.prevout?.scriptpubkey_address === address)
    .reduce((sum, input) => sum + (input.prevout?.value || 0), 0);

  // Sum of outputs to this address
  const outputSum = tx.vout
    .filter((output) => output.scriptpubkey_address === address)
    .reduce((sum, output) => sum + output.value, 0);

  const netAmount = outputSum - inputSum;

  // Determine transaction type
  let type: "incoming" | "outgoing" | "self";
  if (inputSum === 0 && outputSum > 0) {
    type = "incoming";
  } else if (inputSum > 0 && outputSum === 0) {
    type = "outgoing";
  } else if (inputSum > 0 && outputSum > 0) {
    // Has both inputs and outputs - could be self-send or change
    type = netAmount >= 0 ? "self" : "outgoing";
  } else {
    type = "incoming";
  }

  return { amount: netAmount, type };
}

/**
 * Process raw transaction into display format
 */
function processTransaction(
  tx: ExtendedTransactionInfo,
  address: string,
  currentBlockHeight: number | null,
): TransactionDisplay {
  const { amount, type } = calculateAmount(tx, address);

  // Calculate confirmations
  let confirmations = 0;
  if (tx.status.confirmed && tx.status.block_height && currentBlockHeight) {
    confirmations = currentBlockHeight - tx.status.block_height + 1;
  }

  return {
    txid: tx.txid,
    amount: Math.abs(amount),
    confirmations,
    timestamp: tx.status.block_time || null,
    fee: tx.fee,
    type,
    isMiningSubmission: isMiningSubmission(tx),
  };
}

/**
 * useTransactionHistory Hook
 *
 * @example
 * ```tsx
 * const {
 *   transactions,
 *   isLoading,
 *   error,
 *   hasMore,
 *   loadMore,
 *   refresh,
 * } = useTransactionHistory({
 *   address: wallet?.address,
 *   network: 'testnet4',
 * });
 * ```
 */
export function useTransactionHistory(
  options: UseTransactionHistoryOptions,
): UseTransactionHistoryReturn {
  const {
    address,
    network,
    autoRefresh = false,
    refreshInterval = 60000,
    fetchOnMount = true,
  } = options;

  // Create mempool client
  const clientRef = useRef(createMempoolClient({ network }));

  // Update client when network changes
  useEffect(() => {
    clientRef.current = createMempoolClient({ network });
  }, [network]);

  // State
  const [state, setState] = useState<TransactionHistoryState>({
    transactions: [],
    rawTransactions: [],
    isLoading: false,
    isLoadingMore: false,
    error: null,
    hasMore: false,
    currentBlockHeight: null,
    lastUpdated: null,
  });

  /**
   * Fetch current block height
   */
  const fetchBlockHeight = useCallback(async (): Promise<number | null> => {
    try {
      return await clientRef.current.getBlockHeight();
    } catch {
      return null;
    }
  }, []);

  /**
   * Fetch transactions with optional cursor
   */
  const fetchTransactions = useCallback(
    async (afterTxid?: string): Promise<ExtendedTransactionInfo[]> => {
      if (!address) return [];

      const txs = await clientRef.current.getAddressTransactions(
        address,
        afterTxid,
      );

      // Cast to extended type (Mempool API returns full tx data)
      return txs as ExtendedTransactionInfo[];
    },
    [address],
  );

  /**
   * Initial fetch / refresh
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (!address) {
      setState((prev) => ({
        ...prev,
        transactions: [],
        rawTransactions: [],
        error: null,
        hasMore: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch block height and transactions in parallel
      const [blockHeight, rawTxs] = await Promise.all([
        fetchBlockHeight(),
        fetchTransactions(),
      ]);

      // Process transactions
      const processedTxs = rawTxs.map((tx) =>
        processTransaction(tx, address, blockHeight),
      );

      setState({
        transactions: processedTxs,
        rawTransactions: rawTxs,
        isLoading: false,
        isLoadingMore: false,
        error: null,
        hasMore: rawTxs.length >= PAGE_SIZE,
        currentBlockHeight: blockHeight,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch transactions",
      }));
    }
  }, [address, fetchBlockHeight, fetchTransactions]);

  /**
   * Load more transactions (pagination)
   */
  const loadMore = useCallback(async (): Promise<void> => {
    if (!address || state.isLoadingMore || !state.hasMore) return;

    const lastTx = state.rawTransactions[state.rawTransactions.length - 1];
    if (!lastTx) return;

    setState((prev) => ({ ...prev, isLoadingMore: true, error: null }));

    try {
      const newRawTxs = await fetchTransactions(lastTx.txid);

      // Process new transactions
      const newProcessedTxs = newRawTxs.map((tx) =>
        processTransaction(tx, address, state.currentBlockHeight),
      );

      setState((prev) => ({
        ...prev,
        transactions: [...prev.transactions, ...newProcessedTxs],
        rawTransactions: [...prev.rawTransactions, ...newRawTxs],
        isLoadingMore: false,
        hasMore: newRawTxs.length >= PAGE_SIZE,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoadingMore: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load more transactions",
      }));
    }
  }, [
    address,
    state.isLoadingMore,
    state.hasMore,
    state.rawTransactions,
    state.currentBlockHeight,
    fetchTransactions,
  ]);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    if (fetchOnMount && address) {
      refresh();
    }
  }, [address, fetchOnMount]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Auto-refresh interval
   */
  useEffect(() => {
    if (!autoRefresh || !address) return;

    const intervalId = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, address, refreshInterval, refresh]);

  return {
    ...state,
    isLoading: state.isLoading || state.isLoadingMore,
    loadMore,
    refresh,
  };
}
