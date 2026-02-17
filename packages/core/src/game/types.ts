/**
 * Game Types
 *
 * Type definitions for the Tamagotchi game system.
 */

import type { BabyStage, BabyVisualState } from "./constants";

/**
 * Baby stats that change over time
 */
export interface BabyStats {
  energy: number; // 0-100, depletes with activity
  happiness: number; // 0-100, depletes over time
  hunger: number; // 0-100, increases over time (100 = starving)
  health: number; // 0-100, affected by other critical stats
}

/**
 * Baby progression data
 */
export interface BabyProgression {
  level: number;
  xp: number;
  xpToNextLevel: number;
  stage: BabyStage;
}

/**
 * Complete Baby entity for the game
 */
export interface GameBaby {
  // Identity
  id: string;
  name: string;

  // Current state
  visualState: BabyVisualState;
  isSleeping: boolean;
  isMining: boolean;

  // Stats
  stats: BabyStats;

  // Progression
  progression: BabyProgression;

  // Timestamps
  createdAt: number;
  lastUpdated: number;
  lastFed: number;
  lastPlayed: number;
  lastMined: number; // For level decay tracking

  // Evolution history
  evolutionHistory: EvolutionRecord[];

  // Achievements
  unlockedAchievements: string[];
}

/**
 * Record of an evolution event
 */
export interface EvolutionRecord {
  fromStage: BabyStage;
  toStage: BabyStage;
  level: number;
  timestamp: number;
}

/**
 * Mining statistics tracked for achievements
 */
export interface GameMiningStats {
  totalHashes: number;
  totalShares: number;
  totalTokensEarned: bigint;
  sessionsCount: number;
  longestSession: number; // milliseconds
}

/**
 * Complete game state for persistence
 */
export interface GameState {
  // Version for migrations
  version: number;

  // Baby data
  baby: GameBaby | null;

  // Mining stats (cumulative)
  miningStats: GameMiningStats;

  // Settings
  settings: GameSettings;

  // Meta
  lastSaved: number;
  totalPlayTime: number;
}

/**
 * Game settings
 */
export interface GameSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoSaveEnabled: boolean;
}

/**
 * Achievement definition
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: AchievementRequirement;
  reward: AchievementReward;
}

/**
 * Achievement requirement types
 */
export type AchievementRequirement =
  | { type: "hashes"; count: number }
  | { type: "shares"; count: number }
  | { type: "level"; level: number }
  | { type: "stage"; stage: BabyStage }
  | { type: "days_without_critical"; days: number }
  | { type: "mining_time"; hours: number }
  | { type: "all_achievements" };

/**
 * Achievement reward
 */
export interface AchievementReward {
  xp?: number;
  title?: string;
  badge?: string;
}

/**
 * Evolution event data
 */
export interface EvolutionEventData {
  fromStage: BabyStage;
  toStage: BabyStage;
  newLevel: number;
  stageName: string;
  miningBonus: number;
}

/**
 * Event emitted by game engine
 */
export type GameEvent =
  | { type: "tick"; stats: BabyStats }
  | { type: "level_up"; level: number }
  | { type: "evolution_ready"; nextStage: BabyStage }
  | { type: "evolved"; stage: BabyStage; data: EvolutionEventData }
  | { type: "achievement_unlocked"; achievement: Achievement }
  | { type: "critical_stat"; stat: keyof BabyStats }
  | { type: "stat_recovered"; stat: keyof BabyStats }
  | { type: "whale_appeared" }
  | { type: "saved" };

/**
 * Callback for game events
 */
export type GameEventHandler = (event: GameEvent) => void;

/**
 * Initial state for a new baby
 */
export const DEFAULT_BABY_STATS: BabyStats = {
  energy: 100,
  happiness: 100,
  hunger: 0,
  health: 100,
};

/**
 * Initial game state
 */
export const DEFAULT_GAME_STATE: GameState = {
  version: 1,
  baby: null,
  miningStats: {
    totalHashes: 0,
    totalShares: 0,
    totalTokensEarned: BigInt(0),
    sessionsCount: 0,
    longestSession: 0,
  },
  settings: {
    soundEnabled: true,
    notificationsEnabled: true,
    autoSaveEnabled: true,
  },
  lastSaved: 0,
  totalPlayTime: 0,
};
