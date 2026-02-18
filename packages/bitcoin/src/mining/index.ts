/**
 * Mining Integration Module
 *
 * Connects mining proof-of-work results with Scrolls API for token minting.
 * Updated for Charms Protocol v10 with BRO-style mining flow.
 */

export {
  MiningSubmitter,
  createMiningSubmitter,
  type MiningSubmitterOptions,
  // V10 Types
  type SubmissionResultV10,
} from "./submitter";

export type {
  MiningSubmission,
  SubmissionStatus,
  SubmissionResult,
  MiningProof,
  RewardParams,
} from "./types";
