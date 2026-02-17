"use client";

/**
 * AddressInput Component
 *
 * Bitcoin address input with real-time validation.
 * Supports all address formats for the current network.
 */

import { useState, useCallback, useEffect } from "react";
import { validateAddress, type BitcoinNetwork } from "@bitcoinbaby/bitcoin";

interface AddressInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  network: BitcoinNetwork;
  disabled?: boolean;
}

export function AddressInput({
  value,
  onChange,
  network,
  disabled = false,
}: AddressInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error?: string;
  } | null>(null);

  // Validate address on change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.trim();

      if (newValue === "") {
        setValidationResult(null);
        onChange(newValue, false);
        return;
      }

      const result = validateAddress(newValue, network);
      setValidationResult(result);
      onChange(newValue, result.valid);
    },
    [network, onChange],
  );

  // Re-validate when network changes
  useEffect(() => {
    if (value) {
      const result = validateAddress(value, network);
      setValidationResult(result);
      onChange(value, result.valid);
    }
  }, [network]);

  // Handle paste
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text").trim();

      if (pastedText) {
        const result = validateAddress(pastedText, network);
        setValidationResult(result);
        onChange(pastedText, result.valid);
      }
    },
    [network, onChange],
  );

  const showError =
    validationResult && !validationResult.valid && value.length > 0;
  const showSuccess = validationResult && validationResult.valid;

  return (
    <div className="space-y-2">
      <label className="font-pixel text-[10px] text-pixel-text-muted block">
        RECIPIENT ADDRESS
      </label>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={network === "mainnet" ? "bc1p..." : "tb1p..."}
          className={`
            w-full px-4 py-3
            font-pixel-body text-sm
            bg-pixel-bg-dark text-pixel-text
            border-4 outline-none
            shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.5)]
            placeholder:text-pixel-text-muted
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              showError
                ? "border-pixel-error"
                : showSuccess
                  ? "border-pixel-success"
                  : isFocused
                    ? "border-pixel-primary"
                    : "border-pixel-border"
            }
          `}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Status indicator */}
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {showSuccess && (
              <span className="font-pixel text-pixel-success text-lg">OK</span>
            )}
            {showError && (
              <span className="font-pixel text-pixel-error text-lg">X</span>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {showError && validationResult.error && (
        <p className="font-pixel text-[8px] text-pixel-error">
          {validationResult.error}
        </p>
      )}

      {/* Network hint */}
      <p className="font-pixel text-[6px] text-pixel-text-muted">
        {network === "mainnet"
          ? "Mainnet: bc1p (Taproot), bc1q (SegWit), 1/3 (Legacy)"
          : "Testnet4: tb1p (Taproot), tb1q (SegWit), m/n/2 (Legacy)"}
      </p>
    </div>
  );
}
