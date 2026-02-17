import { describe, it, expect } from 'vitest';
import { hexToBytes, bytesToHex, sha256, hash160 } from '../src/crypto';

describe('hexToBytes and bytesToHex', () => {
  it('should roundtrip hex to bytes and back', () => {
    const originalHex = 'deadbeef';
    const bytes = hexToBytes(originalHex);
    const resultHex = bytesToHex(bytes);
    expect(resultHex).toBe(originalHex);
  });

  it('should roundtrip empty hex string', () => {
    const originalHex = '';
    const bytes = hexToBytes(originalHex);
    const resultHex = bytesToHex(bytes);
    expect(resultHex).toBe(originalHex);
  });

  it('should roundtrip longer hex strings', () => {
    const originalHex = '0123456789abcdef0123456789abcdef';
    const bytes = hexToBytes(originalHex);
    const resultHex = bytesToHex(bytes);
    expect(resultHex).toBe(originalHex);
  });

  it('should handle leading zeros correctly', () => {
    const originalHex = '00ff00ff';
    const bytes = hexToBytes(originalHex);
    const resultHex = bytesToHex(bytes);
    expect(resultHex).toBe(originalHex);
  });

  it('should throw on invalid hex string (odd length)', () => {
    expect(() => hexToBytes('abc')).toThrow('Invalid hex string');
  });
});

describe('sha256', () => {
  it('should return correct hash for known input', async () => {
    // SHA256 of empty string is well-known
    const emptyInput = new Uint8Array(0);
    const hash = await sha256(emptyInput);

    // SHA256('') = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    const expectedHex = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    expect(bytesToHex(hash)).toBe(expectedHex);
  });

  it('should return 32 bytes (256 bits)', async () => {
    const input = hexToBytes('deadbeef');
    const hash = await sha256(input);
    expect(hash.length).toBe(32);
  });

  it('should return correct hash for "hello"', async () => {
    // "hello" as bytes
    const input = new TextEncoder().encode('hello');
    const hash = await sha256(input);

    // SHA256('hello') = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
    const expectedHex = '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824';
    expect(bytesToHex(hash)).toBe(expectedHex);
  });
});

describe('hash160', () => {
  it('should return 20 bytes (RIPEMD160 output size)', async () => {
    const input = hexToBytes('deadbeef');
    const hash = await hash160(input);
    expect(hash.length).toBe(20);
  });

  it('should return correct hash160 for known public key', async () => {
    // Test with a known Bitcoin public key hash
    // Example: compressed public key
    const publicKey = hexToBytes(
      '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
    );
    const hash = await hash160(publicKey);

    // hash160 of the above key (secp256k1 generator point G)
    // = 751e76e8199196d454941c45d1b3a323f1433bd6
    const expectedHex = '751e76e8199196d454941c45d1b3a323f1433bd6';
    expect(bytesToHex(hash)).toBe(expectedHex);
  });

  it('should return different hash for different inputs', async () => {
    const input1 = hexToBytes('01');
    const input2 = hexToBytes('02');

    const hash1 = await hash160(input1);
    const hash2 = await hash160(input2);

    expect(bytesToHex(hash1)).not.toBe(bytesToHex(hash2));
  });
});
