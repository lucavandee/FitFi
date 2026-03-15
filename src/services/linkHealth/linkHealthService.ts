import { supabase } from "@/lib/supabaseClient";

export type LinkStatus = "active" | "broken" | "unavailable";

interface ProductLinkHealth {
  id: string;
  link_status: LinkStatus;
  link_last_checked_at: string | null;
}

const CACHE_KEY = "ff_link_health";
const CACHE_TTL_MS = 30 * 60 * 1000;

interface LinkHealthCache {
  brokenIds: string[];
  updatedAt: number;
}

function getCache(): LinkHealthCache | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: LinkHealthCache = JSON.parse(raw);
    if (Date.now() - parsed.updatedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setCache(brokenIds: string[]) {
  try {
    const data: LinkHealthCache = { brokenIds, updatedAt: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    /* quota exceeded — ignore */
  }
}

let _brokenIds: Set<string> | null = null;
let _fetchPromise: Promise<void> | null = null;

async function loadBrokenLinks(): Promise<void> {
  const cached = getCache();
  if (cached) {
    _brokenIds = new Set(cached.brokenIds);
    return;
  }

  const client = supabase();
  if (!client) {
    _brokenIds = new Set();
    return;
  }

  try {
    const { data, error } = await client
      .from("products")
      .select("id")
      .eq("is_kids", false)
      .in("link_status", ["broken", "unavailable"]);

    if (error) {
      _brokenIds = new Set();
      return;
    }

    const ids = (data || []).map((row: { id: string }) => row.id);
    _brokenIds = new Set(ids);
    setCache(ids);
  } catch {
    _brokenIds = new Set();
  }
}

export async function initLinkHealth(): Promise<void> {
  if (_brokenIds !== null) return;
  if (!_fetchPromise) {
    _fetchPromise = loadBrokenLinks().finally(() => {
      _fetchPromise = null;
    });
  }
  return _fetchPromise;
}

export function isProductLinkBroken(productId: string): boolean {
  if (!_brokenIds) return false;
  return _brokenIds.has(productId);
}

export function filterHealthyProducts<T extends { id: string }>(products: T[]): T[] {
  if (!_brokenIds || _brokenIds.size === 0) return products;
  return products.filter((p) => !_brokenIds!.has(p.id));
}

export function getProductLinkStatus(productId: string): LinkStatus {
  if (!_brokenIds) return "active";
  return _brokenIds.has(productId) ? "broken" : "active";
}

export function invalidateCache(): void {
  _brokenIds = null;
  sessionStorage.removeItem(CACHE_KEY);
}
