import { hasConsent } from "@/utils/cmp";

type EventPayload = Record<string, unknown>;

export default async function track(event: string, payload?: EventPayload) {
  const ok = await hasConsent("analytics");
  if (!ok) return; // geen tracking zonder consent
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info("[analytics:track]", event, payload || {});
  }
  // hier kun je sendBeacon/POST implementeren; nu alleen console in DEV
}

export function w(event: string, payload?: EventPayload) {
  // alias zoals in je guardrails benoemd
  return track(event, payload);
}