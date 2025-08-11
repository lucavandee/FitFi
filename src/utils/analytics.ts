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
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer?.push(args);
  };
  
  window.gtag('js', new Date() as any);
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
 * Track page views
 */
const trackPageView = (page_path: string, page_title?: string): void => {
  if (typeof window === 'undefined' || !window.gtag || !ANALYTICS_ENABLED) return;

  window.gtag('config', GA_TRACKING_ID as string, {
    page_path,
    page_title: page_title || document.title
  });
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

/**
 * Track quiz completion
 */
const trackQuizComplete = (
  duration: number,
  archetype: string,
  gender: string
): void => {
  trackEvent('quiz_complete', 'engagement', 'style_quiz', duration, {
    archetype,
    gender,
    quiz_duration: duration
  });
};

/**
 * Track outfit view
 */
const trackOutfitView = (
  outfit_id: string,
  archetype: string,
  match_percentage: number
): void => {
  trackEvent('outfit_view', 'engagement', outfit_id, match_percentage, {
    archetype,
    match_percentage
  });
};

/**
 * Track product click
 */
const trackProductClick = (
  product_id: string,
  product_name: string,
  price: number,
  retailer: string
): void => {
  trackEvent('product_click', 'ecommerce', product_id, price, {
    item_id: product_id,
    item_name: product_name,
    price,
    currency: 'EUR',
    retailer
  });
};

/**
 * Track user registration
 */
const trackUserRegistration = (method: string): void => {
  trackEvent('sign_up', 'user', method, undefined, {
    method
  });
};

/**
 * Track conversion events
 */
const trackConversion = (
  conversion_type: 'premium_upgrade' | 'quiz_complete' | 'outfit_save',
  value?: number
): void => {
  trackEvent('conversion', 'business', conversion_type, value, {
    conversion_type
  });
};

/**
 * Track funnel step completion
 */
const trackFunnelStep = (
  funnelType: string,
  stepId: string,
  stepOrder: number,
  metadata: Record<string, any> = {}
): void => {
  trackEvent('funnel_step', 'funnel', `${funnelType}_${stepId}`, stepOrder, {
    funnel_type: funnelType,
    step_id: stepId,
    step_order: stepOrder,
    ...metadata
  });
};

/**
 * Track heatmap interaction
 */
const trackHeatmapInteraction = (
  interactionType: 'click' | 'hover' | 'scroll',
  element: string,
  coordinates?: { x: number; y: number },
  metadata: Record<string, any> = {}
): void => {
  trackEvent('heatmap_interaction', 'ux', `${interactionType}_${element}`, 1, {
    interaction_type: interactionType,
    element,
    coordinates,
    ...metadata
  });
};

/**
 * Track predictive model insights
 */
const trackPredictiveInsight = (
  insightType: string,
  confidence: number,
  action: string,
  metadata: Record<string, any> = {}
): void => {
  trackEvent('predictive_insight', 'ai', insightType, Math.round(confidence * 100), {
    insight_type: insightType,
    confidence,
    recommended_action: action,
    ...metadata
  });
};

