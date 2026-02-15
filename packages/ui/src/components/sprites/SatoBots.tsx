/**
 * Los Sato-Bots - Helper Companions
 *
 * Tiny flying drones representing satoshis and micro-transactions.
 * Appear in groups, following the Baby or indicating rewards.
 */

interface SatoBotProps {
  size?: number;
  className?: string;
}

function SatoBot({ size = 32, className = '' }: SatoBotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ imageRendering: 'pixelated' }}
      className={className}
    >
      {/* Propeller */}
      <rect x="6" y="1" width="4" height="1" fill="#6b7280" />
      <rect x="7" y="2" width="2" height="1" fill="#9ca3af" />

      {/* Antenna */}
      <rect x="7" y="3" width="2" height="2" fill="#374151" />

      {/* Body - Coin shape */}
      <rect x="4" y="5" width="8" height="6" fill="#f7931a" />
      <rect x="3" y="6" width="1" height="4" fill="#f7931a" />
      <rect x="12" y="6" width="1" height="4" fill="#f7931a" />

      {/* Body highlight */}
      <rect x="5" y="6" width="2" height="1" fill="#ffc107" />

      {/* Body shadow */}
      <rect x="9" y="9" width="2" height="1" fill="#e67e00" />

      {/* Eyes */}
      <rect x="5" y="7" width="2" height="2" fill="#1f2937" />
      <rect x="9" y="7" width="2" height="2" fill="#1f2937" />

      {/* Eye glow */}
      <rect x="5" y="7" width="1" height="1" fill="#4fc3f7" />
      <rect x="9" y="7" width="1" height="1" fill="#4fc3f7" />

      {/* Bitcoin B symbol */}
      <rect x="7" y="6" width="2" height="4" fill="#1f2937" />
      <rect x="6" y="7" width="1" height="1" fill="#1f2937" />
      <rect x="6" y="9" width="1" height="1" fill="#1f2937" />

      {/* Sparkle trail */}
      <rect x="7" y="12" width="1" height="1" fill="#ffc107" />
      <rect x="6" y="14" width="1" height="1" fill="#ffc107" opacity="0.7" />
      <rect x="9" y="13" width="1" height="1" fill="#ffc107" opacity="0.5" />
    </svg>
  );
}

interface SatoBotsGroupProps {
  count?: 1 | 2 | 3;
  size?: number;
  animated?: boolean;
  className?: string;
}

export function SatoBots({
  count = 3,
  size = 32,
  animated = true,
  className = '',
}: SatoBotsGroupProps) {
  const bots = Array.from({ length: count }, (_, i) => i);

  return (
    <div className={`relative flex items-center ${className}`}>
      {bots.map((i) => (
        <div
          key={i}
          className={animated ? 'animate-pixel-float' : ''}
          style={{
            marginLeft: i > 0 ? -size * 0.3 : 0,
            animationDelay: `${i * 200}ms`,
            zIndex: count - i,
          }}
        >
          <SatoBot size={size} />
        </div>
      ))}

      {/* Collective sparkle effect */}
      {animated && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-yellow-400 animate-ping" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-yellow-400 animate-ping" style={{ animationDelay: '100ms' }} />
            <div className="w-1 h-1 bg-yellow-400 animate-ping" style={{ animationDelay: '200ms' }} />
          </div>
        </div>
      )}
    </div>
  );
}

// Single bot export
export { SatoBot };
