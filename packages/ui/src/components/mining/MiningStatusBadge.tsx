"use client";

/**
 * MiningStatusBadge - Compact mining indicator
 *
 * Shows mining status, hashrate, and shares in a compact badge.
 * Used in BabySection to show mining status without full controls.
 */

import { clsx } from "clsx";

export interface MiningStatusBadgeProps {
  /** Whether mining is currently running */
  isRunning: boolean;
  /** Current hashrate in H/s */
  hashrate: number;
  /** Total shares found */
  shares: number;
  /** NFT boost multiplier (1.0 = no boost) */
  nftBoost?: number;
  /** Click handler (e.g., navigate to Mining tab) */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format hashrate for display
 */
function formatHashrate(hashrate: number): string {
  if (hashrate >= 1_000_000) {
    return `${(hashrate / 1_000_000).toFixed(2)} MH/s`;
  }
  if (hashrate >= 1_000) {
    return `${(hashrate / 1_000).toFixed(2)} KH/s`;
  }
  return `${Math.round(hashrate)} H/s`;
}

export function MiningStatusBadge({
  isRunning,
  hashrate,
  shares,
  nftBoost = 1,
  onClick,
  className,
}: MiningStatusBadgeProps) {
  const hasBoost = nftBoost > 1;

  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full",
        "border-4 border-black",
        "bg-pixel-bg-medium",
        "shadow-[4px_4px_0_0_#000]",
        "transition-transform active:translate-y-1 active:shadow-[2px_2px_0_0_#000]",
        onClick && "cursor-pointer hover:bg-pixel-bg-light",
        className,
      )}
      type="button"
      aria-label={`Mining status: ${isRunning ? "running" : "stopped"}. Click to view mining dashboard.`}
    >
      {/* Header */}
      <div
        className={clsx(
          "px-3 py-2",
          "border-b-2 border-black",
          "flex items-center justify-between",
          isRunning ? "bg-pixel-success/20" : "bg-pixel-bg-light",
        )}
      >
        <div className="flex items-center gap-2">
          {/* Status indicator */}
          <div
            className={clsx(
              "w-3 h-3 rounded-full",
              isRunning
                ? "bg-pixel-success animate-pulse"
                : "bg-pixel-text-muted",
            )}
            aria-hidden="true"
          />
          <span className="font-pixel text-[10px] text-pixel-text uppercase">
            {isRunning ? "Mining" : "Idle"}
          </span>
        </div>

        {/* NFT Boost Badge */}
        {hasBoost && (
          <span
            className={clsx(
              "px-2 py-0.5",
              "font-pixel text-[8px]",
              "bg-pixel-primary text-pixel-text-dark",
              "border-2 border-black",
            )}
          >
            {nftBoost.toFixed(2)}x
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="p-3 flex items-center justify-between gap-4">
        {/* Hashrate */}
        <div className="text-left">
          <div className="font-pixel text-[6px] text-pixel-text-muted uppercase">
            Hashrate
          </div>
          <div
            className={clsx(
              "font-pixel-mono text-sm",
              isRunning ? "text-pixel-success" : "text-pixel-text-muted",
            )}
          >
            {formatHashrate(hashrate)}
          </div>
        </div>

        {/* Shares */}
        <div className="text-right">
          <div className="font-pixel text-[6px] text-pixel-text-muted uppercase">
            Shares
          </div>
          <div className="font-pixel-mono text-sm text-pixel-secondary">
            {shares.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Footer - Call to action */}
      <div
        className={clsx(
          "px-3 py-2",
          "border-t-2 border-black",
          "bg-pixel-bg-light",
        )}
      >
        <span className="font-pixel text-[8px] text-pixel-primary uppercase">
          View Mining Dashboard &rarr;
        </span>
      </div>
    </button>
  );
}
