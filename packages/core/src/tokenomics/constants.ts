/**
 * $BABY Tokenomics Constants
 *
 * HYBRID ARCHITECTURE (Professional & Secure)
 * ============================================
 *
 * Layer 1: Virtual Balance (Off-chain, Cloudflare Workers)
 * - Fast mining rewards (no BTC fees)
 * - Generous rewards for engagement
 * - Burns on actions (free)
 * - Rate-limited and validated
 * - Backed by total supply tracking
 *
 * Layer 2: Batch Withdrawals (Secure bridge to Bitcoin)
 * - Admin-processed in batches (lower fees)
 * - 5% burn on withdrawal (deflationary)
 * - Verified against virtual balance
 * - Creates real Bitcoin transactions
 *
 * Layer 3: On-chain Contract (Full validation)
 * - For direct on-chain mining (power users)
 * - Validates PoW, Merkle proofs, difficulty
 * - Distribution enforced: 70/20/10
 *
 * SECURITY MODEL:
 * - Virtual balance = trusted system (rate-limited)
 * - Withdrawals = verified + burned
 * - On-chain = trustless validation
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
// MINING REWARDS (BALANCED FOR SUSTAINABILITY)
// =============================================================================

/**
 * Base reward per share at minimum difficulty
 *
 * BALANCING PHILOSOPHY:
 * - Target: MILES por dia, no cientos de miles
 * - If successful: Many miners sharing emission
 * - If few miners: Prevent instant whales
 *
 * 100 $BABY base = Very sustainable long-term
 */
export const BASE_REWARD_PER_SHARE = BigInt(100);

/**
 * Minimum mining difficulty
 * Increased to D22 for very sustainable emission rate
 *
 * D22 = ~10 shares/hour for GPU (vs 700 at D16)
 * Shares are hard to find = very valuable
 */
export const MIN_DIFFICULTY = 22;

/** Halving interval in Bitcoin blocks (~4 years) */
export const HALVING_BLOCKS = 210_000;

/**
 * Global daily emission cap (SOFT - just for monitoring)
 * The difficulty naturally limits emission, no hard cap needed
 *
 * This is just a reference number, not enforced
 */
export const GLOBAL_DAILY_EMISSION_CAP = BigInt(100_000_000); // 100M soft reference

/**
 * Calculate reward for a share at given difficulty
 * Each +1 difficulty above MIN doubles the reward
 *
 * D22 = 100 $BABY (base)
 * D23 = 200 $BABY
 * D24 = 400 $BABY
 * D26 = 1,600 $BABY
 */
export function calculateShareReward(difficulty: number): bigint {
  if (difficulty <= MIN_DIFFICULTY) {
    return BASE_REWARD_PER_SHARE;
  }
  const extraDifficulty = BigInt(difficulty - MIN_DIFFICULTY);
  return BASE_REWARD_PER_SHARE * BigInt(2) ** extraDifficulty;
}

// =============================================================================
// STREAK BONUS SYSTEM
// =============================================================================

/**
 * Streak bonus: The longer you mine continuously, the more you earn
 * Resets if you stop mining for 30 minutes
 *
 * This REWARDS dedication instead of punishing it
 */
export const STREAK_BONUSES = {
  /** Shares needed to reach each tier */
  tiers: [10, 50, 100, 250, 500] as const,
  /** Multiplier for each tier (1.0 = 100% = base reward) */
  multipliers: [1.0, 1.2, 1.5, 1.75, 1.9, 2.0] as const,
  /** Time in ms before streak resets (30 minutes) */
  resetTimeMs: 30 * 60 * 1000,
} as const;

/**
 * Calculate streak multiplier based on consecutive shares
 *
 * 0-9 shares:    1.0x (base)
 * 10-49 shares:  1.2x (+20%)
 * 50-99 shares:  1.5x (+50%)
 * 100-249:       1.75x (+75%)
 * 250-499:       1.9x (+90%)
 * 500+:          2.0x (+100%) MAX
 */
export function getStreakMultiplier(consecutiveShares: number): number {
  const { tiers, multipliers } = STREAK_BONUSES;

  for (let i = tiers.length - 1; i >= 0; i--) {
    if (consecutiveShares >= tiers[i]) {
      return multipliers[i + 1];
    }
  }
  return multipliers[0]; // Base multiplier
}

