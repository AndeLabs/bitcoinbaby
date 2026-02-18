/**
 * Unisat Wallet Provider
 *
 * Integration with Unisat browser extension.
 * https://unisat.io
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
 * Unisat API types (from window.unisat)
 */
interface UnisatAPI {
  requestAccounts(): Promise<string[]>;
  getAccounts(): Promise<string[]>;
  getPublicKey(): Promise<string>;
  getNetwork(): Promise<"livenet" | "testnet">;
  switchNetwork(network: "livenet" | "testnet"): Promise<void>;
  getBalance(): Promise<{ confirmed: number; unconfirmed: number; total: number }>;
  signMessage(message: string, type?: "ecdsa" | "bip322-simple"): Promise<string>;
  signPsbt(psbtHex: string, options?: { autoFinalized?: boolean }): Promise<string>;
  signPsbts(psbtHexs: string[], options?: { autoFinalized?: boolean }): Promise<string[]>;
  pushPsbt(psbtHex: string): Promise<string>;
  sendBitcoin(toAddress: string, satoshis: number, options?: { feeRate?: number }): Promise<string>;
  on(event: string, callback: (data: unknown) => void): void;
  removeListener(event: string, callback: (data: unknown) => void): void;
}

declare global {
  interface Window {
    unisat?: UnisatAPI;
  }
}

/**
 * Unisat Wallet Provider
 */
export class UnisatProvider implements WalletProvider {
  readonly type: WalletProviderType = "unisat";
  readonly name = "Unisat Wallet";
  readonly capabilities: ProviderCapabilities = {
    signMessage: true,
    signPsbt: true,
    sendBitcoin: true,
    inscribe: true,
    getBalance: true,
    switchNetwork: true,
  };

  private account: WalletAccount | null = null;
  private accountChangeCallbacks: ((account: WalletAccount | null) => void)[] = [];
  private networkChangeCallbacks: ((network: BitcoinNetwork) => void)[] = [];

  private get unisat(): UnisatAPI {
    if (typeof window === "undefined" || !window.unisat) {
      throw new Error("Unisat wallet not installed");
    }
    return window.unisat;
  }

  isAvailable(): boolean {
    return typeof window !== "undefined" && !!window.unisat;
  }

  async connect(_options?: ConnectOptions): Promise<WalletAccount> {
    if (!this.isAvailable()) {
      throw new Error("Unisat wallet not installed");
    }

    const accounts = await this.unisat.requestAccounts();
    if (!accounts.length) {
      throw new Error("No accounts found");
    }

    const publicKey = await this.unisat.getPublicKey();

    this.account = {
      address: accounts[0],
      publicKey,
      addressType: this.detectAddressType(accounts[0]),
    };

    // Set up listeners
    this.setupListeners();

    return this.account;
  }

  async disconnect(): Promise<void> {
    this.account = null;
    // Unisat doesn't have a disconnect method
    // We just clear local state
  }

  async getAccount(): Promise<WalletAccount | null> {
    if (!this.isAvailable()) return null;

    try {
      const accounts = await this.unisat.getAccounts();
      if (!accounts.length) return null;

      const publicKey = await this.unisat.getPublicKey();

      this.account = {
        address: accounts[0],
        publicKey,
        addressType: this.detectAddressType(accounts[0]),
      };

      return this.account;
    } catch {
      return null;
    }
  }

  async getNetwork(): Promise<BitcoinNetwork> {
    const network = await this.unisat.getNetwork();
    return network === "livenet" ? "mainnet" : "testnet4";
  }

  async switchNetwork(network: BitcoinNetwork): Promise<void> {
    const unisatNetwork = network === "mainnet" ? "livenet" : "testnet";
    await this.unisat.switchNetwork(unisatNetwork);
  }

  async signMessage(message: string): Promise<SignedMessage> {
    if (!this.account) {
      throw new Error("Wallet not connected");
    }

    const signature = await this.unisat.signMessage(message, "bip322-simple");

    return {
      signature,
      address: this.account.address,
      message,
    };
  }

  async signPsbt(
    psbt: string | Psbt,
    options?: SignPsbtOptions
  ): Promise<SignedPsbt> {
    // Convert Psbt object to hex if needed
    const psbtHex = typeof psbt === "string" ? psbt : psbt.toHex();

    const signedHex = await this.unisat.signPsbt(psbtHex, {
      autoFinalized: options?.finalize ?? false,
    });

    // Convert to base64
    const signedPsbt = (await import("bitcoinjs-lib")).Psbt.fromHex(signedHex);

    return {
      signedPsbtHex: signedHex,
      signedPsbtBase64: signedPsbt.toBase64(),
      txid: options?.finalize
        ? signedPsbt.extractTransaction().getId()
        : undefined,
    };
  }

  async signAndBroadcast(psbt: string | Psbt): Promise<BroadcastResult> {
    try {
      // Sign
      const signed = await this.signPsbt(psbt, { finalize: true });

      // Broadcast via Unisat's pushPsbt
      const txid = await this.unisat.pushPsbt(signed.signedPsbtHex);

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
    const balance = await this.unisat.getBalance();
    return BigInt(balance.total);
  }

  onAccountChange(
    callback: (account: WalletAccount | null) => void
  ): () => void {
    this.accountChangeCallbacks.push(callback);

    return () => {
      const index = this.accountChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.accountChangeCallbacks.splice(index, 1);
      }
    };
  }

  onNetworkChange(callback: (network: BitcoinNetwork) => void): () => void {
    this.networkChangeCallbacks.push(callback);

    return () => {
      const index = this.networkChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.networkChangeCallbacks.splice(index, 1);
      }
    };
  }

  private setupListeners(): void {
    if (!this.isAvailable()) return;

    // Account change listener
    this.unisat.on("accountsChanged", async (accounts: unknown) => {
      const addrs = accounts as string[];
      if (addrs.length > 0) {
        const publicKey = await this.unisat.getPublicKey();
        this.account = {
          address: addrs[0],
          publicKey,
          addressType: this.detectAddressType(addrs[0]),
        };
      } else {
        this.account = null;
      }

      for (const cb of this.accountChangeCallbacks) {
        cb(this.account);
      }
    });

    // Network change listener
    this.unisat.on("networkChanged", (network: unknown) => {
      const net = network as "livenet" | "testnet";
      const bitcoinNetwork: BitcoinNetwork =
        net === "livenet" ? "mainnet" : "testnet4";

      for (const cb of this.networkChangeCallbacks) {
        cb(bitcoinNetwork);
      }
    });
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
 * Create a Unisat wallet provider
 */
export function createUnisatProvider(): UnisatProvider {
  return new UnisatProvider();
}
