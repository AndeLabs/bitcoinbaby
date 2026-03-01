/**
 * BitcoinBaby API Client
 *
 * Client for communicating with Cloudflare Workers backend.
 * Handles balance, withdrawals, and game state sync.
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Request timeout handling
 * - Error normalization
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
  LeaderboardCategory,
  LeaderboardPeriod,
  LeaderboardResponse,
  UserRankResponse,
  UserStats,
  SetHashrateResponse,
} from "./types";

// =============================================================================
// CONFIGURATION
// =============================================================================

const API_ENDPOINTS = {
  development: "http://localhost:8787",
  production: "https://bitcoinbaby-api-prod.andeanlabs-58f.workers.dev",
} as const;

type Environment = keyof typeof API_ENDPOINTS;

/** Default timeout for requests (10 seconds) */
const DEFAULT_TIMEOUT_MS = 10_000;

/** Max retries for transient failures */
const MAX_RETRIES = 3;

/** Base delay for exponential backoff (ms) */
const BASE_RETRY_DELAY_MS = 1000;

// =============================================================================
// RETRY HELPER
// =============================================================================

/**
 * Fetch with retry and timeout
 * Only retries on network errors and 5xx server errors
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = MAX_RETRIES,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // Retry on server errors (5xx)
      if (response.status >= 500 && attempt < maxRetries) {
        const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `[API] Server error ${response.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on abort (timeout)
      if (lastError.name === "AbortError") {
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }

      // Retry on network errors
      if (attempt < maxRetries) {
        const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `[API] Network error, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries}):`,
          lastError.message,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError || new Error("Request failed after retries");
}

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
    const response = await fetchWithRetry(
      `${this.baseUrl}/api/balance/${address}`,
    );
    return response.json() as Promise<ApiResponse<BalanceResponse>>;
  }

  /**
   * Credit mining reward to user's balance
   * Note: No retry on POST to prevent double-crediting
   */
  async creditMining(
    address: string,
    proof: MiningProof,
  ): Promise<ApiResponse<CreditResponse>> {
    const response = await fetchWithRetry(
      `${this.baseUrl}/api/balance/${address}/credit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof }),
      },
      0, // No retries for POST - server handles idempotency via hash uniqueness
    );
    return response.json() as Promise<ApiResponse<CreditResponse>>;
  }

  /**
   * Report hashrate to get appropriate starting difficulty (VarDiff)
   *
   * This helps new miners start at an appropriate difficulty based on their device.
   * The VarDiff algorithm will fine-tune from there based on actual share submission rates.
   */
  async setHashrate(
    address: string,
    hashrate: number,
  ): Promise<ApiResponse<SetHashrateResponse>> {
    const response = await fetchWithRetry(
      `${this.baseUrl}/api/balance/${address}/set-hashrate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hashrate }),
      },
      1, // Single retry for this idempotent operation
    );
    return response.json() as Promise<ApiResponse<SetHashrateResponse>>;
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
    const response = await fetchWithRetry(
      `${this.baseUrl}/api/pool/${poolType}/status`,
    );
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
   * Note: No retry to prevent duplicate withdrawal requests
   */
  async createWithdrawRequest(
    poolType: PoolType,
    fromAddress: string,
    toAddress: string,
    amount: string,
    maxFeeRate?: number,
  ): Promise<ApiResponse<WithdrawResponse>> {
    const response = await fetchWithRetry(
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
      0, // No retries for withdrawal creation
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
    const response = await fetchWithRetry(
      `${this.baseUrl}/api/pool/${poolType}/cancel`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, fromAddress }),
      },
      1, // Single retry - operation is idempotent
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
    const response = await fetchWithRetry(
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
    const response = await fetchWithRetry(
      `${this.baseUrl}/api/game/${roomId}/state`,
    );
    return response.json() as Promise<ApiResponse<GameState>>;
  }

  /**
   * Reset game state
   */
  async resetGameState(
    roomId: string,
  ): Promise<ApiResponse<{ reset: boolean }>> {
    const response = await fetchWithRetry(
      `${this.baseUrl}/api/game/${roomId}/reset`,
      { method: "POST" },
      1, // Single retry - idempotent operation
    );
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

  // ===========================================================================
  // LEADERBOARD API
  // ===========================================================================

  /**
   * Get leaderboard entries
   */
  async getLeaderboard(
    category: LeaderboardCategory = "miners",
    period: LeaderboardPeriod = "alltime",
    limit: number = 100,
    offset: number = 0,
  ): Promise<ApiResponse<LeaderboardResponse>> {
    const params = new URLSearchParams({
      category,
      period,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    const response = await fetchWithRetry(
      `${this.baseUrl}/api/leaderboard?${params}`,
    );
    return response.json() as Promise<ApiResponse<LeaderboardResponse>>;
  }

  /**
   * Get user's rank in leaderboard
   */
  async getUserRank(
    address: string,
    category: LeaderboardCategory = "miners",
    period: LeaderboardPeriod = "alltime",
  ): Promise<ApiResponse<UserRankResponse>> {
    const params = new URLSearchParams({ category, period });
    const response = await fetchWithRetry(
      `${this.baseUrl}/api/leaderboard/rank/${address}?${params}`,
    );
    return response.json() as Promise<ApiResponse<UserRankResponse>>;
  }

  /**
   * Update user's score in leaderboard
   */
  async updateLeaderboard(
    address: string,
    category: LeaderboardCategory,
    score: number,
  ): Promise<ApiResponse<void>> {
    const response = await fetchWithRetry(
      `${this.baseUrl}/api/leaderboard/update`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, category, score }),
      },
      1, // Single retry - updates are idempotent
    );
    return response.json() as Promise<ApiResponse<void>>;
  }

  /**
   * Get user stats
   */
  async getUserStats(address: string): Promise<ApiResponse<UserStats | null>> {
    const response = await fetchWithRetry(
      `${this.baseUrl}/api/leaderboard/stats/${address}`,
    );
    return response.json() as Promise<ApiResponse<UserStats | null>>;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let clientInstance: BitcoinBabyClient | null = null;

/**
 * Get the API client singleton
 *
 * Always uses production Workers API by default.
 * The Workers API handles both testnet and mainnet.
 */
export function getApiClient(env?: Environment): BitcoinBabyClient {
  if (!clientInstance) {
    // Always use production - Workers API is deployed on Cloudflare
    // Development mode only used when explicitly requested
    clientInstance = new BitcoinBabyClient(env ?? "production");
  }
  return clientInstance;
}

/**
 * Reset client instance (useful for testing)
 */
export function resetApiClient(): void {
  clientInstance = null;
}
