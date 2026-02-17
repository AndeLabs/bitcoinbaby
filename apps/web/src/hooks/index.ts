// Blockchain hooks
export {
  useMining,
  type MiningState,
  type UseMiningOptions,
} from "./useMining";
export {
  useMiningWithNFTs,
  type UseMiningWithNFTsOptions,
} from "./useMiningWithNFTs";
export {
  useCharms,
  type CharmsState,
  type UseCharmsOptions,
} from "./useCharms";
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

// Game hooks
export { useGameLoop } from "./useGameLoop";
export { useAchievements } from "./useAchievements";
export { useBabyState } from "./useBabyState";

// NFT hooks
export { useMintNFT, type MintState, type MintResult } from "./useMintNFT";
