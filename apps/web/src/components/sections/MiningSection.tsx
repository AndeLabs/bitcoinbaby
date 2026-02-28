"use client";

/**
 * MiningSection - Full mining dashboard
 *
 * THE single source of truth for all mining operations:
 * - Mining visualization and controls
 * - Balance tracking (virtual + on-chain)
 * - NFT boost display
 * - Device capabilities
 * - Share submission and notifications
 */

import { useState, useEffect } from "react";
import { useMiningWithNFTs, useVirtualBalance } from "@/hooks";
import { useMiningShareSubmission } from "@/hooks/useMiningShareSubmission";
import {
  MiningStatsGrid,
  MiningControlButton,
  NFTBoostPanel,
  AnimatedTokenCounter,
} from "@bitcoinbaby/ui";
import { useWalletStore, useNFTStore, formatHashrate } from "@bitcoinbaby/core";

export function MiningSection() {
  const wallet = useWalletStore((s) => s.wallet);
  const { bestBoost, totalNFTs } = useNFTStore();
  const [uptime, setUptime] = useState(0);

  // Virtual balance from Workers API (primary balance tracking)
  const { virtualBalance, totalMined, onChainBalance } = useVirtualBalance({
    address: wallet?.address,
  });

  // Mining with NFT boost
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

  // Unified share submission (auto-submits shares)
  const {
    submittedShares,
    isSubmitting,
    notifications,
    canSubmitToBlockchain,
    lastSubmission,
  } = useMiningShareSubmission({
    strategy: "virtual-first",
  });

  // Track recent reward for animation
  const recentReward = lastSubmission?.success
    ? lastSubmission.credited
    : undefined;

  // Uptime counter
  useEffect(() => {
    if (!isRunning) {
      const timeout = setTimeout(() => setUptime(0), 0);
      return () => clearTimeout(timeout);
    }

    if (!isPaused) {
      const interval = setInterval(() => {
        setUptime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, isPaused]);

  return (
    <div className="p-4 md:p-8 bg-pixel-bg-dark">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="font-pixel text-xl text-pixel-primary">MINING</h2>
          <p className="font-pixel-body text-sm text-pixel-text-muted mt-1">
            Earn $BABY tokens with Proof of Work
          </p>
        </div>

        {/* Connection Warning */}
        {!wallet && (
          <div className="mb-6 p-4 bg-pixel-bg-medium border-4 border-pixel-warning text-center">
            <p className="font-pixel text-[9px] text-pixel-warning uppercase mb-2">
              Wallet Not Connected
            </p>
            <p className="font-pixel-body text-sm text-pixel-text-muted mb-4">
              Connect your wallet to start earning $BABY tokens
            </p>
            <p className="font-pixel text-[8px] text-pixel-primary">
              Go to Wallet tab to connect
            </p>
          </div>
        )}

        {/* Balance Panel */}
        {wallet && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Virtual Balance (Primary) - Animated Counter */}
            <div className="bg-pixel-bg-medium border-4 border-pixel-success p-4">
              <div className="font-pixel text-[7px] text-pixel-text-muted uppercase mb-2">
                $BABY Balance
              </div>
              <AnimatedTokenCounter
                value={virtualBalance}
                recentReward={recentReward}
                size="lg"
                showParticles={true}
                showGlow={true}
                className="text-pixel-success"
              />
              <div className="font-pixel text-[8px] text-pixel-text-muted mt-1">
                Available to withdraw
              </div>
            </div>

            {/* Total Mined */}
            <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4">
              <div className="font-pixel text-[7px] text-pixel-text-muted uppercase mb-2">
                Total Mined
              </div>
              <div className="font-pixel text-lg text-pixel-primary">
                {totalMined.toLocaleString()}
              </div>
              <div className="font-pixel text-[8px] text-pixel-text-muted">
                All-time earnings
              </div>
            </div>

            {/* Session Shares */}
            <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4">
              <div className="font-pixel text-[7px] text-pixel-text-muted uppercase mb-2">
                Session Shares
              </div>
              <div className="font-pixel text-lg text-pixel-secondary">
                {submittedShares}
              </div>
              <div className="font-pixel text-[8px] text-pixel-text-muted">
                {isSubmitting ? "Submitting..." : "Submitted this session"}
              </div>
            </div>

            {/* On-Chain Balance */}
            <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4">
              <div className="font-pixel text-[7px] text-pixel-text-muted uppercase mb-2">
                On-Chain $BABY
              </div>
              <div className="font-pixel text-lg text-pixel-warning">
                {onChainBalance.toLocaleString()}
              </div>
              <div className="font-pixel text-[8px] text-pixel-text-muted">
                Withdrawn to Bitcoin
              </div>
            </div>
          </div>
        )}

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-4 ${
                  notification.type === "success"
                    ? "border-pixel-success bg-pixel-success/10"
                    : notification.type === "error"
                      ? "border-pixel-error bg-pixel-error/10"
                      : "border-pixel-border bg-pixel-bg-medium"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[9px] text-pixel-text">
                    {notification.title}
                  </span>
                  {notification.reward && (
                    <span className="font-pixel text-[9px] text-pixel-success">
                      +{notification.reward.toString()} $BABY
                    </span>
                  )}
                </div>
                <p className="font-pixel-body text-xs text-pixel-text-muted mt-1">
                  {notification.message}
                </p>
              </div>
            ))}
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
            <MiningControlButton
              isRunning={isRunning}
              isPaused={isPaused}
              onStart={() => start()}
              onStop={stop}
              onPause={pause}
              onResume={resume}
              disabled={!wallet}
              variant="multi-button"
              size="md"
              className="w-full max-w-md"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-6">
          <MiningStatsGrid
            stats={{
              uptime,
              totalHashes,
              shares,
              difficulty,
              hashrate: effectiveHashrate,
              minerType:
                minerType === "webgpu"
                  ? "WebGPU"
                  : `CPU (${capabilities?.cores || "?"} cores)`,
            }}
            variant="grid"
            className="bg-pixel-bg-medium border-4 border-pixel-border p-4"
          />
        </div>

        {/* NFT Boost Panel */}
        <div className="mb-6">
          <NFTBoostPanel
            bestBoost={bestBoost / 100 + 1}
            totalNFTs={totalNFTs}
            boostMultiplier={boostMultiplier}
            variant="panel"
          />
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

            {/* Blockchain Submission Status */}
            <div className="mt-4 pt-4 border-t-2 border-pixel-border">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    canSubmitToBlockchain
                      ? "bg-pixel-success"
                      : "bg-pixel-text-muted"
                  }`}
                />
                <span className="font-pixel text-[8px] text-pixel-text-muted">
                  {canSubmitToBlockchain
                    ? "Blockchain submission ready (has BTC for fees)"
                    : "Virtual-only mode (no BTC for fees)"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MiningSection;
