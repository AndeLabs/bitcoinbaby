/**
 * El Whale - Random Bonus NPC
 *
 * A mythical Bitcoin whale that appears randomly during mining
 * sessions to grant bonus tokens. Represents the legendary
 * early adopters of Bitcoin.
 */

import { type FC } from 'react';

interface WhaleSpriteProps {
  size?: number;
  state?: 'idle' | 'appearing' | 'giving' | 'leaving';
  className?: string;
}

export const WhaleSprite: FC<WhaleSpriteProps> = ({
  size = 128,
  state = 'idle',
  className = '',
}) => {
  const stateClasses: Record<string, string> = {
    idle: 'animate-pixel-float',
    appearing: 'animate-bounce',
    giving: 'animate-pulse',
    leaving: 'animate-ping opacity-50',
  };

  return (
    <div className={`relative ${stateClasses[state]} ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 32"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Whale Body - Main shape */}
        <rect x="8" y="10" width="32" height="14" fill="#1e3a8a" />
        <rect x="6" y="12" width="4" height="10" fill="#1e3a8a" />
        <rect x="38" y="12" width="4" height="10" fill="#1e3a8a" />

        {/* Whale Head - Rounded front */}
        <rect x="4" y="14" width="6" height="6" fill="#1e3a8a" />
        <rect x="2" y="16" width="4" height="2" fill="#1e3a8a" />

        {/* Tail */}
        <rect x="40" y="8" width="4" height="4" fill="#1e3a8a" />
        <rect x="42" y="6" width="4" height="2" fill="#1e3a8a" />
        <rect x="44" y="4" width="2" height="4" fill="#1e3a8a" />
        <rect x="40" y="22" width="4" height="4" fill="#1e3a8a" />
        <rect x="42" y="24" width="4" height="2" fill="#1e3a8a" />
        <rect x="44" y="22" width="2" height="4" fill="#1e3a8a" />

        {/* Belly - Lighter */}
        <rect x="10" y="18" width="28" height="6" fill="#3b82f6" />
        <rect x="6" y="18" width="4" height="4" fill="#3b82f6" />

        {/* Eye */}
        <rect x="6" y="14" width="4" height="3" fill="#1f2937" />
        <rect x="7" y="14" width="2" height="1" fill="#ffffff" />

        {/* Blowhole spray - only when appearing/giving */}
        {(state === 'appearing' || state === 'giving') && (
          <>
            <rect x="22" y="6" width="2" height="2" fill="#60a5fa" />
            <rect x="20" y="4" width="2" height="2" fill="#93c5fd" />
            <rect x="24" y="4" width="2" height="2" fill="#93c5fd" />
            <rect x="21" y="2" width="2" height="2" fill="#bfdbfe" />
            <rect x="23" y="1" width="2" height="2" fill="#dbeafe" />
          </>
        )}

        {/* Bitcoin symbol on side */}
        <rect x="18" y="12" width="8" height="8" fill="#f7931a" />
        <rect x="20" y="14" width="4" height="4" fill="#1e3a8a" />
        <rect x="21" y="15" width="2" height="2" fill="#f7931a" />

        {/* Fins */}
        <rect x="14" y="22" width="4" height="4" fill="#1e40af" />
        <rect x="30" y="22" width="4" height="4" fill="#1e40af" />

        {/* Dorsal fin */}
        <rect x="24" y="8" width="4" height="2" fill="#1e40af" />
        <rect x="25" y="6" width="2" height="2" fill="#1e40af" />

        {/* Sparkle effect when giving */}
        {state === 'giving' && (
          <>
            <rect x="12" y="8" width="2" height="2" fill="#fbbf24" className="animate-ping" />
            <rect x="32" y="10" width="2" height="2" fill="#fbbf24" className="animate-ping" style={{ animationDelay: '100ms' }} />
            <rect x="26" y="6" width="2" height="2" fill="#fbbf24" className="animate-ping" style={{ animationDelay: '200ms' }} />
          </>
        )}
      </svg>

      {/* Token shower when giving */}
      {state === 'giving' && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
          <span className="text-xl animate-bounce" style={{ animationDelay: '0ms' }}>
            🪙
          </span>
          <span className="text-xl animate-bounce" style={{ animationDelay: '100ms' }}>
            🪙
          </span>
          <span className="text-xl animate-bounce" style={{ animationDelay: '200ms' }}>
            🪙
          </span>
        </div>
      )}

      {/* Speech bubble */}
      {state === 'appearing' && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded border-2 border-black text-xs font-pixel">
          HODL!
        </div>
      )}
    </div>
  );
};

export default WhaleSprite;
