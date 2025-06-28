import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook for managing timeouts with automatic cleanup
 * @param callback - Function to call when timeout expires
 * @param delay - Delay in milliseconds
 * @returns Object with start, stop, and reset functions
 */
export function useTimeout(callback: () => void, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update the callback ref when the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Clear the timeout when the component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Start the timeout
  const start = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current();
    }, delay);
  }, [delay]);

  // Stop the timeout
  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Reset the timeout
  const reset = useCallback(() => {
    stop();
    start();
  }, [start, stop]);

  return { start, stop, reset };
}

/**
 * Hook for creating a delayed callback
 * @param callback - Function to call after delay
 * @param delay - Delay in milliseconds
 * @returns Delayed callback function
 */
export function useDelayedCallback(callback: () => void, delay: number) {
  const { start } = useTimeout(callback, delay);
  
  return useCallback(() => {
    start();
  }, [start]);
}

/**
 * Hook for creating a timeout that automatically starts
 * @param callback - Function to call when timeout expires
 * @param delay - Delay in milliseconds
 * @param autoStart - Whether to start the timeout automatically
 * @returns Object with stop and reset functions
 */
export function useAutoTimeout(callback: () => void, delay: number, autoStart = true) {
  const { start, stop, reset } = useTimeout(callback, delay);
  
  useEffect(() => {
    if (autoStart) {
      start();
    }
    return stop;
  }, [autoStart, start, stop]);
  
  return { stop, reset };
}