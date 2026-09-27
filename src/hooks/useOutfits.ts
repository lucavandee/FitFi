import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getFeed } from '@/services/DataRouter';
import { fetchOutfits } from '@/services/data/dataService';
import { outfitService } from '@/services/outfits/outfitService';
import type { Outfit } from '@/services/data/types';
import { composeVoorProfiel } from '@/keten/composeClient';
import { browserKetenConfig } from '@/keten/browserConfig';
import { profielVanQuizAnswers } from '@/keten/vanQuiz';
import { ketenStylistVlagAan } from '@/keten/vlag';
import type { OutfitBron } from '@/keten/types';
import { getSessionId } from '@/utils/sessionId';

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
  /** Bron van de stylist-route als de lokale vlag ff_keten_stylist aan staat, anders null */
  ketenBron: OutfitBron | null;
  refetch: () => Promise<void>;
}

interface OutfitsQueryData {
  data: Outfit[];
  source: 'supabase' | 'local' | 'fallback';
  cached: boolean;
  errors: string[];
  ketenBron: OutfitBron | null;
}

/**
 * Bouwt de React Query key. Losgetrokken van de hook zelf zodat het gedrag
 * "met de vlag uit is de sleutel identiek aan voor taak 9" met een gewone
 * vitest-test te bewijzen is, zonder een React-renderer nodig te hebben (dit
 * project heeft geen @testing-library/react en de vitest-omgeving is 'node',
 * dus useQuery zelf is hier niet zonder meer te renderen).
 */
export function buildOutfitsQueryKey(
  options: UseOutfitsOptions,
  stylistVlag: boolean
): readonly unknown[] {
  const {
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
    occasions,
    budget,
    answers,
  } = options;

  // Engine v2 reads moodboard/archetype/color from answers + localStorage itself,
  // so the queryKey only needs a stable digest of answers + limit. Including
  // archetype/secondaryArchetype/mixFactor/colorProfile here would cause
  // unnecessary refetches when those resolve asynchronously on the results page.
  return answers
    ? ([
        'outfits',
        stylistVlag ? 'stylist' : 'v2',
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
}

/**
 * De eigenlijke queryFn, ook los van de hook geëxporteerd (zelfde reden als
 * buildOutfitsQueryKey hierboven). Zonder de vlag doorloopt dit precies de
 * twee paden die er al waren (engine v2 op answers, of het legacy v1-pad);
 * de stylist-route (plan 3) is een nieuwe tak ervóór die alleen wordt
 * betreden als `stylistVlag` waar is.
 */
export async function haalOutfitsVoorQuery(
  options: UseOutfitsOptions,
  stylistVlag: boolean
): Promise<OutfitsQueryData> {
  const {
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
    answers,
  } = options;

  // Stylist-route (plan 3), alleen achter de lokale vlag ff_keten_stylist=1.
  // Bouwt het profiel uit de quiz-antwoorden; plan 4 vervangt dat door
  // taste_profiles uit de onboarding v2.
  if (answers && stylistVlag) {
    const cfg = browserKetenConfig();
    const profiel = profielVanQuizAnswers(answers, getSessionId());
    if (cfg && profiel) {
      const r = await composeVoorProfiel(cfg, profiel);
      // De twee herkansingsvlaggen (afwijking 3, taak 9-brief) horen hier in
      // de bestaande consoleregel: een herkansing op de anon-statement-timeout
      // mag niet stil zijn, maar verdient ook geen extra tekst op de pagina.
      console.info('[keten] stylist-route', {
        bron: r.bron,
        model: r.model,
        latency_ms: r.latency_ms,
        reden: r.reden,
        profile_hash: r.profile_hash,
        herkanstKandidaten: r.herkanstKandidaten,
        herkanstCache: r.herkanstCache,
      });
      return {
        data: r.engineOutfits as any as Outfit[],
        source: 'supabase',
        cached: r.bron === 'cache',
        errors: [],
        ketenBron: r.bron,
      };
    }
  }

  // Engine v2 path: use outfitService which reads moodboard data from localStorage
  if (answers) {
    const generated = await outfitService.generateOutfits(answers, limit ?? 9);
    return {
      data: generated as any as Outfit[],
      source: 'supabase',
      cached: false,
      errors: [],
      ketenBron: null,
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
    errors: response.errors ?? [],
    ketenBron: null,
  };
}

/**
 * Hook for fetching outfits with filtering options.
 * Uses React Query for persistent cross-navigation caching.
 */
export function useOutfits(options: UseOutfitsOptions = {}): UseOutfitsResult {
  const { enabled = true } = options;
  const stylistVlag = ketenStylistVlagAan();
  const queryKey = buildOutfitsQueryKey(options, stylistVlag);

  const query = useQuery({
    queryKey: queryKey as unknown as readonly unknown[],
    queryFn: () => haalOutfitsVoorQuery(options, stylistVlag),
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
    ketenBron: result?.ketenBron ?? null,
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
