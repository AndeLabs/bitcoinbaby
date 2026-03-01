/**
 * VarDiff - Variable Difficulty Algorithm
 *
 * Automatically adjusts mining difficulty per user based on their hashrate.
 * This ensures consistent share submission rates regardless of device capability.
 *
 * Philosophy:
 * - Target ~1 share every 2-3 seconds per miner
 * - Phone (1 KH/s) gets D22
 * - Laptop (100 KH/s) gets D26-28
 * - GPU (70 MH/s) gets D32
 *
 * Algorithm:
 * - Track time between share submissions
 * - If shares come too fast, increase difficulty
 * - If shares come too slow, decrease difficulty
 * - Use exponential moving average for smooth adjustments
 *
 * @see https://help.braiins.com/en/support/solutions/articles/77000433929-what-is-vardiff
 * @see https://github.com/zone117x/node-stratum-pool
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

export interface VarDiffConfig {
  /** Minimum difficulty (floor) */
  minDiff: number;
  /** Maximum difficulty (ceiling) */
  maxDiff: number;
  /** Target time between shares in seconds */
  targetTime: number;
  /** How many shares before retargeting */
  retargetShares: number;
  /** Maximum variance from target before adjusting (0.3 = 30%) */
  variancePercent: number;
}

const DEFAULT_CONFIG: VarDiffConfig = {
  minDiff: 22,
  maxDiff: 32,
  targetTime: 3, // 1 share every 3 seconds
  retargetShares: 10, // Retarget after 10 shares
  variancePercent: 0.3, // Allow 30% variance before adjusting
};

// =============================================================================
// USER DIFFICULTY STATE
// =============================================================================

export interface UserDifficultyState {
  /** Current assigned difficulty */
  currentDiff: number;
  /** Timestamps of recent share submissions (for calculating average time) */
  recentShareTimes: number[];
  /** Total shares since last retarget */
  sharesSinceRetarget: number;
  /** Timestamp of last difficulty adjustment */
  lastRetargetAt: number;
  /** Average time between shares (EMA) */
  averageShareTime: number;
}

/**
 * Create initial difficulty state for new user
 */
export function createInitialState(startDiff?: number): UserDifficultyState {
  return {
    currentDiff: startDiff ?? DEFAULT_CONFIG.minDiff,
    recentShareTimes: [],
    sharesSinceRetarget: 0,
    lastRetargetAt: Date.now(),
    averageShareTime: DEFAULT_CONFIG.targetTime,
  };
}

// =============================================================================
// VARDIFF ALGORITHM
// =============================================================================

export interface VarDiffResult {
  /** New difficulty to assign */
  newDifficulty: number;
  /** Whether difficulty changed */
  changed: boolean;
  /** Reason for change (for logging) */
  reason?: string;
  /** Average share time observed */
  averageShareTime: number;
}

/**
 * Calculate new difficulty based on share submission pattern
 *
 * @param state - Current user difficulty state
 * @param config - VarDiff configuration
 * @returns New difficulty and whether it changed
 */
export function calculateVarDiff(
  state: UserDifficultyState,
  config: VarDiffConfig = DEFAULT_CONFIG,
): VarDiffResult {
  const { currentDiff, recentShareTimes, averageShareTime } = state;

  // Need at least 3 shares to calculate meaningful average
  if (recentShareTimes.length < 3) {
    return {
      newDifficulty: currentDiff,
      changed: false,
      averageShareTime,
      reason: "Not enough data",
    };
  }

  // Calculate average time between recent shares
  const timeDiffs: number[] = [];
  for (let i = 1; i < recentShareTimes.length; i++) {
    const diff = (recentShareTimes[i] - recentShareTimes[i - 1]) / 1000; // to seconds
    if (diff > 0 && diff < 300) {
      // Ignore gaps > 5 minutes (probably offline)
      timeDiffs.push(diff);
    }
  }

  if (timeDiffs.length === 0) {
    return {
      newDifficulty: currentDiff,
      changed: false,
      averageShareTime,
      reason: "No valid time diffs",
    };
  }

  // Calculate average using median to reduce outlier impact
  timeDiffs.sort((a, b) => a - b);
  const medianTime = timeDiffs[Math.floor(timeDiffs.length / 2)];

  // Calculate Exponential Moving Average with previous value
  const alpha = 0.3; // EMA smoothing factor
  const newAverageTime = alpha * medianTime + (1 - alpha) * averageShareTime;

  // Check if we're within acceptable variance
  const targetTime = config.targetTime;
  const minAcceptable = targetTime * (1 - config.variancePercent);
  const maxAcceptable = targetTime * (1 + config.variancePercent);

  let newDiff = currentDiff;
  let reason = "Within target range";
  let changed = false;

  if (newAverageTime < minAcceptable) {
    // Shares coming too fast -> increase difficulty
    // Each +1 difficulty doubles the work required
    const ratio = targetTime / newAverageTime;
    const diffIncrease = Math.log2(ratio);

    // Cap at +2 per adjustment to avoid overshooting
    newDiff = Math.min(
      config.maxDiff,
      currentDiff + Math.min(Math.ceil(diffIncrease), 2),
    );

    if (newDiff !== currentDiff) {
      changed = true;
      reason = `Shares too fast (${newAverageTime.toFixed(2)}s avg, target ${targetTime}s)`;
    }
  } else if (newAverageTime > maxAcceptable) {
    // Shares coming too slow -> decrease difficulty
    const ratio = newAverageTime / targetTime;
    const diffDecrease = Math.log2(ratio);

    // Cap at -2 per adjustment
    newDiff = Math.max(
      config.minDiff,
      currentDiff - Math.min(Math.ceil(diffDecrease), 2),
    );

    if (newDiff !== currentDiff) {
      changed = true;
      reason = `Shares too slow (${newAverageTime.toFixed(2)}s avg, target ${targetTime}s)`;
    }
  }

  return {
    newDifficulty: newDiff,
    changed,
    averageShareTime: newAverageTime,
    reason,
  };
}

