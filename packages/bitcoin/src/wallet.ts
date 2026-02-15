/**
 * Bitcoin Wallet - HD Wallet Implementation
 *
 * Features:
 * - BIP39 mnemonic generation
 * - BIP32/BIP86 key derivation
 * - Taproot (P2TR) addresses
 * - Secure key management
 *
 * Based on Charms wallet patterns with improvements.
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import type {
  BitcoinNetwork,
  WalletInfo,
  InternalWallet,
  WalletOptions,
  WalletBalance,
} from './types';
import {
  InvalidMnemonicError,
  WalletNotFoundError,
  InvalidAddressError,
} from './errors';
import { secureErase, bytesToHex } from './crypto';

// Initialize BIP32 with secp256k1
const bip32 = BIP32Factory(ecc);

// Initialize bitcoinjs-lib with secp256k1
bitcoin.initEccLib(ecc);

// Network configurations
const NETWORKS: Record<BitcoinNetwork, bitcoin.Network> = {
  mainnet: bitcoin.networks.bitcoin,
  testnet: bitcoin.networks.testnet,
  testnet4: bitcoin.networks.testnet, // Same as testnet for now
  regtest: bitcoin.networks.regtest,
};

// Derivation paths
const DERIVATION_PATHS: Record<string, string> = {
  taproot: "m/86'/0'/0'/0", // BIP86 for Taproot
  segwit: "m/84'/0'/0'/0", // BIP84 for Native SegWit
  legacy: "m/44'/0'/0'/0", // BIP44 for Legacy
};

// Testnet derivation paths (coin type 1)
const TESTNET_DERIVATION_PATHS: Record<string, string> = {
  taproot: "m/86'/1'/0'/0",
  segwit: "m/84'/1'/0'/0",
  legacy: "m/44'/1'/0'/0",
};

/**
 * BitcoinBaby Wallet Class
 *
 * Secure, modular HD wallet implementation.
 */
export class BitcoinWallet {
  private wallet: InternalWallet | null = null;
  private readonly network: BitcoinNetwork;
  private readonly networkConfig: bitcoin.Network;

  constructor(options: WalletOptions = {}) {
    this.network = options.network ?? 'testnet';
    this.networkConfig = NETWORKS[this.network];
  }

  /**
   * Generate a new wallet with a random mnemonic
   */
  async generate(wordCount: 12 | 24 = 12): Promise<WalletInfo> {
    const strength = wordCount === 24 ? 256 : 128;
    const mnemonic = bip39.generateMnemonic(strength);
    return this.fromMnemonic(mnemonic);
  }

  /**
   * Create wallet from existing mnemonic
   */
  async fromMnemonic(
    mnemonic: string,
    options: { addressIndex?: number; addressType?: 'taproot' | 'segwit' | 'legacy' } = {}
  ): Promise<WalletInfo> {
    // Validate mnemonic
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new InvalidMnemonicError('Invalid BIP39 mnemonic phrase');
    }

    const addressIndex = options.addressIndex ?? 0;
    const addressType = options.addressType ?? 'taproot';

    // Derive seed from mnemonic
    const seed = await bip39.mnemonicToSeed(mnemonic);

    // Create HD wallet root
    const root = bip32.fromSeed(Buffer.from(seed), this.networkConfig);

    // Get derivation path
    const isTestnet = this.network !== 'mainnet';
    const basePath = isTestnet
      ? TESTNET_DERIVATION_PATHS[addressType]
      : DERIVATION_PATHS[addressType];
    const derivationPath = `${basePath}/${addressIndex}`;

    // Derive child key
    const child = root.derivePath(derivationPath);

    if (!child.privateKey) {
      throw new Error('Failed to derive private key');
    }

    // Generate address based on type
    const { address, publicKey } = this.generateAddress(child, addressType);

    // Store wallet internally
    this.wallet = {
      address,
      publicKey,
      network: this.network,
      derivationPath,
      addressType,
      privateKey: new Uint8Array(child.privateKey),
      mnemonic,
    };

    // Clear sensitive data from BIP32 objects
    // (The library doesn't expose a clear method, but we minimize exposure)

