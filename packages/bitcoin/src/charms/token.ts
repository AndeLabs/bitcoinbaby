/**
 * $BABTC Token Types
 *
 * Token configuration and types for the BitcoinBaby fungible token.
 * Distributed via Proof-of-Useful-Work mining.
 */

import type { SpellV2, AppType } from "./types";

// =============================================================================
// TOKEN CONFIGURATION
// =============================================================================

/**
 * $BABTC Token Configuration
 * These values are IMMUTABLE once deployed
 */
export const BABTC_CONFIG = {
  ticker: "BABTC",
  name: "BitcoinBaby",
  decimals: 8,
  maxSupply: 21_000_000_000n * 100_000_000n, // 21B with 8 decimals
  appType: "t" as AppType,

  // Distribution (per mint)
  distribution: {
    miner: 70, // 70% to miner
    dev: 20, // 20% to dev fund
    staking: 10, // 10% to staking pool
  },

  // Halving schedule (synced with Bitcoin)
  halving: {
    blocksPerEpoch: 210_000,
    initialReward: 500n * 100_000_000n, // 500 BABTC per block
  },

  // Addresses - Configured via environment variables
  // IMPORTANT: These MUST be set before mainnet deployment
  addresses: {
    // Development fund address (20% of mined tokens)
    devFund:
      process.env.NEXT_PUBLIC_DEV_FUND_ADDRESS ||
      process.env.DEV_FUND_ADDRESS ||
      "tb1q_configure_dev_fund_address", // Testnet4 placeholder

    // Staking pool address (10% of mined tokens)
    stakingPool:
      process.env.NEXT_PUBLIC_STAKING_POOL_ADDRESS ||
      process.env.STAKING_POOL_ADDRESS ||
      "tb1q_configure_staking_pool_address", // Testnet4 placeholder
  },
} as const;

// =============================================================================
// TOKEN TYPES
// =============================================================================

/**
 * Token metadata for Charms Explorer
 */
export interface BABTCMetadata {
  decimals: number;
  description: string;
  image: string;
  name: string;
  supply_limit: number;
  ticker: string;
  url: string;
}

/**
 * Default metadata for $BABTC
 */
export const BABTC_METADATA: BABTCMetadata = {
  decimals: 8,
  description:
    "Proof-of-Useful-Work token. Mine by training AI, raise your BitcoinBaby, earn $BABTC.",
  image: "data:image/png;base64,", // TODO: Add pixel art logo
  name: "BitcoinBaby",
  supply_limit: 21_000_000_000,
  ticker: "BABTC",
  url: "https://bitcoinbaby.dev",
};

/**
 * Token balance with formatted values
 */
export interface TokenBalance {
  raw: bigint;
  formatted: string;
  decimals: number;
}

/**
 * Mining reward calculation result
 */
export interface MiningReward {
  total: bigint;
  minerShare: bigint;
  devShare: bigint;
  stakingShare: bigint;
  epoch: number;
  blockHeight: number;
}

// =============================================================================
// REWARD CALCULATION
// =============================================================================

/**
 * Calculate current epoch based on block height
 */
export function getCurrentEpoch(blockHeight: number): number {
  return Math.floor(blockHeight / BABTC_CONFIG.halving.blocksPerEpoch);
}

/**
 * Calculate block reward for a given block height
 * Halving every 210,000 blocks (synced with Bitcoin)
 */
export function calculateBlockReward(blockHeight: number): bigint {
  const epoch = getCurrentEpoch(blockHeight);
  const { initialReward } = BABTC_CONFIG.halving;

  // Halving: divide by 2^epoch
  return initialReward >> BigInt(epoch);
}

/**
 * Calculate mining reward with distribution
 */
export function calculateMiningReward(blockHeight: number): MiningReward {
  const total = calculateBlockReward(blockHeight);
  const { miner, dev, staking } = BABTC_CONFIG.distribution;

  return {
    total,
    minerShare: (total * BigInt(miner)) / 100n,
    devShare: (total * BigInt(dev)) / 100n,
    stakingShare: (total * BigInt(staking)) / 100n,
    epoch: getCurrentEpoch(blockHeight),
    blockHeight,
  };
}

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(
  amount: bigint,
  decimals: number = BABTC_CONFIG.decimals,
): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;

  const fractionStr = fraction.toString().padStart(decimals, "0");
  // Remove trailing zeros but keep at least 2 decimal places
  const trimmedFraction = fractionStr.replace(/0+$/, "").padEnd(2, "0");

  return `${whole}.${trimmedFraction}`;
}

/**
 * Parse token amount from string
 */
export function parseTokenAmount(
  amount: string,
  decimals: number = BABTC_CONFIG.decimals,
): bigint {
  const [whole, fraction = ""] = amount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole + paddedFraction);
}

// =============================================================================
// SPELL GENERATION
// =============================================================================

/**
 * Token mint spell parameters
 */
export interface TokenMintParams {
  appId: string;
  appVk: string;
  minerAddress: string;
  devAddress: string;
  stakingAddress: string;
  blockHeight: number;
  workProofHash: string;
}

/**
 * Generate a token mint spell
 */
export function createTokenMintSpell(params: TokenMintParams): SpellV2 {
  const reward = calculateMiningReward(params.blockHeight);
  const appRef = `t/${params.appId}/${params.appVk}`;

  return {
    version: 2,
    apps: {
      $00: appRef,
    },
    public_inputs: {
      work_proof: params.workProofHash,
      block_height: params.blockHeight,
    },
    ins: [], // Mint from nothing (controlled by NFT supply tracker)
    outs: [
      {
        address: params.minerAddress,
        charms: {
          $00: Number(reward.minerShare),
        },
        sats: 546,
      },
      {
        address: params.devAddress,
        charms: {
          $00: Number(reward.devShare),
        },
        sats: 546,
      },
      {
        address: params.stakingAddress,
        charms: {
          $00: Number(reward.stakingShare),
        },
        sats: 546,
      },
    ],
  };
}

/**
 * Token transfer spell parameters
 */
export interface TokenTransferParams {
  appId: string;
  appVk: string;
  fromUtxo: { txid: string; vout: number };
  fromAmount: bigint;
  toAddress: string;
  toAmount: bigint;
  changeAddress: string;
}

/**
 * Generate a token transfer spell
 */
export function createTokenTransferSpell(params: TokenTransferParams): SpellV2 {
  const appRef = `t/${params.appId}/${params.appVk}`;
  const changeAmount = params.fromAmount - params.toAmount;

  const outs: SpellV2["outs"] = [
    {
      address: params.toAddress,
      charms: {
        $00: Number(params.toAmount),
      },
      sats: 546,
    },
  ];

  // Add change output if needed
  if (changeAmount > 0n) {
    outs.push({
      address: params.changeAddress,
      charms: {
        $00: Number(changeAmount),
      },
      sats: 546,
    });
  }

  return {
    version: 2,
    apps: {
      $00: appRef,
    },
    ins: [
      {
        utxo_id: `${params.fromUtxo.txid}:${params.fromUtxo.vout}`,
        charms: {
          $00: Number(params.fromAmount),
        },
      },
    ],
    outs,
  };
}
