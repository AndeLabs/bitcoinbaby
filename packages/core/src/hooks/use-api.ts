/**
 * useApi Hook
 *
 * React hook for interacting with the BitcoinBaby API.
 * Provides balance, withdrawal, and game state management.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import {
  getApiClient,
  type PoolType,
  type BalanceResponse,
  type PoolStatusResponse,
  type GameState,
  type MiningProof,
  type WithdrawRequest,
} from "../api";

// =============================================================================
// BALANCE HOOK
// =============================================================================

interface UseBalanceReturn {
  balance: BalanceResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  creditMining: (proof: MiningProof) => Promise<boolean>;
}

export function useBalance(address: string | null): UseBalanceReturn {
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = getApiClient();

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await client.getBalance(address);
      if (response.success && response.data) {
        setBalance(response.data);
      } else {
        setError(response.error ?? "Failed to fetch balance");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [address, client]);

  const creditMining = useCallback(
    async (proof: MiningProof): Promise<boolean> => {
      if (!address) return false;

      try {
        const response = await client.creditMining(address, proof);
        if (response.success && response.data) {
          // Update local balance
          setBalance((prev) =>
            prev
              ? {
                  ...prev,
                  virtualBalance: response.data!.newBalance,
                  totalMined: (
                    BigInt(prev.totalMined) + BigInt(response.data!.credited)
                  ).toString(),
                }
              : null,
          );
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [address, client],
  );

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
    creditMining,
  };
}

// =============================================================================
// POOL STATUS HOOK
// =============================================================================

interface UsePoolStatusReturn {
  pools: Record<PoolType, PoolStatusResponse | null>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePoolStatus(): UsePoolStatusReturn {
  const [pools, setPools] = useState<
    Record<PoolType, PoolStatusResponse | null>
  >({
    weekly: null,
    monthly: null,
    low_fee: null,
    immediate: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = getApiClient();

  const fetchPools = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.getAllPoolStatuses();
      setPools(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  return {
    pools,
    loading,
    error,
    refetch: fetchPools,
  };
}

// =============================================================================
// WITHDRAW HOOK
// =============================================================================

interface UseWithdrawReturn {
  requests: WithdrawRequest[];
  loading: boolean;
  error: string | null;
  createRequest: (
    poolType: PoolType,
    toAddress: string,
    amount: string,
    maxFeeRate?: number,
  ) => Promise<string | null>;
  cancelRequest: (poolType: PoolType, requestId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useWithdraw(address: string | null): UseWithdrawReturn {
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = getApiClient();

  const fetchRequests = useCallback(async () => {
    if (!address) {
      setRequests([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch from all pool types
      const pools: PoolType[] = ["weekly", "monthly", "low_fee", "immediate"];
      const allRequests: WithdrawRequest[] = [];

      for (const poolType of pools) {
        const response = await client.getUserWithdrawRequests(
          poolType,
          address,
        );
        if (response.success && response.data) {
          allRequests.push(...response.data);
        }
      }

      // Sort by requestedAt descending
      allRequests.sort((a, b) => b.requestedAt - a.requestedAt);
      setRequests(allRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [address, client]);

  const createRequest = useCallback(
    async (
      poolType: PoolType,
      toAddress: string,
      amount: string,
      maxFeeRate?: number,
    ): Promise<string | null> => {
      if (!address) return null;

      try {
        const response = await client.createWithdrawRequest(
          poolType,
          address,
          toAddress,
          amount,
          maxFeeRate,
        );
        if (response.success && response.data) {
          await fetchRequests();
          return response.data.requestId;
        }
        setError(response.error ?? "Failed to create request");
        return null;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      }
    },
    [address, client, fetchRequests],
  );

  const cancelRequest = useCallback(
    async (poolType: PoolType, requestId: string): Promise<boolean> => {
      if (!address) return false;

      try {
        const response = await client.cancelWithdrawRequest(
          poolType,
          requestId,
          address,
        );
        if (response.success) {
          await fetchRequests();
          return true;
        }
        setError(response.error ?? "Failed to cancel request");
        return false;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      }
    },
    [address, client, fetchRequests],
  );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    loading,
    error,
    createRequest,
    cancelRequest,
    refetch: fetchRequests,
  };
}

// =============================================================================
// GAME STATE HOOK (WebSocket)
// =============================================================================

interface UseGameStateReturn {
  gameState: GameState | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
  updateState: (updates: Partial<GameState>) => void;
  resetState: () => Promise<boolean>;
}

export function useGameState(roomId: string | null): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const client = getApiClient();

  // Connect to WebSocket
  useEffect(() => {
    if (!roomId) {
      setGameState(null);
      setConnected(false);
      return;
    }

    setLoading(true);

    // First, fetch initial state via HTTP
    client
      .getGameState(roomId)
      .then((response) => {
        if (response.success && response.data) {
          setGameState(response.data);
        }
      })
      .catch(() => {
        // Ignore - will get state from WebSocket
      });

    // Connect WebSocket
    const wsUrl = client.getGameWebSocketUrl(roomId);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
      setLoading(false);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string);

        if (message.type === "yjs-sync" || message.type === "yjs-update") {
          // For now, just refetch state on updates
          // Full Yjs integration would require yjs package on client
          client.getGameState(roomId).then((response) => {
            if (response.success && response.data) {
              setGameState(response.data);
            }
          });
        }
      } catch {
        // Ignore parse errors
      }
    };

    ws.onerror = () => {
      setError("WebSocket connection error");
      setConnected(false);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    wsRef.current = ws;

    // Cleanup
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId, client]);

  // Keep connection alive with ping
  useEffect(() => {
    if (!wsRef.current || !connected) return;

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [connected]);

  const updateState = useCallback((updates: Partial<GameState>) => {
    // Optimistic update
    setGameState((prev) => (prev ? { ...prev, ...updates } : null));

    // Send via WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Note: Full implementation would use Yjs updates
      // For now, this is a simplified version
      wsRef.current.send(
        JSON.stringify({
          type: "yjs-update",
          data: Array.from(new TextEncoder().encode(JSON.stringify(updates))),
        }),
      );
    }
  }, []);

  const resetState = useCallback(async (): Promise<boolean> => {
    if (!roomId) return false;

    try {
      const response = await client.resetGameState(roomId);
      if (response.success) {
        // Refetch state
        const stateResponse = await client.getGameState(roomId);
        if (stateResponse.success && stateResponse.data) {
          setGameState(stateResponse.data);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [roomId, client]);

  return {
    gameState,
    connected,
    loading,
    error,
    updateState,
    resetState,
  };
}
