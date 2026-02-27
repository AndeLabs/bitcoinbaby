"use client";

/**
 * useMiningShareSubmission Hook
 *
 * Unified share submission logic that:
 * 1. Subscribes to useGlobalMining internally (singleton, no overhead)
 * 2. Credits shares to virtual balance via Workers API
 * 3. Optionally submits to blockchain if user has BTC
 * 4. Provides unified notification system
 * 5. Deduplicates shares by hash
 *
 * This is the single source of truth for share submission.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useGlobalMining, calculateShareReward } from "@bitcoinbaby/core";
import { useWallet } from "./useWallet";
import { useVirtualBalance } from "./useVirtualBalance";
import { useMiningSubmitter } from "./useMiningSubmitter";

// =============================================================================
// TYPES
// =============================================================================

export type SubmissionStrategy = "virtual-first" | "blockchain-only";

export interface SubmissionNotification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  timestamp: number;
  reward?: bigint;
  txid?: string;
}

export interface SubmissionResult {
  success: boolean;
  credited?: bigint;
  txid?: string;
  error?: string;
}

export interface UseMiningShareSubmissionOptions {
  /** Submission strategy */
  strategy?: SubmissionStrategy;
  /** Notification callback */
  onNotification?: (notification: SubmissionNotification) => void;
  /** Enable auto-submission (default: true) */
  autoSubmit?: boolean;
  /** Minimum shares before submitting batch (default: 1) */
  batchSize?: number;
}

