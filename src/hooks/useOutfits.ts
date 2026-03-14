import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getFeed } from '@/services/DataRouter';
import { fetchOutfits } from '@/services/data/dataService';
import type { Outfit } from '@/services/data/types';

interface UseOutfitsOptions {
  archetype?: string;
  secondaryArchetype?: string;
  mixFactor?: number;
  season?: string;
  limit?: number;
  enabled?: boolean;
  gender?: 'male' | 'female' | 'unisex';
  fit?: string;
  prints?: string;
  goals?: string[];
  materials?: string[];
  colorProfile?: any;
  occasions?: string[];
  budget?: { min: number; max: number };
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
 * Hook for fetching outfits with filtering options.
 * Uses React Query for persistent cross-navigation caching.
 */
export function useOutfits(options: UseOutfitsOptions = {}): UseOutfitsResult {
  const {
    archetype,
    secondaryArchetype,
    mixFactor,
    season,
    limit,
    enabled = true,
    gender,
    fit,
    prints,
    goals,
    materials,
    colorProfile,
    occasions,
    budget,
  } = options;

  // Stable query key based on all parameters that affect results
  const queryKey = [
    'outfits',
    archetype ?? '',
    secondaryArchetype ?? '',
    mixFactor ?? 0,
    season ?? '',
    limit ?? 9,
    gender ?? '',
    fit ?? '',
    prints ?? '',
    (goals || []).sort().join(','),
    (materials || []).sort().join(','),
    (occasions || []).sort().join(','),
    budget?.min ?? '',
    budget?.max ?? '',
  ];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetchOutfits({
        archetype,
        secondaryArchetype,
        mixFactor,
        season,
        limit,
        gender,
        fit,
        prints,
        goals,
        materials,
        colorProfile,
        occasions,
        budget,
      });

      return {
        data: response.data,
        source: response.source,
        cached: response.cached,
        errors: response.errors,
      };
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 min — outfits don't change often
    gcTime: 1000 * 60 * 30,    // Keep in cache 30 min after unmount
  });

  const result = query.data;

  return {
    data: result?.data ?? null,
    loading: query.isLoading,
    error: query.error
      ? (query.error instanceof Error ? query.error.message : 'Onbekende fout')
      : (result?.source === 'fallback' && result?.errors?.length
        ? 'Live data niet beschikbaar, fallback gebruikt'
        : null),
    source: result?.source ?? 'fallback',
    cached: result?.cached ?? false,
    refetch: async () => { await query.refetch(); },
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
