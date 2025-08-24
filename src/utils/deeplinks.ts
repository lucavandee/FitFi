// src/utils/deeplinks.ts
export type Partner = "amazon" | "awin" | "none";

export function getDefaultPartner(): Partner {
  const p = (import.meta.env.VITE_DEFAULT_SHOP_PARTNER || "").toLowerCase();
  if (p === "amazon") return "amazon";
  if (p === "awin") return "awin";
  return "none";
}

export function detectPartner(url: string): Partner | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host.includes("amazon.")) return "amazon";
    if (host.includes("zalando.") || host.includes("awin1.")) return "awin";
    return null;
  } catch {
    return null;
  }
}

// --- helpers ---------------------------------------------------------------

function applyAmazonTag(rawUrl: string): string {
  const tag = import.meta.env.VITE_AMAZON_TAG;
  if (!tag) return rawUrl;
  try {
    const u = new URL(rawUrl);
    if (!u.searchParams.get("tag")) u.searchParams.set("tag", tag);
    return u.toString();
  } catch {
    return rawUrl;
  }
}

function wrapWithAwin(rawUrl: string): string {
  const mid = import.meta.env.VITE_AWIN_MID;
  const aff = import.meta.env.VITE_AWIN_AFFID;
  if (!mid || !aff) return rawUrl;
  const enc = encodeURIComponent(rawUrl);
  return `https://www.awin1.com/cread.php?awinmid=${mid}&awinaffid=${aff}&ued=${enc}`;
}

function buildFromRaw(rawUrl: string): string {
  const p = detectPartner(rawUrl) ?? getDefaultPartner();
  if (p === "amazon") return applyAmazonTag(rawUrl);
  if (p === "awin") return wrapWithAwin(rawUrl);
  return rawUrl;
}

function buildFromQuery(partner: Partner, query: string): string {
  if (!query) return "";
  if (partner === "amazon") {
    const base = `https://www.amazon.nl/s?k=${encodeURIComponent(query)}`;
    return applyAmazonTag(base);
  }
  if (partner === "awin") {
    // Voor Zalando via AWIN; pas ‘dames’ aan als nodig voor unisex/mannen.
    const target = `https://www.zalando.nl/dames/?q=${encodeURIComponent(query)}`;
    return wrapWithAwin(target);
  }
  // Fallback (zonder affiliate)
  return `https://www.zalando.nl/dames/?q=${encodeURIComponent(query)}`;
}

// Overloads (één enkele implementatie)
export function buildDeeplink(rawUrl: string): string;
export function buildDeeplink(partner: Partner, query: string): string;
export function buildDeeplink(a: string | Partner, b?: string): string {
  // Case 1: buildDeeplink(rawUrl)
  if (typeof a === "string" && b === undefined) {
    return buildFromRaw(a);
  }
  // Case 2: buildDeeplink(partner, query)
  if (b !== undefined) {
    return buildFromQuery(a as Partner, b);
  }
  return "";
}

/** --- Backwards compat: oude naam aanhouden voor bestaande imports --- */
export function buildAffiliateUrl(rawUrl: string): string;
export function buildAffiliateUrl(partner: Partner, query: string): string;
export function buildAffiliateUrl(a: string | Partner, b?: string): string {
  // gewoon doorgeven aan je nieuwe implementatie
  return buildDeeplink(a as any, b as any);
}
