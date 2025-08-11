/**
 * Google Analytics utility functions for FitFi
 */

// Get the Google Analytics ID from environment variables
const GA_TRACKING_ID = import.meta.env.VITE_GTAG_ID;
const ANALYTICS_ENABLED = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

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
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'custom_event', {
      ...markedData,
      non_interaction: isTest
    });
  }
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
  
  (window.gtag ?? ((..._args: any[]) => {}))('js', new Date() as any);
  window.gtag('config', GA_TRACKING_ID, {
    page_title: 'FitFi - AI Style Recommendations',
    send_page_view: true,
    custom_map: {
      'custom_parameter_1': 'user_style_preference'
    }
  });

  if (import.meta.env.DEV) {
    console.log('[Analytics] Google Analytics initialized with ID:', GA_TRACKING_ID);
  }
};

/**
 * Track custom events
 */
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  custom_parameters?: Record<string, any>
): void => {
  if (typeof window === 'undefined' || !window.gtag || !ANALYTICS_ENABLED) return;

  // Record with test marking
  recordEvent({
    action,
    category,
    label,
    value,
    ...custom_parameters
  });

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    is_test: import.meta.env.DEV,
    ...custom_parameters
  });
};