import { supabase } from "@/lib/supabaseClient";
import { withTimeout } from "@/lib/net/withTimeout";
import { withRetry } from "@/lib/net/withRetry";

const TABLE = import.meta.env.VITE_SUPABASE_HEALTHCHECK_TABLE || "products";
const TIMEOUT_MS = Number(import.meta.env.VITE_SUPABASE_HEALTHCHECK_TIMEOUT_MS || 3500);
const MAX = Number(import.meta.env.VITE_SUPABASE_RETRY_MAX_ATTEMPTS || 3);
const BASE = Number(import.meta.env.VITE_SUPABASE_RETRY_BASE_MS || 400);

export async function supabaseHealthy(): Promise<boolean> {
  const sb = supabase();
  if (!sb) return false;
  try {
    const runner = () => sb.from(TABLE).select("id").limit(1);
    const { data, error } = await withTimeout(withRetry(runner, MAX, BASE), TIMEOUT_MS);
    if (error) throw error;
    return Array.isArray(data);
  } catch {
    return false;
  }
}

/**
 * Enhanced health check with detailed metrics
 */
export async function getSupabaseHealth(): Promise<{
  isHealthy: boolean;
  responseTime: number;
  error?: string;
  retryCount?: number;
}> {
  const startTime = Date.now();
  const sb = supabase();
  
  if (!sb) {
    return {
      isHealthy: false,
      responseTime: 0,
      error: 'Client not available - missing credentials'
    };
  }

  let retryCount = 0;
  
  try {
    const runner = async () => {
      retryCount++;
      const { data, error } = await sb.from(TABLE).select("id").limit(1);
      if (error) throw error;
      return data;
    };
    
    const data = await withTimeout(withRetry(runner, MAX, BASE), TIMEOUT_MS, "health check");
    
    return {
      isHealthy: Array.isArray(data),
      responseTime: Date.now() - startTime,
      retryCount: retryCount - 1 // Subtract 1 because first attempt isn't a retry
    };
  } catch (error) {
    return {
      isHealthy: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      retryCount: retryCount - 1
    };
  }
}

/**
 * Periodic health monitoring
 */
let healthCheckInterval: NodeJS.Timeout | null = null;
let lastHealthStatus = false;

export function startHealthMonitoring(intervalMs = 60000): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  
  // Initial check
  supabaseHealthy().then(status => {
    lastHealthStatus = status;
    console.log(`[SupabaseHealth] Initial status: ${status ? 'healthy' : 'unhealthy'}`);
  });
  
  // Periodic checks
  healthCheckInterval = setInterval(async () => {
    try {
      const status = await supabaseHealthy();
      
      // Log status changes
      if (status !== lastHealthStatus) {
        console.log(`[SupabaseHealth] Status changed: ${lastHealthStatus ? 'healthy' : 'unhealthy'} → ${status ? 'healthy' : 'unhealthy'}`);
        lastHealthStatus = status;
        
        // Track in analytics
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'supabase_health_change', {
            event_category: 'infrastructure',
            event_label: status ? 'healthy' : 'unhealthy',
            value: status ? 1 : 0
          });
        }
      }
    } catch (error) {
      console.warn('[SupabaseHealth] Health check failed:', error);
    }
  }, intervalMs);
}

export function stopHealthMonitoring(): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
}

export function getLastHealthStatus(): boolean {
  return lastHealthStatus;
}