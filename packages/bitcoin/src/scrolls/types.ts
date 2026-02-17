/**
 * Scrolls API Types
 *
 * Type definitions for the Charms Scrolls API.
 * API Documentation: https://scrolls.charms.dev
 */

/**
 * Supported Bitcoin networks
 */
export type ScrollsNetwork = "main" | "testnet4";

/**
 * Configuration response from /config endpoint
 *
 * Example response:
 * {
 *   "fee_address": { "main": "bc1q...", "testnet4": "tb1q..." },
 *   "fee_per_input": 64,
 *   "fee_basis_points": 10,
 *   "fixed_cost": 895
 * }
 */
export interface ScrollsConfig {
  fee_address: {
    main: string;
    testnet4: string;
  };
  fee_per_input: number;
  fee_basis_points: number;
  fixed_cost: number;
}

/**
 * Sign input for transaction signing
 */
export interface SignInput {
  index: number;
  nonce: number;
}

/**
 * Request body for POST /sign endpoint
 */
export interface SignRequest {
  sign_inputs: SignInput[];
  prev_txs: string[]; // Hex-encoded previous transactions
  tx_to_sign: string; // Hex-encoded transaction to sign
}

/**
 * Fee calculation result
 */
export interface FeeCalculation {
  fixedCost: number;
  inputFees: number;
  percentageFee: number;
  totalFee: number;
  feeAddress: string;
}

/**
 * Charm token data structure
 */
export interface CharmToken {
  id: string;
  ticker: string;
  amount: bigint;
  txid: string;
  vout: number;
}

/**
 * UTXO with charm data
 */
export interface CharmUTXO {
  txid: string;
  vout: number;
  value: number; // Satoshis
  scriptPubKey: string;
  charms?: CharmToken[];
}

/**
 * Spell configuration for charm operations
 */
export interface SpellConfig {
  version: string;
  app: string;
  inputs: SpellInput[];
  outputs: SpellOutput[];
}

/**
 * Spell input
 */
export interface SpellInput {
  type: "utxo" | "charm";
  txid?: string;
  vout?: number;
  amount?: bigint;
}

/**
 * Spell output
 */
export interface SpellOutput {
  type: "burn" | "transfer" | "mint";
  address?: string;
  amount?: bigint;
  data?: string;
}

/**
 * API response wrapper
 */
export interface ScrollsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Token balance for a specific address
 */
export interface TokenBalance {
  /** Token ticker (e.g., 'BABY') */
  ticker: string;
  /** Token ID (rune/charm identifier) */
  tokenId: string;
  /** Balance amount */
  amount: bigint;
  /** Number of UTXOs holding this token */
  utxoCount: number;
}

/**
 * Address token balances response
 */
export interface AddressTokenBalances {
  /** Address queried */
  address: string;
  /** Network */
  network: ScrollsNetwork;
  /** All token balances for this address */
  balances: TokenBalance[];
  /** Block height at time of query */
  blockHeight: number;
  /** Timestamp of the query */
  timestamp: number;
}

/**
 * Token UTXO details
 */
export interface TokenUTXO {
  /** Transaction ID */
  txid: string;
  /** Output index */
  vout: number;
  /** Satoshi value */
  satoshis: number;
  /** Token amount in this UTXO */
  tokenAmount: bigint;
  /** Token ticker */
  ticker: string;
  /** Confirmation status */
  confirmed: boolean;
  /** Block height if confirmed */
  blockHeight?: number;
}
