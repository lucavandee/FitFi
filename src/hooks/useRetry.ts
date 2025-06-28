import { useState, useCallback } from 'react';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

interface RetryState {
  isLoading: boolean;
  error: Error | null;
  attempt: number;
  retryCount: number;
}

/**
 * Hook for retrying async operations with exponential backoff
 * @param operation - Async function to retry
 * @param options - Retry options
 * @returns Object with execute function and retry state
 */
export function useRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffFactor = 2,
    onRetry
  } = options;

  const [state, setState] = useState<RetryState>({
    isLoading: false,
    error: null,
    attempt: 0,
    retryCount: 0
  });

  const execute = useCallback(async (): Promise<T | null> => {
    setState({
      isLoading: true,
      error: null,
      attempt: 0,
      retryCount: 0
    });

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      try {
        const result = await operation();
        
        setState({
          isLoading: false,
          error: null,
          attempt,
          retryCount: attempt
        });
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempt++;
        
        setState({
          isLoading: true,
          error: lastError,
          attempt,
          retryCount: attempt - 1
        });
        
        if (onRetry) {
          onRetry(attempt, lastError);
        }
        
        if (attempt <= maxRetries) {
          // Wait before retrying with exponential backoff
          const delay = initialDelay * Math.pow(backoffFactor, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    setState({
      isLoading: false,
      error: lastError,
      attempt,
      retryCount: attempt - 1
    });
    
    return null;
  }, [operation, maxRetries, initialDelay, backoffFactor, onRetry]);

  return {
    execute,
    ...state
  };
}