/**
 * Calculate reward with streak bonus
 */
export function calculateRewardWithStreak(
  difficulty: number,
  consecutiveShares: number,
): bigint {
  const baseReward = calculateShareReward(difficulty);
  const streakMultiplier = getStreakMultiplier(consecutiveShares);
  return BigInt(Math.floor(Number(baseReward) * streakMultiplier));
}

// =============================================================================
// ADAPTIVE EMISSION (Simple)
// =============================================================================

/**
 * Emission multipliers based on network activity
 * Applied OFF-CHAIN in Workers (no BTC fees)
 */
export const EMISSION_MULTIPLIERS = {
  /** Boost when many miners active (engagement reward) */
  highActivity: 1.5, // +50%
  /** Normal emission */
  normal: 1.0,
  /** Reduced when low activity (conservation) */
  lowActivity: 0.75, // -25%
} as const;

/** Thresholds for emission adjustment */
export const EMISSION_THRESHOLDS = {
  /** Active miners in last hour for "high activity" */
  highActivityMiners: 100,
  /** Active miners in last hour for "low activity" */
  lowActivityMiners: 10,
} as const;

/**
 * Calculate emission multiplier based on active miners
 */
export function getEmissionMultiplier(activeMiners: number): number {
  if (activeMiners >= EMISSION_THRESHOLDS.highActivityMiners) {
    return EMISSION_MULTIPLIERS.highActivity;
  }
  if (activeMiners <= EMISSION_THRESHOLDS.lowActivityMiners) {
    return EMISSION_MULTIPLIERS.lowActivity;
  }
  return EMISSION_MULTIPLIERS.normal;
}

/**
 * Calculate final reward with all multipliers
 */
export function calculateFinalReward(
  difficulty: number,
  activeMiners: number,
  nftBoostPercent: number = 0,
): bigint {
  const baseReward = calculateShareReward(difficulty);
  const emissionMultiplier = getEmissionMultiplier(activeMiners);
  const nftMultiplier = 1 + nftBoostPercent / 100;
  const totalMultiplier = emissionMultiplier * nftMultiplier;

  return BigInt(Math.floor(Number(baseReward) * totalMultiplier));
}

// =============================================================================
// BURNS (Automatic, invisible to user)
// =============================================================================

/**
 * NO burn on withdrawals - users get 100% of their tokens
 * Burns happen on VALUE actions instead:
 * - NFT purchases
 * - Baby evolution
 * - Premium features (names, skins, boosts)
 */
export const WITHDRAW_BURN_RATE = 0; // No burn on withdraw

