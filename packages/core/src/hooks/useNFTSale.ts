/**
 * useNFTSale Hook
 *
 * Frontend hook for purchasing Genesis Babies NFTs at $50 USD equivalent in BTC.
 * Handles price fetching, validation, and transaction building.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getBTCPrice,
  calculateNFTPrice,
  validatePurchase,
  NFT_SALE_CONFIG,
  type BTCPriceData,
  type NFTPriceBreakdown,
  type PurchaseValidation,
  type RarityTier,
} from "@bitcoinbaby/bitcoin";

// =============================================================================
// TYPES
// =============================================================================

export interface UseNFTSaleOptions {
  /** Buyer's Bitcoin address */
  buyerAddress?: string;
  /** Buyer's current balance in satoshis */
  buyerBalance?: bigint;
  /** Auto-refresh price interval (ms, default: 60000) */
  priceRefreshInterval?: number;
  /** Treasury address to receive payments */
  treasuryAddress?: string;
}

export interface UseNFTSaleReturn {
  /** Current BTC price data */
  btcPrice: BTCPriceData | null;
  /** Price breakdown for purchase */
  priceBreakdown: NFTPriceBreakdown | null;
  /** Purchase validation result */
  validation: PurchaseValidation | null;
  /** Whether price is loading */
  isLoadingPrice: boolean;
  /** Whether purchase is in progress */
  isPurchasing: boolean;
  /** Error message if any */
  error: string | null;
  /** Refresh price manually */
  refreshPrice: () => Promise<void>;
  /** Check if user can purchase */
  canPurchase: boolean;
  /** Formatted price string (e.g., "$50.00 (~0.00052 BTC)") */
  formattedPrice: string;
  /** Sale config */
  config: typeof NFT_SALE_CONFIG;
  /** Initiate purchase (returns PSBT for signing) */
  initiatePurchase: (tokenId: number) => Promise<{
    success: boolean;
    psbt?: string;
    error?: string;
  }>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useNFTSale(options: UseNFTSaleOptions = {}): UseNFTSaleReturn {
  const {
    buyerAddress,
    buyerBalance = 0n,
    priceRefreshInterval = 60000,
    treasuryAddress,
  } = options;

  // State
  const [btcPrice, setBtcPrice] = useState<BTCPriceData | null>(null);
  const [priceBreakdown, setPriceBreakdown] =
    useState<NFTPriceBreakdown | null>(null);
  const [validation, setValidation] = useState<PurchaseValidation | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Fetch current BTC price and calculate NFT price
   */
  const refreshPrice = useCallback(async () => {
    try {
      setIsLoadingPrice(true);
      setError(null);

      // Get BTC price
      const price = await getBTCPrice();
      setBtcPrice(price);

      // Calculate NFT price
      const breakdown = await calculateNFTPrice({});
      setPriceBreakdown(breakdown);

      // Validate purchase if we have buyer info
      if (buyerAddress) {
        const validationResult = await validatePurchase({
          buyerAddress,
          buyerBalance,
        });
        setValidation(validationResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch price");
    } finally {
      setIsLoadingPrice(false);
    }
  }, [buyerAddress, buyerBalance]);

  /**
   * Initialize and auto-refresh price
   */
  useEffect(() => {
    // Initial fetch
    refreshPrice();

    // Setup auto-refresh
    refreshTimerRef.current = setInterval(refreshPrice, priceRefreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [refreshPrice, priceRefreshInterval]);

  /**
   * Re-validate when buyer info changes
   */
  useEffect(() => {
    if (buyerAddress && priceBreakdown) {
      validatePurchase({
        buyerAddress,
        buyerBalance,
      }).then(setValidation);
    }
  }, [buyerAddress, buyerBalance, priceBreakdown]);

  /**
   * Format price for display
   */
  const formattedPrice = priceBreakdown
    ? `$${priceBreakdown.finalPriceUSD.toFixed(2)} (~${(Number(priceBreakdown.finalPriceSats) / 100_000_000).toFixed(6)} BTC)`
    : "$50.00";

  /**
   * Check if user can purchase
   */
  const canPurchase = !!(
    buyerAddress &&
    validation?.valid &&
    priceBreakdown &&
    !isPurchasing
  );

  /**
   * Initiate purchase - creates PSBT for signing
   */
  const initiatePurchase = useCallback(
    async (
      tokenId: number,
    ): Promise<{ success: boolean; psbt?: string; error?: string }> => {
      if (!canPurchase || !treasuryAddress) {
        return {
          success: false,
          error: !treasuryAddress
            ? "Treasury address not configured"
            : "Cannot purchase - validation failed",
        };
      }

      setIsPurchasing(true);
      setError(null);

      try {
        // Re-validate with fresh price
        await refreshPrice();

        if (!validation?.valid) {
          return {
            success: false,
            error: validation?.errors.join(", ") || "Validation failed",
          };
        }

        // TODO: Build PSBT with spell for NFT mint + payment
        // This requires integration with the transaction builder
        // For now, return a placeholder

        return {
          success: false,
          error: "NFT purchase transaction building not yet implemented",
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Purchase failed";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsPurchasing(false);
      }
    },
    [canPurchase, treasuryAddress, refreshPrice, validation],
  );

  return {
    btcPrice,
    priceBreakdown,
    validation,
    isLoadingPrice,
    isPurchasing,
    error,
    refreshPrice,
    canPurchase,
    formattedPrice,
    config: NFT_SALE_CONFIG,
    initiatePurchase,
  };
}
