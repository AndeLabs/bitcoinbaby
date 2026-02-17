import { describe, it, expect } from "vitest";
import {
  validateAddress,
  validateTxid,
  validateHash,
  validateTxHex,
  validateSatoshis,
  validateDifficulty,
  validateNonce,
  validateTimestamp,
  isHex,
  isHexBytes,
  requireValidAddress,
  requireValidTxid,
  ValidationError,
} from "../src/validation";

describe("isHex", () => {
  it("returns true for valid hex", () => {
    expect(isHex("abcdef0123456789")).toBe(true);
    expect(isHex("ABCDEF")).toBe(true);
    expect(isHex("0")).toBe(true);
  });

  it("returns false for invalid hex", () => {
    expect(isHex("")).toBe(false);
    expect(isHex("ghij")).toBe(false);
    expect(isHex("0x123")).toBe(false);
  });
});

describe("isHexBytes", () => {
  it("returns true for even-length hex", () => {
    expect(isHexBytes("00")).toBe(true);
    expect(isHexBytes("abcd")).toBe(true);
  });

  it("returns false for odd-length hex", () => {
    expect(isHexBytes("0")).toBe(false);
    expect(isHexBytes("abc")).toBe(false);
  });
});

describe("validateAddress", () => {
  it("validates mainnet addresses", () => {
    // Valid mainnet P2WPKH (BIP-173 test vector)
    expect(
      validateAddress("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4", "mainnet")
        .valid,
    ).toBe(true);
    // Valid mainnet P2PKH (Satoshi's genesis coinbase address)
    expect(
      validateAddress("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", "mainnet").valid,
    ).toBe(true);
    // Valid mainnet P2SH
    expect(
      validateAddress("3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy", "mainnet").valid,
    ).toBe(true);
  });

  it("validates testnet4 addresses", () => {
    // Valid testnet P2WPKH
    expect(
      validateAddress("tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx", "testnet4")
        .valid,
    ).toBe(true);
    // Valid testnet P2PKH
    expect(
      validateAddress("mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn", "testnet4").valid,
    ).toBe(true);
  });

  it("rejects invalid addresses", () => {
    expect(validateAddress("invalid", "mainnet").valid).toBe(false);
    expect(validateAddress("", "mainnet").valid).toBe(false);
    expect(validateAddress("bc1p", "testnet4").valid).toBe(false); // Wrong prefix for testnet
  });

  it("rejects too short addresses", () => {
    const result = validateAddress("bc1p", "mainnet");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("too short");
  });
});

describe("validateTxid", () => {
  it("validates correct txid", () => {
    const validTxid = "a".repeat(64);
    expect(validateTxid(validTxid).valid).toBe(true);
  });

  it("rejects wrong length", () => {
    expect(validateTxid("abc").valid).toBe(false);
    expect(validateTxid("a".repeat(63)).valid).toBe(false);
    expect(validateTxid("a".repeat(65)).valid).toBe(false);
  });

  it("rejects non-hex", () => {
    const result = validateTxid("g".repeat(64));
    expect(result.valid).toBe(false);
    expect(result.error).toContain("hexadecimal");
  });
});

describe("validateHash", () => {
  it("validates 64-char hex hash", () => {
    const hash = "f".repeat(64);
    expect(validateHash(hash).valid).toBe(true);
  });

  it("rejects invalid hashes", () => {
    expect(validateHash("short").valid).toBe(false);
  });
});

describe("validateTxHex", () => {
  it("validates byte-aligned hex", () => {
    const txHex = "0".repeat(100);
    expect(validateTxHex(txHex).valid).toBe(true);
  });

  it("rejects too short tx", () => {
    expect(validateTxHex("00").valid).toBe(false);
  });

  it("rejects odd-length hex", () => {
    const result = validateTxHex("0".repeat(101));
    expect(result.valid).toBe(false);
    expect(result.error).toContain("byte-aligned");
  });
});

describe("validateSatoshis", () => {
  it("validates valid amounts", () => {
    expect(validateSatoshis(BigInt(0)).valid).toBe(true);
    expect(validateSatoshis(BigInt(1000)).valid).toBe(true);
    expect(validateSatoshis(BigInt(100_000_000)).valid).toBe(true);
  });

  it("rejects negative amounts", () => {
    const result = validateSatoshis(BigInt(-1));
    expect(result.valid).toBe(false);
    expect(result.error).toContain("non-negative");
  });

  it("rejects amounts exceeding max supply", () => {
    const tooMuch = BigInt(22_000_000) * BigInt(100_000_000);
    const result = validateSatoshis(tooMuch);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("maximum");
  });
});

describe("validateDifficulty", () => {
  it("validates valid difficulty", () => {
    expect(validateDifficulty(1).valid).toBe(true);
    expect(validateDifficulty(16).valid).toBe(true);
    expect(validateDifficulty(256).valid).toBe(true);
  });

  it("rejects out of range difficulty", () => {
    expect(validateDifficulty(0).valid).toBe(false);
    expect(validateDifficulty(257).valid).toBe(false);
    expect(validateDifficulty(-1).valid).toBe(false);
  });
});

describe("validateNonce", () => {
  it("validates valid nonces", () => {
    expect(validateNonce(0).valid).toBe(true);
    expect(validateNonce(1000000).valid).toBe(true);
  });

  it("rejects negative nonces", () => {
    expect(validateNonce(-1).valid).toBe(false);
  });
});

describe("validateTimestamp", () => {
  it("validates current timestamp", () => {
    expect(validateTimestamp(Date.now()).valid).toBe(true);
  });

  it("validates historical Bitcoin timestamp", () => {
    // Bitcoin genesis: Jan 3, 2009
    expect(validateTimestamp(1231006505000).valid).toBe(true);
  });

  it("rejects timestamps before Bitcoin", () => {
    expect(validateTimestamp(1000000000000).valid).toBe(false); // 2001
  });
});

describe("requireValidAddress", () => {
  it("returns trimmed address on success", () => {
    // Valid testnet P2WPKH address with whitespace
    const addr = " tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx ";
    const result = requireValidAddress(addr, "testnet4");
    expect(result).toBe("tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx");
  });

  it("throws ValidationError on failure", () => {
    expect(() => requireValidAddress("invalid", "mainnet")).toThrow(
      ValidationError,
    );
  });
});

describe("requireValidTxid", () => {
  it("returns lowercase txid on success", () => {
    const txid = "A".repeat(64);
    const result = requireValidTxid(txid);
    expect(result).toBe("a".repeat(64));
  });

  it("throws ValidationError on failure", () => {
    expect(() => requireValidTxid("short")).toThrow(ValidationError);
  });
});
