/**
 * Estados posibles del Baby
 */
export type BabyState = 'sleeping' | 'hungry' | 'happy' | 'learning' | 'evolving';

/**
 * Entidad Baby - El Tamagotchi de Bitcoin
 */
export interface Baby {
  id: string;
  name: string;
  state: BabyState;
  level: number;
  experience: number;
  createdAt: Date;
  lastFed: Date;
}

/**
 * Full mining session statistics (extends mining module stats)
 */
export interface MiningSession {
  hashrate: number;        // Hashes per second
  totalHashes: number;     // Total hashes computed
  tokensEarned: number;    // BABY tokens earned
  difficulty: number;      // Current difficulty
  uptime: number;          // Seconds mining
  isActive: boolean;       // Mining active state
  minerType: 'cpu' | 'webgpu';
}

/**
 * Configuracion de mineria
 */
export interface MiningConfig {
  readonly difficulty: number;
  maxHashrate: number;
  useWebGPU: boolean;
  throttleOnBattery: boolean;
  throttleWhenHidden: boolean;
}

/**
 * Informacion de wallet
 */
export interface WalletInfo {
  address: string;
  publicKey: string;
  balance: bigint;
  babyTokens: bigint;
}
