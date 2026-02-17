/**
 * Leaderboard Store
 *
 * Manages leaderboard state with local user stats and mock data.
 * Structured for easy backend integration later.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

/**
 * Mock player data for generating leaderboard
 */
interface MockPlayer {
  address: string;
  displayName?: string;
  hashrate: number; // H/s average
  totalHashes: number;
  babyLevel: number;
  tokensEarned: number;
  badge?: LeaderboardBadge;
}

interface LeaderboardStore {
  // User's stats
  userStats: UserLeaderboardStats;
  userAddress: string | null;

  // Cached leaderboard data
  cachedLeaderboards: Record<string, LeaderboardEntry[]>;
  lastFetch: Record<string, number>;

  // Actions
  setUserAddress: (address: string | null) => void;
  updateUserStats: (stats: Partial<UserLeaderboardStats>) => void;
  addHashes: (count: number) => void;
  setbabyLevel: (level: number) => void;
  addTokens: (amount: number) => void;

  // Leaderboard generation
  getLeaderboard: (
    category: LeaderboardCategory,
    period: LeaderboardPeriod,
    page?: number,
    pageSize?: number,
  ) => LeaderboardEntry[];

  getUserRank: (
    category: LeaderboardCategory,
    period: LeaderboardPeriod,
  ) => number;

  // Mock data helpers
  generateMockLeaderboard: (
    category: LeaderboardCategory,
    period: LeaderboardPeriod,
  ) => LeaderboardEntry[];

  // Reset
  reset: () => void;
}

