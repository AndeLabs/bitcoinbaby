/**
 * Merkle Proof Tests
 *
 * Tests for Merkle tree construction, proof extraction, and verification.
 */

import { describe, it, expect } from "vitest";
import {
  doubleSha256,
  reverseHex,
  buildMerkleTree,
  extractMerklePath,
  verifyMerkleProof,
  encodeMerkleProofHex,
  countLeadingZeroBits,
  computeMiningHash,
  calculateMiningReward,
} from "../src/blockchain/merkle";

describe("Merkle Utilities", () => {
  describe("doubleSha256", () => {
    it("should compute double SHA256 correctly", () => {
      const input = new TextEncoder().encode("test");
      const result = doubleSha256(input);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(32);
    });

    it("should produce consistent results", () => {
      const input = new TextEncoder().encode("hello");
      const result1 = doubleSha256(input);
      const result2 = doubleSha256(input);
      expect(result1).toEqual(result2);
    });
  });

  describe("reverseHex", () => {
    it("should reverse hex string correctly", () => {
      expect(reverseHex("0102030405")).toBe("0504030201");
    });

    it("should handle txid format", () => {
      const txid =
        "abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab";
      const reversed = reverseHex(txid);
      expect(reversed.length).toBe(64);
      expect(reverseHex(reversed)).toBe(txid);
    });
  });
});

describe("Merkle Tree", () => {
  describe("buildMerkleTree", () => {
    it("should build tree from single transaction", () => {
      const txids = ["a".repeat(64)];
      const tree = buildMerkleTree(txids);
      expect(tree.length).toBe(1);
      expect(tree[0].length).toBe(1);
    });

    it("should build tree from two transactions", () => {
      const txids = ["a".repeat(64), "b".repeat(64)];
      const tree = buildMerkleTree(txids);
      expect(tree.length).toBe(2);
      expect(tree[0].length).toBe(2); // leaves
      expect(tree[1].length).toBe(1); // root
    });

    it("should handle odd number of transactions", () => {
      const txids = ["a".repeat(64), "b".repeat(64), "c".repeat(64)];
      const tree = buildMerkleTree(txids);
      expect(tree.length).toBe(3);
      expect(tree[0].length).toBe(3); // leaves
      expect(tree[1].length).toBe(2); // level 1
      expect(tree[2].length).toBe(1); // root
    });

    it("should handle power of 2 transactions", () => {
      const txids = Array(8)
        .fill(null)
        .map((_, i) => i.toString(16).padStart(64, "0"));
      const tree = buildMerkleTree(txids);
      expect(tree.length).toBe(4);
      expect(tree[0].length).toBe(8);
      expect(tree[1].length).toBe(4);
      expect(tree[2].length).toBe(2);
      expect(tree[3].length).toBe(1);
    });

    it("should throw on empty txids", () => {
      expect(() => buildMerkleTree([])).toThrow(
        "Cannot build Merkle tree from empty txids",
      );
    });
  });

  describe("extractMerklePath", () => {
    it("should extract path for first transaction", () => {
      const txids = ["a".repeat(64), "b".repeat(64)];
      const { path, index } = extractMerklePath(txids, "a".repeat(64));
      expect(index).toBe(0);
      expect(path.length).toBe(1);
    });

    it("should extract path for second transaction", () => {
      const txids = ["a".repeat(64), "b".repeat(64)];
      const { path, index } = extractMerklePath(txids, "b".repeat(64));
      expect(index).toBe(1);
      expect(path.length).toBe(1);
    });

    it("should throw for non-existent transaction", () => {
      const txids = ["a".repeat(64)];
      expect(() => extractMerklePath(txids, "b".repeat(64))).toThrow(
        "not found in block",
      );
    });
  });

  describe("verifyMerkleProof", () => {
    it("should verify proof for two-transaction block", () => {
      const txids = ["a".repeat(64), "b".repeat(64)];
      const tree = buildMerkleTree(txids);
      const merkleRoot = reverseHex(tree[tree.length - 1][0]);

      const { path, index } = extractMerklePath(txids, "a".repeat(64));
      const isValid = verifyMerkleProof(
        "a".repeat(64),
        merkleRoot,
        path,
        index,
      );
      expect(isValid).toBe(true);
    });

    it("should verify proof for larger block", () => {
      const txids = Array(16)
        .fill(null)
        .map((_, i) => i.toString(16).padStart(64, "0"));
      const tree = buildMerkleTree(txids);
      const merkleRoot = reverseHex(tree[tree.length - 1][0]);

      // Test several transactions
      for (const testIndex of [0, 5, 10, 15]) {
        const { path, index } = extractMerklePath(txids, txids[testIndex]);
        const isValid = verifyMerkleProof(
          txids[testIndex],
          merkleRoot,
          path,
          index,
        );
        expect(isValid).toBe(true);
      }
    });

    it("should reject invalid proof", () => {
      const txids = ["a".repeat(64), "b".repeat(64)];
      const tree = buildMerkleTree(txids);
      const merkleRoot = reverseHex(tree[tree.length - 1][0]);

      const { path, index } = extractMerklePath(txids, "a".repeat(64));
      // Use wrong txid
      const isValid = verifyMerkleProof(
        "c".repeat(64),
        merkleRoot,
        path,
        index,
      );
      expect(isValid).toBe(false);
    });
  });
});

