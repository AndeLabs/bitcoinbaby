/**
 * Cosmic System Types
 * Types for astronomical events and their effects on Genesis Babies
 */

// Import canonical types from core
import type {
  Bloodline as CanonicalBloodline,
  BaseType as CanonicalBaseType,
  Heritage as CanonicalHeritage,
} from "../types";

// Re-export canonical types for use within cosmic module
export type { CanonicalBloodline as Bloodline };
export type { CanonicalBaseType as BaseType };
export type { CanonicalHeritage as Heritage };

// =============================================================================
// MOON PHASES
// =============================================================================

export type MoonPhase =
  | "new"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";

export interface MoonData {
  phase: MoonPhase;
  angle: number; // 0-360 degrees
  illumination: number; // 0-100 percentage
  emoji: string;
  isVisible: boolean;
  nextFullMoon: Date;
  nextNewMoon: Date;
}

// =============================================================================
// SUN DATA
// =============================================================================

export interface SunData {
  isDay: boolean;
  sunrise: Date | null;
  sunset: Date | null;
  solarNoon: Date | null;
  dayLength: number; // hours
}

// =============================================================================
// SEASONS
// =============================================================================

export type Season = "spring" | "summer" | "autumn" | "winter";

export interface SeasonData {
  current: Season;
  emoji: string;
  hemisphere: "north" | "south";
  progress: number; // 0-100 progress through current season
  nextSeason: Season;
  daysUntilNext: number;
  daysUntilNextSolstice: number;
  daysUntilNextEquinox: number;
  nextEvent: {
    type: "solstice" | "equinox";
    date: Date;
    name: string;
  };
}

// =============================================================================
// COSMIC EVENTS
// =============================================================================

export type CosmicEventType =
  | "lunar_phase"
  | "eclipse_lunar"
  | "eclipse_solar"
  | "solstice"
  | "equinox"
  | "meteor_shower"
  | "planetary_alignment"
  | "planet_opposition";

export interface CosmicEvent {
  id: string;
  type: CosmicEventType;
  name: string;
  emoji: string;
  description: string;
  startTime: Date;
  endTime: Date;
  peakTime?: Date;
  intensity: number; // 0-1
  multipliers: TypeMultipliers;
  specialRewards?: string[];
  isCritical?: boolean;
}

// =============================================================================
// TYPE MULTIPLIERS (for each Baby type)
// Uses canonical BaseType from ../types
// =============================================================================

export interface TypeMultipliers {
  human: number; // -0.5 to +0.5 (capped)
  animal: number;
  robot: number;
  mystic: number;
  alien: number;
}

// BaseType is imported and re-exported from ../types (canonical)

// =============================================================================
// BLOODLINES
// Bloodline type is imported and re-exported from ../types (canonical)
// =============================================================================

export interface BloodlineConfig {
  name: string;
  bonus: number;
  tradeoff: number;
  bonusType: "xp" | "mining" | "drops_rare" | "evolution";
  tradeoffType: "mining" | "xp" | "drops_common" | "xp_required";
}

// =============================================================================
// HERITAGE (Cultural Origin)
// Heritage type is imported and re-exported from ../types (canonical)
// =============================================================================

export interface HeritageConfig {
  name: string;
  spirits: string[];
  flavor: string;
  bonus: number; // max +5%
  bonusType: string;
  favoriteEvent: CosmicEventType;
}

// =============================================================================
// COSMIC STATE (Current state of the universe)
// =============================================================================

export interface CosmicState {
  timestamp: Date;
  moon: MoonData;
  sun: SunData;
  season: SeasonData;
  currentEvent: CosmicEvent | null;
  upcomingEvents: CosmicEvent[];
  // Bitcoin-related events
  bitcoin: {
    currentBlock: number;
    nextHalvingBlock: number;
    blocksUntilHalving: number;
    difficulty: number;
  } | null;
}

// =============================================================================
// BABY COSMIC ENERGY
// =============================================================================

export type EnergyStatus = "thriving" | "normal" | "struggling" | "critical";

export interface BabyCosmicEnergy {
  // Base values
  baseEnergy: number;

  // Multipliers breakdown (before caps and diminishing returns)
  rawMultipliers: {
    type: number;
    bloodline: number;
    heritage: number;
    cosmic: number;
    items: number;
    level: number;
    rarity: number;
  };

  // After caps applied
  cappedMultipliers: {
    type: number;
    bloodline: number;
    heritage: number;
    cosmic: number;
    items: number;
    level: number;
    rarity: number;
  };

  // Final values
  rawTotalBonus: number;
  effectiveBonus: number; // After diminishing returns
  finalMultiplier: number; // 0.5 to 2.0
  effectiveEnergy: number;

  // Status
  status: EnergyStatus;
  activeEffects: string[];
  warnings: string[];

  // Catch-up bonus for new players
  catchUpBonus: number;
}

// =============================================================================
// BALANCE CONSTANTS
// =============================================================================

export const BALANCE_LIMITS = {
  // Global limits
  MAX_TOTAL_BONUS: 1.0, // +100% max (x2.0)
  MIN_MULTIPLIER: 0.5, // -50% min (x0.5)
  MAX_DISPARITY: 4.0, // Max difference between best and worst

  // Category caps
  CAPS: {
    type: 0.3, // ±30%
    bloodline: 0.15, // +15%
    heritage: 0.05, // +5%
    cosmic: 0.4, // ±40%
    items: 0.25, // +25%
    level: 0.2, // +20%
    rarity: 0.15, // +15%
  },

  // Diminishing returns factor
  DIMINISHING_FACTOR: 0.7,

  // Catch-up settings
  CATCHUP_PER_LEVEL: 0.05, // +5% per level behind
  CATCHUP_MAX: 0.5, // +50% max

  // Community tax for top players
  TAX_TOP_1_PERCENT: 0.15,
  TAX_TOP_5_PERCENT: 0.1,
  TAX_TOP_10_PERCENT: 0.05,
} as const;

// =============================================================================
// PROVIDER INTERFACE (for swapping implementations)
// =============================================================================

export interface ICosmicProvider {
  getMoonData(date: Date): MoonData;
  getSunData(date: Date, lat: number, lon: number): SunData;
  getSeasonData(date: Date, hemisphere: "north" | "south"): SeasonData;
  getNextEclipse(date: Date): CosmicEvent | null;
  getCurrentEvents(date: Date): CosmicEvent[];
  getUpcomingEvents(date: Date, days: number): CosmicEvent[];
}
