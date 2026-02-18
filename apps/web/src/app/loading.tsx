export default function Loading() {
  return (
    <main className="min-h-screen bg-pixel-bg-dark flex items-center justify-center">
      <div className="text-center">
        {/* Animated Baby Sprite */}
        <div className="mb-6 animate-pixel-float">
          <svg
            width="64"
            height="64"
            viewBox="0 0 16 16"
            className="mx-auto"
            style={{ imageRendering: "pixelated" }}
          >
            {/* Baby circle - Bitcoin Gold */}
            <rect x="4" y="2" width="8" height="2" fill="#f7931a" />
            <rect x="2" y="4" width="2" height="8" fill="#f7931a" />
            <rect x="12" y="4" width="2" height="8" fill="#f7931a" />
            <rect x="4" y="12" width="8" height="2" fill="#f7931a" />
            <rect x="4" y="4" width="8" height="8" fill="#fbbf24" />
            {/* Happy eyes */}
            <rect x="5" y="5" width="2" height="2" fill="#1f2937" />
            <rect x="9" y="5" width="2" height="2" fill="#1f2937" />
            {/* Smile */}
            <rect x="6" y="9" width="1" height="1" fill="#1f2937" />
            <rect x="7" y="10" width="2" height="1" fill="#1f2937" />
            <rect x="9" y="9" width="1" height="1" fill="#1f2937" />
          </svg>
        </div>

        {/* Loading Text */}
        <div className="font-pixel text-xs text-pixel-primary animate-pulse">
          LOADING...
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-48 mx-auto">
          <div className="h-4 bg-pixel-bg-medium border-2 border-pixel-border overflow-hidden">
            <div className="h-full bg-pixel-primary animate-loading-bar" />
          </div>
        </div>
      </div>
    </main>
  );
}
