"use client";

/**
 * useLeaderboard - Hook for leaderboard data
 *
 * Fetches/generates leaderboard entries, handles filtering by time period,
 * and sorting by category. Structured for easy backend integration.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useLeaderboardStore,
  type LeaderboardEntry,
  type LeaderboardCategory,
  type LeaderboardPeriod,
  formatScore,
  truncateAddress,
} from "@bitcoinbaby/core";

interface UseLeaderboardOptions {
  /**
   * Initial category to display
   */
  initialCategory?: LeaderboardCategory;

  /**
   * Initial time period
   */
  initialPeriod?: LeaderboardPeriod;

  /**
   * Number of entries per page
   */
  pageSize?: number;

  /**
   * User's wallet address (for highlighting)
   */
  userAddress?: string;

  /**
   * Auto-refresh interval in ms (0 to disable)
   */
  refreshInterval?: number;
}

interface UseLeaderboardReturn {
  // Data
  entries: LeaderboardEntry[];
  totalEntries: number;
  userRank: number;
  userScore: number;

  // Filters
  category: LeaderboardCategory;
  period: LeaderboardPeriod;
  setCategory: (category: LeaderboardCategory) => void;
  setPeriod: (period: LeaderboardPeriod) => void;

  // Pagination
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  refresh: () => void;

  // Helpers
  formatScore: (score: number) => string;
  truncateAddress: (address: string, chars?: number) => string;
}

export function useLeaderboard(
  options: UseLeaderboardOptions = {},
): UseLeaderboardReturn {
  const {
    initialCategory = "miners",
    initialPeriod = "alltime",
    pageSize = 10,
    userAddress,
    refreshInterval = 0,
  } = options;

  // Local state
  const [category, setCategory] =
    useState<LeaderboardCategory>(initialCategory);
  const [period, setPeriod] = useState<LeaderboardPeriod>(initialPeriod);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Store
  const store = useLeaderboardStore();

  // Set user address in store
  useEffect(() => {
    if (userAddress) {
      store.setUserAddress(userAddress);
    }
  }, [userAddress, store]);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would be an API call
      // For now, we use the store's mock data generation
      store.getLeaderboard(category, period, page, pageSize);
      setIsLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load leaderboard",
      );
      setIsLoading(false);
    }
  }, [category, period, page, pageSize, store]);

  // Initial fetch and refresh on filter change (async to comply with React Compiler)
  useEffect(() => {
    const timeout = setTimeout(fetchLeaderboard, 0);
    return () => clearTimeout(timeout);
  }, [fetchLeaderboard]);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchLeaderboard();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, fetchLeaderboard]);

  // Reset page when category or period changes (async to comply with React Compiler)
  useEffect(() => {
    const timeout = setTimeout(() => setPage(0), 0);
    return () => clearTimeout(timeout);
  }, [category, period]);

  // Get current entries
  const entries = useMemo(() => {
    return store.getLeaderboard(category, period, page, pageSize);
  }, [store, category, period, page, pageSize]);

  // Get total entries count (for pagination)
  const totalEntries = 100; // Mock data always has 100 entries

  // Calculate total pages
  const totalPages = Math.ceil(totalEntries / pageSize);

  // Get user's rank
  const userRank = useMemo(() => {
    return store.getUserRank(category, period);
  }, [store, category, period]);

  // Get user's score
  const userScore = useMemo(() => {
    const stats = store.userStats;
    switch (category) {
      case "miners":
        return stats.totalHashes;
      case "babies":
        return stats.babyLevel;
      case "earners":
        return stats.tokensEarned;
      default:
        return 0;
    }
  }, [store.userStats, category]);

  // Navigation helpers
  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages - 1));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 0));
  }, []);

  // Refresh function
  const refresh = useCallback(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Format score helper
  const formatScoreHelper = useCallback(
    (score: number) => formatScore(score, category),
    [category],
  );

  return {
    // Data
    entries,
    totalEntries,
    userRank,
    userScore,

    // Filters
    category,
    period,
    setCategory,
    setPeriod,

    // Pagination
    page,
    totalPages,
    setPage,
    nextPage,
    prevPage,

    // State
    isLoading,
    error,

    // Actions
    refresh,

    // Helpers
    formatScore: formatScoreHelper,
    truncateAddress,
  };
}

/**
 * Category display info
 */
export const CATEGORY_INFO: Record<
  LeaderboardCategory,
  { label: string; description: string; icon: string }
> = {
  miners: {
    label: "TOP MINERS",
    description: "Most hashes computed",
    icon: "H",
  },
  babies: {
    label: "TOP BABIES",
    description: "Highest baby levels",
    icon: "B",
  },
  earners: {
    label: "TOP EARNERS",
    description: "Most $BABY earned",
    icon: "$",
  },
};

/**
 * Period display info
 */
export const PERIOD_INFO: Record<
  LeaderboardPeriod,
  { label: string; shortLabel: string }
> = {
  daily: { label: "Daily", shortLabel: "24H" },
  weekly: { label: "Weekly", shortLabel: "7D" },
  alltime: { label: "All Time", shortLabel: "ALL" },
};

export type { UseLeaderboardOptions, UseLeaderboardReturn };
