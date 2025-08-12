import { useEffect, useState } from "react";
import type { TribeRanking, DataResponse } from "@/services/data/types";
import { fetchTribeRankings } from "@/services/data/dataService";

interface UseTribeRankingOptions {
  limit?: number;
  enabled?: boolean;
}

interface UseTribeRankingResult {
  rankings: TribeRanking[] | null;
  userTribeRank: TribeRanking | null;
  loading: boolean;
  error: string | null;
  source: 'supabase' | 'local' | 'fallback';
  cached: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching tribe rankings
 */
export function useTribeRanking(
  userId?: string,
  options: UseTribeRankingOptions = {}
): UseTribeRankingResult {
  const {
    limit = 10,
    enabled = true
  } = options;

  const [rankings, setRankings] = useState<TribeRanking[] | null>(null);
  const [userTribeRank, setUserTribeRank] = useState<TribeRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'local' | 'fallback'>('fallback');
  const [cached, setCached] = useState(false);

  const loadRankings = async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let alive = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const response: DataResponse<TribeRanking[]> = await fetchTribeRankings({
        limit,
        userId
      });
      
      if (alive) {
        setRankings(response.data);
        setSource(response.source);
        setCached(response.cached);
        
        // Find user's tribe rank if available
        if (userId && response.data) {
          const userRank = response.data.find(r => r.tribeId === userId);
          setUserTribeRank(userRank || null);
        }
        
        // Set warning if using fallback
        if (response.source === 'fallback' && response.errors && response.errors.length > 0) {
          setError('Live data niet beschikbaar, fallback gebruikt');
        }
      }
    } catch (err) {
      if (alive) {
        setError(err instanceof Error ? err.message : 'Onbekende fout');
        setRankings([]);
        setUserTribeRank(null);
        setSource('fallback');
        setCached(false);
      }
    } finally {
      if (alive) {
        setLoading(false);
      }
    }
    
    return () => { alive = false; };
  };

  useEffect(() => {
    const cleanup = loadRankings();
    return () => cleanup.then(fn => fn?.());
  }, [userId, limit, enabled]);

  return {
    rankings,
    userTribeRank,
    loading,
    error,
    source,
    cached,
    refetch: loadRankings
  };
}

/**
 * Hook for specific tribe ranking
 */
export function useSpecificTribeRanking(tribeId: string) {
  const [ranking, setRanking] = useState<TribeRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTribeRanking = async () => {
    if (!tribeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchTribeRankings({ tribeId });
      
      if (response.data && response.data.length > 0) {
        setRanking(response.data[0]);
      } else {
        setRanking(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout');
      setRanking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTribeRanking();
  }, [tribeId]);

  return {
    ranking,
    loading,
    error,
    refetch: loadTribeRanking
  };
}