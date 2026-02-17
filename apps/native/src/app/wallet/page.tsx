"use client";

/**
 * Wallet Page - Native App
 *
 * Mobile-optimized wallet interface.
 */

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components";
import { useCapacitor } from "@/hooks";
import { useWalletStore, useNetworkStore } from "@bitcoinbaby/core";
import { PixelButton, PixelCard, QRCodeBitcoin } from "@bitcoinbaby/ui";

export default function WalletPage() {
  const { haptic, isNative } = useCapacitor();
  const { wallet, isConnected } = useWalletStore();
  const { network } = useNetworkStore();
  const [showReceive, setShowReceive] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (!wallet?.address) return;

    if (isNative) {
      await haptic("light");
    }

    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (!isConnected || !wallet) {
    return (
      <div className="flex flex-col h-screen bg-pixel-bg-dark">
        <header className="safe-top px-4 pt-2 pb-4">
          <h1 className="font-pixel text-white text-sm">Wallet</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
          <div className="text-6xl mb-6">&#128176;</div>
          <h2 className="font-pixel text-white text-sm mb-2">No Wallet</h2>
          <p className="text-pixel-text-muted text-center mb-8">
            Create or import a wallet to start mining and earning $BABY tokens.
          </p>
          <Link href="/wallet/create">
            <PixelButton variant="default" size="lg">
              Create Wallet
            </PixelButton>
          </Link>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-pixel-bg-dark">
      {/* Header */}
      <header className="safe-top px-4 pt-2 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="font-pixel text-white text-sm">Wallet</h1>
          <span
            className={`text-xs px-2 py-1 rounded ${
              network === "mainnet"
                ? "bg-pixel-primary/20 text-pixel-primary"
                : "bg-pixel-secondary/20 text-pixel-secondary"
            }`}
          >
            {network === "mainnet" ? "MAIN" : "TEST"}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 scroll-container px-4 pb-24">
        {/* Balance Card */}
        <PixelCard className="mb-4">
          <div className="text-center py-4">
            <div className="font-pixel text-[10px] text-pixel-text-muted mb-2">
              TOTAL BALANCE
            </div>
            <div className="font-pixel text-pixel-primary text-2xl mb-1">
              {(Number(wallet.balance) / 100000000).toFixed(8)}
            </div>
            <div className="text-pixel-text-muted text-sm">BTC</div>

            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="font-pixel-mono text-pixel-secondary text-lg">
                {(Number(wallet.babyTokens) / 100000000).toFixed(2)}
              </div>
              <span className="text-pixel-text-muted text-sm">$BABY</span>
            </div>
          </div>
        </PixelCard>

        {/* Address */}
        <PixelCard className="mb-4">
          <div
            className="flex items-center justify-between p-2 touch-feedback cursor-pointer"
            onClick={handleCopyAddress}
          >
            <div>
              <div className="font-pixel text-[8px] text-pixel-text-muted mb-1">
                ADDRESS
              </div>
              <div className="font-pixel-mono text-white text-sm">
                {formatAddress(wallet.address)}
              </div>
            </div>
            <div className="text-pixel-primary">
              {copied ? "&#10003;" : "&#128203;"}
            </div>
          </div>
        </PixelCard>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <PixelButton
            variant="default"
            className="w-full"
            onClick={() => setShowReceive(true)}
          >
            Receive
          </PixelButton>
          <Link href="/wallet/send" className="w-full">
            <PixelButton variant="secondary" className="w-full">
              Send
            </PixelButton>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <Link href="/wallet/history">
            <div className="border-pixel bg-pixel-bg-medium p-4 rounded-lg touch-feedback flex items-center justify-between">
              <span className="font-pixel text-[10px] text-white">
                Transaction History
              </span>
              <span className="text-pixel-text-muted">&#8250;</span>
            </div>
          </Link>

          <Link href="/wallet/backup">
            <div className="border-pixel bg-pixel-bg-medium p-4 rounded-lg touch-feedback flex items-center justify-between">
              <span className="font-pixel text-[10px] text-white">
                Backup Wallet
              </span>
              <span className="text-pixel-text-muted">&#8250;</span>
            </div>
          </Link>
        </div>
      </main>

      {/* Receive Modal */}
      {showReceive && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <PixelCard className="w-full max-w-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-pixel text-white text-sm">
                  Receive Bitcoin
                </h2>
                <button
                  onClick={() => setShowReceive(false)}
                  className="text-pixel-text-muted text-xl"
                >
                  &times;
                </button>
              </div>

              <div className="flex justify-center mb-4">
                <QRCodeBitcoin data={wallet.address} size={200} />
              </div>

              <div
                className="border-pixel bg-pixel-bg-dark p-3 rounded touch-feedback cursor-pointer"
                onClick={handleCopyAddress}
              >
                <div className="font-pixel-mono text-white text-xs text-center break-all">
                  {wallet.address}
                </div>
              </div>

              <p className="text-pixel-text-muted text-xs text-center mt-3">
                Tap address to copy
              </p>
            </div>
          </PixelCard>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
