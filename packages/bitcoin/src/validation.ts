/**
 * Input Validation Utilities
 *
 * Centralized validation for Bitcoin addresses, transactions,
 * amounts, and other protocol-specific inputs.
 *
 * Uses bitcoinjs-lib for cryptographically correct address validation
 * (checksum verification, network matching, etc.)
 */

import * as bitcoin from "bitcoinjs-lib";
import type { BitcoinNetwork } from "./types";

/**
 * Network configurations for bitcoinjs-lib
 */
const BITCOIN_NETWORKS: Record<BitcoinNetwork, bitcoin.Network> = {
  mainnet: bitcoin.networks.bitcoin,
  testnet: bitcoin.networks.testnet,
  testnet4: bitcoin.networks.testnet,
  regtest: bitcoin.networks.regtest,
};

/**
 * Validation error with structured details
 */
export class ValidationError extends Error {
  readonly code: string;
  readonly field: string;

  constructor(message: string, code: string, field: string) {
    super(message);
    this.name = "ValidationError";
    this.code = code;
    this.field = field;
  }
}

/**
 * Bitcoin address prefixes by network
 */
const ADDRESS_PREFIXES: Record<BitcoinNetwork, string[]> = {
  mainnet: ["bc1p", "bc1q", "1", "3"],
  testnet: ["tb1p", "tb1q", "m", "n", "2"],
  testnet4: ["tb1p", "tb1q", "m", "n", "2"],
  regtest: ["bcrt1p", "bcrt1q", "m", "n", "2"],
};

/**
 * Maximum Bitcoin supply in satoshis (21 million BTC)
 */
const MAX_SATOSHIS = BigInt(21_000_000) * BigInt(100_000_000);

/**
 * Reasonable limits for various inputs
 */
const LIMITS = {
  MIN_DIFFICULTY: 1,
  MAX_DIFFICULTY: 256,
  MIN_NONCE: 0,
  MAX_NONCE: Number.MAX_SAFE_INTEGER,
  MAX_INPUTS: 1000,
  MIN_ADDRESS_LENGTH: 26,
  MAX_ADDRESS_LENGTH: 90,
  TX_HEX_MIN_LENGTH: 20,
  TX_HEX_MAX_LENGTH: 2_000_000, // ~1MB transaction
} as const;

/**
 * Check if string is valid hexadecimal
 */
export function isHex(value: string): boolean {
  if (typeof value !== "string" || value.length === 0) return false;
  return /^[0-9a-fA-F]+$/.test(value);
}

/**
 * Check if string is valid even-length hexadecimal (byte-aligned)
 */
export function isHexBytes(value: string): boolean {
  return isHex(value) && value.length % 2 === 0;
}

/**
 * Validate a Bitcoin address
 *
 * Uses bitcoinjs-lib's toOutputScript for cryptographically correct validation:
 * - Checksum verification
 * - Network matching
 * - Address type detection
 * - Proper Bech32/Bech32m decoding
 *
 * This is the canonical address validator - use this instead of manual prefix checks.
 */
export function validateAddress(
  address: string,
  network: BitcoinNetwork = "testnet4",
): { valid: boolean; error?: string } {
  if (typeof address !== "string") {
    return { valid: false, error: "Address must be a string" };
  }

  const trimmed = address.trim();

  if (trimmed.length < LIMITS.MIN_ADDRESS_LENGTH) {
    return { valid: false, error: "Address too short" };
  }

  if (trimmed.length > LIMITS.MAX_ADDRESS_LENGTH) {
    return { valid: false, error: "Address too long" };
  }

  // Quick prefix check for better error messages
  const prefixes = ADDRESS_PREFIXES[network];
  const hasValidPrefix = prefixes.some((prefix) => trimmed.startsWith(prefix));

  if (!hasValidPrefix) {
    return {
      valid: false,
      error: `Invalid address prefix for ${network}. Expected: ${prefixes.join(", ")}`,
    };
  }

  // Use bitcoinjs-lib for definitive validation (checksum, network, encoding)
  try {
    bitcoin.address.toOutputScript(trimmed, BITCOIN_NETWORKS[network]);
    return { valid: true };
  } catch (err) {
    // Extract useful error message from bitcoinjs-lib
    const message = err instanceof Error ? err.message : "Invalid address";

    // Provide more specific error messages
    if (message.includes("Invalid checksum")) {
      return { valid: false, error: "Invalid address checksum" };
    }
    if (message.includes("has no matching")) {
      return {
        valid: false,
        error: `Address not valid for ${network} network`,
      };
    }

    return { valid: false, error: message };
  }
}

/**
 * Validate a transaction ID (txid)
 */
export function validateTxid(txid: string): { valid: boolean; error?: string } {
  if (typeof txid !== "string") {
    return { valid: false, error: "Transaction ID must be a string" };
  }

  const trimmed = txid.trim().toLowerCase();

  if (trimmed.length !== 64) {
    return { valid: false, error: "Transaction ID must be 64 hex characters" };
  }

  if (!isHex(trimmed)) {
    return { valid: false, error: "Transaction ID must be hexadecimal" };
  }

  return { valid: true };
}

