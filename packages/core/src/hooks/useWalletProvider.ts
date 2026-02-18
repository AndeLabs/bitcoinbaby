/**
 * useWalletProvider Hook
 *
 * React hook for interacting with Bitcoin wallet providers.
 * Supports multiple wallet types (internal, Unisat, XVerse, etc.)
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  type WalletProvider,
  type WalletProviderType,
  type WalletAccount,
  type WalletConnectionState,
  type DetectedProvider,
  type SignedMessage,
  type SignedPsbt,
  type ProviderBroadcastResult,
  type SignPsbtOptions,
  type BitcoinNetwork,
  detectWallets,
  getProvider,
  getAvailableProviders,
  getBestProvider,
} from "@bitcoinbaby/bitcoin";

/**
 * Hook state
 */
interface UseWalletProviderState extends WalletConnectionState {
  availableProviders: DetectedProvider[];
}

/**
 * Hook actions
 */
interface UseWalletProviderActions {
  /**
   * Connect to a specific wallet provider
   */
  connect: (type: WalletProviderType, options?: ConnectParams) => Promise<void>;

  /**
   * Connect to the best available provider
   */
  connectBest: () => Promise<void>;

  /**
   * Disconnect from current wallet
   */
  disconnect: () => Promise<void>;

  /**
   * Sign a message
   */
  signMessage: (message: string) => Promise<SignedMessage>;

  /**
   * Sign a PSBT
   */
  signPsbt: (psbt: string, options?: SignPsbtOptions) => Promise<SignedPsbt>;

  /**
   * Sign and broadcast a transaction
   */
  signAndBroadcast: (psbt: string) => Promise<ProviderBroadcastResult>;

  /**
   * Get balance in satoshis
   */
  getBalance: () => Promise<bigint>;

  /**
   * Switch network (if supported)
   */
  switchNetwork: (network: BitcoinNetwork) => Promise<void>;

  /**
   * Refresh available providers
   */
  refreshProviders: () => void;
}

interface ConnectParams {
  password?: string;
  mnemonic?: string;
}

export type UseWalletProviderReturn = UseWalletProviderState &
  UseWalletProviderActions;

/**
 * React hook for wallet provider management
 */
export function useWalletProvider(): UseWalletProviderReturn {
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [network, setNetwork] = useState<BitcoinNetwork>("testnet4");
  const [providerType, setProviderType] = useState<WalletProviderType | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [availableProviders, setAvailableProviders] = useState<
    DetectedProvider[]
  >([]);

  // Current provider instance
  const [provider, setProvider] = useState<WalletProvider | null>(null);

  // Detect available providers on mount
  useEffect(() => {
    refreshProviders();
  }, []);

  // Refresh available providers
  const refreshProviders = useCallback(() => {
    const detected = detectWallets();
    setAvailableProviders(detected);
  }, []);

  // Connect to a specific provider
  const connect = useCallback(
    async (type: WalletProviderType, options?: ConnectParams) => {
      setIsConnecting(true);
      setError(null);

      try {
        const walletProvider = getProvider(type);
        if (!walletProvider) {
          throw new Error(`Provider ${type} not found`);
        }

        if (!walletProvider.isAvailable()) {
          throw new Error(`Provider ${type} is not available`);
        }

        const connectedAccount = await walletProvider.connect({
          password: options?.password,
          mnemonic: options?.mnemonic,
        });

        const connectedNetwork = await walletProvider.getNetwork();

        setProvider(walletProvider);
        setAccount(connectedAccount);
        setNetwork(connectedNetwork);
        setProviderType(type);
        setIsConnected(true);

        // Set up listeners if available
        if (walletProvider.onAccountChange) {
          walletProvider.onAccountChange((newAccount) => {
            setAccount(newAccount);
            if (!newAccount) {
              setIsConnected(false);
              setProviderType(null);
            }
          });
        }

        if (walletProvider.onNetworkChange) {
          walletProvider.onNetworkChange((newNetwork) => {
            setNetwork(newNetwork);
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Connection failed";
        setError(message);
        throw err;
      } finally {
        setIsConnecting(false);
      }
    },
    []
  );

  // Connect to the best available provider
  const connectBest = useCallback(async () => {
    const best = getBestProvider();
    if (!best) {
      throw new Error("No wallet providers available");
    }
    await connect(best.type);
  }, [connect]);

  // Disconnect
  const disconnect = useCallback(async () => {
    if (provider) {
      await provider.disconnect();
    }

    setProvider(null);
    setAccount(null);
    setIsConnected(false);
    setProviderType(null);
    setError(null);
  }, [provider]);

  // Sign message
  const signMessage = useCallback(
    async (message: string): Promise<SignedMessage> => {
      if (!provider || !isConnected) {
        throw new Error("Wallet not connected");
      }
      return provider.signMessage(message);
    },
    [provider, isConnected]
  );

  // Sign PSBT
  const signPsbt = useCallback(
    async (psbt: string, options?: SignPsbtOptions): Promise<SignedPsbt> => {
      if (!provider || !isConnected) {
        throw new Error("Wallet not connected");
      }
      return provider.signPsbt(psbt, options);
    },
    [provider, isConnected]
  );

  // Sign and broadcast
  const signAndBroadcast = useCallback(
    async (psbt: string): Promise<ProviderBroadcastResult> => {
      if (!provider || !isConnected) {
        throw new Error("Wallet not connected");
      }
      return provider.signAndBroadcast(psbt);
    },
    [provider, isConnected]
  );

  // Get balance
  const getBalance = useCallback(async (): Promise<bigint> => {
    if (!provider || !isConnected) {
      throw new Error("Wallet not connected");
    }
    if (!provider.getBalance) {
      throw new Error("Provider does not support balance queries");
    }
    return provider.getBalance();
  }, [provider, isConnected]);

  // Switch network
  const switchNetwork = useCallback(
    async (newNetwork: BitcoinNetwork): Promise<void> => {
      if (!provider || !isConnected) {
        throw new Error("Wallet not connected");
      }
      if (!provider.switchNetwork) {
        throw new Error("Provider does not support network switching");
      }
      await provider.switchNetwork(newNetwork);
      setNetwork(newNetwork);
    },
    [provider, isConnected]
  );

  return useMemo(
    () => ({
      // State
      isConnected,
      isConnecting,
      account,
      network,
      providerType,
      error,
      availableProviders,
      // Actions
      connect,
      connectBest,
      disconnect,
      signMessage,
      signPsbt,
      signAndBroadcast,
      getBalance,
      switchNetwork,
      refreshProviders,
    }),
    [
      isConnected,
      isConnecting,
      account,
      network,
      providerType,
      error,
      availableProviders,
      connect,
      connectBest,
      disconnect,
      signMessage,
      signPsbt,
      signAndBroadcast,
      getBalance,
      switchNetwork,
      refreshProviders,
    ]
  );
}

export default useWalletProvider;
