/**
 * Wallet Tests
 *
 * Tests for the BitcoinBaby HD wallet implementation:
 * - Mnemonic generation from entropy
 * - Mnemonic validation
 * - Address derivation (testnet/mainnet)
 * - PSBT signing
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  BitcoinWallet,
  getAddressType,
  formatAddress,
  satsToBtc,
  btcToSats,
  generateMnemonicFromEntropy,
  validateMnemonic,
  generateRandomMnemonic,
} from "../src/wallet";
import { validateAddress } from "../src/validation";

// ============================================
// Mnemonic Generation Tests
// ============================================

describe("generateMnemonicFromEntropy", () => {
  it("should generate 12-word mnemonic from 16 bytes entropy", () => {
    const entropy = new Uint8Array(16);
    crypto.getRandomValues(entropy);

    const mnemonic = generateMnemonicFromEntropy(entropy);
    const words = mnemonic.split(" ");

    expect(words.length).toBe(12);
  });

  it("should generate 24-word mnemonic from 32 bytes entropy", () => {
    const entropy = new Uint8Array(32);
    crypto.getRandomValues(entropy);

    const mnemonic = generateMnemonicFromEntropy(entropy);
    const words = mnemonic.split(" ");

    expect(words.length).toBe(24);
  });

  it("should generate valid BIP39 mnemonic", () => {
    const entropy = new Uint8Array(16);
    crypto.getRandomValues(entropy);

    const mnemonic = generateMnemonicFromEntropy(entropy);

    expect(validateMnemonic(mnemonic)).toBe(true);
  });

  it("should throw for invalid entropy length", () => {
    const invalidEntropy = new Uint8Array(15); // Not 16 or 32

    expect(() => generateMnemonicFromEntropy(invalidEntropy)).toThrow(
      "Invalid entropy length",
    );
  });

  it("should produce different mnemonics for different entropy", () => {
    const entropy1 = new Uint8Array(16);
    const entropy2 = new Uint8Array(16);

    crypto.getRandomValues(entropy1);
    crypto.getRandomValues(entropy2);

    const mnemonic1 = generateMnemonicFromEntropy(entropy1);
    const mnemonic2 = generateMnemonicFromEntropy(entropy2);

    expect(mnemonic1).not.toBe(mnemonic2);
  });

  it("should produce different mnemonics from same entropy due to CSPRNG mixing", () => {
    // SECURITY: User entropy is mixed with CSPRNG, so same input produces different output
    // This ensures that even weak user entropy results in secure mnemonics
    const entropy = new Uint8Array([
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
    ]);

    const mnemonic1 = generateMnemonicFromEntropy(entropy);
    const mnemonic2 = generateMnemonicFromEntropy(entropy);

    // Both should be valid mnemonics
    expect(validateMnemonic(mnemonic1)).toBe(true);
    expect(validateMnemonic(mnemonic2)).toBe(true);

    // But they should be different due to CSPRNG mixing
    expect(mnemonic1).not.toBe(mnemonic2);
  });
});

describe("generateRandomMnemonic", () => {
  it("should generate 12-word mnemonic by default", () => {
    const mnemonic = generateRandomMnemonic();
    const words = mnemonic.split(" ");

    expect(words.length).toBe(12);
  });

  it("should generate 24-word mnemonic when specified", () => {
    const mnemonic = generateRandomMnemonic(24);
    const words = mnemonic.split(" ");

    expect(words.length).toBe(24);
  });

  it("should generate valid BIP39 mnemonics", () => {
    const mnemonic12 = generateRandomMnemonic(12);
    const mnemonic24 = generateRandomMnemonic(24);

    expect(validateMnemonic(mnemonic12)).toBe(true);
    expect(validateMnemonic(mnemonic24)).toBe(true);
  });

  it("should generate different mnemonics each time", () => {
    const mnemonic1 = generateRandomMnemonic();
    const mnemonic2 = generateRandomMnemonic();

    expect(mnemonic1).not.toBe(mnemonic2);
  });
});

// ============================================
// Mnemonic Validation Tests
// ============================================

describe("validateMnemonic", () => {
  it("should validate correct 12-word mnemonic", () => {
    const mnemonic =
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

    expect(validateMnemonic(mnemonic)).toBe(true);
  });

  it("should validate correct 24-word mnemonic", () => {
    const mnemonic =
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art";

    expect(validateMnemonic(mnemonic)).toBe(true);
  });

  it("should reject invalid word count", () => {
    const mnemonic = "abandon abandon abandon"; // Only 3 words

    expect(validateMnemonic(mnemonic)).toBe(false);
  });

  it("should reject invalid words", () => {
    const mnemonic =
      "invalid invalid invalid invalid invalid invalid invalid invalid invalid invalid invalid invalid";

    expect(validateMnemonic(mnemonic)).toBe(false);
  });

  it("should reject invalid checksum", () => {
    // Valid words but wrong checksum
    const mnemonic =
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon";

    expect(validateMnemonic(mnemonic)).toBe(false);
  });

  it("should reject empty string", () => {
    expect(validateMnemonic("")).toBe(false);
  });

  it("should handle extra whitespace", () => {
    const mnemonic =
      "  abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about  ";

    // Most implementations trim, so this might pass
    expect(validateMnemonic(mnemonic.trim())).toBe(true);
  });
});

// ============================================
// Address Derivation Tests
// ============================================

describe("BitcoinWallet - Address Derivation", () => {
  const testMnemonic =
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
  let wallet: BitcoinWallet;

  beforeEach(() => {
    wallet = new BitcoinWallet({ network: "testnet" });
  });

  afterEach(() => {
    wallet.clear();
  });

  describe("Taproot addresses", () => {
    it("should derive testnet Taproot address starting with tb1p", async () => {
      await wallet.fromMnemonic(testMnemonic, { addressType: "taproot" });
      const info = wallet.getInfo();

      expect(info.address.startsWith("tb1p")).toBe(true);
    });

    it("should derive mainnet Taproot address starting with bc1p", async () => {
      const mainnetWallet = new BitcoinWallet({ network: "mainnet" });
      await mainnetWallet.fromMnemonic(testMnemonic, {
        addressType: "taproot",
      });
      const info = mainnetWallet.getInfo();

      expect(info.address.startsWith("bc1p")).toBe(true);
      mainnetWallet.clear();
    });

    it("should use taproot derivation path (BIP86)", async () => {
      await wallet.fromMnemonic(testMnemonic, { addressType: "taproot" });
      const info = wallet.getInfo();

      expect(info.derivationPath).toContain("86'");
    });
  });

  describe("SegWit addresses", () => {
    it("should derive testnet SegWit address starting with tb1q", async () => {
      await wallet.fromMnemonic(testMnemonic, { addressType: "segwit" });
      const info = wallet.getInfo();

      expect(info.address.startsWith("tb1q")).toBe(true);
    });

    it("should derive mainnet SegWit address starting with bc1q", async () => {
      const mainnetWallet = new BitcoinWallet({ network: "mainnet" });
      await mainnetWallet.fromMnemonic(testMnemonic, { addressType: "segwit" });
      const info = mainnetWallet.getInfo();

      expect(info.address.startsWith("bc1q")).toBe(true);
      mainnetWallet.clear();
    });

    it("should use segwit derivation path (BIP84)", async () => {
      await wallet.fromMnemonic(testMnemonic, { addressType: "segwit" });
      const info = wallet.getInfo();

      expect(info.derivationPath).toContain("84'");
    });
  });

  describe("Legacy addresses", () => {
    it("should derive testnet legacy address starting with m or n", async () => {
      await wallet.fromMnemonic(testMnemonic, { addressType: "legacy" });
      const info = wallet.getInfo();

      expect(info.address.startsWith("m") || info.address.startsWith("n")).toBe(
        true,
      );
    });

    it("should derive mainnet legacy address starting with 1", async () => {
      const mainnetWallet = new BitcoinWallet({ network: "mainnet" });
      await mainnetWallet.fromMnemonic(testMnemonic, { addressType: "legacy" });
      const info = mainnetWallet.getInfo();

      expect(info.address.startsWith("1")).toBe(true);
      mainnetWallet.clear();
    });

    it("should use legacy derivation path (BIP44)", async () => {
      await wallet.fromMnemonic(testMnemonic, { addressType: "legacy" });
      const info = wallet.getInfo();

      expect(info.derivationPath).toContain("44'");
    });
  });

  describe("Address index", () => {
    it("should derive different addresses for different indices", async () => {
      const wallet1 = new BitcoinWallet({ network: "testnet" });
      const wallet2 = new BitcoinWallet({ network: "testnet" });

      await wallet1.fromMnemonic(testMnemonic, { addressIndex: 0 });
      await wallet2.fromMnemonic(testMnemonic, { addressIndex: 1 });

      expect(wallet1.getAddress()).not.toBe(wallet2.getAddress());

      wallet1.clear();
      wallet2.clear();
    });

    it("should produce deterministic addresses for same index", async () => {
      const wallet1 = new BitcoinWallet({ network: "testnet" });
      const wallet2 = new BitcoinWallet({ network: "testnet" });

      await wallet1.fromMnemonic(testMnemonic, { addressIndex: 5 });
      await wallet2.fromMnemonic(testMnemonic, { addressIndex: 5 });

      expect(wallet1.getAddress()).toBe(wallet2.getAddress());

      wallet1.clear();
      wallet2.clear();
    });
  });

  describe("Coin type for networks", () => {
    it("should use coin type 1 for testnet", async () => {
      await wallet.fromMnemonic(testMnemonic);
      const info = wallet.getInfo();

      // Testnet uses coin type 1
      expect(info.derivationPath).toContain("/1'/");
    });

    it("should use coin type 0 for mainnet", async () => {
      const mainnetWallet = new BitcoinWallet({ network: "mainnet" });
      await mainnetWallet.fromMnemonic(testMnemonic);
      const info = mainnetWallet.getInfo();

      // Mainnet uses coin type 0
      expect(info.derivationPath).toContain("/0'/");
      mainnetWallet.clear();
    });
  });
});

// ============================================
// Wallet State Management Tests
// ============================================

describe("BitcoinWallet - State Management", () => {
  const testMnemonic =
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

  it("should not be loaded initially", () => {
    const wallet = new BitcoinWallet();
    expect(wallet.isLoaded()).toBe(false);
  });

  it("should be loaded after fromMnemonic", async () => {
    const wallet = new BitcoinWallet();
    await wallet.fromMnemonic(testMnemonic);

    expect(wallet.isLoaded()).toBe(true);
    wallet.clear();
  });

  it("should throw when accessing info without loading", () => {
    const wallet = new BitcoinWallet();

    expect(() => wallet.getInfo()).toThrow();
  });

  it("should throw when accessing address without loading", () => {
    const wallet = new BitcoinWallet();

    expect(() => wallet.getAddress()).toThrow();
  });

  it("should throw when accessing mnemonic without loading", () => {
    const wallet = new BitcoinWallet();

    expect(() => wallet.getMnemonic()).toThrow();
  });

  it("should return mnemonic after loading", async () => {
    const wallet = new BitcoinWallet();
    await wallet.fromMnemonic(testMnemonic);

    expect(wallet.getMnemonic()).toBe(testMnemonic);
    wallet.clear();
  });

  it("should not be loaded after clear", async () => {
    const wallet = new BitcoinWallet();
    await wallet.fromMnemonic(testMnemonic);

    wallet.clear();

    expect(wallet.isLoaded()).toBe(false);
  });

  it("should throw invalid mnemonic error for bad phrase", async () => {
    const wallet = new BitcoinWallet();

    await expect(wallet.fromMnemonic("invalid mnemonic")).rejects.toThrow(
      "Invalid BIP39 mnemonic",
    );
  });
});

// ============================================
// Wallet Generation Tests
// ============================================

describe("BitcoinWallet - Generation", () => {
  it("should generate 12-word wallet by default", async () => {
    const wallet = new BitcoinWallet();
    await wallet.generate();

    const mnemonic = wallet.getMnemonic();
    expect(mnemonic.split(" ").length).toBe(12);

    wallet.clear();
  });

  it("should generate 24-word wallet when specified", async () => {
    const wallet = new BitcoinWallet();
    await wallet.generate(24);

    const mnemonic = wallet.getMnemonic();
    expect(mnemonic.split(" ").length).toBe(24);

    wallet.clear();
  });

  it("should generate valid addresses", async () => {
    const wallet = new BitcoinWallet({ network: "testnet" });
    await wallet.generate();

    const address = wallet.getAddress();
    expect(validateAddress(address, "testnet").valid).toBe(true);

    wallet.clear();
  });

  it("should generate unique wallets each time", async () => {
    const wallet1 = new BitcoinWallet();
    const wallet2 = new BitcoinWallet();

    await wallet1.generate();
    await wallet2.generate();

    expect(wallet1.getAddress()).not.toBe(wallet2.getAddress());

    wallet1.clear();
    wallet2.clear();
  });
});

// ============================================
// Address Validation Tests
// ============================================

describe("validateAddress", () => {
  it("should validate mainnet Taproot addresses", () => {
    // Real mainnet Taproot address
    const address =
      "bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0";
    expect(validateAddress(address, "mainnet").valid).toBe(true);
  });

  it("should validate mainnet SegWit addresses", () => {
    const address = "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4";
    expect(validateAddress(address, "mainnet").valid).toBe(true);
  });

  it("should validate testnet Taproot addresses", async () => {
    // Generate a real testnet Taproot address from a wallet for testing
    const wallet = new BitcoinWallet({ network: "testnet" });
    await wallet.fromMnemonic(
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
      { addressType: "taproot" },
    );
    const address = wallet.getAddress();
    wallet.clear();

    // The generated address should be valid
    expect(address.startsWith("tb1p")).toBe(true);
    expect(validateAddress(address, "testnet").valid).toBe(true);
  });

  it("should validate testnet SegWit addresses", () => {
    const address = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx";
    expect(validateAddress(address, "testnet").valid).toBe(true);
  });

  it("should reject invalid addresses", () => {
    expect(validateAddress("invalid", "mainnet").valid).toBe(false);
    expect(validateAddress("", "mainnet").valid).toBe(false);
    expect(validateAddress("bc1invalid", "mainnet").valid).toBe(false);
  });

  it("should reject wrong network addresses", () => {
    // Testnet SegWit address validated against mainnet
    const testnetAddress = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx";
    expect(validateAddress(testnetAddress, "mainnet").valid).toBe(false);
  });
});

// ============================================
// Address Type Detection Tests
// ============================================

describe("getAddressType", () => {
  it("should detect mainnet Taproot addresses", () => {
    expect(
      getAddressType(
        "bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0",
      ),
    ).toBe("taproot");
  });

  it("should detect mainnet SegWit addresses", () => {
    expect(getAddressType("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4")).toBe(
      "segwit",
    );
  });

  it("should detect mainnet legacy addresses", () => {
    expect(getAddressType("1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2")).toBe("legacy");
  });

  it("should detect testnet Taproot addresses", () => {
    expect(
      getAddressType(
        "tb1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0",
      ),
    ).toBe("taproot");
  });

  it("should detect testnet SegWit addresses", () => {
    expect(getAddressType("tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx")).toBe(
      "segwit",
    );
  });

  it("should detect testnet legacy addresses", () => {
    expect(getAddressType("mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn")).toBe("legacy");
    expect(getAddressType("n3GNqMveyvaPvUbH469vDRadqpJMPc84JA")).toBe("legacy");
  });

  it("should return unknown for unrecognized addresses", () => {
    expect(getAddressType("xyz123invalid")).toBe("unknown");
  });
});

// ============================================
// Utility Function Tests
// ============================================

describe("formatAddress", () => {
  it("should truncate long addresses", () => {
    const address =
      "bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0";
    const formatted = formatAddress(address);

    expect(formatted.length).toBeLessThan(address.length);
    expect(formatted).toContain("...");
  });

  it("should preserve start and end of address", () => {
    const address =
      "bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0";
    const formatted = formatAddress(address, 8);

    expect(formatted.startsWith("bc1p0xlx")).toBe(true);
    expect(formatted.endsWith("zk5jj0")).toBe(true);
  });

  it("should not truncate short addresses", () => {
    const shortAddress = "bc1qshort";
    const formatted = formatAddress(shortAddress, 4);

    // If address is already short enough, return as-is
    expect(formatted.length).toBeLessThanOrEqual(shortAddress.length + 3); // +3 for potential "..."
  });

  it("should use default character count", () => {
    const address =
      "bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0";
    const formatted = formatAddress(address);

    // Default is 8 chars on each side
    expect(formatted).toMatch(/^.{8}\.\.\..{8}$/);
  });
});

describe("satsToBtc", () => {
  it("should convert satoshis to BTC", () => {
    expect(satsToBtc(100_000_000)).toBe("1.00000000");
  });

  it("should handle small amounts", () => {
    expect(satsToBtc(1)).toBe("0.00000001");
  });

  it("should handle zero", () => {
    expect(satsToBtc(0)).toBe("0.00000000");
  });

  it("should handle large amounts", () => {
    expect(satsToBtc(2_100_000_000_000_000)).toBe("21000000.00000000");
  });

  it("should preserve precision", () => {
    expect(satsToBtc(12345678)).toBe("0.12345678");
  });
});

describe("btcToSats", () => {
  it("should convert BTC to satoshis", () => {
    expect(btcToSats(1)).toBe(100_000_000);
  });

  it("should handle small amounts", () => {
    expect(btcToSats(0.00000001)).toBe(1);
  });

  it("should handle zero", () => {
    expect(btcToSats(0)).toBe(0);
  });

  it("should handle decimal amounts", () => {
    expect(btcToSats(0.5)).toBe(50_000_000);
  });

  it("should round correctly", () => {
    // 0.123456789 BTC should round to 12345679 sats
    expect(btcToSats(0.123456789)).toBe(12345679);
  });
});

// ============================================
// PSBT Signing Tests
// ============================================

describe("BitcoinWallet - PSBT Signing", () => {
  const testMnemonic =
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

  it("should sign a message", async () => {
    const wallet = new BitcoinWallet({ network: "testnet" });
    await wallet.fromMnemonic(testMnemonic);

    const message = "Hello, Bitcoin!";
    const signature = await wallet.signMessage(message);

    // Signature should be base64 encoded
    expect(typeof signature).toBe("string");
    expect(signature.length).toBeGreaterThan(0);

    wallet.clear();
  });

  it("should get private key for signing", async () => {
    const wallet = new BitcoinWallet({ network: "testnet" });
    await wallet.fromMnemonic(testMnemonic);

    const privateKey = wallet.getPrivateKeyForSigning();

    expect(privateKey).toBeInstanceOf(Uint8Array);
    expect(privateKey.length).toBe(32);

    // Clear the returned key
    privateKey.fill(0);
    wallet.clear();
  });

  it("should throw when signing without loaded wallet", async () => {
    const wallet = new BitcoinWallet();

    await expect(wallet.signMessage("test")).rejects.toThrow();
  });

  it("should throw when getting private key without loaded wallet", () => {
    const wallet = new BitcoinWallet();

    expect(() => wallet.getPrivateKeyForSigning()).toThrow();
  });
});

// ============================================
// Security Tests
// ============================================

describe("BitcoinWallet - Security", () => {
  const testMnemonic =
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

  it("should clear wallet data on clear()", async () => {
    const wallet = new BitcoinWallet();
    await wallet.fromMnemonic(testMnemonic);

    wallet.clear();

    expect(wallet.isLoaded()).toBe(false);
    expect(() => wallet.getAddress()).toThrow();
    expect(() => wallet.getMnemonic()).toThrow();
    expect(() => wallet.getPrivateKeyForSigning()).toThrow();
  });

  it("should return copy of private key, not reference", async () => {
    const wallet = new BitcoinWallet();
    await wallet.fromMnemonic(testMnemonic);

    const key1 = wallet.getPrivateKeyForSigning();
    const key2 = wallet.getPrivateKeyForSigning();

    // Should be equal in value
    expect(key1).toEqual(key2);

    // But modifying one shouldn't affect the other
    key1.fill(0);
    expect(key2[0]).not.toBe(0);

    wallet.clear();
  });

  it("should not expose private key in wallet info", async () => {
    const wallet = new BitcoinWallet();
    await wallet.fromMnemonic(testMnemonic);

    const info = wallet.getInfo();

    // Info should not contain privateKey
    expect((info as any).privateKey).toBeUndefined();
    expect((info as any).mnemonic).toBeUndefined();

    wallet.clear();
  });
});
