"use client";

/**
 * WalletSection - Wallet management
 *
 * Complete wallet interface with:
 * - Onboarding (create/import)
 * - Lock/unlock
 * - Balance display
 * - Send/receive
 * - Network switching
 */

import { useState, useCallback } from "react";
import {
  useWallet,
  useBalance,
  useTokenBalance,
  useVirtualBalance,
} from "@/hooks";
import {
  NetworkSwitcher,
  NetworkBadge,
  WalletOnboarding,
  QRCode,
} from "@bitcoinbaby/ui";
import {
  useNetworkStore,
  useTokenBalance as useCharmsTokenBalance,
  useMiningBoost,
  MIN_PASSWORD_LENGTH,
} from "@bitcoinbaby/core";
import {
  generateMnemonicFromEntropy,
  validateMnemonic,
  getDeploymentConfig,
} from "@bitcoinbaby/bitcoin";

// Real App IDs from deployment
const { appId: BABTC_APP_ID } = getDeploymentConfig("testnet4");
const NFT_APP_ID = "genesis_babies_testnet4"; // Genesis Babies NFT collection

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
      className={`px-3 py-1 font-pixel text-[8px] border-2 border-black transition-all ${
        copied
          ? "bg-pixel-success text-black"
          : "bg-pixel-bg-dark text-pixel-text hover:bg-pixel-primary hover:text-black"
      }`}
    >
      {copied ? "COPIED!" : label}
    </button>
  );
}

