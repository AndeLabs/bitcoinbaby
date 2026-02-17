/**
 * Mining Module
 *
 * Browser-based mining engine for BitcoinBaby.
 * Supports CPU mining via Web Workers with WebGPU planned.
 */

// Core mining classes
export { MiningOrchestrator } from "./orchestrator";
export { CPUMiner } from "./cpu-miner";
export { WebGPUMiner } from "./webgpu-miner";

// Device capability detection
export {
  detectWebGPU,
  detectWebGL,
  detectWorkers,
  getCPUCores,
  getDeviceMemory,
  isOnBattery,
  isPageVisible,
  detectCapabilities,
  getRecommendedConfig,
} from "./capabilities";

// Types
export type {
  Miner,
  MinerEvents,
  MiningResult,
  MiningStats,
  OrchestratorConfig,
  DeviceCapabilities,
  PoolConfig,
} from "./types";