/** Calculate withdrawal (no burn) */
export function calculateWithdrawBurn(amount: bigint): {
  burnAmount: bigint;
  netAmount: bigint;
} {
  return { burnAmount: BigInt(0), netAmount: amount };
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
// PREMIUM FEATURES (Burns that give VALUE)
// =============================================================================

/** Premium features - user pays, gets value, tokens burned */
export const PREMIUM_BURN_COSTS = {
  /** Custom name for Baby */
  customName: BigInt(5_000),
  /** Special skin/color */
  customSkin: BigInt(10_000),
  /** Mining boost +50% for 1 hour */
  miningBoost1h: BigInt(2_500),
  /** Mining boost +50% for 24 hours */
  miningBoost24h: BigInt(25_000),
  /** Revive dead Baby (skip penalty) */
  reviveBaby: BigInt(50_000),
  /** Reset Baby stats (respec) */
  resetStats: BigInt(15_000),
} as const;

export type PremiumFeature = keyof typeof PREMIUM_BURN_COSTS;

// =============================================================================
// SECURITY & RATE LIMITS (BALANCED)
// =============================================================================

/**
 * Maximum shares per hour per address
 * At D20, GPU finds ~40 shares/hour max anyway
 * This is a safety cap, not the limiter
 */
export const MAX_SHARES_PER_HOUR = 50;

/** Maximum reward per share (cap to prevent exploits) */
export const MAX_REWARD_PER_SHARE = BigInt(10_000); // 10K max (with all bonuses)

/** Minimum time between shares in ms (anti-spam) */
export const MIN_SHARE_INTERVAL_MS = 1000; // 1 second

/**
 * Maximum daily emission per address (NO HARD LIMIT)
 * La dificultad controla la emision naturalmente
 * Si quieren minar todo el dia, que sigan minando!
 *
 * Este valor es solo referencia, no se fuerza
 */
export const MAX_DAILY_EMISSION_PER_ADDRESS = BigInt(1_000_000_000); // No real limit

/** Minimum withdrawal amount */
export const MIN_WITHDRAWAL = BigInt(10_000); // 10K minimum

/** Maximum withdrawal per transaction */
export const MAX_WITHDRAWAL = BigInt(10_000_000); // 10M max

/**
 * Validate share submission (security check)
 */
export function validateShareSubmission(params: {
  sharesThisHour: number;
  lastShareTime: number;
  difficulty: number;
}): { valid: boolean; reason?: string } {
  const now = Date.now();

  // Rate limit: max shares per hour
  if (params.sharesThisHour >= MAX_SHARES_PER_HOUR) {
    return { valid: false, reason: "Rate limit: max shares per hour exceeded" };
  }

  // Anti-spam: minimum interval
  if (now - params.lastShareTime < MIN_SHARE_INTERVAL_MS) {
    return { valid: false, reason: "Too fast: wait between submissions" };
  }

  // Difficulty check
  if (params.difficulty < MIN_DIFFICULTY) {
    return { valid: false, reason: "Difficulty too low" };
  }

  return { valid: true };
}

/**
 * Validate withdrawal request (security check)
 */
export function validateWithdrawal(params: {
  amount: bigint;
  balance: bigint;
}): { valid: boolean; reason?: string } {
  if (params.amount < MIN_WITHDRAWAL) {
    return { valid: false, reason: `Minimum withdrawal: ${MIN_WITHDRAWAL}` };
  }

  if (params.amount > MAX_WITHDRAWAL) {
    return { valid: false, reason: `Maximum withdrawal: ${MAX_WITHDRAWAL}` };
  }

  if (params.amount > params.balance) {
    return { valid: false, reason: "Insufficient balance" };
  }

  return { valid: true };
}

// =============================================================================
// SUMMARY
// =============================================================================

/**
 * SUSTAINABLE TOKENOMICS SUMMARY (NO HARD LIMITS)
 *
 * FILOSOFIA:
 * - Ganancias naturales: MILES por dia (no cientos de miles)
 * - SIN LIMITES: Si quieren minar 24/7, que sigan!
 * - La DIFICULTAD controla la emision, no caps artificiales
 *
 * FOR USERS:
 * - Mine → Get $BABY (100 per share at D22)
 * - Higher difficulty → 2x reward per level
 * - Streak bonus → Up to 2x for continuous mining
 * - NO LIMITS → Mina todo lo que quieras
 * - Withdraw → 100% goes to Bitcoin (NO penalty)
 *
 * STREAK SYSTEM (Rewards dedication):
 * - 0-9 shares:    100 $BABY (base)
 * - 10-49 shares:  120 $BABY (+20%)
 * - 50-99 shares:  150 $BABY (+50%)
 * - 100-249:       175 $BABY (+75%)
 * - 250-499:       190 $BABY (+90%)
 * - 500+:          200 $BABY (+100%) MAX
 *
 * EXPECTED EARNINGS (D22, natural - no limits):
 * - Phone:   ~10-100 $BABY/day
 * - Laptop:  ~100-1,000 $BABY/day
 * - Desktop: ~500-3,000 $BABY/day
 * - GPU:     ~2,000-15,000 $BABY/day (with streak)
 *
 * CONTROL NATURAL:
 * - D22 = shares muy dificiles de encontrar
 * - GPU: ~10 shares/hora (no 700 como en D16)
 * - Esto NATURALMENTE limita ganancias a miles
 * - Sin necesidad de caps artificiales
 *
 * BURNS (Give VALUE, not penalty):
 * - NFTs, Evolution, Premium features
 *
 * RESULT:
 * - Mineria libre sin restricciones
 * - Ganancias naturalmente en miles
 * - Streak recompensa dedicacion
 * - Muy sostenible a largo plazo
 */