describe("Merkle Proof Encoding", () => {
  describe("encodeMerkleProofHex", () => {
    const mockBlockInfo = {
      version: 0x20000000,
      previousblockhash: "0".repeat(64),
      merkle_root: "c".repeat(64),
      timestamp: 1700000000,
      bits: 0x1f00ffff,
      nonce: 12345,
      tx_count: 2,
    };

    const mockTxids = ["a".repeat(64), "d".repeat(64)];

    it("should encode proof to hex", () => {
      const proof = {
        txid: "a".repeat(64),
        blockHash: "b".repeat(64),
        blockHeight: 12345,
        merkleRoot: "c".repeat(64),
        merklePath: ["d".repeat(64)],
        txIndex: 0,
      };

      const hex = encodeMerkleProofHex(proof, mockBlockInfo, mockTxids);
      expect(hex).toBeTruthy();
      expect(typeof hex).toBe("string");
      expect(/^[0-9a-f]+$/.test(hex)).toBe(true);
      // MerkleBlock should start with block header (80 bytes = 160 hex chars)
      expect(hex.length).toBeGreaterThanOrEqual(160);
    });

    it("should be deterministic", () => {
      const proof = {
        txid: "a".repeat(64),
        blockHash: "b".repeat(64),
        blockHeight: 100,
        merkleRoot: "c".repeat(64),
        merklePath: [],
        txIndex: 0,
      };

      const hex1 = encodeMerkleProofHex(proof, mockBlockInfo, mockTxids);
      const hex2 = encodeMerkleProofHex(proof, mockBlockInfo, mockTxids);
      expect(hex1).toBe(hex2);
    });
  });
});

describe("Mining Utilities", () => {
  describe("countLeadingZeroBits", () => {
    it("should count zeros for all-zero hash", () => {
      const hash = new Uint8Array(32).fill(0);
      expect(countLeadingZeroBits(hash)).toBe(256);
    });

    it("should count zeros for hash starting with 0x01", () => {
      const hash = new Uint8Array(32).fill(0);
      hash[0] = 0x01;
      expect(countLeadingZeroBits(hash)).toBe(7);
    });

    it("should count zeros for hash starting with 0x80", () => {
      const hash = new Uint8Array(32).fill(0);
      hash[0] = 0x80;
      expect(countLeadingZeroBits(hash)).toBe(0);
    });

    it("should count zeros for hash starting with 0x00 0x01", () => {
      const hash = new Uint8Array(32).fill(0);
      hash[1] = 0x01;
      expect(countLeadingZeroBits(hash)).toBe(15);
    });

    it("should count zeros for hash starting with 0x00 0x00 0x0f", () => {
      const hash = new Uint8Array(32).fill(0);
      hash[2] = 0x0f;
      expect(countLeadingZeroBits(hash)).toBe(20);
    });
  });

  describe("computeMiningHash", () => {
    it("should compute hash from challenge and nonce", () => {
      const txid = "a".repeat(64);
      const vout = 0;
      const nonce = "12345678";

      const hash = computeMiningHash(txid, vout, nonce);
      expect(hash).toBeInstanceOf(Uint8Array);
      expect(hash.length).toBe(32);
    });

    it("should produce different hashes for different nonces", () => {
      const txid = "a".repeat(64);
      const vout = 0;

      const hash1 = computeMiningHash(txid, vout, "00000001");
      const hash2 = computeMiningHash(txid, vout, "00000002");

      expect(hash1).not.toEqual(hash2);
    });

    it("should be consistent", () => {
      const txid = "b".repeat(64);
      const vout = 1;
      const nonce = "abc123";

      const hash1 = computeMiningHash(txid, vout, nonce);
      const hash2 = computeMiningHash(txid, vout, nonce);

      expect(hash1).toEqual(hash2);
    });
  });

  describe("calculateMiningReward", () => {
    const BASE_TIME = 1700000000;
    const HALVING_PERIOD = 14 * 24 * 3600; // 14 days

    it("should calculate reward based on leading zeros", () => {
      const reward16 = calculateMiningReward(
        16,
        BASE_TIME,
        BASE_TIME,
        HALVING_PERIOD,
      );
      const reward20 = calculateMiningReward(
        20,
        BASE_TIME,
        BASE_TIME,
        HALVING_PERIOD,
      );

      // 20 zeros should give more reward than 16
      expect(reward20 > reward16).toBe(true);
    });

    it("should halve reward after halving period", () => {
      const rewardBefore = calculateMiningReward(
        16,
        BASE_TIME,
        BASE_TIME,
        HALVING_PERIOD,
      );
      const rewardAfter = calculateMiningReward(
        16,
        BASE_TIME + HALVING_PERIOD,
        BASE_TIME,
        HALVING_PERIOD,
      );

      expect(rewardAfter).toBe(rewardBefore / 2n);
    });

    it("should calculate correctly for initial period", () => {
      // 16 leading zeros: 16^2 * DENOMINATION = 256 * 100000000 = 25600000000
      const reward = calculateMiningReward(
        16,
        BASE_TIME,
        BASE_TIME,
        HALVING_PERIOD,
      );
      expect(reward).toBe(25600000000n);
    });

    it("should handle multiple halvings", () => {
      const reward0 = calculateMiningReward(
        16,
        BASE_TIME,
        BASE_TIME,
        HALVING_PERIOD,
      );
      const reward2 = calculateMiningReward(
        16,
        BASE_TIME + 2 * HALVING_PERIOD,
        BASE_TIME,
        HALVING_PERIOD,
      );

      // After 2 halvings: reward / 4
      expect(reward2).toBe(reward0 / 4n);
    });
  });
});
