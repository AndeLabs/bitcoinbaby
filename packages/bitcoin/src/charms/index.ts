/**
 * Charms Module
 *
 * Unified exports for Charms protocol integration.
 */

// =============================================================================
// TYPES
// =============================================================================

export type {
  // Network & Config
  CharmsNetwork,
  CharmsConfig,
  ScrollsConfigResponse,
  // Spell Format
  SpellV2,
  SpellV2Input,
  SpellV2Output,
  AppType,
  AppReference,
  // Charm Data
  ExtractedCharm,
  CharmBalance,
  CharmUTXOInfo,
  // Transactions
  CharmTransactionParams,
  FundingUTXO,
  CharmTransaction,
  ScrollsSignRequest,
  ScrollsSignInput,
  SignedCharmTransaction,
} from "./types";

export {
  // Constants
  DUST_LIMIT,
  SCROLLS_URLS,
  MEMPOOL_URLS,
  // Utilities
  parseAppReference,
  createAppReference,
} from "./types";

// =============================================================================
// TOKEN ($BABTC)
// =============================================================================

export type {
  BABTCMetadata,
  TokenBalance,
  MiningReward,
  TokenMintParams,
  TokenTransferParams,
} from "./token";

export {
  // Config
  BABTC_CONFIG,
  BABTC_METADATA,
  // Calculations
  getCurrentEpoch,
  calculateBlockReward,
  calculateMiningReward,
  formatTokenAmount,
  parseTokenAmount,
  // Spell Generation
  createTokenMintSpell,
  createTokenTransferSpell,
} from "./token";

// =============================================================================
// NFT (GENESIS BABIES)
// =============================================================================

export type {
  Bloodline,
  RarityTier,
  BaseType,
  BabyNFTState,
  BabyNFTInfo,
  TraitSet,
  NFTGenesisParams,
  NFTWorkProofParams,
  NFTLevelUpParams,
} from "./nft";

export {
  // Config
  GENESIS_BABIES_CONFIG,
  XP_REQUIREMENTS,
  EVOLUTION_COSTS,
  LEVEL_BOOSTS,
  // Calculations
  getMiningBoost,
  canLevelUp,
  calculateXpGain,
  getTraitsFromDNA,
  calculateRarityScore,
  // Spell Generation
  createNFTGenesisSpell,
  createNFTWorkProofSpell,
  createNFTLevelUpSpell,
} from "./nft";

// =============================================================================
// CLIENT
// =============================================================================

export type { CharmsClientOptions } from "./client";

export { CharmsClient, CharmsError, createCharmsClient } from "./client";

// =============================================================================
// EVOLUTION SERVICE
// =============================================================================

export type {
  EvolutionServiceOptions,
  EvolutionStatus,
  EvolutionResult,
} from "./evolution";

export {
  EvolutionService,
  EvolutionError,
  createEvolutionService,
} from "./evolution";
