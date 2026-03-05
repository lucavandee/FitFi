import { supabase } from "@/lib/supabaseClient";
import type { BoltProduct, Outfit, FitFiUserProfile, Tribe, DataResponse } from "./types";
import { composeOutfits } from "@/engine/outfitComposer";
import { isAdultClothingProduct } from "@/engine/productFilter";

const NOW = () => new Date().toISOString();

const FALLBACK_PRODUCTS: BoltProduct[] = [
  { id: "p-1", title: "Witte Sneaker", name: "Witte Sneaker", brand: "Common Projects", price: 299, imageUrl: "/images/fallbacks/footwear.jpg", retailer: "Generic", url: "#", category: "footwear" },
  { id: "p-2", title: "Licht Overshirt", name: "Licht Overshirt", brand: "ARKET", price: 89, imageUrl: "/images/fallbacks/top.jpg", retailer: "Generic", url: "#", category: "top" },
  { id: "p-3", title: "Slim Jeans", name: "Slim Jeans", brand: "Levi's", price: 119, imageUrl: "/images/fallbacks/bottom.jpg", retailer: "Generic", url: "#", category: "bottom" },
  { id: "p-4", title: "Wol Blend Coat", name: "Wol Blend Coat", brand: "COS", price: 190, imageUrl: "/images/fallbacks/default.jpg", retailer: "Generic", url: "#", category: "outerwear" },
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

function wrap<T>(data: T, source: "supabase" | "local" | "fallback", cached = false): DataResponse<T> {
  return { data, source, cached };
}

export async function fetchProducts(_opts?: {
  gender?: 'male' | 'female' | 'unisex';
  category?: string;
  limit?: number;
  budgetMax?: number;
}): Promise<DataResponse<BoltProduct[]>> {
  const client = supabase();
  if (!client) {
    return wrap([...FALLBACK_PRODUCTS], "fallback");
  }

  try {
    let query = client
      .from('products')
      .select('*')
      .eq('in_stock', true);

    if (_opts?.gender && _opts.gender !== 'unisex') {
      query = query.or(`gender.eq.${_opts.gender},gender.eq.unisex`);
    }

    if (_opts?.budgetMax && _opts.budgetMax > 0) {
      query = query.lte('price', _opts.budgetMax);
    }

    if (_opts?.category) {
      query = query.eq('category', _opts.category);
    }

    if (_opts?.limit) {
      query = query.limit(_opts.limit);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return wrap([...FALLBACK_PRODUCTS], "fallback");
    }

    const clothingOnly = data.filter(isAdultClothingProduct);

    const products: BoltProduct[] = clothingOnly.map(p => ({
      id: p.id,
      title: p.name || p.title,
      name: p.name || p.title,
      brand: p.brand,
      price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
      imageUrl: p.image_url,
      image: p.image_url,
      url: p.product_url || p.affiliate_url || '#',
      retailer: p.retailer,
      category: p.category,
      description: p.description,
      tags: p.tags || [],
      gender: p.gender,
      colors: p.colors || [],
      sizes: p.sizes || [],
    }));

    return wrap(products.length > 0 ? products : [...FALLBACK_PRODUCTS], products.length > 0 ? "supabase" : "fallback");
  } catch (error) {
    return wrap([...FALLBACK_PRODUCTS], "fallback");
  }
}

export async function fetchOutfits(_opts?: {
  gender?: 'male' | 'female' | 'unisex';
  archetype?: string;
  secondaryArchetype?: string;
  mixFactor?: number;
  season?: string;
  limit?: number;
  fit?: string;
  prints?: string;
  goals?: string[];
  materials?: string[];
  colorProfile?: any;
  occasions?: string[];
  budget?: { min: number; max: number };
}): Promise<DataResponse<Outfit[]>> {
  try {
    const client = supabase();
    if (!client) {
      return wrap([...FALLBACK_OUTFITS], "fallback");
    }

    const archetype = _opts?.archetype || "SMART_CASUAL";
    const limit = _opts?.limit || 9;

    const categories = ['top', 'bottom', 'footwear', 'outerwear', 'accessory', 'dress'];
    const perCategory = 80;
    let allRows: Record<string, any>[] = [];

    for (const cat of categories) {
      let query = client
        .from("products")
        .select("*")
        .eq("in_stock", true)
        .eq("category", cat);

      if (_opts?.gender && _opts.gender !== "unisex") {
        query = query.or(`gender.eq.${_opts.gender},gender.eq.unisex`);
      }

      if (_opts?.budget && _opts.budget.max > 0) {
        query = query.gte("price", _opts.budget.min).lte("price", _opts.budget.max);
      }

      query = query.limit(perCategory);
      const { data } = await query;
      if (data) allRows.push(...data);
    }

    if (allRows.length < 10) {
      const { data } = await client
        .from("products")
        .select("*")
        .eq("in_stock", true)
        .limit(400);
      if (data && data.length >= 10) allRows = data;
    }

    if (allRows.length < 10) {
      return wrap([...FALLBACK_OUTFITS], "fallback");
    }

    const composed = composeOutfits(allRows, archetype, limit, _opts?.gender);

    if (composed.length > 0) {
      const outfits: Outfit[] = composed.map(c => ({
        id: c.id,
        title: c.title,
        image: c.image,
        products: c.products.map(p => ({
          id: p.id,
          title: p.name,
          name: p.name,
          brand: p.brand,
          price: p.price,
          imageUrl: p.imageUrl,
          image: p.imageUrl,
          url: p.url,
          retailer: p.retailer,
          category: p.category,
          tags: p.tags,
          colors: p.colors,
        })),
        match: c.matchScore,
        tags: [c.occasion.toLowerCase()],
        season: undefined,
      }));
      return wrap(outfits, "supabase");
    }

    return wrap([...FALLBACK_OUTFITS], "fallback");
  } catch (err) {
    console.error('[fetchOutfits] Error:', err);
    return wrap([...FALLBACK_OUTFITS], "fallback");
  }
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
