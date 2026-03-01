/**
 * Mining Proof Validation
 *
 * SECURITY: Server-side validation of mining proofs.
 * Never trust client-provided data.
 */

// =============================================================================
// CONSTANTS (must match packages/core/src/tokenomics/constants.ts)
// =============================================================================

/** Minimum difficulty (D22 for sustainable emission) */
export const MIN_DIFFICULTY = 22;

/** Maximum difficulty (reasonable cap to prevent overflow) */
export const MAX_DIFFICULTY = 32;

/** Base reward per share at minimum difficulty */
export const BASE_REWARD_PER_SHARE = BigInt(100);

/** Maximum shares per hour per address
 * Safety cap to prevent abuse. WebGPU miners can find many shares quickly.
 * This allows reasonable mining while preventing spam.
 */
export const MAX_SHARES_PER_HOUR = 1000;

/** Minimum time between shares in ms */
export const MIN_SHARE_INTERVAL_MS = 1000;

/** Maximum proof age in ms (5 minutes) */
export const MAX_PROOF_AGE_MS = 5 * 60 * 1000;

/** Streak reset time (30 minutes) */
export const STREAK_RESET_MS = 30 * 60 * 1000;

// =============================================================================
// PROOF VALIDATION
// =============================================================================

export interface MiningProofInput {
  hash: string;
  nonce: number;
  difficulty: number;
  blockData: string;
  timestamp?: number;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  calculatedReward?: bigint;
}

/**
 * Validate mining proof cryptographically
 *
 * SECURITY: This is the core validation that prevents fake proofs
 */
export async function validateMiningProof(
  proof: MiningProofInput,
): Promise<ValidationResult> {
  // 1. Check required fields
  if (!proof.hash || typeof proof.nonce !== "number" || !proof.blockData) {
    return { valid: false, reason: "Missing required proof fields" };
  }

  // 2. Validate difficulty range
  if (proof.difficulty < MIN_DIFFICULTY) {
    return {
      valid: false,
      reason: `Difficulty too low. Minimum: ${MIN_DIFFICULTY}`,
    };
  }

  if (proof.difficulty > MAX_DIFFICULTY) {
    return {
      valid: false,
      reason: `Difficulty too high. Maximum: ${MAX_DIFFICULTY}`,
    };
  }

  // 3. Validate proof timestamp (if provided)
  if (proof.timestamp) {
    const age = Date.now() - proof.timestamp;
    if (age < 0 || age > MAX_PROOF_AGE_MS) {
      return { valid: false, reason: "Proof timestamp too old or in future" };
    }
  }

  // 4. Recalculate hash = double SHA256(blockData)
  // NOTE: blockData already includes the nonce (format: block:address:nonce)
  // The miner uses double SHA256 (Bitcoin standard hash256)
  const calculatedHash = await hash256Hex(proof.blockData);

  // 5. Verify hash matches (case-insensitive)
  if (calculatedHash.toLowerCase() !== proof.hash.toLowerCase()) {
    return {
      valid: false,
      reason: "Hash mismatch: proof does not match blockData + nonce",
    };
  }

  // 6. Verify hash meets difficulty (count leading zero bits)
  const leadingZeros = countLeadingZeroBits(calculatedHash);
  if (leadingZeros < proof.difficulty) {
    return {
      valid: false,
      reason: `Hash does not meet difficulty. Required: ${proof.difficulty}, Got: ${leadingZeros}`,
    };
  }

  // 7. Calculate reward server-side (NEVER trust client)
  const calculatedReward = calculateShareReward(proof.difficulty);

  return {
    valid: true,
    calculatedReward,
  };
}

// =============================================================================
// RATE LIMITING
// =============================================================================

export interface RateLimitCheck {
  sharesThisHour: number;
  lastShareTime: number;
}

export function checkRateLimit(check: RateLimitCheck): ValidationResult {
  const now = Date.now();

  // Check max shares per hour
  if (check.sharesThisHour >= MAX_SHARES_PER_HOUR) {
    return {
      valid: false,
      reason: `Rate limit: max ${MAX_SHARES_PER_HOUR} shares per hour`,
    };
  }

  // Check minimum interval between shares
  if (now - check.lastShareTime < MIN_SHARE_INTERVAL_MS) {
    return {
      valid: false,
      reason: "Too fast: wait between submissions",
    };
  }

  return { valid: true };
}

