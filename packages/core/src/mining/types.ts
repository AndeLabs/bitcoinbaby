/**
 * Mining Types
 *
 * Type definitions for the mining engine.
 */

/**
 * Result of a successful proof of work
 */
export interface MiningResult {
  hash: string;
  nonce: number;
  difficulty: number;
  timestamp: number;
  blockData?: string;
}

/**
 * Mining statistics
 */
export interface MiningStats {
  hashrate: number;
  totalHashes: number;
  difficulty: number;
  shares: number;
  lastShareTime?: number;
}

/**
 * Events emitted by miners
 */
export interface MinerEvents {
  onHashrateUpdate: (hashrate: number) => void;
  onWorkFound: (result: MiningResult) => void;
  onStatusChange: (status: "running" | "paused" | "stopped") => void;
  onError: (error: Error) => void;
}

/**
 * Interface for miners (CPU, WebGPU)
 */
export interface Miner {
  readonly type: "cpu" | "webgpu";

  start(block?: string): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;

  setDifficulty(difficulty: number): void;
  setThrottle(percent: number): void;
  setAddress(address: string): void;

  getHashrate(): number;
  getTotalHashes(): number;
  isRunning(): boolean;

  terminate(): void;
}

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
  preferWebGPU: boolean;
  fallbackToCPU: boolean;
  throttleOnBattery: boolean;
  throttleWhenHidden: boolean;
  initialDifficulty: number;
  minerAddress?: string;
}

/**
 * Device capabilities
 */
export interface DeviceCapabilities {
  webgpu: boolean;
  webgl: boolean;
  workers: boolean;
  cores: number;
  memory?: number;
  gpu?: {
    vendor: string;
    renderer: string;
  };
}

/**
 * Mining pool configuration (for future use)
 */
export interface PoolConfig {
  url: string;
  user: string;
  password?: string;
  algorithm: "sha256d";
}
