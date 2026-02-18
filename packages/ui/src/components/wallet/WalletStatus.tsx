"use client";

/**
 * WalletStatus - Display de estado de wallet
 *
 * Muestra direccion, balance y botones de lock/unlock.
 * Estilo pixel art consistente con el resto de la UI.
 */

import { clsx } from "clsx";

interface WalletStatusProps {
  /** Wallet address */
  address: string | null;
  /** Whether wallet is locked */
  isLocked: boolean;
  /** BTC balance in satoshis */
  btcBalance?: number;
  /** $BABY token balance */
  babyBalance?: bigint;
  /** Network indicator */
  network?: "mainnet" | "testnet4";
  /** Loading state */
  isLoading?: boolean;
  /** Callback to lock wallet */
  onLock?: () => void;
  /** Callback to unlock wallet */
  onUnlock?: () => void;
  /** Callback to open full wallet */
  onOpenWallet?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format address for display (truncated)
 */
function formatAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format satoshis to BTC
 */
function formatBtc(sats: number): string {
  return (sats / 100_000_000).toFixed(8);
}

/**
 * Format token balance
 */
function formatTokens(balance: bigint): string {
  return balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function WalletStatus({
  address,
  isLocked,
  btcBalance = 0,
  babyBalance = BigInt(0),
  network = "testnet4",
  isLoading = false,
  onLock,
  onUnlock,
  onOpenWallet,
  className,
}: WalletStatusProps) {
  const isConnected = !!address && !isLocked;

  return (
    <div
      className={clsx(
        "flex items-center gap-2",
        "border-2 border-black p-2",
        "bg-pixel-bg-dark",
        className,
      )}
      role="region"
      aria-label="Wallet status"
    >
      {/* Status Icon */}
      <div
        className={clsx(
          "w-8 h-8 flex items-center justify-center",
          "border-2 border-black",
          isConnected
            ? "bg-pixel-success"
            : isLocked
              ? "bg-pixel-error"
              : "bg-pixel-text-muted",
        )}
      >
        <span className="font-pixel text-[10px]">
          {isLoading ? "..." : isConnected ? "$" : isLocked ? "X" : "?"}
        </span>
      </div>

      {/* Wallet Info */}
      <div className="flex-1 min-w-0">
        {isConnected && address ? (
          <>
            {/* Address */}
            <div className="font-pixel text-[8px] text-pixel-text truncate">
              {formatAddress(address)}
            </div>
            {/* Balances */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-pixel text-[8px] text-pixel-primary">
                {formatBtc(btcBalance)} BTC
              </span>
              <span className="font-pixel text-[8px] text-pixel-secondary">
                {formatTokens(babyBalance)} $BABY
              </span>
            </div>
          </>
        ) : isLocked ? (
          <div className="font-pixel text-[8px] text-pixel-error">
            WALLET LOCKED
          </div>
        ) : (
          <div className="font-pixel text-[8px] text-pixel-text-muted">
            NO WALLET
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {isConnected ? (
          <>
            {/* Lock Button */}
            <button
              onClick={onLock}
              className={clsx(
                "w-8 h-8 flex items-center justify-center",
                "font-pixel text-[10px]",
                "border-2 border-black",
                "bg-pixel-bg-light text-pixel-text",
                "hover:bg-pixel-error hover:text-white",
                "transition-colors",
              )}
              title="Lock Wallet"
              aria-label="Lock wallet"
            >
              <span aria-hidden="true">L</span>
            </button>
            {/* Open Wallet Button */}
            <button
              onClick={onOpenWallet}
              className={clsx(
                "w-8 h-8 flex items-center justify-center",
                "font-pixel text-[10px]",
                "border-2 border-black",
                "bg-pixel-primary text-pixel-text-dark",
                "shadow-[2px_2px_0_0_#000]",
                "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000]",
              )}
              title="Open Wallet"
              aria-label="Open wallet"
            >
              <span aria-hidden="true">W</span>
            </button>
          </>
        ) : isLocked ? (
          <button
            onClick={onUnlock}
            className={clsx(
              "px-3 py-1",
              "font-pixel text-[8px] uppercase",
              "border-2 border-black",
              "bg-pixel-success text-pixel-text-dark",
              "shadow-[2px_2px_0_0_#000]",
              "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000]",
            )}
            aria-label="Unlock wallet"
          >
            Unlock
          </button>
        ) : (
          <button
            onClick={onOpenWallet}
            className={clsx(
              "px-3 py-1",
              "font-pixel text-[8px] uppercase",
              "border-2 border-black",
              "bg-pixel-secondary text-pixel-text-dark",
              "shadow-[2px_2px_0_0_#000]",
              "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000]",
            )}
            aria-label="Connect wallet"
          >
            Connect
          </button>
        )}
      </div>

      {/* Network Badge */}
      <div
        className={clsx(
          "absolute -top-1 -right-1",
          "px-1",
          "font-pixel text-[6px] uppercase",
          "border border-black",
          network === "mainnet"
            ? "bg-pixel-primary text-pixel-text-dark"
            : "bg-pixel-secondary text-pixel-text-dark",
        )}
      >
        {network === "mainnet" ? "MAIN" : "TEST"}
      </div>
    </div>
  );
}

/**
 * WalletStatusCompact - Compact version for header
 */
export function WalletStatusCompact({
  address,
  isLocked,
  onClick,
  className,
}: {
  address: string | null;
  isLocked: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const isConnected = !!address && !isLocked;

  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-1",
        "px-2 py-1",
        "border-2 border-black",
        "font-pixel text-[8px]",
        isConnected
          ? "bg-pixel-success text-pixel-text-dark"
          : isLocked
            ? "bg-pixel-error text-white"
            : "bg-pixel-bg-light text-pixel-text",
        "hover:opacity-80",
        className,
      )}
      aria-label={
        isConnected && address
          ? `Wallet connected: ${formatAddress(address, 4)}`
          : isLocked
            ? "Wallet locked - click to unlock"
            : "Connect wallet"
      }
    >
      <span
        className={clsx(
          "w-2 h-2 rounded-full",
          isConnected
            ? "bg-green-400"
            : isLocked
              ? "bg-red-400"
              : "bg-gray-400",
        )}
        aria-hidden="true"
      />
      {isConnected && address
        ? formatAddress(address, 4)
        : isLocked
          ? "LOCKED"
          : "CONNECT"}
    </button>
  );
}
