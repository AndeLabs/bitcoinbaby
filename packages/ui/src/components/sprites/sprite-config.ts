/**
 * Sprite Configuration System
 *
 * Modular, data-driven sprite configuration.
 * Each level has unique visual features that stack progressively.
 */

export interface SpriteFeature {
  // Visual element name
  name: string;
  // When this feature appears (level)
  level: number;
  // SVG element type
  type: 'rect' | 'circle' | 'polygon' | 'path';
  // Position and size
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  r?: number; // for circles
  points?: string; // for polygons
  d?: string; // for paths
  // Colors (can reference palette)
  fill: string;
  opacity?: number;
  // Animation class
  animation?: string;
}

export interface LevelConfig {
  level: number;
  name: string;
  // Base sprite size (viewBox)
  viewBoxSize: number;
  // Color palette
  palette: {
    body: string;
    head: string;
    accent: string;
    detail: string;
    glow: string;
  };
  // Features that appear at this level
  features: SpriteFeature[];
  // Special effects
  effects: {
    hasAura?: boolean;
    auraColor?: string;
    hasParticles?: boolean;
    particleColor?: string;
    glowIntensity?: number; // 0-1
  };
}

/**
 * All 21 level configurations
 * Each level adds new visual features to make progression visible
 */
export const LEVEL_CONFIGS: LevelConfig[] = [
  // Level 1 - Basic Baby
  {
    level: 1,
    name: 'Bebe Nodo I',
    viewBoxSize: 16,
    palette: {
      body: '#f7931a',
      head: '#ffc107',
      accent: '#4fc3f7',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      // Antenna
      { name: 'antenna', level: 1, type: 'rect', x: 7, y: 0, width: 2, height: 2, fill: 'accent' },
      // Head
      { name: 'head', level: 1, type: 'rect', x: 4, y: 2, width: 8, height: 6, fill: 'head' },
      // Eyes
      { name: 'eye_left', level: 1, type: 'rect', x: 5, y: 5, width: 2, height: 2, fill: 'detail' },
      { name: 'eye_right', level: 1, type: 'rect', x: 9, y: 5, width: 2, height: 2, fill: 'detail' },
      // Body
      { name: 'body', level: 1, type: 'rect', x: 5, y: 8, width: 6, height: 5, fill: 'body' },
      // Feet
      { name: 'foot_left', level: 1, type: 'rect', x: 5, y: 13, width: 2, height: 1, fill: '#e67e00' },
      { name: 'foot_right', level: 1, type: 'rect', x: 9, y: 13, width: 2, height: 1, fill: '#e67e00' },
    ],
    effects: {},
  },

  // Level 2 - Antenna glow
  {
    level: 2,
    name: 'Bebe Nodo II',
    viewBoxSize: 16,
    palette: {
      body: '#f7931a',
      head: '#ffc107',
      accent: '#4fc3f7',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'antenna_glow', level: 2, type: 'rect', x: 7, y: 0, width: 2, height: 2, fill: 'accent', animation: 'pulse' },
      { name: 'antenna_tip', level: 2, type: 'rect', x: 8, y: 0, width: 1, height: 1, fill: '#ffffff' },
    ],
    effects: {},
  },

  // Level 3 - Brain visible
  {
    level: 3,
    name: 'Bebe Nodo III',
    viewBoxSize: 16,
    palette: {
      body: '#f7931a',
      head: '#ffc107',
      accent: '#4fc3f7',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'brain', level: 3, type: 'rect', x: 5, y: 3, width: 6, height: 3, fill: 'accent', opacity: 0.5 },
      { name: 'brain_pulse', level: 3, type: 'rect', x: 7, y: 4, width: 2, height: 1, fill: '#8b5cf6', opacity: 0.7 },
    ],
    effects: { glowIntensity: 0.1 },
  },

  // Level 4 - Arms appear (Child phase)
  {
    level: 4,
    name: 'Niño Bloque I',
    viewBoxSize: 18,
    palette: {
      body: '#f7931a',
      head: '#fb923c',
      accent: '#22d3ee',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'arm_left', level: 4, type: 'rect', x: 3, y: 9, width: 2, height: 3, fill: 'body' },
      { name: 'arm_right', level: 4, type: 'rect', x: 13, y: 9, width: 2, height: 3, fill: 'body' },
    ],
    effects: {},
  },

  // Level 5 - Bigger eyes
  {
    level: 5,
    name: 'Niño Bloque II',
    viewBoxSize: 18,
    palette: {
      body: '#f7931a',
      head: '#fb923c',
      accent: '#22d3ee',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'eye_shine_left', level: 5, type: 'rect', x: 5, y: 5, width: 1, height: 1, fill: '#ffffff' },
      { name: 'eye_shine_right', level: 5, type: 'rect', x: 10, y: 5, width: 1, height: 1, fill: '#ffffff' },
    ],
    effects: {},
  },

  // Level 6 - Bitcoin symbol on body
  {
    level: 6,
    name: 'Niño Bloque III',
    viewBoxSize: 18,
    palette: {
      body: '#f7931a',
      head: '#fb923c',
      accent: '#22d3ee',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'btc_symbol', level: 6, type: 'rect', x: 8, y: 10, width: 2, height: 3, fill: 'detail' },
      { name: 'btc_bar_top', level: 6, type: 'rect', x: 7, y: 10, width: 1, height: 1, fill: 'detail' },
      { name: 'btc_bar_bottom', level: 6, type: 'rect', x: 10, y: 12, width: 1, height: 1, fill: 'detail' },
    ],
    effects: { glowIntensity: 0.2 },
  },

  // Level 7 - Hood appears (Teen phase)
  {
    level: 7,
    name: 'Cypher-Joven I',
    viewBoxSize: 20,
    palette: {
      body: '#ea580c',
      head: '#f97316',
      accent: '#06b6d4',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'hood', level: 7, type: 'rect', x: 4, y: 2, width: 12, height: 3, fill: '#4338ca' },
    ],
    effects: {},
  },

  // Level 8 - VR goggles
  {
    level: 8,
    name: 'Cypher-Joven II',
    viewBoxSize: 20,
    palette: {
      body: '#ea580c',
      head: '#f97316',
      accent: '#06b6d4',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'goggles', level: 8, type: 'rect', x: 5, y: 5, width: 10, height: 3, fill: '#1e1b4b' },
      { name: 'goggles_glow_l', level: 8, type: 'rect', x: 6, y: 6, width: 3, height: 1, fill: '#22c55e' },
      { name: 'goggles_glow_r', level: 8, type: 'rect', x: 11, y: 6, width: 3, height: 1, fill: '#22c55e' },
    ],
    effects: {},
  },

  // Level 9 - Circuit patterns
  {
    level: 9,
    name: 'Cypher-Joven III',
    viewBoxSize: 20,
    palette: {
      body: '#ea580c',
      head: '#f97316',
      accent: '#06b6d4',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'circuit_1', level: 9, type: 'rect', x: 5, y: 12, width: 1, height: 2, fill: 'accent', opacity: 0.5 },
      { name: 'circuit_2', level: 9, type: 'rect', x: 14, y: 13, width: 1, height: 2, fill: 'accent', opacity: 0.5 },
    ],
    effects: { glowIntensity: 0.3 },
  },

  // Level 10 - Helmet (Young Adult phase)
  {
    level: 10,
    name: 'Hash Guerrero I',
    viewBoxSize: 22,
    palette: {
      body: '#dc2626',
      head: '#f43f5e',
      accent: '#8b5cf6',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'helmet', level: 10, type: 'rect', x: 8, y: 0, width: 6, height: 2, fill: 'accent' },
      { name: 'helmet_crest', level: 10, type: 'rect', x: 10, y: 0, width: 2, height: 1, fill: '#fbbf24' },
    ],
    effects: { hasAura: true, auraColor: '#f43f5e' },
  },

  // Level 11 - Armor plates
  {
    level: 11,
    name: 'Hash Guerrero II',
    viewBoxSize: 22,
    palette: {
      body: '#dc2626',
      head: '#f43f5e',
      accent: '#8b5cf6',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'armor_chest', level: 11, type: 'rect', x: 7, y: 10, width: 8, height: 2, fill: 'head' },
      { name: 'armor_shoulder_l', level: 11, type: 'rect', x: 4, y: 10, width: 3, height: 2, fill: 'head' },
      { name: 'armor_shoulder_r', level: 11, type: 'rect', x: 15, y: 10, width: 3, height: 2, fill: 'head' },
    ],
    effects: {},
  },

  // Level 12 - Golden emblem
  {
    level: 12,
    name: 'Hash Guerrero III',
    viewBoxSize: 22,
    palette: {
      body: '#dc2626',
      head: '#f43f5e',
      accent: '#8b5cf6',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'emblem', level: 12, type: 'rect', x: 9, y: 12, width: 4, height: 4, fill: '#fbbf24' },
      { name: 'emblem_btc', level: 12, type: 'rect', x: 10, y: 13, width: 2, height: 2, fill: 'detail' },
    ],
    effects: { glowIntensity: 0.4 },
  },

  // Level 13 - Wizard hat (Adult phase)
  {
    level: 13,
    name: 'Cadena Adulto I',
    viewBoxSize: 24,
    palette: {
      body: '#9333ea',
      head: '#a855f7',
      accent: '#fbbf24',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'hat_base', level: 13, type: 'rect', x: 9, y: 5, width: 6, height: 2, fill: 'body' },
    ],
    effects: {},
  },

  // Level 14 - Full hat + beard starts
  {
    level: 14,
    name: 'Cadena Adulto II',
    viewBoxSize: 24,
    palette: {
      body: '#9333ea',
      head: '#a855f7',
      accent: '#fbbf24',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'beard', level: 14, type: 'rect', x: 9, y: 13, width: 6, height: 2, fill: '#d1d5db' },
    ],
    effects: {},
  },

  // Level 15 - Staff appears
  {
    level: 15,
    name: 'Cadena Adulto III',
    viewBoxSize: 24,
    palette: {
      body: '#9333ea',
      head: '#a855f7',
      accent: '#fbbf24',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'staff', level: 15, type: 'rect', x: 2, y: 10, width: 2, height: 12, fill: '#92400e' },
      { name: 'staff_gem', level: 15, type: 'rect', x: 1, y: 8, width: 4, height: 3, fill: 'accent' },
    ],
    effects: { glowIntensity: 0.5, hasParticles: true, particleColor: '#fbbf24' },
  },

  // Level 16 - Crown base (Master phase)
  {
    level: 16,
    name: 'Maestro Nodo I',
    viewBoxSize: 26,
    palette: {
      body: '#1d4ed8',
      head: '#3b82f6',
      accent: '#fbbf24',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'crown_base', level: 16, type: 'rect', x: 9, y: 0, width: 8, height: 3, fill: '#fbbf24' },
    ],
    effects: { hasAura: true, auraColor: '#3b82f6' },
  },

  // Level 17 - Crown gems
  {
    level: 17,
    name: 'Maestro Nodo II',
    viewBoxSize: 26,
    palette: {
      body: '#1d4ed8',
      head: '#3b82f6',
      accent: '#fbbf24',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'crown_gem_1', level: 17, type: 'rect', x: 11, y: 1, width: 1, height: 1, fill: '#ef4444' },
      { name: 'crown_gem_2', level: 17, type: 'rect', x: 14, y: 1, width: 1, height: 1, fill: '#22c55e' },
    ],
    effects: {},
  },

  // Level 18 - Full master robes
  {
    level: 18,
    name: 'Maestro Nodo III',
    viewBoxSize: 26,
    palette: {
      body: '#1d4ed8',
      head: '#3b82f6',
      accent: '#fbbf24',
      detail: '#1f2937',
      glow: '#fbbf24',
    },
    features: [
      { name: 'robe_inner', level: 18, type: 'rect', x: 8, y: 13, width: 10, height: 9, fill: 'head' },
      { name: 'medallion', level: 18, type: 'rect', x: 11, y: 15, width: 4, height: 4, fill: '#fbbf24' },
    ],
    effects: { glowIntensity: 0.6 },
  },

  // Level 19 - Divine rays
  {
    level: 19,
    name: 'Ascendente I',
    viewBoxSize: 28,
    palette: {
      body: '#fbbf24',
      head: '#fcd34d',
      accent: '#ffffff',
      detail: '#1f2937',
      glow: '#ffffff',
    },
    features: [
      { name: 'ray_1', level: 19, type: 'rect', x: 13, y: 0, width: 2, height: 3, fill: 'accent', opacity: 0.5 },
      { name: 'ray_2', level: 19, type: 'rect', x: 6, y: 2, width: 2, height: 2, fill: 'accent', opacity: 0.3 },
      { name: 'ray_3', level: 19, type: 'rect', x: 20, y: 2, width: 2, height: 2, fill: 'accent', opacity: 0.3 },
    ],
    effects: { hasAura: true, auraColor: '#fbbf24' },
  },

  // Level 20 - Full golden form
  {
    level: 20,
    name: 'Ascendente II',
    viewBoxSize: 28,
    palette: {
      body: '#fbbf24',
      head: '#fcd34d',
      accent: '#ffffff',
      detail: '#1f2937',
      glow: '#ffffff',
    },
    features: [
      { name: 'divine_eye_l', level: 20, type: 'rect', x: 10, y: 9, width: 2, height: 1, fill: '#ffffff' },
      { name: 'divine_eye_r', level: 20, type: 'rect', x: 16, y: 9, width: 2, height: 1, fill: '#ffffff' },
    ],
    effects: { glowIntensity: 0.8, hasParticles: true, particleColor: '#fbbf24' },
  },

  // Level 21 - LEGEND (Satoshi form)
  {
    level: 21,
    name: 'Satoshi Legendario',
    viewBoxSize: 28,
    palette: {
      body: '#fbbf24',
      head: '#fcd34d',
      accent: '#ffffff',
      detail: '#92400e',
      glow: '#ffffff',
    },
    features: [
      { name: 'satoshi_symbol', level: 21, type: 'rect', x: 12, y: 17, width: 4, height: 6, fill: 'detail' },
      { name: 'infinity_loop', level: 21, type: 'rect', x: 11, y: 19, width: 6, height: 2, fill: '#ffffff', opacity: 0.8 },
      { name: 'halo', level: 21, type: 'circle', x: 14, y: 4, r: 3, fill: '#ffffff', opacity: 0.3 },
    ],
    effects: {
      hasAura: true,
      auraColor: '#fbbf24',
      glowIntensity: 1.0,
      hasParticles: true,
      particleColor: '#ffffff',
    },
  },
];

/**
 * Get configuration for a specific level
 */
export function getLevelConfig(level: number): LevelConfig {
  const config = LEVEL_CONFIGS.find(c => c.level === level);
  return config || LEVEL_CONFIGS[0];
}

/**
 * Get all features for a given level (cumulative from level 1)
 */
export function getAllFeaturesForLevel(level: number): SpriteFeature[] {
  const features: SpriteFeature[] = [];

  for (const config of LEVEL_CONFIGS) {
    if (config.level <= level) {
      features.push(...config.features);
    }
  }

  return features;
}

/**
 * Get the active palette for a level
 */
export function getPaletteForLevel(level: number): LevelConfig['palette'] {
  // Find the highest level config that applies
  let palette = LEVEL_CONFIGS[0].palette;

  for (const config of LEVEL_CONFIGS) {
    if (config.level <= level) {
      palette = config.palette;
    }
  }

  return palette;
}

/**
 * Get viewBox size for level
 */
export function getViewBoxForLevel(level: number): number {
  const config = getLevelConfig(level);
  return config.viewBoxSize;
}
