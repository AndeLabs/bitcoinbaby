/**
 * @bitcoinbaby/bitcoin
 *
 * Bitcoin wallet and transaction utilities.
 * Built on bitcoinjs-lib with Charms protocol support.
 */

// Types
export * from "./types";

// Errors
export * from "./errors";

// Validation - canonical validators using bitcoinjs-lib
export {
  ValidationError,
  validateAddress, // Uses bitcoinjs-lib for cryptographic validation
  validateTxid,
  validateHash,
  validateTxHex,
  validateSatoshis,
  validateDifficulty,
  validateNonce,
  validateTimestamp,
  isHex,
  isHexBytes,
  requireValidAddress,
  requireValidTxid,
  requireValidHash,
} from "./validation";

// Crypto utilities
export {
  randomBytes,
  secureErase,
  sha256,
  hash256,
  hexToBytes,
  bytesToHex,
  getPublicKey,
  signSchnorr,
  verifySchnorr,
} from "./crypto";

// Wallet
export {
  BitcoinWallet,
  // validateAddress removed - use the canonical one from validation.ts
  getAddressType,
  formatAddress,
  satsToBtc,
  btcToSats,
  generateMnemonicFromEntropy,
  validateMnemonic,
  generateRandomMnemonic,
} from "./wallet";

// Charms integration (legacy - deprecated)
export {
  CharmsClient as LegacyCharmsClient,
  type CharmsConfig,
} from "./charms-legacy";

// Charms Protocol (v2)
export {
  // Types
  type CharmsNetwork,
  type SpellV2,
  type SpellV2Input,
  type SpellV2Output,
  type AppType,
  type ExtractedCharm,
  type CharmBalance,
  type ScrollsConfigResponse,
  // Constants
  DUST_LIMIT,
  SCROLLS_URLS,
  MEMPOOL_URLS,
  // Utilities
  parseAppReference,
  createAppReference,
  // Token ($BABTC)
  type BABTCMetadata,
  type TokenBalance as CharmsTokenBalance,
  type MiningReward,
  BABTC_CONFIG,
  BABTC_METADATA,
  getCurrentEpoch,
  calculateBlockReward,
  calculateMiningReward,
  formatTokenAmount,
  parseTokenAmount,
  createTokenMintSpell,
  createTokenTransferSpell,
  // NFT (Genesis Babies)
  type Bloodline,
  type RarityTier,
  type BaseType,
  type BabyNFTState,
  type BabyNFTInfo,
  GENESIS_BABIES_CONFIG,
  XP_REQUIREMENTS,
  EVOLUTION_COSTS,
  LEVEL_BOOSTS,
  getMiningBoost,
  canLevelUp,
  calculateXpGain,
  getTraitsFromDNA,
  createNFTGenesisSpell,
  createNFTWorkProofSpell,
  createNFTLevelUpSpell,
  // Client
  type CharmsClientOptions,
  CharmsClient,
  CharmsError,
  createCharmsClient,
  // Evolution Service
  type EvolutionServiceOptions,
  type EvolutionStatus,
  type EvolutionResult,
  EvolutionService,
  EvolutionError,
  createEvolutionService,
} from "./charms/index";

// Scrolls API & Charms Service
export {
  // Client
  ScrollsClient,
  ScrollsAPIError,
  createScrollsClient,
  type ScrollsClientOptions,
  // Service
  CharmsService,
  createCharmsService,
  type CharmsServiceOptions,
  // Types
  type ScrollsNetwork,
  type ScrollsConfig,
  type SignInput,
  type SignRequest,
  type FeeCalculation,
  type CharmToken,
  type CharmUTXO,
  type SpellConfig,
  type SpellInput,
  type SpellOutput,
  type TokenBalance,
  type AddressTokenBalances,
  type TokenUTXO,
} from "./scrolls";

// Blockchain API (Mempool.space)
export {
  MempoolClient,
  MempoolAPIError,
  createMempoolClient,
  type MempoolClientOptions,
  type UTXO,
  type AddressBalance,
  type TransactionInfo,
  type FeeEstimates,
  type BlockchainAPI,
} from "./blockchain";

// Mining integration
export {
  MiningSubmitter,
  createMiningSubmitter,
  type MiningSubmitterOptions,
  type MiningSubmission,
  type SubmissionStatus,
  type SubmissionResult,
  type MiningProof,
  type RewardParams,
} from "./mining";

// Re-export bitcoinjs-lib Psbt for PSBT handling
export { Psbt } from "bitcoinjs-lib";

// Transactions
export {
  // Builder
  TransactionBuilder,
  createTransactionBuilder,
  estimateFee,
  // Spell Encoder
  encodeSpellForWitness,
  decodeSpellFromWitness,
  createSpellOpReturn,
  calculateSpellSize,
  validateSpell,
  // Types
  type TxUTXO,
  type TxInput,
  type TxOutput,
  type UnsignedTx,
  type SignedTx,
  type CharmsTx,
  type MiningTx,
  type TxBuilderOptions,
  type CoinSelection,
  type FeeEstimate,
  type BroadcastResult,
} from "./transactions";

// Wallet Providers
export {
  // Types
  type WalletProviderType,
  type WalletAccount,
  type WalletConnectionState,
  type SignedMessage,
  type SignedPsbt,
  type BroadcastResult as ProviderBroadcastResult,
  type ProviderCapabilities,
  type WalletProvider,
  type ConnectOptions,
  type SignPsbtOptions,
  type DetectedProvider,
  type ProviderRegistry,
  // Providers
  InternalWalletProvider,
  createInternalProvider,
  type InternalProviderOptions,
  UnisatProvider,
  createUnisatProvider,
  XVerseProvider,
  createXVerseProvider,
  // Registry
  getProviderRegistry,
  createProviderRegistry,
  detectWallets,
  getProvider,
  getAvailableProviders,
  hasAvailableWallet,
  getBestProvider,
} from "./providers";
