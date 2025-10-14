// resilient, guest-friendly engagement store
type EngagementStore = {
  saved: Record<string, true>;
  disliked: Record<string, true>;
  similarClicks: Record<string, number>;
};

const KEY = 'fitfi.engagement.v1';

function read(): EngagementStore {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { saved: {}, disliked: {}, similarClicks: {} };
    const parsed = JSON.parse(raw);
    return {
      saved: parsed?.saved ?? {},
      disliked: parsed?.disliked ?? {},
      similarClicks: parsed?.similarClicks ?? {}
    };
  } catch {
    return { saved: {}, disliked: {}, similarClicks: {} };
  }
}

function write(store: EngagementStore) {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {}
}

export function isSaved(id: string): boolean {
  return !!read().saved[id];
}

export function isDisliked(id: string): boolean {
  return !!read().disliked[id];
}

export function toggleSave(id: string): boolean {
  const s = read();
  if (s.saved[id]) delete s.saved[id];
  else s.saved[id] = true;
  write(s);
  return !!s.saved[id];
}

export function dislike(id: string): void {
  const s = read();
  s.disliked[id] = true;
  write(s);
}

export function undoDislike(id: string): void {
  const s = read();
  delete s.disliked[id];
  write(s);
}

// Simple similarity on tags/archetype
export function getSimilarOutfits(all: any[], base: any, count = 3) {
  if (!all?.length || !base) return [];
  const baseTags: string[] = base.tags || [];
  const baseArch = base.archetype || '';
  const score = (o: any) => {
    const t = new Set([...(o.tags||[])]);
    const inter = baseTags.filter(x => t.has(x)).length;
    const arch = o.archetype === baseArch ? 2 : 0;
    return inter + arch;
  };
  return all
    .filter(o => o.id !== base.id)
    .map(o => ({o, s: score(o)}))
    .sort((a,b)=>b.s-a.s)
    .slice(0, count)
    .map(x=>x.o);
}

/**
 * Safe, tree-shakeable engagement utilities.
 * Works without crashing if no analytics providers are present.
 */
type KV = Record<string, any>;

function safeCall(fn?: (...a: any[]) => any, ...args: any[]) {
  try { return fn?.(...args); } catch { /* noop */ }
}

export function trackProductClick(data: KV) {
  // gtag (GA4)
  safeCall((window as any)?.gtag, 'event', 'product_click', data);
  // plausible
  safeCall((window as any)?.plausible, 'Product Click', { props: data });
  // datalayer
  ((window as any).dataLayer = (window as any).dataLayer || []).push({
    event: 'product_click',
    ...data,
  });
}

export function trackShopCta(data: KV) {
  safeCall((window as any)?.gtag, 'event', 'shop_cta', data);
  safeCall((window as any)?.plausible, 'Shop CTA', { props: data });
  ((window as any).dataLayer = (window as any).dataLayer || []).push({
    event: 'shop_cta',
    ...data,
  });
}

export function trackImpression(data: KV) {
  safeCall((window as any)?.gtag, 'event', 'product_impression', data);
  safeCall((window as any)?.plausible, 'Product Impression', { props: data });
  ((window as any).dataLayer = (window as any).dataLayer || []).push({
    event: 'product_impression',
    ...data,
  });
}

export type { KV as EngagementPayload };