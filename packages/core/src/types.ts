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
// NFT CANONICAL TYPES (Re-exported from @bitcoinbaby/bitcoin)
// These are the canonical types stored on Bitcoin via Charms.
// Single source of truth: packages/bitcoin/src/charms/nft.ts
// =============================================================================

export {
  // Types
  type Bloodline,
  type RarityTier,
  type BaseType,
  type BabyNFTState,
  type BabyNFTInfo,
  // Constants
  XP_REQUIREMENTS,
  EVOLUTION_COSTS,
  LEVEL_BOOSTS,
  GENESIS_BABIES_CONFIG,
  // Functions
  getMiningBoost,
  canLevelUp,
  calculateXpGain,
  getTraitsFromDNA,
} from "@bitcoinbaby/bitcoin";

/**
 * Heritage (cultural origin) for visual diversity
 * (UI extension, not stored on-chain)
 */
export type Heritage = "americas" | "africa" | "asia" | "europa" | "oceania";

// Max level constant for convenience
export const MAX_LEVEL = 10;

/**
 * Get XP required for next level
 */
export function getXpForNextLevel(level: number): number {
  const { XP_REQUIREMENTS } = require("@bitcoinbaby/bitcoin");
  return XP_REQUIREMENTS[level + 1] ?? 0;
}
