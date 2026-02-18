/**
 * Wallet Provider Types
 *
 * Abstraction layer for Bitcoin wallets.
 * Supports both internal (self-custodied) and external (browser extension) wallets.
 */

import type { Psbt } from "bitcoinjs-lib";
import type { BitcoinNetwork } from "../types";

/**
 * Supported wallet provider types
 */
export type WalletProviderType =
  | "internal" // Self-custodied HD wallet
  | "unisat" // Unisat browser extension
  | "xverse" // XVerse browser extension
  | "leather" // Leather (Hiro) browser extension
  | "okx"; // OKX browser extension

/**
 * Account information returned by wallet providers
 */
export interface WalletAccount {
  address: string;
  publicKey: string;
  addressType: "taproot" | "segwit" | "legacy";
}

/**
 * Connection state
 */
export interface WalletConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  account: WalletAccount | null;
  network: BitcoinNetwork;
  providerType: WalletProviderType | null;
  error: string | null;
}

/**
 * Signed message result
 */
export interface SignedMessage {
  signature: string;
  address: string;
  message: string;
}

/**
 * Signed PSBT result
 */
export interface SignedPsbt {
  signedPsbtHex: string;
  signedPsbtBase64: string;
  txid?: string;
}

/**
 * Transaction broadcast result
 */
export interface BroadcastResult {
  txid: string;
  success: boolean;
  error?: string;
}

/**
 * Provider capabilities
 */
export interface ProviderCapabilities {
  signMessage: boolean;
  signPsbt: boolean;
  sendBitcoin: boolean;
  inscribe: boolean;
  getBalance: boolean;
  switchNetwork: boolean;
}

/**
 * Wallet Provider Interface
 *
 * All wallet implementations must implement this interface.
 * This allows seamless switching between internal and external wallets.
 */
export interface WalletProvider {
  /**
   * Provider type identifier
   */
  readonly type: WalletProviderType;

  /**
   * Provider display name
   */
  readonly name: string;

  /**
   * Provider capabilities
   */
  readonly capabilities: ProviderCapabilities;

  /**
   * Check if provider is available (extension installed, etc.)
   */
  isAvailable(): boolean;

  /**
   * Connect to the wallet
   * For external wallets, this triggers the connection popup
   * For internal wallet, this unlocks with password
   */
  connect(options?: ConnectOptions): Promise<WalletAccount>;

  /**
   * Disconnect from the wallet
   */
  disconnect(): Promise<void>;

  /**
   * Get current account (null if not connected)
   */
  getAccount(): Promise<WalletAccount | null>;

  /**
   * Get current network
   */
  getNetwork(): Promise<BitcoinNetwork>;

  /**
   * Switch network (if supported)
   */
  switchNetwork?(network: BitcoinNetwork): Promise<void>;

  /**
   * Sign a message
   */
  signMessage(message: string): Promise<SignedMessage>;

  /**
   * Sign a PSBT
   * @param psbt - PSBT to sign (hex or base64)
   * @param options - Signing options
   */
  signPsbt(psbt: string | Psbt, options?: SignPsbtOptions): Promise<SignedPsbt>;

  /**
   * Sign and broadcast a PSBT
   */
  signAndBroadcast(psbt: string | Psbt): Promise<BroadcastResult>;

  /**
   * Get balance in satoshis
   */
  getBalance?(): Promise<bigint>;

  /**
   * Listen for account changes
   */
  onAccountChange?(callback: (account: WalletAccount | null) => void): () => void;

  /**
   * Listen for network changes
   */
  onNetworkChange?(callback: (network: BitcoinNetwork) => void): () => void;
}

/**
 * Connect options
 */
export interface ConnectOptions {
  // For internal wallet
  password?: string;
  mnemonic?: string;

  // For external wallets
  requestAccounts?: boolean;
}

/**
 * PSBT signing options
 */
export interface SignPsbtOptions {
  // Which inputs to sign (default: all)
  inputsToSign?: number[];

  // Whether to finalize inputs after signing
  finalize?: boolean;

  // Whether to broadcast after signing
  broadcast?: boolean;

  // Sighash type
  sighashType?: number;
}

/**
 * Provider detection result
 */
export interface DetectedProvider {
  type: WalletProviderType;
  name: string;
  icon?: string;
  available: boolean;
}

/**
 * Provider registry for managing multiple providers
 */
export interface ProviderRegistry {
  /**
   * Register a provider
   */
  register(provider: WalletProvider): void;

  /**
   * Get a provider by type
   */
  get(type: WalletProviderType): WalletProvider | undefined;

  /**
   * Get all registered providers
   */
  getAll(): WalletProvider[];

  /**
   * Get all available (installed) providers
   */
  getAvailable(): WalletProvider[];

  /**
   * Detect which providers are available
   */
  detect(): DetectedProvider[];
}
