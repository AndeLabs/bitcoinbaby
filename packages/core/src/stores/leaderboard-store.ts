/**
 * Leaderboard Store
 *
 * Manages leaderboard state with real API integration.
 * Uses Upstash Redis via Cloudflare Workers for real-time leaderboards.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getApiClient } from "../api/client";

/**
 * Leaderboard entry for a player
 */
export interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName?: string;
  score: number;
  badge?: LeaderboardBadge;
  isCurrentUser: boolean;
}

/**
 * Badge types for achievements
 */
export type LeaderboardBadge =
  | "whale" // Top 10
  | "diamond" // Top 50
  | "gold" // Top 100
  | "silver" // Top 500
  | "bronze" // Top 1000
  | "newbie" // New player
  | "veteran"; // Long-time player

/**
 * Leaderboard categories
 */
export type LeaderboardCategory = "miners" | "babies" | "earners";

/**
 * Time period for leaderboard
 */
export type LeaderboardPeriod = "daily" | "weekly" | "alltime";

/**
 * User's stats for leaderboard
 */
export interface UserLeaderboardStats {
  totalHashes: number;
  babyLevel: number;
  tokensEarned: number;
  lastUpdated: number;
}

interface LeaderboardStore {
  // User's local stats (for immediate UI feedback)
  userStats: UserLeaderboardStats;
  userAddress: string | null;

  // Cached leaderboard data from API
  cachedLeaderboards: Record<string, LeaderboardEntry[]>;
  lastFetch: Record<string, number>;

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // User rank cache
  userRanks: Record<string, number | null>;

  // Actions
  setUserAddress: (address: string | null) => void;
  updateUserStats: (stats: Partial<UserLeaderboardStats>) => void;
  addHashes: (count: number) => void;
  setBabyLevel: (level: number) => void;
  addTokens: (amount: number) => void;

  // Async API methods
  fetchLeaderboard: (
    category: LeaderboardCategory,
    period: LeaderboardPeriod,
    limit?: number,
    offset?: number,
  ) => Promise<LeaderboardEntry[]>;

  fetchUserRank: (
    category: LeaderboardCategory,
    period: LeaderboardPeriod,
  ) => Promise<number | null>;

  submitScore: (category: LeaderboardCategory, score: number) => Promise<void>;

  // Sync getters (for cached data)
  getLeaderboard: (
    category: LeaderboardCategory,
    period: LeaderboardPeriod,
    page?: number,
    pageSize?: number,
  ) => LeaderboardEntry[];

  getUserRank: (
    category: LeaderboardCategory,
    period: LeaderboardPeriod,
  ) => number | null;

  // Cache helpers
  isCacheStale: (
    category: LeaderboardCategory,
    period: LeaderboardPeriod,
  ) => boolean;

  // Reset
  reset: () => void;
}

// Truncate address for display
export function truncateAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Get badge based on rank
function getBadgeForRank(rank: number): LeaderboardBadge | undefined {
  if (rank <= 10) return "whale";
  if (rank <= 50) return "diamond";
  if (rank <= 100) return "gold";
  if (rank <= 500) return "silver";
  if (rank <= 1000) return "bronze";
  return undefined;
}

// Cache TTL (5 minutes)
const CACHE_TTL_MS = 5 * 60 * 1000;

// Initial stats
const initialStats: UserLeaderboardStats = {
  totalHashes: 0,
  babyLevel: 1,
  tokensEarned: 0,
  lastUpdated: Date.now(),
};

