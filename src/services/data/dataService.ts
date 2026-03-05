import { supabase } from "@/lib/supabaseClient";
import type { BoltProduct, Outfit, FitFiUserProfile, Tribe, DataResponse } from "./types";
import generateOutfits from "@/engine/generateOutfits";
import type { Product as EngineProduct, Outfit as EngineOutfit, OutfitGenerationOptions } from "@/engine/types";

const NOW = () => new Date().toISOString();

const NON_CLOTHING_PATTERNS = [
  /kaars/i, /candle/i, /lamp/i, /vaas/i, /houder/i, /decor/i,
  /bedrok/i, /kussen/i, /plaid/i, /handdoek/i, /baddoek/i,
  /meegroeipakje/i, /baby/i, /peuter/i, /kleuter/i, /romper/i,
  /wanten/i, /handschoen/i, /bonnet/i, /haarbonnet/i,
  /pantoffel/i, /sloffen/i, /slippers/i, /flip.?flop/i,
  /oplaadba/i, /oplader/i, /telefoon/i, /hoesje/i,
  /speelgoed/i, /knuffel/i, /puzzel/i,
  /voetbal.*(shirt|short|jersey|tenue)/i,
  /Marokko\s+20\d/i, /Manchester\s+(City|United)/i,
  /Marseille/i, /Arsenal/i, /AC\s*Milan/i, /Borussia/i,
  /Barcelona/i, /Bayern/i, /Liverpool/i, /Chelsea/i,
  /motorsport/i, /McLAREN/i, /BMW\s+M\s/i, /Ferrari/i,
  /Red\s+Bull\s+Racing/i, /Scuderia/i,
  /voetbalschoen/i, /voetbalbroek/i, /keepers/i,
  /boxer/i, /onderbroek/i, /ondergoed/i, /underwear/i,
  /lingerie/i, /^bh\b/i, /\bbra\b/i, /string(?!er)/i,
  /hipster.*brief/i, /trunk.*brief/i, /slip(?!on|per)/i,
  /bjorn\s*borg/i, /björn\s*borg/i,
  /sokken/i, /socks/i, /kousen/i,
  /zwembroek/i, /bikini/i, /badpak/i, /zwemshort/i,
  /pyjama/i, /nachthem/i, /slaap/i, /ochtendjas/i, /badjas/i,
];

const BAD_FOOTWEAR_PATTERNS = [
  /pantoffel/i, /sloffen/i, /slipper(?!s?\s+sneaker)/i,
  /flip.?flop/i, /sandal/i, /crocs/i, /klompen/i, /muil/i,
  /badslip/i, /badslipper/i, /teenslip/i,
];

function isClothingProduct(row: Record<string, any>): boolean {
  const name = row.name || row.title || '';
  if (NON_CLOTHING_PATTERNS.some(p => p.test(name))) return false;
  if (row.category === 'footwear' && BAD_FOOTWEAR_PATTERNS.some(p => p.test(name))) return false;
  const price = typeof row.price === 'number' ? row.price : parseFloat(row.price) || 0;
  if (price <= 0) return false;
  if (!row.image_url && !row.imageUrl) return false;
  return true;
}

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

    const clothingOnly = data.filter(isClothingProduct);

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

function toEngineProduct(row: Record<string, any>): EngineProduct {
  return {
    id: row.id,
    name: row.name || row.title || "",
    brand: row.brand,
    price: typeof row.price === "number" ? row.price : parseFloat(row.price) || 0,
    imageUrl: row.image_url,
    category: row.category,
    description: row.description,
    tags: row.tags || [],
    colors: row.colors || [],
    gender: row.gender,
    sizes: row.sizes || [],
    affiliateUrl: row.affiliate_url || row.product_url,
    productUrl: row.product_url || row.affiliate_url,
    retailer: row.retailer,
    style: row.style,
  };
}

function engineToBoltOutfit(eo: EngineOutfit): Outfit {
  const products: BoltProduct[] = eo.products.map(p => ({
    id: p.id,
    title: p.name,
    name: p.name,
    brand: p.brand,
    price: p.price,
    imageUrl: p.imageUrl,
    image: p.imageUrl,
    url: p.affiliateUrl || p.productUrl || "#",
    retailer: p.retailer,
    category: p.category,
    description: p.description,
    tags: p.tags || [],
    colors: p.colors || [],
    gender: p.gender as BoltProduct["gender"],
  }));

  return {
    id: eo.id,
    title: eo.title,
    products,
    match: eo.matchPercentage,
    tags: eo.tags,
    season: eo.season,
  };
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
    const limit = _opts?.limit || 6;

    const categories = ['top', 'bottom', 'footwear', 'outerwear', 'accessory', 'dress'];
    const perCategory = Math.ceil(300 / categories.length);
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

    allRows = allRows.filter(isClothingProduct);

    if (allRows.length < 10) {
      let fallbackQuery = client
        .from("products")
        .select("*")
        .eq("in_stock", true);

      if (_opts?.gender && _opts.gender !== "unisex") {
        fallbackQuery = fallbackQuery.or(`gender.eq.${_opts.gender},gender.eq.unisex`);
      }

      fallbackQuery = fallbackQuery.limit(300);
      const { data } = await fallbackQuery;
      if (data) {
        const filtered = data.filter(isClothingProduct);
        if (filtered.length >= 10) allRows = filtered;
      }
    }

    if (allRows.length < 10) {
      return wrap([...FALLBACK_OUTFITS], "fallback");
    }

    const engineProducts = allRows.map(toEngineProduct);

    const options: OutfitGenerationOptions = {};
    if (_opts?.fit) options.fit = _opts.fit;
    if (_opts?.prints) options.prints = _opts.prints;
    if (_opts?.goals) options.goals = _opts.goals;
    if (_opts?.materials) options.materials = _opts.materials;
    if (_opts?.colorProfile) options.colorProfile = _opts.colorProfile;
    if (_opts?.occasions) options.preferredOccasions = _opts.occasions;
    if (_opts?.budget) options.budget = _opts.budget;

    const engineOutfits = generateOutfits(
      archetype,
      engineProducts,
      limit,
      _opts?.secondaryArchetype,
      _opts?.mixFactor ?? 0.3,
      options
    );

    if (!engineOutfits || engineOutfits.length === 0) {
      return wrap([...FALLBACK_OUTFITS], "fallback");
    }

    return wrap(engineOutfits.map(engineToBoltOutfit), "supabase");
  } catch {
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
