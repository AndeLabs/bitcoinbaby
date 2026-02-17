"use client";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="pixel-container max-w-md text-center">
        {/* Pixel art style offline indicator */}
        <div className="mb-8 text-6xl">
          <span className="pixel-text text-pixel-secondary">{"[  ]"}</span>
        </div>

        <h1 className="pixel-title mb-4 text-2xl text-pixel-primary">
          You are Offline
        </h1>

        <p className="pixel-body mb-6 text-pixel-text-muted">
          It looks like you have lost your internet connection. Mining requires
          an active connection to the Bitcoin network.
        </p>

        <div className="space-y-4">
          <p className="pixel-body text-sm text-pixel-text-muted">
            While offline, you can:
          </p>
          <ul className="pixel-body space-y-2 text-left text-sm text-pixel-text-muted">
            <li className="flex items-center gap-2">
              <span className="text-pixel-secondary">{">"}</span>
              View your cached baby stats
            </li>
            <li className="flex items-center gap-2">
              <span className="text-pixel-secondary">{">"}</span>
              Check your mining history
            </li>
            <li className="flex items-center gap-2">
              <span className="text-pixel-secondary">{">"}</span>
              Review your wallet (read-only)
            </li>
          </ul>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="pixel-button mt-8 rounded border-2 border-pixel-primary bg-pixel-primary/10 px-6 py-3 text-pixel-primary transition-colors hover:bg-pixel-primary hover:text-pixel-bg-dark"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