// =============================================================================
// REWARD CALCULATION (Server-side only)
// =============================================================================

/**
 * Calculate reward for a share at given difficulty
 * Each +1 difficulty above MIN doubles the reward
 *
 * D22 = 100 $BABY (base)
 * D23 = 200 $BABY
 * D24 = 400 $BABY
 */
export function calculateShareReward(difficulty: number): bigint {
  if (difficulty <= MIN_DIFFICULTY) {
    return BASE_REWARD_PER_SHARE;
  }
  const extraDifficulty = BigInt(difficulty - MIN_DIFFICULTY);
  return BASE_REWARD_PER_SHARE * BigInt(2) ** extraDifficulty;
}

/**
 * Calculate streak multiplier
 *
 * 0-9 shares:    1.0x (base)
 * 10-49 shares:  1.2x (+20%)
 * 50-99 shares:  1.5x (+50%)
 * 100-249:       1.75x (+75%)
 * 250-499:       1.9x (+90%)
 * 500+:          2.0x (+100%) MAX
 */
export function getStreakMultiplier(consecutiveShares: number): number {
  const tiers = [10, 50, 100, 250, 500];
  const multipliers = [1.0, 1.2, 1.5, 1.75, 1.9, 2.0];

  for (let i = tiers.length - 1; i >= 0; i--) {
    if (consecutiveShares >= tiers[i]) {
      return multipliers[i + 1];
    }
  }
  return multipliers[0];
}

/**
 * Calculate final reward with streak bonus
 */
export function calculateRewardWithStreak(
  difficulty: number,
  consecutiveShares: number,
): bigint {
  const baseReward = calculateShareReward(difficulty);
  const multiplier = getStreakMultiplier(consecutiveShares);
  return BigInt(Math.floor(Number(baseReward) * multiplier));
}

// =============================================================================
// CRYPTO HELPERS
// =============================================================================

/**
 * Calculate SHA256 hash and return as hex string
 */
async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Double SHA256 (Bitcoin standard hash256)
 * hash256(data) = SHA256(SHA256(data))
 */
async function hash256Hex(data: string): Promise<string> {
  const firstHash = await sha256Hex(data);
  return sha256Hex(firstHash);
}

/**
 * Count leading zero bits in a hex string
 *
 * Each hex character represents 4 bits:
 * 0 = 0000 (4 zeros)
 * 1 = 0001 (3 zeros)
 * 2-3 = 001x (2 zeros)
 * 4-7 = 01xx (1 zero)
 * 8-f = 1xxx (0 zeros)
 */
function countLeadingZeroBits(hexString: string): number {
  let zeroBits = 0;

  for (const char of hexString.toLowerCase()) {
    const nibble = parseInt(char, 16);

    if (nibble === 0) {
      zeroBits += 4;
    } else if (nibble === 1) {
      zeroBits += 3;
      break;
    } else if (nibble <= 3) {
      zeroBits += 2;
      break;
    } else if (nibble <= 7) {
      zeroBits += 1;
      break;
    } else {
      break;
    }
  }

  return zeroBits;
}

// =============================================================================
// GLOBAL PROOF REGISTRY (prevents cross-address duplicate submission)
// =============================================================================

/**
 * Check if a proof hash has been used globally
 * This prevents the same proof from being submitted to multiple addresses
 *
 * NOTE: This uses a global KV store, passed in from the environment
 */
export async function isProofUsedGlobally(
  hash: string,
  kv: KVNamespace | null,
): Promise<boolean> {
  if (!kv) {
    // If no KV available, fall back to local-only check
    return false;
  }

  const key = `proof:${hash}`;
  const existing = await kv.get(key);
  return existing !== null;
}

/**
 * Mark a proof as used globally
 *
 * NOTE: Proofs expire after 24 hours to prevent unbounded storage growth
 */
export async function markProofUsedGlobally(
  hash: string,
  address: string,
  kv: KVNamespace | null,
): Promise<void> {
  if (!kv) return;

  const key = `proof:${hash}`;
  const value = JSON.stringify({
    address,
    timestamp: Date.now(),
  });

  // Expire after 24 hours
  await kv.put(key, value, { expirationTtl: 86400 });
}
