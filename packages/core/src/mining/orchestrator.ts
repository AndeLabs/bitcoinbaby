import type { Miner, MinerEvents, OrchestratorConfig } from './types';
import { CPUMiner } from './cpu-miner';

const defaultConfig: OrchestratorConfig = {
  preferWebGPU: true,
  fallbackToCPU: true,
  throttleOnBattery: true,
  throttleWhenHidden: true,
  initialDifficulty: 4,
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

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Inicializa y arranca el miner apropiado
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('Mining already running');
      return;
    }

    // Detectar capacidades
    const hasWebGPU = await this.checkWebGPUSupport();

    if (this.config.preferWebGPU && hasWebGPU) {
      // TODO: Implementar WebGPUMiner
      console.log('WebGPU disponible, pero usando CPU por ahora');
      this.activeMiner = new CPUMiner(this.config.initialDifficulty);
    } else if (this.config.fallbackToCPU) {
      this.activeMiner = new CPUMiner(this.config.initialDifficulty);
    } else {
      throw new Error('No mining backend available');
    }

    // Configurar eventos de visibilidad
    if (this.config.throttleWhenHidden) {
      this.setupVisibilityHandling();
    }

    // Configurar eventos de bateria
    if (this.config.throttleOnBattery) {
      this.setupBatteryHandling();
    }

    await this.activeMiner.start();
    this.isRunning = true;
  }

  /**
   * Detiene el miner activo
   */
  async stop(): Promise<void> {
    if (!this.isRunning || !this.activeMiner) {
      return;
    }

    await this.activeMiner.stop();
    this.isRunning = false;
    this.activeMiner = null;
  }

  /**
   * Verifica si WebGPU esta disponible
   */
  private async checkWebGPUSupport(): Promise<boolean> {
    if (typeof navigator === 'undefined') return false;
    if (!('gpu' in navigator)) return false;

    try {
      const gpu = (navigator as any).gpu;
      const adapter = await gpu?.requestAdapter();
      return adapter !== null;
    } catch {
      return false;
    }
  }

  /**
   * Maneja cambios de visibilidad de la pagina
   */
  private setupVisibilityHandling(): void {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (!this.activeMiner) return;

      if (document.hidden) {
        this.activeMiner.setThrottle(10); // 10% cuando no visible
      } else {
        this.activeMiner.setThrottle(100); // 100% cuando visible
      }
    });
  }

  /**
   * Maneja cambios de estado de bateria
   */
  private setupBatteryHandling(): void {
    if (typeof navigator === 'undefined') return;
    if (!('getBattery' in navigator)) return;

    (navigator as any).getBattery?.().then((battery: any) => {
      const updateThrottle = () => {
        if (!this.activeMiner) return;

        if (!battery.charging && battery.level < 0.2) {
          this.activeMiner.setThrottle(25); // 25% con bateria baja
        } else if (!battery.charging) {
          this.activeMiner.setThrottle(50); // 50% en bateria
        } else {
          this.activeMiner.setThrottle(100); // 100% cargando
        }
      };

      battery.addEventListener('chargingchange', updateThrottle);
      battery.addEventListener('levelchange', updateThrottle);
      updateThrottle();
    });
  }

  // Getters
  getHashrate(): number {
    return this.activeMiner?.getHashrate() ?? 0;
  }

  getTotalHashes(): number {
    return this.activeMiner?.getTotalHashes() ?? 0;
  }

  getMinerType(): 'cpu' | 'webgpu' | null {
    return this.activeMiner?.type ?? null;
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }
}
