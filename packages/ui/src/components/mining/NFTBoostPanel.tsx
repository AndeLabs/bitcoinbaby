"use client";

/**
 * NFTBoostPanel - NFT mining boost display
 *
 * Shows NFT boost information in various layouts.
 * Used in MiningSection for detailed boost info.
 */

import { clsx } from "clsx";

export interface NFTBoostPanelProps {
  /** Best boost from NFTs (e.g., 1.15 = 15% boost) */
  bestBoost: number;
  /** Total number of baby NFTs owned */
  totalNFTs: number;
  /** Current boost multiplier being applied */
  boostMultiplier: number;
  /** Display variant */
  variant?: "badge" | "panel" | "compact";
  /** Click handler (e.g., navigate to NFTs tab) */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format boost as percentage
 */
function formatBoost(boost: number): string {
  const percentage = (boost - 1) * 100;
  if (percentage === 0) return "0%";
  return `+${percentage.toFixed(0)}%`;
}

/**
 * Get boost tier color
 */
function getBoostColor(boost: number): string {
  if (boost >= 1.5) return "text-pixel-warning"; // Legendary+
  if (boost >= 1.3) return "text-purple-400"; // Epic
  if (boost >= 1.2) return "text-pixel-secondary"; // Rare
  if (boost >= 1.1) return "text-pixel-success"; // Uncommon
  return "text-pixel-text-muted"; // Common/None
}

/**
 * Get boost tier name
 */
function getBoostTier(boost: number): string {
  if (boost >= 1.5) return "LEGENDARY";
  if (boost >= 1.3) return "EPIC";
  if (boost >= 1.2) return "RARE";
  if (boost >= 1.1) return "UNCOMMON";
  if (boost > 1) return "COMMON";
  return "NONE";
}

export function NFTBoostPanel({
  bestBoost,
  totalNFTs,
  boostMultiplier,
  variant = "panel",
  onClick,
  className,
}: NFTBoostPanelProps) {
  const hasBoost = boostMultiplier > 1;
  const boostColor = getBoostColor(boostMultiplier);
  const boostTier = getBoostTier(boostMultiplier);

  // Badge variant - minimal inline display
  if (variant === "badge") {
    return (
      <button
        onClick={onClick}
        disabled={!onClick}
        className={clsx(
          "inline-flex items-center gap-2",
          "px-2 py-1",
          "border-2 border-black",
          hasBoost ? "bg-pixel-primary/20" : "bg-pixel-bg-light",
          onClick && "cursor-pointer hover:bg-pixel-bg-medium",
          className,
        )}
        type="button"
      >
        <span className="font-pixel text-[8px] text-pixel-text-muted">
          NFT:
        </span>
        <span className={clsx("font-pixel text-[10px]", boostColor)}>
          {formatBoost(boostMultiplier)}
        </span>
      </button>
    );
  }

  // Compact variant - one line display
  if (variant === "compact") {
    return (
      <div
        className={clsx("flex items-center justify-between gap-4", className)}
      >
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[8px] text-pixel-text-muted uppercase">
            NFT Boost:
          </span>
          <span className={clsx("font-pixel text-[10px]", boostColor)}>
            {formatBoost(boostMultiplier)}
          </span>
        </div>
        {totalNFTs > 0 && (
          <span className="font-pixel text-[8px] text-pixel-text-muted">
            {totalNFTs} NFT{totalNFTs !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    );
  }

  // Panel variant - full display
  return (
    <div
      className={clsx(
        "border-4 border-black",
        "bg-pixel-bg-dark",
        "shadow-[4px_4px_0_0_#000]",
        className,
      )}
      role="region"
      aria-label="NFT mining boost"
    >
      {/* Header */}
      <div
        className={clsx(
          "px-3 py-2",
          "border-b-2 border-black",
          hasBoost ? "bg-pixel-primary/30" : "bg-pixel-bg-light",
        )}
      >
        <h3 className="font-pixel text-[10px] text-pixel-text uppercase">
          NFT Mining Boost
        </h3>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Main boost display */}
        <div className="text-center">
          <div
            className={clsx(
              "font-pixel text-2xl",
              hasBoost ? boostColor : "text-pixel-text-muted",
            )}
          >
            {boostMultiplier.toFixed(2)}x
          </div>
          <div
            className={clsx(
              "font-pixel text-[8px] mt-1",
              hasBoost ? boostColor : "text-pixel-text-muted",
            )}
          >
            {boostTier}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Best Boost */}
          <div
            className={clsx(
              "p-2",
              "border-2 border-black",
              "bg-pixel-bg-light",
            )}
          >
            <div className="font-pixel text-[6px] text-pixel-text-muted uppercase">
              Best Boost
            </div>
            <div
              className={clsx(
                "font-pixel text-[10px]",
                getBoostColor(bestBoost),
              )}
            >
              {formatBoost(bestBoost)}
            </div>
          </div>

          {/* Total NFTs */}
          <div
            className={clsx(
              "p-2",
              "border-2 border-black",
              "bg-pixel-bg-light",
            )}
          >
            <div className="font-pixel text-[6px] text-pixel-text-muted uppercase">
              Baby NFTs
            </div>
            <div className="font-pixel text-[10px] text-pixel-text">
              {totalNFTs}
            </div>
          </div>
        </div>

        {/* No NFT hint */}
        {totalNFTs === 0 && (
          <div
            className={clsx(
              "p-2",
              "border-2 border-dashed border-pixel-text-muted",
              "text-center",
            )}
          >
            <span className="font-pixel text-[8px] text-pixel-text-muted">
              Mint Baby NFTs to boost mining!
            </span>
          </div>
        )}

        {/* View NFTs button */}
        {onClick && (
          <button
            onClick={onClick}
            className={clsx(
              "w-full",
              "px-3 py-2",
              "border-2 border-black",
              "bg-pixel-secondary hover:bg-pixel-secondary-dark",
              "font-pixel text-[8px] text-pixel-text-dark uppercase",
              "transition-colors",
            )}
            type="button"
          >
            View NFTs
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * NFTBoostBadge - Minimal inline boost indicator
 */
export function NFTBoostBadge({
  boost,
  className,
}: {
  boost: number;
  className?: string;
}) {
  if (boost <= 1) return null;

  return (
    <span
      className={clsx(
        "inline-flex items-center",
        "px-1.5 py-0.5",
        "font-pixel text-[8px]",
        "border-2 border-black",
        "bg-pixel-primary text-pixel-text-dark",
        className,
      )}
    >
      {boost.toFixed(2)}x
    </span>
  );
}
