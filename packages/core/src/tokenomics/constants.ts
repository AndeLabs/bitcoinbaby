/**
 * $BABY Tokenomics Constants
 *
 * Simple, minimalist tokenomics:
 * - Mine to earn
 * - Burns happen automatically on actions
 * - Halvings every ~4 years
 */

// =============================================================================
// SUPPLY
// =============================================================================

/** Total supply: 21 Billion (like Bitcoin x1000) */
export const TOTAL_SUPPLY = BigInt(21_000_000_000);

/** Decimals (same as Bitcoin) */
export const DECIMALS = 8;

/** Base unit (satoshi equivalent) */
export const BASE_UNIT = BigInt(10 ** DECIMALS);

// =============================================================================
// MINING REWARDS
// =============================================================================

/** Base reward per share at difficulty 16 */
export const BASE_REWARD_PER_SHARE = BigInt(1000);

/** Minimum mining difficulty */
export const MIN_DIFFICULTY = 16;

/** Halving interval in Bitcoin blocks (~4 years) */
export const HALVING_BLOCKS = 210_000;

/**
 * Calculate reward for a share at given difficulty
 * Each +1 difficulty above 16 doubles the reward
 */
export function calculateShareReward(difficulty: number): bigint {
  if (difficulty <= MIN_DIFFICULTY) {
    return BASE_REWARD_PER_SHARE;
  }
  const extraDifficulty = BigInt(difficulty - MIN_DIFFICULTY);
  return BASE_REWARD_PER_SHARE * BigInt(2) ** extraDifficulty;
}

// =============================================================================
// BURNS (Automatic, invisible to user)
// =============================================================================

/** Burn rate on withdrawals to Bitcoin (5%) */
export const WITHDRAW_BURN_RATE = 5; // percent

/** Calculate burn amount for withdrawal */
export function calculateWithdrawBurn(amount: bigint): {
  burnAmount: bigint;
  netAmount: bigint;
} {
  const burnAmount = (amount * BigInt(WITHDRAW_BURN_RATE)) / BigInt(100);
  const netAmount = amount - burnAmount;
  return { burnAmount, netAmount };
}

// =============================================================================
// DISTRIBUTION
// =============================================================================

/** Mining reward distribution */
export const DISTRIBUTION = {
  miner: 70, // 70% to miner
  dev: 20, // 20% to development
  staking: 10, // 10% to staking pool (future)
} as const;

// =============================================================================
// NFT & EVOLUTION COSTS
// =============================================================================
// Note: EVOLUTION_COSTS is defined in ../types.ts (re-exported from nft-config)
// These are additional tokenomics-specific costs

/** NFT minting costs by rarity in $BABY (burned on mint) */
export const NFT_MINT_BURN_COSTS = {
  common: BigInt(1_000),
  uncommon: BigInt(5_000),
  rare: BigInt(25_000),
  epic: BigInt(100_000),
  legendary: BigInt(500_000),
  mythic: BigInt(2_500_000),
} as const;

// =============================================================================
// SUMMARY
// =============================================================================

/**
 * Simple tokenomics for users:
 *
 * EARNING:
 * - Mine shares to earn BABY
 * - 1,000 BABY per share at D16
 * - Higher difficulty = more reward
 *
 * BURNING (automatic):
 * - 5% on withdraw to Bitcoin
 * - 100% when buying NFTs
 * - 100% when evolving Baby
 *
 * RESULT:
 * - More activity = more burns
 * - Supply decreases over time
 * - Early miners benefit most
 */
