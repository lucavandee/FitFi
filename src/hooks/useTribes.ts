import { useEffect, useState } from "react";
import type { Tribe, DataResponse } from "@/services/data/types";
import { fetchTribes, fetchTribeBySlug } from "@/services/data/dataService";

interface UseTribesOptions {
  featured?: boolean;
  archetype?: string;
  limit?: number;
  enabled?: boolean;
  refetchOnMount?: boolean;
}

interface UseTribesResult {
  data: Tribe[] | null;
  loading: boolean;
  error: string | null;
  source: 'supabase' | 'local' | 'fallback';
  cached: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching tribes with filtering options
 */
export function useTribes(options: UseTribesOptions = {}): UseTribesResult {
  const {
    featured,
    archetype,
    limit,
    enabled = true,
    refetchOnMount = true
  } = options;

  const [data, setData] = useState<Tribe[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'local' | 'fallback'>('fallback');
  const [cached, setCached] = useState(false);

  const loadTribes = async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let alive = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const response: DataResponse<Tribe[]> = await fetchTribes({
        featured,
        archetype,
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
    if (refetchOnMount || !data) {
      const cleanup = loadTribes();
      return () => cleanup.then(fn => fn?.());
    }
  }, [featured, archetype, limit, enabled, refetchOnMount]);

  return {
    data,
    loading,
    error,
    source,
    cached,
    refetch: loadTribes
  };
}

/**
 * Hook for fetching a single tribe by slug
 */
export function useTribeBySlug(slug: string, userId?: string): UseTribesResult & { tribe: Tribe | null } {
  const [tribe, setTribe] = useState<Tribe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'local' | 'fallback'>('fallback');
  const [cached, setCached] = useState(false);

  const loadTribe = async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let alive = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const response: DataResponse<Tribe | null> = await fetchTribeBySlug(slug, userId);
      
      if (alive) {
        setTribe(response.data);
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
        setTribe(null);
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
    const cleanup = loadTribe();
    return () => cleanup.then(fn => fn?.());
  }, [slug, userId]);

  return {
    data: tribe ? [tribe] : null,
    tribe,
    loading,
    error,
    source,
    cached,
    refetch: loadTribe
  };
}