    return this.getInfo();
  }

  /**
   * Generate address from derived key
   */
  private generateAddress(
    node: ReturnType<typeof bip32.fromSeed>,
    addressType: 'taproot' | 'segwit' | 'legacy'
  ): { address: string; publicKey: string } {
    if (!node.publicKey) {
      throw new Error('No public key available');
    }

    let address: string;

    switch (addressType) {
      case 'taproot': {
        // Taproot (P2TR) - BIP86
        // Use x-only public key (32 bytes, no prefix)
        const xOnlyPubKey = node.publicKey.slice(1, 33);
        const p2tr = bitcoin.payments.p2tr({
          internalPubkey: Buffer.from(xOnlyPubKey),
          network: this.networkConfig,
        });
        address = p2tr.address!;
        break;
      }

      case 'segwit': {
        // Native SegWit (P2WPKH)
        const p2wpkh = bitcoin.payments.p2wpkh({
          pubkey: Buffer.from(node.publicKey),
          network: this.networkConfig,
        });
        address = p2wpkh.address!;
        break;
      }

      case 'legacy': {
        // Legacy (P2PKH)
        const p2pkh = bitcoin.payments.p2pkh({
          pubkey: Buffer.from(node.publicKey),
          network: this.networkConfig,
        });
        address = p2pkh.address!;
        break;
      }
    }

    return {
      address,
      publicKey: bytesToHex(node.publicKey),
    };
  }

  /**
   * Get public wallet info (safe to expose)
   */
  getInfo(): WalletInfo {
    if (!this.wallet) {
      throw new WalletNotFoundError();
    }

    return {
      address: this.wallet.address,
      publicKey: this.wallet.publicKey,
      network: this.wallet.network,
      derivationPath: this.wallet.derivationPath,
      addressType: this.wallet.addressType,
    };
  }

  /**
   * Get the mnemonic (SENSITIVE - handle with care)
   * Only use for backup purposes, never log or transmit
   */
  getMnemonic(): string {
    if (!this.wallet?.mnemonic) {
      throw new WalletNotFoundError();
    }
    return this.wallet.mnemonic;
  }

  /**
   * Check if wallet is loaded
   */
  isLoaded(): boolean {
    return this.wallet !== null;
  }

  /**
   * Get current address
   */
  getAddress(): string {
    if (!this.wallet) {
      throw new WalletNotFoundError();
    }
    return this.wallet.address;
  }

  /**
   * Sign a message (for verification)
   */
  async signMessage(message: string): Promise<string> {
    if (!this.wallet) {
      throw new WalletNotFoundError();
    }

    // Use bitcoinjs-lib message signing
    const messageBuffer = Buffer.from(message, 'utf8');
    const privateKey = Buffer.from(this.wallet.privateKey);

    // For now, return a placeholder - full implementation would use
    // bitcoin-message library for BIP-322 signed messages
    const signature = ecc.sign(
      Buffer.from(await crypto.subtle.digest('SHA-256', messageBuffer)),
      privateKey
    );

    return Buffer.from(signature).toString('base64');
  }

  /**
   * Clear wallet from memory securely
   */
  clear(): void {
    if (this.wallet) {
      secureErase(this.wallet.privateKey);
      // Clear mnemonic string (can't truly erase strings in JS)
      if (this.wallet.mnemonic) {
        // Replace with garbage
        (this.wallet as any).mnemonic = 'x'.repeat(this.wallet.mnemonic.length);
      }
      this.wallet = null;
    }
  }
}

// ============================================
// Static utility functions
// ============================================

/**
 * Validate a Bitcoin address
 */
export function validateAddress(address: string, network: BitcoinNetwork = 'testnet'): boolean {
  try {
    bitcoin.address.toOutputScript(address, NETWORKS[network]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get address type from address string
 */
export function getAddressType(address: string): 'taproot' | 'segwit' | 'legacy' | 'unknown' {
  // Mainnet
  if (address.startsWith('bc1p')) return 'taproot';
  if (address.startsWith('bc1q')) return 'segwit';
  if (address.startsWith('1')) return 'legacy';
  if (address.startsWith('3')) return 'segwit'; // P2SH-wrapped

  // Testnet
  if (address.startsWith('tb1p')) return 'taproot';
  if (address.startsWith('tb1q')) return 'segwit';
  if (address.startsWith('m') || address.startsWith('n')) return 'legacy';
  if (address.startsWith('2')) return 'segwit'; // P2SH-wrapped

  return 'unknown';
}

/**
 * Format address for display (truncated)
 */
export function formatAddress(address: string, chars = 8): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format satoshis to BTC string
 */
export function satsToBtc(sats: number): string {
  return (sats / 100_000_000).toFixed(8);
}

/**
 * Format BTC to satoshis
 */
export function btcToSats(btc: number): number {
  return Math.round(btc * 100_000_000);
}

// Legacy exports for compatibility
export type { WalletInfo, WalletOptions, WalletBalance };
