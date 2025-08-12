import { useMemo, useCallback } from 'react';
import { track } from '@/utils/analytics';

type Variant = 'control' | 'v1' | 'v2';

/** Superlichte, dependency-loze hash (djb2-variant) */
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

export function useABVariant(testName: string, userId?: string | null) {
  const variant = useMemo<Variant>(() => {
    const seed = `${testName}:${userId ?? 'guest'}`;
    return pickVariant(seed);
  }, [testName, userId]);

  /** Veilig tracken: gebruikt gtag als die bestaat, anders console.debug */
  const trackClick = useCallback(
    (label: string, extra?: Record<string, any>) => {
      try {
        const payload = {
          label,
          test_name: testName,
          variant,
          user_id: userId ?? 'guest',
          ...extra,
        };
        // voorkom crashes zonder gtag
        // @ts-ignore
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          // @ts-ignore
          window.gtag('event', 'cta_click', payload);
        } else {
          // eslint-disable-next-line no-console
          console.debug('[ab/cta_click]', payload);
        }
        
        // Track dashboard load
        track('analytics_dashboard_loaded', {
          event_category: 'admin',
          event_label: 'dashboard_view'
        });
      } catch {
        track('analytics_dashboard_error', {
          event_category: 'error',
          event_label: 'dashboard_load_failed'
        });
      }
    },
    [testName, userId, variant]
  );

  /** Exposure is bewust no-op in safe mode (later optioneel via API/Supabase) */
  const markExposure = useCallback(() => {
    try {
      const payload = { test_name: testName, variant, user_id: userId ?? 'guest' };
      // @ts-ignore
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        // @ts-ignore
        window.gtag('event', 'ab_exposure', payload);
      } else {
        // eslint-disable-next-line no-console
        console.debug('[ab/exposure]', payload);
      }
      track('analytics_dashboard_refresh', {
        event_category: 'admin',
        event_label: 'manual_refresh'
      });
    } catch {
      /* no-op */
    }
  }, [testName, userId, variant]);

  return { variant, trackClick, markExposure };
}