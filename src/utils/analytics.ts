import { useMemo, useCallback } from 'react';

type Variant = 'control' | 'v1' | 'v2';

/**
 * Google Analytics utility functions for FitFi
 */

// Get the Google Analytics ID from environment variables
const GA_TRACKING_ID = import.meta.env.VITE_GTAG_ID;
const ANALYTICS_ENABLED = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

/**
 * Safe wrapper for gtag function
 */
const safeGtag = (...args: any[]): void => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function' && ANALYTICS_ENABLED) {
    try {
      window.gtag(...args);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[Analytics] gtag call failed:', error);
      }
    }
  }
};

/**
 * Safe page view tracking
 * @param page - Page path (e.g., '/dashboard')
 * @param title - Optional page title
 * @param additionalData - Additional tracking data
 */
export const trackPageView = (
  page: string,
  title?: string,
  additionalData?: Record<string, any>
): void => {
  try {
    safeGtag('config', GA_TRACKING_ID, {
      page_title: title || document.title,
      page_location: window.location.href,
      page_path: page,
      ...additionalData
    });
    
    if (import.meta.env.DEV) {
      console.log('[Analytics] Page view:', { page, title, additionalData });
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Page view tracking failed:', error);
    }
  }
};

/**
 * Safe exception tracking
 * @param error - Error object or message
 * @param fatal - Whether the error is fatal
 * @param additionalData - Additional context data
 */
export const trackException = (
  error: Error | string,
  fatal: boolean = false,
  additionalData?: Record<string, any>
): void => {
  try {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    safeGtag('event', 'exception', {
      description: errorMessage,
      fatal,
      error_stack: errorStack?.substring(0, 500), // Truncate for analytics
      ...additionalData
    });
    
    if (import.meta.env.DEV) {
      console.log('[Analytics] Exception tracked:', { error: errorMessage, fatal, additionalData });
    }
  } catch (trackingError) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Exception tracking failed:', trackingError);
    }
  }
};

/**
 * Safe interaction tracking
 * @param element - Element that was interacted with
 * @param action - Type of interaction (click, hover, focus, etc.)
 * @param additionalData - Additional context data
 */
export const trackInteraction = (
  element: string,
  action: string = 'click',
  additionalData?: Record<string, any>
): void => {
  try {
    safeGtag('event', 'interaction', {
      event_category: 'ui_interaction',
      event_label: element,
      interaction_type: action,
      ...additionalData
    });
    
    if (import.meta.env.DEV) {
      console.log('[Analytics] Interaction tracked:', { element, action, additionalData });
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Interaction tracking failed:', error);
    }
  }
};

/**
 * Safe conversion tracking
 * @param conversionType - Type of conversion (signup, purchase, quiz_complete, etc.)
 * @param value - Monetary value of conversion
 * @param currency - Currency code (default: EUR)
 * @param additionalData - Additional conversion data
 */
export const trackConversion = (
  conversionType: string,
  value?: number,
  currency: string = 'EUR',
  additionalData?: Record<string, any>
): void => {
  try {
    safeGtag('event', 'conversion', {
      event_category: 'conversion',
      event_label: conversionType,
      value,
      currency,
      conversion_type: conversionType,
      ...additionalData
    });
    
    if (import.meta.env.DEV) {
      console.log('[Analytics] Conversion tracked:', { conversionType, value, currency, additionalData });
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Conversion tracking failed:', error);
    }
  }
};

/**
 * Safe timing tracking
 * @param category - Timing category (e.g., 'quiz', 'onboarding')
 * @param variable - Timing variable (e.g., 'completion_time', 'load_time')
 * @param value - Time value in milliseconds
 * @param label - Optional label for additional context
 * @param additionalData - Additional timing data
 */
export const trackTiming = (
  category: string,
  variable: string,
  value: number,
  label?: string,
  additionalData?: Record<string, any>
): void => {
  try {
    safeGtag('event', 'timing_complete', {
      event_category: category,
      event_label: label,
      name: variable,
      value: Math.round(value),
      ...additionalData
    });
    
    if (import.meta.env.DEV) {
      console.log('[Analytics] Timing tracked:', { category, variable, value, label, additionalData });
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Timing tracking failed:', error);
    }
  }
};

/**
 * Record event with test data marking
 */
const recordEvent = (
  eventData: any,
  isTest: boolean = import.meta.env.DEV
): void => {
  // Mark test data
  const markedData = {
    ...eventData,
    is_test: isTest,
    environment: import.meta.env.VITE_ENVIRONMENT || 'development'
  };
  
  // Log in development
  if (import.meta.env.DEV) {
    console.log('[Analytics] Event recorded:', markedData);
  }
  
  // In production, this would save to Supabase with is_test flag
  // For now, just track in Google Analytics
  safeGtag('event', 'custom_event', {
    ...markedData,
    non_interaction: isTest
  });
};

/**
 * Initialize Google Analytics
 */
export const initializeAnalytics = (): void => {
  if (!GA_TRACKING_ID) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Google Analytics not configured');
    }
    return;
  }
  
  if (!ANALYTICS_ENABLED) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Google Analytics disabled');
    }
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(..._args: any[]) {
    (window.dataLayer = window.dataLayer || []).push(arguments);
  };

  safeGtag('js', new Date());
  safeGtag('config', GA_TRACKING_ID, {
    send_page_view: false // We'll handle page views manually
  });
  
  if (import.meta.env.DEV) {
    console.log('[Analytics] Google Analytics initialized');
  }
};

/**
 * Main tracking function - unified interface
 * @param eventName - Name of the event
 * @param eventData - Event data object
 */
export const trackEvent = (
  eventName: string,
  eventData?: Record<string, any>
): void => {
  try {
    const payload = {
      event_category: 'user_action',
      event_label: eventName,
      ...eventData
    };
    
    safeGtag('event', eventName, payload);
    recordEvent(payload);
    
    if (import.meta.env.DEV) {
      console.log('[Analytics] Event tracked:', eventName, payload);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Event tracking failed:', error);
    }
  }
};

/**
 * Alias for backward compatibility with telemetry.ts
 * @deprecated Use trackEvent instead
 */
export const track = trackEvent;

/**
 * Legacy trackEvent function for backward compatibility
 * @deprecated Use the new trackEvent function instead
 */
export const trackEventLegacy = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  additionalData?: Record<string, any>
): void => {
  trackEvent(action, {
    event_category: category,
    event_label: label,
    value,
    ...additionalData
  });
};

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
      } catch {
        /* no-op */
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
    } catch {
      /* no-op */
    }
  }, [testName, userId, variant]);

  return { variant, trackClick, markExposure };
}