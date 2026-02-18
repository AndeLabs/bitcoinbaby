"use client";

/**
 * usePersistentMining - Unified Persistent Mining Hook
 *
 * Automatically selects the best mining strategy:
 * 1. SharedWorker (if supported) - For multi-tab CPU mining
 * 2. useGlobalMining (fallback) - For WebGPU or iOS Safari
 *
 * This hook provides a unified interface regardless of the
 * underlying mining strategy.
 */

import { useMemo, useCallback } from "react";
import {
  useGlobalMining,
  type UseGlobalMiningOptions,
} from "@bitcoinbaby/core";
import { useSharedMining, supportsSharedWorker } from "./useSharedMining";

// =============================================================================
// TYPES
// =============================================================================

type MiningStrategy = "shared-worker" | "singleton" | "hybrid";

interface UsePersistentMiningOptions extends Omit<
  UseGlobalMiningOptions,
  "nftBoost"
> {
  /**
   * Mining strategy to use:
   * - "shared-worker": Use SharedWorker (CPU only, multi-tab)
   * - "singleton": Use global singleton (supports WebGPU)
   * - "hybrid": Auto-select based on capabilities
   * @default "hybrid"
   */
  strategy?: MiningStrategy;

  /**
   * NFT boost percentage (0-100)
   */
  nftBoost?: number;

  /**
   * Difficulty level
   */
  difficulty?: number;

  /**
   * Throttle percentage (1-100)
   */
  throttle?: number;
}

interface UsePersistentMiningReturn {
  // State
  isRunning: boolean;
  isPaused: boolean;
  hashrate: number;
  totalHashes: number;
  shares: number;
  difficulty: number;
  throttle: number;

  // Strategy info
  strategy: MiningStrategy;
  supportsSharedWorker: boolean;
  supportsWebGPU: boolean;
  minerType: "cpu" | "webgpu" | null;

  // Actions
  start: (config?: { difficulty?: number }) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  setThrottle: (value: number) => void;
  setDifficulty: (value: number) => void;
}

// =============================================================================
// HOOK
// =============================================================================

export function usePersistentMining(
  options: UsePersistentMiningOptions = {},
): UsePersistentMiningReturn {
  const {
    strategy: requestedStrategy = "hybrid",
    nftBoost = 0,
    difficulty = 16,
    throttle = 100,
    ...globalOptions
  } = options;

  // Detect capabilities
  const capabilities = useMemo(() => {
    const hasSharedWorker = supportsSharedWorker();
    const hasWebGPU = typeof navigator !== "undefined" && "gpu" in navigator;

    return {
      hasSharedWorker,
      hasWebGPU,
    };
  }, []);

  // Determine actual strategy
  const actualStrategy = useMemo((): MiningStrategy => {
    if (requestedStrategy !== "hybrid") {
      return requestedStrategy;
    }

    // Hybrid: prefer SharedWorker for CPU mining persistence across tabs
    // But use singleton for WebGPU support
    if (capabilities.hasWebGPU) {
      return "singleton"; // WebGPU requires main thread via singleton
    }

    if (capabilities.hasSharedWorker) {
      return "shared-worker";
    }

    return "singleton";
  }, [requestedStrategy, capabilities]);

  // Use SharedWorker mining
  const sharedMining = useSharedMining({
    difficulty,
    throttle,
  });

  // Use Global singleton mining (fallback)
  const globalMining = useGlobalMining({
    ...globalOptions,
    nftBoost,
  });

  // Select the active mining interface based on strategy
  const activeMining =
    actualStrategy === "shared-worker" ? sharedMining : globalMining;

  // Unified start function
  const start = useCallback(
    (config?: { difficulty?: number }) => {
      if (actualStrategy === "shared-worker") {
        sharedMining.start(config);
      } else {
        globalMining.start();
      }
    },
    [actualStrategy, sharedMining, globalMining],
  );

  // Unified stop function
  const stop = useCallback(() => {
    // Stop both to ensure clean state
    if (actualStrategy === "shared-worker") {
      sharedMining.stop();
    } else {
      globalMining.stop();
    }
  }, [actualStrategy, sharedMining, globalMining]);

  // Unified pause function
  const pause = useCallback(() => {
    if (actualStrategy === "shared-worker") {
      sharedMining.pause();
    } else {
      globalMining.pause();
    }
  }, [actualStrategy, sharedMining, globalMining]);

  // Unified resume function
  const resume = useCallback(() => {
    if (actualStrategy === "shared-worker") {
      sharedMining.resume();
    } else {
      globalMining.resume();
    }
  }, [actualStrategy, sharedMining, globalMining]);

  // Toggle function
  const toggle = useCallback(() => {
    if (activeMining.isRunning) {
      stop();
    } else {
      start();
    }
  }, [activeMining.isRunning, start, stop]);

  // Set throttle (only available with SharedWorker)
  const setThrottle = useCallback(
    (value: number) => {
      if (actualStrategy === "shared-worker") {
        sharedMining.setThrottle(value);
      }
      // Note: globalMining doesn't support throttle control
    },
    [actualStrategy, sharedMining],
  );

  // Set difficulty
  const setDifficulty = useCallback(
    (value: number) => {
      if (actualStrategy === "shared-worker") {
        sharedMining.setDifficulty(value);
      } else {
        globalMining.setDifficulty(value);
      }
    },
    [actualStrategy, sharedMining, globalMining],
  );

  // Determine miner type
  const minerType = useMemo(() => {
    if (!activeMining.isRunning) return null;
    if (actualStrategy === "shared-worker") return "cpu";
    return globalMining.minerType || "cpu";
  }, [actualStrategy, activeMining.isRunning, globalMining.minerType]);

  return {
    // State from active mining
    isRunning: activeMining.isRunning,
    isPaused: activeMining.isPaused,
    hashrate: activeMining.hashrate,
    totalHashes: activeMining.totalHashes,
    shares: activeMining.shares,
    difficulty:
      actualStrategy === "shared-worker"
        ? sharedMining.difficulty
        : globalMining.difficulty,
    throttle: actualStrategy === "shared-worker" ? sharedMining.throttle : 100,

    // Strategy info
    strategy: actualStrategy,
    supportsSharedWorker: capabilities.hasSharedWorker,
    supportsWebGPU: capabilities.hasWebGPU,
    minerType,

    // Actions
    start,
    stop,
    pause,
    resume,
    toggle,
    setThrottle,
    setDifficulty,
  };
}

export type {
  UsePersistentMiningOptions,
  UsePersistentMiningReturn,
  MiningStrategy,
};
