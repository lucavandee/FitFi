import { useState, useEffect, useCallback } from 'react';
import supabase, { isValidUUID, TEST_USER_ID } from '../lib/supabase';
import toast from 'react-hot-toast';
import { USE_SUPABASE } from '../config/app-config';
import { generateMockUser, generateMockGamification } from '../utils/mockDataUtils';

/**
 * Configuration for the useSupabase hook
 */
interface UseSupabaseConfig {
  /** Maximum number of retries for failed requests */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Whether to show toast notifications for errors */
  showToasts?: boolean;
  /** Whether to use mock data as fallback */
  useMockFallback?: boolean;
}

/**
 * State returned by the useSupabase hook
 */
interface UseSupabaseState<T> {
  /** The data returned from the query */
  data: T | null;
  /** Whether the query is currently loading */
  isLoading: boolean;
  /** Any error that occurred during the query */
  error: Error | null;
  /** Whether the query has been executed */
  isExecuted: boolean;
  /** Whether the query is currently being retried */
  isRetrying: boolean;
  /** The number of retries that have been attempted */
  retryCount: number;
  /** Whether the query timed out */
  isTimedOut: boolean;
  /** Whether mock data is being used */
  isMockData: boolean;
}

/**
 * A hook for making Supabase queries with retry logic, timeout handling, and error management
 * @param queryFn - Function that performs the Supabase query
 * @param mockData - Optional mock data to use as fallback
 * @param config - Configuration options
 * @returns Query state and execution function
 */
export function useSupabase<T>(
  queryFn: () => Promise<T>,
  mockData: T | null = null,
  config: UseSupabaseConfig = {}
) {
  const {
    maxRetries = 2,
    retryDelay = 1000,
    timeout = 10000,
    showToasts = true,
    useMockFallback = true
  } = config;

  const [state, setState] = useState<UseSupabaseState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isExecuted: false,
    isRetrying: false,
    retryCount: 0,
    isTimedOut: false,
    isMockData: false
  });

  /**
   * Executes the Supabase query with retry logic and timeout handling
   */
  const execute = useCallback(async () => {
    if (!USE_SUPABASE) {
      console.log('[Fallback] Supabase disabled – using mock data');
      setState({
        data: mockData,
        isLoading: false,
        error: null,
        isExecuted: true,
        isRetrying: false,
        retryCount: 0,
        isTimedOut: false,
        isMockData: true
      });
      return mockData;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isRetrying: false,
      retryCount: 0,
      isTimedOut: false,
      isMockData: false
    }));

    let currentRetry = 0;
    let lastError: Error | null = null;

    const attemptQuery = async (): Promise<T | null> => {
      try {
        // Set up timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          const timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);
            reject(new Error('Request timed out'));
          }, timeout);
        });

        // Race between the query and timeout
        const result = await Promise.race([queryFn(), timeoutPromise]);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (currentRetry < maxRetries) {
          // Update state to show retrying
          setState(prev => ({
            ...prev,
            isRetrying: true,
            retryCount: currentRetry + 1,
            error: lastError
          }));

          // Wait before retrying with exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, retryDelay * Math.pow(2, currentRetry))
          );
          
          currentRetry++;
          return attemptQuery();
        }
        
        throw lastError;
      }
    };

    try {
      const result = await attemptQuery();
      
      setState({
        data: result,
        isLoading: false,
        error: null,
        isExecuted: true,
        isRetrying: false,
        retryCount: currentRetry,
        isTimedOut: false,
        isMockData: false
      });
      
      return result;
    } catch (error) {
      const isTimeout = error instanceof Error && error.message === 'Request timed out';
      
      console.error('Supabase query failed after retries:', error);
      
      if (showToasts) {
        toast.error(
          isTimeout 
            ? 'Request timed out. Please try again.' 
            : 'Failed to load data. Please try again.'
        );
      }
      
      // Use mock data as fallback if available
      if (useMockFallback && mockData !== null) {
        console.log('Using mock data fallback');
        
        setState({
          data: mockData,
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error)),
          isExecuted: true,
          isRetrying: false,
          retryCount: currentRetry,
          isTimedOut: isTimeout,
          isMockData: true
        });
        
        return mockData;
      }
      
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
        isExecuted: true,
        isRetrying: false,
        retryCount: currentRetry,
        isTimedOut: isTimeout,
        isMockData: false
      });
      
      return null;
    }
  }, [queryFn, mockData, maxRetries, retryDelay, timeout, showToasts, useMockFallback]);

  return {
    ...state,
    execute
  };
}

/**
 * A hook for making Supabase queries that automatically execute on mount
 * @param queryFn - Function that performs the Supabase query
 * @param mockData - Optional mock data to use as fallback
 * @param config - Configuration options
 * @returns Query state and refetch function
 */
export function useSupabaseQuery<T>(
  queryFn: () => Promise<T>,
  mockData: T | null = null,
  config: UseSupabaseConfig & { executeOnMount?: boolean } = {}
) {
  const { executeOnMount = true, ...restConfig } = config;
  const supabase = useSupabase(queryFn, mockData, restConfig);
  
  useEffect(() => {
    if (!USE_SUPABASE) {
      console.log('[Fallback] Supabase disabled – skipping automatic query execution');
      return;
    }

    if (executeOnMount) {
      supabase.execute();
    }
  }, [executeOnMount, supabase.execute]);
  
  return {
    ...supabase,
    refetch: supabase.execute
  };
}

/**
 * A hook for getting the current user's gamification data
 * @returns Gamification data and loading state
 */
export function useUserGamification() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchGamification = async () => {
      setIsLoading(true);
      
      if (!USE_SUPABASE) {
        console.log('[Fallback] Supabase disabled – using mock gamification data');
        setData(generateMockGamification(TEST_USER_ID));
        setIsLoading(false);
        return;
      }

      try {
        // Always use test user ID for development
        const effectiveUserId = TEST_USER_ID;
        
        if (!isValidUUID(effectiveUserId)) {
          throw new Error(`Invalid UUID format: ${effectiveUserId}`);
        }
        
        const { data, error } = await supabase
          .from('user_gamification')
          .select('*')
          .eq('user_id', effectiveUserId)
          .single();
          
        if (error) throw error;
        
        setData(data);
      } catch (err) {
        console.error('Error fetching gamification data:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        
        // Use mock data as fallback
        setData({
          id: 'mock_gamification',
          user_id: TEST_USER_ID,
          points: 120,
          level: 'beginner',
          badges: ['first_quiz'],
          streak: 2,
          last_check_in: new Date().toISOString(),
          completed_challenges: ['view3', 'shareLook'],
          total_referrals: 1,
          seasonal_event_progress: {}
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGamification();
  }, []);
  
  return { data, isLoading, error };
}