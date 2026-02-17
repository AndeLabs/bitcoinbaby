/**
 * Production Error System
 *
 * Typed errors for consistent error handling across the application.
 * Follows best practices for production error management.
 */

// =============================================================================
// ERROR CODES
// =============================================================================

export const ErrorCode = {
  // Network errors (1xxx)
  NETWORK_ERROR: "NETWORK_ERROR",
  NETWORK_TIMEOUT: "NETWORK_TIMEOUT",
  NETWORK_OFFLINE: "NETWORK_OFFLINE",
  API_ERROR: "API_ERROR",
  RATE_LIMITED: "RATE_LIMITED",

  // Wallet errors (2xxx)
  WALLET_NOT_FOUND: "WALLET_NOT_FOUND",
  WALLET_LOCKED: "WALLET_LOCKED",
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
  INVALID_ADDRESS: "INVALID_ADDRESS",
  INVALID_PRIVATE_KEY: "INVALID_PRIVATE_KEY",

  // Transaction errors (3xxx)
  TX_BUILD_FAILED: "TX_BUILD_FAILED",
  TX_SIGN_FAILED: "TX_SIGN_FAILED",
  TX_BROADCAST_FAILED: "TX_BROADCAST_FAILED",
  TX_REJECTED: "TX_REJECTED",
  TX_NOT_FOUND: "TX_NOT_FOUND",
  INVALID_PSBT: "INVALID_PSBT",

  // Mining errors (4xxx)
  MINING_NOT_SUPPORTED: "MINING_NOT_SUPPORTED",
  MINING_ALREADY_RUNNING: "MINING_ALREADY_RUNNING",
  MINING_NOT_RUNNING: "MINING_NOT_RUNNING",
  WORKER_ERROR: "WORKER_ERROR",
  WEBGPU_NOT_AVAILABLE: "WEBGPU_NOT_AVAILABLE",

  // Validation errors (5xxx)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_HASH: "INVALID_HASH",
  INVALID_NONCE: "INVALID_NONCE",
  INVALID_DIFFICULTY: "INVALID_DIFFICULTY",
  INVALID_TIMESTAMP: "INVALID_TIMESTAMP",

  // NFT errors (6xxx)
  NFT_NOT_FOUND: "NFT_NOT_FOUND",
  NFT_MINT_FAILED: "NFT_MINT_FAILED",
  NFT_EVOLVE_FAILED: "NFT_EVOLVE_FAILED",
  NFT_INSUFFICIENT_XP: "NFT_INSUFFICIENT_XP",

  // Storage errors (7xxx)
  STORAGE_ERROR: "STORAGE_ERROR",
  STORAGE_QUOTA_EXCEEDED: "STORAGE_QUOTA_EXCEEDED",
  STORAGE_NOT_AVAILABLE: "STORAGE_NOT_AVAILABLE",

  // Unknown
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

// =============================================================================
// BASE ERROR CLASS
// =============================================================================

export interface ErrorDetails {
  code: ErrorCodeType;
  message: string;
  cause?: Error;
  context?: Record<string, unknown>;
  timestamp: number;
  recoverable: boolean;
  retryable: boolean;
}

/**
 * Base error class for all application errors
 */
export class AppError extends Error {
  readonly code: ErrorCodeType;
  readonly context?: Record<string, unknown>;
  readonly timestamp: number;
  readonly recoverable: boolean;
  readonly retryable: boolean;
  override readonly cause?: Error;

  constructor(
    code: ErrorCodeType,
    message: string,
    options: {
      cause?: Error;
      context?: Record<string, unknown>;
      recoverable?: boolean;
      retryable?: boolean;
    } = {},
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.cause = options.cause;
    this.context = options.context;
    this.timestamp = Date.now();
    this.recoverable = options.recoverable ?? true;
    this.retryable = options.retryable ?? false;

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      cause: this.cause,
      context: this.context,
      timestamp: this.timestamp,
      recoverable: this.recoverable,
      retryable: this.retryable,
    };
  }

  /**
   * Create a user-friendly error message
   */
  toUserMessage(): string {
    const messages: Record<ErrorCodeType, string> = {
      NETWORK_ERROR: "Connection error. Please check your internet connection.",
      NETWORK_TIMEOUT: "Request timed out. Please try again.",
      NETWORK_OFFLINE: "You appear to be offline.",
      API_ERROR: "Server error. Please try again later.",
      RATE_LIMITED: "Too many requests. Please wait a moment.",

      WALLET_NOT_FOUND: "Wallet not found. Please create or import a wallet.",
      WALLET_LOCKED: "Wallet is locked. Please unlock to continue.",
      INSUFFICIENT_BALANCE: "Insufficient balance for this transaction.",
      INVALID_ADDRESS: "Invalid Bitcoin address.",
      INVALID_PRIVATE_KEY: "Invalid private key.",

      TX_BUILD_FAILED: "Failed to build transaction.",
      TX_SIGN_FAILED: "Failed to sign transaction.",
      TX_BROADCAST_FAILED: "Failed to broadcast transaction.",
      TX_REJECTED: "Transaction was rejected by the network.",
      TX_NOT_FOUND: "Transaction not found.",
      INVALID_PSBT: "Invalid transaction data.",

      MINING_NOT_SUPPORTED: "Mining is not supported on this device.",
      MINING_ALREADY_RUNNING: "Mining is already running.",
      MINING_NOT_RUNNING: "Mining is not currently running.",
      WORKER_ERROR: "Mining worker error.",
      WEBGPU_NOT_AVAILABLE: "WebGPU is not available on this device.",

      VALIDATION_ERROR: "Validation error.",
      INVALID_HASH: "Invalid hash format.",
      INVALID_NONCE: "Invalid nonce value.",
      INVALID_DIFFICULTY: "Invalid difficulty value.",
      INVALID_TIMESTAMP: "Invalid timestamp.",

      NFT_NOT_FOUND: "NFT not found.",
      NFT_MINT_FAILED: "Failed to mint NFT.",
      NFT_EVOLVE_FAILED: "Failed to evolve NFT.",
      NFT_INSUFFICIENT_XP: "Insufficient XP to level up.",

      STORAGE_ERROR: "Storage error.",
      STORAGE_QUOTA_EXCEEDED: "Storage quota exceeded.",
      STORAGE_NOT_AVAILABLE: "Storage is not available.",

      UNKNOWN_ERROR: "An unexpected error occurred.",
    };

    return messages[this.code] || this.message;
  }
}

