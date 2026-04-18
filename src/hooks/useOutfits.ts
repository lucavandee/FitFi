import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getFeed } from '@/services/DataRouter';
import { fetchOutfits } from '@/services/data/dataService';
import { outfitService } from '@/services/outfits/outfitService';
import type { Outfit } from '@/services/data/types';

/**
 * Deterministic string digest of a quiz-answers object, used as part of the
 * React Query key. Stable JSON ordering ensures two calls with the same answer
 * content produce the same key regardless of object reference or key order.
 */
function stableAnswersKey(answers: Record<string, any>): string {
  try {
    const keys = Object.keys(answers).sort();
    const normalized: Record<string, any> = {};
    for (const k of keys) normalized[k] = answers[k];
    return JSON.stringify(normalized);
  } catch {
    return '';
  }
}

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

  // Engine v2 reads moodboard/archetype/color from answers + localStorage itself,
  // so the queryKey only needs a stable digest of answers + limit. Including
  // archetype/secondaryArchetype/mixFactor/colorProfile here would cause
  // unnecessary refetches when those resolve asynchronously on the results page.
  const queryKey = answers
    ? ([
        'outfits',
        'v2',
        stableAnswersKey(answers),
        limit ?? 9,
      ] as const)
    : ([
        'outfits',
        'v1',
        archetype ?? '',
        secondaryArchetype ?? '',
        mixFactor ?? 0,
        season ?? '',
        limit ?? 9,
        gender ?? '',
        fit ?? '',
        prints ?? '',
        (goals || []).slice().sort().join(','),
        (materials || []).slice().sort().join(','),
        (occasions || []).slice().sort().join(','),
        budget?.min ?? '',
        budget?.max ?? '',
      ] as const);

  const query = useQuery({
    queryKey: queryKey as unknown as readonly unknown[],
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
    // Outfits are deterministic per quiz answer set. Keep the result pinned for
    // the lifetime of the session so async updates (archetype detection, color
    // profile generation) don't trigger refetches.
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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
