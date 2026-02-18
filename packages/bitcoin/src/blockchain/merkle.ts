/**
 * Merkle Proof Module
 *
 * Implements Merkle tree proof construction for Bitcoin transactions.
 * Required by Charms protocol to prove transaction inclusion in blocks.
 *
 * Reference: BRO token implementation
 */

import { sha256 } from "@noble/hashes/sha256";
import type { MempoolClient } from "./mempool";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Merkle proof for transaction inclusion in a block
 */
export interface MerkleProof {
  /** Transaction ID */
  txid: string;
  /** Block hash containing the transaction */
  blockHash: string;
  /** Block height */
  blockHeight: number;
  /** Merkle root from block header */
  merkleRoot: string;
  /** Merkle path (sibling hashes) */
  merklePath: string[];
  /** Transaction index in block */
  txIndex: number;
}

/**
 * Block header structure
 */
export interface BlockHeader {
  version: number;
  previousBlockHash: string;
  merkleRoot: string;
  time: number;
  bits: string;
  nonce: number;
}

/**
 * Encoded proof for Charms protocol
 */
export interface EncodedMerkleProof {
  /** Raw hex for tx_block_proof field */
  hex: string;
  /** Original proof data */
  proof: MerkleProof;
}

// =============================================================================
// MERKLE TREE UTILITIES
// =============================================================================

/**
 * Double SHA256 hash (Bitcoin standard)
 */
export function doubleSha256(data: Uint8Array): Uint8Array {
  return sha256(sha256(data));
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Reverse byte order (Bitcoin uses little-endian for txids)
 */
function reverseBytes(bytes: Uint8Array): Uint8Array {
  return new Uint8Array(bytes).reverse();
}

/**
 * Reverse a hex string (for txid conversion)
 */
export function reverseHex(hex: string): string {
  return bytesToHex(reverseBytes(hexToBytes(hex)));
}

/**
 * Compute Merkle parent hash from two child hashes
 */
function computeMerkleParent(left: Uint8Array, right: Uint8Array): Uint8Array {
  const combined = new Uint8Array(64);
  combined.set(left, 0);
  combined.set(right, 32);
  return doubleSha256(combined);
}

/**
 * Build Merkle tree from transaction IDs
 * Returns array of levels (level 0 = leaves, last level = root)
 */
export function buildMerkleTree(txids: string[]): string[][] {
  if (txids.length === 0) {
    throw new Error("Cannot build Merkle tree from empty txids");
  }

  // Convert txids to internal byte order (reversed)
  const leaves = txids.map((txid) => reverseHex(txid));

  const levels: string[][] = [leaves];
  let currentLevel = leaves;

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = hexToBytes(currentLevel[i]);
      // If odd number of nodes, duplicate the last one
      const right =
        i + 1 < currentLevel.length
          ? hexToBytes(currentLevel[i + 1])
          : hexToBytes(currentLevel[i]);

      const parent = computeMerkleParent(left, right);
      nextLevel.push(bytesToHex(parent));
    }

    levels.push(nextLevel);
    currentLevel = nextLevel;
  }

  return levels;
}

/**
 * Extract Merkle proof path for a specific transaction
 */
export function extractMerklePath(
  txids: string[],
  targetTxid: string,
): { path: string[]; index: number } {
  // Find index of target transaction
  const index = txids.findIndex((txid) => txid === targetTxid);
  if (index === -1) {
    throw new Error(`Transaction ${targetTxid} not found in block`);
  }

  const tree = buildMerkleTree(txids);
  const path: string[] = [];

  let currentIndex = index;

  // Traverse from leaves to root
  for (let level = 0; level < tree.length - 1; level++) {
    const levelNodes = tree[level];

    // Determine sibling index
    const siblingIndex =
      currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1;

    // Add sibling to path (or self if no sibling)
    if (siblingIndex < levelNodes.length) {
      // Convert back to display format (reversed)
      path.push(reverseHex(levelNodes[siblingIndex]));
    } else {
      // Duplicate case - add self
      path.push(reverseHex(levelNodes[currentIndex]));
    }

    // Move to parent index
    currentIndex = Math.floor(currentIndex / 2);
  }

  return { path, index };
}

/**
 * Verify a Merkle proof
 */
