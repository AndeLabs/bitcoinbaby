"use client";

/**
 * @deprecated Use `useGlobalMining` from `@bitcoinbaby/core` instead.
 *
 * This hook creates a LOCAL MiningOrchestrator that is NOT persistent
 * across page navigations. For persistent mining, use:
 *
 * ```tsx
 * import { useGlobalMining } from "@bitcoinbaby/core";
 *
 * const mining = useGlobalMining({ difficulty: 16 });
 * ```
 *
 * Or for NFT boost support:
 * ```tsx
 * import { useMiningWithNFTs } from "@/hooks";
 *
 * const mining = useMiningWithNFTs();
 * ```
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MiningOrchestrator,
  type MiningResult,
  type DeviceCapabilities,
} from "@bitcoinbaby/core";

interface MiningState {
  isRunning: boolean;
  isPaused: boolean;
  hashrate: number;
  effectiveHashrate: number; // hashrate with NFT boost applied
  totalHashes: number;
  shares: number;
  difficulty: number;
  minerType: "cpu" | "webgpu" | null;
  capabilities: DeviceCapabilities | null;
  lastShare: MiningResult | null;
  nftBoost: number; // percentage boost from NFTs (0-200)
}

interface UseMiningOptions {
  difficulty?: number;
  minerAddress?: string;
  autoStart?: boolean;
  nftBoost?: number; // NFT mining boost percentage
}

export function useMining(options: UseMiningOptions = {}) {
  const {
    difficulty = 16,
    minerAddress = "",
    autoStart = false,
    nftBoost = 0,
  } = options;

  const orchestratorRef = useRef<MiningOrchestrator | null>(null);
  const [state, setState] = useState<MiningState>({
    isRunning: false,
    isPaused: false,
    hashrate: 0,
    effectiveHashrate: 0,
    totalHashes: 0,
    shares: 0,
    difficulty,
    minerType: null,
    capabilities: null,
    lastShare: null,
    nftBoost: 0,
  });

  // Initialize orchestrator
  useEffect(() => {
    const orchestrator = new MiningOrchestrator({
      initialDifficulty: difficulty,
      minerAddress,
      preferWebGPU: true,
      fallbackToCPU: true,
      throttleOnBattery: true,
      throttleWhenHidden: true,
    });

    // Register event handlers
    orchestrator.on("onHashrateUpdate", (hashrate) => {
      setState((prev) => {
        // Calculate effective hashrate with NFT boost
        const boostMultiplier = 1 + prev.nftBoost / 100;
        const effectiveHashrate = Math.floor(hashrate * boostMultiplier);
        return {
          ...prev,
          hashrate,
          effectiveHashrate,
          totalHashes: orchestrator.getTotalHashes(),
        };
      });
    });

    orchestrator.on("onWorkFound", (result) => {
      setState((prev) => ({
        ...prev,
        shares: prev.shares + 1,
        lastShare: result,
      }));
    });

    orchestrator.on("onStatusChange", (status) => {
      setState((prev) => ({
        ...prev,
        isRunning: status === "running",
        isPaused: status === "paused",
      }));
    });

    orchestratorRef.current = orchestrator;

    // Detect capabilities
    orchestrator.detectCapabilities().then((caps) => {
      setState((prev) => ({
        ...prev,
        capabilities: caps,
      }));
    });

    // Auto start if requested
    if (autoStart) {
      orchestrator.start();
    }

    // Cleanup
    return () => {
      orchestrator.terminate();
      orchestratorRef.current = null;
    };
  }, [difficulty, minerAddress, autoStart]);

  // Sync NFT boost from options (async to comply with React Compiler)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setState((prev) => {
        if (prev.nftBoost === nftBoost) return prev;
        // Recalculate effective hashrate with new boost
        const boostMultiplier = 1 + nftBoost / 100;
        const effectiveHashrate = Math.floor(prev.hashrate * boostMultiplier);
        return {
          ...prev,
          nftBoost,
          effectiveHashrate,
        };
      });
    }, 0);
    return () => clearTimeout(timeout);
  }, [nftBoost]);

  // Start mining
  const start = useCallback(async (blockData?: string) => {
    if (orchestratorRef.current) {
      await orchestratorRef.current.start(blockData);
      setState((prev) => ({
        ...prev,
        minerType: orchestratorRef.current?.getMinerType() ?? null,
      }));
    }
  }, []);

  // Stop mining
  const stop = useCallback(() => {
    orchestratorRef.current?.stop();
  }, []);

  // Pause mining
  const pause = useCallback(() => {
    orchestratorRef.current?.pause();
  }, []);

  // Resume mining
  const resume = useCallback(() => {
    orchestratorRef.current?.resume();
  }, []);

  // Toggle mining
  const toggle = useCallback(async () => {
    if (state.isRunning) {
      await stop();
    } else {
      await start();
    }
  }, [state.isRunning, start, stop]);

  // Set difficulty
  const setDifficulty = useCallback((newDifficulty: number) => {
    orchestratorRef.current?.setDifficulty(newDifficulty);
    setState((prev) => ({ ...prev, difficulty: newDifficulty }));
  }, []);

  // Set NFT boost (0-200%)
  const setNFTBoost = useCallback((boost: number) => {
    const clampedBoost = Math.max(0, Math.min(200, boost));
    setState((prev) => {
      const boostMultiplier = 1 + clampedBoost / 100;
      const effectiveHashrate = Math.floor(prev.hashrate * boostMultiplier);
      return {
        ...prev,
        nftBoost: clampedBoost,
        effectiveHashrate,
      };
    });
  }, []);

  return {
    ...state,
    start,
    stop,
    pause,
    resume,
    toggle,
    setDifficulty,
    setNFTBoost,
  };
}

export type { MiningState, UseMiningOptions };
