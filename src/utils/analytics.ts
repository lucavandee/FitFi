import { getCookiePrefs } from "@/utils/consent";

type Payload = Record<string, unknown>;

function canTrack() {
  try {
    const id = import.meta.env.VITE_GTAG_ID as string | undefined;
    return !!id && getCookiePrefs().analytics && typeof window !== "undefined" && typeof window.gtag === "function";
  } catch {
    return false;
  }
}

export function track(event: string, payload: Payload = {}) {
  try {
    if (!canTrack()) return;
    window.gtag!("event", event, payload);
  } catch {}
}

export function pageview(path: string) {
  try {
    if (!canTrack()) return;
    window.gtag!("event", "page_view", { page_path: path });
  } catch {}
}