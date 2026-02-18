/**
 * XVerse Wallet Provider
 *
 * Integration with XVerse browser extension.
 * https://www.xverse.app
 *
 * Uses the Sats Connect library for standardized Bitcoin wallet interactions.
 */

import type { Psbt } from "bitcoinjs-lib";
import type { BitcoinNetwork } from "../types";
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
 * XVerse/Sats Connect types
 */
interface BitcoinProvider {
  connect(
    message?: string
  ): Promise<{ address: string; publicKey: string }>;
  getAddress(): Promise<{ address: string; publicKey: string }>;
  signMessage(
    address: string,
    message: string
  ): Promise<{ signature: string }>;
  signTransaction(
    psbtBase64: string,
    options?: { broadcast?: boolean }
  ): Promise<{ psbtBase64: string; txId?: string }>;
  sendBtcTransaction(
    recipients: { address: string; amountSats: number }[]
  ): Promise<{ txId: string }>;
}

declare global {
  interface Window {
    BitcoinProvider?: BitcoinProvider;
    XverseProviders?: {
      BitcoinProvider?: BitcoinProvider;
    };
  }
}

/**
 * XVerse Wallet Provider
 */
export class XVerseProvider implements WalletProvider {
  readonly type: WalletProviderType = "xverse";
  readonly name = "XVerse Wallet";
  readonly capabilities: ProviderCapabilities = {
    signMessage: true,
    signPsbt: true,
    sendBitcoin: true,
    inscribe: true,
    getBalance: false, // XVerse doesn't expose balance directly
    switchNetwork: false, // Network switching not supported via API
  };

  private account: WalletAccount | null = null;
  private network: BitcoinNetwork = "mainnet";

  private get provider(): BitcoinProvider {
    const provider =
      typeof window !== "undefined"
        ? window.BitcoinProvider || window.XverseProviders?.BitcoinProvider
        : undefined;

    if (!provider) {
      throw new Error("XVerse wallet not installed");
    }
    return provider;
  }

  isAvailable(): boolean {
    return (
      typeof window !== "undefined" &&
      !!(window.BitcoinProvider || window.XverseProviders?.BitcoinProvider)
    );
  }

  async connect(_options?: ConnectOptions): Promise<WalletAccount> {
    if (!this.isAvailable()) {
      throw new Error("XVerse wallet not installed");
    }

    const result = await this.provider.connect("Connect to BitcoinBaby");

    this.account = {
      address: result.address,
      publicKey: result.publicKey,
      addressType: this.detectAddressType(result.address),
    };

    // Detect network from address
    this.network = result.address.startsWith("bc1") ? "mainnet" : "testnet4";

    return this.account;
  }

  async disconnect(): Promise<void> {
    this.account = null;
    // XVerse doesn't have a disconnect method
  }

  async getAccount(): Promise<WalletAccount | null> {
    if (!this.isAvailable()) return null;

    try {
      const result = await this.provider.getAddress();

      this.account = {
        address: result.address,
        publicKey: result.publicKey,
        addressType: this.detectAddressType(result.address),
      };

      return this.account;
    } catch {
      return null;
    }
  }

  async getNetwork(): Promise<BitcoinNetwork> {
    // Detect from address if connected
    if (this.account) {
      return this.account.address.startsWith("bc1") ? "mainnet" : "testnet4";
    }
    return this.network;
  }

  async signMessage(message: string): Promise<SignedMessage> {
    if (!this.account) {
      throw new Error("Wallet not connected");
    }

    const result = await this.provider.signMessage(
      this.account.address,
      message
    );

    return {
      signature: result.signature,
      address: this.account.address,
      message,
    };
  }

  async signPsbt(
    psbt: string | Psbt,
    options?: SignPsbtOptions
  ): Promise<SignedPsbt> {
    // XVerse expects base64
    let psbtBase64: string;

    if (typeof psbt === "string") {
      // Check if it's hex or base64
      if (psbt.match(/^[0-9a-fA-F]+$/)) {
        // It's hex, convert to base64
        const psbtObj = (await import("bitcoinjs-lib")).Psbt.fromHex(psbt);
        psbtBase64 = psbtObj.toBase64();
      } else {
        psbtBase64 = psbt;
      }
    } else {
      psbtBase64 = psbt.toBase64();
    }

    const result = await this.provider.signTransaction(psbtBase64, {
      broadcast: options?.broadcast ?? false,
    });

    // Convert back to Psbt for hex
    const signedPsbt = (await import("bitcoinjs-lib")).Psbt.fromBase64(
      result.psbtBase64
    );

    return {
      signedPsbtHex: signedPsbt.toHex(),
      signedPsbtBase64: result.psbtBase64,
      txid: result.txId,
    };
  }

  async signAndBroadcast(psbt: string | Psbt): Promise<BroadcastResult> {
    try {
      const result = await this.signPsbt(psbt, { broadcast: true });

      return {
        txid: result.txid || "",
        success: !!result.txid,
        error: result.txid ? undefined : "Broadcast failed",
      };
    } catch (error) {
      return {
        txid: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private detectAddressType(
    address: string
  ): "taproot" | "segwit" | "legacy" {
    if (address.startsWith("bc1p") || address.startsWith("tb1p")) {
      return "taproot";
    }
    if (address.startsWith("bc1q") || address.startsWith("tb1q")) {
      return "segwit";
    }
    return "legacy";
  }
}

/**
 * Create an XVerse wallet provider
 */
export function createXVerseProvider(): XVerseProvider {
  return new XVerseProvider();
}
