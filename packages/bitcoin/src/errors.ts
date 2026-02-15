/**
 * Bitcoin Wallet Errors
 *
 * Custom error types for better debugging and handling.
 * Professional error handling pattern.
 */

export class BitcoinError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'BitcoinError';
    Object.setPrototypeOf(this, BitcoinError.prototype);
  }
}

// Wallet errors
export class WalletError extends BitcoinError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, `WALLET_${code}`, details);
    this.name = 'WalletError';
  }
}

export class InvalidMnemonicError extends WalletError {
  constructor(reason?: string) {
    super(
      `Invalid mnemonic phrase${reason ? `: ${reason}` : ''}`,
      'INVALID_MNEMONIC',
      { reason }
    );
    this.name = 'InvalidMnemonicError';
  }
}

export class WalletNotFoundError extends WalletError {
  constructor() {
    super('No wallet loaded. Generate or import a wallet first.', 'NOT_FOUND');
    this.name = 'WalletNotFoundError';
  }
}

export class InvalidAddressError extends WalletError {
  constructor(address: string, network?: string) {
    super(
      `Invalid Bitcoin address: ${address.substring(0, 10)}...`,
      'INVALID_ADDRESS',
      { addressPrefix: address.substring(0, 10), network }
    );
    this.name = 'InvalidAddressError';
  }
}

// Transaction errors
export class TransactionError extends BitcoinError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, `TX_${code}`, details);
    this.name = 'TransactionError';
  }
}

export class InsufficientFundsError extends TransactionError {
  constructor(required: number, available: number) {
    super(
      `Insufficient funds: need ${required} sats, have ${available} sats`,
      'INSUFFICIENT_FUNDS',
      { required, available, shortfall: required - available }
    );
    this.name = 'InsufficientFundsError';
  }
}

export class InvalidTransactionError extends TransactionError {
  constructor(reason: string) {
    super(`Invalid transaction: ${reason}`, 'INVALID', { reason });
    this.name = 'InvalidTransactionError';
  }
}

// Network errors
export class NetworkError extends BitcoinError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, `NETWORK_${code}`, details);
    this.name = 'NetworkError';
  }
}

export class ApiError extends NetworkError {
  constructor(endpoint: string, status?: number, response?: string) {
    super(
      `API request failed: ${endpoint}`,
      'API_ERROR',
      { endpoint, status, response: response?.substring(0, 100) }
    );
    this.name = 'ApiError';
  }
}

// Security errors
export class SecurityError extends BitcoinError {
  constructor(message: string, code: string) {
    super(message, `SECURITY_${code}`);
    this.name = 'SecurityError';
  }
}

export class KeyExposureError extends SecurityError {
  constructor() {
    super(
      'Attempted to expose private key material. This operation is not allowed.',
      'KEY_EXPOSURE'
    );
    this.name = 'KeyExposureError';
  }
}

// Helper to check if error is a BitcoinError
export function isBitcoinError(error: unknown): error is BitcoinError {
  return error instanceof BitcoinError;
}

// Helper to format error for logging (safe, no sensitive data)
export function formatError(error: unknown): string {
  if (isBitcoinError(error)) {
    return `[${error.code}] ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
