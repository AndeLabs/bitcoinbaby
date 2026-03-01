/**
 * TransactionConfirmModal - Transaction Confirmation Dialog
 *
 * Shows transaction details before signing.
 * User must confirm or cancel.
 */

import { type FC } from "react";
import { clsx } from "clsx";
import { Button } from "../button";
import { PixelIcon } from "../sprites";

export interface TransactionDetails {
  /** Type of transaction */
  type: "mint" | "transfer" | "evolve" | "custom";
  /** Title for the modal */
  title: string;
  /** Description of what will happen */
  description: string;
  /** Cost breakdown */
  costs: {
    label: string;
    amount: string;
    sublabel?: string;
  }[];
  /** Total cost in sats */
  totalSats: number;
  /** Formatted total (e.g., "0.0001 BTC") */
  formattedTotal: string;
  /** Network fee estimate */
  feeEstimate?: string;
  /** Recipient address (for transfers) */
  recipient?: string;
  /** Additional info to display */
  additionalInfo?: string;
}

interface TransactionConfirmModalProps {
  isOpen: boolean;
  transaction: TransactionDetails;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

export const TransactionConfirmModal: FC<TransactionConfirmModalProps> = ({
  isOpen,
  transaction,
  isLoading = false,
  onConfirm,
  onCancel,
  className,
}) => {
  if (!isOpen) {
    return null;
  }

  const getIcon = () => {
    switch (transaction.type) {
      case "mint":
        return "star";
      case "transfer":
        return "bolt";
      case "evolve":
        return "sparkle";
      default:
        return "coin";
    }
  };

  return (
    <div
      className={clsx(
        "fixed inset-0 z-50",
        "flex items-center justify-center p-4",
        "bg-black/80",
        className,
      )}
    >
      <div
        className={clsx(
          "w-full max-w-md",
          "bg-pixel-bg-dark border-4 border-pixel-border",
          "shadow-[8px_8px_0_0_#000]",
          "animate-[scale-in_0.2s_ease-out]",
        )}
      >
        {/* Header */}
        <div className="bg-pixel-bg-medium border-b-4 border-pixel-border p-4">
          <div className="flex items-center gap-3">
            <PixelIcon
              name={getIcon()}
              size={24}
              className="text-pixel-primary"
            />
            <div>
              <h3 className="font-pixel text-sm text-pixel-text">
                {transaction.title}
              </h3>
              <p className="font-pixel text-[8px] text-pixel-text-muted uppercase mt-1">
                CONFIRM TRANSACTION
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Description */}
          <p className="font-pixel-body text-sm text-pixel-text-muted">
            {transaction.description}
          </p>

          {/* Cost Breakdown */}
          <div className="bg-pixel-bg-medium border-2 border-pixel-border p-3 space-y-2">
            {transaction.costs.map((cost, i) => (
              <div key={i} className="flex justify-between items-center">
                <div>
                  <span className="font-pixel text-[9px] text-pixel-text">
                    {cost.label}
                  </span>
                  {cost.sublabel && (
                    <span className="font-pixel text-[7px] text-pixel-text-muted ml-2">
                      ({cost.sublabel})
                    </span>
                  )}
                </div>
                <span className="font-pixel text-[10px] text-pixel-primary">
                  {cost.amount}
                </span>
              </div>
            ))}

            {/* Fee Estimate */}
            {transaction.feeEstimate && (
              <div className="flex justify-between items-center pt-2 border-t border-pixel-border">
                <span className="font-pixel text-[8px] text-pixel-text-muted">
                  Network Fee (est.)
                </span>
                <span className="font-pixel text-[9px] text-pixel-text-muted">
                  ~{transaction.feeEstimate}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t-2 border-pixel-border">
              <span className="font-pixel text-[10px] text-pixel-text uppercase">
                Total
              </span>
              <span className="font-pixel text-sm text-pixel-success">
                {transaction.formattedTotal}
              </span>
            </div>
          </div>

          {/* Recipient (if applicable) */}
          {transaction.recipient && (
            <div className="bg-pixel-bg-medium border-2 border-pixel-border p-3">
              <span className="font-pixel text-[8px] text-pixel-text-muted uppercase block mb-1">
                Recipient
              </span>
              <span className="font-pixel-body text-[10px] text-pixel-text break-all">
                {transaction.recipient}
              </span>
            </div>
          )}

          {/* Additional Info */}
          {transaction.additionalInfo && (
            <div className="p-3 bg-pixel-warning/10 border-2 border-pixel-warning">
              <p className="font-pixel text-[8px] text-pixel-warning">
                {transaction.additionalInfo}
              </p>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2 text-pixel-text-muted">
            <PixelIcon
              name="sparkle"
              size={14}
              className="flex-shrink-0 mt-0.5"
            />
            <p className="font-pixel text-[7px]">
              This transaction will be broadcast to the Bitcoin network. Make
              sure the details are correct before confirming.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t-4 border-pixel-border">
          <Button
            variant="outline"
            size="default"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            CANCEL
          </Button>
          <Button
            variant="default"
            size="default"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <span className="animate-pulse">SIGNING...</span>
            ) : (
              "CONFIRM"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionConfirmModal;
