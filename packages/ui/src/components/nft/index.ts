/**
 * NFT UI Components
 *
 * Pixel art display components for Genesis Baby NFTs.
 */

// NFT types (local mirror of @bitcoinbaby/bitcoin/charms/nft types)
export type {
  BabyNFTState,
  BabyNFTInfo,
  Bloodline,
  RarityTier,
  BaseType,
} from "./types";

export {
  getMiningBoost,
  canLevelUp,
  getXpForNextLevel,
  getEvolutionCostDisplay,
  MAX_LEVEL,
  XP_REQUIREMENTS,
  LEVEL_BOOSTS,
  RARITY_BOOSTS,
  EVOLUTION_COSTS,
} from "./types";

// Components
export { NFTCard, type NFTCardProps } from "./NFTCard";
export {
  NFTGrid,
  type NFTGridProps,
  type NFTGridFilters,
  type NFTSortKey,
  type NFTSortOrder,
} from "./NFTGrid";
export { NFTStats, type NFTStatsProps } from "./NFTStats";
export { NFTSprite } from "./NFTSprite";

// Trait Configuration
export {
  getNFTVisualConfig,
  resolvePaletteColor,
  getDNAColorVariation,
  BASE_TYPE_CONFIGS,
  BLOODLINE_CONFIGS,
  RARITY_CONFIGS,
  type TraitVisualConfig,
  type SpriteFeature,
  type ColorPalette,
  type EffectsConfig,
} from "./trait-config";