/**
 * Validate a hash (proof of work, block hash, etc.)
 */
export function validateHash(hash: string): { valid: boolean; error?: string } {
  if (typeof hash !== "string") {
    return { valid: false, error: "Hash must be a string" };
  }

  const trimmed = hash.trim().toLowerCase();

  if (trimmed.length !== 64) {
    return { valid: false, error: "Hash must be 64 hex characters" };
  }

  if (!isHex(trimmed)) {
    return { valid: false, error: "Hash must be hexadecimal" };
  }

  return { valid: true };
}

/**
 * Validate raw transaction hex
 */
export function validateTxHex(txHex: string): {
  valid: boolean;
  error?: string;
} {
  if (typeof txHex !== "string") {
    return { valid: false, error: "Transaction hex must be a string" };
  }

  const trimmed = txHex.trim();

  if (trimmed.length < LIMITS.TX_HEX_MIN_LENGTH) {
    return { valid: false, error: "Transaction hex too short" };
  }

  if (trimmed.length > LIMITS.TX_HEX_MAX_LENGTH) {
    return { valid: false, error: "Transaction hex too long" };
  }

  if (!isHexBytes(trimmed)) {
    return {
      valid: false,
      error: "Transaction must be valid byte-aligned hex",
    };
  }

  return { valid: true };
}

/**
 * Validate a positive integer within range
 */
export function validatePositiveInt(
  value: number,
  field: string,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
): { valid: boolean; error?: string } {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return { valid: false, error: `${field} must be an integer` };
  }

  if (value < min) {
    return { valid: false, error: `${field} must be at least ${min}` };
  }

  if (value > max) {
    return { valid: false, error: `${field} must be at most ${max}` };
  }

  return { valid: true };
}

/**
 * Validate a satoshi amount (BigInt)
 */
export function validateSatoshis(
  amount: bigint,
  field = "amount",
): { valid: boolean; error?: string } {
  if (typeof amount !== "bigint") {
    return { valid: false, error: `${field} must be a BigInt` };
  }

  if (amount < BigInt(0)) {
    return { valid: false, error: `${field} must be non-negative` };
  }

  if (amount > MAX_SATOSHIS) {
    return { valid: false, error: `${field} exceeds maximum Bitcoin supply` };
  }

  return { valid: true };
}

/**
 * Validate mining difficulty
 */
export function validateDifficulty(difficulty: number): {
  valid: boolean;
  error?: string;
} {
  return validatePositiveInt(
    difficulty,
    "difficulty",
    LIMITS.MIN_DIFFICULTY,
    LIMITS.MAX_DIFFICULTY,
  );
}

/**
 * Validate nonce
 */
export function validateNonce(nonce: number): {
  valid: boolean;
  error?: string;
} {
  return validatePositiveInt(
    nonce,
    "nonce",
    LIMITS.MIN_NONCE,
    LIMITS.MAX_NONCE,
  );
}

/**
 * Validate number of inputs
 */
export function validateNumberOfInputs(count: number): {
  valid: boolean;
  error?: string;
} {
  return validatePositiveInt(count, "numberOfInputs", 1, LIMITS.MAX_INPUTS);
}

/**
 * Validate timestamp (Unix timestamp in milliseconds)
 */
export function validateTimestamp(timestamp: number): {
  valid: boolean;
  error?: string;
} {
  if (typeof timestamp !== "number" || !Number.isInteger(timestamp)) {
    return { valid: false, error: "Timestamp must be an integer" };
  }

  // Reasonable range: year 2009 (Bitcoin genesis) to year 2100
  const minTimestamp = 1230940800000; // Jan 3, 2009
  const maxTimestamp = 4102444800000; // Jan 1, 2100

  if (timestamp < minTimestamp || timestamp > maxTimestamp) {
    return { valid: false, error: "Timestamp out of valid range" };
  }

  return { valid: true };
}

/**
 * Assert validation result, throw if invalid
 */
export function assertValid(
  result: { valid: boolean; error?: string },
  field: string,
  code = "VALIDATION_ERROR",
): void {
  if (!result.valid) {
    throw new ValidationError(result.error || "Validation failed", code, field);
  }
}

/**
 * Validate and return cleaned address
 */
export function requireValidAddress(
  address: string,
  network: BitcoinNetwork = "testnet4",
): string {
  const result = validateAddress(address, network);
  assertValid(result, "address", "INVALID_ADDRESS");
  return address.trim();
}

/**
 * Validate and return cleaned txid
 */
export function requireValidTxid(txid: string): string {
  const result = validateTxid(txid);
  assertValid(result, "txid", "INVALID_TXID");
  return txid.trim().toLowerCase();
}

/**
 * Validate and return cleaned hash
 */
export function requireValidHash(hash: string): string {
  const result = validateHash(hash);
  assertValid(result, "hash", "INVALID_HASH");
  return hash.trim().toLowerCase();
}
