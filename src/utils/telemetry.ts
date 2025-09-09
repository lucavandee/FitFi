type EventName =
  | "nova:open"
  | "nova:patch"
  | "nova:done"
  | "nova:error"
  | "cta:primary"
  | "cta:secondary"
  | "prefill"
  | "set-context";

export type TelemetryPayload = Record<string, unknown>;

export function track(event: EventName, payload: TelemetryPayload = {}) {
  try {
    // Respecteer CMP: alleen tracken als consent OK is
    if (typeof window !== "undefined" && (window as any).__cmpAllowed === false) return;

    // Vervang door je analytics provider of dataLayer push
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({ event, ...payload, ts: Date.now() });
  } catch {
    // swallow
  }
}