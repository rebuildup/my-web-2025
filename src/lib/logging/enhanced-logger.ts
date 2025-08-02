/**
 * Enhanced Logging System
 * Provides structured logging with multiple levels, contexts, and outputs
 */

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

// Log entry interface
export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  source?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  stackTrace?: string;
  tags?: string[];
}

// Logger configuration
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  maxFileSize: number;
  maxFiles: number;
  logDirectory: string;
  remoteEndpoint?: string;
  includeStackTrace: boolean;
  includeContext: boolean;
  timestampFormat: "iso" | "unix" | "readable";
  colorize: boolean;
}

// Log output interface
export interface LogOutput {
  write(entry: LogEntry): Promise<void>;
  flush?(): Promise<void>;
  close?(): Promise<void>;
}

/**
 * Console Log Output
 */
export class ConsoleLogOutput implements LogOutput {
  private colorize: boolean;

  constructor(colorize: boolean = true) {
    this.colorize = colorize;
  }

  async write(entry: LogEntry): Promise<void> {
    const message = this.formatMessage(entry);
    const logMethod = this.getConsoleMethod(entry.level);

    if (this.colorize) {
      const coloredMessage = this.colorizeMessage(message, entry.level);
      logMethod(coloredMessage);
    } else {
      logMethod(message);
    }
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = LogLevel[entry.level].padEnd(8);
    const source = entry.source ? `[${entry.source}]` : "";
    const context = entry.context ? JSON.stringify(entry.context) : "";

    return `${timestamp} ${level} ${source} ${entry.message} ${context}`.trim();
  }

  private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }

  private colorizeMessage(message: string, level: LogLevel): string {
    if (!this.colorize) return message;

    const colors = {
      [LogLevel.DEBUG]: "\x1b[36m", // Cyan
      [LogLevel.INFO]: "\x1b[32m", // Green
      [LogLevel.WARN]: "\x1b[33m", // Yellow
      [LogLevel.ERROR]: "\x1b[31m", // Red
      [LogLevel.CRITICAL]: "\x1b[35m", // Magenta
    };

    const reset = "\x1b[0m";
    return `${colors[level]}${message}${reset}`;
  }
}

/**
 * File Log Output
 */
export class FileLogOutput implements LogOutput {
  private logDirectory: string;
  private maxFileSize: number;
  private maxFiles: number;
  private currentFile: string;
  private writeStream?: NodeJS.WriteStream; // fs.WriteStream

  constructor(
    logDirectory: string,
    maxFileSize: number = 10 * 1024 * 1024,
    maxFiles: number = 5,
  ) {
    this.logDirectory = logDirectory;
    this.maxFileSize = maxFileSize;
    this.maxFiles = maxFiles;
    this.currentFile = this.generateFileName();
  }

  async write(entry: LogEntry): Promise<void> {
    try {
      const message = this.formatLogEntry(entry);

      // Check if we need to rotate the log file
      await this.checkRotation();

      // Write to file (in a real implementation, you'd use fs.createWriteStream)
      // For now, we'll just log to console as a placeholder
      console.log(`[FILE LOG] ${message}`);
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    return JSON.stringify({
      timestamp: entry.timestamp,
      level: LogLevel[entry.level],
      message: entry.message,
      context: entry.context,
      source: entry.source,
      userId: entry.userId,
      sessionId: entry.sessionId,
      requestId: entry.requestId,
      stackTrace: entry.stackTrace,
      tags: entry.tags,
    });
  }

  private generateFileName(): string {
    const date = new Date().toISOString().split("T")[0];
    return `portfolio-${date}.log`;
  }

  private async checkRotation(): Promise<void> {
    // In a real implementation, check file size and rotate if necessary
    // This is a placeholder for the rotation logic
  }

  async flush(): Promise<void> {
    // Flush any pending writes
  }

  async close(): Promise<void> {
    // Close the write stream
  }
}

/**
 * Remote Log Output
 */
export class RemoteLogOutput implements LogOutput {
  private endpoint: string;
  private buffer: LogEntry[] = [];
  private flushInterval: number = 5000; // 5 seconds
  private maxBufferSize: number = 100;
  private flushTimer?: NodeJS.Timeout;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.startFlushTimer();
  }

  async write(entry: LogEntry): Promise<void> {
    this.buffer.push(entry);

    if (this.buffer.length >= this.maxBufferSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    try {
      const logs = [...this.buffer];
      this.buffer = [];

      // In a real implementation, send logs to remote endpoint
      console.log(
        `[REMOTE LOG] Sending ${logs.length} log entries to ${this.endpoint}`,
      );

      // Placeholder for actual HTTP request
      // await fetch(this.endpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ logs })
      // });
    } catch (error) {
      console.error("Failed to send logs to remote endpoint:", error);
      // Re-add logs to buffer for retry
      this.buffer.unshift(...this.buffer);
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch(console.error);
    }, this.flushInterval);
  }

