/**
 * Internal Wallet Provider
 *
 * Wraps the BitcoinWallet class for use with the provider interface.
 * This is the self-custodied wallet option.
 */

import type { Psbt } from "bitcoinjs-lib";
import type { BitcoinNetwork } from "../types";
import { BitcoinWallet } from "../wallet";
import { MempoolClient } from "../blockchain";
import type {
  WalletProvider,
  WalletProviderType,
  WalletAccount,
  SignedMessage,
  SignedPsbt,
  BroadcastResult,
  ConnectOptions,
  SignPsbtOptions,
  ProviderCapabilities,
} from "./types";

/**
 * Internal wallet provider options
 */
export interface InternalProviderOptions {
  network?: BitcoinNetwork;
}

/**
 * Internal Wallet Provider
 *
 * Uses the built-in BitcoinWallet for self-custodied wallet operations.
 */
export class InternalWalletProvider implements WalletProvider {
  readonly type: WalletProviderType = "internal";
  readonly name = "BitcoinBaby Wallet";
  readonly capabilities: ProviderCapabilities = {
    signMessage: true,
    signPsbt: true,
    sendBitcoin: true,
    inscribe: false,
    getBalance: true,
    switchNetwork: true,
  };

  private wallet: BitcoinWallet | null = null;
  private network: BitcoinNetwork;
  private mempool: MempoolClient;

  constructor(options: InternalProviderOptions = {}) {
    this.network = options.network ?? "testnet4";
    this.mempool = new MempoolClient({ network: this.network });
  }

  isAvailable(): boolean {
    // Internal wallet is always available
    return true;
  }

  async connect(options?: ConnectOptions): Promise<WalletAccount> {
    if (!options?.mnemonic && !options?.password) {
      throw new Error("Mnemonic or password required for internal wallet");
    }

    // If mnemonic provided, create new wallet
    if (options.mnemonic) {
      // Create instance then call fromMnemonic (instance method)
      const bitcoinWallet = new BitcoinWallet({ network: this.network });
      await bitcoinWallet.fromMnemonic(options.mnemonic, {
        addressType: "taproot",
      });
      this.wallet = bitcoinWallet;
    }
    // If only password, assume wallet is loaded from secure storage
    // This would need integration with SecureStorage

    if (!this.wallet) {
      throw new Error("Failed to initialize wallet");
    }

    const info = this.wallet.getInfo();
    return {
      address: info.address,
      publicKey: info.publicKey,
      addressType: info.addressType,
    };
  }

  async disconnect(): Promise<void> {
    if (this.wallet) {
      this.wallet.clear();
      this.wallet = null;
    }
  }

  async getAccount(): Promise<WalletAccount | null> {
    if (!this.wallet) return null;

    const info = this.wallet.getInfo();
    return {
      address: info.address,
      publicKey: info.publicKey,
      addressType: info.addressType,
    };
  }

  async getNetwork(): Promise<BitcoinNetwork> {
    return this.network;
  }

  async switchNetwork(network: BitcoinNetwork): Promise<void> {
    this.network = network;
    this.mempool = new MempoolClient({ network });

    // If wallet exists, we'd need to re-derive addresses
    // For now, disconnect and require reconnection
    if (this.wallet) {
      await this.disconnect();
    }
  }

  async signMessage(message: string): Promise<SignedMessage> {
    if (!this.wallet) {
      throw new Error("Wallet not connected");
    }

    const signature = await this.wallet.signMessage(message);
    const info = this.wallet.getInfo();

    return {
      signature,
      address: info.address,
      message,
    };
  }

  async signPsbt(
    psbt: string | Psbt,
    options?: SignPsbtOptions,
  ): Promise<SignedPsbt> {
    if (!this.wallet) {
      throw new Error("Wallet not connected");
    }

    // Convert to Psbt if string
    const psbtObj =
      typeof psbt === "string"
        ? (await import("bitcoinjs-lib")).Psbt.fromHex(psbt)
        : psbt;

    // Sign the PSBT (signPSBT takes optional inputIndices array directly)
    const signedPsbt = this.wallet.signPSBT(psbtObj, options?.inputsToSign);

    // Optionally finalize
    if (options?.finalize) {
      signedPsbt.finalizeAllInputs();
    }

    return {
      signedPsbtHex: signedPsbt.toHex(),
      signedPsbtBase64: signedPsbt.toBase64(),
      txid: options?.finalize
        ? signedPsbt.extractTransaction().getId()
        : undefined,
    };
  }

  async signAndBroadcast(psbt: string | Psbt): Promise<BroadcastResult> {
    if (!this.wallet) {
      throw new Error("Wallet not connected");
    }

    try {
      // Sign and finalize
      const signed = await this.signPsbt(psbt, { finalize: true });

      // Extract transaction hex
      const psbtObj = (await import("bitcoinjs-lib")).Psbt.fromHex(
        signed.signedPsbtHex,
      );
      const txHex = psbtObj.extractTransaction().toHex();

      // Broadcast via mempool
      const txid = await this.mempool.broadcastTransaction(txHex);

      return {
        txid,
        success: true,
      };
    } catch (error) {
      return {
        txid: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getBalance(): Promise<bigint> {
    if (!this.wallet) {
      throw new Error("Wallet not connected");
    }

    const info = this.wallet.getInfo();
    const balance = await this.mempool.getBalance(info.address);
    return BigInt(balance.confirmed + balance.unconfirmed);
  }

  /**
   * Create wallet from mnemonic (factory method)
   */
  static async create(
    mnemonic: string,
    options?: InternalProviderOptions,
  ): Promise<InternalWalletProvider> {
    const provider = new InternalWalletProvider(options);
    await provider.connect({ mnemonic });
    return provider;
  }

  /**
   * Generate a new wallet
   */
  static async generate(
    options?: InternalProviderOptions,
  ): Promise<{ provider: InternalWalletProvider; mnemonic: string }> {
    // Create a BitcoinWallet instance then call generate (instance method)
    const bitcoinWallet = new BitcoinWallet({
      network: options?.network ?? "testnet4",
    });
    await bitcoinWallet.generate(12);

    const mnemonic = bitcoinWallet.getMnemonic();
    if (!mnemonic) {
      throw new Error("Failed to generate mnemonic");
    }

    const provider = new InternalWalletProvider(options);
    await provider.connect({ mnemonic });

    return { provider, mnemonic };
  }
}

/**
 * Create an internal wallet provider
 */
export function createInternalProvider(
  options?: InternalProviderOptions,
): InternalWalletProvider {
  return new InternalWalletProvider(options);
}
