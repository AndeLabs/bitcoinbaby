/**
 * El Oraculo del Mempool - The Guide NPC
 *
 * A wise, ancient robotic wizard that guides users through
 * the blockchain mysteries. Appears in tutorials and help sections.
 */

interface OracleProps {
  size?: number;
  state?: 'idle' | 'talking' | 'thinking';
  className?: string;
}

export function Oracle({ size = 128, state = 'idle', className = '' }: OracleProps) {
  const stateClasses = {
    idle: '',
    talking: 'animate-pulse',
    thinking: 'animate-pixel-float',
  };

  return (
    <div className={`relative ${stateClasses[state]} ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Staff */}
        <rect x="4" y="8" width="2" height="20" fill="#8b5cf6" />
        <rect x="3" y="6" width="4" height="3" fill="#f7931a" />
        <rect x="4" y="5" width="2" height="1" fill="#ffc107" />

        {/* Robes - Base */}
        <rect x="10" y="16" width="14" height="14" fill="#0f0f1b" />
        <rect x="8" y="18" width="2" height="10" fill="#0f0f1b" />
        <rect x="24" y="18" width="2" height="10" fill="#0f0f1b" />

        {/* Robes - Binary Pattern */}
        <rect x="11" y="18" width="1" height="1" fill="#4ade80" />
        <rect x="14" y="19" width="1" height="1" fill="#4ade80" />
        <rect x="17" y="18" width="1" height="1" fill="#4ade80" />
        <rect x="20" y="20" width="1" height="1" fill="#4ade80" />
        <rect x="12" y="22" width="1" height="1" fill="#4ade80" />
        <rect x="15" y="23" width="1" height="1" fill="#4ade80" />
        <rect x="18" y="22" width="1" height="1" fill="#4ade80" />
        <rect x="21" y="24" width="1" height="1" fill="#4ade80" />
        <rect x="13" y="26" width="1" height="1" fill="#4ade80" />
        <rect x="16" y="27" width="1" height="1" fill="#4ade80" />
        <rect x="19" y="26" width="1" height="1" fill="#4ade80" />

        {/* Head */}
        <rect x="12" y="6" width="10" height="10" fill="#374151" />
        <rect x="10" y="8" width="2" height="6" fill="#374151" />
        <rect x="22" y="8" width="2" height="6" fill="#374151" />

        {/* Hood */}
        <rect x="11" y="5" width="12" height="2" fill="#0f0f1b" />
        <rect x="10" y="6" width="2" height="4" fill="#0f0f1b" />
        <rect x="22" y="6" width="2" height="4" fill="#0f0f1b" />

        {/* Third Eye */}
        <rect x="15" y="7" width="4" height="3" fill="#1f2937" />
        <rect x="16" y="8" width="2" height="1" fill="#ef4444" />

        {/* Eye Glow */}
        {state === 'talking' && (
          <rect x="16" y="8" width="2" height="1" fill="#ff6b6b" className="animate-ping" />
        )}

        {/* Beard - Cable Strands */}
        <rect x="13" y="12" width="1" height="6" fill="#6b7280" />
        <rect x="15" y="13" width="1" height="7" fill="#9ca3af" />
        <rect x="17" y="12" width="1" height="8" fill="#6b7280" />
        <rect x="19" y="13" width="1" height="6" fill="#9ca3af" />
        <rect x="14" y="14" width="1" height="5" fill="#4b5563" />
        <rect x="18" y="14" width="1" height="5" fill="#4b5563" />

        {/* Arms holding staff */}
        <rect x="6" y="18" width="4" height="2" fill="#374151" />
        <rect x="8" y="16" width="2" height="3" fill="#374151" />
      </svg>

      {/* Speech indicator when talking */}
      {state === 'talking' && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-pixel-success rounded-none border-2 border-black animate-bounce" />
      )}
    </div>
  );
}
