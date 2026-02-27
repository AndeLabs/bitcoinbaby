/**
 * BitcoinBaby API Client
 *
 * Client for communicating with Cloudflare Workers backend.
 * Handles balance, withdrawals, and game state sync.
 */

import type {
  ApiResponse,
  BalanceResponse,
  CreditResponse,
  MiningProof,
  PoolType,
  PoolStatusResponse,
  WithdrawRequest,
  WithdrawResponse,
  GameState,
} from "./types";

// =============================================================================
// CONFIGURATION
// =============================================================================

const API_ENDPOINTS = {
  development: "http://localhost:8787",
  production: "https://bitcoinbaby-api-prod.workers.dev",
} as const;

type Environment = keyof typeof API_ENDPOINTS;

// =============================================================================
// CLIENT
// =============================================================================

export class BitcoinBabyClient {
  private baseUrl: string;
  private environment: Environment;

  constructor(env: Environment = "development") {
    this.environment = env;
    this.baseUrl = API_ENDPOINTS[env];
  }

  /**
   * Set custom base URL (for testing or custom deployments)
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get current environment
   */
  getEnvironment(): Environment {
    return this.environment;
  }

  // ===========================================================================
  // BALANCE API
  // ===========================================================================

  /**
   * Get user's virtual balance
   */
  async getBalance(address: string): Promise<ApiResponse<BalanceResponse>> {
    const response = await fetch(`${this.baseUrl}/api/balance/${address}`);
    return response.json() as Promise<ApiResponse<BalanceResponse>>;
  }

  /**
   * Credit mining reward to user's balance
   */
  async creditMining(
    address: string,
    proof: MiningProof,
  ): Promise<ApiResponse<CreditResponse>> {
    const response = await fetch(
      `${this.baseUrl}/api/balance/${address}/credit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof }),
      },
    );
    return response.json() as Promise<ApiResponse<CreditResponse>>;
  }

  // ===========================================================================
  // WITHDRAW POOL API
  // ===========================================================================

  /**
   * Get pool status
   */
  async getPoolStatus(
    poolType: PoolType,
  ): Promise<ApiResponse<PoolStatusResponse>> {
    const response = await fetch(`${this.baseUrl}/api/pool/${poolType}/status`);
    return response.json() as Promise<ApiResponse<PoolStatusResponse>>;
  }

  /**
   * Get all pool statuses
   */
  async getAllPoolStatuses(): Promise<
    Record<PoolType, PoolStatusResponse | null>
  > {
    const pools: PoolType[] = ["weekly", "monthly", "low_fee", "immediate"];

    const results = await Promise.all(
      pools.map(async (poolType) => {
        try {
          const response = await this.getPoolStatus(poolType);
          return [
            poolType,
            response.success ? (response.data ?? null) : null,
          ] as const;
        } catch {
          return [poolType, null] as const;
        }
      }),
    );

    return Object.fromEntries(results) as Record<
      PoolType,
      PoolStatusResponse | null
    >;
  }

  /**
   * Create withdrawal request
   */
  async createWithdrawRequest(
    poolType: PoolType,
    fromAddress: string,
    toAddress: string,
    amount: string,
    maxFeeRate?: number,
  ): Promise<ApiResponse<WithdrawResponse>> {
    const response = await fetch(
      `${this.baseUrl}/api/pool/${poolType}/request`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAddress,
          toAddress,
          amount,
          maxFeeRate,
        }),
      },
    );
    return response.json() as Promise<ApiResponse<WithdrawResponse>>;
  }

  /**
   * Cancel withdrawal request
   */
  async cancelWithdrawRequest(
    poolType: PoolType,
    requestId: string,
    fromAddress: string,
  ): Promise<ApiResponse<{ released: string; availableNow: string }>> {
    const response = await fetch(
      `${this.baseUrl}/api/pool/${poolType}/cancel`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, fromAddress }),
      },
    );
    return response.json() as Promise<
      ApiResponse<{ released: string; availableNow: string }>
    >;
  }

  /**
   * Get user's withdrawal requests
   */
  async getUserWithdrawRequests(
    poolType: PoolType,
    address: string,
  ): Promise<ApiResponse<WithdrawRequest[]>> {
    const response = await fetch(
      `${this.baseUrl}/api/pool/${poolType}/requests?address=${address}`,
    );
    return response.json() as Promise<ApiResponse<WithdrawRequest[]>>;
  }

  // ===========================================================================
  // GAME STATE API
  // ===========================================================================

  /**
   * Get current game state (HTTP, non-realtime)
   */
  async getGameState(roomId: string): Promise<ApiResponse<GameState>> {
    const response = await fetch(`${this.baseUrl}/api/game/${roomId}/state`);
    return response.json() as Promise<ApiResponse<GameState>>;
  }

  /**
   * Reset game state
   */
  async resetGameState(
    roomId: string,
  ): Promise<ApiResponse<{ reset: boolean }>> {
    const response = await fetch(`${this.baseUrl}/api/game/${roomId}/reset`, {
      method: "POST",
    });
    return response.json() as Promise<ApiResponse<{ reset: boolean }>>;
  }

  /**
   * Get WebSocket URL for real-time game sync
   */
  getGameWebSocketUrl(roomId: string): string {
    const wsProtocol = this.baseUrl.startsWith("https") ? "wss" : "ws";
    const host = this.baseUrl.replace(/^https?:\/\//, "");
    return `${wsProtocol}://${host}/api/game/${roomId}`;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let clientInstance: BitcoinBabyClient | null = null;

/**
 * Get the API client singleton
 */
export function getApiClient(env?: Environment): BitcoinBabyClient {
  if (!clientInstance) {
    // Auto-detect environment
    const detectedEnv =
      env ??
      (typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "development"
        : "production");
    clientInstance = new BitcoinBabyClient(detectedEnv);
  }
  return clientInstance;
}

/**
 * Reset client instance (useful for testing)
 */
export function resetApiClient(): void {
  clientInstance = null;
}
