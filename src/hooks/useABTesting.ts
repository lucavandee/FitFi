import { useState, useEffect } from 'react';
import { track } from '@/utils/analytics';

export interface ABVariants {
  heroCTA: 'start-gratis' | 'ai-style-report';
  pricingHighlight: 'enabled' | 'disabled';
}

export function useABTesting(): ABVariants {
  const [variants, setVariants] = useState<ABVariants>({
    heroCTA: 'start-gratis',
    pricingHighlight: 'enabled'
  });

  useEffect(() => {
    // Simple A/B split based on user session
    const userId = localStorage.getItem('fitfi.user.id') || 'anonymous';
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