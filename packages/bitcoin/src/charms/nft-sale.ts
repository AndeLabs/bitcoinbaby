/**
 * NFT Sale System
 *
 * Handles pricing, payment validation, and sales tracking for Genesis Babies NFTs.
 * Price: $50 USD equivalent in BTC (fetched at time of purchase)
 */

import { GENESIS_BABIES_CONFIG, type RarityTier } from "./nft";

// =============================================================================
// SALE CONFIGURATION
// =============================================================================

/**
 * NFT Sale Configuration
 */
export const NFT_SALE_CONFIG = {
  /** Base price in USD */
  basePriceUSD: 50,

  /** Price multipliers by rarity (optional premium for guaranteed rarity) */
  rarityMultipliers: {
    common: 1.0, // $50
    uncommon: 1.2, // $60
    rare: 1.5, // $75
    epic: 2.0, // $100
    legendary: 3.0, // $150
    mythic: 5.0, // $250
  } as Record<RarityTier, number>,

  /** Whether to allow rarity selection (or random only) */
  allowRaritySelection: false,

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
    whitelist: { active: false, discount: 20 }, // 20% off for whitelist
    public: { active: true, discount: 0 },
  },
} as const;

// =============================================================================
// PRICE ORACLE
// =============================================================================

/**
 * BTC Price data from oracle
 */
export interface BTCPriceData {
  priceUSD: number;
  timestamp: number;
  source: string;
}

// Cache price for 60 seconds to avoid excessive API calls
let priceCache: BTCPriceData | null = null;
const PRICE_CACHE_TTL = 60_000; // 60 seconds

/**
 * Fetch current BTC price in USD
 * Uses CoinGecko API (free, no API key required)
 */
export async function getBTCPrice(): Promise<BTCPriceData> {
  // Check cache
  if (priceCache && Date.now() - priceCache.timestamp < PRICE_CACHE_TTL) {
    return priceCache;
  }

  try {
    // Primary: CoinGecko
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
      { headers: { Accept: "application/json" } },
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const price: BTCPriceData = {
      priceUSD: data.bitcoin.usd,
      timestamp: Date.now(),
      source: "coingecko",
    };

    priceCache = price;
    return price;
  } catch (error) {
    // Fallback: Use cached price if available (even if stale)
    if (priceCache) {
      console.warn("[PriceOracle] Using stale cache due to API error");
      return priceCache;
    }

    // Last resort: hardcoded fallback (should be updated periodically)
    console.error("[PriceOracle] All sources failed, using fallback");
    return {
      priceUSD: 95000, // Update this periodically as fallback
      timestamp: Date.now(),
      source: "fallback",
    };
  }
}

/**
 * Convert USD to satoshis
 */
export async function usdToSats(usdAmount: number): Promise<bigint> {
  const { priceUSD } = await getBTCPrice();
  const btcAmount = usdAmount / priceUSD;
  const sats = Math.ceil(btcAmount * 100_000_000);
  return BigInt(sats);
}

/**
 * Convert satoshis to USD
 */
export async function satsToUsd(sats: bigint): Promise<number> {
  const { priceUSD } = await getBTCPrice();
  const btcAmount = Number(sats) / 100_000_000;
  return btcAmount * priceUSD;
}

// =============================================================================
// SALE PRICE CALCULATION
// =============================================================================

/**
 * NFT Price breakdown
 */
export interface NFTPriceBreakdown {
  /** Base price in USD */
  basePriceUSD: number;
  /** Rarity multiplier applied */
  rarityMultiplier: number;
  /** Discount applied (whitelist, etc.) */
  discountPercent: number;
  /** Final price in USD */
  finalPriceUSD: number;
  /** Final price in satoshis */
  finalPriceSats: bigint;
  /** Platform fee in satoshis */
  platformFeeSats: bigint;
  /** Creator receives in satoshis */
  creatorReceivesSats: bigint;
  /** BTC price used for conversion */
  btcPriceUSD: number;
  /** Timestamp of price calculation */
  timestamp: number;
}

/**
 * Calculate NFT purchase price
 */
export async function calculateNFTPrice(options: {
  rarityTier?: RarityTier;
  isWhitelist?: boolean;
}): Promise<NFTPriceBreakdown> {
  const { rarityTier, isWhitelist = false } = options;

  // Get current BTC price
  const { priceUSD: btcPriceUSD, timestamp } = await getBTCPrice();

  // Base price
  let basePriceUSD = NFT_SALE_CONFIG.basePriceUSD;

  // Apply rarity multiplier if selecting specific rarity
  const rarityMultiplier =
    rarityTier && NFT_SALE_CONFIG.allowRaritySelection
      ? NFT_SALE_CONFIG.rarityMultipliers[rarityTier]
      : 1.0;

  // Apply discount
  const discountPercent =
    isWhitelist && NFT_SALE_CONFIG.phases.whitelist.active
      ? NFT_SALE_CONFIG.phases.whitelist.discount
      : 0;

  // Calculate final USD price
  const priceAfterMultiplier = basePriceUSD * rarityMultiplier;
  const finalPriceUSD = priceAfterMultiplier * (1 - discountPercent / 100);

  // Convert to satoshis
  const btcAmount = finalPriceUSD / btcPriceUSD;
  const finalPriceSats = BigInt(Math.ceil(btcAmount * 100_000_000));

  // Calculate platform fee
  const platformFeeSats =
    (finalPriceSats * BigInt(NFT_SALE_CONFIG.platformFeePercent)) / 100n;
  const creatorReceivesSats = finalPriceSats - platformFeeSats;

  return {
    basePriceUSD,
    rarityMultiplier,
    discountPercent,
    finalPriceUSD,
    finalPriceSats,
    platformFeeSats,
    creatorReceivesSats,
    btcPriceUSD,
    timestamp,
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
}

export async function validatePurchase(params: {
  buyerAddress: string;
  buyerBalance: bigint;
  tokenId?: number;
  mintedCount?: number;
}): Promise<PurchaseValidation> {
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

  // Calculate price and check balance
  const price = await calculateNFTPrice({});
  const totalNeeded = price.finalPriceSats + NFT_SALE_CONFIG.dustLimit;

  if (params.buyerBalance < totalNeeded) {
    errors.push(
      `Insufficient balance. Need ${totalNeeded} sats, have ${params.buyerBalance} sats`,
    );
  }

  // Warnings
  if (mintedCount > NFT_SALE_CONFIG.maxSupply * 0.9) {
    warnings.push(
      `Only ${NFT_SALE_CONFIG.maxSupply - mintedCount} NFTs remaining!`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
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