export interface UseMiningShareSubmissionReturn {
  /** Number of shares pending submission */
  pendingShares: number;
  /** Total shares submitted this session */
  submittedShares: number;
  /** Whether currently submitting */
  isSubmitting: boolean;
  /** Last submission result */
  lastSubmission: SubmissionResult | null;
  /** Recent notifications */
  notifications: SubmissionNotification[];
  /** Manual submit trigger */
  submitPendingShares: () => Promise<void>;
  /** Clear notifications */
  clearNotifications: () => void;
  /** Current strategy */
  strategy: SubmissionStrategy;
  /** Whether blockchain submission is available */
  canSubmitToBlockchain: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_NOTIFICATIONS = 10;
const SHARE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

// Reward calculation now uses centralized tokenomics constants
// Base: 10,000 $BABY at D16, doubles each difficulty level

// =============================================================================
// HOOK
// =============================================================================

export function useMiningShareSubmission(
  options: UseMiningShareSubmissionOptions = {},
): UseMiningShareSubmissionReturn {
  const {
    strategy = "virtual-first",
    onNotification,
    autoSubmit = true,
    batchSize = 1,
  } = options;

  // Subscribe to global mining (singleton - no extra overhead)
  const mining = useGlobalMining();

  // Wallet for blockchain submission
  const { wallet, isLocked } = useWallet();
  const address = wallet?.address;

  // Virtual balance for crediting
  const { creditMining } = useVirtualBalance({ address });

  // Blockchain submitter
  const { submitProof, canMine: canSubmitToBlockchain } = useMiningSubmitter();

  // State
  const [pendingShares, setPendingShares] = useState(0);
  const [submittedShares, setSubmittedShares] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<SubmissionResult | null>(
    null,
  );
  const [notifications, setNotifications] = useState<SubmissionNotification[]>(
    [],
  );

  // Track processed shares to avoid duplicates
  const processedSharesRef = useRef<Set<string>>(new Set());
  const lastShareCountRef = useRef(0);

  // Pending share queue
  const pendingQueueRef = useRef<
    Array<{
      hash: string;
      nonce: number;
      difficulty: number;
      blockData: string;
      reward: bigint;
      timestamp: number;
    }>
  >([]);

  /**
   * Add notification
   */
  const addNotification = useCallback(
    (notification: Omit<SubmissionNotification, "id" | "timestamp">) => {
      const fullNotification: SubmissionNotification = {
        ...notification,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: Date.now(),
      };

      setNotifications((prev) => {
        const updated = [fullNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
        return updated;
      });

      onNotification?.(fullNotification);
    },
    [onNotification],
  );

  /**
   * Clear notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Submit a single share
   */
  const submitShare = useCallback(
    async (share: {
      hash: string;
      nonce: number;
      difficulty: number;
      blockData: string;
      reward: bigint;
    }): Promise<SubmissionResult> => {
      // Virtual-first strategy: credit to Workers API
      if (strategy === "virtual-first" && address) {
        const result = await creditMining({
          hash: share.hash,
          nonce: share.nonce,
          difficulty: share.difficulty,
          blockData: share.blockData,
          reward: share.reward,
        });

        if (result.success) {
          return {
            success: true,
            credited: share.reward,
          };
        } else {
          return {
            success: false,
            error: result.error,
          };
        }
      }

      // Blockchain-only strategy: submit to Bitcoin via Charms
      if (
        strategy === "blockchain-only" &&
        canSubmitToBlockchain &&
        !isLocked
      ) {
        try {
          const result = await submitProof({
            hash: share.hash,
            nonce: share.nonce,
            difficulty: share.difficulty,
            blockData: share.blockData,
            timestamp: Date.now(),
          });

          if (result.success) {
            return {
              success: true,
              credited: share.reward,
              txid: result.txid,
            };
          } else {
            return {
              success: false,
              error: result.error,
            };
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Submission failed",
          };
        }
      }

      // No submission target available
      return {
        success: false,
        error: address ? "Submission not available" : "No wallet connected",
      };
    },
    [
      strategy,
      address,
      creditMining,
      canSubmitToBlockchain,
      isLocked,
      submitProof,
    ],
  );

  /**
   * Submit all pending shares
   */
  const submitPendingShares = useCallback(async () => {
    if (pendingQueueRef.current.length === 0) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    const toSubmit = [...pendingQueueRef.current];
    pendingQueueRef.current = [];
    setPendingShares(0);

    let successCount = 0;
    let totalCredited = BigInt(0);
    let lastTxid: string | undefined;
    let lastError: string | undefined;

    for (const share of toSubmit) {
      const result = await submitShare(share);

      if (result.success) {
        successCount++;
        totalCredited += result.credited ?? BigInt(0);
        lastTxid = result.txid;
        processedSharesRef.current.add(share.hash);
      } else {
        lastError = result.error;
        // Re-queue failed shares
        pendingQueueRef.current.push(share);
      }
    }

    setSubmittedShares((prev) => prev + successCount);
    setPendingShares(pendingQueueRef.current.length);

    const submissionResult: SubmissionResult = {
      success: successCount > 0,
      credited: totalCredited,
      txid: lastTxid,
      error: successCount === 0 ? lastError : undefined,
    };

    setLastSubmission(submissionResult);
    setIsSubmitting(false);

    // Add notification
    if (successCount > 0) {
      addNotification({
        type: "success",
        title: "Shares Submitted",
        message: `${successCount} share${successCount > 1 ? "s" : ""} credited (+${totalCredited.toString()} $BABY)`,
        reward: totalCredited,
        txid: lastTxid,
      });
    } else if (lastError) {
      addNotification({
        type: "error",
        title: "Submission Failed",
        message: lastError,
      });
    }
  }, [isSubmitting, submitShare, addNotification]);

  /**
   * Watch for new shares from mining
   */
  useEffect(() => {
    // Check if shares increased
    if (mining.shares <= lastShareCountRef.current) {
      lastShareCountRef.current = mining.shares;
      return;
    }

    const newSharesCount = mining.shares - lastShareCountRef.current;
    lastShareCountRef.current = mining.shares;

    // Skip if not running
    if (!mining.isRunning) return;

    // Generate fake share data for each new share
    // In production, the mining worker would provide actual share data
    for (let i = 0; i < newSharesCount; i++) {
      const shareHash = `${Date.now()}-${mining.shares - newSharesCount + i}-${Math.random().toString(36).slice(2)}`;

      // Skip if already processed
      if (processedSharesRef.current.has(shareHash)) continue;

      const reward = calculateShareReward(mining.difficulty);

      pendingQueueRef.current.push({
        hash: shareHash,
        nonce: mining.shares - newSharesCount + i,
        difficulty: mining.difficulty,
        blockData: `block-${Date.now()}`,
        reward,
        timestamp: Date.now(),
      });
    }

    setPendingShares(pendingQueueRef.current.length);

    // Auto-submit if enabled and batch size reached
    if (autoSubmit && pendingQueueRef.current.length >= batchSize) {
      submitPendingShares();
    }
  }, [
    mining.shares,
    mining.isRunning,
    mining.difficulty,
    autoSubmit,
    batchSize,
    submitPendingShares,
  ]);

  /**
   * Clean up expired shares
   */
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      pendingQueueRef.current = pendingQueueRef.current.filter(
        (share) => now - share.timestamp < SHARE_EXPIRY_MS,
      );
      setPendingShares(pendingQueueRef.current.length);

      // Clean up old processed hashes (keep last 1000)
      if (processedSharesRef.current.size > 1000) {
        const entries = Array.from(processedSharesRef.current);
        processedSharesRef.current = new Set(entries.slice(-500));
      }
    }, 60000);

    return () => clearInterval(cleanup);
  }, []);

  return {
    pendingShares,
    submittedShares,
    isSubmitting,
    lastSubmission,
    notifications,
    submitPendingShares,
    clearNotifications,
    strategy,
    canSubmitToBlockchain,
  };
}
