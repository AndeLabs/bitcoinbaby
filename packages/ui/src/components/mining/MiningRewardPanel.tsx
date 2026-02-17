"use client";

/**
 * MiningRewardPanel - Panel de rewards de mineria
 *
 * Muestra rewards pendientes, confirmados, y estado de transacciones.
 * Se conecta con useMiningSubmitter para tracking real.
 */

import { clsx } from "clsx";

interface Submission {
  id: string;
  hash: string;
  reward: bigint;
  status: "pending" | "submitted" | "confirmed" | "failed" | "expired";
  txid?: string;
  confirmedAt?: number;
}

interface MiningRewardPanelProps {
  /** Whether miner can mine (has sufficient balance) */
  canMine: boolean;
  /** Miner's BTC balance in sats */
  btcBalance: number;
  /** Pending rewards total */
  pendingRewards: bigint;
  /** Confirmed rewards total */
  confirmedRewards: bigint;
  /** Recent submissions */
  submissions: Submission[];
  /** Fee estimates */
  feeEstimates?: {
    fast: number;
    medium: number;
    slow: number;
    charmsFee: number;
  };
  /** Loading state */
  isLoading?: boolean;
  /** Submitting state */
  isSubmitting?: boolean;
  /** Error message */
  error?: string | null;
  /** Current network */
  network?: "mainnet" | "testnet4";
  /** Explorer URL getter */
  getTxUrl?: (txid: string) => string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format token amount for display
 */
function formatTokens(amount: bigint): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format sats to display
 */
function formatSats(sats: number): string {
  if (sats >= 100_000_000) {
    return `${(sats / 100_000_000).toFixed(4)} BTC`;
  }
  return `${sats.toLocaleString()} sats`;
}

/**
 * Format hash for display
 */
function formatHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

export function MiningRewardPanel({
  canMine,
  btcBalance,
  pendingRewards,
  confirmedRewards,
  submissions,
  feeEstimates,
  isLoading = false,
  isSubmitting = false,
  error,
  network = "testnet4",
  getTxUrl,
  className,
}: MiningRewardPanelProps) {
  const totalRewards = pendingRewards + confirmedRewards;

  return (
    <div
      className={clsx(
        "border-4 border-black",
        "bg-pixel-bg-dark",
        "shadow-[4px_4px_0_0_#000]",
        className,
      )}
    >
      {/* Header */}
      <div
        className={clsx(
          "px-3 py-2",
          "border-b-2 border-black",
          "bg-pixel-primary",
        )}
      >
        <h3 className="font-pixel text-[10px] text-pixel-text-dark uppercase">
          Mining Rewards
        </h3>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Mining Status */}
        <div
          className={clsx(
            "flex items-center gap-2 p-2",
            "border-2 border-black",
            canMine ? "bg-pixel-success/20" : "bg-pixel-error/20",
          )}
        >
          <div
            className={clsx(
              "w-3 h-3 rounded-full",
              canMine ? "bg-pixel-success animate-pulse" : "bg-pixel-error",
            )}
          />
          <span className="font-pixel text-[8px] text-pixel-text">
            {canMine ? "READY TO MINE" : "NEED FUNDS"}
          </span>
        </div>

        {/* Balance */}
        <div className="space-y-1">
          <div className="font-pixel text-[8px] text-pixel-text-muted uppercase">
            Your Balance
          </div>
          <div className="font-pixel text-xs text-pixel-primary">
            {formatSats(btcBalance)}
          </div>
        </div>

        {/* Rewards Summary */}
        <div className="grid grid-cols-2 gap-2">
          {/* Pending */}
          <div
            className={clsx(
              "p-2",
              "border-2 border-black",
              "bg-pixel-bg-light",
            )}
          >
            <div className="font-pixel text-[6px] text-pixel-text-muted uppercase">
              Pending
            </div>
            <div className="font-pixel text-[10px] text-pixel-secondary">
              {formatTokens(pendingRewards)}
            </div>
          </div>

          {/* Confirmed */}
          <div
            className={clsx(
              "p-2",
              "border-2 border-black",
              "bg-pixel-bg-light",
            )}
          >
            <div className="font-pixel text-[6px] text-pixel-text-muted uppercase">
              Confirmed
            </div>
            <div className="font-pixel text-[10px] text-pixel-success">
              {formatTokens(confirmedRewards)}
            </div>
          </div>
        </div>

        {/* Total */}
        <div
          className={clsx(
            "p-2",
            "border-2 border-black",
            "bg-pixel-primary/20",
          )}
        >
          <div className="font-pixel text-[6px] text-pixel-text-muted uppercase">
            Total $BABY
          </div>
          <div className="font-pixel text-sm text-pixel-primary">
            {formatTokens(totalRewards)}
          </div>
        </div>

        {/* Fee Estimates */}
        {feeEstimates && (
          <div className="space-y-1">
            <div className="font-pixel text-[8px] text-pixel-text-muted uppercase">
              Network Fees
            </div>
            <div className="flex gap-2 text-[8px] font-pixel">
              <span className="text-pixel-success">
                Slow: {feeEstimates.slow} sat/vB
              </span>
              <span className="text-pixel-secondary">
                Med: {feeEstimates.medium}
              </span>
              <span className="text-pixel-error">
                Fast: {feeEstimates.fast}
              </span>
            </div>
          </div>
        )}

        {/* Recent Submissions */}
        {submissions.length > 0 && (
          <div className="space-y-1">
            <div className="font-pixel text-[8px] text-pixel-text-muted uppercase">
              Recent Submissions
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {submissions.slice(0, 5).map((sub) => (
                <div
                  key={sub.id}
                  className={clsx(
                    "flex items-center gap-2 p-1",
                    "border border-black",
                    "bg-pixel-bg-light",
                  )}
                >
                  {/* Status indicator */}
                  <div
                    className={clsx(
                      "w-2 h-2 rounded-full",
                      sub.status === "confirmed"
                        ? "bg-pixel-success"
                        : sub.status === "failed"
                          ? "bg-pixel-error"
                          : sub.status === "submitted"
                            ? "bg-pixel-secondary animate-pulse"
                            : "bg-pixel-text-muted",
                    )}
                  />

                  {/* Hash */}
                  <span className="font-pixel text-[6px] text-pixel-text flex-1 truncate">
                    {formatHash(sub.hash)}
                  </span>

                  {/* Reward */}
                  <span className="font-pixel text-[6px] text-pixel-primary">
                    +{formatTokens(sub.reward)}
                  </span>

                  {/* TX Link */}
                  {sub.txid && getTxUrl && (
                    <a
                      href={getTxUrl(sub.txid)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-pixel text-[6px] text-pixel-secondary hover:underline"
                    >
                      TX
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {isSubmitting && (
          <div className="font-pixel text-[8px] text-pixel-secondary animate-pulse">
            Submitting proof...
          </div>
        )}

        {error && (
          <div className="font-pixel text-[8px] text-pixel-error">{error}</div>
        )}

        {isLoading && (
          <div className="font-pixel text-[8px] text-pixel-text-muted animate-pulse">
            Loading...
          </div>
        )}
      </div>

      {/* Footer - Network */}
      <div
        className={clsx(
          "px-3 py-1",
          "border-t-2 border-black",
          "bg-pixel-bg-light",
        )}
      >
        <span
          className={clsx(
            "font-pixel text-[6px] uppercase",
            network === "mainnet"
              ? "text-pixel-primary"
              : "text-pixel-secondary",
          )}
        >
          {network}
        </span>
      </div>
    </div>
  );
}

/**
 * MiningRewardBadge - Compact reward display
 */
export function MiningRewardBadge({
  rewards,
  className,
}: {
  rewards: bigint;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1",
        "px-2 py-1",
        "font-pixel text-[8px]",
        "border-2 border-black",
        "bg-pixel-primary text-pixel-text-dark",
        className,
      )}
    >
      <span>$BABY</span>
      <span>{formatTokens(rewards)}</span>
    </span>
  );
}
