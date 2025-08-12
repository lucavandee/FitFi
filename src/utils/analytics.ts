import { useMemo, useCallback } from 'react';

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

type Params = Record<string, any>;

function gtagExists(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).gtag === 'function';
}

export function pageview(path: string, params: Params = {}) {
  try { if (gtagExists()) (window as any).gtag('event', 'page_view', { page_path: path, ...params }); } catch {}
}

export function event(name: string, params: Params = {}) {
  try {
    if (gtagExists()) (window as any).gtag('event', name, params);
    else if (typeof console !== 'undefined') console.debug('[analytics:event]', name, params);
  } catch {}
}

export function exception(description: string, fatal = false) {
  try { if (gtagExists()) (window as any).gtag('event', 'exception', { description, fatal }); } catch {}
}

export const track = trackEvent;

/* ▼ Nieuw: default export voor legacy imports */
const analytics = { pageview, event, exception, track };
export default analytics;