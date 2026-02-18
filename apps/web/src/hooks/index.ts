// =============================================================================
// APP-SPECIFIC HOOKS
// These hooks are specific to the web app with features like caching,
// pending balance tracking, and integration with app-specific stores.
// For shared/general hooks, see @bitcoinbaby/core
// =============================================================================

// Blockchain hooks
/**
 * @deprecated Use `useGlobalMining` from `@bitcoinbaby/core` for persistent mining.
 * This local hook is kept for backwards compatibility only.
 */
/**
 * @deprecated Use `useGlobalMining` from `@bitcoinbaby/core` for persistent mining.
 */
export {
  useMining,
  type MiningState,
  type UseMiningOptions,
} from "./useMining";
// Note: This is the app-specific CharmsService wrapper, different from
// the simpler hooks in @bitcoinbaby/core/hooks/useCharms
export {
  useCharmsService,
  type CharmsState,
  type UseCharmsOptions,
} from "./useCharmsService";
export {
  useBalance,
  type BalanceState,
  type UseBalanceOptions,
} from "./useBalance";
export {
  useWallet,
  type WalletState,
  type WalletActions,
  type UseWalletReturn,
} from "./useWallet";
export {
  useMiningSubmitter,
  type MiningSubmitterState,
  type MiningSubmitterActions,
  type UseMiningSubmitterReturn,
  type UseMiningSubmitterOptions,
} from "./useMiningSubmitter";
export {
  useTokenBalance,
  formatTokenBalance,
  clearBalanceCache,
  clearAddressBalanceCache,
  type TokenBalanceState,
  type TokenBalanceActions,
  type UseTokenBalanceReturn,
  type UseTokenBalanceOptions,
  type TokenInfo,
} from "./useTokenBalance";
export {
  useTransactionHistory,
  type TransactionHistoryState,
  type TransactionHistoryActions,
  type UseTransactionHistoryReturn,
  type UseTransactionHistoryOptions,
} from "./useTransactionHistory";

// Game hooks - re-exported from @bitcoinbaby/core
// Local versions deprecated, use from core
export { useBabyState } from "./useBabyState";

// NFT hooks
/**
 * @deprecated Use `useNFTMinting` from `@bitcoinbaby/core` for full blockchain integration.
 */
export { useMintNFT, type MintState, type MintResult } from "./useMintNFT";

// Platform hooks
export { useCapacitor, type UseCapacitorReturn } from "./useCapacitor";
export { usePlatform, type Platform, type PlatformInfo } from "./usePlatform";

// SharedWorker mining (persists across tabs/navigation)
export {
  useSharedMining,
  useSharedMiningShares,
  supportsSharedWorker,
  type SharedMiningState,
  type SharedMiningConfig,
  type UseSharedMiningReturn,
  type ShareData,
} from "./useSharedMining";

// Unified persistent mining (auto-selects best strategy)
export {
  usePersistentMining,
  type UsePersistentMiningOptions,
  type UsePersistentMiningReturn,
  type MiningStrategy,
} from "./usePersistentMining";

// =============================================================================
// RE-EXPORTS FROM @bitcoinbaby/core
// These are the shared hooks from core package for convenience
// =============================================================================
export {
  // Cosmic hooks
  useCosmicState,
  useCosmicEnergy,
  useMoonPhase,
  useCosmicEvents,
  useBabyCosmicStatus,
  // Mining + Cosmic
  useMiningCosmic,
  useCosmicMiningMultiplier,
  useCosmicMiningConditions,
  // Global mining (singleton pattern)
  useGlobalMining,
  type UseGlobalMiningOptions,
  type UseGlobalMiningReturn,
  // Game hooks (centralized)
  useGameLoop,
  type UseGameLoopOptions,
  type UseGameLoopReturn,
  useAchievements,
  type UseAchievementsOptions,
  type UseAchievementsReturn,
  type AchievementNotification,
  useLeaderboard,
  type UseLeaderboardOptions,
  type UseLeaderboardReturn,
  CATEGORY_INFO,
  PERIOD_INFO,
  // Mining with NFT boost (centralized)
  useMiningWithNFTs,
  type UseMiningWithNFTsOptions,
  type UseMiningWithNFTsReturn,
  // NFT minting (centralized)
  useNFTMinting,
  type UseNFTMintingOptions,
  type UseNFTMintingReturn,
  type NFTMintResult,
} from "@bitcoinbaby/core";
