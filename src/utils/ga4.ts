declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window === 'undefined') return;

  try {
    if (window.gtag) {
      window.gtag('event', eventName, params);
    } else if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...params
      });
    }

    console.log('[GA4]', eventName, params);
  } catch (error) {
    console.error('[GA4] Error tracking event:', error);
  }
};

export const events = {
  cta_click_hero_primary: (variant?: string) =>
    trackEvent('cta_click_hero_primary', { variant }),

  cta_click_hero_secondary: (variant?: string) =>
    trackEvent('cta_click_hero_secondary', { variant }),

  example_view: (outfitType: string) =>
    trackEvent('example_view', { outfit_type: outfitType }),

  example_view_all: () =>
    trackEvent('example_view_all'),

  howitworks_step_view: (step: number) =>
    trackEvent('howitworks_step_view', { step }),

  privacy_expand: () =>
    trackEvent('privacy_expand'),

  start_style_report: (source: string) =>
    trackEvent('start_style_report', { source }),

  complete_style_report: (duration: number) =>
    trackEvent('complete_style_report', { duration }),

  account_created: (method: string) =>
    trackEvent('account_created', { method }),

  cta_click_midpage: () =>
    trackEvent('cta_click_midpage'),

  faq_expand: (question: string) =>
    trackEvent('faq_expand', { question }),
};
