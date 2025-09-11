// src/utils/telemetry.ts
export function track(event: string, props?: Record<string, unknown>) {
  try {
    // Vervang dit later door je analytics (PostHog, GA4, Segment, Supabase)
    // We respecteren CMP upstream; hier loggen we alleen in console.
    // eslint-disable-next-line no-console
    console.debug(`[telemetry] ${event}`, props || {});
  } catch {}
}