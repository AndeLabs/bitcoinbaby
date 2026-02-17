"use client";

/**
 * Mine Page - Native App
 *
 * Mobile-optimized mining interface.
 */

import { BottomNav } from "@/components";
import { useCapacitor } from "@/hooks";
import { useMiningStore, useBabyStore } from "@bitcoinbaby/core";
import { PixelButton, PixelProgress } from "@bitcoinbaby/ui";

export default function MinePage() {
  const { haptic, isNative } = useCapacitor();
  const { stats, startMining, stopMining } = useMiningStore();
  const { baby } = useBabyStore();

  const handleToggleMining = async () => {
    if (isNative) {
      await haptic("heavy");
    }

    if (stats.isActive) {
      stopMining();
    } else {
      startMining();
    }
  };

  // Calculate progress to next level
  const xpToNextLevel = (baby?.level || 1) * 100;
  const progressToLevel = Math.min(
    ((baby?.experience || 0) / xpToNextLevel) * 100,
    100,
  );

  return (
    <div className="flex flex-col h-screen bg-pixel-bg-dark">
      {/* Header */}
      <header className="safe-top px-4 pt-2 pb-4">
        <h1 className="font-pixel text-white text-sm">Mining</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 scroll-container px-4 pb-24">
        {/* Mining Visualization */}
        <section className="flex flex-col items-center py-8">
          <div className="relative w-32 h-32">
            <div
              className={`w-full h-full flex items-center justify-center text-6xl ${
                stats.isActive ? "animate-pixel-glow" : ""
              }`}
            >
              &#9935;
            </div>
            {stats.isActive && (
              <div className="absolute inset-0 animate-pixel-pulse rounded-full border-4 border-pixel-success" />
            )}
          </div>

          {/* Hashrate Display */}
          <div className="mt-6 text-center">
            <div className="hashrate-display">
              {stats.isActive
                ? `${(stats.hashrate / 1000).toFixed(2)} KH/s`
                : "0.00 KH/s"}
            </div>
            <div className="text-pixel-text-muted text-sm mt-1">
              {stats.minerType === "cpu" ? "CPU Mining" : "GPU Mining"}
            </div>
          </div>

          {/* Mining Button */}
          <div className="mt-8">
            <PixelButton
              variant={stats.isActive ? "destructive" : "default"}
              size="lg"
              onClick={handleToggleMining}
              className="px-12"
            >
              {stats.isActive ? "STOP" : "START"}
            </PixelButton>
          </div>
        </section>

        {/* Progress to Level Up */}
        <section className="border-pixel bg-pixel-bg-medium p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[10px] text-pixel-text-muted">
              XP TO LEVEL {(baby?.level || 1) + 1}
            </span>
            <span className="font-pixel-mono text-pixel-primary text-sm">
              {baby?.experience || 0}/{xpToNextLevel}
            </span>
          </div>
          <PixelProgress value={progressToLevel} />
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-3 mt-4">
          <div className="border-pixel bg-pixel-bg-medium p-4 rounded-lg">
            <div className="font-pixel text-[8px] text-pixel-text-muted mb-2">
              TOTAL HASHES
            </div>
            <div className="font-pixel-mono text-white text-lg">
              {stats.totalHashes.toLocaleString()}
            </div>
          </div>

          <div className="border-pixel bg-pixel-bg-medium p-4 rounded-lg">
            <div className="font-pixel text-[8px] text-pixel-text-muted mb-2">
              DIFFICULTY
            </div>
            <div className="font-pixel-mono text-pixel-secondary text-lg">
              {stats.difficulty}
            </div>
          </div>

          <div className="border-pixel bg-pixel-bg-medium p-4 rounded-lg">
            <div className="font-pixel text-[8px] text-pixel-text-muted mb-2">
              TOKENS EARNED
            </div>
            <div className="font-pixel-mono text-pixel-success text-lg">
              {stats.tokensEarned.toFixed(4)}
            </div>
          </div>

          <div className="border-pixel bg-pixel-bg-medium p-4 rounded-lg">
            <div className="font-pixel text-[8px] text-pixel-text-muted mb-2">
              BABY LEVEL
            </div>
            <div className="font-pixel-mono text-pixel-primary text-lg">
              LV {baby?.level || 1}
            </div>
          </div>
        </section>

        {/* Session Info */}
        <section className="border-pixel bg-pixel-bg-medium p-4 rounded-lg mt-4">
          <div className="font-pixel text-[10px] text-pixel-text-muted mb-3">
            SESSION INFO
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-pixel-text-muted">Uptime</span>
              <span className="font-pixel-mono text-white">
                {stats.isActive
                  ? formatDuration(stats.uptime * 1000)
                  : "--:--:--"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-pixel-text-muted">Miner Type</span>
              <span className="font-pixel-mono text-white uppercase">
                {stats.minerType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-pixel-text-muted">Total Earned</span>
              <span className="font-pixel-mono text-pixel-success">
                {stats.tokensEarned.toFixed(4)} $BABY
              </span>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
