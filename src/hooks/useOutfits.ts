import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getFeed } from '@/services/DataRouter';
import { fetchOutfits } from '@/services/data/dataService';
import type { Outfit } from '@/services/data/types';

interface UseOutfitsOptions {
  archetype?: string;
  season?: string;
  limit?: number;
  enabled?: boolean;
}

interface UseOutfitsResult {
  data: Outfit[] | null;
  loading: boolean;
  error: string | null;
  source: 'supabase' | 'local' | 'fallback';
  cached: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching outfits with filtering options
 */
export function useOutfits(options: UseOutfitsOptions = {}): UseOutfitsResult {
  const {
    archetype,
    season,
    limit,
    enabled = true
  } = options;

  const [data, setData] = useState<Outfit[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'local' | 'fallback'>('fallback');
  const [cached, setCached] = useState(false);

  const loadOutfits = async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let alive = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchOutfits({
        archetype,
        season,
        limit
      });
      
      if (alive) {
        setData(response.data);
        setSource(response.source);
        setCached(response.cached);
        
        // Set warning if using fallback
        if (response.source === 'fallback' && response.errors && response.errors.length > 0) {
          setError('Live data niet beschikbaar, fallback gebruikt');
        }
      }
    } catch (err) {
      if (alive) {
        setError(err instanceof Error ? err.message : 'Onbekende fout');
        setData([]);
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
    const cleanup = loadOutfits();
    return () => cleanup.then(fn => fn?.());
  }, [archetype, season, limit, enabled]);

  return {
    data,
    loading,
    error,
    source,
    cached,
    refetch: loadOutfits
  };
}

/**
 * Hook for infinite scrolling outfits feed
 */
export function useInfiniteOutfits(options: {
  userId?: string;
  archetypes?: string[];
  pageSize?: number;
}) {
  return useInfiniteQuery({
    queryKey: ['outfits', 'infinite', options],
    queryFn: async ({ pageParam = 0 }) => {
      const feed = await getFeed({
        userId: options.userId,
        count: options.pageSize || 12,
        archetypes: options.archetypes,
        offset: pageParam
      });
      
      return {
        outfits: feed,
        nextCursor: feed.length === (options.pageSize || 12) ? pageParam + feed.length : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0
  });
}