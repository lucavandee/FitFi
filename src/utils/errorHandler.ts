import toast from 'react-hot-toast';
import { logger } from './logger';

interface ErrorContext {
  [key: string]: any;
}

export class AppError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public context?: ErrorContext
  ) {
    super(message);
    this.name = 'AppError';
  }
}

class ErrorHandler {
  handle(error: unknown, scope: string, context?: ErrorContext): void {
    if (error instanceof AppError) {
      logger.error(scope, error.message, error, { ...context, ...error.context });
      toast.error(error.userMessage);
      return;
    }

    if (error instanceof Error) {
      logger.error(scope, error.message, error, context);

      const userMessage = this.getUserFriendlyMessage(error);
      toast.error(userMessage);
      return;
    }

    logger.error(scope, 'Unknown error', error, context);
    toast.error('Er ging iets mis. Probeer het opnieuw.');
  }

  private getUserFriendlyMessage(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'Verbinding mislukt. Controleer je internetverbinding.';
    }

    if (message.includes('timeout')) {
      return 'De verbinding duurde te lang. Probeer het opnieuw.';
    }

    if (message.includes('auth') || message.includes('unauthorized')) {
      return 'Je sessie is verlopen. Log opnieuw in.';
    }

    if (message.includes('not found') || message.includes('404')) {
      return 'De gevraagde gegevens zijn niet gevonden.';
    }

    if (message.includes('rate limit')) {
      return 'Te veel verzoeken. Wacht even en probeer opnieuw.';
    }

    return 'Er ging iets mis. Probeer het opnieuw.';
  }

  async withErrorHandling<T>(
    scope: string,
    fn: () => Promise<T>,
    errorMessage?: string,
    context?: ErrorContext
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error, scope, context);

      if (errorMessage) {
        toast.error(errorMessage);
      }

      return null;
    }
  }

  showSuccess(message: string): void {
    toast.success(message);
  }

  showInfo(message: string): void {
    toast(message, { icon: 'ℹ️' });
  }
}

export const errorHandler = new ErrorHandler();

export function createAppError(
  message: string,
  userMessage: string,
  context?: ErrorContext
): AppError {
  return new AppError(message, userMessage, context);
}
