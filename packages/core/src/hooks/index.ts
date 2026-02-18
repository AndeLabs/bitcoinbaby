/**
 * Hooks
 *
 * React hooks for BitcoinBaby functionality.
 */

export {
  useTokenBalance,
  useOwnedNFTs,
  useMiningBoost,
  useBTCBalance,
  useFeeEstimates,
  useBlockHeight,
  useDashboard,
} from "./useCharms";

// Cosmic hooks
export {
  useCosmicState,
  useCosmicEnergy,
  useMoonPhase,
  useCosmicEvents,
  useBabyCosmicStatus,
} from "./useCosmic";

// Mining + Cosmic integration
export {
  useMiningCosmic,
  useCosmicMiningMultiplier,
  useCosmicMiningConditions,
} from "./useMiningCosmic";

// Global mining hook (persists across navigation)
export {
  useGlobalMining,
  type UseGlobalMiningOptions,
  type UseGlobalMiningReturn,
} from "./useGlobalMining";

// Mining with NFT boost hook (global mining + Genesis Babies boost)
export {
  useMiningWithNFTs,
  type UseMiningWithNFTsOptions,
  type UseMiningWithNFTsReturn,
} from "./useMiningWithNFTs";

// Mining features hook (persistence, tab coordination, wake lock)
export {
  useMiningFeatures,
  type MiningFeatures,
  type LifetimeStats,
  type UseMiningFeaturesOptions,
  type UseMiningFeaturesReturn,
} from "./useMiningFeatures";

// Wallet provider hook (multi-wallet support)
export {
  useWalletProvider,
  type UseWalletProviderReturn,
} from "./useWalletProvider";

// Mining submission hook (connects mining to blockchain)
export {
  useMiningSubmission,
  type UseMiningSubmissionOptions,
  type UseMiningSubmissionReturn,
} from "./useMiningSubmission";

// NFT minting hook (Genesis Babies operations)
export {
  useNFTMinting,
  type UseNFTMintingOptions,
  type UseNFTMintingReturn,
  type NFTMintResult,
} from "./useNFTMinting";

// =============================================================================
// GAME HOOKS
// =============================================================================

// Game loop hook (engine lifecycle)
export {
  useGameLoop,
  type UseGameLoopOptions,
  type UseGameLoopReturn,
} from "./useGameLoop";

// Achievement tracking hook
export {
  useAchievements,
  type UseAchievementsOptions,
  type UseAchievementsReturn,
  type AchievementNotification,
} from "./useAchievements";

// Leaderboard hook
export {
  useLeaderboard,
  type UseLeaderboardOptions,
  type UseLeaderboardReturn,
  CATEGORY_INFO,
  PERIOD_INFO,
} from "./useLeaderboard";
