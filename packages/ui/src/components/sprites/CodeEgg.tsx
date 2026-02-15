/**
 * El Huevo de Codigo - The Code Egg
 *
 * The dormant state before the Baby is born.
 * Heavy with potential, showing circuit patterns.
 */

interface CodeEggProps {
  size?: number;
  state?: 'dormant' | 'warming' | 'hatching';
  className?: string;
}

export function CodeEgg({ size = 128, state = 'dormant', className = '' }: CodeEggProps) {
  const stateClasses = {
    dormant: 'opacity-80',
    warming: 'animate-pulse',
    hatching: 'animate-pixel-shake',
  };

  const circuitOpacity = {
    dormant: 0.3,
    warming: 0.7,
    hatching: 1,
  };

  return (
    <div className={`relative ${stateClasses[state]} ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Shadow */}
        <ellipse cx="16" cy="30" rx="10" ry="2" fill="#000000" opacity="0.3" />

        {/* Egg Base Shape */}
        <rect x="8" y="8" width="16" height="18" fill="#374151" />
        <rect x="6" y="10" width="2" height="14" fill="#374151" />
        <rect x="24" y="10" width="2" height="14" fill="#374151" />
        <rect x="10" y="6" width="12" height="2" fill="#374151" />
        <rect x="10" y="26" width="12" height="2" fill="#374151" />

        {/* Metal Plate Texture */}
        <rect x="10" y="10" width="6" height="6" fill="#1a1a2e" />
        <rect x="16" y="10" width="6" height="6" fill="#4b5563" />
        <rect x="10" y="16" width="6" height="6" fill="#4b5563" />
        <rect x="16" y="16" width="6" height="6" fill="#1a1a2e" />
        <rect x="10" y="22" width="6" height="4" fill="#1a1a2e" />
        <rect x="16" y="22" width="6" height="4" fill="#4b5563" />

        {/* Circuit Patterns - Orange Glow */}
        <g opacity={circuitOpacity[state]}>
          {/* Vertical circuits */}
          <rect x="9" y="12" width="1" height="8" fill="#f7931a" />
          <rect x="22" y="14" width="1" height="6" fill="#f7931a" />

          {/* Horizontal circuits */}
          <rect x="12" y="11" width="4" height="1" fill="#f7931a" />
          <rect x="17" y="15" width="4" height="1" fill="#f7931a" />
          <rect x="11" y="19" width="3" height="1" fill="#f7931a" />
          <rect x="18" y="23" width="3" height="1" fill="#f7931a" />

          {/* Junction points */}
          <rect x="15" y="13" width="2" height="2" fill="#ffc107" />
          <rect x="13" y="17" width="2" height="2" fill="#ffc107" />
          <rect x="17" y="21" width="2" height="2" fill="#ffc107" />
        </g>

        {/* Cracks */}
        <rect x="14" y="6" width="1" height="3" fill="#000000" />
        <rect x="15" y="8" width="2" height="1" fill="#000000" />
        <rect x="17" y="7" width="1" height="2" fill="#000000" />

        {/* Highlight */}
        <rect x="10" y="8" width="2" height="1" fill="#6b7280" />
        <rect x="8" y="10" width="1" height="2" fill="#6b7280" />
      </svg>

      {/* Hatching particles */}
      {state === 'hatching' && (
        <>
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-pixel-primary animate-ping" />
          <div className="absolute top-2 right-1/4 w-2 h-2 bg-pixel-secondary animate-ping" style={{ animationDelay: '100ms' }} />
          <div className="absolute top-1 left-1/2 w-1 h-1 bg-yellow-400 animate-ping" style={{ animationDelay: '200ms' }} />
        </>
      )}

      {/* Warming glow */}
      {state === 'warming' && (
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(247,147,26,0.2) 0%, transparent 70%)',
          }}
        />
      )}
    </div>
  );
}
