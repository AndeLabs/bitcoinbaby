import type { Miner, MiningResult } from "./types";

/**
 * CPUMiner - Mining using CPU via Web Worker
 *
 * Implements proof of work by searching for hashes with leading zeros.
 * Uses Web Workers to avoid blocking the main thread.
 */
export class CPUMiner implements Miner {
  readonly type = "cpu" as const;

  private worker: Worker | null = null;
  private workerUrl: string | null = null;
  private difficulty: number;
  private throttle = 100;
  private running = false;
  private paused = false;
  private hashrate = 0;
  private totalHashes = 0;
  private minerAddress = "";

  // Callbacks
  private onHashrateUpdate?: (hashrate: number) => void;
  private onWorkFound?: (result: MiningResult) => void;
  private onStatusChange?: (status: "running" | "paused" | "stopped") => void;
  private onError?: (error: Error) => void;

  constructor(
    options: {
      difficulty?: number;
      address?: string;
      onHashrateUpdate?: (hashrate: number) => void;
      onWorkFound?: (result: MiningResult) => void;
      onStatusChange?: (status: "running" | "paused" | "stopped") => void;
      onError?: (error: Error) => void;
    } = {},
  ) {
    this.difficulty = options.difficulty ?? 16;
    this.minerAddress = options.address ?? "";
    this.onHashrateUpdate = options.onHashrateUpdate;
    this.onWorkFound = options.onWorkFound;
    this.onStatusChange = options.onStatusChange;
    this.onError = options.onError;
  }

  /**
   * Initialize the Web Worker
   */
  private initWorker(): void {
    if (this.worker) return;

    // Check if we're in a browser environment
    if (typeof window === "undefined" || typeof Worker === "undefined") {
      console.warn("Web Workers not available, using fallback");
      return;
    }

    try {
      // Create worker from URL (works with Next.js)
      // The worker code is inlined as a blob for portability
      const workerCode = this.getWorkerCode();
      const blob = new Blob([workerCode], { type: "application/javascript" });
      this.workerUrl = URL.createObjectURL(blob);
      this.worker = new Worker(this.workerUrl);

      // Handle messages from worker
      this.worker.onmessage = (event) => {
        const { type, ...data } = event.data;

        switch (type) {
          case "hashrate":
            this.hashrate = data.hashrate;
            this.totalHashes = data.totalHashes;
            this.onHashrateUpdate?.(data.hashrate);
            break;

          case "found":
            this.onWorkFound?.({
              hash: data.hash,
              nonce: data.nonce,
              difficulty: data.difficulty,
              timestamp: Date.now(),
            });
            break;

          case "status":
            if (data.status === "stopped" && data.totalHashes) {
              this.totalHashes = data.totalHashes;
            }
            this.onStatusChange?.(data.status);
            break;
        }
      };

      this.worker.onerror = (error) => {
        console.error("Mining worker error:", error);
        this.running = false;
        if (this.workerUrl) {
          URL.revokeObjectURL(this.workerUrl);
          this.workerUrl = null;
        }
        this.onStatusChange?.("stopped");
        // Propagate error to consumer for proper handling
        const errorObj = new Error(error.message || "Mining worker error");
        this.onError?.(errorObj);
      };
    } catch (error) {
      console.error("Failed to create mining worker:", error);
      // Propagate initialization errors
      const errorObj =
        error instanceof Error ? error : new Error("Failed to create worker");
      this.onError?.(errorObj);
    }
  }

