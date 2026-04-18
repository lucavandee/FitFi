import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getFeed } from '@/services/DataRouter';
import { fetchOutfits } from '@/services/data/dataService';
import { outfitService } from '@/services/outfits/outfitService';
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
  /** When provided, engine v2 is used via outfitService (moodboard-aware). */
  answers?: Record<string, any>;
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
    answers,
  } = options;

  // Stable query key based on all parameters that affect results
  const queryKey = [
    'outfits',
    answers ? 'v2' : 'v1',
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
      // Engine v2 path: use outfitService which reads moodboard data from localStorage
      if (answers) {
        const generated = await outfitService.generateOutfits(answers, limit ?? 9);
        return {
          data: generated as any as Outfit[],
          source: 'supabase' as const,
          cached: false,
          errors: [] as string[],
        };
      }

      // Legacy path: dataService → outfitComposer (v1)
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
