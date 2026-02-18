/**
 * useAchievements - Achievement Tracking Hook
 *
 * Manages achievement notifications and progress tracking.
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ACHIEVEMENTS,
  getAchievement,
  getAchievementProgress,
  type Achievement,
  type GameState,
} from "../game";

export interface AchievementNotification {
  achievement: Achievement;
  timestamp: number;
}

export interface UseAchievementsOptions {
  gameState: GameState | null;
  onUnlock?: (achievement: Achievement) => void;
}

export interface UseAchievementsReturn {
  // State
  unlockedAchievements: Achievement[];
  lockedAchievements: Achievement[];
  totalAchievements: number;
  completionPercentage: number;

  // Current notification
  notification: AchievementNotification | null;
  dismissNotification: () => void;

  // Progress for specific achievements
  getProgress: (achievementId: string) => {
    current: number;
    required: number;
    percentage: number;
  };

  // Manual trigger (for external events)
  showAchievement: (achievement: Achievement) => void;
}

export function useAchievements(
  options: UseAchievementsOptions,
): UseAchievementsReturn {
  const { gameState, onUnlock } = options;

  const [notification, setNotification] =
    useState<AchievementNotification | null>(null);
  const [shownAchievements, setShownAchievements] = useState<Set<string>>(
    new Set(),
  );

  // Get unlocked achievement IDs from game state
  const unlockedIds = gameState?.baby?.unlockedAchievements ?? [];

  // Split achievements into unlocked and locked
  const unlockedAchievements = ACHIEVEMENTS.filter((a) =>
    unlockedIds.includes(a.id),
  );
  const lockedAchievements = ACHIEVEMENTS.filter(
    (a) => !unlockedIds.includes(a.id),
  );
  const totalAchievements = ACHIEVEMENTS.length;
  const completionPercentage =
    (unlockedAchievements.length / totalAchievements) * 100;

  // Watch for new achievements
  useEffect(() => {
    if (!gameState?.baby) return;

    for (const achievementId of unlockedIds) {
      if (!shownAchievements.has(achievementId)) {
        const achievement = getAchievement(achievementId);
        if (achievement) {
          // Show notification
          setNotification({
            achievement,
            timestamp: Date.now(),
          });

          // Mark as shown
          setShownAchievements((prev) => new Set([...prev, achievementId]));

          // Call callback
          onUnlock?.(achievement);

          // Only show one at a time
          break;
        }
      }
    }
  }, [unlockedIds, shownAchievements, onUnlock, gameState?.baby]);

  // Dismiss notification
  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Get progress for a specific achievement
  const getProgress = useCallback(
    (
      achievementId: string,
    ): { current: number; required: number; percentage: number } => {
      if (!gameState) {
        return { current: 0, required: 1, percentage: 0 };
      }
      const achievement = getAchievement(achievementId);
      if (!achievement) {
        return { current: 0, required: 1, percentage: 0 };
      }
      const percentage = getAchievementProgress(achievement, gameState);
      // Calculate current/required from percentage
      const required = 100;
      const current = Math.round(percentage);
      return { current, required, percentage };
    },
    [gameState],
  );

  // Manually show an achievement
  const showAchievement = useCallback((achievement: Achievement) => {
    setNotification({
      achievement,
      timestamp: Date.now(),
    });
  }, []);

  return {
    unlockedAchievements,
    lockedAchievements,
    totalAchievements,
    completionPercentage,
    notification,
    dismissNotification,
    getProgress,
    showAchievement,
  };
}

export default useAchievements;