export function verifyMerkleProof(
  txid: string,
  merkleRoot: string,
  path: string[],
  index: number,
): boolean {
  // Start with txid in internal byte order
  let current = hexToBytes(reverseHex(txid));

  for (let i = 0; i < path.length; i++) {
    const sibling = hexToBytes(reverseHex(path[i]));
    const isRight = (index >> i) & 1;

    if (isRight) {
      current = computeMerkleParent(sibling, current);
    } else {
      current = computeMerkleParent(current, sibling);
    }
  }

  // Compare with merkle root (in internal byte order)
  const computedRoot = reverseHex(bytesToHex(current));
  return computedRoot === merkleRoot;
}

// =============================================================================
// PROOF FETCHING
// =============================================================================

/**
 * Fetch Merkle proof for a confirmed transaction
 */
export async function getMerkleProof(
  mempoolClient: MempoolClient,
  txid: string,
): Promise<MerkleProof> {
  // Get transaction info to find block
  const txInfo = await mempoolClient.getTransaction(txid);

  if (!txInfo.status.confirmed) {
    throw new Error(`Transaction ${txid} is not confirmed yet`);
  }

  const blockHash = txInfo.status.block_hash;
  const blockHeight = txInfo.status.block_height;

  if (!blockHash || !blockHeight) {
    throw new Error(`Transaction ${txid} missing block information`);
  }

  // Get all txids in the block
  const blockTxids = await mempoolClient.getBlockTxids(blockHash);

  // Extract Merkle path
  const { path, index } = extractMerklePath(blockTxids, txid);

  // Get block header for merkle root
  const blockInfo = await mempoolClient.getBlock(blockHash);

  return {
    txid,
    blockHash,
    blockHeight,
    merkleRoot: blockInfo.merkle_root,
    merklePath: path,
    txIndex: index,
  };
}

/**
 * Encode Merkle proof for Charms tx_block_proof field
 *
 * Format: Concatenated hex of:
 * - Block header (80 bytes)
 * - Number of hashes (varint)
 * - Merkle path hashes (32 bytes each)
 * - Flags (indicating left/right positions)
 */
export function encodeMerkleProofHex(proof: MerkleProof): string {
  // For now, encode as simple JSON hex until we have exact BRO format
  // TODO: Match exact BRO binary format
  const proofData = {
    txid: proof.txid,
    block_hash: proof.blockHash,
    block_height: proof.blockHeight,
    merkle_root: proof.merkleRoot,
    merkle_path: proof.merklePath,
    tx_index: proof.txIndex,
  };

  const jsonStr = JSON.stringify(proofData);
  const bytes = new TextEncoder().encode(jsonStr);
  return bytesToHex(bytes);
}

/**
 * Get encoded Merkle proof ready for Charms spell
 */
export async function getEncodedMerkleProof(
  mempoolClient: MempoolClient,
  txid: string,
): Promise<EncodedMerkleProof> {
  const proof = await getMerkleProof(mempoolClient, txid);
  const hex = encodeMerkleProofHex(proof);

  return {
    hex,
    proof,
  };
}

// =============================================================================
// MINING PROOF UTILITIES
// =============================================================================

/**
 * Count leading zero bits in a hash
 * Used for PoW difficulty verification
 */
export function countLeadingZeroBits(hash: Uint8Array): number {
  for (let i = 0; i < hash.length; i++) {
    if (hash[i] === 0) {
      continue;
    }
    // Found first non-zero byte, count leading zeros in it
    return i * 8 + Math.clz32(hash[i]) - 24;
  }
  return hash.length * 8;
}

/**
 * Compute mining hash (double SHA256 of challenge + nonce)
 */
export function computeMiningHash(
  challengeTxid: string,
  challengeVout: number,
  nonce: string,
): Uint8Array {
  const input = `${challengeTxid}:${challengeVout}${nonce}`;
  return doubleSha256(new TextEncoder().encode(input));
}

/**
 * Calculate mining reward based on leading zeros and block time
 * Based on BRO token formula
 */
export function calculateMiningReward(
  leadingZeros: number,
  blockTime: number,
  startTime: number,
  halvingPeriodSeconds: number = 14 * 24 * 3600, // 14 days default
): bigint {
  const DENOMINATION = 100_000_000n; // 8 decimals
  const clz = BigInt(leadingZeros);
  const clzPow2 = clz * clz;

  const effectiveBlockTime = blockTime < startTime ? startTime : blockTime;
  const periodsPassed = Math.floor(
    (effectiveBlockTime - startTime) / halvingPeriodSeconds,
  );
  const halvingFactor = 2n ** BigInt(periodsPassed);

  return (DENOMINATION * clzPow2) / halvingFactor;
}
