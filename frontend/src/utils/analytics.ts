/**
 * Analytics utilities for FitFi
 * Lightweight wrapper with pageview tracking
 */

// Simple analytics event function
export function w(eventName: string, properties?: Record<string, any>) {
  try {
    // Console log for development
    if (import.meta.env.DEV) {
      console.log(`📊 Analytics: ${eventName}`, properties);
    }
    
    // Add your analytics provider here (GA4, Mixpanel, etc.)
    // Example: gtag('event', eventName, properties);
    
  } catch (error) {
    console.warn('Analytics error:', error);
  }
}

// Track page views
export function trackPageView(path: string) {
  w('page_view', {
    page_path: path,
    page_title: document.title,
    timestamp: Date.now()
  });
}

// Auto-track initial page view
if (typeof window !== 'undefined') {
  trackPageView(window.location.pathname);
}

export default { w, trackPageView };