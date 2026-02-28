/**
 * NFT Sale System
 *
 * Handles pricing, payment validation, and sales tracking for Genesis Babies NFTs.
 * Price: FIXED in Bitcoin (satoshis) - does not fluctuate with USD
 *
 * Current price: 50,000 sats (~€50 at time of setting)
 * This ensures stable pricing for Bitcoin users.
 */

import { GENESIS_BABIES_CONFIG, type RarityTier } from "./nft";

// =============================================================================
// SALE CONFIGURATION
// =============================================================================

/**
 * NFT Sale Configuration
 *
 * IMPORTANT: Price is FIXED in satoshis, not USD.
 * This provides price stability for Bitcoin users.
 */
export const NFT_SALE_CONFIG = {
  /** Base price in SATOSHIS (fixed, does not change with USD) */
  basePriceSats: 50_000n, // 50,000 sats = 0.0005 BTC (~€50 at ~€100k/BTC)

  /** Alternative prices for different tiers (all in sats) */
  tierPrices: {
    standard: 50_000n, // 0.0005 BTC - Random rarity
    premium: 100_000n, // 0.001 BTC - Guaranteed rare+
    legendary: 250_000n, // 0.0025 BTC - Guaranteed legendary+
  } as const,

  /** Rarity guaranteed by tier */
  tierGuarantees: {
    standard: null, // Random based on weights
    premium: "rare" as RarityTier, // Rare or better
    legendary: "legendary" as RarityTier, // Legendary or better
  } as const,

  /** Whether premium tiers are available */
  premiumTiersEnabled: false, // Set to true to enable premium purchases

  /** Dust limit for NFT UTXO */
  dustLimit: 546n,

  /** Platform fee percentage (5%) */
  platformFeePercent: 5,

  /** Creator treasury address (receives sales) */
  treasuryAddress: "", // Set at runtime

  /** Max supply from config */
  maxSupply: GENESIS_BABIES_CONFIG.maxSupply,

  /** Sale phases */
  phases: {
    whitelist: { active: false, discountPercent: 20 }, // 20% off = 40,000 sats
    public: { active: true, discountPercent: 0 },
  },
} as const;

// =============================================================================
// PRICE UTILITIES (Fixed BTC pricing - no USD conversion needed)
// =============================================================================

/**
 * Price tier for NFT purchase
 */
export type PriceTier = "standard" | "premium" | "legendary";

/**
 * Format satoshis for display
 */
export function formatSatsPrice(sats: bigint): string {
  const btc = Number(sats) / 100_000_000;
  if (btc >= 0.001) {
    return `${btc.toFixed(4)} BTC`;
  }
  return `${sats.toLocaleString()} sats`;
}

/**
 * Get price for a specific tier
 */
export function getTierPrice(tier: PriceTier): bigint {
  return NFT_SALE_CONFIG.tierPrices[tier];
}

/**
 * Get guaranteed minimum rarity for a tier
 */
export function getTierGuarantee(tier: PriceTier): RarityTier | null {
  return NFT_SALE_CONFIG.tierGuarantees[tier];
}

// =============================================================================
// SALE PRICE CALCULATION (Fixed BTC pricing)
// =============================================================================

/**
 * NFT Price breakdown
 * All prices are FIXED in satoshis - no USD conversion
 */
export interface NFTPriceBreakdown {
  /** Selected price tier */
  tier: PriceTier;
  /** Base price in satoshis */
  basePriceSats: bigint;
  /** Discount applied (whitelist, etc.) */
  discountPercent: number;
  /** Final price in satoshis */
  finalPriceSats: bigint;
  /** Platform fee in satoshis */
  platformFeeSats: bigint;
  /** Creator receives in satoshis */
  creatorReceivesSats: bigint;
  /** Guaranteed minimum rarity (if premium tier) */
  guaranteedRarity: RarityTier | null;
  /** Formatted price for display */
  displayPrice: string;
  /** Timestamp of calculation */
  timestamp: number;
}

/**
 * Calculate NFT purchase price
 * Uses FIXED satoshi pricing - no USD fluctuation
 */
export function calculateNFTPrice(options: {
  tier?: PriceTier;
  isWhitelist?: boolean;
}): NFTPriceBreakdown {
  const { tier = "standard", isWhitelist = false } = options;

  // Get base price for tier (fixed in sats)
  const basePriceSats = NFT_SALE_CONFIG.tierPrices[tier];

  // Apply whitelist discount if applicable
  const discountPercent =
    isWhitelist && NFT_SALE_CONFIG.phases.whitelist.active
      ? NFT_SALE_CONFIG.phases.whitelist.discountPercent
      : 0;

  // Calculate final price
  const discountAmount = (basePriceSats * BigInt(discountPercent)) / 100n;
  const finalPriceSats = basePriceSats - discountAmount;

  // Calculate platform fee
  const platformFeeSats =
    (finalPriceSats * BigInt(NFT_SALE_CONFIG.platformFeePercent)) / 100n;
  const creatorReceivesSats = finalPriceSats - platformFeeSats;

  // Get guaranteed rarity for tier
  const guaranteedRarity = NFT_SALE_CONFIG.tierGuarantees[tier];

  return {
    tier,
    basePriceSats,
    discountPercent,
    finalPriceSats,
    platformFeeSats,
    creatorReceivesSats,
    guaranteedRarity,
    displayPrice: formatSatsPrice(finalPriceSats),
    timestamp: Date.now(),
  };
}

// =============================================================================
// SALE VALIDATION
// =============================================================================

/**
 * Validate a purchase request
 */
export interface PurchaseValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  priceBreakdown: NFTPriceBreakdown | null;
}

