import { useState, useEffect } from 'react';
import { track } from '@/utils/analytics';

export interface ABVariants {
  heroCTA: 'start-gratis' | 'ai-style-report';
  pricingHighlight: 'enabled' | 'disabled';
}

const ANON_ID_KEY = 'fitfi.anon.id';

function leesOpslag(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    // Private mode gooit bij elke localStorage-toegang.
    return null;
  }
}

function schrijfOpslag(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function nieuwId(): string {
  try {
    if (typeof crypto !== 'undefined') {
      if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
      if (typeof crypto.getRandomValues === 'function') {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      }
    }
  } catch {}
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

/*
 * Hier stond `localStorage.getItem('fitfi.user.id') || 'anonymous'`. Elke
 * uitgelogde bezoeker kreeg daardoor dezelfde string, dus dezelfde hash, dus
 * dezelfde variant: het A/B-mechanisme verdeelde niets. Zonder ingelogd id
 * krijgt de bezoeker nu een eigen willekeurig id dat bewaard blijft, zodat zijn
 * variant over sessies heen gelijk blijft. Lukt opslaan niet (private mode),
 * dan valt het terug op een id per paginabezoek: dan verdeel je wel, maar niet
 * stabiel per bezoeker.
 */
function bezoekerId(): string {
  const userId = leesOpslag('fitfi.user.id');
  if (userId) return userId;

  const bestaand = leesOpslag(ANON_ID_KEY);
  if (bestaand) return bestaand;

  const nieuw = nieuwId();
  schrijfOpslag(ANON_ID_KEY, nieuw);
  return nieuw;
}

export function useABTesting(): ABVariants {
  const [variants, setVariants] = useState<ABVariants>({
    heroCTA: 'start-gratis',
    pricingHighlight: 'enabled'
  });

  useEffect(() => {
    // Simple A/B split based on user session
    const userId = bezoekerId();
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    const heroCTA = Math.abs(hash) % 2 === 0 ? 'start-gratis' : 'ai-style-report';
    const pricingHighlight = Math.abs(hash) % 3 === 0 ? 'disabled' : 'enabled';

    setVariants({ heroCTA, pricingHighlight });

    // Track A/B assignment
    track('ab:assigned', {
      heroCTA,
      pricingHighlight,
      userId: userId.substring(0, 8) // Privacy-safe partial ID
    });
  }, []);

  return variants;
}

// Analytics event helpers
export const trackNavCTA = () => track('nav:cta-click');
export const trackHeroCTA = (variant: string) => track('hero:cta-click', { variant });
export const trackStickyCTA = () => track('sticky-cta:click');
export const trackPricingPopular = () => track('pricing:popular-select');
export const trackFAQOpen = (question: string) => track('faq:open', { question });
export const trackOutfitExplain = (outfitId?: string) => track('outfit:explain-view', { outfitId });
