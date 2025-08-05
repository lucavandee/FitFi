import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Configuration for retry logic
const RETRY_CONFIG = {
  maxRetries: 1,
  retryDelay: 1000, // 1 second
  retryableStatusCodes: [500, 502, 503, 504, 408, 429],
  retryableErrorCodes: ['NETWORK_ERROR', 'TIMEOUT', 'CONNECTION_ERROR']
};

// Session ID for error tracking
let sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
    await supabaseClient.rpc('log_supabase_error', {
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
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // HTTP status codes
  if (error.status && RETRY_CONFIG.retryableStatusCodes.includes(error.status)) {
    return true;
  }
  
  // Specific error codes
  if (error.code && RETRY_CONFIG.retryableErrorCodes.includes(error.code)) {
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
      if (error.status === 401 || error.status === 403 || error.code === '42501') {
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
  return match ? match[1].split('?')[0] : undefined;
}

// Extract function name from URL
function extractFunctionName(url: string): string | undefined {
  if (!url) return undefined;
  
  const match = url.match(/\/rest\/v1\/rpc\/([^?]+)/);
  return match ? match[1] : undefined;
}

// Test user ID for development
export const TEST_USER_ID = 'test-user-123';

// Feature flag for Supabase usage
export const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

export default supabase;