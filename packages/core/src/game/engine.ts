/**
 * Game Engine
 *
 * Main game loop that manages state updates, saves, and events.
 */

import { GAME_CONFIG, STAGE_NAMES, MINING_BONUS } from "./constants";
import type {
  GameState,
  GameBaby,
  GameEvent,
  GameEventHandler,
  BabyStats,
  EvolutionEventData,
} from "./types";
import { DEFAULT_GAME_STATE } from "./types";
import {
  calculateDecay,
  calculateOfflineDecay,
  applyAction,
  addXP,
  checkEvolution,
  determineVisualState,
  createNewBaby,
  getCriticalStats,
  calculateMiningXP,
  calculateLevelDecay,
  isBabyDead,
} from "./mechanics";
import {
  checkAchievements,
  calculateAchievementRewardXP,
} from "./achievements";
import { GameStorage } from "../storage";
import type { GameAction, BabyStage } from "./constants";

/**
 * Game Engine class
 */
export class GameEngine {
  private state: GameState;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private saveInterval: ReturnType<typeof setInterval> | null = null;
  private lastTickTime: number = 0;
  private eventHandlers: Set<GameEventHandler> = new Set();
  private isInitialized: boolean = false;

  constructor() {
    this.state = { ...DEFAULT_GAME_STATE };
  }

  /**
   * Initialize the engine and load saved state
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Load saved state
    this.state = await GameStorage.load();
    this.lastTickTime = Date.now();

    // Process offline time if baby exists
    if (this.state.baby && this.state.lastSaved) {
      const offlineTime = Date.now() - this.state.lastSaved;
      if (offlineTime > GAME_CONFIG.TICK_INTERVAL) {
        this.processOfflineTime(offlineTime);
      }
    }

    this.isInitialized = true;
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.tickInterval) return;

    this.lastTickTime = Date.now();

    // Start tick loop
    this.tickInterval = setInterval(() => {
      this.tick();
    }, GAME_CONFIG.TICK_INTERVAL);

    // Start auto-save
    this.saveInterval = setInterval(() => {
      this.save();
    }, GAME_CONFIG.SAVE_INTERVAL);
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }

  /**
   * Execute a single game tick
   */
  tick(): void {
    if (!this.state.baby) return;

    const now = Date.now();
    const deltaMs = now - this.lastTickTime;
    this.lastTickTime = now;

    // Update stats based on time elapsed
    const previousStats = { ...this.state.baby.stats };
    this.state.baby.stats = calculateDecay(
      this.state.baby.stats,
      deltaMs,
      this.state.baby.isSleeping,
      this.state.baby.isMining,
    );

    // Update visual state
    this.state.baby.visualState = determineVisualState(this.state.baby);

    // Update timestamp
    this.state.baby.lastUpdated = now;
    this.state.totalPlayTime += deltaMs;

    // Check for critical stats
    this.checkCriticalStats(previousStats, this.state.baby.stats);

    // Emit tick event
    this.emit({ type: "tick", stats: this.state.baby.stats });
  }

  /**
   * Process offline time decay
   */
  private processOfflineTime(offlineMs: number): void {
    if (!this.state.baby) return;

    // Apply stat decay
    this.state.baby.stats = calculateOfflineDecay(
      this.state.baby.stats,
      offlineMs,
      this.state.baby.isSleeping,
    );

    // Apply level decay for inactive miners
    const { progression, isDead } = calculateLevelDecay(
      this.state.baby.progression,
      this.state.baby.lastMined,
    );
    this.state.baby.progression = progression;

    // Update visual state (will show 'dead' if isDead is true)
    this.state.baby.visualState = determineVisualState(this.state.baby);
  }

  /**
   * Create a new baby
   *
   * @param name - Baby name
   * @param miningSharesBaseline - Current mining shares to use as baseline
   *   (prevents XP from pre-existing mining progress)
   */
  createBaby(name: string, miningSharesBaseline = 0): GameBaby {
    const baby = createNewBaby(name, miningSharesBaseline);
    this.state.baby = baby;
    this.save();
    return baby;
  }

  /**
   * Perform a player action
   */
  performAction(action: GameAction): void {
    if (!this.state.baby) return;

    switch (action) {
      case "feed":
        this.state.baby.stats = applyAction(this.state.baby.stats, "feed");
        this.state.baby.lastFed = Date.now();
        break;

      case "play":
        this.state.baby.stats = applyAction(this.state.baby.stats, "play");
        this.state.baby.lastPlayed = Date.now();
        break;

      case "sleep":
        this.state.baby.isSleeping = true;
        break;

      case "wake":
        this.state.baby.isSleeping = false;
        this.state.baby.stats = applyAction(this.state.baby.stats, "wake");
        break;

      case "learn":
        if (this.state.baby.stats.energy >= 10) {
          this.state.baby.stats = applyAction(this.state.baby.stats, "learn");
          this.addXPToProgression(15);
        }
        break;

      case "mine":
        // Mining is handled separately via recordMiningProgress
        break;
    }

    this.state.baby.visualState = determineVisualState(this.state.baby);
  }

