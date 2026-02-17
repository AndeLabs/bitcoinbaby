/**
 * GameHUD - Tamagotchi Stats Display
 *
 * Shows baby stats (Energy, Happiness, Hunger, Health)
 * and progression info (Level, XP, Stage).
 */

import { type FC } from 'react';
import { clsx } from 'clsx';
import { Progress } from '../progress';

export interface GameHUDStats {
  energy: number;
  happiness: number;
  hunger: number;
  health: number;
}

export interface GameHUDProgression {
  level: number;
  xp: number;
  xpToNextLevel: number;
  stageName: string;
}

interface GameHUDProps {
  stats: GameHUDStats;
  progression: GameHUDProgression;
  isMining?: boolean;
  miningBonus?: number;
  daysUntilDecay?: number;
  className?: string;
}

/**
 * Get stat variant based on value
 */
function getStatVariant(
  value: number,
  isInverted: boolean = false
): 'success' | 'warning' | 'error' | 'default' {
  const effectiveValue = isInverted ? 100 - value : value;

  if (effectiveValue <= 20) return 'error';
  if (effectiveValue <= 40) return 'warning';
  if (effectiveValue >= 80) return 'success';
  return 'default';
}

/**
 * Stat bar component
 */
const StatBar: FC<{
  label: string;
  icon: string;
  value: number;
  isInverted?: boolean;
}> = ({ label, icon, value, isInverted = false }) => {
  const variant = getStatVariant(value, isInverted);
  // For inverted stats (like hunger), show 100-value
  const displayValue = isInverted ? 100 - value : value;

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg" title={label}>
        {icon}
      </span>
      <div className="flex-1">
        <Progress
          value={displayValue}
          variant={variant}
          className="h-4"
        />
      </div>
      <span className="font-pixel-mono text-xs w-8 text-right">
        {Math.round(value)}
      </span>
    </div>
  );
};

export const GameHUD: FC<GameHUDProps> = ({
  stats,
  progression,
  isMining = false,
  miningBonus = 1,
  daysUntilDecay,
  className,
}) => {
  const xpPercentage = (progression.xp / progression.xpToNextLevel) * 100;

  return (
    <div
      className={clsx(
        'bg-pixel-bg-dark border-4 border-pixel-border p-4',
        'space-y-4',
        className
      )}
    >
      {/* Level & Stage */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-pixel text-pixel-primary text-lg">
            Lv.{progression.level}
          </div>
          <div className="font-pixel text-xs text-pixel-text-muted">
            {progression.stageName}
          </div>
        </div>

        {/* Mining bonus indicator */}
        {miningBonus > 1 && (
          <div className="text-right">
            <div className="font-pixel text-pixel-success text-sm">
              +{Math.round((miningBonus - 1) * 100)}%
            </div>
            <div className="font-pixel text-[10px] text-pixel-text-muted">
              BONUS
            </div>
          </div>
        )}
      </div>

      {/* XP Bar */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="font-pixel text-xs text-pixel-text-muted">EXP</span>
          <span className="font-pixel-mono text-xs text-pixel-text-muted">
            {progression.xp}/{progression.xpToNextLevel}
          </span>
        </div>
        <Progress
          value={xpPercentage}
          variant={isMining ? 'mining' : 'default'}
        />
      </div>

      {/* Stats Grid */}
      <div className="space-y-2">
        <StatBar label="Energy" icon="⚡" value={stats.energy} />
        <StatBar label="Happiness" icon="😊" value={stats.happiness} />
        <StatBar label="Hunger" icon="🍖" value={stats.hunger} isInverted />
        <StatBar label="Health" icon="❤️" value={stats.health} />
      </div>

      {/* Decay Warning */}
      {daysUntilDecay !== undefined && daysUntilDecay <= 3 && (
        <div className="bg-pixel-error/20 border-2 border-pixel-error p-2">
          <div className="font-pixel text-xs text-pixel-error text-center">
            {daysUntilDecay <= 0
              ? '⚠️ Nivel decayendo!'
              : `⏰ ${Math.ceil(daysUntilDecay)} días para decay`}
          </div>
          <div className="font-pixel text-[10px] text-pixel-text-muted text-center">
            Mina para evitar perder XP
          </div>
        </div>
      )}
    </div>
  );
};

export default GameHUD;
