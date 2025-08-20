import { supabase } from './supabase';

interface HealthStatus {
  isHealthy: boolean;
  lastCheck: Date;
  errors: string[];
  responseTime?: number;
}

let healthStatus: HealthStatus = {
  isHealthy: true,
  lastCheck: new Date(),
  errors: []
};

let healthCheckInterval: NodeJS.Timeout | null = null;

export async function checkSupabaseHealth(): Promise<HealthStatus> {
  const startTime = Date.now();
  
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Simple health check - try to query a system table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();

    const responseTime = Date.now() - startTime;

    if (error) {
      healthStatus = {
        isHealthy: false,
        lastCheck: new Date(),
        errors: [error.message],
        responseTime
      };
    } else {
      healthStatus = {
        isHealthy: true,
        lastCheck: new Date(),
        errors: [],
        responseTime
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    healthStatus = {
      isHealthy: false,
      lastCheck: new Date(),
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      responseTime
    };
  }

  return healthStatus;
}

export function getHealthStatus(): HealthStatus {
  return healthStatus;
}

/**
 * Simple health check - returns true if Supabase is healthy
 */
export function isHealthy(): boolean {
  return healthStatus.isHealthy;
}

export function startHealthMonitoring(intervalMs: number = 60000): () => void {
  // Clear any existing interval
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }

  // Start periodic health checks
  healthCheckInterval = setInterval(async () => {
    try {
      await checkSupabaseHealth();
    } catch (error) {
      console.warn('Health check failed:', error);
    }
  }, intervalMs);

  // Return cleanup function
  return () => {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      healthCheckInterval = null;
    }
  };
}

export function stopHealthMonitoring(): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
}