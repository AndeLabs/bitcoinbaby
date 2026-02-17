"use client";

/**
 * Settings Page - Native App
 *
 * Mobile-optimized settings interface.
 */

import Link from "next/link";
import { BottomNav } from "@/components";
import { useCapacitor } from "@/hooks";
import { useNetworkStore, useSettingsStore } from "@bitcoinbaby/core";
import { PixelCard } from "@bitcoinbaby/ui";

export default function SettingsPage() {
  const { haptic, isNative, platform } = useCapacitor();
  const { network, switchNetwork, mainnetAllowed, setMainnetAllowed } =
    useNetworkStore();
  const {
    mining,
    display,
    setAutoSubmit,
    setMinerType,
    setSoundEnabled,
    setNotificationsEnabled,
  } = useSettingsStore();

  const handleToggle = async (action: () => void) => {
    if (isNative) {
      await haptic("light");
    }
    action();
  };

  return (
    <div className="flex flex-col h-screen bg-pixel-bg-dark">
      {/* Header */}
      <header className="safe-top px-4 pt-2 pb-4">
        <h1 className="font-pixel text-white text-sm">Settings</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 scroll-container px-4 pb-24">
        {/* Network */}
        <PixelCard className="mb-4">
          <div className="p-4">
            <h2 className="font-pixel text-[10px] text-pixel-text-muted mb-4">
              NETWORK
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-pixel text-white text-xs">
                  Bitcoin Network
                </div>
                <div className="text-pixel-text-muted text-xs mt-1">
                  {network === "mainnet"
                    ? "Real Bitcoin (Mainnet)"
                    : "Test Bitcoin (Testnet4)"}
                </div>
              </div>
              <button
                onClick={() =>
                  handleToggle(() => {
                    if (network === "mainnet") {
                      switchNetwork("testnet4");
                    } else if (mainnetAllowed) {
                      switchNetwork("mainnet");
                    }
                  })
                }
                className={`px-3 py-2 rounded font-pixel text-[8px] ${
                  network === "mainnet"
                    ? "bg-pixel-primary text-pixel-text-dark"
                    : "bg-pixel-secondary text-pixel-text-dark"
                }`}
              >
                {network === "mainnet" ? "MAIN" : "TEST"}
              </button>
            </div>
          </div>
        </PixelCard>

        {/* Mining */}
        <PixelCard className="mb-4">
          <div className="p-4">
            <h2 className="font-pixel text-[10px] text-pixel-text-muted mb-4">
              MINING
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-pixel text-white text-xs">
                    Auto Submit
                  </div>
                  <div className="text-pixel-text-muted text-xs mt-1">
                    Automatically submit valid shares
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleToggle(() => setAutoSubmit(!mining.autoSubmit))
                  }
                  className={`w-12 h-6 rounded-full relative ${
                    mining.autoSubmit ? "bg-pixel-success" : "bg-pixel-border"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      mining.autoSubmit ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-pixel text-white text-xs">
                    Miner Type
                  </div>
                  <div className="text-pixel-text-muted text-xs mt-1">
                    {mining.minerType === "cpu"
                      ? "CPU Mining"
                      : mining.minerType === "gpu"
                        ? "GPU Mining (WebGPU)"
                        : "Auto-detect"}
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleToggle(() =>
                      setMinerType(mining.minerType === "cpu" ? "gpu" : "cpu"),
                    )
                  }
                  className="px-3 py-2 rounded font-pixel text-[8px] bg-pixel-bg-light text-white"
                >
                  {mining.minerType === "cpu" ? "CPU" : "GPU"}
                </button>
              </div>
            </div>
          </div>
        </PixelCard>

        {/* Display */}
        <PixelCard className="mb-4">
          <div className="p-4">
            <h2 className="font-pixel text-[10px] text-pixel-text-muted mb-4">
              DISPLAY
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-pixel text-white text-xs">
                    Sound Effects
                  </div>
                  <div className="text-pixel-text-muted text-xs mt-1">
                    Play sounds for events
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleToggle(() => setSoundEnabled(!display.soundEnabled))
                  }
                  className={`w-12 h-6 rounded-full relative ${
                    display.soundEnabled
                      ? "bg-pixel-success"
                      : "bg-pixel-border"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      display.soundEnabled ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-pixel text-white text-xs">
                    Notifications
                  </div>
                  <div className="text-pixel-text-muted text-xs mt-1">
                    Show push notifications
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleToggle(() =>
                      setNotificationsEnabled(!display.notificationsEnabled),
                    )
                  }
                  className={`w-12 h-6 rounded-full relative ${
                    display.notificationsEnabled
                      ? "bg-pixel-success"
                      : "bg-pixel-border"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      display.notificationsEnabled
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </PixelCard>

        {/* Wallet Security */}
        <PixelCard className="mb-4">
          <div className="p-4">
            <h2 className="font-pixel text-[10px] text-pixel-text-muted mb-4">
              WALLET SECURITY
            </h2>

            <div className="space-y-2">
              <Link href="/wallet/backup">
                <div className="flex items-center justify-between py-3 border-b border-pixel-border touch-feedback">
                  <span className="font-pixel text-white text-xs">
                    Backup Recovery Phrase
                  </span>
                  <span className="text-pixel-text-muted">&#8250;</span>
                </div>
              </Link>

              <Link href="/wallet/change-password">
                <div className="flex items-center justify-between py-3 touch-feedback">
                  <span className="font-pixel text-white text-xs">
                    Change Password
                  </span>
                  <span className="text-pixel-text-muted">&#8250;</span>
                </div>
              </Link>
            </div>
          </div>
        </PixelCard>

        {/* About */}
        <PixelCard className="mb-4">
          <div className="p-4">
            <h2 className="font-pixel text-[10px] text-pixel-text-muted mb-4">
              ABOUT
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-pixel-text-muted">Version</span>
                <span className="font-pixel-mono text-white">0.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pixel-text-muted">Platform</span>
                <span className="font-pixel-mono text-white capitalize">
                  {platform}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-pixel-text-muted">Build</span>
                <span className="font-pixel-mono text-white">
                  {isNative ? "Native" : "Web"}
                </span>
              </div>
            </div>
          </div>
        </PixelCard>

        {/* Links */}
        <div className="space-y-2">
          <a
            href="https://bitcoinbaby.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="border-pixel bg-pixel-bg-medium p-4 rounded-lg touch-feedback flex items-center justify-between">
              <span className="font-pixel text-[10px] text-white">Website</span>
              <span className="text-pixel-text-muted">&#8599;</span>
            </div>
          </a>

          <a
            href="https://github.com/bitcoinbaby"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="border-pixel bg-pixel-bg-medium p-4 rounded-lg touch-feedback flex items-center justify-between">
              <span className="font-pixel text-[10px] text-white">GitHub</span>
              <span className="text-pixel-text-muted">&#8599;</span>
            </div>
          </a>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
