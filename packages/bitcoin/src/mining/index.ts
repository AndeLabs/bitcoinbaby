/**
 * Mining Integration Module
 *
 * Connects mining proof-of-work results with Scrolls API for token minting.
 * Now with REAL transaction building and broadcasting.
 */

export {
  MiningSubmitter,
  createMiningSubmitter,
  type MiningSubmitterOptions,
} from "./submitter";

export type {
  MiningSubmission,
  SubmissionStatus,
  SubmissionResult,
  MiningProof,
  RewardParams,
} from "./types";
