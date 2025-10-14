import type { BoltProduct, Outfit, FitFiUserProfile, Tribe, DataResponse } from "./types";

const NOW = () => new Date().toISOString();

// Ultra-kleine, valide fallbacks (geen externe JSON)
const FALLBACK_PRODUCTS: BoltProduct[] = [
  { id: "p-1", title: "Witte Sneaker", brand: "Common Projects", price: 299, imageUrl: "/images/fallbacks/footwear.jpg", retailer: "Generic", url: "#" },
  { id: "p-2", title: "Licht Overshirt", brand: "ARKET", price: 89, imageUrl: "/images/fallbacks/top.jpg", retailer: "Generic", url: "#" },
  { id: "p-3", title: "Slim Jeans", brand: "Levi's", price: 119, imageUrl: "/images/fallbacks/bottom.jpg", retailer: "Generic", url: "#" },
  { id: "p-4", title: "Wol Blend Coat", brand: "COS", price: 190, imageUrl: "/images/fallbacks/default.jpg", retailer: "Generic", url: "#" },
];

const FALLBACK_OUTFITS: Outfit[] = [
  { id: "o-1", title: "Smart Casual — Minimal", products: FALLBACK_PRODUCTS.slice(0,3) },
  { id: "o-2", title: "Urban Clean", products: FALLBACK_PRODUCTS.slice(1,4) },
];

const FALLBACK_TRIBES: Tribe[] = [
  { id: "t-1", name: "Minimalists", slug: "minimalists", description: "Clean, tijdloos en functioneel.", member_count: 128, is_member: true, user_role: "owner" },
  { id: "t-2", name: "Street Luxe", slug: "street-luxe", description: "Casual met een luxe rand.", member_count: 342, is_member: false, user_role: "member" },
];

const FALLBACK_USER: FitFiUserProfile = { id: "u-1", name: "Guest", email: "guest@fitfi.ai", gender: "female" };

function wrap<T>(data: T, source: "local" | "fallback", cached = false): DataResponse<T> {
  return { data, source, cached };
}

export async function fetchProducts(_opts?: {
  gender?: 'male' | 'female' | 'unisex';
  category?: string;
  limit?: number;
}): Promise<DataResponse<BoltProduct[]>> {
  // In deze sweep: altijd fallback gebruiken — JSON in dist bevat ellipses
  const data = [...FALLBACK_PRODUCTS];
  return wrap(_opts?.limit ? data.slice(0, _opts.limit) : data, "fallback");
}

export async function fetchOutfits(_opts?: {
  gender?: 'male' | 'female' | 'unisex';
  limit?: number;
}): Promise<DataResponse<Outfit[]>> {
  const data = [...FALLBACK_OUTFITS];
  return wrap(_opts?.limit ? data.slice(0, _opts.limit) : data, "fallback");
}

export async function fetchTribes(): Promise<DataResponse<Tribe[]>> {
  return wrap([...FALLBACK_TRIBES], "fallback");
}

export async function fetchTribeBySlug(slug: string): Promise<DataResponse<Tribe | null>> {
  const t = FALLBACK_TRIBES.find(x => x.slug === slug) || null;
  return wrap(t, "fallback");
}

export async function fetchUser(): Promise<DataResponse<FitFiUserProfile>> {
  return wrap({ ...FALLBACK_USER, id: FALLBACK_USER.id + "-" + NOW() }, "fallback");
}