  async close(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flush();
  }
}

/**
 * Enhanced Logger
 */
export class EnhancedLogger {
  private config: LoggerConfig;
  private outputs: LogOutput[] = [];
  private context: Record<string, unknown> = {};

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      logDirectory: "./logs",
      includeStackTrace: false,
      includeContext: true,
      timestampFormat: "iso",
      colorize: true,
      ...config,
    };

    this.initializeOutputs();
  }

  /**
   * Set global context that will be included in all log entries
   */
  setContext(context: Record<string, unknown>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear global context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Create a child logger with additional context
   */
  child(context: Record<string, unknown>): EnhancedLogger {
    const childLogger = new EnhancedLogger(this.config);
    childLogger.context = { ...this.context, ...context };
    childLogger.outputs = this.outputs;
    return childLogger;
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log error message
   */
  error(
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
  ): void {
    const errorContext = error
      ? {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          ...context,
        }
      : context;

    this.log(LogLevel.ERROR, message, errorContext);
  }

  /**
   * Log critical message
   */
  critical(
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
  ): void {
    const errorContext = error
      ? {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          ...context,
        }
      : context;

    this.log(LogLevel.CRITICAL, message, errorContext);
  }

  /**
   * Log with specific level
   */
  log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): void {
    if (level < this.config.level) {
      return; // Skip logs below configured level
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context: this.config.includeContext
        ? { ...this.context, ...context }
        : undefined,
      stackTrace: this.config.includeStackTrace ? new Error().stack : undefined,
    };

    // Write to all outputs
    this.outputs.forEach((output) => {
      output.write(entry).catch((error) => {
        console.error("Failed to write log entry:", error);
      });
    });
  }

  /**
   * Log performance metrics
   */
  performance(
    operation: string,
    duration: number,
    context?: Record<string, unknown>,
  ): void {
    this.info(`Performance: ${operation}`, {
      operation,
      duration,
      unit: "ms",
      ...context,
    });
  }

  /**
   * Log user action
   */
  userAction(
    action: string,
    userId?: string,
    context?: Record<string, unknown>,
  ): void {
    this.info(`User Action: ${action}`, {
      action,
      userId,
      type: "user_action",
      ...context,
    });
  }

  /**
   * Log system event
   */
  systemEvent(event: string, context?: Record<string, unknown>): void {
    this.info(`System Event: ${event}`, {
      event,
      type: "system_event",
      ...context,
    });
  }

  /**
   * Log API request
   */
  apiRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: Record<string, unknown>,
  ): void {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, `API Request: ${method} ${path}`, {
      method,
      path,
      statusCode,
      duration,
      type: "api_request",
      ...context,
    });
  }

  /**
   * Flush all outputs
   */
  async flush(): Promise<void> {
    await Promise.all(
      this.outputs.map((output) =>
        output.flush ? output.flush() : Promise.resolve(),
      ),
    );
  }

  /**
   * Close all outputs
   */
  async close(): Promise<void> {
    await Promise.all(
      this.outputs.map((output) =>
        output.close ? output.close() : Promise.resolve(),
      ),
    );
  }

  /**
   * Initialize log outputs based on configuration
   */
  private initializeOutputs(): void {
    this.outputs = [];

    if (this.config.enableConsole) {
      this.outputs.push(new ConsoleLogOutput(this.config.colorize));
    }

    if (this.config.enableFile) {
      this.outputs.push(
        new FileLogOutput(
          this.config.logDirectory,
          this.config.maxFileSize,
          this.config.maxFiles,
        ),
      );
    }

    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.outputs.push(new RemoteLogOutput(this.config.remoteEndpoint));
    }
  }
}

/**
 * Global logger instance
 */
export const logger = new EnhancedLogger({
  level:
    process.env.NODE_ENV === "development" ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableFile: process.env.NODE_ENV === "production",
  colorize: process.env.NODE_ENV === "development",
});

/**
 * Create logger for specific module
 */
export function createModuleLogger(moduleName: string): EnhancedLogger {
  return logger.child({ module: moduleName });
}

/**
 * Performance logging decorator
 */
export function logPerformance(operation: string) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const startTime = Date.now();
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        logger.performance(operation, duration, { method: propertyName });
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`${operation} failed`, error as Error, {
          method: propertyName,
          duration,
        });
        throw error;
      }
    };

    return descriptor;
  };
}
