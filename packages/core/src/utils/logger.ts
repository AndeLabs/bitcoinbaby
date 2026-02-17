/**
 * Production Logger
 *
 * Structured logging with levels, contexts, and optional remote reporting.
 * Designed for production debugging and monitoring.
 */

// =============================================================================
// TYPES
// =============================================================================

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: string;
  data?: Record<string, unknown>;
  error?: Error;
}

export interface LoggerOptions {
  /** Minimum log level to output (default: 'info' in production, 'debug' in development) */
  minLevel?: LogLevel;
  /** Logger context/module name */
  context?: string;
  /** Enable console output (default: true) */
  console?: boolean;
  /** Custom log handler for remote logging */
  handler?: (entry: LogEntry) => void;
  /** Enable timestamps in console output (default: true) */
  timestamps?: boolean;
  /** Maximum entries to keep in memory (default: 1000) */
  maxEntries?: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: "\x1b[36m", // Cyan
  info: "\x1b[32m", // Green
  warn: "\x1b[33m", // Yellow
  error: "\x1b[31m", // Red
};

const RESET_COLOR = "\x1b[0m";

// =============================================================================
// LOGGER CLASS
// =============================================================================

/**
 * Production-grade logger with structured logging
 *
 * @example
 * ```typescript
 * const logger = createLogger({ context: 'MiningService' });
 *
 * logger.info('Mining started', { difficulty: 16 });
 * logger.error('Mining failed', { nonce: 12345 }, error);
 * ```
 */
export class Logger {
  private options: Required<Omit<LoggerOptions, "handler">> &
    Pick<LoggerOptions, "handler">;
  private entries: LogEntry[] = [];

  constructor(options: LoggerOptions = {}) {
    const isDev =
      typeof process !== "undefined"
        ? process.env?.NODE_ENV === "development"
        : typeof window !== "undefined" &&
          window.location?.hostname === "localhost";

    this.options = {
      minLevel: options.minLevel ?? (isDev ? "debug" : "info"),
      context: options.context ?? "App",
      console: options.console ?? true,
      timestamps: options.timestamps ?? true,
      maxEntries: options.maxEntries ?? 1000,
      handler: options.handler,
    };
  }

  /**
   * Log at debug level
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.log("debug", message, data);
  }

  /**
   * Log at info level
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log("info", message, data);
  }

  /**
   * Log at warn level
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log("warn", message, data);
  }

  /**
   * Log at error level
   */
  error(message: string, data?: Record<string, unknown>, error?: Error): void {
    this.log("error", message, data, error);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    error?: Error,
  ): void {
    // Check if this level should be logged
    if (LOG_LEVELS[level] < LOG_LEVELS[this.options.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context: this.options.context,
      data,
      error,
    };

    // Store entry
    this.entries.push(entry);
    if (this.entries.length > this.options.maxEntries) {
      this.entries.shift();
    }

    // Console output
    if (this.options.console) {
      this.outputToConsole(entry);
    }

    // Custom handler
    this.options.handler?.(entry);
  }

  /**
   * Output to console with formatting
   */
  private outputToConsole(entry: LogEntry): void {
    const isBrowser = typeof window !== "undefined";
    const timestamp = this.options.timestamps
      ? `[${new Date(entry.timestamp).toISOString()}] `
      : "";
    const context = entry.context ? `[${entry.context}] ` : "";
    const prefix = `${timestamp}${context}`;

    if (isBrowser) {
      // Browser console with CSS styling
      const styles: Record<LogLevel, string> = {
        debug: "color: #888",
        info: "color: #4CAF50",
        warn: "color: #FF9800",
        error: "color: #F44336; font-weight: bold",
      };

      const args: unknown[] = [
        `%c${prefix}${entry.level.toUpperCase()}%c ${entry.message}`,
        styles[entry.level],
        "color: inherit",
      ];

      if (entry.data && Object.keys(entry.data).length > 0) {
        args.push(entry.data);
      }

      if (entry.error) {
        args.push(entry.error);
      }

      switch (entry.level) {
        case "debug":
          console.debug(...args);
          break;
        case "info":
          console.info(...args);
          break;
        case "warn":
          console.warn(...args);
          break;
        case "error":
          console.error(...args);
          break;
      }
    } else {
      // Node.js console with ANSI colors
      const color = LOG_COLORS[entry.level];
      const formattedMessage = `${prefix}${color}${entry.level.toUpperCase()}${RESET_COLOR} ${entry.message}`;

      const args: unknown[] = [formattedMessage];

      if (entry.data && Object.keys(entry.data).length > 0) {
        args.push(entry.data);
      }

      if (entry.error) {
        args.push(entry.error);
      }

      switch (entry.level) {
        case "debug":
          console.debug(...args);
          break;
        case "info":
          console.info(...args);
          break;
        case "warn":
          console.warn(...args);
          break;
        case "error":
          console.error(...args);
          break;
      }
    }
  }

  /**
   * Get recent log entries
   */
  getEntries(options?: { level?: LogLevel; limit?: number }): LogEntry[] {
    let entries = [...this.entries];

    if (options?.level) {
      const minLevel = LOG_LEVELS[options.level];
      entries = entries.filter((e) => LOG_LEVELS[e.level] >= minLevel);
    }

    if (options?.limit) {
      entries = entries.slice(-options.limit);
    }

    return entries;
  }

  /**
   * Clear stored entries
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Create a child logger with additional context
   */
  child(context: string): Logger {
    const parentContext = this.options.context;
    const fullContext = parentContext ? `${parentContext}:${context}` : context;

    return new Logger({
      ...this.options,
      context: fullContext,
    });
  }

  /**
   * Measure execution time of an async function
   */
  async time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.debug(`${label} completed`, {
        duration: `${duration.toFixed(2)}ms`,
      });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(
        `${label} failed`,
        { duration: `${duration.toFixed(2)}ms` },
        error instanceof Error ? error : undefined,
      );
      throw error;
    }
  }

  /**
   * Export logs as JSON
   */
  export(): string {
    return JSON.stringify(this.entries, null, 2);
  }
}

// =============================================================================
// FACTORY & SINGLETON
// =============================================================================

let defaultLogger: Logger | null = null;

/**
 * Create a new logger instance
 */
export function createLogger(options?: LoggerOptions): Logger {
  return new Logger(options);
}

/**
 * Get the default logger instance
 */
export function getLogger(): Logger {
  if (!defaultLogger) {
    defaultLogger = new Logger({ context: "App" });
  }
  return defaultLogger;
}

/**
 * Configure the default logger
 */
export function configureLogger(options: LoggerOptions): void {
  defaultLogger = new Logger(options);
}

// =============================================================================
// SHORTHAND EXPORTS
// =============================================================================

/** Log at debug level using default logger */
export const logDebug = (
  message: string,
  data?: Record<string, unknown>,
): void => {
  getLogger().debug(message, data);
};

/** Log at info level using default logger */
export const logInfo = (
  message: string,
  data?: Record<string, unknown>,
): void => {
  getLogger().info(message, data);
};

/** Log at warn level using default logger */
export const logWarn = (
  message: string,
  data?: Record<string, unknown>,
): void => {
  getLogger().warn(message, data);
};

/** Log at error level using default logger */
export const logError = (
  message: string,
  data?: Record<string, unknown>,
  error?: Error,
): void => {
  getLogger().error(message, data, error);
};
