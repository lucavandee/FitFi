import { useInfiniteQuery } from '@tanstack/react-query';
import { getFeed } from '@/services/DataRouter';
import { fetchOutfits } from '@/services/data/dataService';
import type { Outfit } from '@/services/data/types';

export function useOutfits(limit = 12) {
  return useInfiniteQuery({
    queryKey: ['outfits'],
    queryFn: ({ pageParam = 0 }) => {
      return getFeed({ 
        count: limit,
        offset: pageParam 
      }).then(items => ({
        items,
        hasMore: items.length === limit, // Has more if we got a full page
        nextOffset: pageParam + limit
      }));
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextOffset : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Simple outfits hook for direct data service integration
 */
export function useOutfitsData(options: {
  archetype?: string;
  season?: "spring" | "summer" | "autumn" | "winter" | "all";
  limit?: number;
} = {}) {
  const [data, setData] = useState<Outfit[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'local' | 'fallback'>('fallback');
  const [cached, setCached] = useState(false);

  const loadOutfits = async () => {
    let alive = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchOutfits(options);
      
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
  }, [options.archetype, options.season, options.limit]);

  return {
    data,
    loading,
    error,
    source,
    cached,
    refetch: loadOutfits
  };
}