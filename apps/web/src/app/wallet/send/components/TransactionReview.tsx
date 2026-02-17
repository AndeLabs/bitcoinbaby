"use client";

/**
 * TransactionReview Component
 *
 * Review transaction details before signing and broadcasting.
 */

import type { FeeLevel } from "./FeeSelector";
import type { BitcoinNetwork } from "@bitcoinbaby/bitcoin";

interface TransactionReviewProps {
  recipient: string;
  amountSatoshis: number;
  feeLevel: FeeLevel;
  feeRate: number;
  feeSatoshis: number;
  senderAddress: string;
  network: BitcoinNetwork;
  onConfirm: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function TransactionReview({
  recipient,
  amountSatoshis,
  feeLevel,
  feeRate,
  feeSatoshis,
  senderAddress,
  network,
  onConfirm,
  onBack,
  isLoading = false,
}: TransactionReviewProps) {
  // Format helpers
  const formatBtc = (sats: number): string => {
    return (sats / 100_000_000).toFixed(8);
  };

  const formatSats = (sats: number): string => {
    return sats.toLocaleString();
  };

  const truncateAddress = (addr: string): string => {
    if (addr.length <= 20) return addr;
    return `${addr.slice(0, 12)}...${addr.slice(-8)}`;
  };

  const totalSatoshis = amountSatoshis + feeSatoshis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-pixel text-lg text-pixel-primary mb-2">
          REVIEW TRANSACTION
        </h2>
        <p className="font-pixel-body text-sm text-pixel-text-muted">
          Please verify all details before sending
        </p>
      </div>

      {/* Transaction details */}
      <div className="bg-pixel-bg-dark border-4 border-pixel-border p-4 space-y-4">
        {/* From */}
        <div>
          <label className="font-pixel text-[8px] text-pixel-text-muted block mb-1">
            FROM
          </label>
          <p className="font-pixel-body text-sm text-pixel-text break-all">
            {senderAddress}
          </p>
        </div>

        {/* Arrow */}
        <div className="text-center py-2">
          <span className="font-pixel text-2xl text-pixel-secondary">V</span>
        </div>

        {/* To */}
        <div>
          <label className="font-pixel text-[8px] text-pixel-text-muted block mb-1">
            TO
          </label>
          <p className="font-pixel-body text-sm text-pixel-text break-all">
            {recipient}
          </p>
        </div>
      </div>

      {/* Amount breakdown */}
      <div className="bg-pixel-bg-light border-4 border-pixel-border p-4 space-y-3">
        {/* Amount */}
        <div className="flex items-center justify-between">
          <span className="font-pixel text-[10px] text-pixel-text-muted">
            AMOUNT
          </span>
          <div className="text-right">
            <span className="font-pixel text-lg text-pixel-text">
              {formatBtc(amountSatoshis)} BTC
            </span>
            <p className="font-pixel text-[8px] text-pixel-text-muted">
              {formatSats(amountSatoshis)} sats
            </p>
          </div>
        </div>

        {/* Fee */}
        <div className="flex items-center justify-between">
          <span className="font-pixel text-[10px] text-pixel-text-muted">
            NETWORK FEE ({feeLevel.toUpperCase()})
          </span>
          <div className="text-right">
            <span className="font-pixel text-sm text-pixel-secondary">
              {formatBtc(feeSatoshis)} BTC
            </span>
            <p className="font-pixel text-[8px] text-pixel-text-muted">
              {feeRate} sat/vB
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-dashed border-pixel-border pt-3">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-xs text-pixel-text-muted">
              TOTAL
            </span>
            <div className="text-right">
              <span className="font-pixel text-xl text-pixel-primary">
                {formatBtc(totalSatoshis)} BTC
              </span>
              <p className="font-pixel text-[8px] text-pixel-text-muted">
                {formatSats(totalSatoshis)} sats
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Network warning for mainnet */}
      {network === "mainnet" && (
        <div className="bg-pixel-error/20 border-4 border-pixel-error p-4">
          <p className="font-pixel text-[10px] text-pixel-error text-center">
            MAINNET TRANSACTION - REAL BITCOIN!
          </p>
          <p className="font-pixel-body text-xs text-pixel-text-muted text-center mt-1">
            This transaction cannot be reversed
          </p>
        </div>
      )}

      {/* Testnet notice */}
      {network !== "mainnet" && (
        <div className="bg-pixel-secondary/20 border-2 border-pixel-secondary p-3">
          <p className="font-pixel text-[8px] text-pixel-secondary text-center">
            TESTNET4 - No real value
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 py-4 font-pixel text-sm text-pixel-text bg-pixel-bg-light border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all disabled:opacity-50"
        >
          BACK
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 py-4 font-pixel text-sm text-black bg-pixel-success border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all disabled:opacity-50"
        >
          {isLoading ? "SIGNING..." : "CONFIRM & SEND"}
        </button>
      </div>

      {/* Security notice */}
      <p className="font-pixel text-[6px] text-pixel-text-muted text-center">
        Your private key never leaves this device
      </p>
    </div>
  );
}
