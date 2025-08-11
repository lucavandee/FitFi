export type TelemetryProps = Record<string, unknown>;

export function track(event: string, props: TelemetryProps = {}) {
  try {
    // Google Analytics (indien aanwezig)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, props);
      return;
    }
  } catch {}
  // Fallback: console (geen throw)
  if (typeof console !== 'undefined') console.log('[telemetry]', event, props);
}