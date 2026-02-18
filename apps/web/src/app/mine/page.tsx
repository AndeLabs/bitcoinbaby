"use client";

/**
 * Mine Page - Web App
 *
 * Full mining dashboard with NFT boost integration and WebGPU support.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMiningWithNFTs } from "@/hooks";
import {
  useWalletStore,
  useNFTStore,
  formatHashrate,
  formatTime,
} from "@bitcoinbaby/core";

export default function MinePage() {
  const wallet = useWalletStore((s) => s.wallet);
  const { bestBoost, totalNFTs } = useNFTStore();
  const [uptime, setUptime] = useState(0);

  const {
    isRunning,
    isPaused,
    hashrate,
    effectiveHashrate,
    totalHashes,
    shares,
    difficulty,
    minerType,
    capabilities,
    nftBoost,
    boostMultiplier,
    start,
    stop,
    pause,
    resume,
  } = useMiningWithNFTs({
    difficulty: 16,
    minerAddress: wallet?.address || "",
    autoStart: false,
  });

  // Uptime counter - resets when mining stops, counts when running
  useEffect(() => {
    // Reset uptime when mining stops (async to comply with React Compiler)
    if (!isRunning) {
      const timeout = setTimeout(() => setUptime(0), 0);
      return () => clearTimeout(timeout);
    }

    // Count up when running and not paused
    if (!isPaused) {
      const interval = setInterval(() => {
        setUptime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, isPaused]);

  return (
    <main className="min-h-screen p-4 md:p-8 bg-pixel-bg-dark">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-pixel text-xl text-pixel-primary">MINING</h1>
              <p className="font-pixel-body text-sm text-pixel-text-muted mt-1">
                Earn $BABY tokens with Proof of Work
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/nfts"
                className="font-pixel text-[8px] text-pixel-secondary hover:text-pixel-primary transition-colors"
              >
                NFTs
              </Link>
              <Link
                href="/wallet"
                className="font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary transition-colors"
              >
                WALLET
              </Link>
            </div>
          </div>
        </header>

        {/* Connection Warning */}
        {!wallet && (
          <div className="mb-6 p-4 bg-pixel-bg-medium border-4 border-pixel-warning text-center">
            <p className="font-pixel text-[9px] text-pixel-warning uppercase mb-2">
              Wallet Not Connected
            </p>
            <p className="font-pixel-body text-sm text-pixel-text-muted mb-4">
              Connect your wallet to start earning $BABY tokens
            </p>
            <Link
              href="/wallet"
              className="inline-block font-pixel text-[8px] uppercase px-4 py-2 bg-pixel-primary text-pixel-text-dark border-4 border-black shadow-[4px_4px_0_0_#000]"
            >
              Connect Wallet
            </Link>
          </div>
        )}

        {/* Mining Visualization */}
        <div className="bg-pixel-bg-medium border-4 border-pixel-border p-6 mb-6 shadow-[8px_8px_0_0_#000]">
          <div className="flex flex-col items-center">
            {/* Mining Icon */}
            <div className="relative w-24 h-24 mb-4">
              <div
                className={`w-full h-full flex items-center justify-center text-5xl ${
                  isRunning && !isPaused ? "animate-bounce" : ""
                }`}
              >
                ⛏️
              </div>
              {isRunning && !isPaused && (
                <div className="absolute inset-0 animate-ping rounded-full border-2 border-pixel-success opacity-50" />
              )}
            </div>

            {/* Hashrate Display */}
            <div className="text-center mb-6">
              <div className="font-pixel text-3xl text-pixel-primary mb-1">
                {formatHashrate(effectiveHashrate)}
              </div>
              {nftBoost > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <span className="font-pixel text-[8px] text-pixel-text-muted">
                    Base: {formatHashrate(hashrate)}
                  </span>
                  <span className="font-pixel text-[8px] text-pixel-success">
                    +{nftBoost}% NFT Boost
                  </span>
                </div>
              )}
              <div className="font-pixel text-[8px] text-pixel-text-muted mt-2 uppercase">
                {minerType === "webgpu" ? "WebGPU Mining" : "CPU Mining"}
                {capabilities?.webgpu && minerType === "cpu" && (
                  <span className="text-pixel-secondary ml-2">
                    (WebGPU Available)
                  </span>
                )}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3">
              {!isRunning ? (
                <button
                  onClick={() => start()}
                  disabled={!wallet}
                  className="px-8 py-3 font-pixel text-sm uppercase bg-pixel-success text-black border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Mining
                </button>
              ) : (
                <>
                  <button
                    onClick={isPaused ? resume : pause}
                    className="px-6 py-3 font-pixel text-[10px] uppercase bg-pixel-secondary text-black border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all"
                  >
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                  <button
                    onClick={stop}
                    className="px-6 py-3 font-pixel text-[10px] uppercase bg-pixel-error text-white border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all"
                  >
                    Stop
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Uptime */}
          <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4">
            <div className="font-pixel text-[7px] text-pixel-text-muted uppercase mb-2">
              Uptime
            </div>
            <div className="font-pixel text-lg text-pixel-text">
              {formatTime(uptime)}
            </div>
          </div>

          {/* Total Hashes */}
          <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4">
            <div className="font-pixel text-[7px] text-pixel-text-muted uppercase mb-2">
              Total Hashes
            </div>
            <div className="font-pixel text-lg text-pixel-text">
              {totalHashes.toLocaleString()}
            </div>
          </div>

          {/* Shares Found */}
          <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4">
            <div className="font-pixel text-[7px] text-pixel-text-muted uppercase mb-2">
              Shares Found
            </div>
            <div className="font-pixel text-lg text-pixel-success">
              {shares}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4">
            <div className="font-pixel text-[7px] text-pixel-text-muted uppercase mb-2">
              Difficulty
            </div>
            <div className="font-pixel text-lg text-pixel-secondary">
              {difficulty}
            </div>
          </div>
        </div>

        {/* NFT Boost Panel */}
        <div className="bg-pixel-bg-medium border-4 border-pixel-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-pixel text-[10px] text-pixel-secondary uppercase">
              Genesis Baby Boost
            </h2>
            <Link
              href="/nfts"
              className="font-pixel text-[8px] text-pixel-primary hover:text-pixel-secondary"
            >
              View NFTs →
            </Link>
          </div>

          {totalNFTs > 0 ? (
            <div className="flex items-center gap-6">
              <div>
                <div className="font-pixel text-2xl text-pixel-success">
                  +{bestBoost}%
                </div>
                <div className="font-pixel text-[8px] text-pixel-text-muted">
                  Mining Boost
                </div>
              </div>
              <div className="h-12 w-px bg-pixel-border" />
              <div>
                <div className="font-pixel text-2xl text-pixel-primary">
                  {totalNFTs}
                </div>
                <div className="font-pixel text-[8px] text-pixel-text-muted">
                  NFT{totalNFTs !== 1 ? "s" : ""} Owned
                </div>
              </div>
              <div className="h-12 w-px bg-pixel-border" />
              <div>
                <div className="font-pixel text-2xl text-pixel-text">
                  {boostMultiplier.toFixed(2)}x
                </div>
                <div className="font-pixel text-[8px] text-pixel-text-muted">
                  Multiplier
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="font-pixel text-[9px] text-pixel-text-muted mb-3">
                Get Genesis Baby NFTs for mining boosts!
              </p>
              <Link
                href="/nfts"
                className="inline-block font-pixel text-[8px] uppercase px-4 py-2 bg-pixel-primary text-pixel-text-dark border-4 border-black shadow-[4px_4px_0_0_#000]"
              >
                Mint Baby
              </Link>
            </div>
          )}
        </div>

        {/* Device Capabilities */}
        {capabilities && (
          <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4">
            <h3 className="font-pixel text-[8px] text-pixel-text-muted uppercase mb-3">
              Device Capabilities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-2">
                <div
                  className={`font-pixel text-[10px] ${capabilities.webgpu ? "text-pixel-success" : "text-pixel-text-muted"}`}
                >
                  {capabilities.webgpu ? "✓" : "✗"} WebGPU
                </div>
              </div>
              <div className="p-2">
                <div
                  className={`font-pixel text-[10px] ${capabilities.workers ? "text-pixel-success" : "text-pixel-text-muted"}`}
                >
                  {capabilities.workers ? "✓" : "✗"} Workers
                </div>
              </div>
              <div className="p-2">
                <div
                  className={`font-pixel text-[10px] ${capabilities.webgl ? "text-pixel-success" : "text-pixel-text-muted"}`}
                >
                  {capabilities.webgl ? "✓" : "✗"} WebGL
                </div>
              </div>
              <div className="p-2">
                <div className="font-pixel text-[10px] text-pixel-text">
                  {capabilities.cores} Cores
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="font-pixel text-[7px] text-pixel-text-muted uppercase">
            Mining powered by BitcoinBaby PoUW Protocol
          </p>
        </footer>
      </div>
    </main>
  );
}
