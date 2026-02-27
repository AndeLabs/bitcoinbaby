"use client";

/**
 * WithdrawSection Component
 *
 * Complete withdrawal management interface.
 * Displays virtual balance, withdrawal pools, and pending requests.
 */

import { useState } from "react";
import { PixelCard, PixelButton } from "@bitcoinbaby/ui";
import type { PoolType, WithdrawRequest } from "@bitcoinbaby/core";
import { useVirtualBalance } from "../../hooks/useVirtualBalance";
import { useWithdrawPool, formatPoolType } from "../../hooks/useWithdrawPool";
import { useWallet } from "../../hooks/useWallet";
import { WithdrawPoolCard } from "./WithdrawPoolCard";

/**
 * Format bigint for display
 */
function formatBalance(balance: bigint): string {
  return balance.toLocaleString();
}

/**
 * Format timestamp
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: WithdrawRequest["status"] }) {
  const colors: Record<WithdrawRequest["status"], string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    processing: "bg-blue-500/20 text-blue-400",
    broadcast: "bg-purple-500/20 text-purple-400",
    confirmed: "bg-green-500/20 text-green-400",
    failed: "bg-red-500/20 text-red-400",
    cancelled: "bg-gray-500/20 text-gray-400",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-pixel ${colors[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

export function WithdrawSection() {
  const { wallet } = useWallet();
  const [destinationAddress, setDestinationAddress] = useState("");
  const [activeTab, setActiveTab] = useState<"pools" | "requests">("pools");

  // Virtual balance from Workers API
  const {
    totalBalance,
    virtualBalance,
    pendingWithdraw,
    availableToWithdraw,
    onChainBalance,
    totalMined,
    totalWithdrawn,
    isLoading: balanceLoading,
    error: balanceError,
    refresh: refreshBalance,
  } = useVirtualBalance({ address: wallet?.address });

  // Withdrawal pools
  const {
    pools,
    requests,
    isSubmitting,
    error: poolsError,
    createWithdrawRequest,
    cancelRequest,
    refresh: refreshPools,
  } = useWithdrawPool({ address: wallet?.address });

  // Handle withdrawal
  const handleWithdraw = async (
    poolType: PoolType,
    amount: bigint,
  ): Promise<{ success: boolean; error?: string }> => {
    const toAddress = destinationAddress || wallet?.address;

    if (!toAddress) {
      return { success: false, error: "No destination address" };
    }

    const result = await createWithdrawRequest(poolType, toAddress, amount);

    if (result.success) {
      // Refresh balance to reflect reserved amount
      await refreshBalance();
    }

    return result;
  };

  // Handle cancel
  const handleCancel = async (request: WithdrawRequest) => {
    const result = await cancelRequest(request.poolType, request.id);

    if (result.success) {
      await refreshBalance();
    }
  };

  // Refresh all
  const handleRefresh = async () => {
    await Promise.all([refreshBalance(), refreshPools()]);
  };

  if (!wallet?.address) {
    return (
      <PixelCard>
        <div className="p-6 text-center">
          <p className="font-pixel text-lg mb-2">Connect Wallet</p>
          <p className="text-sm text-gray-400">
            Create or unlock your wallet to manage withdrawals
          </p>
        </div>
      </PixelCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Balance Overview */}
      <PixelCard>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-pixel text-lg">$BABY Balance</h2>
            <PixelButton onClick={handleRefresh} size="sm" variant="secondary">
              Refresh
            </PixelButton>
          </div>

          {balanceLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-8 bg-pixel-bg-dark rounded" />
              <div className="h-4 bg-pixel-bg-dark rounded w-1/2" />
            </div>
          ) : (
            <>
              {/* Main Balance */}
              <div className="text-center mb-4">
                <p className="text-4xl font-pixel text-pixel-primary">
                  {formatBalance(totalBalance)}
                </p>
                <p className="text-sm text-gray-400">Total $BABY</p>
              </div>

              {/* Balance Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-pixel-bg-dark/50 rounded p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Virtual</p>
                  <p className="font-pixel text-sm text-green-400">
                    {formatBalance(virtualBalance)}
                  </p>
                </div>
                <div className="bg-pixel-bg-dark/50 rounded p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">On-Chain</p>
                  <p className="font-pixel text-sm text-blue-400">
                    {formatBalance(onChainBalance)}
                  </p>
                </div>
                <div className="bg-pixel-bg-dark/50 rounded p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Pending</p>
                  <p className="font-pixel text-sm text-yellow-400">
                    {formatBalance(pendingWithdraw)}
                  </p>
                </div>
                <div className="bg-pixel-bg-dark/50 rounded p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Available</p>
                  <p className="font-pixel text-sm text-pixel-secondary">
                    {formatBalance(availableToWithdraw)}
                  </p>
                </div>
              </div>

              {/* Lifetime Stats */}
              <div className="flex justify-center gap-6 mt-4 text-xs text-gray-400">
                <span>
                  Mined:{" "}
                  <span className="text-white">
                    {formatBalance(totalMined)}
                  </span>
                </span>
                <span>
                  Withdrawn:{" "}
                  <span className="text-white">
                    {formatBalance(totalWithdrawn)}
                  </span>
                </span>
              </div>

              {balanceError && (
                <p className="text-xs text-red-400 text-center mt-2">
                  {balanceError}
                </p>
              )}
            </>
          )}
        </div>
      </PixelCard>

      {/* Destination Address */}
      <PixelCard>
        <div className="p-4">
          <label className="block text-sm font-pixel mb-2">
            Destination Address (optional)
          </label>
          <input
            type="text"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            placeholder={wallet.address}
            className="w-full px-3 py-2 bg-pixel-bg-dark border border-pixel-primary/30 rounded font-mono text-sm focus:border-pixel-primary outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Leave empty to withdraw to your wallet address
          </p>
        </div>
      </PixelCard>

      {/* Tabs */}
      <div className="flex gap-2">
        <PixelButton
          onClick={() => setActiveTab("pools")}
          variant={activeTab === "pools" ? "default" : "secondary"}
          size="sm"
        >
          Withdrawal Pools
        </PixelButton>
        <PixelButton
          onClick={() => setActiveTab("requests")}
          variant={activeTab === "requests" ? "default" : "secondary"}
          size="sm"
        >
          My Requests ({requests.length})
        </PixelButton>
      </div>

      {/* Pool Selection */}
      {activeTab === "pools" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["monthly", "weekly", "low_fee", "immediate"] as PoolType[]).map(
            (poolType) => (
              <WithdrawPoolCard
                key={poolType}
                poolType={poolType}
                poolInfo={pools[poolType]}
                availableBalance={availableToWithdraw}
                onWithdraw={handleWithdraw}
                isSubmitting={isSubmitting}
              />
            ),
          )}
        </div>
      )}

      {/* Pending Requests */}
      {activeTab === "requests" && (
        <PixelCard>
          <div className="p-4">
            <h3 className="font-pixel text-sm mb-4">Withdrawal Requests</h3>

            {requests.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                No withdrawal requests yet
              </p>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-pixel-bg-dark/50 rounded p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-pixel text-sm">
                          {formatBalance(BigInt(request.amount))} $BABY
                        </span>
                        <StatusBadge status={request.status} />
                      </div>
                      <div className="text-xs text-gray-400">
                        <span>{formatPoolType(request.poolType)}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(request.requestedAt)}</span>
                      </div>
                      {request.txid && (
                        <a
                          href={`https://mempool.space/testnet4/tx/${request.txid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-pixel-secondary hover:underline"
                        >
                          View TX
                        </a>
                      )}
                      {request.error && (
                        <p className="text-xs text-red-400 mt-1">
                          {request.error}
                        </p>
                      )}
                    </div>

                    {request.status === "pending" && (
                      <PixelButton
                        onClick={() => handleCancel(request)}
                        size="sm"
                        variant="secondary"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </PixelButton>
                    )}
                  </div>
                ))}
              </div>
            )}

            {poolsError && (
              <p className="text-xs text-red-400 text-center mt-2">
                {poolsError}
              </p>
            )}
          </div>
        </PixelCard>
      )}

      {/* Info */}
      <div className="text-xs text-gray-400 text-center space-y-1">
        <p>Withdrawals are batched to minimize Bitcoin transaction fees.</p>
        <p>
          Monthly pool has the lowest fees. Immediate pool processes within 1
          hour.
        </p>
      </div>
    </div>
  );
}

export default WithdrawSection;