// Generate realistic Bitcoin addresses
function generateBtcAddress(): string {
  const prefixes = ["bc1q", "bc1p", "3", "1"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let address = prefix;
  const length = prefix.startsWith("bc1") ? 39 : 33;

  for (let i = 0; i < length - prefix.length; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }

  return address;
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

// Generate mock players (deterministic based on seed)
function generateMockPlayers(count: number, seed: number): MockPlayer[] {
  const players: MockPlayer[] = [];

  // Use seeded random for consistency
  const seededRandom = (n: number) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };

  // Generate player names (some have display names)
  const displayNames = [
    "SatoshiFan",
    "BitcoinMaxi",
    "HODLer4Life",
    "MoonBoy",
    "DiamondHands",
    "WhaleWatcher",
    "BlockchainBro",
    "CryptoKid",
    "HashMaster",
    "MiningLord",
    "BTCWhale",
    "SatsStacker",
    "NodeRunner",
    "LightningLad",
    "TaprootTom",
    "SegWitSam",
    "UTXOKing",
    "MempoolMike",
    "FeeSniper",
    "BlockBuilder",
  ];

  for (let i = 0; i < count; i++) {
    const r = seededRandom(i);
    const hasDisplayName = r < 0.3; // 30% have display names

    // Generate stats with power law distribution (top players much stronger)
    const rankFactor = 1 - i / count;
    const variance = seededRandom(i * 100) * 0.5 + 0.75; // 0.75 - 1.25

    players.push({
      address: generateBtcAddress(),
      displayName: hasDisplayName
        ? displayNames[Math.floor(seededRandom(i * 50) * displayNames.length)]
        : undefined,
      hashrate: Math.floor(
        (100000 + rankFactor * 900000) * variance * seededRandom(i * 10),
      ),
      totalHashes: Math.floor(
        (1e9 + rankFactor * 1e12) * variance * seededRandom(i * 20),
      ),
      babyLevel: Math.min(
        21,
        Math.max(1, Math.floor(1 + rankFactor * 20 * variance)),
      ),
      tokensEarned: Math.floor(
        (1000 + rankFactor * 1000000) * variance * seededRandom(i * 30),
      ),
      badge: getBadgeForRank(i + 1),
    });
  }

  return players;
}

// Period multipliers for mock data
const periodMultipliers: Record<LeaderboardPeriod, number> = {
  daily: 0.01,
  weekly: 0.1,
  alltime: 1,
};

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

      setbabyLevel: (level) =>
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

      getLeaderboard: (category, period, page = 0, pageSize = 10) => {
        const key = `${category}-${period}`;
        const state = get();

        // Generate if not cached or stale (5 min cache)
        const now = Date.now();
        const cacheTime = state.lastFetch[key] || 0;
        const isStale = now - cacheTime > 5 * 60 * 1000;

        if (!state.cachedLeaderboards[key] || isStale) {
          const leaderboard = state.generateMockLeaderboard(category, period);
          set((s) => ({
            cachedLeaderboards: {
              ...s.cachedLeaderboards,
              [key]: leaderboard,
            },
            lastFetch: {
              ...s.lastFetch,
              [key]: now,
            },
          }));
          return leaderboard.slice(page * pageSize, (page + 1) * pageSize);
        }

        return state.cachedLeaderboards[key].slice(
          page * pageSize,
          (page + 1) * pageSize,
        );
      },

      getUserRank: (category, period) => {
        const state = get();
        const key = `${category}-${period}`;

        // Ensure leaderboard is generated
        if (!state.cachedLeaderboards[key]) {
          const leaderboard = state.generateMockLeaderboard(category, period);
          set((s) => ({
            cachedLeaderboards: {
              ...s.cachedLeaderboards,
              [key]: leaderboard,
            },
            lastFetch: {
              ...s.lastFetch,
              [key]: Date.now(),
            },
          }));
        }

        const leaderboard = get().cachedLeaderboards[key];
        const userEntry = leaderboard.find((e) => e.isCurrentUser);
        return userEntry?.rank ?? -1;
      },

      generateMockLeaderboard: (category, period) => {
        const state = get();
        const multiplier = periodMultipliers[period];

        // Generate deterministic mock players based on period
        const seed =
          period === "daily"
            ? Math.floor(Date.now() / 86400000)
            : period === "weekly"
              ? Math.floor(Date.now() / 604800000)
              : 12345;

        const mockPlayers = generateMockPlayers(100, seed);

        // Calculate scores based on category
        const scoredPlayers = mockPlayers.map((player) => {
          let score: number;
          switch (category) {
            case "miners":
              score = Math.floor(player.totalHashes * multiplier);
              break;
            case "babies":
              score = player.babyLevel;
              break;
            case "earners":
              score = Math.floor(player.tokensEarned * multiplier);
              break;
            default:
              score = 0;
          }
          return { ...player, score };
        });

        // Get user score
        let userScore: number;
        switch (category) {
          case "miners":
            userScore = Math.floor(state.userStats.totalHashes * multiplier);
            break;
          case "babies":
            userScore = state.userStats.babyLevel;
            break;
          case "earners":
            userScore = Math.floor(state.userStats.tokensEarned * multiplier);
            break;
          default:
            userScore = 0;
        }

        // Add user entry if they have an address
        const allPlayers = state.userAddress
          ? [
              ...scoredPlayers,
              {
                address: state.userAddress,
                displayName: undefined,
                score: userScore,
                badge: undefined as LeaderboardBadge | undefined,
              },
            ]
          : scoredPlayers;

        // Sort by score descending
        allPlayers.sort((a, b) => b.score - a.score);

        // Convert to leaderboard entries with ranks
        const entries: LeaderboardEntry[] = allPlayers.map((player, index) => {
          const rank = index + 1;
          return {
            rank,
            address: player.address,
            displayName: player.displayName,
            score: player.score,
            badge: getBadgeForRank(rank),
            isCurrentUser:
              state.userAddress !== null &&
              player.address === state.userAddress,
          };
        });

        return entries;
      },

      reset: () =>
        set({
          userStats: initialStats,
          userAddress: null,
          cachedLeaderboards: {},
          lastFetch: {},
        }),
    }),
    {
      name: "bitcoinbaby-leaderboard",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userStats: state.userStats,
        userAddress: state.userAddress,
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
