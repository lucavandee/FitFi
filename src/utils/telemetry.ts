type Payload = Record<string, unknown>;

const ENABLED =
  (import.meta.env.VITE_ENABLE_TELEMETRY ?? "1") === "1";

/**
 * Safe no-op tracker.
 * - Altijd een functie
 * - Valt stil als telemetry uit staat
 * - Geen runtime afhankelijkheden
 */
export default function track(event: string, payload: Payload = {}): void {
  try {
    if (!ENABLED) return;
    // Vervang dit blok later door je echte analytics sink (PostHog/GA/Supabase)
    // Voor nu: fire een CustomEvent die je eventueel in een listener kunt opvangen
    window.dispatchEvent(new CustomEvent("fitfi:track", { detail: { event, payload } }));
    // Eventueel: console.debug("track", event, payload);
  } catch {
    // nooit throwen in prod
  }
}