  /**
   * Start/stop mining
   */
  setMining(isMining: boolean): void {
    if (!this.state.baby) return;

    this.state.baby.isMining = isMining;
    this.state.baby.visualState = determineVisualState(this.state.baby);

    if (isMining) {
      this.state.miningStats.sessionsCount++;
    }
  }

  /**
   * Record mining progress
   */
  recordMiningProgress(hashes: number, shares: number): void {
    if (!this.state.baby) return;

    // Update mining stats
    this.state.miningStats.totalHashes += hashes;
    this.state.miningStats.totalShares += shares;

    // Update lastMined timestamp (resets level decay timer)
    this.state.baby.lastMined = Date.now();

    // Award XP for shares
    if (shares > 0) {
      const xp = calculateMiningXP(shares, this.state.baby.progression.stage);
      this.addXPToProgression(xp);
    }

    // Check achievements
    this.checkAndUnlockAchievements();
  }

  /**
   * Add XP to baby progression
   */
  private addXPToProgression(xp: number): void {
    if (!this.state.baby) return;

    const previousLevel = this.state.baby.progression.level;
    const previousStage = this.state.baby.progression.stage;

    this.state.baby.progression = addXP(this.state.baby.progression, xp);

    // Check for level up
    if (this.state.baby.progression.level > previousLevel) {
      this.emit({ type: "level_up", level: this.state.baby.progression.level });
    }

    // Check for evolution
    const newStage = this.state.baby.progression.stage;
    if (newStage !== previousStage) {
      this.evolve(newStage);
    }
  }

  /**
   * Evolve to a new stage
   */
  private evolve(newStage: BabyStage): void {
    if (!this.state.baby) return;

    const previousStage = this.state.baby.progression.stage;
    const newLevel = this.state.baby.progression.level;

    // Record evolution
    this.state.baby.evolutionHistory.push({
      fromStage: previousStage,
      toStage: newStage,
      level: newLevel,
      timestamp: Date.now(),
    });

    this.state.baby.progression.stage = newStage;

    // Build evolution event data for the modal
    const evolutionData: EvolutionEventData = {
      fromStage: previousStage,
      toStage: newStage,
      newLevel,
      stageName: STAGE_NAMES[newStage],
      miningBonus: MINING_BONUS[newStage],
    };

    this.emit({ type: "evolved", stage: newStage, data: evolutionData });

    // Check achievements
    this.checkAndUnlockAchievements();
  }

  /**
   * Check critical stat changes
   */
  private checkCriticalStats(previous: BabyStats, current: BabyStats): void {
    const previousCritical = getCriticalStats(previous);
    const currentCritical = getCriticalStats(current);

    // Check for new critical stats
    for (const stat of currentCritical) {
      if (!previousCritical.includes(stat)) {
        this.emit({ type: "critical_stat", stat });
      }
    }

    // Check for recovered stats
    for (const stat of previousCritical) {
      if (!currentCritical.includes(stat)) {
        this.emit({ type: "stat_recovered", stat });
      }
    }
  }

  /**
   * Check and unlock achievements
   */
  private checkAndUnlockAchievements(): void {
    const newAchievements = checkAchievements(this.state);

    for (const achievement of newAchievements) {
      if (!this.state.baby) continue;

      this.state.baby.unlockedAchievements.push(achievement.id);

      // Award XP
      if (achievement.reward.xp) {
        this.addXPToProgression(achievement.reward.xp);
      }

      this.emit({ type: "achievement_unlocked", achievement });
    }
  }

  /**
   * Save game state
   */
  async save(): Promise<void> {
    await GameStorage.save(this.state);
    this.emit({ type: "saved" });
  }

  /**
   * Reset game (delete all data)
   */
  async reset(): Promise<void> {
    this.stop();
    await GameStorage.clear();
    this.state = { ...DEFAULT_GAME_STATE };
  }

  /**
   * Get current state (read-only)
   */
  getState(): Readonly<GameState> {
    return this.state;
  }

  /**
   * Get baby (convenience getter)
   */
  getBaby(): Readonly<GameBaby> | null {
    return this.state.baby;
  }

  /**
   * Subscribe to game events
   */
  on(handler: GameEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => this.eventHandlers.delete(handler);
  }

  /**
   * Emit an event to all handlers
   */
  private emit(event: GameEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Event handler error:", error);
      }
    }
  }
}

/**
 * Create a singleton game engine instance
 */
let engineInstance: GameEngine | null = null;

export function getGameEngine(): GameEngine {
  if (!engineInstance) {
    engineInstance = new GameEngine();
  }
  return engineInstance;
}

export function createGameEngine(): GameEngine {
  return new GameEngine();
}
