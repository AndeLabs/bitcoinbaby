/**
 * Estados posibles del Baby
 */
export type BabyState =
  | "sleeping"
  | "hungry"
  | "happy"
  | "learning"
  | "evolving";

/**
 * Entidad Baby - El Tamagotchi de Bitcoin
 */
export interface Baby {
  id: string;
  name: string;
  state: BabyState;
  level: number;
  experience: number;
  createdAt: Date;
  lastFed: Date;
}

/**
 * Full mining session statistics (extends mining module stats)
 */
export interface MiningSession {
  hashrate: number; // Hashes per second
  totalHashes: number; // Total hashes computed
  tokensEarned: number; // BABY tokens earned
  difficulty: number; // Current difficulty
  uptime: number; // Seconds mining
  isActive: boolean; // Mining active state
  minerType: "cpu" | "webgpu";
}

/**
 * Configuracion de mineria
 */
export interface MiningConfig {
  readonly difficulty: number;
  maxHashrate: number;
  useWebGPU: boolean;
  throttleOnBattery: boolean;
  throttleWhenHidden: boolean;
}

/**
 * Informacion de wallet
 */
export interface WalletInfo {
  address: string;
  publicKey: string;
  balance: bigint;
  babyTokens: bigint;
}

// =============================================================================
// NFT CANONICAL TYPES (On-chain)
// These are the canonical types stored on Bitcoin via Charms.
// UI can extend these for visualization purposes.
// =============================================================================

/**
 * Bloodline types - determines base multipliers and visual traits
 * These 4 bloodlines are stored on-chain in the NFT state.
 */
export type Bloodline = "royal" | "warrior" | "rogue" | "mystic";

/**
 * Base type of the baby NFT
 * These 5 base types are stored on-chain in the NFT state.
 */
export type BaseType = "human" | "animal" | "robot" | "mystic" | "alien";

/**
 * Rarity tier of the NFT
 */
export type RarityTier =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic";

/**
 * Heritage (cultural origin) for visual diversity
 */
export type Heritage = "americas" | "africa" | "asia" | "europa" | "oceania";

/**
 * Complete NFT state stored in Charm UTXO
 */
export interface BabyNFTState {
  // Immutable (set at genesis, never changes)
  readonly dna: string;
  readonly bloodline: Bloodline;
  readonly baseType: BaseType;
  readonly genesisBlock: number;
  readonly rarityTier: RarityTier;
  readonly tokenId: number;

  // Mutable (evolves with gameplay)
  level: number;
  xp: number;
  totalXp: number;
  workCount: number;
  lastWorkBlock: number;
  evolutionCount: number;
  tokensEarned: bigint;
}

// =============================================================================
// NFT CONSTANTS
// =============================================================================

export const MAX_LEVEL = 10;

export const XP_REQUIREMENTS: Record<number, number> = {
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  6: 2000,
  7: 4000,
  8: 8000,
  9: 16000,
  10: 32000,
};

export const LEVEL_BOOSTS: Record<number, number> = {
  1: 0,
  2: 5,
  3: 10,
  4: 15,
  5: 25,
  6: 35,
  7: 50,
  8: 70,
  9: 90,
  10: 120,
};

export const RARITY_BOOSTS: Record<RarityTier, number> = {
  common: 10,
  uncommon: 15,
  rare: 25,
  epic: 35,
  legendary: 50,
  mythic: 100,
};

// =============================================================================
// NFT HELPERS
// =============================================================================

export function getMiningBoost(nft: BabyNFTState): number {
  return (LEVEL_BOOSTS[nft.level] ?? 0) + (RARITY_BOOSTS[nft.rarityTier] ?? 0);
}

export function canLevelUp(nft: BabyNFTState): boolean {
  if (nft.level >= MAX_LEVEL) return false;
  const required = XP_REQUIREMENTS[nft.level + 1];
  return nft.xp >= required;
}

export function getXpForNextLevel(level: number): number {
  return XP_REQUIREMENTS[level + 1] ?? 0;
}
