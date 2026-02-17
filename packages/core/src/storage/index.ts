/**
 * Storage Module
 */

export { GameStorage, default as GameStorageDefault } from "./game-storage";
export {
  SecureStorage,
  default as SecureStorageDefault,
  MIN_PASSWORD_LENGTH,
  type WalletMetadata,
} from "./secure-storage";
