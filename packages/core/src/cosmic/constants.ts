/**
 * Cosmic System Constants
 * Configuration for types, bloodlines, heritage, and effects
 */

import type {
  BaseType,
  Bloodline,
  BloodlineConfig,
  Heritage,
  HeritageConfig,
  MoonPhase,
  Season,
  TypeMultipliers,
} from "./types";

// =============================================================================
// MOON PHASE EFFECTS BY TYPE
// =============================================================================

export const MOON_PHASE_EFFECTS: Record<MoonPhase, TypeMultipliers> = {
  new: {
    human: 0,
    animal: -0.1,
    robot: 0.05,
    mystic: 0.25, // Mystics love new moon
    alien: 0.1,
  },
  waxing_crescent: {
    human: 0.05,
    animal: 0.1,
    robot: 0,
    mystic: 0.15,
    alien: 0.05,
  },
  first_quarter: {
    human: 0.1,
    animal: 0.15,
    robot: 0,
    mystic: 0.1,
    alien: 0,
  },
  waxing_gibbous: {
    human: 0.1,
    animal: 0.2,
    robot: -0.05,
    mystic: 0.15,
    alien: 0,
  },
  full: {
    human: 0.15,
    animal: 0.25, // Animals love full moon
    robot: -0.1, // Robots struggle
    mystic: 0.25,
    alien: 0.1,
  },
  waning_gibbous: {
    human: 0.05,
    animal: 0.15,
    robot: -0.05,
    mystic: 0.15,
    alien: 0.05,
  },
  last_quarter: {
    human: 0,
    animal: 0.05,
    robot: 0.05,
    mystic: 0.1,
    alien: 0.1,
  },
  waning_crescent: {
    human: -0.05,
    animal: -0.05,
    robot: 0.1,
    mystic: 0.2,
    alien: 0.15,
  },
};

// =============================================================================
// DAY/NIGHT EFFECTS BY TYPE
// =============================================================================

export const DAY_EFFECTS: TypeMultipliers = {
  human: 0.1, // Humans thrive in daylight
  animal: 0.05,
  robot: 0, // Robots don't care
  mystic: -0.05, // Mystics prefer twilight
  alien: -0.1, // Aliens prefer night
};

export const NIGHT_EFFECTS: TypeMultipliers = {
  human: -0.05,
  animal: 0.05, // Many animals are nocturnal
  robot: 0,
  mystic: 0.1,
  alien: 0.15, // Aliens love starry nights
};

// =============================================================================
// SEASON EFFECTS BY TYPE
// =============================================================================

export const SEASON_EFFECTS: Record<Season, TypeMultipliers> = {
  spring: {
    human: 0.1,
    animal: 0.2, // Animals love spring (rebirth)
    robot: 0,
    mystic: 0.1,
    alien: 0,
  },
  summer: {
    human: 0.2, // Humans love summer
    animal: 0.1,
    robot: -0.1, // Robots overheat
    mystic: 0,
    alien: -0.15, // Aliens struggle with heat
  },
  autumn: {
    human: 0.05,
    animal: 0.1,
    robot: 0.05,
    mystic: 0.15, // Mystics love the transition
    alien: 0.05,
  },
  winter: {
    human: -0.1,
    animal: -0.15, // Animals hibernate
    robot: 0.2, // Robots efficient in cold
    mystic: 0.1,
    alien: 0.1,
  },
};

// =============================================================================
// SPECIAL EVENT EFFECTS
// =============================================================================

export const ECLIPSE_LUNAR_EFFECTS: TypeMultipliers = {
  human: 0.15,
  animal: 0.15,
  robot: -0.2, // Robots really struggle
  mystic: 0.3, // Mystics LOVE lunar eclipses
  alien: 0.2,
};

export const ECLIPSE_SOLAR_EFFECTS: TypeMultipliers = {
  human: -0.1,
  animal: -0.2, // Animals confused/scared
  robot: 0.3, // Robots LOVE solar eclipses
  mystic: 0.15,
  alien: 0.3, // Aliens love them too
};

export const METEOR_SHOWER_EFFECTS: TypeMultipliers = {
  human: 0.1,
  animal: 0.1,
  robot: 0.1,
  mystic: 0.15,
  alien: 0.25, // Aliens LOVE meteor showers
};

export const PLANETARY_ALIGNMENT_EFFECTS: TypeMultipliers = {
  human: 0.2,
  animal: 0.2,
  robot: 0.2,
  mystic: 0.25,
  alien: 0.4, // Aliens get HUGE bonus
};

export const SOLSTICE_SUMMER_EFFECTS: TypeMultipliers = {
  human: 0.25, // Humans LOVE summer solstice
  animal: 0.15,
  robot: -0.15,
  mystic: 0.1,
  alien: -0.1,
};

export const SOLSTICE_WINTER_EFFECTS: TypeMultipliers = {
  human: -0.1,
  animal: -0.1,
  robot: 0.25, // Robots LOVE winter solstice
  mystic: 0.15,
  alien: 0.1,
};

