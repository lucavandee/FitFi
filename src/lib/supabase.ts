import { supabase as getSupabaseClient } from './supabaseClient';
import toast from 'react-hot-toast';

// Configuration for retry logic
const RETRY_CONFIG = {
  maxRetries: 1,
  retryDelay: 1000, // 1 second
  retryableStatusCodes: [500, 502, 503, 504, 408, 429],
  retryableErrorCodes: ['NETWORK_ERROR', 'TIMEOUT', 'CONNECTION_ERROR']
};

// Session ID for error tracking
let sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Check if Supabase is enabled and configured
 */
export function isSupabaseEnabled(): boolean {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
  const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return useSupabase && hasUrl && hasKey;
}

/**
 * Get Supabase client (lazy, optional)
 * Returns null if Supabase is disabled or not configured
 */
export function getSupabase() {
  if (!isSupabaseEnabled()) {
    return null;
  }
  
  try {
    return getSupabaseClient();
  } catch (error) {
    console.warn('[Supabase] Client initialization failed:', error);
    return null;
  }
}

/**
 * Require Supabase client (throws descriptive error if not available)
 * Use this only when Supabase is absolutely required
 */
export function requireSupabase() {
  const client = getSupabase();
  
  if (!client) {
    const reason = !import.meta.env.VITE_USE_SUPABASE 
      ? 'Supabase is uitgeschakeld via VITE_USE_SUPABASE=false'
      : !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY
        ? 'Supabase credentials ontbreken (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY)'
        : 'Supabase client kon niet worden geïnitialiseerd';
    
    throw new Error(`Supabase vereist maar niet beschikbaar: ${reason}`);
  }
  
  return client;
}

// Error logging function
async function logSupabaseError(
  error: any,
  operation: string,
  tableName?: string,
  functionName?: string,
  retryCount: number = 0
): Promise<void> {
  try {
    // Don't log errors from the error logging itself to prevent infinite loops
    if (tableName === 'supabase_errors' || functionName === 'log_supabase_error') {
      return;
    }

    const sb = getSupabase();
    if (!sb) return; // Can't log if Supabase not available

    const errorDetails = {
      operation,
      tableName,
      functionName,
      retryCount,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: new Date().toISOString()
    };

    // Use the RPC function to log the error
    await sb.rpc('log_supabase_error', {
      error_code_param: error.code || error.status?.toString() || 'UNKNOWN',
      error_message_param: error.message || 'Unknown error',
      operation_type_param: operation,
      table_name_param: tableName,
      function_name_param: functionName,
      error_details_param: errorDetails,
      retry_count_param: retryCount,
      severity_param: getSeverityLevel(error)
    });
  } catch (loggingError) {
    // Silently fail error logging to prevent cascading errors
    console.warn('[Supabase] Failed to log error:', loggingError);
  }
}

// Determine error severity
function getSeverityLevel(error: any): string {
  if (error.code === '42501' || error.status === 401 || error.status === 403) {
    return 'warning'; // Auth errors are warnings, not critical
  }
  if (error.status >= 500) {
    return 'critical';
  }
  if (error.status >= 400) {
    return 'error';
  }
  return 'info';
}

// Check if error is retryable
function isRetryableError(error: any): boolean {
  const e = error as any;
  
  // Network errors
  if (e?.name === 'TypeError' && e?.message?.includes('fetch')) {
    return true;
  }
  
  // HTTP status codes
  if (e?.status && RETRY_CONFIG.retryableStatusCodes.includes(e.status)) {
    return true;
  }
  
  // Specific error codes
  if (e?.code && RETRY_CONFIG.retryableErrorCodes.includes(e.code)) {
    return true;
  }
  
  return false;
}

// Sleep function for retry delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Enhanced request wrapper with retry logic and error logging
async function enhancedRequest(originalRequest: Function, options: any, context: any): Promise<any> {
  let lastError: any;
  let retryCount = 0;
  
  while (retryCount <= RETRY_CONFIG.maxRetries) {
    try {
      const result = await originalRequest.call(context, options);
      
      // If we had retries and now succeeded, log the recovery
      if (retryCount > 0) {
        console.log(`[Supabase] Operation succeeded after ${retryCount} retries`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Extract operation details for logging
      const operation = options.method || 'unknown';
      const tableName = extractTableName(options.url);
      const functionName = extractFunctionName(options.url);
      
      // Log the error
      await logSupabaseError(error, operation, tableName, functionName, retryCount);
      
      // Handle specific error types
      const e = error as any;
      if (e?.status === 401 || e?.status === 403 || e?.code === '42501') {
        // Auth errors - show toast but don't retry or sign out
        if (typeof window !== 'undefined') {
          toast.error('Sessie verlopen - probeer opnieuw in te loggen', {
            id: 'auth-error', // Prevent duplicate toasts
            duration: 5000
          });
        }
        throw error; // Don't retry auth errors
      }
      
      // Check if we should retry
      if (retryCount < RETRY_CONFIG.maxRetries && isRetryableError(error)) {
        retryCount++;
        console.warn(`[Supabase] Retrying operation (${retryCount}/${RETRY_CONFIG.maxRetries}):`, error.message);
        
        // Exponential backoff
        await sleep(RETRY_CONFIG.retryDelay * Math.pow(2, retryCount - 1));
        continue;
      }
      
      // No more retries or non-retryable error
      throw error;
    }
  }
  
  throw lastError;
}

// Extract table name from URL
function extractTableName(url: string): string | undefined {
  if (!url) return undefined;
  
  const match = url.match(/\/rest\/v1\/([^?]+)/);
  return match && match[1] ? match[1].split('?')[0] : undefined;
}

// Extract function name from URL
function extractFunctionName(url: string): string | undefined {
  if (!url) return undefined;
  
  const match = url.match(/\/rest\/v1\/rpc\/([^?]+)/);
  return match && match[1] ? match[1] : undefined;
}

// Test user ID for development
export const TEST_USER_ID = 'test-user-123';

// Feature flag for Supabase usage
export const USE_SUPABASE = isSupabaseEnabled();

// Legacy export for backward compatibility
export { getSupabase as supabase };