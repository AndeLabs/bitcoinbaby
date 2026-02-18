/**
 * Configuration Module
 *
 * Network configuration and deployment settings.
 */

export {
  // Endpoints
  TESTNET4_ENDPOINTS,
  // BABTC Config
  BABTC_TESTNET4,
  isBABTCConfigured,
  requireBABTCConfigured,
  // Mining Config
  MINING_CONFIG_TESTNET4,
  // Network Helpers
  toScrollsNetwork,
  toBitcoinNetwork,
  // Status
  getDeploymentStatus,
} from "./testnet4";
