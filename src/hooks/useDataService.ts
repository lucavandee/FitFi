import { useState, useEffect } from 'react';
import { dataService } from '@/services/DataService';

interface UseDataServiceResult {
  cacheStats: {
    size: number;
    entries: Array<{ key: string; source: string; age: number }>;
  };
  recentErrors: Array<{
    source: string;
    operation: string;
    error: string;
    timestamp: number;
  }>;
  clearCache: () => void;
  refreshStats: () => void;
}

/**
 * Hook for monitoring data service health and performance
 */
export function useDataService(): UseDataServiceResult {
  const [cacheStats, setCacheStats] = useState<any>({ size: 0, entries: [] });
  const [recentErrors, setRecentErrors] = useState<any[]>([]);

  const refreshStats = () => {
    setCacheStats(dataService.getCacheStats());
    setRecentErrors(dataService.getRecentErrors());
  };

  const clearCache = () => {
    dataService.clearCache();
    refreshStats();
  };

  useEffect(() => {
    refreshStats();
    
    // Auto-refresh every 10 seconds in development
    if (import.meta.env.DEV) {
      const interval = setInterval(refreshStats, 10000);
      return () => clearInterval(interval);
    }
  }, []);

  return {
    cacheStats,
    recentErrors,
    clearCache,
    refreshStats
  };
}