// Create store with persistence
export const useLeaderboardStore = create<LeaderboardStore>()(
  persist(
    (set, get) => ({
      userStats: initialStats,
      userAddress: null,
      cachedLeaderboards: {},
      lastFetch: {},
      isLoading: false,
      error: null,
      userRanks: {},

      setUserAddress: (address) => set({ userAddress: address }),

      updateUserStats: (stats) =>
        set((s) => ({
          userStats: {
            ...s.userStats,
            ...stats,
            lastUpdated: Date.now(),
          },
        })),

      addHashes: (count) =>
        set((s) => ({
          userStats: {
            ...s.userStats,
            totalHashes: s.userStats.totalHashes + count,
            lastUpdated: Date.now(),
          },
        })),

      setBabyLevel: (level) =>
        set((s) => ({
          userStats: {
            ...s.userStats,
            babyLevel: level,
            lastUpdated: Date.now(),
          },
        })),

      addTokens: (amount) =>
        set((s) => ({
          userStats: {
            ...s.userStats,
            tokensEarned: s.userStats.tokensEarned + amount,
            lastUpdated: Date.now(),
          },
        })),

      // Fetch leaderboard from API
      fetchLeaderboard: async (category, period, limit = 100, offset = 0) => {
        const key = `${category}-${period}`;
        set({ isLoading: true, error: null });

        try {
          const client = getApiClient();
          const response = await client.getLeaderboard(
            category,
            period,
            limit,
            offset,
          );

          if (!response.success || !response.data) {
            throw new Error(response.error || "Failed to fetch leaderboard");
          }

          const { userAddress } = get();
          const entries: LeaderboardEntry[] = response.data.entries.map(
            (entry) => ({
              rank: entry.rank,
              address: entry.address,
              score: entry.score,
              badge: getBadgeForRank(entry.rank),
              isCurrentUser:
                userAddress !== null &&
                entry.address.toLowerCase() === userAddress.toLowerCase(),
            }),
          );

          set((s) => ({
            cachedLeaderboards: {
              ...s.cachedLeaderboards,
              [key]: entries,
            },
            lastFetch: {
              ...s.lastFetch,
              [key]: Date.now(),
            },
            isLoading: false,
          }));

          return entries;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          set({ error: message, isLoading: false });
          // Return cached data if available
          return get().cachedLeaderboards[key] || [];
        }
      },

      // Fetch user rank from API
      fetchUserRank: async (category, period) => {
        const { userAddress } = get();
        if (!userAddress) return null;

        const rankKey = `${category}-${period}`;

        try {
          const client = getApiClient();
          const response = await client.getUserRank(
            userAddress,
            category,
            period,
          );

          if (!response.success || !response.data) {
            return null;
          }

          const rank = response.data.rank;
          set((s) => ({
            userRanks: {
              ...s.userRanks,
              [rankKey]: rank,
            },
          }));

          return rank;
        } catch {
          return get().userRanks[rankKey] ?? null;
        }
      },

      // Submit score to leaderboard
      submitScore: async (category, score) => {
        const { userAddress } = get();
        if (!userAddress) return;

        try {
          const client = getApiClient();
          await client.updateLeaderboard(userAddress, category, score);

          // Invalidate cache for this category
          const periods: LeaderboardPeriod[] = ["daily", "weekly", "alltime"];
          set((s) => {
            const newLastFetch = { ...s.lastFetch };
            for (const period of periods) {
              delete newLastFetch[`${category}-${period}`];
            }
            return { lastFetch: newLastFetch };
          });
        } catch (error) {
          console.error("[Leaderboard] Failed to submit score:", error);
        }
      },

      // Sync getter for cached leaderboard
      getLeaderboard: (category, period, page = 0, pageSize = 10) => {
        const key = `${category}-${period}`;
        const state = get();
        const entries = state.cachedLeaderboards[key] || [];
        return entries.slice(page * pageSize, (page + 1) * pageSize);
      },

      // Sync getter for cached user rank
      getUserRank: (category, period) => {
        const rankKey = `${category}-${period}`;
        return get().userRanks[rankKey] ?? null;
      },

      // Check if cache is stale
      isCacheStale: (category, period) => {
        const key = `${category}-${period}`;
        const lastFetch = get().lastFetch[key] || 0;
        return Date.now() - lastFetch > CACHE_TTL_MS;
      },

      reset: () =>
        set({
          userStats: initialStats,
          userAddress: null,
          cachedLeaderboards: {},
          lastFetch: {},
          userRanks: {},
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "bitcoinbaby-leaderboard",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userStats: state.userStats,
        userAddress: state.userAddress,
        // Don't persist API data - fetch fresh on load
      }),
    },
  ),
);

/**
 * Format score for display
 */
export function formatScore(
  score: number,
  category: LeaderboardCategory,
): string {
  if (category === "babies") {
    return `Lv.${score}`;
  }

  if (score >= 1e12) {
    return `${(score / 1e12).toFixed(2)}T`;
  }
  if (score >= 1e9) {
    return `${(score / 1e9).toFixed(2)}B`;
  }
  if (score >= 1e6) {
    return `${(score / 1e6).toFixed(2)}M`;
  }
  if (score >= 1e3) {
    return `${(score / 1e3).toFixed(2)}K`;
  }
  return score.toLocaleString();
}

/**
 * Get leaderboard badge display info
 */
export function getLeaderboardBadgeInfo(badge?: LeaderboardBadge): {
  emoji: string;
  label: string;
  color: string;
} | null {
  if (!badge) return null;

  const badges: Record<
    LeaderboardBadge,
    { emoji: string; label: string; color: string }
  > = {
    whale: { emoji: "🐋", label: "Whale", color: "text-pixel-secondary" },
    diamond: {
      emoji: "💎",
      label: "Diamond",
      color: "text-pixel-secondary-light",
    },
    gold: { emoji: "🥇", label: "Gold", color: "text-pixel-primary" },
    silver: { emoji: "🥈", label: "Silver", color: "text-pixel-text-muted" },
    bronze: { emoji: "🥉", label: "Bronze", color: "text-pixel-primary-dark" },
    newbie: { emoji: "🌱", label: "Newbie", color: "text-pixel-success" },
    veteran: {
      emoji: "⭐",
      label: "Veteran",
      color: "text-pixel-primary-light",
    },
  };

  return badges[badge];
}

export default useLeaderboardStore;
