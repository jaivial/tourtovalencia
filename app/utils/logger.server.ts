type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
}

class Logger {
  private isProduction = process.env.NODE_ENV === "production";

  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const logData: LogEntry = {
      timestamp,
      level,
      message,
      ...meta,
    };

    if (this.isProduction) {
      if (level === "warn" || level === "error") {
        console.error(JSON.stringify(logData));
      }
    } else {
      const prefix = `[${level.toUpperCase()}]`;
      
      switch (level) {
        case "debug":
          console.debug(prefix, logData);
          break;
        case "info":
          console.info(prefix, logData);
          break;
        case "warn":
          console.warn(prefix, logData);
          break;
        case "error":
          console.error(prefix, logData);
          break;
      }
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log("debug", message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log("warn", message, meta);
  }

  error(message: string, error?: unknown, meta?: Record<string, unknown>): void {
    const errorMeta = {
      ...meta,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: this.isProduction ? undefined : error.stack,
      } : error,
    };
    
    this.log("error", message, errorMeta);
  }
}

export const logger = new Logger();
