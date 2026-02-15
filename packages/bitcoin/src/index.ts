/**
 * @bitcoinbaby/bitcoin
 *
 * Bitcoin wallet and transaction utilities.
 * Built on bitcoinjs-lib with Charms protocol support.
 */

// Types
export * from './types';

// Errors
export * from './errors';

// Crypto utilities
export {
  randomBytes,
  secureErase,
  sha256,
  hash256,
  hexToBytes,
  bytesToHex,
  getPublicKey,
  signSchnorr,
  verifySchnorr,
} from './crypto';

// Wallet
export {
  BitcoinWallet,
  validateAddress,
  getAddressType,
  formatAddress,
  satsToBtc,
  btcToSats,
} from './wallet';

// Charms integration
export { CharmsClient, type CharmsConfig } from './charms';

// Scrolls API
export { ScrollsClient, type ScrollsConfig } from './scrolls';
