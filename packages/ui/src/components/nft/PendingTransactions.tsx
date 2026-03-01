"use client";

/**
 * PendingTransactions Component
 *
 * Shows pending NFT transactions with status and links to explorer.
 * Provides visual feedback while transactions confirm.
 */

import { useMemo } from "react";

// =============================================================================
// TYPES
// =============================================================================

export interface PendingTx {
  txid: string;
  type: string;
  description: string;
  status:
    | "pending"
    | "mempool"
    | "confirming"
    | "confirmed"
    | "failed"
    | "replaced";
  confirmations: number;
  explorerUrl: string;
  submittedAt: number;
}

interface PendingTransactionsProps {
  transactions: PendingTx[];
  onRefresh?: () => void;
  onClearCompleted?: () => void;
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function getStatusIcon(status: PendingTx["status"]): string {
  switch (status) {
    case "pending":
      return "⏳";
    case "mempool":
      return "📡";
    case "confirming":
      return "⛏️";
    case "confirmed":
      return "✅";
    case "failed":
      return "❌";
    case "replaced":
      return "🔄";
    default:
      return "❓";
  }
}

function getStatusColor(status: PendingTx["status"]): string {
  switch (status) {
    case "pending":
      return "text-pixel-warning";
    case "mempool":
      return "text-pixel-secondary";
    case "confirming":
      return "text-pixel-primary";
    case "confirmed":
      return "text-pixel-success";
    case "failed":
      return "text-pixel-error";
    case "replaced":
      return "text-pixel-text-muted";
    default:
      return "text-pixel-text";
  }
}

function getStatusText(
  status: PendingTx["status"],
  confirmations: number,
): string {
  switch (status) {
    case "pending":
      return "Broadcasting...";
    case "mempool":
      return "In mempool";
    case "confirming":
      return `${confirmations} conf${confirmations > 1 ? "s" : ""}`;
    case "confirmed":
      return "Confirmed";
    case "failed":
      return "Failed";
    case "replaced":
      return "Replaced";
    default:
      return "Unknown";
  }
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function truncateTxid(txid: string): string {
  if (txid.length <= 16) return txid;
  return `${txid.slice(0, 8)}...${txid.slice(-8)}`;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PendingTransactions({
  transactions,
  onRefresh,
  onClearCompleted,
  className = "",
}: PendingTransactionsProps) {
  // Filter to show pending first, then recent completed
  const sortedTxs = useMemo(() => {
    const pending = transactions.filter(
      (tx) =>
        tx.status === "pending" ||
        tx.status === "mempool" ||
        tx.status === "confirming",
    );
    const completed = transactions.filter(
      (tx) =>
        tx.status === "confirmed" ||
        tx.status === "failed" ||
        tx.status === "replaced",
    );
    return [...pending, ...completed.slice(0, 3)];
  }, [transactions]);

  const pendingCount = sortedTxs.filter(
    (tx) =>
      tx.status === "pending" ||
      tx.status === "mempool" ||
      tx.status === "confirming",
  ).length;

  if (sortedTxs.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-pixel-bg-medium border-4 border-pixel-border ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b-4 border-pixel-border">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[8px] text-pixel-secondary uppercase">
            Transactions
          </span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 bg-pixel-warning text-pixel-text-dark font-pixel text-[7px]">
              {pendingCount} pending
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="font-pixel text-[7px] text-pixel-text-muted hover:text-pixel-primary"
              title="Refresh"
            >
              ↻
            </button>
          )}
          {onClearCompleted && pendingCount < sortedTxs.length && (
            <button
              onClick={onClearCompleted}
              className="font-pixel text-[7px] text-pixel-text-muted hover:text-pixel-primary"
              title="Clear completed"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y-2 divide-pixel-border">
        {sortedTxs.map((tx) => (
          <div key={tx.txid} className="p-3">
            <div className="flex items-start justify-between gap-2">
              {/* Left: Icon + Description */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg flex-shrink-0">
                  {getStatusIcon(tx.status)}
                </span>
                <div className="min-w-0">
                  <p className="font-pixel text-[8px] text-pixel-text truncate">
                    {tx.description}
                  </p>
                  <a
                    href={tx.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-pixel-body text-[10px] text-pixel-primary hover:underline"
                  >
                    {truncateTxid(tx.txid)}
                  </a>
                </div>
              </div>

              {/* Right: Status */}
              <div className="flex flex-col items-end flex-shrink-0">
                <span
                  className={`font-pixel text-[7px] uppercase ${getStatusColor(tx.status)}`}
                >
                  {getStatusText(tx.status, tx.confirmations)}
                </span>
                <span className="font-pixel text-[6px] text-pixel-text-muted">
                  {formatTimeAgo(tx.submittedAt)}
                </span>
              </div>
            </div>

            {/* Progress bar for confirming */}
            {tx.status === "confirming" && (
              <div className="mt-2 h-1 bg-pixel-bg-dark">
                <div
                  className="h-full bg-pixel-primary transition-all"
                  style={{
                    width: `${Math.min(tx.confirmations * 16.67, 100)}%`,
                  }}
                />
              </div>
            )}

            {/* Pulsing animation for pending/mempool */}
            {(tx.status === "pending" || tx.status === "mempool") && (
              <div className="mt-2 flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-pixel-warning animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-pixel-warning animate-pulse delay-100" />
                <div className="w-1.5 h-1.5 rounded-full bg-pixel-warning animate-pulse delay-200" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer with explorer link */}
      {pendingCount > 0 && (
        <div className="p-2 border-t-2 border-pixel-border bg-pixel-bg-dark">
          <p className="font-pixel text-[6px] text-pixel-text-muted text-center">
            Click transaction ID to view on mempool.space
          </p>
        </div>
      )}
    </div>
  );
}

export default PendingTransactions;
