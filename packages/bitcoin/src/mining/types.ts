/**
 * Mining Submission Types
 */

/**
 * Status of a mining submission
 */
export type SubmissionStatus =
  | "pending"
  | "submitted"
  | "confirmed"
  | "failed"
  | "expired";

/**
 * Mining submission data
 */
export interface MiningSubmission {
  id: string;
  hash: string;
  nonce: number;
  difficulty: number;
  timestamp: number;
  minerAddress: string;
  blockData: string;
  status: SubmissionStatus;
  txid?: string;
  error?: string;
  reward?: bigint;
  submittedAt?: number;
  confirmedAt?: number;
}

/**
 * Result of submitting a mining proof
 */
export interface SubmissionResult {
  success: boolean;
  submission: MiningSubmission;
  /** Transaction ID if broadcast */
  txid?: string;
  /** Error message if failed */
  error?: string;
  /** Base64 PSBT for external signing */
  psbt?: string;
  /** Raw signed transaction hex */
  rawTx?: string;
  /** Unsigned transaction data */
  unsignedTx?: unknown;
}

/**
 * Mining proof from the miner
 */
export interface MiningProof {
  hash: string;
  nonce: number;
  difficulty: number;
  blockData: string;
  timestamp: number;
}

/**
 * Reward calculation parameters
 */
export interface RewardParams {
  baseDifficulty: number;
  baseReward: bigint;
  difficultyMultiplier: number;
}
