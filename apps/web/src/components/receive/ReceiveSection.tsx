"use client";

/**
 * ReceiveSection - Display wallet address and QR code for receiving
 *
 * Shows:
 * - QR code for easy scanning
 * - Full address with copy functionality
 * - Network indicator
 */

import { useState } from "react";
import { useWallet } from "@/hooks";
import { useNetworkStore } from "@bitcoinbaby/core";
import { QRCode, NetworkBadge } from "@bitcoinbaby/ui";

// Copy button component
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={copy}
      className={`px-4 py-2 font-pixel text-[10px] border-4 border-black transition-all ${
        copied
          ? "bg-pixel-success text-black"
          : "bg-pixel-bg-dark text-pixel-text hover:bg-pixel-primary hover:text-black"
      }`}
    >
      {copied ? "COPIED!" : label}
    </button>
  );
}

export function ReceiveSection() {
  const { network } = useNetworkStore();
  const { wallet, isLocked, hasStoredWallet } = useWallet();

  // No wallet state
  if (!hasStoredWallet) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-pixel-bg-light border-4 border-pixel-border">
          <span className="font-pixel text-2xl text-pixel-text-muted">?</span>
        </div>
        <h2 className="font-pixel text-sm text-pixel-primary mb-2">
          NO WALLET FOUND
        </h2>
        <p className="font-pixel-body text-xs text-pixel-text-muted">
          Create or import a wallet to receive Bitcoin
        </p>
      </div>
    );
  }

  // Locked wallet state
  if (isLocked) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-pixel-error/20 border-4 border-pixel-error">
          <span className="font-pixel text-2xl text-pixel-error">LOCK</span>
        </div>
        <h2 className="font-pixel text-sm text-pixel-primary mb-2">
          WALLET LOCKED
        </h2>
        <p className="font-pixel-body text-xs text-pixel-text-muted">
          Unlock your wallet to see your receive address
        </p>
      </div>
    );
  }

  if (!wallet?.address) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 border-4 border-pixel-primary border-t-transparent animate-spin" />
        <p className="font-pixel text-xs text-pixel-text-muted">LOADING...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network indicator */}
      <div className="flex items-center justify-between">
        <span className="font-pixel text-[10px] text-pixel-text-muted">
          {network === "mainnet" ? "Mainnet" : "Testnet4"} - Taproot
        </span>
        <NetworkBadge network={network} />
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <QRCode data={wallet.address} />
      </div>

      {/* Address display */}
      <div className="bg-pixel-bg-dark p-4 border-4 border-pixel-border">
        <label className="block font-pixel text-[8px] text-pixel-text-muted mb-2">
          YOUR BITCOIN ADDRESS
        </label>
        <p className="font-pixel-mono text-xs text-pixel-text break-all mb-4">
          {wallet.address}
        </p>
        <div className="flex justify-center">
          <CopyButton text={wallet.address} label="COPY ADDRESS" />
        </div>
      </div>

      {/* Instructions */}
      <div className="p-3 bg-pixel-bg-light border-2 border-dashed border-pixel-border">
        <h4 className="font-pixel text-[10px] text-pixel-secondary mb-2">
          HOW TO RECEIVE
        </h4>
        <ul className="space-y-1 font-pixel-body text-[10px] text-pixel-text-muted">
          <li>1. Share your address or QR code with sender</li>
          <li>2. Wait for transaction to be broadcast</li>
          <li>3. Check your balance after 1 confirmation</li>
        </ul>
      </div>

      {/* Testnet faucet link */}
      {network === "testnet4" && (
        <a
          href="https://mempool.space/testnet4/faucet"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 font-pixel text-[10px] text-center bg-pixel-secondary text-black border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all"
        >
          GET TESTNET BTC
        </a>
      )}

      {/* Security note */}
      <p className="font-pixel text-[8px] text-pixel-text-muted text-center">
        Always verify the address before sending funds
      </p>
    </div>
  );
}

export default ReceiveSection;
