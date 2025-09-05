type EventMap = Record<string, unknown>;
export default function track(event: string, payload?: EventMap) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info("[analytics:track]", event, payload || {});
  }
}
export function w(event: string, payload?: EventMap) { track(event, payload); }