/**
 * @deprecated Use analytics.ts instead
 * This file is deprecated and will be removed in a future version.
 * Import { track } from '@/utils/analytics' instead.
 */

// Re-export from analytics.ts for backward compatibility
export { track, trackEvent, trackPageView, trackException, trackInteraction, trackConversion, trackTiming } from '@/utils/analytics';

/**
 * @deprecated Use track from analytics.ts instead
 */
export function trackLegacy(event: string, props: Record<string, unknown> = {}) {
  console.warn('[Telemetry] DEPRECATED: Use track from @/utils/analytics instead');
  
  // Import and use the new track function
  import('@/utils/analytics').then(({ track }) => {
    track(event, props);
  }).catch(() => {
    // Fallback: console (geen throw)
    if (typeof console !== 'undefined') console.log('[telemetry]', event, props);
  });
}

export type TelemetryProps = Record<string, unknown>;