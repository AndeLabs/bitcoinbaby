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

import { useState, useEffect, useRef, useMemo } from "react";
import { useMiningWithNFTs, useVirtualBalance } from "@/hooks";
import { useMiningShareSubmission } from "@/hooks/useMiningShareSubmission";
import { WithdrawButton } from "@/components/withdraw";
import {
  MiningStatsGrid,
  MiningControlButton,
  NFTBoostPanel,
  AnimatedTokenCounter,
  HelpTooltip,
  EngagementBonusPanel,
} from "@bitcoinbaby/ui";
import {
  useWalletStore,
  useNFTStore,
  formatHashrate,
  MIN_DIFFICULTY,
  useEngagement,
} from "@bitcoinbaby/core";

// Throttle hook for smoother updates
function useThrottledValue<T>(value: T, delay: number): T {
  const [throttled, setThrottled] = useState(value);
  const lastUpdate = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdate.current >= delay) {
      setThrottled(value);
      lastUpdate.current = now;
    } else {
      const timeout = setTimeout(
        () => {
          setThrottled(value);
          lastUpdate.current = Date.now();
        },
        delay - (now - lastUpdate.current),
      );
      return () => clearTimeout(timeout);
    }
  }, [value, delay]);

  return throttled;
}

export function MiningSection() {
  const wallet = useWalletStore((s) => s.wallet);
  const { bestBoost, totalNFTs } = useNFTStore();
  const [uptime, setUptime] = useState(0);

  // Virtual balance from Workers API (primary balance tracking)
  const {
    virtualBalance,
    totalMined,
    onChainBalance,
    isLoading: virtualBalanceLoading,
    error: virtualBalanceError,
    workersApiAvailable,
  } = useVirtualBalance({
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
    difficulty: MIN_DIFFICULTY, // D22 required by server
    minerAddress: wallet?.address || "",
    autoStart: false,
  });

  // Unified share submission (auto-submits shares)
  const {
    sessionShares,
    submittedShares,
    pendingShares,
    isSubmitting,
    notifications,
    canSubmitToBlockchain,
    lastSubmission,
    getSyncState,
    resetAndSync,
  } = useMiningShareSubmission({
    strategy: "virtual-first",
  });

  // Sync debug state
  const [showSyncDebug, setShowSyncDebug] = useState(false);
  const [syncState, setSyncState] = useState<ReturnType<
    typeof getSyncState
  > | null>(null);

  // Update sync state periodically when debug is visible
  useEffect(() => {
    if (!showSyncDebug) return;
    const update = () => setSyncState(getSyncState());
    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, [showSyncDebug, getSyncState]);

  // Track recent reward for animation
  const recentReward = lastSubmission?.success
    ? lastSubmission.credited
    : undefined;

  // Engagement tracking for bonus multipliers
  const { multiplier: engagementResult, state: engagementState } =
    useEngagement();

  // Throttle rapidly changing values for smoother UX (prevents scroll issues)
  const displayHashrate = useThrottledValue(hashrate, 500);
  const displayEffectiveHashrate = useThrottledValue(effectiveHashrate, 500);
  const displayHashes = useThrottledValue(totalHashes, 500);
  const displayShares = useThrottledValue(shares, 1000);

  // Limit notifications to prevent layout shifts (max 2, only most recent)
  const displayNotifications = useMemo(
    () => notifications.slice(0, 2),
    [notifications],
  );

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
        <div className="mb-6">
          <h2 className="font-pixel text-xl text-pixel-primary">MINING</h2>
          <p className="font-pixel-body text-sm text-pixel-text-muted mt-1">
            Earn $BABY tokens with Proof of Useful Work
          </p>
        </div>

        {/* PoUW Info Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-pixel-primary/10 to-pixel-secondary/10 border-4 border-pixel-primary/50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h3 className="font-pixel text-[10px] text-pixel-primary uppercase mb-1">
                Proof of Useful Work
              </h3>
              <p className="font-pixel-body text-xs text-pixel-text leading-relaxed">
                Your computing power is not wasted on meaningless algorithms. We
                are building a system where mining energy{" "}
                <span className="text-pixel-secondary font-semibold">
                  trains artificial intelligence
                </span>
                . Every hash contributes to a collective AI model.
              </p>
              <p className="font-pixel text-[8px] text-pixel-text-muted mt-2">
                Current phase: Traditional mining | Next phase: AI Training
              </p>
            </div>
          </div>
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

        {/* Virtual Balance Error Alert */}
        {virtualBalanceError && (
          <div className="mb-4 p-3 bg-pixel-error/20 border-4 border-pixel-error">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-sm text-pixel-error">⚠</span>
              <div>
                <p className="font-pixel text-[9px] text-pixel-error uppercase">
                  Balance Sync Error
                </p>
                <p className="font-pixel-body text-xs text-pixel-text-muted mt-1">
                  {virtualBalanceError}. Mining rewards are still being tracked
                  locally.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Workers API Warning */}
        {wallet && !workersApiAvailable && !virtualBalanceLoading && (
          <div className="mb-4 p-3 bg-pixel-warning/20 border-4 border-pixel-warning">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-sm text-pixel-warning">⚠</span>
              <div>
                <p className="font-pixel text-[9px] text-pixel-warning uppercase">
                  Offline Mode
                </p>
                <p className="font-pixel-body text-xs text-pixel-text-muted mt-1">
                  Cannot connect to balance server. Mining locally only.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Balance Panel */}
        {wallet && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Virtual Balance (Primary) - Animated Counter */}
            <div
              className={`bg-pixel-bg-medium border-4 p-4 ${virtualBalanceError ? "border-pixel-warning" : "border-pixel-success"}`}
            >
              <div className="flex items-center gap-1 mb-2">
                <span className="font-pixel text-[7px] text-pixel-text-muted uppercase">
                  $BABY Balance
                </span>
                <HelpTooltip
                  content="Tokens earned from mining, stored in your virtual account. You can withdraw these to your Bitcoin wallet anytime."
                  title="Virtual Balance"
                  size="sm"
                />
              </div>
              {virtualBalanceLoading ? (
                <div className="font-pixel text-lg text-pixel-text-muted animate-pulse">
                  ---
                </div>
              ) : (
                <AnimatedTokenCounter
                  value={virtualBalance}
                  recentReward={recentReward}
                  size="lg"
                  showParticles={true}
                  showGlow={true}
                  className={
                    virtualBalanceError
                      ? "text-pixel-warning"
                      : "text-pixel-success"
                  }
                />
              )}
              <div className="font-pixel text-[8px] text-pixel-text-muted mt-1">
                {virtualBalanceError
                  ? "Last known balance"
                  : "Available to withdraw"}
              </div>
            </div>

            {/* Total Mined */}
            <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4">
              <div className="flex items-center gap-1 mb-2">
                <span className="font-pixel text-[7px] text-pixel-text-muted uppercase">
                  Total Mined
                </span>
                <HelpTooltip
                  content="All $BABY tokens you've ever earned from mining. This includes both withdrawn and available balance."
                  title="Lifetime Earnings"
                  size="sm"
                />
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
              <div className="flex items-center gap-1 mb-2">
                <span className="font-pixel text-[7px] text-pixel-text-muted uppercase">
                  Session Shares
                </span>
                <HelpTooltip
                  content="Valid mining proofs found this session. Each share earns you $BABY tokens based on difficulty."
                  title="Mining Shares"
                  size="sm"
                />
              </div>
              <div className="font-pixel text-lg text-pixel-secondary">
                {sessionShares}
              </div>
              <button
                onClick={() => setShowSyncDebug(!showSyncDebug)}
                className="font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary cursor-pointer underline"
              >
                {isSubmitting
                  ? "Syncing..."
                  : pendingShares > 0
                    ? `${pendingShares.toLocaleString()} pending sync`
                    : `${submittedShares} synced`}
              </button>

              {/* Sync Debug Panel */}
              {showSyncDebug && syncState && (
                <div className="mt-3 p-2 bg-pixel-bg-dark/50 rounded text-[8px] space-y-1">
                  <div className="flex justify-between">
                    <span>Online:</span>
                    <span
                      className={
                        syncState.isOnline ? "text-green-400" : "text-red-400"
                      }
                    >
                      {syncState.isOnline ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Health:</span>
                    <span
                      className={
                        syncState.apiHealthy ? "text-green-400" : "text-red-400"
                      }
                    >
                      {syncState.apiHealthy ? "OK" : "Down"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Circuit Breaker:</span>
                    <span
                      className={
                        syncState.circuitBreakerActive
                          ? "text-red-400"
                          : "text-green-400"
                      }
                    >
                      {syncState.circuitBreakerActive ? "ACTIVE" : "OK"}
                    </span>
                  </div>
                  {syncState.circuitBreakerActive && (
                    <div className="text-yellow-400">
                      Resets in:{" "}
                      {Math.ceil(
                        (syncState.circuitBreakerUntil - Date.now()) / 1000,
                      )}
                      s
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Failures:</span>
                    <span>{syncState.consecutiveFailures}</span>
                  </div>
                  <button
                    onClick={() => {
                      resetAndSync();
                      setTimeout(() => setSyncState(getSyncState()), 500);
                    }}
                    className="w-full mt-2 py-1 bg-pixel-primary text-black font-pixel text-[8px] rounded"
                  >
                    FORCE SYNC
                  </button>
                </div>
              )}
            </div>

            {/* On-Chain Balance */}
            <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4">
              <div className="flex items-center gap-1 mb-2">
                <span className="font-pixel text-[7px] text-pixel-text-muted uppercase">
                  On-Chain $BABY
                </span>
                <HelpTooltip
                  content="Tokens you've withdrawn to your Bitcoin wallet. These are stored on the blockchain as Charms tokens."
                  title="On-Chain Balance"
                  size="sm"
                />
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

        {/* Withdraw Button - Shows when user has virtual balance */}
        {wallet && virtualBalance > 0n && (
          <div className="mb-6 flex justify-center">
            <WithdrawButton
              virtualBalance={virtualBalance}
              isLoading={virtualBalanceLoading}
              size="md"
              showBalance={true}
            />
          </div>
        )}

        {/* Recent Notifications - Fixed height to prevent layout shifts */}
        <div className="mb-6 min-h-[80px] overflow-hidden">
          {displayNotifications.length > 0 ? (
            <div className="space-y-2">
              {displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-4 transition-opacity duration-300 ${
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
          ) : (
            <div className="h-[80px] flex items-center justify-center">
              <span className="font-pixel text-[8px] text-pixel-text-muted">
                Mining activity will appear here
              </span>
            </div>
          )}
        </div>

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
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="font-pixel text-3xl text-pixel-primary">
                  {formatHashrate(displayEffectiveHashrate)}
                </span>
                <HelpTooltip
                  content="Hashes per second your device is calculating. Higher hashrate = more chances to find valid shares and earn $BABY."
                  title="Hashrate"
                  description="With NFT boost applied. Base hashrate depends on your device capabilities."
                  size="md"
                />
              </div>
              {nftBoost > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <span className="font-pixel text-[8px] text-pixel-text-muted">
                    Base: {formatHashrate(displayHashrate)}
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
              totalHashes: displayHashes,
              shares: displayShares,
              difficulty,
              hashrate: displayEffectiveHashrate,
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

        {/* Engagement Bonus Panel */}
        <div className="mb-6">
          <EngagementBonusPanel
            multiplier={engagementResult.multiplier}
            breakdown={engagementResult.breakdown}
            status={engagementResult.status}
            streakDays={engagementState.dailyStreak}
            playTimeMinutes={engagementState.playTimeToday}
            babyHealth={engagementState.babyHealthScore}
          />
        </div>

        {/* Device Capabilities */}
        {capabilities && (
          <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-pixel text-[8px] text-pixel-text-muted uppercase">
                Device Capabilities
              </h3>
              <HelpTooltip
                content="Your device's mining capabilities. WebGPU provides fastest mining, Web Workers enable parallel processing."
                title="Mining Hardware"
                description="Green checkmarks indicate available features. More features = better mining performance."
                size="sm"
              />
            </div>
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
                <HelpTooltip
                  content={
                    canSubmitToBlockchain
                      ? "Your mining proofs can be submitted directly to Bitcoin. You have enough BTC to pay for transaction fees."
                      : "Mining rewards are stored in your virtual balance. To submit proofs on-chain, you need tBTC for transaction fees."
                  }
                  title="Submission Mode"
                  size="sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MiningSection;
