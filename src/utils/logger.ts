type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDev: boolean;
  private enabledInProd: boolean;

  constructor() {
    this.isDev = import.meta.env.DEV;
    this.enabledInProd = import.meta.env.VITE_ENABLE_LOGS === 'true';
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDev) return true;
    if (this.enabledInProd) return true;
    return level === 'error';
  }

  private formatMessage(scope: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const ctx = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${scope}] ${message}${ctx}`;
  }

  debug(scope: string, message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage(scope, message, context));
    }
  }

  info(scope: string, message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage(scope, message, context));
    }
  }

  warn(scope: string, message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage(scope, message, context));
    }
  }

  error(scope: string, message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorDetails = error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { error };

      console.error(
        this.formatMessage(scope, message, { ...context, ...errorDetails })
      );
    }
  }

  group(scope: string, label: string): void {
    if (this.isDev) {
      console.group(`[${scope}] ${label}`);
    }
  }

  groupEnd(): void {
    if (this.isDev) {
      console.groupEnd();
    }
  }
}

export const logger = new Logger();
