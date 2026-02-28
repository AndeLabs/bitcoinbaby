#!/usr/bin/env npx tsx
/**
 * Generate NFT Treasury Wallet
 *
 * Run with: npx tsx scripts/generate-treasury.ts
 */

import { BitcoinWallet } from "../packages/bitcoin/src/index";

async function main() {
  // Create wallet instance for testnet4
  const wallet = new BitcoinWallet({ network: "testnet4" });

  // Generate new wallet
  const info = await wallet.generate(12);

  // Get mnemonic (separate call for security)
  const mnemonic = wallet.getMnemonic();

  console.log("");
  console.log(
    "╔═══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║           NFT TREASURY WALLET (TESTNET4)                      ║",
  );
  console.log(
    "╠═══════════════════════════════════════════════════════════════╣",
  );
  console.log(
    "║  Este wallet es SOLO para recibir pagos de NFTs              ║",
  );
  console.log(
    "║  NO mezclar con fondos de BitcoinBaby                        ║",
  );
  console.log(
    "╚═══════════════════════════════════════════════════════════════╝",
  );
  console.log("");
  console.log("MNEMONIC (GUARDAR EN LUGAR SEGURO - NO COMPARTIR):");
  console.log(
    "─────────────────────────────────────────────────────────────────",
  );
  console.log(mnemonic);
  console.log(
    "─────────────────────────────────────────────────────────────────",
  );
  console.log("");
  console.log("ADDRESS (Taproot - para configurar en el código):");
  console.log(
    "─────────────────────────────────────────────────────────────────",
  );
  console.log(info.address);
  console.log(
    "─────────────────────────────────────────────────────────────────",
  );
  console.log("");
  console.log("Para configurar en el código:");
  console.log(`setTreasuryAddress("${info.address}")`);
  console.log("");
}

main().catch(console.error);
