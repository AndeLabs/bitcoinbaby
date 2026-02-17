/**
 * Mining Web Worker
 *
 * This file contains the code that runs in the Web Worker.
 * It performs SHA256 hashing to find valid proofs of work.
 *
 * Message protocol:
 * - Main → Worker: { type: 'start' | 'stop' | 'config', ... }
 * - Worker → Main: { type: 'hashrate' | 'found' | 'status', ... }
 */

// SHA256 implementation for Web Worker (standalone, no imports)
const sha256 = async (message: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

// Double SHA256 (Bitcoin standard)
const hash256 = async (message: string): Promise<string> => {
  const first = await sha256(message);
  return sha256(first);
};

// Count leading zero bits in a hash
const countLeadingZeroBits = (hash: string): number => {
  let count = 0;
  for (const char of hash) {
    const nibble = parseInt(char, 16);
    if (nibble === 0) {
      count += 4;
    } else {
      // Count leading zeros in this nibble
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
let difficulty = 16; // Number of leading zero bits required
let throttle = 100; // 0-100 percent
let nonce = 0;
let totalHashes = 0;
let currentBlock = '';
let minerAddress = '';

// Mining stats
let hashesThisSecond = 0;
let lastStatsUpdate = Date.now();

// Main mining function
const mine = async (): Promise<void> => {
  while (isRunning) {
    if (isPaused) {
      await sleep(100);
      continue;
    }

    // Calculate work batch size based on throttle
    const batchSize = Math.max(1, Math.floor(100 * (throttle / 100)));

    for (let i = 0; i < batchSize && isRunning && !isPaused; i++) {
      // Create block data to hash
      const blockData = `${currentBlock}:${minerAddress}:${nonce}`;

      // Hash the block data
      const hash = await hash256(blockData);
      totalHashes++;
      hashesThisSecond++;
      nonce++;

      // Check if hash meets difficulty
      const zeroBits = countLeadingZeroBits(hash);
      if (zeroBits >= difficulty) {
        // Found valid proof of work!
        self.postMessage({
          type: 'found',
          hash,
          nonce: nonce - 1,
          difficulty: zeroBits,
          blockData,
        });
      }
    }

    // Update hashrate every second
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

    // Yield to event loop
    await sleep(1);
  }
};

// Sleep helper
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Handle messages from main thread
self.onmessage = async (event: MessageEvent) => {
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
      self.postMessage({
        type: 'status',
        status: 'stopped',
        totalHashes,
      });
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
      if (typeof data.difficulty === 'number') {
        difficulty = data.difficulty;
      }
      if (typeof data.throttle === 'number') {
        throttle = Math.max(0, Math.min(100, data.throttle));
      }
      if (typeof data.block === 'string') {
        currentBlock = data.block;
        nonce = 0; // Reset nonce for new block
      }
      self.postMessage({ type: 'config', difficulty, throttle });
      break;

    case 'stats':
      self.postMessage({
        type: 'stats',
        isRunning,
        isPaused,
        difficulty,
        throttle,
        totalHashes,
        nonce,
      });
      break;
  }
};

// Export for typing (not used in worker context)
export type WorkerMessage =
  | { type: 'start'; block?: string; address?: string; startNonce?: number }
  | { type: 'stop' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'config'; difficulty?: number; throttle?: number; block?: string }
  | { type: 'stats' };

export type WorkerResponse =
  | { type: 'hashrate'; hashrate: number; totalHashes: number; nonce: number }
  | { type: 'found'; hash: string; nonce: number; difficulty: number; blockData: string }
  | { type: 'status'; status: 'running' | 'paused' | 'stopped'; totalHashes?: number }
  | { type: 'config'; difficulty: number; throttle: number }
  | { type: 'stats'; isRunning: boolean; isPaused: boolean; difficulty: number; throttle: number; totalHashes: number; nonce: number };
