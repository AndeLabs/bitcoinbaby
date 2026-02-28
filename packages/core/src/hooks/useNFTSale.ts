/**
 * useNFTSale Hook
 *
 * Simple hook for NFT purchase.
 * Fixed price: 50,000 sats
 * All funds → Treasury
 */

import { useState, useCallback, useMemo } from "react";
import {
  calculateNFTPrice,
  validatePurchase,
  calculatePurchaseOutputs,
  NFT_SALE_CONFIG,
  getTreasuryAddress,
  type NFTPriceBreakdown,
  type PurchaseValidation,
} from "@bitcoinbaby/bitcoin";

// =============================================================================
// TYPES
// =============================================================================

export interface UseNFTSaleOptions {
  buyerAddress?: string;
  buyerBalance?: bigint;
}

export interface UseNFTSaleReturn {
  /** Price info */
  price: NFTPriceBreakdown;
  /** Formatted price string */
  formattedPrice: string;
  /** Validation result */
  validation: PurchaseValidation;
  /** Can purchase? */
  canPurchase: boolean;
  /** Is purchasing? */
  isPurchasing: boolean;
  /** Error message */
  error: string | null;
  /** Initiate purchase */
  purchase: (tokenId: number) => Promise<PurchaseResult>;
}

export interface PurchaseResult {
  success: boolean;
  psbt?: string;
  error?: string;
}

// =============================================================================
// HOOK
// =============================================================================

export function useNFTSale(options: UseNFTSaleOptions = {}): UseNFTSaleReturn {
  const { buyerAddress, buyerBalance = 0n } = options;

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Price (fixed - no calculation needed)
  const price = useMemo(() => calculateNFTPrice(), []);

  // Validation
  const validation = useMemo(
    () =>
      validatePurchase({
        buyerAddress: buyerAddress || "",
        buyerBalance,
      }),
    [buyerAddress, buyerBalance],
  );

  // Can purchase?
  const canPurchase = !!(buyerAddress && validation.valid && !isPurchasing);

  /**
   * Purchase NFT
   */
  const purchase = useCallback(
    async (tokenId: number): Promise<PurchaseResult> => {
      const treasury = getTreasuryAddress();

      if (!treasury) {
        return { success: false, error: "Treasury not configured" };
      }

      if (!canPurchase) {
        return {
          success: false,
          error: validation.errors[0] || "Cannot purchase",
        };
      }

      setIsPurchasing(true);
      setError(null);

      try {
        // TODO: Implement PSBT creation
        // 1. Get buyer UTXOs (from MempoolClient)
        // 2. Create NFT spell (createNFTGenesisSpell)
        // 3. Build PSBT (TransactionBuilder)
        // 4. Return PSBT hex for wallet signing

        // For now, show what would happen:
        console.log("[NFT Purchase]", {
          tokenId,
          treasury,
          price: price.priceSats.toString(),
          buyer: buyerAddress,
        });

        return {
          success: false,
          error: "PSBT building coming soon - treasury configured",
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Purchase failed";
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsPurchasing(false);
      }
    },
    [canPurchase, validation, price, buyerAddress],
  );

  return {
    price,
    formattedPrice: price.displayPrice,
    validation,
    canPurchase,
    isPurchasing,
    error,
    purchase,
  };
}

// Legacy export for compatibility
export { useNFTSale as default };
