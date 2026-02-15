/**
 * El Cypher-Adolescente - Evolved Teen Form
 *
 * A taller, cooler orange robot character with hacker hoodie
 * and VR goggles. Represents advanced AI model growth.
 */

export type TeenState = 'idle' | 'hacking' | 'mining_boost' | 'teaching';

interface TeenSpriteProps {
  size?: number;
  state?: TeenState;
  className?: string;
}

export function TeenSprite({ size = 192, state = 'idle', className = '' }: TeenSpriteProps) {
  const stateClasses: Record<TeenState, string> = {
    idle: '',
    hacking: 'animate-pulse',
    mining_boost: 'animate-pixel-glow',
    teaching: '',
  };

  return (
    <div className={`relative ${stateClasses[state]} ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Shadow */}
        <ellipse cx="12" cy="23" rx="6" ry="1" fill="#000000" opacity="0.3" />

        {/* Hoodie */}
        <rect x="6" y="2" width="12" height="10" fill="#6366f1" />
        <rect x="5" y="4" width="1" height="6" fill="#6366f1" />
        <rect x="18" y="4" width="1" height="6" fill="#6366f1" />
        <rect x="8" y="1" width="8" height="2" fill="#6366f1" />

        {/* Hoodie shadow */}
        <rect x="7" y="10" width="10" height="1" fill="#4f46e5" />
        <rect x="6" y="8" width="1" height="2" fill="#4f46e5" />
        <rect x="17" y="8" width="1" height="2" fill="#4f46e5" />

        {/* Face area */}
        <rect x="8" y="4" width="8" height="6" fill="#f7931a" />

        {/* VR Goggles */}
        <rect x="7" y="5" width="10" height="4" fill="#1f2937" />
        <rect x="6" y="6" width="1" height="2" fill="#1f2937" />
        <rect x="17" y="6" width="1" height="2" fill="#1f2937" />

        {/* Goggles lens - data reflection */}
        <rect x="8" y="6" width="3" height="2" fill="#0f0f1b" />
        <rect x="13" y="6" width="3" height="2" fill="#0f0f1b" />

        {/* Data scrolling on goggles */}
        {state === 'hacking' && (
          <>
            <rect x="8" y="6" width="1" height="1" fill="#4ade80" className="animate-pulse" />
            <rect x="10" y="7" width="1" height="1" fill="#4ade80" className="animate-pulse" style={{ animationDelay: '100ms' }} />
            <rect x="13" y="6" width="1" height="1" fill="#4ade80" className="animate-pulse" style={{ animationDelay: '200ms' }} />
            <rect x="15" y="7" width="1" height="1" fill="#4ade80" className="animate-pulse" style={{ animationDelay: '300ms' }} />
          </>
        )}

        {/* Goggles shine */}
        <rect x="8" y="6" width="1" height="1" fill="#4fc3f7" opacity="0.5" />
        <rect x="13" y="6" width="1" height="1" fill="#4fc3f7" opacity="0.5" />

        {/* Mouth area */}
        <rect x="10" y="9" width="4" height="1" fill="#e67e00" />

        {/* Body */}
        <rect x="7" y="11" width="10" height="8" fill="#f7931a" />
        <rect x="6" y="12" width="1" height="5" fill="#f7931a" />
        <rect x="17" y="12" width="1" height="5" fill="#f7931a" />

        {/* Body highlight */}
        <rect x="8" y="11" width="2" height="1" fill="#ffc107" />

        {/* Circuit patterns on body */}
        <rect x="8" y="13" width="1" height="3" fill="#4fc3f7" />
        <rect x="9" y="14" width="2" height="1" fill="#4fc3f7" />
        <rect x="14" y="12" width="2" height="1" fill="#4fc3f7" />
        <rect x="15" y="13" width="1" height="2" fill="#4fc3f7" />

        {/* Bitcoin B on chest */}
        <rect x="11" y="13" width="2" height="4" fill="#1f2937" />
        <rect x="10" y="14" width="1" height="1" fill="#1f2937" />
        <rect x="13" y="14" width="1" height="1" fill="#1f2937" />
        <rect x="10" y="16" width="1" height="1" fill="#1f2937" />
        <rect x="13" y="16" width="1" height="1" fill="#1f2937" />

        {/* Arms */}
        <rect x="4" y="12" width="2" height="4" fill="#e67e00" />
        <rect x="18" y="12" width="2" height="4" fill="#e67e00" />

        {/* Hands */}
        <rect x="4" y="16" width="2" height="2" fill="#f7931a" />
        <rect x="18" y="16" width="2" height="2" fill="#f7931a" />

        {/* Legs */}
        <rect x="8" y="19" width="3" height="3" fill="#e67e00" />
        <rect x="13" y="19" width="3" height="3" fill="#e67e00" />

        {/* Feet */}
        <rect x="7" y="21" width="4" height="1" fill="#1f2937" />
        <rect x="13" y="21" width="4" height="1" fill="#1f2937" />
      </svg>

      {/* Mining boost aura */}
      {state === 'mining_boost' && (
        <>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-3 bg-pixel-primary animate-ping" />
          <div className="absolute top-0 -left-4 w-2 h-2 bg-pixel-secondary animate-ping" style={{ animationDelay: '100ms' }} />
          <div className="absolute top-0 -right-4 w-2 h-2 bg-pixel-success animate-ping" style={{ animationDelay: '200ms' }} />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle, rgba(247,147,26,0.3) 0%, transparent 60%)',
            }}
          />
        </>
      )}

      {/* Teaching speech bubble */}
      {state === 'teaching' && (
        <div className="absolute -top-8 -right-4 px-2 py-1 bg-pixel-bg-medium border-2 border-pixel-border font-pixel text-[6px] text-pixel-text">
          TIP!
        </div>
      )}

      {/* Hacking keyboard effect */}
      {state === 'hacking' && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-2 bg-pixel-success animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
