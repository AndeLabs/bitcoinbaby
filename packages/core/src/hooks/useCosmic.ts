/**
 * Cosmic Hooks
 *
 * React hooks for cosmic state and baby energy calculations.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getCosmicProvider,
  calculateCosmicEnergy,
  type CosmicState,
  type BabyCosmicEnergy,
  type Rarity,
} from "../cosmic";
import type { BaseType, Bloodline, Heritage } from "../types";

// =============================================================================
// TYPES
// =============================================================================

interface BabyForCosmic {
  baseType: BaseType;
  bloodline: Bloodline;
  heritage: Heritage;
  level: number;
  rarity: Rarity;
  energy: number;
  equippedItemsBonus?: number;
}

interface UseCosmicStateOptions {
  /** Latitude for sun calculations (default: 0) */
  latitude?: number;
  /** Longitude for sun calculations (default: 0) */
  longitude?: number;
  /** Update interval in ms (default: 60000 = 1 minute) */
  updateInterval?: number;
  /** Hemisphere for season calculations */
  hemisphere?: "north" | "south";
}

interface UseCosmicEnergyOptions extends UseCosmicStateOptions {
  /** Server average level for catch-up bonus */
  serverAverageLevel?: number;
  /** Context for bloodline bonus calculation */
  context?: "xp" | "mining" | "drops";
}

// =============================================================================
// USE COSMIC STATE HOOK
// =============================================================================

/**
 * Hook to get current cosmic state (moon, sun, seasons, events)
 * Updates automatically based on real astronomical data
 */
export function useCosmicState(options: UseCosmicStateOptions = {}) {
  const {
    latitude = 0,
    longitude = 0,
    updateInterval = 60000,
    hemisphere = "north",
  } = options;

  const [cosmicState, setCosmicState] = useState<CosmicState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Update cosmic state
  const updateCosmicState = useCallback(() => {
    try {
      const provider = getCosmicProvider();
      const now = new Date();

      const state: CosmicState = {
        timestamp: now,
        moon: provider.getMoonData(now),
        sun: provider.getSunData(now, latitude, longitude),
        season: provider.getSeasonData(now, hemisphere),
        currentEvent: provider.getCurrentEvents(now)[0] || null,
        upcomingEvents: provider.getUpcomingEvents(now, 30),
        bitcoin: null, // TODO: Integrate with Bitcoin data
      };

      setCosmicState(state);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, hemisphere]);

  // Initial load and interval updates
  useEffect(() => {
    updateCosmicState();

    const interval = setInterval(updateCosmicState, updateInterval);
    return () => clearInterval(interval);
  }, [updateCosmicState, updateInterval]);

  // Manual refresh function
  const refresh = useCallback(() => {
    setIsLoading(true);
    updateCosmicState();
  }, [updateCosmicState]);

  return {
    cosmicState,
    isLoading,
    error,
    refresh,
  };
}

// =============================================================================
// USE COSMIC ENERGY HOOK
// =============================================================================

/**
 * Hook to calculate cosmic energy for a specific baby
 * Includes all balance calculations (caps, diminishing returns, catch-up)
 */
export function useCosmicEnergy(
  baby: BabyForCosmic | null,
  options: UseCosmicEnergyOptions = {},
) {
  const {
    serverAverageLevel = 25,
    context = "mining",
    ...cosmicOptions
  } = options;

  const {
    cosmicState,
    isLoading: cosmicLoading,
    error: cosmicError,
  } = useCosmicState(cosmicOptions);

  // Calculate energy when baby or cosmic state changes
  const energy = useMemo<BabyCosmicEnergy | null>(() => {
    if (!baby || !cosmicState) return null;

    return calculateCosmicEnergy({
      baby: {
        ...baby,
        equippedItemsBonus: baby.equippedItemsBonus || 0,
      },
      cosmicState,
      serverAverageLevel,
      context,
    });
  }, [baby, cosmicState, serverAverageLevel, context]);

  return {
    energy,
    cosmicState,
    isLoading: cosmicLoading,
    error: cosmicError,
  };
}

// =============================================================================
// USE MOON PHASE HOOK (Simplified)
// =============================================================================

/**
 * Simple hook to get current moon phase
 */
export function useMoonPhase() {
  const { cosmicState, isLoading } = useCosmicState({ updateInterval: 300000 }); // Update every 5 min

  return {
    phase: cosmicState?.moon.phase || null,
    illumination: cosmicState?.moon.illumination || 0,
    emoji: cosmicState?.moon.emoji || "🌑",
    nextFullMoon: cosmicState?.moon.nextFullMoon || null,
    nextNewMoon: cosmicState?.moon.nextNewMoon || null,
    isLoading,
  };
}

// =============================================================================
// USE COSMIC EVENT HOOK
// =============================================================================

/**
 * Hook to get current and upcoming cosmic events
 */
export function useCosmicEvents() {
  const { cosmicState, isLoading, refresh } = useCosmicState({
    updateInterval: 300000,
  });

  const currentEvent = cosmicState?.currentEvent || null;
  const upcomingEvents = cosmicState?.upcomingEvents || [];

  // Check if there's an active event
  const hasActiveEvent = currentEvent !== null;

  // Get time until next event
  const timeUntilNextEvent = useMemo(() => {
    if (upcomingEvents.length === 0) return null;
    const nextEvent = upcomingEvents[0];
    return nextEvent.startTime.getTime() - Date.now();
  }, [upcomingEvents]);

  return {
    currentEvent,
    upcomingEvents,
    hasActiveEvent,
    timeUntilNextEvent,
    isLoading,
    refresh,
  };
}

// =============================================================================
// USE BABY STATUS HOOK
// =============================================================================

/**
 * Hook that combines cosmic energy with status messages
 * Useful for UI display
 */
export function useBabyCosmicStatus(
  baby: BabyForCosmic | null,
  options: UseCosmicEnergyOptions = {},
) {
  const { energy, cosmicState, isLoading, error } = useCosmicEnergy(
    baby,
    options,
  );

  // Generate status message
  const statusMessage = useMemo(() => {
    if (!energy) return null;

    switch (energy.status) {
      case "thriving":
        return {
          text: "Tu Baby esta en su momento de poder!",
          color: "green",
          icon: "✨",
        };
      case "normal":
        return {
          text: "Tu Baby esta bien",
          color: "blue",
          icon: "😊",
        };
      case "struggling":
        return {
          text: "Tu Baby esta un poco debil",
          color: "yellow",
          icon: "😔",
        };
      case "critical":
        return {
          text: "Tu Baby necesita atencion urgente!",
          color: "red",
          icon: "🚨",
        };
    }
  }, [energy]);

  // Format multiplier for display
  const formattedMultiplier = useMemo(() => {
    if (!energy) return null;

    const percent = (energy.finalMultiplier - 1) * 100;
    const sign = percent >= 0 ? "+" : "";
    return `${sign}${percent.toFixed(0)}%`;
  }, [energy]);

  return {
    energy,
    cosmicState,
    statusMessage,
    formattedMultiplier,
    isLoading,
    error,
  };
}
