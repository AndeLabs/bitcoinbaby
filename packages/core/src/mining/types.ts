/**
 * Eventos emitidos por los miners
 */
export interface MinerEvents {
  onHashComputed: (hash: string, nonce: number) => void;
  onSolutionFound: (hash: string, nonce: number, difficulty: number) => void;
  onStatsUpdate: (hashrate: number, totalHashes: number) => void;
  onError: (error: Error) => void;
}

/**
 * Interface para miners (CPU, WebGPU)
 */
export interface Miner {
  readonly type: 'cpu' | 'webgpu';

  start(): Promise<void>;
  stop(): Promise<void>;
  pause(): void;
  resume(): void;

  setDifficulty(difficulty: number): void;
  setThrottle(percent: number): void;

  getHashrate(): number;
  getTotalHashes(): number;
  isRunning(): boolean;
}

/**
 * Configuracion del orchestrator
 */
export interface OrchestratorConfig {
  preferWebGPU: boolean;
  fallbackToCPU: boolean;
  throttleOnBattery: boolean;
  throttleWhenHidden: boolean;
  initialDifficulty: number;
}
