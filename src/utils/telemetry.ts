export type TelemetryPayload = Record<string, unknown>;
export type TelemetrySink = (event: string, props?: TelemetryPayload) => void;

let sink: TelemetrySink | null = null;

/**
 * Optioneel: stel een eigen telemetry-sink in (bv. PostHog/GA/Supabase).
 * Voorbeeld:
 *   setTelemetrySink((e, p) => posthog.capture(e, p));
 */
export function setTelemetrySink(fn: TelemetrySink | null) {
  sink = fn;
}

/**
 * Lightweight tracker:
 * - In prod: roept alleen de ingestelde sink aan (als aanwezig).
 * - In dev: logt ook naar console voor debugging.
 */
export function track(event: string, props?: TelemetryPayload): void {
  try {
    if (sink) sink(event, props);
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug(`[telemetry] ${event}`, props || {});
    }
  } catch {
    /* no-op */
  }
}

/** Convenience helpers (optioneel te gebruiken) */
export const telemetry = {
  track,
  setSink: setTelemetrySink,
};

// ✅ Zorgt dat zowel `import track from "@/utils/telemetry"`
// als `import { track } from "@/utils/telemetry"` werkt.
export default track;