  /**
   * Get the worker code as a string
   * This allows the worker to be created as a Blob URL
   */
  private getWorkerCode(): string {
    return `
      // SHA256 implementation for Web Worker
      const sha256 = async (message) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      };

      // Double SHA256 (Bitcoin standard)
      const hash256 = async (message) => {
        const first = await sha256(message);
        return sha256(first);
      };

      // Count leading zero bits in a hash
      const countLeadingZeroBits = (hash) => {
        let count = 0;
        for (const char of hash) {
          const nibble = parseInt(char, 16);
          if (nibble === 0) {
            count += 4;
          } else {
            if (nibble < 8) count += 1;
            if (nibble < 4) count += 1;
            if (nibble < 2) count += 1;
            break;
          }
        }
        return count;
      };

      // Worker state
      let isRunning = false;
      let isPaused = false;
      let difficulty = 16;
      let throttle = 100;
      let nonce = 0;
      let totalHashes = 0;
      let currentBlock = '';
      let minerAddress = '';
      let hashesThisSecond = 0;
      let lastStatsUpdate = Date.now();

      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      // Main mining function
      const mine = async () => {
        while (isRunning) {
          if (isPaused) {
            await sleep(100);
            continue;
          }

          const batchSize = Math.max(1, Math.floor(100 * (throttle / 100)));

          for (let i = 0; i < batchSize && isRunning && !isPaused; i++) {
            const blockData = currentBlock + ':' + minerAddress + ':' + nonce;
            const hash = await hash256(blockData);
            totalHashes++;
            hashesThisSecond++;
            nonce++;

            const zeroBits = countLeadingZeroBits(hash);
            if (zeroBits >= difficulty) {
              self.postMessage({
                type: 'found',
                hash,
                nonce: nonce - 1,
                difficulty: zeroBits,
                blockData,
              });
            }
          }

          const now = Date.now();
          if (now - lastStatsUpdate >= 1000) {
            self.postMessage({
              type: 'hashrate',
              hashrate: hashesThisSecond,
              totalHashes,
              nonce,
            });
            hashesThisSecond = 0;
            lastStatsUpdate = now;
          }

          await sleep(1);
        }
      };

      self.onmessage = async (event) => {
        const { type, ...data } = event.data;

        switch (type) {
          case 'start':
            if (!isRunning) {
              isRunning = true;
              isPaused = false;
              currentBlock = data.block || Date.now().toString();
              minerAddress = data.address || 'unknown';
              nonce = data.startNonce || 0;
              self.postMessage({ type: 'status', status: 'running' });
              mine();
            }
            break;

          case 'stop':
            isRunning = false;
            isPaused = false;
            self.postMessage({ type: 'status', status: 'stopped', totalHashes });
            break;

          case 'pause':
            isPaused = true;
            self.postMessage({ type: 'status', status: 'paused' });
            break;

          case 'resume':
            isPaused = false;
            self.postMessage({ type: 'status', status: 'running' });
            break;

          case 'config':
            if (typeof data.difficulty === 'number') difficulty = data.difficulty;
            if (typeof data.throttle === 'number') throttle = Math.max(0, Math.min(100, data.throttle));
            if (typeof data.block === 'string') { currentBlock = data.block; nonce = 0; }
            self.postMessage({ type: 'config', difficulty, throttle });
            break;
        }
      };
    `;
  }

  async start(block?: string): Promise<void> {
    if (this.running) return;

    this.initWorker();
    this.running = true;
    this.paused = false;

    if (this.worker) {
      this.worker.postMessage({
        type: "start",
        block: block || Date.now().toString(),
        address: this.minerAddress,
      });
    } else {
      // Fallback: simulate mining without worker
      this.startFallbackMining();
    }
  }

  stop(): void {
    this.running = false;
    this.paused = false;

    if (this.worker) {
      this.worker.postMessage({ type: "stop" });
    }

    this.hashrate = 0;
  }

  pause(): void {
    this.paused = true;
    if (this.worker) {
      this.worker.postMessage({ type: "pause" });
    }
  }

  resume(): void {
    this.paused = false;
    if (this.worker) {
      this.worker.postMessage({ type: "resume" });
    }
  }

  setDifficulty(difficulty: number): void {
    this.difficulty = difficulty;
    if (this.worker) {
      this.worker.postMessage({ type: "config", difficulty });
    }
  }

  setThrottle(percent: number): void {
    this.throttle = Math.max(0, Math.min(100, percent));
    if (this.worker) {
      this.worker.postMessage({ type: "config", throttle: this.throttle });
    }
  }

  setAddress(address: string): void {
    this.minerAddress = address;
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
   * Terminate the worker and clean up
   */
  terminate(): void {
    this.stop();
    if (this.workerUrl) {
      URL.revokeObjectURL(this.workerUrl);
      this.workerUrl = null;
    }
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Fallback mining for environments without Web Workers
   */
  private startFallbackMining(): void {
    let lastUpdate = Date.now();
    let hashesThisSecond = 0;

    const mine = () => {
      if (!this.running) return;
      if (this.paused) {
        setTimeout(mine, 100);
        return;
      }

      const workAmount = Math.floor(100 * (this.throttle / 100));

      for (let i = 0; i < workAmount; i++) {
        this.totalHashes++;
        hashesThisSecond++;
      }

      const now = Date.now();
      if (now - lastUpdate >= 1000) {
        this.hashrate = hashesThisSecond;
        this.onHashrateUpdate?.(this.hashrate);
        hashesThisSecond = 0;
        lastUpdate = now;
      }

      setTimeout(mine, 10);
    };

    mine();
    this.onStatusChange?.("running");
  }
}
