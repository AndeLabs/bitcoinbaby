import type { Miner } from './types';

/**
 * CPUMiner - Mineria usando CPU via Web Worker
 *
 * Implementa proof of work simple buscando hashes con leading zeros.
 */
export class CPUMiner implements Miner {
  readonly type = 'cpu' as const;

  private worker: Worker | null = null;
  private difficulty: number;
  private throttle = 100;
  private running = false;
  private paused = false;
  private hashrate = 0;
  private totalHashes = 0;

  constructor(difficulty = 4) {
    this.difficulty = difficulty;
  }

  async start(): Promise<void> {
    if (this.running) return;

    // En browser real, usariamos Web Worker
    // Por ahora, simulamos con interval
    this.running = true;
    this.startMiningLoop();
  }

  async stop(): Promise<void> {
    this.running = false;
    this.hashrate = 0;

    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  setDifficulty(difficulty: number): void {
    this.difficulty = difficulty;
  }

  setThrottle(percent: number): void {
    this.throttle = Math.max(0, Math.min(100, percent));
  }

  getHashrate(): number {
    return this.hashrate;
  }

  getTotalHashes(): number {
    return this.totalHashes;
  }

  isRunning(): boolean {
    return this.running && !this.paused;
  }

  /**
   * Loop de mineria simulado
   * En produccion esto correria en Web Worker
   */
  private startMiningLoop(): void {
    let lastUpdate = Date.now();
    let hashesThisSecond = 0;

    const mine = () => {
      if (!this.running) return;
      if (this.paused) {
        setTimeout(mine, 100);
        return;
      }

      // Simular trabajo basado en throttle
      const workAmount = Math.floor(1000 * (this.throttle / 100));

      for (let i = 0; i < workAmount; i++) {
        // Simular hash computation
        this.totalHashes++;
        hashesThisSecond++;
      }

      // Actualizar hashrate cada segundo
      const now = Date.now();
      if (now - lastUpdate >= 1000) {
        this.hashrate = hashesThisSecond;
        hashesThisSecond = 0;
        lastUpdate = now;
      }

      // Continuar mining
      setTimeout(mine, 10);
    };

    mine();
  }
}