export function validatePurchase(params: {
  buyerAddress: string;
  buyerBalance: bigint;
  tier?: PriceTier;
  mintedCount?: number;
  isWhitelist?: boolean;
}): PurchaseValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate address format
  if (!params.buyerAddress || params.buyerAddress.length < 26) {
    errors.push("Invalid buyer address");
  }

  // Check supply
  const mintedCount = params.mintedCount ?? 0;
  if (mintedCount >= NFT_SALE_CONFIG.maxSupply) {
    errors.push("All NFTs have been minted (max supply reached)");
  }

  // Check premium tier availability
  const tier = params.tier ?? "standard";
  if (tier !== "standard" && !NFT_SALE_CONFIG.premiumTiersEnabled) {
    errors.push("Premium tiers are not available yet");
  }

  // Calculate price (no async needed - fixed sats)
  const price = calculateNFTPrice({
    tier,
    isWhitelist: params.isWhitelist,
  });

  // Check balance (price + dust for NFT UTXO + estimated fee)
  const estimatedFee = 2000n; // ~2000 sats for typical tx
  const totalNeeded =
    price.finalPriceSats + NFT_SALE_CONFIG.dustLimit + estimatedFee;

  if (params.buyerBalance < totalNeeded) {
    errors.push(
      `Insufficient balance. Need ${formatSatsPrice(totalNeeded)}, have ${formatSatsPrice(params.buyerBalance)}`,
    );
  }

  // Warnings
  if (mintedCount > NFT_SALE_CONFIG.maxSupply * 0.9) {
    warnings.push(
      `Only ${NFT_SALE_CONFIG.maxSupply - mintedCount} NFTs remaining!`,
    );
  }

  if (params.buyerBalance < totalNeeded * 2n) {
    warnings.push(
      "Low balance - consider adding more BTC for future purchases",
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    priceBreakdown: errors.length === 0 ? price : null,
  };
}

// =============================================================================
// SALE TRANSACTION BUILDER
// =============================================================================

/**
 * Parameters for creating an NFT purchase transaction
 */
export interface NFTPurchaseParams {
  /** Buyer's Bitcoin address */
  buyerAddress: string;
  /** Buyer's UTXOs for payment */
  buyerUtxos: Array<{
    txid: string;
    vout: number;
    value: bigint;
  }>;
  /** Treasury address to receive payment */
  treasuryAddress: string;
  /** Price breakdown */
  price: NFTPriceBreakdown;
  /** NFT token ID */
  tokenId: number;
  /** Network fee rate (sats/vB) */
  feeRate?: number;
}

/**
 * Output structure for purchase transaction
 */
export interface NFTPurchaseOutputs {
  /** Payment to treasury */
  treasuryOutput: {
    address: string;
    value: bigint;
  };
  /** NFT output to buyer (with charm) */
  nftOutput: {
    address: string;
    value: bigint; // dust limit
  };
  /** Change output to buyer (if any) */
  changeOutput?: {
    address: string;
    value: bigint;
  };
}

/**
 * Calculate transaction outputs for NFT purchase
 */
export function calculatePurchaseOutputs(
  params: NFTPurchaseParams,
): NFTPurchaseOutputs {
  const totalInput = params.buyerUtxos.reduce(
    (sum, utxo) => sum + utxo.value,
    0n,
  );

  // Estimate tx size for fee calculation (rough: 1 input, 3 outputs)
  const estimatedVsize = 250;
  const feeRate = params.feeRate ?? 10;
  const fee = BigInt(estimatedVsize * feeRate);

  // Calculate change
  const totalSpent =
    params.price.finalPriceSats + NFT_SALE_CONFIG.dustLimit + fee;
  const change = totalInput - totalSpent;

  const outputs: NFTPurchaseOutputs = {
    treasuryOutput: {
      address: params.treasuryAddress,
      value: params.price.creatorReceivesSats,
    },
    nftOutput: {
      address: params.buyerAddress,
      value: NFT_SALE_CONFIG.dustLimit,
    },
  };

  // Only add change if above dust
  if (change > NFT_SALE_CONFIG.dustLimit) {
    outputs.changeOutput = {
      address: params.buyerAddress,
      value: change,
    };
  }

  return outputs;
}

// =============================================================================
// SALES TRACKING
// =============================================================================

/**
 * Sale record for tracking
 */
export interface NFTSaleRecord {
  tokenId: number;
  buyerAddress: string;
  priceSats: bigint;
  priceUSD: number;
  btcPriceUSD: number;
  txid: string;
  blockHeight?: number;
  timestamp: number;
  rarityTier: RarityTier;
}

/**
 * Sales statistics
 */
export interface SalesStats {
  totalMinted: number;
  totalRevenueSats: bigint;
  totalRevenueUSD: number;
  rarityDistribution: Record<RarityTier, number>;
  averagePriceUSD: number;
}

/**
 * Calculate sales statistics from records
 */
export function calculateSalesStats(sales: NFTSaleRecord[]): SalesStats {
  const stats: SalesStats = {
    totalMinted: sales.length,
    totalRevenueSats: 0n,
    totalRevenueUSD: 0,
    rarityDistribution: {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    },
    averagePriceUSD: 0,
  };

  for (const sale of sales) {
    stats.totalRevenueSats += sale.priceSats;
    stats.totalRevenueUSD += sale.priceUSD;
    stats.rarityDistribution[sale.rarityTier]++;
  }

  if (sales.length > 0) {
    stats.averagePriceUSD = stats.totalRevenueUSD / sales.length;
  }

  return stats;
}

// =============================================================================
// EXPORTS
// =============================================================================

export { GENESIS_BABIES_CONFIG };
