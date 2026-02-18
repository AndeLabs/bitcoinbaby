"use client";

/**
 * Send Bitcoin Page
 *
 * Complete send flow with:
 * - Recipient address input with validation
 * - Amount input with BTC/sats conversion
 * - Fee selection (slow/medium/fast)
 * - Transaction review step
 * - PSBT creation, signing, and broadcast
 * - Success/error feedback with explorer link
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet, useBalance } from "@/hooks";
import { useNetworkStore } from "@bitcoinbaby/core";
import {
  TransactionBuilder,
  createMempoolClient,
  type TxUTXO,
} from "@bitcoinbaby/bitcoin";

import {
  AddressInput,
  AmountInput,
  FeeSelector,
  TransactionReview,
  SendConfirmation,
  getFeeRateForLevel,
  type FeeLevel,
} from "./components";

// Steps in the send flow
type SendStep = "input" | "review" | "result";

// Send state
interface SendState {
  recipient: string;
  isRecipientValid: boolean;
  amountBtc: string;
  amountSatoshis: number;
  isAmountValid: boolean;
  feeLevel: FeeLevel;
  feeRate: number;
}

// Default vsize estimate for a simple P2TR transfer (1 input, 2 outputs)
const DEFAULT_VSIZE = 154;

export default function SendPage() {
  const router = useRouter();

  // Network and wallet hooks
  const { network, config } = useNetworkStore();
  const {
    wallet,
    isLocked,
    hasStoredWallet,
    isLoading: walletLoading,
    getPrivateKeyForSigning,
  } = useWallet();

  // Balance hook
  const {
    balance,
    utxos,
    fees: feeEstimates,
    isLoading: balanceLoading,
    refresh: refreshBalance,
  } = useBalance({
    address: wallet?.address,
    network,
    autoRefresh: !isLocked,
    refreshInterval: 30000,
  });

  // Current step
  const [step, setStep] = useState<SendStep>("input");

  // Send form state
  const [sendState, setSendState] = useState<SendState>({
    recipient: "",
    isRecipientValid: false,
    amountBtc: "",
    amountSatoshis: 0,
    isAmountValid: false,
    feeLevel: "medium",
    feeRate: 10,
  });

  // Transaction state
  const [isProcessing, setIsProcessing] = useState(false);
  const [txResult, setTxResult] = useState<{
    success: boolean;
    txid?: string;
    error?: string;
  } | null>(null);

  // Calculate estimated fee based on vsize and fee rate
  const estimatedFee = useMemo(() => {
    const feeRate = getFeeRateForLevel(sendState.feeLevel, feeEstimates);
    return Math.ceil(DEFAULT_VSIZE * feeRate);
  }, [sendState.feeLevel, feeEstimates]);

  // Available balance in satoshis
  const availableBalance = balance?.total ?? 0;

  // Form validation
  const isFormValid = useMemo(() => {
    return (
      sendState.isRecipientValid &&
      sendState.isAmountValid &&
      sendState.amountSatoshis > 0 &&
      sendState.amountSatoshis + estimatedFee <= availableBalance
    );
  }, [sendState, estimatedFee, availableBalance]);

  // Update fee rate when level or estimates change
  useEffect(() => {
    const newFeeRate = getFeeRateForLevel(sendState.feeLevel, feeEstimates);
    setSendState((prev) => ({ ...prev, feeRate: newFeeRate }));
  }, [sendState.feeLevel, feeEstimates]);

  // Handle address change
  const handleAddressChange = useCallback((value: string, isValid: boolean) => {
    setSendState((prev) => ({
      ...prev,
      recipient: value,
      isRecipientValid: isValid,
    }));
  }, []);

  // Handle amount change
  const handleAmountChange = useCallback(
    (btcValue: string, satoshis: number, isValid: boolean) => {
      setSendState((prev) => ({
        ...prev,
        amountBtc: btcValue,
        amountSatoshis: satoshis,
        isAmountValid: isValid,
      }));
    },
    [],
  );

  // Handle fee selection
  const handleFeeSelect = useCallback((level: FeeLevel, feeRate: number) => {
    setSendState((prev) => ({
      ...prev,
      feeLevel: level,
      feeRate: feeRate,
    }));
  }, []);

  // Proceed to review
  const handleReview = useCallback(() => {
    if (isFormValid) {
      setStep("review");
    }
  }, [isFormValid]);

  // Go back to input
  const handleBack = useCallback(() => {
    setStep("input");
  }, []);

  // Send transaction
  const handleSend = useCallback(async () => {
    if (!wallet || !utxos || isLocked) {
      setTxResult({ success: false, error: "Wallet not available" });
      setStep("result");
      return;
    }

    setIsProcessing(true);

    try {
      // Get private key for signing
      const privateKey = getPrivateKeyForSigning();
      if (!privateKey) {
        throw new Error("Failed to get private key");
      }

      // Convert UTXOs to TxUTXO format
      const txUtxos: TxUTXO[] = TransactionBuilder.convertUTXOs(
        utxos,
        wallet.address,
        network,
      );

      // Create transaction builder
      const builder = new TransactionBuilder({
        network,
        feeRate: sendState.feeRate,
        enableRBF: true,
      });

      // Select coins
      const selection = builder.selectCoins(txUtxos, sendState.amountSatoshis);

      // Build transfer transaction
      const unsignedTx = builder.buildTransfer(
        selection.inputs,
        sendState.recipient,
        sendState.amountSatoshis,
        wallet.address, // change back to sender
      );

      // Build PSBT
      const psbt = builder.buildPSBT(unsignedTx);

      // Update inputs with proper witness UTXOs
      for (let i = 0; i < unsignedTx.inputs.length; i++) {
        const input = unsignedTx.inputs[i];
        psbt.updateInput(i, {
          witnessUtxo: {
            script: Buffer.from(input.utxo.witnessUtxo?.script || []),
            value: input.utxo.value,
          },
        });
      }

      // Sign PSBT
      builder.signPSBT(psbt, privateKey);

      // Clear private key from memory
      privateKey.fill(0);

      // Finalize and extract transaction
      const signedTx = builder.finalizePSBT(psbt);

      // Broadcast transaction
      const mempoolClient = createMempoolClient({ network });
      const txid = await mempoolClient.broadcastTransaction(signedTx.hex);

      // Success
      setTxResult({
        success: true,
        txid: txid,
      });

      // Refresh balance after broadcast
      setTimeout(() => refreshBalance(), 3000);
    } catch (error) {
      console.error("Transaction failed:", error);
      setTxResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsProcessing(false);
      setStep("result");
    }
  }, [
    wallet,
    utxos,
    isLocked,
    network,
    sendState,
    getPrivateKeyForSigning,
    refreshBalance,
  ]);

  // Reset form for another send
  const handleSendAnother = useCallback(() => {
    setSendState({
      recipient: "",
      isRecipientValid: false,
      amountBtc: "",
      amountSatoshis: 0,
      isAmountValid: false,
      feeLevel: "medium",
      feeRate: getFeeRateForLevel("medium", feeEstimates),
    });
    setTxResult(null);
    setStep("input");
    refreshBalance();
  }, [feeEstimates, refreshBalance]);

  // Navigate to wallet
  const handleViewWallet = useCallback(() => {
    router.push("/wallet");
  }, [router]);

  // Redirect if no wallet or locked
  if (!hasStoredWallet) {
    return (
      <main className="min-h-screen p-4 md:p-8 bg-pixel-bg-dark">
        <div className="max-w-md mx-auto text-center py-12">
          <h1 className="font-pixel text-xl text-pixel-primary mb-4">
            NO WALLET FOUND
          </h1>
          <p className="font-pixel-body text-sm text-pixel-text-muted mb-6">
            Create or import a wallet to send Bitcoin
          </p>
          <a
            href="/wallet"
            className="inline-block px-8 py-4 font-pixel text-sm border-4 border-black shadow-[4px_4px_0_0_#000] bg-pixel-primary text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all"
          >
            GO TO WALLET
          </a>
        </div>
      </main>
    );
  }

  if (isLocked) {
    return (
      <main className="min-h-screen p-4 md:p-8 bg-pixel-bg-dark">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-pixel-error/20 border-4 border-pixel-error">
            <span className="font-pixel text-3xl text-pixel-error">LOCK</span>
          </div>
          <h1 className="font-pixel text-xl text-pixel-primary mb-4">
            WALLET LOCKED
          </h1>
          <p className="font-pixel-body text-sm text-pixel-text-muted mb-6">
            Unlock your wallet to send Bitcoin
          </p>
          <a
            href="/wallet"
            className="inline-block px-8 py-4 font-pixel text-sm border-4 border-black shadow-[4px_4px_0_0_#000] bg-pixel-success text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all"
          >
            UNLOCK WALLET
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-pixel-bg-dark">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="font-pixel text-xl text-pixel-primary">
              SEND BITCOIN
            </h1>
            <a
              href="/wallet"
              className="font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary"
            >
              BACK
            </a>
          </div>
          <p className="font-pixel-body text-sm text-pixel-text-muted mt-2">
            {network === "mainnet" ? "Mainnet" : "Testnet4"} - Taproot
          </p>
        </header>

        {/* Loading state */}
        {(walletLoading || balanceLoading) && step === "input" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-pixel-primary border-t-transparent animate-spin" />
            <p className="font-pixel text-sm text-pixel-text-muted">
              LOADING...
            </p>
          </div>
        )}

        {/* Input Step */}
        {step === "input" && !walletLoading && !balanceLoading && (
          <div className="bg-pixel-bg-medium border-4 border-pixel-border p-6 shadow-[8px_8px_0_0_#000] space-y-6">
            {/* Balance display */}
            <div className="bg-pixel-bg-dark p-4 border-2 border-pixel-border">
              <div className="flex items-center justify-between mb-1">
                <label className="font-pixel text-[8px] text-pixel-text-muted">
                  AVAILABLE BALANCE
                </label>
                <button
                  onClick={refreshBalance}
                  disabled={balanceLoading}
                  className="font-pixel text-[6px] text-pixel-text-muted hover:text-pixel-primary disabled:opacity-50"
                >
                  {balanceLoading ? "..." : "REFRESH"}
                </button>
              </div>
              <span className="font-pixel text-xl text-pixel-text">
                {(availableBalance / 100_000_000).toFixed(8)} BTC
              </span>
              <p className="font-pixel text-[8px] text-pixel-text-muted mt-1">
                {availableBalance.toLocaleString()} satoshis
              </p>
            </div>

            {/* Address input */}
            <AddressInput
              value={sendState.recipient}
              onChange={handleAddressChange}
              network={network}
              disabled={isProcessing}
            />

            {/* Amount input */}
            <AmountInput
              value={sendState.amountBtc}
              onChange={handleAmountChange}
              maxSatoshis={availableBalance}
              estimatedFee={estimatedFee}
              disabled={isProcessing}
            />

            {/* Fee selector */}
            <FeeSelector
              feeEstimates={feeEstimates}
              selectedLevel={sendState.feeLevel}
              onSelect={handleFeeSelect}
              vsize={DEFAULT_VSIZE}
              disabled={isProcessing}
              isLoading={balanceLoading}
            />

            {/* Continue button */}
            <button
              type="button"
              onClick={handleReview}
              disabled={!isFormValid || isProcessing}
              className="w-full py-4 font-pixel text-sm text-black bg-pixel-primary border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              REVIEW TRANSACTION
            </button>

            {/* Insufficient funds warning */}
            {availableBalance < 1000 && (
              <div className="bg-pixel-error/20 border-2 border-pixel-error p-3">
                <p className="font-pixel text-[8px] text-pixel-error text-center">
                  Insufficient balance to send a transaction
                </p>
                {network === "testnet4" && (
                  <p className="font-pixel text-[6px] text-pixel-text-muted text-center mt-1">
                    Get testnet BTC from a faucet
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Review Step */}
        {step === "review" && wallet && (
          <div className="bg-pixel-bg-medium border-4 border-pixel-border p-6 shadow-[8px_8px_0_0_#000]">
            <TransactionReview
              recipient={sendState.recipient}
              amountSatoshis={sendState.amountSatoshis}
              feeLevel={sendState.feeLevel}
              feeRate={sendState.feeRate}
              feeSatoshis={estimatedFee}
              senderAddress={wallet.address}
              network={network}
              onConfirm={handleSend}
              onBack={handleBack}
              isLoading={isProcessing}
            />
          </div>
        )}

        {/* Result Step */}
        {step === "result" && txResult && (
          <div className="bg-pixel-bg-medium border-4 border-pixel-border p-6 shadow-[8px_8px_0_0_#000]">
            <SendConfirmation
              status={txResult.success ? "success" : "error"}
              txid={txResult.txid}
              errorMessage={txResult.error}
              explorerUrl={config.explorerUrl}
              amountSatoshis={sendState.amountSatoshis}
              recipient={sendState.recipient}
              onSendAnother={handleSendAnother}
              onViewWallet={handleViewWallet}
            />
          </div>
        )}

        {/* Security info */}
        <div className="mt-8 p-4 bg-pixel-bg-light border-4 border-dashed border-pixel-border">
          <h3 className="font-pixel text-xs text-pixel-secondary mb-3">
            TRANSACTION INFO
          </h3>
          <ul className="space-y-2 font-pixel-body text-sm text-pixel-text-muted">
            <li>
              <span className="text-pixel-success">*</span> Transactions are
              signed locally
            </li>
            <li>
              <span className="text-pixel-success">*</span> Private keys never
              leave your device
            </li>
            <li>
              <span className="text-pixel-primary">*</span> Bitcoin transactions
              are irreversible
            </li>
            <li>
              <span className="text-pixel-primary">*</span> Always verify the
              recipient address
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
