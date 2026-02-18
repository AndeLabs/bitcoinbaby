/**
 * Testnet4 Configuration
 *
 * Configuration for BABTC deployment on Bitcoin testnet4.
 * Update these values after deploying the BABTC contract.
 *
 * Deployment Steps:
 * 1. Build the Rust contract: packages/bitcoin/contracts/babtc/BUILD.md
 * 2. Deploy to testnet4 using Charms CLI
 * 3. Update BABTC_APP_ID and BABTC_APP_VK below
 * 4. Run E2E tests to verify
 */

import type { ScrollsNetwork } from "../scrolls/types";
import type { BitcoinNetwork } from "../types";

// =============================================================================
// NETWORK ENDPOINTS
// =============================================================================

export const TESTNET4_ENDPOINTS = {
  /** Mempool.space API for testnet4 */
  mempool: "https://mempool.space/testnet4/api",

  /** Block explorer URL */
  explorer: "https://mempool.space/testnet4",

  /** Scrolls API for Charms indexing */
  scrolls: "https://scrolls.charms.dev",

  /** Charms Explorer */
  charmsExplorer: "https://explorer.charms.dev",
} as const;

// =============================================================================
// BABTC DEPLOYMENT CONFIG
// =============================================================================

/**
 * BABTC App Configuration
 *
 * IMPORTANT: Update these values after deploying the contract!
 *
 * To get these values:
 * 1. Deploy the BABTC contract using Charms CLI
 * 2. App ID = SHA256 of genesis UTXO (txid:vout)
 * 3. App VK = SHA256 of compiled WASM binary
 */
export const BABTC_TESTNET4 = {
  /**
   * App ID - SHA256 hash of the genesis UTXO
   *
   * Set to 'PLACEHOLDER' until deployed.
   * Format: 64-character hex string
   *
   * Example: "a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd"
   */
  appId:
    process.env.NEXT_PUBLIC_BABTC_APP_ID ||
    process.env.BABTC_APP_ID ||
    "PLACEHOLDER_DEPLOY_CONTRACT_FIRST",

  /**
   * Verification Key - SHA256 hash of the WASM binary
   *
   * Generated when compiling the Rust contract.
   * Format: 64-character hex string
   */
  appVk:
    process.env.NEXT_PUBLIC_BABTC_APP_VK ||
    process.env.BABTC_APP_VK ||
    "PLACEHOLDER_COMPILE_CONTRACT_FIRST",

  /** Token ticker */
  ticker: "BABTC",

  /** Token name */
  name: "BitcoinBaby",

  /** Decimal places */
  decimals: 8,
} as const;

/**
 * Check if BABTC is properly configured for deployment
 */
export function isBABTCConfigured(): boolean {
  return (
    !BABTC_TESTNET4.appId.startsWith("PLACEHOLDER") &&
    !BABTC_TESTNET4.appVk.startsWith("PLACEHOLDER")
  );
}

/**
 * Validate BABTC configuration
 * Throws error if not properly configured
 */
export function requireBABTCConfigured(): void {
  if (!isBABTCConfigured()) {
    throw new Error(
      "BABTC not configured for testnet4. " +
        "Please deploy the contract and set BABTC_APP_ID and BABTC_APP_VK environment variables. " +
        "See packages/bitcoin/contracts/babtc/BUILD.md for instructions.",
    );
  }

  // Validate format
  if (BABTC_TESTNET4.appId.length !== 64) {
    throw new Error(`Invalid BABTC_APP_ID length: expected 64 hex chars`);
  }
  if (BABTC_TESTNET4.appVk.length !== 64) {
    throw new Error(`Invalid BABTC_APP_VK length: expected 64 hex chars`);
  }
}

// =============================================================================
// MINING CONFIG
// =============================================================================

export const MINING_CONFIG_TESTNET4 = {
  /** Minimum PoW difficulty (leading zero bits) */
  minDifficulty: 16,

  /** Target share time in seconds */
  targetShareTime: 60,

  /** Minimum UTXO value for mining transactions */
  minUtxoValue: 7000,

  /** Sats for spell output (Charms protocol minimum) */
  spellOutputSats: 700,

  /** Fee buffer percentage */
  feeBufferPercent: 20,
} as const;

// =============================================================================
// NETWORK HELPERS
// =============================================================================

/**
 * Get Scrolls network name from Bitcoin network
 */
export function toScrollsNetwork(network: BitcoinNetwork): ScrollsNetwork {
  switch (network) {
    case "mainnet":
      return "main";
    case "testnet":
    case "testnet4":
      return "testnet4";
    case "regtest":
      return "testnet4"; // No regtest in Scrolls, use testnet4
    default:
      return "testnet4";
  }
}

/**
 * Get Bitcoin network from Scrolls network
 */
export function toBitcoinNetwork(network: ScrollsNetwork): BitcoinNetwork {
  return network === "main" ? "mainnet" : "testnet4";
}

// =============================================================================
// DEPLOYMENT STATUS
// =============================================================================

/**
 * Get deployment status for display
 */
export function getDeploymentStatus(): {
  configured: boolean;
  network: string;
  appId: string;
  appVk: string;
  message: string;
} {
  const configured = isBABTCConfigured();

  return {
    configured,
    network: "testnet4",
    appId: configured
      ? BABTC_TESTNET4.appId.substring(0, 16) + "..."
      : "Not configured",
    appVk: configured
      ? BABTC_TESTNET4.appVk.substring(0, 16) + "..."
      : "Not configured",
    message: configured
      ? "BABTC contract deployed and ready"
      : "Deploy BABTC contract to testnet4 to enable mining. See BUILD.md for instructions.",
  };
}
