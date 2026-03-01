"use client";

/**
 * WithdrawButton - Reusable withdraw call-to-action
 *
 * Displays virtual balance and navigates to withdrawal page.
 * Can be used in Mining, Wallet, or anywhere else.
 *
 * HOW WITHDRAWAL WORKS:
 * 1. Mining rewards accumulate as "virtual balance" (off-chain, in Cloudflare Workers)
 * 2. User clicks Withdraw when they want to convert to real Bitcoin tokens
 * 3. Withdrawal is batched with other users to minimize Bitcoin fees
 * 4. When batch processes, user receives $BABY on Bitcoin (Charms protocol)
 *
 * WHY VIRTUAL BALANCE?
 * - No Bitcoin fees for each mining reward (would cost more than reward!)
 * - Instant crediting (no waiting for confirmations)
 * - Batch withdrawals = much lower fees for everyone
 */

import Link from "next/link";
import { HelpTooltip } from "@bitcoinbaby/ui";

interface WithdrawButtonProps {
  /** Virtual balance available to withdraw */
  virtualBalance: bigint;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Button size variant */
  size?: "sm" | "md" | "lg";
  /** Show balance in button */
  showBalance?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format balance for display
 */
function formatBalance(balance: bigint): string {
  if (balance >= 1_000_000n) {
    return `${(Number(balance) / 1_000_000).toFixed(2)}M`;
  }
  if (balance >= 1_000n) {
    return `${(Number(balance) / 1_000).toFixed(1)}K`;
  }
  return balance.toString();
}

export function WithdrawButton({
  virtualBalance,
  isLoading = false,
  size = "md",
  showBalance = true,
  className = "",
}: WithdrawButtonProps) {
  const hasBalance = virtualBalance > 0n;

  // Size styles
  const sizeStyles = {
    sm: "py-2 px-3 text-[8px]",
    md: "py-3 px-4 text-[10px]",
    lg: "py-4 px-6 text-xs",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Link
        href="/wallet/withdraw"
        className={`
          font-pixel ${sizeStyles[size]}
          bg-pixel-success text-black
          border-4 border-black
          shadow-[4px_4px_0_0_#000]
          hover:translate-x-[2px] hover:translate-y-[2px]
          hover:shadow-[2px_2px_0_0_#000]
          transition-all
          flex items-center gap-2
          ${!hasBalance && "opacity-50"}
        `}
      >
        {isLoading ? (
          <span className="animate-pulse">LOADING...</span>
        ) : (
          <>
            <span>WITHDRAW</span>
            {showBalance && hasBalance && (
              <span className="bg-black/20 px-2 py-0.5 rounded">
                {formatBalance(virtualBalance)} $BABY
              </span>
            )}
          </>
        )}
      </Link>

      <HelpTooltip
        title="How Withdrawal Works"
        content={`Your mining rewards are stored as virtual balance (off-chain) to avoid Bitcoin fees on every reward. When you withdraw, your tokens are batched with other users and sent to your wallet as real $BABY tokens on Bitcoin. Choose Monthly pool for lowest fees, or Immediate for faster processing.`}
        size="sm"
      />
    </div>
  );
}

/**
 * Compact version for tight spaces
 */
export function WithdrawButtonCompact({
  virtualBalance,
  isLoading = false,
}: {
  virtualBalance: bigint;
  isLoading?: boolean;
}) {
  return (
    <WithdrawButton
      virtualBalance={virtualBalance}
      isLoading={isLoading}
      size="sm"
      showBalance={false}
    />
  );
}

export default WithdrawButton;
