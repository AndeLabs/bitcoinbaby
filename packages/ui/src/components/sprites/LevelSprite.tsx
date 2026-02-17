/**
 * Level-Based Sprite Component
 *
 * Data-driven sprite renderer that uses sprite-config.ts.
 * Each level has cumulative visual features for progression visibility.
 * Designed for NFT compatibility on Bitcoin network.
 */

import { type FC, useMemo } from 'react';
import {
  getLevelConfig,
  getAllFeaturesForLevel,
  getPaletteForLevel,
  getViewBoxForLevel,
  type SpriteFeature,
  type LevelConfig,
} from './sprite-config';

export type LevelSpriteState = 'idle' | 'happy' | 'sleeping' | 'hungry' | 'mining' | 'learning' | 'evolving' | 'critical' | 'dead';

interface LevelSpriteProps {
  level: number;
  state?: LevelSpriteState;
  size?: number;
  className?: string;
  showEffects?: boolean;
}

/**
 * Get animation class based on state
 */
function getStateAnimation(state: LevelSpriteState): string {
  const animations: Record<LevelSpriteState, string> = {
    idle: 'animate-pixel-float',
    happy: 'animate-bounce',
    sleeping: 'baby-sleeping',
    hungry: 'animate-pixel-shake',
    mining: 'animate-pixel-glow',
    learning: 'animate-pulse',
    evolving: 'baby-evolving',
    critical: 'animate-pixel-shake',
    dead: 'opacity-50 grayscale',
  };
  return animations[state];
}

/**
 * Resolve color from palette reference or return as-is
 */
function resolveColor(
  color: string,
  palette: LevelConfig['palette']
): string {
  if (color in palette) {
    return palette[color as keyof LevelConfig['palette']];
  }
  return color;
}

/**
 * Render a single SVG feature element
 */
const FeatureElement: FC<{
  feature: SpriteFeature;
  palette: LevelConfig['palette'];
}> = ({ feature, palette }) => {
  const fill = resolveColor(feature.fill, palette);
  const opacity = feature.opacity ?? 1;
  const animationClass = feature.animation === 'pulse' ? 'animate-pulse' : '';

  switch (feature.type) {
    case 'rect':
      return (
        <rect
          x={feature.x}
          y={feature.y}
          width={feature.width}
          height={feature.height}
          fill={fill}
          opacity={opacity}
          className={animationClass}
        />
      );
    case 'circle':
      return (
        <circle
          cx={feature.x}
          cy={feature.y}
          r={feature.r}
          fill={fill}
          opacity={opacity}
          className={animationClass}
        />
      );
    case 'polygon':
      return (
        <polygon
          points={feature.points}
          fill={fill}
          opacity={opacity}
          className={animationClass}
        />
      );
    case 'path':
      return (
        <path
          d={feature.d}
          fill={fill}
          opacity={opacity}
          className={animationClass}
        />
      );
    default:
      return null;
  }
};

/**
 * Aura effect component
 */
