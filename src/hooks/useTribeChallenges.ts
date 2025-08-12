import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTribeChallenges, createTribeChallenge, getChallengeSubmissions, createChallengeSubmission, getTribeRanking } from '../services/data/tribeChallengesService';
import type { TribeChallenge, TribeChallengeSubmission, TribeRanking } from '../services/data/types';

export function useTribeChallenges(tribeId?: string) {
  return useQuery({
    queryKey: ['tribeChallenges', tribeId],
    queryFn: () => fetchTribeChallenges(tribeId),
    enabled: !!tribeId
  });
}

export function useChallengeSubmissions(challengeId: string) {
  return useQuery({
    queryKey: ['challengeSubmissions', challengeId],
    queryFn: () => getChallengeSubmissions(challengeId),
    enabled: !!challengeId
  });
}

export function useCreateChallengeSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createChallengeSubmission,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['challengeSubmissions', data.challengeId] });
    }
  });
}

export function useCreateTribeChallenge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTribeChallenge,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tribeChallenges', data.tribeId] });
    }
  });
}

export function useTribeRanking() {
  return useQuery({
    queryKey: ['tribeRanking'],
    queryFn: getTribeRanking
  });
}

export type Variant = 'control' | 'v1' | 'v2';

/** Dependency-loze hash (djb2-variant), deterministisch en snel */
function djb2Hash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  return hash >>> 0; // forceer positief
}

function pickVariant(seed: string): Variant {
  const n = djb2Hash(seed) % 3;
  return n === 0 ? 'control' : n === 1 ? 'v1' : 'v2';
}

/**
 * Pure client-side A/B:
 * - Geen DB calls.
 * - Deterministisch per (testName,userId).
 * - trackClick/markExposure sturen naar gtag als beschikbaar; anders console.debug (no-crash).
 */
export function useABVariant(testName: string, userId?: string | null) {
  const variant = useMemo<Variant>(() => {
    const seed = `${testName}:${userId ?? 'guest'}`;
    return pickVariant(seed);
  }, [testName, userId]);

  const trackClick = useCallback(
    (label: string, extra?: Record<string, any>) => {
      const payload = { label, test_name: testName, variant, user_id: userId ?? 'guest', ...extra };
      // @ts-ignore
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        // @ts-ignore
        window.gtag('event', 'cta_click', payload);
      } else {
        // eslint-disable-next-line no-console
        console.debug('[ab/cta_click]', payload);
      }
    },
    [testName, userId, variant]
  );

  const markExposure = useCallback(() => {
    const payload = { test_name: testName, variant, user_id: userId ?? 'guest' };
    // @ts-ignore
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      // @ts-ignore
      window.gtag('event', 'ab_exposure', payload);
    } else {
      // eslint-disable-next-line no-console
      console.debug('[ab/exposure]', payload);
    }
  }, [testName, userId, variant]);

  return { variant, trackClick, markExposure };
}