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
  "tb1phkt7ueqfl5539wp5phc8hvsqd9csuj8qwp48p842y0ypt98y3fus9vf8zp";

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
