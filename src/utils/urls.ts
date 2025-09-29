// src/utils/urls.ts
// Centrale URL-helpers, zodat canonicals/share/referral overal consistent zijn.

const RAW_HOST = (import.meta as any).env?.VITE_CANONICAL_HOST as string | undefined;

// Standaard naar productiehost, zonder trailing slash.
export const CANONICAL_HOST =
  (RAW_HOST && RAW_HOST.replace(/\/+$/, "")) || "https://fitfi.ai";

/** Zet een pad of URL om naar een absolute canonical URL op de CANONICAL_HOST. */
export function canonicalUrl(input?: string): string {
  if (!input) return CANONICAL_HOST + currentPathSafe();
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${CANONICAL_HOST}${path}`;
}

/** Huidige path (client only) met leading slash; fallback naar root. */
export function currentPathSafe(): string {
  if (typeof window === "undefined" || !window.location?.pathname) return "/";
  const p = window.location.pathname || "/";
  const q = window.location.search || "";
  return p.startsWith("/") ? `${p}${q}` : `/${p}${q}`;
}

/** Bouw een referral-URL met ?ref=<userId> en optionele extra query-params. */
export function buildReferralUrl(userId: string, extra?: Record<string, string>): string {
  const url = new URL(CANONICAL_HOST);
  url.searchParams.set("ref", userId);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v != null) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

/** Bouw een share-URL (optioneel met pad en query-params). */
export function buildShareUrl(path?: string, params?: Record<string, string>): string {
  const url = new URL(canonicalUrl(path));
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v != null) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export default {
  CANONICAL_HOST,
  canonicalUrl,
  currentPathSafe,
  buildReferralUrl,
  buildShareUrl,
};