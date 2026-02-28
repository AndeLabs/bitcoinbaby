/**
 * Treasury Configuration
 *
 * Addresses for receiving payments (NFT sales, fees, etc.)
 * These are separate from BitcoinBaby operational wallets.
 */

// =============================================================================
// NFT SALES TREASURY (Testnet4)
// =============================================================================

/**
 * NFT Sales Treasury Address
 *
 * All NFT sale payments (50,000 sats each) go here.
 * This wallet is SEPARATE from BitcoinBaby operational funds.
 *
 * Network: Testnet4
 * Type: Taproot (P2TR)
 */
export const NFT_TREASURY_TESTNET4 =
  "tb1p7kk2fuf8kv5vjftczlezfded94v9ay9s0h7ggd87k5d5ws744lesw7smmu";

// Mainnet (set when ready for production)
export const NFT_TREASURY_MAINNET = "";

/**
 * Get treasury address for current network
 */
export function getNFTTreasuryAddress(
  network: "testnet4" | "mainnet" = "testnet4",
): string {
  if (network === "mainnet") {
    if (!NFT_TREASURY_MAINNET) {
      throw new Error("Mainnet treasury not configured");
    }
    return NFT_TREASURY_MAINNET;
  }
  return NFT_TREASURY_TESTNET4;
}
