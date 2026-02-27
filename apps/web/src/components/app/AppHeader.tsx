"use client";

/**
 * AppHeader - Persistent header with branding and status
 *
 * Contains:
 * - Logo/branding
 * - Mining status bar
 * - Wallet status
 * - Network badge
 */

import { clsx } from "clsx";
import { useNetworkStore, useWalletStore } from "@bitcoinbaby/core";
import { NetworkBadge, WalletStatusCompact } from "@bitcoinbaby/ui";
import { MiningStatusBar } from "./MiningStatusBar";

interface AppHeaderProps {
  onMiningClick?: () => void;
  onWalletClick?: () => void;
  className?: string;
}

export function AppHeader({
  onMiningClick,
  onWalletClick,
  className,
}: AppHeaderProps) {
  const { network } = useNetworkStore();
  const wallet = useWalletStore((s) => s.wallet);

  return (
    <header
      className={clsx(
        "flex items-center justify-between",
        "px-4 py-3 bg-pixel-bg-medium",
        "border-b-4 border-pixel-border",
        className,
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-pixel-primary border-2 border-black flex items-center justify-center shadow-[2px_2px_0_0_#000]">
          <span className="font-pixel text-[10px] text-pixel-text-dark">B</span>
        </div>
        <div className="hidden sm:block">
          <h1 className="font-pixel text-sm text-pixel-primary leading-none">
            BITCOIN<span className="text-pixel-secondary">BABY</span>
          </h1>
        </div>
      </div>

      {/* Center: Mining Status */}
      <MiningStatusBar onClick={onMiningClick} />

      {/* Right: Network + Wallet */}
      <div className="flex items-center gap-2">
        <NetworkBadge network={network} className="hidden sm:flex" />

        {wallet ? (
          <WalletStatusCompact
            address={wallet.address}
            isLocked={false}
            onClick={onWalletClick}
          />
        ) : (
          <button
            onClick={onWalletClick}
            className={clsx(
              "px-3 py-1.5 font-pixel text-[8px] uppercase",
              "bg-pixel-primary text-pixel-text-dark",
              "border-2 border-black shadow-[2px_2px_0_0_#000]",
              "hover:translate-x-[1px] hover:translate-y-[1px]",
              "hover:shadow-[1px_1px_0_0_#000] transition-all",
            )}
          >
            Connect
          </button>
        )}
      </div>
    </header>
  );
}

export default AppHeader;
