/**
 * BABTC Deployment Configuration
 *
 * This file contains deployment-specific configuration.
 * Update these values after deploying the contract to testnet4.
 *
 * Deployment Steps:
 * 1. Build contract: cd contracts/babtc && cargo build --release --target wasm32-unknown-unknown
 * 2. Create genesis UTXO on testnet4
 * 3. Deploy: charms deploy --network testnet4 --wasm <path> --genesis-utxo <txid>:<vout>
 * 4. Update this file with the output values
 */

export interface DeploymentConfig {
  /** Network identifier */
  network: "testnet4" | "mainnet";
  /** SHA256 hash of genesis UTXO - identifies the app */
  appId: string;
  /** SHA256 hash of WASM binary - verification key */
  appVk: string;
  /** Block height when contract was deployed */
  deploymentBlock?: number;
  /** Genesis UTXO that created this app */
  genesisUtxo?: string;
  /** Is this a placeholder config? */
  isPlaceholder: boolean;
}

/**
 * Testnet4 Deployment Configuration
 *
 * STATUS: DEPLOYED - Ready for mining
 *
 * Genesis UTXO: b3deba0743aeffd0e455ce442b1693107090341381e3d8bcc5f586667c3e8a81:0
 * Deployed: 2026-02-18
 */
export const BABTC_TESTNET4: DeploymentConfig = {
  network: "testnet4",
  appId: "87b5ecfbfa392550b0a221e20f28a9453ed212a343551a2a43387d0cd183681b",
  appVk: "ab70796e62562b5245cf746d7ecf4b95b86df582921ae42ec2ceea25612807c6",
  deploymentBlock: 75000, // Approximate block height
  genesisUtxo:
    "b3deba0743aeffd0e455ce442b1693107090341381e3d8bcc5f586667c3e8a81:0",
  isPlaceholder: false,
};

/**
 * Mainnet Deployment Configuration
 *
 * STATUS: NOT DEPLOYED
 * WARNING: Deploy to mainnet only after thorough testnet4 testing
 */
export const BABTC_MAINNET: DeploymentConfig = {
  network: "mainnet",
  appId: "not_deployed",
  appVk: "not_deployed",
  isPlaceholder: true,
};

/**
 * Get deployment config for a network
 */
export function getDeploymentConfig(
  network: "testnet4" | "mainnet" = "testnet4",
): DeploymentConfig {
  return network === "mainnet" ? BABTC_MAINNET : BABTC_TESTNET4;
}

/**
 * Check if deployment is ready (not placeholder)
 */
export function isDeploymentReady(
  network: "testnet4" | "mainnet" = "testnet4",
): boolean {
  const config = getDeploymentConfig(network);
  return !config.isPlaceholder;
}

/**
 * Validate that deployment config is set before mining
 */
export function validateDeployment(
  network: "testnet4" | "mainnet" = "testnet4",
): void {
  const config = getDeploymentConfig(network);
  if (config.isPlaceholder) {
    throw new Error(
      `BABTC contract not deployed to ${network}. ` +
        `See packages/bitcoin/contracts/babtc/BUILD.md for deployment instructions.`,
    );
  }
}
