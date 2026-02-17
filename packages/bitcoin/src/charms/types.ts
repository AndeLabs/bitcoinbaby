/**
 * Charms Protocol Types (v2)
 *
 * Core types for Charms protocol integration.
 * Based on official Charms documentation and BRO reference implementation.
 */

import {
  type ScrollsNetwork,
  type NetworkEndpoints,
  NETWORK_ENDPOINTS,
} from "../types";

// =============================================================================
// NETWORK & CONFIG (Re-export from shared types)
// =============================================================================

/** @deprecated Use ScrollsNetwork from ../types instead */
export type CharmsNetwork = ScrollsNetwork;

export interface CharmsConfig {
  network: ScrollsNetwork;
  scrollsUrl: string;
  mempoolUrl: string;
}

export interface ScrollsConfigResponse {
  fee_address: {
    main: string;
    testnet4: string;
  };
  fee_per_input: number;
  fee_basis_points: number;
  fixed_cost: number;
}

// =============================================================================
// SPELL FORMAT (v2)
// =============================================================================

/**
 * Charms Spell v2 format
 * Reference: https://docs.charms.dev/references/spell-json/
 */
export interface SpellV2 {
  version: 2;
  apps: Record<string, string>; // "$00" -> "n/<app_id>/<vk>" or "t/<app_id>/<vk>"
  public_inputs?: Record<string, unknown>;
  private_inputs?: Record<string, unknown>;
  ins: SpellV2Input[];
  outs: SpellV2Output[];
}

export interface SpellV2Input {
  utxo_id: string; // "txid:vout"
  charms: Record<string, unknown>; // "$00" -> state object or amount
}

export interface SpellV2Output {
  address: string;
  charms: Record<string, unknown>;
  sats: number;
}

/**
 * App type prefix
 * - "n/" = Non-fungible (NFT)
 * - "t/" = Token (fungible)
 */
export type AppType = "n" | "t";

export interface AppReference {
  type: AppType;
  appId: string;
  verificationKey: string;
}

/**
 * Parse app reference from string like "n/<app_id>/<vk>"
 */
export function parseAppReference(ref: string): AppReference {
  const parts = ref.split("/");
  if (parts.length !== 3) {
    throw new Error(`Invalid app reference: ${ref}`);
  }

  const type = parts[0] as AppType;
  if (type !== "n" && type !== "t") {
    throw new Error(`Invalid app type: ${type}`);
  }

  return {
    type,
    appId: parts[1],
    verificationKey: parts[2],
  };
}

/**
 * Create app reference string
 */
export function createAppReference(
  type: AppType,
  appId: string,
  vk: string,
): string {
  return `${type}/${appId}/${vk}`;
}

// =============================================================================
// CHARM DATA
// =============================================================================

/**
 * Extracted charm from a transaction
 */
export interface ExtractedCharm {
  ticker: string;
  amount: bigint;
  address: string;
  appId: string;
  appType: AppType;
  state?: Record<string, unknown>;
}

/**
 * Charm balance for an address
 */
export interface CharmBalance {
  ticker: string;
  appId: string;
  appType: AppType;
  balance: bigint;
  utxos: CharmUTXOInfo[];
}

export interface CharmUTXOInfo {
  txid: string;
  vout: number;
  amount: bigint;
  state?: Record<string, unknown>;
}

// =============================================================================
// TRANSACTION BUILDING
// =============================================================================

export interface CharmTransactionParams {
  spell: SpellV2;
  fundingUtxos: FundingUTXO[];
  feeRate: number;
  changeAddress: string;
}

export interface FundingUTXO {
  txid: string;
  vout: number;
  value: number;
  scriptPubKey: string;
}

export interface CharmTransaction {
  psbt: string;
  spell: SpellV2;
  estimatedFee: number;
  scrollsFee: number;
}

// =============================================================================
// SIGNING
// =============================================================================

export interface ScrollsSignRequest {
  sign_inputs: ScrollsSignInput[];
  prev_txs: string[];
  tx_to_sign: string;
}

export interface ScrollsSignInput {
  index: number;
  nonce: bigint;
}

export interface SignedCharmTransaction {
  txHex: string;
  txid: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const DUST_LIMIT = 546;

/** @deprecated Use NETWORK_ENDPOINTS from ../types instead */
export const SCROLLS_URLS: Record<ScrollsNetwork, string> = {
  main: NETWORK_ENDPOINTS.mainnet.scrollsApi,
  testnet4: NETWORK_ENDPOINTS.testnet4.scrollsApi,
};

/** @deprecated Use NETWORK_ENDPOINTS from ../types instead */
export const MEMPOOL_URLS: Record<ScrollsNetwork, string> = {
  main: NETWORK_ENDPOINTS.mainnet.mempoolApi,
  testnet4: NETWORK_ENDPOINTS.testnet4.mempoolApi,
};