// Password modal for unlock
function UnlockModal({
  onSubmit,
  onCancel,
  isLoading,
  error,
}: {
  onSubmit: (password: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use MIN_PASSWORD_LENGTH for consistent security
    if (password.length >= MIN_PASSWORD_LENGTH) {
      onSubmit(password);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-pixel-bg-dark border-4 border-black p-6 shadow-[8px_8px_0_0_#000] max-w-sm mx-4">
        <h3 className="font-pixel text-pixel-primary text-sm mb-4">
          UNLOCK WALLET
        </h3>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-3 py-2 mb-4 font-pixel text-xs bg-pixel-bg-light border-2 border-black text-pixel-text"
            autoFocus
          />

          {error && (
            <p className="font-pixel text-[8px] text-pixel-error mb-4">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 font-pixel text-[10px] uppercase bg-pixel-bg-light text-pixel-text border-2 border-black hover:bg-pixel-bg-dark disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || password.length < MIN_PASSWORD_LENGTH}
              className="flex-1 px-4 py-2 font-pixel text-[10px] uppercase bg-pixel-success text-black border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] disabled:opacity-50"
            >
              {isLoading ? "..." : "Unlock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function WalletSection() {
  const { network, switchNetwork, mainnetAllowed, setMainnetAllowed, config } =
    useNetworkStore();

  const {
    wallet,
    isLocked,
    hasStoredWallet,
    isLoading: walletLoading,
    error: walletError,
    createWallet,
    importWallet,
    unlock,
    lock,
    deleteWallet,
  } = useWallet();

  const {
    btcBalance,
    balance: addressBalance,
    isLoading: balanceLoading,
    refresh: refreshBalance,
    lastUpdated,
  } = useBalance({
    address: wallet?.address,
    network,
    autoRefresh: !isLocked,
    refreshInterval: 30000,
  });

  // Use token balance hook to keep connection alive
  useTokenBalance({ address: wallet?.address });

  // Virtual balance from Workers API
  const {
    virtualBalance,
    totalMined,
    isLoading: virtualBalanceLoading,
  } = useVirtualBalance({
    address: wallet?.address,
  });

  const {
    formatted: babtcFormatted,
    loading: babtcLoading,
    error: babtcError,
  } = useCharmsTokenBalance(wallet?.address ?? null, BABTC_APP_ID, {
    autoRefresh: !isLocked,
    refreshInterval: 60000,
  });

  const {
    boost: miningBoost,
    nftCount,
    loading: boostLoading,
  } = useMiningBoost(wallet?.address ?? null, NFT_APP_ID, {
    autoRefresh: !isLocked,
    refreshInterval: 120000,
  });

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const handleGenerateMnemonic = useCallback((entropy: Uint8Array): string => {
    const entropySlice = entropy.slice(0, 16);
    return generateMnemonicFromEntropy(entropySlice);
  }, []);

  const handleWalletCreated = useCallback(
    async (mnemonic: string, password: string) => {
      await createWallet(password, 12, mnemonic);
    },
    [createWallet],
  );

  const handleWalletImported = useCallback(
    async (mnemonic: string, password: string) => {
      await importWallet(mnemonic, password);
    },
    [importWallet],
  );

  const handleUnlock = useCallback(
    async (password: string) => {
      setUnlockError(null);
      try {
        await unlock(password);
        setShowUnlockModal(false);
      } catch (err) {
        setUnlockError(err instanceof Error ? err.message : "Failed to unlock");
      }
    },
    [unlock],
  );

  const handleDelete = useCallback(async () => {
    const confirmed = window.confirm(
      "Are you ABSOLUTELY sure?\n\n" +
        "This will permanently delete your wallet from this device.\n" +
        "Make sure you have your 12-word recovery phrase saved!\n\n" +
        "Without the recovery phrase, your Bitcoin will be LOST FOREVER.",
    );

    if (confirmed) {
      const doubleConfirm = window.confirm(
        "FINAL WARNING: Type 'DELETE' mentally and click OK to confirm deletion.",
      );
      if (doubleConfirm) {
        await deleteWallet();
      }
    }
  }, [deleteWallet]);

  return (
    <div className="p-4 md:p-8 bg-pixel-bg-dark">
      <div className="max-w-2xl mx-auto">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="font-pixel text-xl text-pixel-primary">WALLET</h2>
            <NetworkSwitcher
              network={network}
              mainnetAllowed={mainnetAllowed}
              onNetworkChange={switchNetwork}
              onEnableMainnet={() => setMainnetAllowed(true)}
            />
          </div>
          <p className="font-pixel-body text-sm text-pixel-text-muted mt-2">
            Bitcoin {network === "mainnet" ? "Mainnet" : "Testnet4"} - Taproot
            (P2TR/BIP86)
          </p>
        </div>

        {/* No wallet - Show onboarding */}
        {!hasStoredWallet && (
          <WalletOnboarding
            onWalletCreated={handleWalletCreated}
            onWalletImported={handleWalletImported}
            generateMnemonic={handleGenerateMnemonic}
            validateMnemonic={validateMnemonic}
          />
        )}

        {/* Wallet exists but locked */}
        {hasStoredWallet && isLocked && (
          <div className="bg-pixel-bg-medium border-4 border-pixel-border p-6 shadow-[8px_8px_0_0_#000]">
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-pixel-error/20 border-4 border-pixel-error">
                <span className="font-pixel text-3xl text-pixel-error">🔒</span>
              </div>
              <h2 className="font-pixel text-lg text-pixel-text mb-2">
                WALLET LOCKED
              </h2>
              <p className="font-pixel-body text-sm text-pixel-text-muted mb-6">
                Enter your password to access your wallet
              </p>
              <button
                onClick={() => setShowUnlockModal(true)}
                disabled={walletLoading}
                className="px-8 py-4 font-pixel text-sm border-4 border-black shadow-[4px_4px_0_0_#000] bg-pixel-success text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all disabled:opacity-50"
              >
                UNLOCK WALLET
              </button>
            </div>

            <div className="border-t-2 border-pixel-border pt-6 mt-6">
              <p className="font-pixel text-[10px] text-pixel-text-muted text-center mb-4">
                Forgot password? You can restore using your recovery phrase.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 font-pixel text-[10px] text-pixel-error border-2 border-pixel-error hover:bg-pixel-error hover:text-white transition-colors"
                >
                  DELETE & RESTORE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wallet unlocked - Show dashboard */}
        {hasStoredWallet && !isLocked && wallet && (
          <div className="bg-pixel-bg-medium border-4 border-pixel-border p-6 shadow-[8px_8px_0_0_#000]">
            <div className="space-y-6">
              {/* Address Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-pixel text-[10px] text-pixel-text-muted">
                    YOUR ADDRESS
                  </label>
                  <div className="flex items-center gap-2">
                    <NetworkBadge network={network} />
                    <span className="px-2 py-0.5 font-pixel text-[6px] bg-pixel-bg-light text-pixel-text-muted border border-pixel-border">
                      TAPROOT
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-pixel-bg-dark p-3 border-2 border-pixel-border">
                  <span className="font-pixel text-xs text-pixel-text flex-1 break-all">
                    {wallet.address}
                  </span>
                  <CopyButton text={wallet.address} label="COPY" />
                </div>
              </div>

              {/* QR Code */}
              <QRCode data={wallet.address} />

              {/* Balances */}
              <div className="grid grid-cols-2 gap-4">
                {/* BTC Balance */}
                <div className="bg-pixel-bg-dark p-4 border-2 border-pixel-border">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-pixel text-[8px] text-pixel-text-muted">
                      BTC BALANCE
                    </label>
                    <button
                      onClick={refreshBalance}
                      disabled={balanceLoading}
                      className="font-pixel text-[6px] text-pixel-text-muted hover:text-pixel-primary disabled:opacity-50"
                    >
                      {balanceLoading ? "..." : "↻"}
                    </button>
                  </div>
                  <span className="font-pixel text-xl text-pixel-text">
                    {btcBalance}
                  </span>
                  {addressBalance && addressBalance.unconfirmed !== 0 && (
                    <p className="font-pixel text-[6px] text-pixel-secondary mt-1">
                      +{(addressBalance.unconfirmed / 100_000_000).toFixed(8)}{" "}
                      pending
                    </p>
                  )}
                </div>

                {/* $BABY Virtual Balance (Primary) */}
                <div className="bg-pixel-bg-dark p-4 border-2 border-pixel-success">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-pixel text-[8px] text-pixel-text-muted">
                      $BABY BALANCE
                    </label>
                    {virtualBalanceLoading && (
                      <span className="font-pixel text-[6px] text-pixel-text-muted animate-pulse">
                        ...
                      </span>
                    )}
                  </div>
                  <span className="font-pixel text-xl text-pixel-success">
                    {virtualBalanceLoading
                      ? "---"
                      : virtualBalance.toLocaleString()}
                  </span>
                  <p className="font-pixel text-[6px] text-pixel-text-muted mt-1">
                    Total mined: {totalMined.toLocaleString()}
                  </p>
                </div>

                {/* BABTC Token Balance */}
                <div className="bg-pixel-bg-dark p-4 border-2 border-pixel-border">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-pixel text-[8px] text-pixel-text-muted">
                      BABTC (CHARMS)
                    </label>
                    {babtcLoading && (
                      <span className="font-pixel text-[6px] text-pixel-text-muted animate-pulse">
                        ...
                      </span>
                    )}
                  </div>
                  {babtcError ? (
                    <span className="font-pixel text-sm text-pixel-error">
                      Error
                    </span>
                  ) : (
                    <span className="font-pixel text-xl text-pixel-secondary">
                      {babtcLoading ? "---" : babtcFormatted}
                    </span>
                  )}
                </div>

                {/* Mining Boost */}
                <div className="bg-pixel-bg-dark p-4 border-2 border-pixel-border">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-pixel text-[8px] text-pixel-text-muted">
                      MINING BOOST
                    </label>
                    {boostLoading && (
                      <span className="font-pixel text-[6px] text-pixel-text-muted animate-pulse">
                        ...
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`font-pixel text-xl ${
                        miningBoost > 0
                          ? "text-pixel-success"
                          : "text-pixel-text"
                      }`}
                    >
                      {boostLoading ? "---" : `+${miningBoost}%`}
                    </span>
                    {nftCount > 0 && (
                      <span className="font-pixel text-[8px] text-pixel-text-muted">
                        ({nftCount} NFT{nftCount !== 1 ? "s" : ""})
                      </span>
                    )}
                  </div>
                  {miningBoost === 0 && !boostLoading && (
                    <p className="font-pixel text-[6px] text-pixel-text-muted mt-1">
                      Get Genesis Babies for boost
                    </p>
                  )}
                </div>
              </div>

              {lastUpdated && (
                <p className="font-pixel text-[6px] text-pixel-text-muted text-center">
                  Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                </p>
              )}

              {/* Primary Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-pixel-border">
                <a
                  href="/wallet/send"
                  className="flex-1 py-3 font-pixel text-[10px] text-center bg-pixel-primary text-black border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all"
                >
                  SEND
                </a>
                <a
                  href="/wallet/withdraw"
                  className="flex-1 py-3 font-pixel text-[10px] text-center bg-pixel-success text-black border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all"
                >
                  WITHDRAW
                </a>
                <a
                  href="/wallet/history"
                  className="flex-1 py-3 font-pixel text-[10px] text-center bg-pixel-bg-light text-pixel-text border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all"
                >
                  HISTORY
                </a>
              </div>

              {/* Get Testnet BTC */}
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

              {/* Secondary Actions */}
              <div className="flex gap-3 pt-3">
                <button
                  onClick={lock}
                  className="flex-1 py-3 font-pixel text-[10px] bg-pixel-bg-light text-pixel-text border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all"
                >
                  LOCK
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-3 font-pixel text-[10px] bg-pixel-error text-white border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all"
                >
                  DELETE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {walletError && (
          <div className="mt-4 p-3 bg-pixel-error/20 border-2 border-pixel-error">
            <p className="font-pixel text-[10px] text-pixel-error text-center">
              {walletError}
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-pixel-bg-light border-4 border-dashed border-pixel-border">
          <h3 className="font-pixel text-xs text-pixel-secondary mb-3">
            SECURITY INFO
          </h3>
          <ul className="space-y-2 font-pixel-body text-sm text-pixel-text-muted">
            <li>
              <span className="text-pixel-success">●</span> Wallet encrypted
              with AES-256-GCM
            </li>
            <li>
              <span className="text-pixel-success">●</span> 600,000 PBKDF2
              iterations (OWASP 2024)
            </li>
            <li>
              <span className="text-pixel-success">●</span> Stored locally in
              IndexedDB
            </li>
            <li>
              <span className="text-pixel-success">●</span> Never sent to any
              server
            </li>
            <li>
              <span className="text-pixel-primary">●</span> Recovery phrase is
              your only backup!
            </li>
          </ul>
        </div>

        {/* Explorer link */}
        {wallet && (
          <div className="mt-4 text-center">
            <a
              href={`${config.explorerUrl}/address/${wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-pixel text-[10px] text-pixel-secondary hover:text-pixel-primary underline"
            >
              View on Explorer
            </a>
          </div>
        )}
      </div>

      {/* Unlock Modal */}
      {showUnlockModal && (
        <UnlockModal
          onSubmit={handleUnlock}
          onCancel={() => {
            setShowUnlockModal(false);
            setUnlockError(null);
          }}
          isLoading={walletLoading}
          error={unlockError}
        />
      )}
    </div>
  );
}

export default WalletSection;
