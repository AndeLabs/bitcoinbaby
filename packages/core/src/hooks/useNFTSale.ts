/**
 * useNFTSale Hook
 *
 * Frontend hook for purchasing Genesis Babies NFTs.
 * Uses FIXED Bitcoin pricing (50,000 sats = ~€50)
 * Price does NOT fluctuate with USD - stable for Bitcoin users.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  calculateNFTPrice,
  validatePurchase,
  NFT_SALE_CONFIG,
  formatSatsPrice,
  getTierPrice,
  type PriceTier,
  type NFTPriceBreakdown,
  type PurchaseValidation,
} from "@bitcoinbaby/bitcoin";

// =============================================================================
// TYPES
// =============================================================================

export interface UseNFTSaleOptions {
  /** Buyer's Bitcoin address */
  buyerAddress?: string;
  /** Buyer's current balance in satoshis */
  buyerBalance?: bigint;
  /** Selected price tier */
  tier?: PriceTier;
  /** Whether buyer is on whitelist */
  isWhitelist?: boolean;
  /** Treasury address to receive payments */
  treasuryAddress?: string;
}

export interface UseNFTSaleReturn {
  /** Price breakdown for purchase */
  priceBreakdown: NFTPriceBreakdown;
  /** Purchase validation result */
  validation: PurchaseValidation;
  /** Whether purchase is in progress */
  isPurchasing: boolean;
  /** Error message if any */
  error: string | null;
  /** Check if user can purchase */
  canPurchase: boolean;
  /** Formatted price string (e.g., "50,000 sats") */
  formattedPrice: string;
  /** Sale config */
  config: typeof NFT_SALE_CONFIG;
  /** Available tiers with prices */
  availableTiers: Array<{
    tier: PriceTier;
    price: bigint;
    formattedPrice: string;
    guarantee: string | null;
  }>;
  /** Change selected tier */
  setTier: (tier: PriceTier) => void;
  /** Current tier */
  currentTier: PriceTier;
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
    tier: initialTier = "standard",
    isWhitelist = false,
    treasuryAddress,
  } = options;

  // State
  const [currentTier, setTier] = useState<PriceTier>(initialTier);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate price (sync - no API call needed)
  const priceBreakdown = useMemo(
    () => calculateNFTPrice({ tier: currentTier, isWhitelist }),
    [currentTier, isWhitelist],
  );

  // Validate purchase
  const validation = useMemo(
    () =>
      validatePurchase({
        buyerAddress: buyerAddress || "",
        buyerBalance,
        tier: currentTier,
        isWhitelist,
      }),
    [buyerAddress, buyerBalance, currentTier, isWhitelist],
  );

  // Available tiers
  const availableTiers = useMemo(() => {
    const tiers: PriceTier[] = ["standard"];
    if (NFT_SALE_CONFIG.premiumTiersEnabled) {
      tiers.push("premium", "legendary");
    }

    return tiers.map((tier) => {
      const price = getTierPrice(tier);
      const guarantee = NFT_SALE_CONFIG.tierGuarantees[tier];
      return {
        tier,
        price,
        formattedPrice: formatSatsPrice(price),
        guarantee: guarantee ? `${guarantee}+` : null,
      };
    });
  }, []);

  /**
   * Check if user can purchase
   */
  const canPurchase = !!(buyerAddress && validation.valid && !isPurchasing);

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
            : validation.errors.join(", ") || "Cannot purchase",
        };
      }

      setIsPurchasing(true);
      setError(null);

      try {
        // TODO: Build PSBT with spell for NFT mint + payment
        // This requires integration with the transaction builder
        // For now, return a placeholder

        return {
          success: false,
          error: "NFT purchase transaction building coming soon",
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Purchase failed";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsPurchasing(false);
      }
    },
    [canPurchase, treasuryAddress, validation],
  );

  return {
    priceBreakdown,
    validation,
    isPurchasing,
    error,
    canPurchase,
    formattedPrice: priceBreakdown.displayPrice,
    config: NFT_SALE_CONFIG,
    availableTiers,
    setTier,
    currentTier,
    initiatePurchase,
  };
}
