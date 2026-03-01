"use client";

/**
 * EngagementBonusPanel
 *
 * Displays the user's engagement bonuses:
 * - Baby Care: +50%
 * - Daily Streak: +30%
 * - Play Time: +20%
 *
 * Shows total multiplier and encourages engagement.
 */

import { PixelCard } from "../card";
import { clsx } from "clsx";

// =============================================================================
// TYPES
// =============================================================================

export interface EngagementBonusPanelProps {
  /** Current engagement multiplier (1.0 - 2.0) */
  multiplier: number;
  /** Breakdown of individual bonuses */
  breakdown: {
    babyCare: number;
    dailyStreak: number;
    playTime: number;
  };
  /** Engagement tier status */
  status: "inactive" | "casual" | "engaged" | "dedicated";
  /** Daily streak count */
  streakDays: number;
  /** Play time in minutes today */
  playTimeMinutes: number;
  /** Baby health average (0-100) */
  babyHealth: number;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// TIER STYLES
// =============================================================================

const TIER_STYLES = {
  inactive: {
    label: "Inactivo",
    color: "text-pixel-text-muted",
    bgColor: "bg-pixel-bg-dark/50",
    borderColor: "border-pixel-border",
  },
  casual: {
    label: "Casual",
    color: "text-pixel-secondary",
    bgColor: "bg-pixel-secondary/10",
    borderColor: "border-pixel-secondary/50",
  },
  engaged: {
    label: "Activo",
    color: "text-pixel-success",
    bgColor: "bg-pixel-success/10",
    borderColor: "border-pixel-success/50",
  },
  dedicated: {
    label: "Dedicado",
    color: "text-pixel-primary",
    bgColor: "bg-pixel-primary/10",
    borderColor: "border-pixel-primary/50",
  },
} as const;

// =============================================================================
// COMPONENT
// =============================================================================

export function EngagementBonusPanel({
  multiplier,
  breakdown,
  status,
  streakDays,
  playTimeMinutes,
  babyHealth,
  className,
}: EngagementBonusPanelProps) {
  const tierStyle = TIER_STYLES[status];
  const bonusPercent = Math.round((multiplier - 1) * 100);

  return (
    <PixelCard className={clsx("p-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">🎮</span>
          <span className="font-pixel text-[8px] text-pixel-text uppercase">
            Engagement Bonus
          </span>
        </div>
        <div
          className={clsx(
            "px-2 py-0.5 rounded font-pixel text-[6px] uppercase",
            tierStyle.bgColor,
            tierStyle.color,
          )}
        >
          {tierStyle.label}
        </div>
      </div>

      {/* Main Multiplier */}
      <div className="text-center mb-3">
        <div className="font-pixel text-2xl text-pixel-primary">
          {multiplier.toFixed(2)}x
        </div>
        <div className="font-pixel text-[8px] text-pixel-text-muted">
          +{bonusPercent}% en recompensas
        </div>
      </div>

      {/* Bonus Breakdown */}
      <div className="space-y-2">
        {/* Baby Care */}
        <BonusRow
          icon="💚"
          label="Baby Care"
          value={breakdown.babyCare}
          maxValue={0.5}
          detail={`${Math.round(babyHealth)}% salud`}
          tip={babyHealth < 70 ? "Cuida tu baby para +50%" : undefined}
        />

        {/* Daily Streak */}
        <BonusRow
          icon="🔥"
          label="Racha Diaria"
          value={breakdown.dailyStreak}
          maxValue={0.3}
          detail={`${streakDays} días`}
          tip={
            streakDays < 7 ? `${7 - streakDays} días más para max` : undefined
          }
        />

        {/* Play Time */}
        <BonusRow
          icon="⏱️"
          label="Tiempo Jugado"
          value={breakdown.playTime}
          maxValue={0.2}
          detail={`${playTimeMinutes} min hoy`}
          tip={
            playTimeMinutes < 30
              ? `${30 - playTimeMinutes} min más para max`
              : undefined
          }
        />
      </div>

      {/* Tips */}
      {status === "inactive" && (
        <div className="mt-3 p-2 bg-pixel-warning/10 border border-pixel-warning/30 rounded">
          <p className="font-pixel text-[6px] text-pixel-warning text-center">
            Cuida tu baby y juega diario para ganar hasta 2x más!
          </p>
        </div>
      )}

      {status === "dedicated" && (
        <div className="mt-3 p-2 bg-pixel-primary/10 border border-pixel-primary/30 rounded">
          <p className="font-pixel text-[6px] text-pixel-primary text-center">
            Bonus máximo activo! Sigue así!
          </p>
        </div>
      )}
    </PixelCard>
  );
}

// =============================================================================
// BONUS ROW COMPONENT
// =============================================================================

interface BonusRowProps {
  icon: string;
  label: string;
  value: number;
  maxValue: number;
  detail: string;
  tip?: string;
}

function BonusRow({
  icon,
  label,
  value,
  maxValue,
  detail,
  tip,
}: BonusRowProps) {
  const percent = Math.round((value / maxValue) * 100);
  const bonusPercent = Math.round(value * 100);
  const isMaxed = value >= maxValue;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xs">{icon}</span>
          <span className="font-pixel text-[6px] text-pixel-text-muted uppercase">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[7px] text-pixel-text-muted">
            {detail}
          </span>
          <span
            className={clsx(
              "font-pixel text-[8px]",
              isMaxed ? "text-pixel-success" : "text-pixel-text",
            )}
          >
            +{bonusPercent}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-pixel-bg-dark rounded-sm overflow-hidden">
        <div
          className={clsx(
            "h-full transition-all duration-300",
            isMaxed ? "bg-pixel-success" : "bg-pixel-secondary",
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      {/* Tip */}
      {tip && (
        <p className="font-pixel text-[5px] text-pixel-text-muted italic">
          {tip}
        </p>
      )}
    </div>
  );
}

export default EngagementBonusPanel;
