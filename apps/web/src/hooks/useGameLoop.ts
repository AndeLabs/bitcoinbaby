/**
 * useGameLoop - Game Engine Hook
 *
 * Manages the game engine lifecycle and provides
 * access to game state and actions.
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getGameEngine,
  type GameState,
  type GameBaby,
  type GameEvent,
  type GameAction,
  STAGE_NAMES,
  MINING_BONUS,
  calculateLevelDecay,
  getDaysUntilDecay,
  reviveBaby,
  isBabyDead,
} from '@bitcoinbaby/core';

interface UseGameLoopOptions {
  autoStart?: boolean;
  onEvent?: (event: GameEvent) => void;
}

interface UseGameLoopReturn {
  // State
  baby: GameBaby | null;
  state: GameState | null;
  isLoading: boolean;
  isDead: boolean;

  // Derived values
  stageName: string;
  miningBonus: number;
  daysUntilDecay: number | null;

  // Actions
  createBaby: (name: string) => void;
  performAction: (action: GameAction) => void;
  setMining: (isMining: boolean) => void;
  recordMiningProgress: (hashes: number, shares: number) => void;
  revive: () => void;
  save: () => Promise<void>;
  reset: () => Promise<void>;

  // Engine control
  start: () => void;
  stop: () => void;
}

export function useGameLoop(options: UseGameLoopOptions = {}): UseGameLoopReturn {
  const { autoStart = true, onEvent } = options;

  const [state, setState] = useState<GameState | null>(null);
  const [baby, setBaby] = useState<GameBaby | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDead, setIsDead] = useState(false);

  const engineRef = useRef(getGameEngine());
  const engine = engineRef.current;

  // Initialize engine
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await engine.initialize();

      if (!mounted) return;

      setState(engine.getState());
      setBaby(engine.getBaby());

      // Check for dead baby
      const currentBaby = engine.getBaby();
      if (currentBaby) {
        const { isDead: dead } = calculateLevelDecay(
          currentBaby.progression,
          currentBaby.lastMined
        );
        setIsDead(dead || isBabyDead(currentBaby));
      }

      setIsLoading(false);

      if (autoStart) {
        engine.start();
      }
    };

    init();

    return () => {
      mounted = false;
      engine.stop();
    };
  }, [engine, autoStart]);

  // Subscribe to events
  useEffect(() => {
    const unsubscribe = engine.on((event) => {
      // Update local state
      setState(engine.getState());
      setBaby(engine.getBaby());

      // Check for death on tick
      if (event.type === 'tick') {
        const currentBaby = engine.getBaby();
        if (currentBaby) {
          setIsDead(isBabyDead(currentBaby));
        }
      }

      // Forward to consumer
      onEvent?.(event);
    });

    return unsubscribe;
  }, [engine, onEvent]);

  // Derived values
  const stageName = baby ? STAGE_NAMES[baby.progression.stage] : '';
  const miningBonus = baby ? MINING_BONUS[baby.progression.stage] : 1;
  const daysUntilDecay = baby ? getDaysUntilDecay(baby.lastMined) : null;

  // Actions
  const createBaby = useCallback(
    (name: string) => {
      engine.createBaby(name);
      setBaby(engine.getBaby());
      setState(engine.getState());
      setIsDead(false);
    },
    [engine]
  );

  const performAction = useCallback(
    (action: GameAction) => {
      if (isDead) return;
      engine.performAction(action);
      setBaby(engine.getBaby());
    },
    [engine, isDead]
  );

  const setMining = useCallback(
    (isMining: boolean) => {
      if (isDead) return;
      engine.setMining(isMining);
      setBaby(engine.getBaby());
    },
    [engine, isDead]
  );

  const recordMiningProgress = useCallback(
    (hashes: number, shares: number) => {
      if (isDead) return;
      engine.recordMiningProgress(hashes, shares);

      // Update lastMined timestamp
      const currentBaby = engine.getBaby();
      if (currentBaby) {
        // This would need to be added to engine, for now we track via state
      }

      setBaby(engine.getBaby());
      setState(engine.getState());
    },
    [engine, isDead]
  );

  const revive = useCallback(() => {
    const currentBaby = engine.getBaby();
    if (currentBaby && isBabyDead(currentBaby)) {
      // The engine needs a revive method - we'll call it directly
      const revivedBaby = reviveBaby(currentBaby);
      // For now, create a new baby with same name
      engine.createBaby(currentBaby.name);
      setBaby(engine.getBaby());
      setState(engine.getState());
      setIsDead(false);
    }
  }, [engine]);

  const save = useCallback(async () => {
    await engine.save();
  }, [engine]);

  const reset = useCallback(async () => {
    await engine.reset();
    setBaby(null);
    setState(engine.getState());
    setIsDead(false);
  }, [engine]);

  const start = useCallback(() => {
    engine.start();
  }, [engine]);

  const stop = useCallback(() => {
    engine.stop();
  }, [engine]);

  return {
    baby,
    state,
    isLoading,
    isDead,
    stageName,
    miningBonus,
    daysUntilDecay,
    createBaby,
    performAction,
    setMining,
    recordMiningProgress,
    revive,
    save,
    reset,
    start,
    stop,
  };
}

export default useGameLoop;