const AuraEffect: FC<{ color: string; intensity: number }> = ({ color, intensity }) => (
  <div
    className="absolute inset-0 -z-10 rounded-full"
    style={{
      background: `radial-gradient(circle, ${color}${Math.round(intensity * 50).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
      animation: 'pulse 2s ease-in-out infinite',
    }}
  />
);

/**
 * Particle effect component
 */
const ParticleEffect: FC<{ color: string }> = ({ color }) => (
  <>
    <div
      className="absolute -top-2 -left-2 w-2 h-2 animate-ping"
      style={{ backgroundColor: color }}
    />
    <div
      className="absolute -top-1 -right-3 w-2 h-2 animate-ping"
      style={{ backgroundColor: color, animationDelay: '100ms' }}
    />
    <div
      className="absolute -bottom-2 left-4 w-2 h-2 animate-ping"
      style={{ backgroundColor: color, animationDelay: '200ms' }}
    />
  </>
);

/**
 * Mining sparkles overlay
 */
const MiningSparkles: FC = () => (
  <>
    <div className="absolute -top-2 -left-2 w-2 h-2 bg-[#f7931a] animate-ping" />
    <div className="absolute -top-1 -right-3 w-2 h-2 bg-[#ffc107] animate-ping" style={{ animationDelay: '100ms' }} />
    <div className="absolute -bottom-2 left-4 w-2 h-2 bg-[#22c55e] animate-ping" style={{ animationDelay: '200ms' }} />
  </>
);

/**
 * Sleeping Zzz overlay
 */
const SleepingZzz: FC = () => (
  <div className="absolute -top-4 right-0 font-pixel text-gray-400 text-xs animate-pixel-float">
    Zzz
  </div>
);

/**
 * Main LevelSprite Component
 *
 * Renders a baby sprite based on level with cumulative features.
 * NFT-ready: Each level configuration can be exported as metadata.
 */
export const LevelSprite: FC<LevelSpriteProps> = ({
  level,
  state = 'idle',
  size = 192,
  className = '',
  showEffects = true,
}) => {
  // Clamp level to valid range
  const safeLevel = Math.max(1, Math.min(21, level));

  // Get configuration data
  const config = useMemo(() => getLevelConfig(safeLevel), [safeLevel]);
  const features = useMemo(() => getAllFeaturesForLevel(safeLevel), [safeLevel]);
  const palette = useMemo(() => getPaletteForLevel(safeLevel), [safeLevel]);
  const viewBox = useMemo(() => getViewBoxForLevel(safeLevel), [safeLevel]);

  // Calculate scaled size based on level progression
  const scaleFactor = 1 + (safeLevel - 1) * 0.03; // Slightly larger each level
  const scaledSize = size * scaleFactor;

  const stateAnimation = getStateAnimation(state);

  return (
    <div className={`relative ${stateAnimation} ${className}`}>
      {/* Aura effect for high levels */}
      {showEffects && config.effects.hasAura && config.effects.auraColor && (
        <AuraEffect
          color={config.effects.auraColor}
          intensity={config.effects.glowIntensity ?? 0.5}
        />
      )}

      {/* Main SVG sprite */}
      <svg
        width={scaledSize}
        height={scaledSize}
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        style={{ imageRendering: 'pixelated' }}
        data-level={safeLevel}
        data-name={config.name}
      >
        {/* Render all cumulative features */}
        {features.map((feature, index) => (
          <FeatureElement
            key={`${feature.name}-${index}`}
            feature={feature}
            palette={palette}
          />
        ))}

        {/* Sleeping eyes override */}
        {state === 'sleeping' && (
          <>
            <rect
              x={viewBox * 0.31}
              y={viewBox * 0.38}
              width={viewBox * 0.12}
              height={viewBox * 0.06}
              fill="#1f2937"
            />
            <rect
              x={viewBox * 0.56}
              y={viewBox * 0.38}
              width={viewBox * 0.12}
              height={viewBox * 0.06}
              fill="#1f2937"
            />
          </>
        )}
      </svg>

      {/* State-based overlays */}
      {showEffects && (
        <>
          {state === 'mining' && <MiningSparkles />}
          {state === 'sleeping' && <SleepingZzz />}
          {config.effects.hasParticles && config.effects.particleColor && (
            <ParticleEffect color={config.effects.particleColor} />
          )}
        </>
      )}

      {/* Evolution sparkle */}
      {state === 'evolving' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
          ✨
        </div>
      )}
    </div>
  );
};

/**
 * Get NFT metadata for a level
 * Used for Bitcoin inscription compatibility
 */
export function getLevelNFTMetadata(level: number) {
  const config = getLevelConfig(level);
  const features = getAllFeaturesForLevel(level);

  return {
    name: config.name,
    level,
    attributes: [
      { trait_type: 'Level', value: level },
      { trait_type: 'Name', value: config.name },
      { trait_type: 'ViewBox', value: config.viewBoxSize },
      { trait_type: 'Feature Count', value: features.length },
      { trait_type: 'Has Aura', value: config.effects.hasAura ?? false },
      { trait_type: 'Has Particles', value: config.effects.hasParticles ?? false },
      { trait_type: 'Glow Intensity', value: config.effects.glowIntensity ?? 0 },
    ],
    palette: config.palette,
    features: features.map((f) => ({
      name: f.name,
      type: f.type,
      level: f.level,
    })),
  };
}

export default LevelSprite;
