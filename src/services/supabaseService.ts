import { useMemo, useCallback } from 'react';

interface ABTestingOptions {
  testName: string;
  variants: Array<{ name: string; weight: number }>;
}

export function useABTesting(options: ABTestingOptions) {
  const variant = useABVariant(options.testName);
  
  const trackConversion = (data?: any) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'ab_conversion', {
        test_name: options.testName,
        variant,
        ...data
      });
    }
  };
  
  return { variant, trackConversion };
}

import { getSupabase } from '@/lib/supabase';

// Basic shape; pas desgewenst aan aan je bestaande types
export type QuizAnswer = any;

/**
 * Haal één quiz-antwoord op voor een user+step.
 * - Supabase: selecteert uit 'quiz_answers' met velden user_id, step_id, answer, updated_at
 * - Fallback: leest localStorage key `quiz:${userId}:${stepId}`
 */
export async function getQuizAnswer(userId: string, stepId: string): Promise<QuizAnswer | null> {
  try {
    const sb = getSupabase();
    if (!sb) {
      // Fallback (client only)
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem(`quiz:${userId}:${stepId}`);
        return raw ? JSON.parse(raw) : null;
      }
      return null;
    }

    const { data, error } = await sb
      .from('quiz_answers')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', stepId)
      .maybeSingle();

    if (error) {
      // Log zacht en val terug op null
      console.debug('[quiz:getQuizAnswer] supabase error', error);
      return null;
    }
    return data ?? null;
  } catch (e) {
    console.debug('[quiz:getQuizAnswer] exception', e);
    return null;
  }
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