// =============================================================================
// SPECIALIZED ERROR CLASSES
// =============================================================================

/**
 * Network-related errors
 */
export class NetworkError extends AppError {
  readonly statusCode?: number;
  readonly url?: string;

  constructor(
    message: string,
    options: {
      code?: ErrorCodeType;
      cause?: Error;
      statusCode?: number;
      url?: string;
      context?: Record<string, unknown>;
    } = {},
  ) {
    super(options.code ?? ErrorCode.NETWORK_ERROR, message, {
      cause: options.cause,
      context: {
        ...options.context,
        statusCode: options.statusCode,
        url: options.url,
      },
      retryable: true,
    });
    this.name = "NetworkError";
    this.statusCode = options.statusCode;
    this.url = options.url;
  }
}

/**
 * Wallet-related errors
 */
export class WalletError extends AppError {
  constructor(
    code: ErrorCodeType,
    message: string,
    options: {
      cause?: Error;
      context?: Record<string, unknown>;
    } = {},
  ) {
    super(code, message, {
      ...options,
      recoverable: code !== ErrorCode.INVALID_PRIVATE_KEY,
      retryable: false,
    });
    this.name = "WalletError";
  }
}

/**
 * Transaction-related errors
 */
export class TransactionError extends AppError {
  readonly txid?: string;

  constructor(
    code: ErrorCodeType,
    message: string,
    options: {
      cause?: Error;
      txid?: string;
      context?: Record<string, unknown>;
    } = {},
  ) {
    super(code, message, {
      cause: options.cause,
      context: { ...options.context, txid: options.txid },
      retryable: code === ErrorCode.TX_BROADCAST_FAILED,
    });
    this.name = "TransactionError";
    this.txid = options.txid;
  }
}

/**
 * Mining-related errors
 */
export class MiningError extends AppError {
  constructor(
    code: ErrorCodeType,
    message: string,
    options: {
      cause?: Error;
      context?: Record<string, unknown>;
    } = {},
  ) {
    super(code, message, {
      ...options,
      recoverable: true,
      retryable: code === ErrorCode.WORKER_ERROR,
    });
    this.name = "MiningError";
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  readonly field?: string;

  constructor(
    message: string,
    options: {
      code?: ErrorCodeType;
      cause?: Error;
      field?: string;
      context?: Record<string, unknown>;
    } = {},
  ) {
    super(options.code ?? ErrorCode.VALIDATION_ERROR, message, {
      cause: options.cause,
      context: { ...options.context, field: options.field },
      recoverable: true,
      retryable: false,
    });
    this.name = "ValidationError";
    this.field = options.field;
  }
}

// =============================================================================
// ERROR UTILITIES
// =============================================================================

/**
 * Check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Wrap any error in an AppError
 */
export function wrapError(error: unknown, code?: ErrorCodeType): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const message =
    error instanceof Error ? error.message : String(error ?? "Unknown error");

  return new AppError(code ?? ErrorCode.UNKNOWN_ERROR, message, {
    cause: error instanceof Error ? error : undefined,
  });
}

/**
 * Create a network error from a fetch response
 */
export async function createNetworkError(
  response: Response,
  url: string,
): Promise<NetworkError> {
  let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

  try {
    const body = await response.text();
    const json = JSON.parse(body);
    if (json.error) {
      errorMessage = json.error;
    } else if (json.message) {
      errorMessage = json.message;
    }
  } catch {
    // Use default message
  }

  const code =
    response.status === 429 ? ErrorCode.RATE_LIMITED : ErrorCode.API_ERROR;

  return new NetworkError(errorMessage, {
    code,
    statusCode: response.status,
    url,
  });
}

/**
 * Safely execute an async function and return result or error
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
): Promise<[T, null] | [null, AppError]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    return [null, wrapError(error)];
  }
}

/**
 * Safely execute a sync function and return result or error
 */
export function tryCatchSync<T>(fn: () => T): [T, null] | [null, AppError] {
  try {
    const result = fn();
    return [result, null];
  } catch (error) {
    return [null, wrapError(error)];
  }
}