/**
 * Process a new share submission and update state
 *
 * @param state - Current user difficulty state (will be modified)
 * @param timestamp - Share submission timestamp
 * @param config - VarDiff configuration
 * @returns Whether difficulty was adjusted and new state
 */
export function processShare(
  state: UserDifficultyState,
  timestamp: number = Date.now(),
  config: VarDiffConfig = DEFAULT_CONFIG,
): {
  state: UserDifficultyState;
  result: VarDiffResult;
} {
  // Add timestamp to recent shares (keep last 20)
  const recentShareTimes = [...state.recentShareTimes, timestamp].slice(-20);
  const sharesSinceRetarget = state.sharesSinceRetarget + 1;

  // Create updated state
  let updatedState: UserDifficultyState = {
    ...state,
    recentShareTimes,
    sharesSinceRetarget,
  };

  // Check if it's time to retarget
  if (sharesSinceRetarget >= config.retargetShares) {
    const result = calculateVarDiff(updatedState, config);

    updatedState = {
      currentDiff: result.newDifficulty,
      recentShareTimes: recentShareTimes.slice(-5), // Keep last 5 for continuity
      sharesSinceRetarget: 0,
      lastRetargetAt: timestamp,
      averageShareTime: result.averageShareTime,
    };

    return { state: updatedState, result };
  }

  // No retarget yet
  return {
    state: updatedState,
    result: {
      newDifficulty: state.currentDiff,
      changed: false,
      averageShareTime: state.averageShareTime,
      reason: `Waiting for retarget (${sharesSinceRetarget}/${config.retargetShares})`,
    },
  };
}

// =============================================================================
// DIFFICULTY ESTIMATION
// =============================================================================

/**
 * Estimate initial difficulty based on reported hashrate
 * This helps new miners start at an appropriate difficulty
 *
 * @param hashrate - Hashrate in H/s
 * @param targetTime - Target time between shares in seconds
 * @returns Estimated starting difficulty
 */
export function estimateInitialDifficulty(
  hashrate: number,
  targetTime: number = DEFAULT_CONFIG.targetTime,
  config: VarDiffConfig = DEFAULT_CONFIG,
): number {
  if (hashrate <= 0) return config.minDiff;

  // Difficulty D means 2^D hashes on average to find a share
  // shares_per_second = hashrate / 2^D
  // target_time = 1 / shares_per_second = 2^D / hashrate
  // D = log2(hashrate * target_time)

  const estimatedDiff = Math.log2(hashrate * targetTime);

  // Round to nearest integer and clamp to valid range
  const clampedDiff = Math.max(
    config.minDiff,
    Math.min(config.maxDiff, Math.round(estimatedDiff)),
  );

  return clampedDiff;
}

/**
 * Device capability estimation based on typical hashrates
 */
export const DEVICE_HASHRATES = {
  /** Low-end phone: ~500 H/s to 1 KH/s */
  phone_low: 500,
  /** Mid-range phone: ~5-10 KH/s */
  phone_mid: 7500,
  /** High-end phone: ~10-30 KH/s */
  phone_high: 20000,
  /** Laptop CPU: ~50-200 KH/s */
  laptop: 100000,
  /** Desktop CPU: ~200-500 KH/s */
  desktop: 350000,
  /** Entry GPU (integrated/low-end): ~1-5 MH/s */
  gpu_low: 3000000,
  /** Mid-range GPU: ~10-30 MH/s */
  gpu_mid: 20000000,
  /** High-end GPU: ~50-100+ MH/s */
  gpu_high: 70000000,
} as const;

/**
 * Get estimated difficulty for device type
 */
export function getDifficultyForDevice(
  device: keyof typeof DEVICE_HASHRATES,
  config: VarDiffConfig = DEFAULT_CONFIG,
): number {
  return estimateInitialDifficulty(
    DEVICE_HASHRATES[device],
    config.targetTime,
    config,
  );
}

// =============================================================================
// SERIALIZATION (for storage)
// =============================================================================

/**
 * Serialize state for database storage
 */
export function serializeState(state: UserDifficultyState): string {
  return JSON.stringify({
    d: state.currentDiff,
    t: state.recentShareTimes.slice(-10), // Only keep last 10 for storage
    s: state.sharesSinceRetarget,
    r: state.lastRetargetAt,
    a: state.averageShareTime,
  });
}

/**
 * Deserialize state from database
 */
export function deserializeState(json: string | null): UserDifficultyState {
  if (!json) return createInitialState();

  try {
    const data = JSON.parse(json);
    return {
      currentDiff: data.d ?? DEFAULT_CONFIG.minDiff,
      recentShareTimes: data.t ?? [],
      sharesSinceRetarget: data.s ?? 0,
      lastRetargetAt: data.r ?? Date.now(),
      averageShareTime: data.a ?? DEFAULT_CONFIG.targetTime,
    };
  } catch {
    return createInitialState();
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const VARDIFF_CONFIG = DEFAULT_CONFIG;
