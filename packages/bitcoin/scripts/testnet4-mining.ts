/**
 * Testnet4 Mining Script
 *
 * This script demonstrates the full mining flow on testnet4:
 * 1. Check wallet balance
 * 2. Mine a valid PoW proof
 * 3. Build and sign the mining transaction
 * 4. Broadcast to testnet4
 * 5. Wait for confirmation
 * 6. Get Merkle proof
 * 7. Build mint spell (for future use)
 *
 * Usage:
 *   npx tsx scripts/testnet4-mining.ts
 *
 * Requirements:
 *   - Funded testnet4 wallet (UTXO with >= 7000 sats)
 *   - Environment variables: TESTNET_ADDRESS, TESTNET_PRIVATE_KEY
 */

import {
  createMiningSubmitter,
  createMempoolClient,
  doubleSha256,
  countLeadingZeroBits,
  getPublicKey,
  type MiningProof,
} from "../src";

// Configuration
const TESTNET_ADDRESS =
  process.env.TESTNET_ADDRESS ||
  "tb1pdwap35ru90az875gghz58x9nut7gwqnzjh3dr3cgfdfkxkujt6zqy8ptxj";
const TESTNET_PRIVATE_KEY =
  process.env.TESTNET_PRIVATE_KEY ||
  "17204f40409a85b8a9b7a4b7bb1081917adf770779c2e55959e14e9da62a766b";

// Mining parameters
const TARGET_DIFFICULTY = 16; // 16 leading zero bits minimum
const MAX_MINING_TIME_MS = 300000; // 5 minutes max mining time

