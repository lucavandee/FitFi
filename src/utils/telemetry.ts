export type TelemetryPayload = Record<string, unknown>;
export type TelemetrySink = (event: string, props?: TelemetryPayload) => void;

let sink: TelemetrySink | null = null;

export function setTelemetrySink(fn: TelemetrySink | null) {
  sink = fn;
}

/** Lichtgewicht tracker met veilige fallback (console.debug). */
export function track(event: string, props?: TelemetryPayload) {
  try {
    if (!event || typeof event !== "string") return;
    if (sink) {
      sink(event, props);
    } else if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug(`[telemetry] ${event}`, props || {});
    }
  } catch {
    /* no-op */
  }
}

export const telemetry = { track, setSink: setTelemetrySink };
export default track; // ondersteunt zowel default als named import