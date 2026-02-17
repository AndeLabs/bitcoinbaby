/**
 * Scrolls API Client
 *
 * Client for interacting with the Charms Scrolls API.
 * https://scrolls.charms.dev
 */

import type {
  ScrollsNetwork,
  ScrollsConfig,
  SignRequest,
  FeeCalculation,
  AddressTokenBalances,
  TokenBalance,
  TokenUTXO,
} from "./types";
import { ApiError } from "../errors";

const DEFAULT_BASE_URL = "https://scrolls.charms.dev";

export interface ScrollsClientOptions {
  baseUrl?: string;
  timeout?: number;
  network?: ScrollsNetwork;
}

export class ScrollsClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private network: ScrollsNetwork;
  private config: ScrollsConfig | null = null;

  constructor(options: ScrollsClientOptions = {}) {
    this.baseUrl = options.baseUrl || DEFAULT_BASE_URL;
    this.timeout = options.timeout || 30000;
    this.network = options.network || "testnet4";
  }

  /**
   * Make HTTP request to Scrolls API
   */
  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new ScrollsAPIError(
          `API error: ${response.status} ${response.statusText}`,
          response.status,
          error,
        );
      }

      return response.json() as Promise<T>;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Set the network for API calls
   */
  setNetwork(network: ScrollsNetwork): void {
    this.network = network;
    this.config = null; // Reset cached config
  }

  /**
   * Get current network
   */
  getNetwork(): ScrollsNetwork {
    return this.network;
  }

  /**
   * Get API configuration including fee addresses
   */
  async getConfig(): Promise<ScrollsConfig> {
    if (this.config) {
      return this.config;
    }

    this.config = await this.fetch<ScrollsConfig>("/config");
    return this.config;
  }

  /**
   * Get the fee address for the current network
   */
  async getFeeAddress(): Promise<string> {
    const config = await this.getConfig();
    return this.network === "main"
      ? config.fee_address.main
      : config.fee_address.testnet4;
  }

  /**
   * Derive an address from a nonce
   * The same nonce always results in the same address on the same network
   */
  async deriveAddress(nonce: number): Promise<string> {
    return this.fetch<string>(`/${this.network}/address/${nonce}`);
  }

  /**
   * Sign a transaction
   */
  async signTransaction(request: SignRequest): Promise<string> {
    return this.fetch<string>(`/${this.network}/sign`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Calculate fee for a transaction
   * Fee formula: fixed_cost + fee_per_input * number_of_inputs + fee_basis_points / 10000 * total_input_sats
   */
  async calculateFee(
    numberOfInputs: number,
    totalInputSats: number,
  ): Promise<FeeCalculation> {
    const config = await this.getConfig();

    const fixedCost = config.fixed_cost;
    const inputFees = config.fee_per_input * numberOfInputs;
    const percentageFee = Math.floor(
      (config.fee_basis_points / 10000) * totalInputSats,
    );
    const totalFee = fixedCost + inputFees + percentageFee;

    return {
      fixedCost,
      inputFees,
      percentageFee,
      totalFee,
      feeAddress: await this.getFeeAddress(),
    };
  }

  /**
   * Get token balances for an address
   *
   * Queries the Scrolls indexer for all Charms token balances.
   * Returns empty balances if the API endpoint is not yet available.
   *
   * @param address - Bitcoin address to query
   * @param tokenTicker - Optional specific token ticker to filter (e.g., 'BABY')
   */
  async getTokenBalances(
    address: string,
    tokenTicker?: string,
  ): Promise<AddressTokenBalances> {
    try {
      // Build query path with optional token filter
      const queryParams = tokenTicker ? `?ticker=${tokenTicker}` : "";
      const path = `/${this.network}/balances/${address}${queryParams}`;

      // API response structure (when available)
      interface ApiBalanceResponse {
        balances: Array<{
          ticker: string;
          token_id: string;
          amount: string; // BigInt as string
          utxo_count: number;
        }>;
        block_height: number;
      }

      const response = await this.fetch<ApiBalanceResponse>(path);

      return {
        address,
        network: this.network,
        balances: response.balances.map((b) => ({
          ticker: b.ticker,
          tokenId: b.token_id,
          amount: BigInt(b.amount),
          utxoCount: b.utxo_count,
        })),
        blockHeight: response.block_height,
        timestamp: Date.now(),
      };
    } catch (error) {
      // If API returns 404 or endpoint not available, return empty balances
      if (error instanceof ScrollsAPIError && error.statusCode === 404) {
        return {
          address,
          network: this.network,
          balances: [],
          blockHeight: 0,
          timestamp: Date.now(),
        };
      }
      throw error;
    }
  }

  /**
   * Get balance for a specific token
   *
   * Convenience method to get balance of a single token type.
   *
   * @param address - Bitcoin address to query
   * @param tokenTicker - Token ticker (e.g., 'BABY')
   */
  async getTokenBalance(
    address: string,
    tokenTicker: string,
  ): Promise<TokenBalance | null> {
    const balances = await this.getTokenBalances(address, tokenTicker);
    return balances.balances.find((b) => b.ticker === tokenTicker) || null;
  }

  /**
   * Get token UTXOs for an address
   *
   * Returns all UTXOs that contain Charms tokens.
   *
   * @param address - Bitcoin address to query
   * @param tokenTicker - Optional token ticker to filter
   */
  async getTokenUTXOs(
    address: string,
    tokenTicker?: string,
  ): Promise<TokenUTXO[]> {
    try {
      const queryParams = tokenTicker ? `?ticker=${tokenTicker}` : "";
      const path = `/${this.network}/utxos/${address}/tokens${queryParams}`;

      // API response structure (when available)
      interface ApiUtxoResponse {
        utxos: Array<{
          txid: string;
          vout: number;
          satoshis: number;
          token_amount: string;
          ticker: string;
          confirmed: boolean;
          block_height?: number;
        }>;
      }

      const response = await this.fetch<ApiUtxoResponse>(path);

      return response.utxos.map((u) => ({
        txid: u.txid,
        vout: u.vout,
        satoshis: u.satoshis,
        tokenAmount: BigInt(u.token_amount),
        ticker: u.ticker,
        confirmed: u.confirmed,
        blockHeight: u.block_height,
      }));
    } catch (error) {
      // If API returns 404 or endpoint not available, return empty array
      if (error instanceof ScrollsAPIError && error.statusCode === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Check if token balance API is available
   *
   * Some Scrolls deployments may not have the balance endpoint enabled.
   */
  async isTokenBalanceAvailable(): Promise<boolean> {
    try {
      // Try to fetch with a dummy address to check endpoint availability
      await this.fetch(
        `/${this.network}/balances/tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx`,
      );
      return true;
    } catch (error) {
      if (error instanceof ScrollsAPIError && error.statusCode === 404) {
        return false;
      }
      // Other errors (network, timeout) - assume available but failed
      return true;
    }
  }
}

/**
 * Custom error for Scrolls API errors
 * Extends shared ApiError for consistency
 */
export class ScrollsAPIError extends ApiError {
  readonly statusCode: number;
  readonly response?: string;

  constructor(message: string, statusCode?: number, response?: string) {
    super("scrolls.charms.dev", statusCode, response || message);
    this.name = "ScrollsAPIError";
    this.statusCode = statusCode ?? 0;
    this.response = response;
  }
}

/**
 * Create a Scrolls client instance
 */
export function createScrollsClient(
  options?: ScrollsClientOptions,
): ScrollsClient {
  return new ScrollsClient(options);
}