async function main() {
  console.log("=== BitcoinBaby Testnet4 Mining Demo ===\n");

  // Initialize clients
  const mempoolClient = createMempoolClient({ network: "testnet4" });
  const privateKey = Buffer.from(TESTNET_PRIVATE_KEY, "hex");
  const publicKey = getPublicKey(privateKey);

  const submitter = createMiningSubmitter({
    network: "testnet4",
    minerAddress: TESTNET_ADDRESS,
    minerPublicKey: Buffer.from(publicKey).toString("hex"),
  });

  // Step 1: Check balance
  console.log("Step 1: Checking wallet balance...");
  const balanceCheck = await submitter.checkMinerBalance();
  console.log(`  Address: ${TESTNET_ADDRESS.substring(0, 20)}...`);
  console.log(`  Balance: ${balanceCheck.balance} sats`);
  console.log(`  UTXOs: ${balanceCheck.utxoCount}`);
  console.log(`  Largest UTXO: ${balanceCheck.largestUtxo} sats`);
  console.log(`  Can mine: ${balanceCheck.canMine}`);

  if (!balanceCheck.canMine) {
    console.log(`\nError: ${balanceCheck.error}`);
    console.log(
      "Please fund the wallet with at least 7000 sats and try again.",
    );
    process.exit(1);
  }

  // Get a UTXO to use as challenge
  const utxos = await mempoolClient.getUTXOs(TESTNET_ADDRESS);
  const bestUtxo = utxos.reduce(
    (best, u) => (u.value > best.value ? u : best),
    utxos[0],
  );

  const challenge = `${bestUtxo.txid}:${bestUtxo.vout}`;
  console.log(`\nUsing challenge: ${challenge.substring(0, 40)}...`);

  // Step 2: Mine a valid PoW proof
  console.log(
    `\nStep 2: Mining PoW (target: ${TARGET_DIFFICULTY} leading zeros)...`,
  );
  const startTime = Date.now();
  let nonce = 0;
  let hash: Uint8Array;
  let leadingZeros = 0;
  let hashCount = 0;

  while (Date.now() - startTime < MAX_MINING_TIME_MS) {
    const input = `${challenge}${nonce.toString(16).padStart(16, "0")}`;
    hash = doubleSha256(new TextEncoder().encode(input));
    leadingZeros = countLeadingZeroBits(hash);
    hashCount++;

    if (hashCount % 100000 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const hashRate = Math.floor(hashCount / elapsed);
      console.log(
        `  Progress: ${hashCount.toLocaleString()} hashes, ${hashRate.toLocaleString()} H/s, best: ${leadingZeros} zeros`,
      );
    }

    if (leadingZeros >= TARGET_DIFFICULTY) {
      break;
    }
    nonce++;
  }

  if (leadingZeros < TARGET_DIFFICULTY) {
    console.log(
      `\nMining timeout. Best result: ${leadingZeros} zeros (need ${TARGET_DIFFICULTY})`,
    );
    console.log("Try running again or lower TARGET_DIFFICULTY for testing.");
    process.exit(1);
  }

  const elapsed = (Date.now() - startTime) / 1000;
  const hashHex = Array.from(hash!)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  console.log(`\n  Found valid proof!`);
  console.log(`  Nonce: ${nonce} (0x${nonce.toString(16)})`);
  console.log(`  Leading zeros: ${leadingZeros}`);
  console.log(`  Hash: ${hashHex.substring(0, 32)}...`);
  console.log(`  Time: ${elapsed.toFixed(2)}s`);
  console.log(`  Total hashes: ${hashCount.toLocaleString()}`);

  // Calculate reward
  const reward = submitter.calculateReward(leadingZeros);
  console.log(`  Expected reward: ${reward} BABTC`);

  // Step 3: Build mining transaction
  console.log("\nStep 3: Building mining transaction...");

  const proof: MiningProof = {
    hash: hashHex,
    nonce: nonce,
    difficulty: leadingZeros,
    timestamp: Date.now(),
    blockData: challenge,
  };

  const result = await submitter.submitProofV10(proof);

  if (result.phase === "mining_tx_ready" && result.miningPsbt) {
    console.log("  Mining TX PSBT created successfully");
    console.log(`  PSBT length: ${result.miningPsbt.length} chars`);

    // Step 4: Sign and broadcast
    console.log("\nStep 4: Signing and broadcasting...");

    const broadcastResult = await submitter.signAndBroadcast(
      result.miningPsbt,
      privateKey,
    );

    if (broadcastResult.success && broadcastResult.txid) {
      console.log(`  SUCCESS! Transaction broadcast`);
      console.log(`  TXID: ${broadcastResult.txid}`);
      console.log(
        `  Explorer: https://mempool.space/testnet4/tx/${broadcastResult.txid}`,
      );

      // Step 5: Wait for confirmation
      console.log(
        "\nStep 5: Waiting for confirmation (this may take a while)...",
      );
      console.log("  Press Ctrl+C to exit and check later.");

      const confirmation = await submitter.waitForMiningTxConfirmation(
        broadcastResult.txid,
        {
          timeoutMs: 1800000, // 30 minutes
          pollIntervalMs: 30000, // 30 seconds
          onProgress: (status) => console.log(`  ${status}`),
        },
      );

      if (confirmation.confirmed) {
        console.log(`\n  Transaction confirmed!`);
        console.log(`  Block hash: ${confirmation.blockHash}`);
        console.log(`  Block height: ${confirmation.blockHeight}`);

        // Step 6: Get Merkle proof and create mint spell
        console.log("\nStep 6: Creating mint spell...");
        const mintResult = await submitter.submitProofV10(proof, {
          existingMiningTxid: broadcastResult.txid,
          existingMiningTxHex: result.miningTxHex,
        });

        if (mintResult.phase === "mint_tx_ready") {
          console.log("  Mint spell TX created!");
          console.log(
            `  Merkle proof obtained for block ${mintResult.merkleProof?.blockHeight}`,
          );
          console.log(`  Ready to claim ${mintResult.reward} BABTC`);

          // Save PSBT for later use
          console.log("\nMint PSBT (save this for claiming):");
          console.log(mintResult.mintPsbt?.substring(0, 100) + "...");
        } else {
          console.log(`  Mint creation result: ${mintResult.phase}`);
          console.log(`  ${mintResult.error || ""}`);
        }
      } else {
        console.log(`  Confirmation timeout: ${confirmation.error}`);
        console.log(
          `  Check the transaction status manually: https://mempool.space/testnet4/tx/${broadcastResult.txid}`,
        );
      }
    } else {
      console.log(`  Broadcast failed: ${broadcastResult.error}`);
    }
  } else {
    console.log(`  Build failed: ${result.phase} - ${result.error}`);
  }

  console.log("\n=== Mining Demo Complete ===");
}

// Run
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
