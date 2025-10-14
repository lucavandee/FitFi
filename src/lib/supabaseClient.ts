import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
const useFlag = (import.meta.env.VITE_USE_SUPABASE ?? 'false').toString().toLowerCase() === 'true';

let _client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (_client) return _client;

  // Check if Supabase is enabled via flag
  if (!useFlag) {
    console.warn('⚠️ [SupabaseClient] Supabase disabled via VITE_USE_SUPABASE flag');
    return null;
  }

  if (!url || !anonKey) {
    console.error('❌ [SupabaseClient] Missing credentials:', {
      hasUrl: !!url,
      hasKey: !!anonKey,
      url: url ? `${url.substring(0, 30)}...` : 'undefined'
    });
    return null;
  }

  console.log('🔧 [Supabase] Initializing client:', {
    url: `${url.substring(0, 30)}...`,
    hasKey: !!anonKey
  });

  // Clear any corrupted auth state
  try {
    const authKey = "fitfi.supabase.auth";
    const stored = localStorage.getItem(authKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      // If auth state is invalid, clear it
      if (!parsed || typeof parsed !== 'object') {
        console.warn('⚠️ [Supabase] Clearing corrupted auth state');
        localStorage.removeItem(authKey);
      }
    }
  } catch (e) {
    console.warn('⚠️ [Supabase] Error checking auth state:', e);
    localStorage.removeItem("fitfi.supabase.auth");
  }

  _client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "fitfi.supabase.auth",
      detectSessionInUrl: false, // Prevent hanging on URL-based session recovery
    },
  });

  return _client;
}

/**
 * Health check function for Supabase connection
 */
export async function checkSupabaseHealth(): Promise<{
  isHealthy: boolean;
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();
  const client = supabase();
  
  if (!client) {
    return {
      isHealthy: false,
      responseTime: 0,
      error: 'Client not available - missing credentials'
    };
  }

  try {
    const healthcheckTable = import.meta.env.VITE_SUPABASE_HEALTHCHECK_TABLE ?? "products";
    const timeout = parseInt(import.meta.env.VITE_SUPABASE_HEALTHCHECK_TIMEOUT_MS ?? "3500");
    
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), timeout);
    });
    
    // Race between health check and timeout
    const healthCheckPromise = client
      .from(healthcheckTable)
      .select('id')
      .limit(1);
    
    const { error } = await Promise.race([healthCheckPromise, timeoutPromise]) as any;
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        isHealthy: false,
        responseTime,
        error: error.message
      };
    }
    
    return {
      isHealthy: true,
      responseTime
    };
  } catch (error) {
    return {
      isHealthy: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Retry wrapper for Supabase operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts?: number,
  baseDelayMs?: number
): Promise<T> {
  const attempts = maxAttempts ?? parseInt(import.meta.env.VITE_SUPABASE_RETRY_MAX_ATTEMPTS ?? "3");
  const baseDelay = baseDelayMs ?? parseInt(import.meta.env.VITE_SUPABASE_RETRY_BASE_MS ?? "400");
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === attempts) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.warn(`[SupabaseClient] Retry ${attempt}/${attempts} after ${delay}ms:`, error);
    }
  }
  
  throw lastError!;
}

/**
 * Get current session info for debugging
 */
export function getSessionInfo(): {
  hasSession: boolean;
  userId?: string;
  email?: string;
  expiresAt?: number;
} {
  const client = supabase();
  if (!client) return { hasSession: false };
  
  try {
    const session = client.auth.getSession();
    return {
      hasSession: !!session,
      userId: (session as any)?.data?.session?.user?.id,
      email: (session as any)?.data?.session?.user?.email,
      expiresAt: (session as any)?.data?.session?.expires_at
    };
  } catch {
    return { hasSession: false };
  }
}