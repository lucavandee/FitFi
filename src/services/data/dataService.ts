import { supabase } from "@/lib/supabaseClient";
import type { BoltProduct, Outfit, FitFiUserProfile, Tribe, DataResponse } from "./types";
import { composeOutfits, type UserPreferences } from "@/engine/outfitComposer";
import { isAdultClothingProduct } from "@/engine/productFilter";

const NOW = () => new Date().toISOString();

const outfitCache = new Map<string, { data: Outfit[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Bewust leeg sinds 2026-08-07.
 *
 * Hier stonden vier verzonnen producten en twee verzonnen outfits: een "Witte
 * Sneaker" van Common Projects voor 299 euro, een overshirt van ARKET, Levi's
 * jeans, een COS-jas. Echte merknamen, verzonnen prijzen, stockfoto's uit
 * public/images/fallbacks/ en `url: "#"`. Het dashboard toonde die bij elke
 * storing als "Jouw outfits, op maat voor Smart Casual", met een klik naar een
 * link die nergens heen ging.
 *
 * Dat is dezelfde misleiding als de seed-outfits die op 2026-08-06 van
 * /results zijn gehaald: een gevulde pagina die niets waarmaakt, en hier met
 * merknamen en bedragen erbij. De aanroepers geven nu een lege lijst door, en
 * zowel het dashboard (DashboardPage.tsx:335) als de resultatenpagina hebben
 * een eerlijke lege staat die de gebruiker vertelt wat er aan de hand is.
 *
 * De constanten blijven bestaan zodat het onderscheid tussen source "supabase"
 * en source "fallback" intact blijft; dat signaal is bruikbaar, de nepdata niet.
 */
const FALLBACK_PRODUCTS: BoltProduct[] = [];

const FALLBACK_OUTFITS: Outfit[] = [];

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
      .eq('in_stock', true)
      .eq('is_kids', false);

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
    const prefKey = [
      _opts?.fit ?? '',
      _opts?.prints ?? '',
      (_opts?.goals || []).sort().join(','),
      (_opts?.materials || []).sort().join(','),
      (_opts?.occasions || []).sort().join(','),
    ].join('|');
    const cacheKey = `${archetype}|${_opts?.gender ?? ''}|${_opts?.budget?.max ?? ''}|${limit}|${prefKey}`;

    const cached = outfitCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return wrap(cached.data, "supabase", true);
    }

    const categories = ['top', 'bottom', 'footwear', 'outerwear', 'accessory', 'dress'];
    const selectFields = "id,name,brand,price,image_url,product_url,affiliate_url,retailer,category,tags,gender,colors,sizes,in_stock,style,description";
    const perCategory = 80;

    const results = await Promise.all(
      categories.map(cat => {
        let q = client
          .from("products")
          .select(selectFields)
          .eq("in_stock", true)
          .eq("is_kids", false)
          .eq("category", cat);

        if (_opts?.gender && _opts.gender !== "unisex") {
          q = q.or(`gender.eq.${_opts.gender},gender.eq.unisex`);
        }
        if (_opts?.budget && _opts.budget.max > 0) {
          q = q.gte("price", _opts.budget.min).lte("price", _opts.budget.max);
        }
        return q.limit(perCategory).then(r => r.data ?? []);
      })
    );

    let allRows: Record<string, any>[] = results.flat();

    if (allRows.length < 10) {
      let fallbackQ = client
        .from("products")
        .select(selectFields)
        .eq("in_stock", true)
        .eq("is_kids", false);
      if (_opts?.gender && _opts.gender !== "unisex") {
        fallbackQ = fallbackQ.or(`gender.eq.${_opts.gender},gender.eq.unisex`);
      }
      const { data } = await fallbackQ.limit(400);
      if (data && data.length >= 10) allRows = data;
    }

    if (allRows.length < 10) {
      return wrap([...FALLBACK_OUTFITS], "fallback");
    }

    const prefs: UserPreferences = {
      fit: _opts?.fit,
      prints: _opts?.prints,
      goals: _opts?.goals,
      materials: _opts?.materials,
      occasions: _opts?.occasions,
      colorProfile: _opts?.colorProfile,
      budget: _opts?.budget,
    };

    const composed = composeOutfits(allRows, archetype, limit, _opts?.gender, prefs);

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
          itemReason: p.itemReason,
        })),
        match: c.matchScore,
        tags: [c.occasion.toLowerCase()],
        season: undefined,
        explanation: c.explanation,
      } as Outfit));
      outfitCache.set(cacheKey, { data: outfits, ts: Date.now() });
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
