"use client";

/**
 * MiningSection - Full mining dashboard
 *
 * Complete mining interface with:
 * - Mining visualization
 * - Controls (start/stop/pause)
 * - Stats grid
 * - NFT boost panel
 * - Device capabilities
 * - V10 blockchain submission for rewards
 */

import { useState, useEffect, useCallback } from "react";
import {
  useMiningWithNFTs,
  useMiningSubmitter,
  useVirtualBalance,
} from "@/hooks";
import {
  useWalletStore,
  useNFTStore,
  formatHashrate,
  formatTime,
  type MiningResult,
} from "@bitcoinbaby/core";

export function MiningSection() {
  const wallet = useWalletStore((s) => s.wallet);
  const { bestBoost, totalNFTs } = useNFTStore();
  const [uptime, setUptime] = useState(0);
  const [lastSubmittedShare, setLastSubmittedShare] = useState<string | null>(
    null,
  );

  // Virtual balance from Workers API (primary balance tracking)
  const { virtualBalance, totalMined, creditMining } = useVirtualBalance({
    address: wallet?.address,
  });

  // Mining submitter for blockchain submission (optional, requires BTC for fees)
  const {
    canMine,
    balance,
    confirmedRewards,
    isSubmitting,
    error: submitterError,
    submitProof,
    calculateReward,
  } = useMiningSubmitter();

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
    lastShare,
  } = useMiningWithNFTs({
    difficulty: 16,
    minerAddress: wallet?.address || "",
    autoStart: false,
  });

  // Auto-submit shares when found
  const handleShareFound = useCallback(
    async (share: MiningResult) => {
      if (lastSubmittedShare === share.hash) return; // Prevent double submission

      setLastSubmittedShare(share.hash);

      // Calculate reward for this share
      const reward = calculateReward(share.difficulty);

      // Always credit to virtual balance (free, no BTC needed)
      try {
        console.log(
          "[Mining] Crediting share to virtual balance:",
          share.hash.slice(0, 16),
        );
        const creditResult = await creditMining({
          hash: share.hash,
          nonce: share.nonce,
          difficulty: share.difficulty,
          blockData: share.blockData || "",
          reward,
        });

        if (creditResult.success) {
          console.log(
            "[Mining] Credited to virtual balance:",
            creditResult.credited,
          );
        } else {
          console.warn(
            "[Mining] Virtual balance credit failed:",
            creditResult.error,
          );
        }
      } catch (err) {
        console.error("[Mining] Virtual balance credit error:", err);
      }

      // Optionally submit to blockchain (requires BTC for fees)
      if (canMine && !isSubmitting) {
        try {
          console.log(
            "[Mining] Submitting share to blockchain:",
            share.hash.slice(0, 16),
          );
          const result = await submitProof({
            hash: share.hash,
            nonce: share.nonce,
            difficulty: share.difficulty,
            timestamp: share.timestamp,
            blockData: share.blockData || "",
          });

          if (result.success && result.txid) {
            console.log(
              "[Mining] Share submitted to blockchain! TX:",
              result.txid,
            );
          }
        } catch (err) {
          console.error("[Mining] Blockchain submission failed:", err);
        }
      }
    },
    [
      canMine,
      isSubmitting,
      lastSubmittedShare,
      submitProof,
      creditMining,
      calculateReward,
    ],
  );

  // Submit share when found
  useEffect(() => {
    if (lastShare && lastShare.hash !== lastSubmittedShare) {
      handleShareFound(lastShare);
    }
  }, [lastShare, lastSubmittedShare, handleShareFound]);

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

        {/* Balance Warning */}
        {wallet && !canMine && (
          <div className="mb-6 p-4 bg-pixel-bg-medium border-4 border-pixel-error text-center">
            <p className="font-pixel text-[9px] text-pixel-error uppercase mb-2">
              Insufficient Balance
            </p>
            <p className="font-pixel-body text-sm text-pixel-text-muted mb-2">
              Need at least 7,000 sats for mining transactions
            </p>
            <p className="font-pixel text-[10px] text-pixel-text">
              Current: {balance.toLocaleString()} sats
            </p>
          </div>
        )}

        {/* Rewards Panel */}
        {wallet && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Virtual Balance (Primary) */}
            <div className="bg-pixel-bg-medium border-4 border-pixel-success p-4">
              <div className="font-pixel text-[7px] text-pixel-text-muted uppercase mb-2">
                $BABY Balance
              </div>
              <div className="font-pixel text-lg text-pixel-success">
                {virtualBalance.toLocaleString()}
              </div>
              <div className="font-pixel text-[8px] text-pixel-text-muted">
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

            {/* tBTC Balance */}
            <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4">
              <div className="font-pixel text-[7px] text-pixel-text-muted uppercase mb-2">
                tBTC Balance
              </div>
              <div className="font-pixel text-lg text-pixel-primary">
                {(balance / 100_000_000).toFixed(8)}
              </div>
              <div className="font-pixel text-[8px] text-pixel-text-muted">
                {balance.toLocaleString()} sats
              </div>
            </div>

            {/* On-Chain Rewards */}
            <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4">
              <div className="font-pixel text-[7px] text-pixel-text-muted uppercase mb-2">
                On-Chain $BABY
              </div>
              <div className="font-pixel text-lg text-pixel-warning">
                {confirmedRewards.toString()}
              </div>
              <div className="font-pixel text-[8px] text-pixel-text-muted">
                {isSubmitting ? "Submitting..." : "Withdrawn to Bitcoin"}
              </div>
            </div>
          </div>
        )}

        {/* Submitter Error */}
        {submitterError && (
          <div className="mb-6 p-3 bg-pixel-bg-medium border-4 border-pixel-error">
            <p className="font-pixel text-[8px] text-pixel-error">
              {submitterError}
            </p>
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
            <span className="font-pixel text-[8px] text-pixel-primary">
              View in NFTs tab
            </span>
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
              <p className="font-pixel text-[8px] text-pixel-primary">
                Go to NFTs tab to mint
              </p>
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
      </div>
    </div>
  );
}

export default MiningSection;