export const EQUINOX_EFFECTS: TypeMultipliers = {
  human: 0.1,
  animal: 0.1,
  robot: 0,
  mystic: 0.15, // Mystics love balance
  alien: 0.1,
};

// =============================================================================
// BLOODLINE CONFIGURATIONS
// =============================================================================

export const BLOODLINE_CONFIGS: Record<Bloodline, BloodlineConfig> = {
  royal: {
    name: "Royal",
    bonus: 0.1, // +10% XP
    tradeoff: -0.05, // -5% mining
    bonusType: "xp",
    tradeoffType: "mining",
  },
  warrior: {
    name: "Warrior",
    bonus: 0.15, // +15% mining
    tradeoff: -0.05, // -5% XP
    bonusType: "mining",
    tradeoffType: "xp",
  },
  rogue: {
    name: "Rogue",
    bonus: 0.1, // +10% rare drops
    tradeoff: -0.1, // -10% common drops
    bonusType: "drops_rare",
    tradeoffType: "drops_common",
  },
  mystic: {
    name: "Mystic",
    bonus: 0.15, // Unique evolution path
    tradeoff: -0.5, // Requires 2x XP (represented as -50% XP gain)
    bonusType: "evolution",
    tradeoffType: "xp_required",
  },
};

// =============================================================================
// HERITAGE CONFIGURATIONS
// =============================================================================

export const HERITAGE_CONFIGS: Record<Heritage, HeritageConfig> = {
  americas: {
    name: "Americas",
    spirits: ["Pachamama", "Quetzalcoatl", "Thunderbird"],
    flavor: "Conectado a la tierra",
    bonus: 0.05, // +5% resistance
    bonusType: "resistance",
    favoriteEvent: "solstice",
  },
  africa: {
    name: "Africa",
    spirits: ["Shango", "Oshun", "Anansi"],
    flavor: "Portador del Ache",
    bonus: 0.05, // +5% group XP
    bonusType: "group_xp",
    favoriteEvent: "lunar_phase",
  },
  asia: {
    name: "Asia",
    spirits: ["Ryu", "Kitsune", "Ganesha"],
    flavor: "En armonia",
    bonus: 0.05, // +5% focus
    bonusType: "focus",
    favoriteEvent: "equinox",
  },
  europa: {
    name: "Europa",
    spirits: ["Dryad", "Norns", "Salamandra"],
    flavor: "Guardian elemental",
    bonus: 0.05, // +5% protection
    bonusType: "protection",
    favoriteEvent: "eclipse_lunar",
  },
  oceania: {
    name: "Oceania",
    spirits: ["Maui", "Rainbow Serpent", "Tangaroa"],
    flavor: "Hijo del oceano",
    bonus: 0.05, // +5% adaptability
    bonusType: "adaptability",
    favoriteEvent: "meteor_shower",
  },
};

// =============================================================================
// RARITY MULTIPLIERS (Balanced - prestige not power)
// =============================================================================

export const RARITY_MULTIPLIERS = {
  common: 0,
  uncommon: 0.05, // +5%
  rare: 0.1, // +10%
  epic: 0.12, // +12%
  legendary: 0.14, // +14%
  mythic: 0.15, // +15% (cap)
} as const;

export type Rarity = keyof typeof RARITY_MULTIPLIERS;

// =============================================================================
// MOON PHASE EMOJI MAP
// =============================================================================

export const MOON_EMOJI: Record<MoonPhase, string> = {
  new: "🌑",
  waxing_crescent: "🌒",
  first_quarter: "🌓",
  waxing_gibbous: "🌔",
  full: "🌕",
  waning_gibbous: "🌖",
  last_quarter: "🌗",
  waning_crescent: "🌘",
};

// =============================================================================
// SEASON EMOJI MAP
// =============================================================================

export const SEASON_EMOJI: Record<Season, string> = {
  spring: "🌸",
  summer: "☀️",
  autumn: "🍂",
  winter: "❄️",
};

// =============================================================================
// BASE TYPE DESCRIPTIONS
// =============================================================================

export const BASE_TYPE_INFO: Record<
  BaseType,
  { name: string; description: string; strength: string; weakness: string }
> = {
  human: {
    name: "Human",
    description: "Conectados a la energia colectiva humana",
    strength: "+10% a todo (versatil)",
    weakness: "Sin especialidad",
  },
  animal: {
    name: "Animal",
    description: "Nacidos del ruido natural",
    strength: "+20% evolucion",
    weakness: "-10% en eclipses solares",
  },
  robot: {
    name: "Robot",
    description: "Emergieron de codigo legacy",
    strength: "+20% mining",
    weakness: "-10% en lunas llenas",
  },
  mystic: {
    name: "Mystic",
    description: "Manifestaciones de Bitcoin perdidos",
    strength: "+15% en eventos lunares",
    weakness: "-5% constante",
  },
  alien: {
    name: "Alien",
    description: "Llegaron de otras blockchains",
    strength: "+20% en eventos raros",
    weakness: "-15% normalmente",
  },
};
