"use client";

/**
 * Home Page - Native App
 *
 * Mobile-optimized main screen showing baby and quick actions.
 */

import { BottomNav } from "@/components";
import { useCapacitor } from "@/hooks";
import {
  useBabyStore,
  useMiningStore,
  useNetworkStore,
} from "@bitcoinbaby/core";
import { BabySprite } from "@bitcoinbaby/ui";

export default function HomePage() {
  const { haptic, isNative } = useCapacitor();
  const { baby } = useBabyStore();
  const { stats } = useMiningStore();
  const { network } = useNetworkStore();

  const handleBabyTap = async () => {
    if (isNative) {
      await haptic("medium");
    }
    // Could trigger interaction with baby
  };

  // Map baby state to sprite state
  const getSpriteState = (state: string) => {
    const stateMap: Record<
      string,
      "idle" | "happy" | "sleeping" | "hungry" | "evolving"
    > = {
      sleeping: "sleeping",
      hungry: "hungry",
      happy: "happy",
      learning: "idle",
      evolving: "evolving",
    };
    return stateMap[state] || "idle";
  };

  return (
    <div className="flex flex-col h-screen bg-pixel-bg-dark">
      {/* Header */}
      <header className="safe-top px-4 pt-2 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="font-pixel text-pixel-primary text-sm">BitcoinBaby</h1>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded ${
                network === "mainnet"
                  ? "bg-pixel-primary/20 text-pixel-primary"
                  : "bg-pixel-secondary/20 text-pixel-secondary"
              }`}
            >
              {network === "mainnet" ? "MAIN" : "TEST"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 scroll-container px-4 pb-24">
        {/* Baby Display */}
        <section className="flex flex-col items-center py-8">
          <div
            className="relative touch-feedback cursor-pointer"
            onClick={handleBabyTap}
          >
            <div className="baby-avatar-xl animate-pixel-float">
              <BabySprite
                state={getSpriteState(baby?.state || "happy")}
                size={192}
              />
            </div>

            {/* Level Badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-pixel-bg-medium border-2 border-pixel-border px-3 py-1 rounded">
              <span className="font-pixel text-[10px] text-pixel-primary">
                LV {baby?.level || 1}
              </span>
            </div>
          </div>

          {/* Baby Name */}
          <h2 className="font-pixel text-white text-sm mt-6">
            {baby?.name || "Your Baby"}
          </h2>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 mt-4">
            <div className="text-center">
              <div className="font-pixel-mono text-pixel-success text-2xl">
                {baby?.experience || 0}
              </div>
              <div className="text-[10px] text-pixel-text-muted">XP</div>
            </div>
            <div className="w-px h-8 bg-pixel-border" />
            <div className="text-center">
              <div className="font-pixel-mono text-pixel-primary text-2xl">
                {baby?.level || 1}
              </div>
              <div className="text-[10px] text-pixel-text-muted">LEVEL</div>
            </div>
          </div>
        </section>

        {/* Mining Status Card */}
        <section className="border-pixel bg-pixel-bg-medium p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-pixel text-[10px] text-pixel-text-muted">
              MINING STATUS
            </h3>
            <div
              className={`w-3 h-3 rounded-full ${
                stats.isActive
                  ? "bg-pixel-success animate-pixel-pulse"
                  : "bg-pixel-text-muted"
              }`}
            />
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 text-4xl flex items-center justify-center ${
                stats.isActive ? "animate-pixel-glow" : ""
              }`}
            >
              &#9935;
            </div>

            <div className="flex-1">
              <div className="font-pixel-mono text-pixel-success text-xl">
                {stats.isActive
                  ? `${(stats.hashrate / 1000).toFixed(1)} KH/s`
                  : "IDLE"}
              </div>
              <div className="text-xs text-pixel-text-muted mt-1">
                {stats.isActive
                  ? `${stats.totalHashes.toLocaleString()} hashes`
                  : "Tap Mine to start"}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-pixel-border">
            <div className="text-center">
              <div className="font-pixel-mono text-white text-sm">
                {stats.difficulty}
              </div>
              <div className="text-[8px] text-pixel-text-muted">DIFF</div>
            </div>
            <div className="text-center">
              <div className="font-pixel-mono text-pixel-primary text-sm">
                {stats.uptime}s
              </div>
              <div className="text-[8px] text-pixel-text-muted">UPTIME</div>
            </div>
            <div className="text-center">
              <div className="font-pixel-mono text-pixel-success text-sm">
                {stats.tokensEarned.toFixed(2)}
              </div>
              <div className="text-[8px] text-pixel-text-muted">EARNED</div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-3 mt-4">
          <button className="border-pixel bg-pixel-bg-medium p-4 rounded-lg touch-feedback text-center">
            <span className="text-2xl block mb-2">&#127919;</span>
            <span className="font-pixel text-[8px] text-pixel-text">Feed</span>
          </button>
          <button className="border-pixel bg-pixel-bg-medium p-4 rounded-lg touch-feedback text-center">
            <span className="text-2xl block mb-2">&#128214;</span>
            <span className="font-pixel text-[8px] text-pixel-text">Train</span>
          </button>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
