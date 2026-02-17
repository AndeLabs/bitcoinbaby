import type {
  Miner,
  MinerEvents,
  OrchestratorConfig,
  DeviceCapabilities,
} from "./types";
import { CPUMiner } from "./cpu-miner";
import { detectCapabilities, isOnBattery, isPageVisible } from "./capabilities";

const defaultConfig: OrchestratorConfig = {
  preferWebGPU: true,
  fallbackToCPU: true,
  throttleOnBattery: true,
  throttleWhenHidden: true,
  initialDifficulty: 16, // 16 leading zero bits (reasonable for CPU)
};

/**
 * MiningOrchestrator - Coordina miners CPU y WebGPU
 *
 * Basado en el patron del BRO token:
 * https://github.com/CharmsDev/bro/tree/main/webapp/src/mining
 */
export class MiningOrchestrator {
  private config: OrchestratorConfig;
  private activeMiner: Miner | null = null;
  private events: Partial<MinerEvents> = {};
  private isRunning = false;
  private capabilities: DeviceCapabilities | null = null;
  private cleanupFunctions: (() => void)[] = [];

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Detect device capabilities
   */
  async detectCapabilities(): Promise<DeviceCapabilities> {
    if (!this.capabilities) {
      this.capabilities = await detectCapabilities();
    }
    return this.capabilities;
  }

  /**
   * Initialize and start the appropriate miner
   */
  async start(blockData?: string): Promise<void> {
    if (this.isRunning) {
      console.warn("Mining already running");
      return;
    }

    // Detect capabilities
    const caps = await this.detectCapabilities();

    if (this.config.preferWebGPU && caps.webgpu) {
      // Use WebGPU miner for 10-100x faster hashing
      const { WebGPUMiner } = await import("./webgpu-miner");
      this.activeMiner = new WebGPUMiner({
        difficulty: this.config.initialDifficulty,
        address: this.config.minerAddress,
        onHashrateUpdate: (hashrate) =>
          this.events.onHashrateUpdate?.(hashrate),
        onWorkFound: (result) => this.events.onWorkFound?.(result),
        onStatusChange: (status) => this.events.onStatusChange?.(status),
      });
    } else if (this.config.fallbackToCPU && caps.workers) {
      this.activeMiner = this.createCPUMiner();
    } else {
      throw new Error("No mining backend available");
    }

    // Setup visibility handling
    if (this.config.throttleWhenHidden) {
      this.setupVisibilityHandling();
    }

    // Setup battery handling
    if (this.config.throttleOnBattery) {
      this.setupBatteryHandling();
    }

    await this.activeMiner.start(blockData);
    this.isRunning = true;
    this.events.onStatusChange?.("running");
  }

  /**
   * Create CPU miner with event handlers
   */
  private createCPUMiner(): CPUMiner {
    return new CPUMiner({
      difficulty: this.config.initialDifficulty,
      address: this.config.minerAddress,
      onHashrateUpdate: (hashrate) => this.events.onHashrateUpdate?.(hashrate),
      onWorkFound: (result) => this.events.onWorkFound?.(result),
      onStatusChange: (status) => this.events.onStatusChange?.(status),
    });
  }

  /**
   * Stop the active miner
   */
  stop(): void {
    if (!this.isRunning || !this.activeMiner) {
      return;
    }

    this.activeMiner.stop();
    this.isRunning = false;
    this.events.onStatusChange?.("stopped");
  }

  /**
   * Pause mining
   */
  pause(): void {
    if (this.activeMiner && this.isRunning) {
      this.activeMiner.pause();
      this.events.onStatusChange?.("paused");
    }
  }

  /**
   * Resume mining
   */
  resume(): void {
    if (this.activeMiner && this.isRunning) {
      this.activeMiner.resume();
      this.events.onStatusChange?.("running");
    }
  }

  /**
   * Set difficulty
   */
  setDifficulty(difficulty: number): void {
    this.config.initialDifficulty = difficulty;
    this.activeMiner?.setDifficulty(difficulty);
  }

  /**
   * Register event handlers
   */
  on<K extends keyof MinerEvents>(event: K, handler: MinerEvents[K]): void {
    this.events[event] = handler;
  }

  /**
   * Terminate and cleanup
   */
  terminate(): void {
    this.stop();

    // Cleanup event listeners
    this.cleanupFunctions.forEach((cleanup) => cleanup());
    this.cleanupFunctions = [];

    this.activeMiner?.terminate();
    this.activeMiner = null;
    this.capabilities = null;
  }

  /**
   * Handle page visibility changes
   */
  private setupVisibilityHandling(): void {
    if (typeof document === "undefined") return;

    const handler = () => {
      if (!this.activeMiner) return;

      if (!isPageVisible()) {
        this.activeMiner.setThrottle(10); // 10% when hidden
      } else {
        this.activeMiner.setThrottle(100); // 100% when visible
      }
    };

    document.addEventListener("visibilitychange", handler);

    // Track cleanup function
    this.cleanupFunctions.push(() => {
      document.removeEventListener("visibilitychange", handler);
    });
  }

  /**
   * Handle battery status changes
   */
  private setupBatteryHandling(): void {
    if (typeof navigator === "undefined") return;
    if (!("getBattery" in navigator)) return;

    (navigator as never as { getBattery: () => Promise<BatteryManager> })
      .getBattery?.()
      .then((battery: BatteryManager) => {
        const updateThrottle = () => {
          if (!this.activeMiner) return;

          if (!battery.charging && battery.level < 0.2) {
            this.activeMiner.setThrottle(25); // 25% on low battery
          } else if (!battery.charging) {
            this.activeMiner.setThrottle(50); // 50% on battery
          } else {
            this.activeMiner.setThrottle(100); // 100% when charging
          }
        };

        battery.addEventListener("chargingchange", updateThrottle);
        battery.addEventListener("levelchange", updateThrottle);
        updateThrottle();

        // Track cleanup function
        this.cleanupFunctions.push(() => {
          battery.removeEventListener("chargingchange", updateThrottle);
          battery.removeEventListener("levelchange", updateThrottle);
        });
      })
      .catch(() => {
        // Battery API not available
      });
  }

  // Getters
  getHashrate(): number {
    return this.activeMiner?.getHashrate() ?? 0;
  }

  getTotalHashes(): number {
    return this.activeMiner?.getTotalHashes() ?? 0;
  }

  getMinerType(): "cpu" | "webgpu" | null {
    return this.activeMiner?.type ?? null;
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }

  getCapabilities(): DeviceCapabilities | null {
    return this.capabilities;
  }
}

// Battery Manager interface (not in standard TypeScript lib)
interface BatteryManager extends EventTarget {
  charging: boolean;
  level: number;
  addEventListener(
    type: "chargingchange" | "levelchange",
    listener: () => void,
  ): void;
  removeEventListener(
    type: "chargingchange" | "levelchange",
    listener: () => void,
  ): void;
}
