/**
 * useEngagement Hook
 *
 * Tracks user engagement for mining bonuses:
 * - Baby Care: +50% for healthy baby
 * - Daily Streak: +30% for consecutive logins
 * - Play Time: +20% for active play
 *
 * Maximum bonus: 2.0x multiplier
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  calculateEngagementMultiplier,
  updateDailyStreak,
  createInitialEngagementState,
  serializeEngagementState,
  deserializeEngagementState,
  ENGAGEMENT_TIERS,
  type EngagementState,
  type EngagementMultiplierResult,
  type EngagementBabyStats,
} from "../tokenomics/engagement";

// =============================================================================
// STORAGE KEY
// =============================================================================

const ENGAGEMENT_STORAGE_KEY = "bitcoinbaby:engagement";

// =============================================================================
// HOOK
// =============================================================================

export interface UseEngagementOptions {
  /** Baby stats from game state */
  babyStats?: EngagementBabyStats | null;
  /** Auto-save interval in ms (default: 30s) */
  autoSaveInterval?: number;
}

export interface UseEngagementReturn {
  /** Current engagement state */
  state: EngagementState;
  /** Calculated multiplier and breakdown */
  multiplier: EngagementMultiplierResult;
  /** Current tier info */
  tier: (typeof ENGAGEMENT_TIERS)[keyof typeof ENGAGEMENT_TIERS];
  /** Update play time (call periodically while app is active) */
  trackPlayTime: (minutes: number) => void;
  /** Record a login (updates daily streak) */
  recordLogin: () => void;
  /** Force save state */
  save: () => void;
  /** Reset state (for testing) */
  reset: () => void;
}

export function useEngagement(
  options: UseEngagementOptions = {},
): UseEngagementReturn {
  const { babyStats = null, autoSaveInterval = 30_000 } = options;

  // Load initial state from localStorage
  const [state, setState] = useState<EngagementState>(() => {
    if (typeof window === "undefined") {
      return createInitialEngagementState();
    }
    const saved = localStorage.getItem(ENGAGEMENT_STORAGE_KEY);
    return deserializeEngagementState(saved);
  });

  // Track if we've recorded login for this session
  const loginRecordedRef = useRef(false);

  // Calculate current multiplier
  const multiplier = calculateEngagementMultiplier(state, babyStats);

  // Get current tier info
  const tier =
    ENGAGEMENT_TIERS[multiplier.status as keyof typeof ENGAGEMENT_TIERS];

  // Save state to localStorage
  const save = useCallback(() => {
    if (typeof window === "undefined") return;
    const json = serializeEngagementState(state);
    localStorage.setItem(ENGAGEMENT_STORAGE_KEY, json);
  }, [state]);

  // Track play time
  const trackPlayTime = useCallback((minutes: number) => {
    setState((prev) => ({
      ...prev,
      playTimeToday: prev.playTimeToday + minutes,
      lastInteraction: Date.now(),
    }));
  }, []);

  // Record login (updates daily streak)
  const recordLogin = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];

    setState((prev) => {
      const newStreak = updateDailyStreak(
        prev.lastLoginDay,
        today,
        prev.dailyStreak,
      );

      return {
        ...prev,
        dailyStreak: newStreak,
        lastLoginDay: today,
        lastInteraction: Date.now(),
      };
    });
  }, []);

  // Reset state
  const reset = useCallback(() => {
    const initial = createInitialEngagementState();
    setState(initial);
    if (typeof window !== "undefined") {
      localStorage.removeItem(ENGAGEMENT_STORAGE_KEY);
    }
  }, []);

  // Record login on mount (once per session)
  useEffect(() => {
    if (!loginRecordedRef.current) {
      loginRecordedRef.current = true;
      recordLogin();
    }
  }, [recordLogin]);

  // Auto-save periodically
  useEffect(() => {
    const interval = setInterval(save, autoSaveInterval);
    return () => clearInterval(interval);
  }, [save, autoSaveInterval]);

  // Save on unmount
  useEffect(() => {
    return () => save();
  }, [save]);

  // Track play time automatically (1 minute intervals)
  useEffect(() => {
    const interval = setInterval(() => {
      trackPlayTime(1);
    }, 60_000); // Every minute

    return () => clearInterval(interval);
  }, [trackPlayTime]);

  // Reset play time at midnight
  useEffect(() => {
    const checkMidnight = () => {
      const today = new Date().toISOString().split("T")[0];
      if (state.lastLoginDay && state.lastLoginDay !== today) {
        setState((prev) => ({
          ...prev,
          playTimeToday: 0,
          lastLoginDay: today,
        }));
      }
    };

    // Check every minute
    const interval = setInterval(checkMidnight, 60_000);
    return () => clearInterval(interval);
  }, [state.lastLoginDay]);

  // Update baby health score when stats change
  useEffect(() => {
    if (babyStats) {
      const avgHealth =
        (babyStats.energy +
          babyStats.happiness +
          babyStats.hunger +
          babyStats.health) /
        4;
      setState((prev) => ({
        ...prev,
        babyHealthScore: avgHealth,
      }));
    }
  }, [babyStats]);

  return {
    state,
    multiplier,
    tier,
    trackPlayTime,
    recordLogin,
    save,
    reset,
  };
}

export default useEngagement;
