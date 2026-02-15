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
 * Estadisticas de mineria
 */
export interface MiningStats {
  hashrate: number;        // Hashes por segundo
  totalHashes: number;     // Total de hashes computados
  tokensEarned: number;    // BABY tokens ganados
  difficulty: number;      // Dificultad actual
  uptime: number;          // Segundos minando
  isActive: boolean;       // Estado de mineria
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
