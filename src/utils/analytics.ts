/**
 * Google Analytics utility functions for FitFi
 */

// Get the Google Analytics ID from environment variables
const GA_TRACKING_ID = import.meta.env.VITE_GTAG_ID;
const ANALYTICS_ENABLED = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

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
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
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
export const trackPageView = (page_path: string, page_title?: string): void => {
  if (!window.gtag || !ANALYTICS_ENABLED) return;

  window.gtag('config', GA_TRACKING_ID, {
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
  if (!window.gtag || !ANALYTICS_ENABLED) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...custom_parameters
  });
};

/**
 * Track quiz completion
 */
export const trackQuizComplete = (
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
export const trackOutfitView = (
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
export const trackProductClick = (
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
export const trackUserRegistration = (method: string): void => {
  trackEvent('sign_up', 'user', method, undefined, {
    method
  });
};

/**
 * Track conversion events
 */
export const trackConversion = (
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
export const trackFunnelStep = (
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
export const trackHeatmapInteraction = (
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
export const trackPredictiveInsight = (
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

export default {
  initializeAnalytics,
  trackPageView,
  trackEvent,
  trackQuizComplete,
  trackOutfitView,
  trackProductClick,
  trackUserRegistration,
  trackConversion,
  trackFunnelStep,
  trackHeatmapInteraction,
  trackPredictiveInsight
};