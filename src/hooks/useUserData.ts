import { useState, useEffect } from 'react';
import { dataService } from '@/services/DataService';
import { UserProfile } from '@/context/UserContext';

interface UseUserDataResult {
  userData: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  source: 'supabase' | 'local' | 'fallback';
  cached: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching user data
 */
export function useUserData(userId?: string): UseUserDataResult {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'local' | 'fallback'>('fallback');
  const [cached, setCached] = useState(false);

  const fetchUserData = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await dataService.getUser(userId);

      setUserData(response.data);
      setSource(response.source);
      setCached(response.cached);

      // Set error if we had to use fallback
      if (response.source === 'fallback' && response.errors.length > 0) {
        setError('Kon geen live data laden, fallback gebruikt');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout');
      setUserData(null);
      setSource('fallback');
      setCached(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  return {
    userData,
    isLoading,
    error,
    source,
    cached,
    refetch: fetchUserData
  };
}