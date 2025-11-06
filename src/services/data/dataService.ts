import { supabase } from "@/lib/supabaseClient";
import type { BoltProduct, Outfit, FitFiUserProfile, Tribe, DataResponse } from "./types";

const NOW = () => new Date().toISOString();

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

    const products: BoltProduct[] = data.map(p => ({
      id: p.id,
      title: p.name || p.title,
      name: p.name || p.title,
      brand: p.brand,
      price: p.price,
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

    return wrap(products, "supabase");
  } catch (error) {
    return wrap([...FALLBACK_PRODUCTS], "fallback");
  }
}

export async function fetchOutfits(_opts?: {
  gender?: 'male' | 'female' | 'unisex';
  archetype?: string;
  season?: string;
  limit?: number;
}): Promise<DataResponse<Outfit[]>> {
  try {
    const productsResponse = await fetchProducts({
      gender: _opts?.gender,
      limit: 50
    });

    if (productsResponse.source === 'fallback' || !productsResponse.data || productsResponse.data.length < 10) {
      return wrap([...FALLBACK_OUTFITS], "fallback");
    }

    const products = productsResponse.data;
    const outfits: Outfit[] = [];
    const limit = _opts?.limit || 6;

    const categories = {
      top: products.filter(p =>
        p.category === 'top' ||
        p.category === "Polo's & T-shirts" ||
        p.category === 'Shirting' ||
        p.category === 'Overshirts'
      ),
      bottom: products.filter(p =>
        p.category === 'bottom' ||
        p.category === 'Trousers'
      ),
      footwear: products.filter(p =>
        p.category === 'footwear'
      ),
      outerwear: products.filter(p =>
        p.category === 'outerwear' ||
        p.category === 'Outerwear' ||
        p.category === 'Knitwear' ||
        p.category === 'Sweatshirts'
      ),
      accessory: products.filter(p =>
        p.category === 'accessory' ||
        p.category === 'Accessories'
      ),
    };

    for (let i = 0; i < limit; i++) {
      const outfitProducts: BoltProduct[] = [];

      if (categories.top.length > i) outfitProducts.push(categories.top[i]);
      if (categories.bottom.length > i) outfitProducts.push(categories.bottom[i]);
      if (categories.footwear.length > Math.floor(i/2)) outfitProducts.push(categories.footwear[Math.floor(i/2)]);
      if (i < 3 && categories.outerwear.length > i) outfitProducts.push(categories.outerwear[i]);

      if (outfitProducts.length >= 2) {
        outfits.push({
          id: `outfit-${i + 1}`,
          title: i === 0 ? 'Smart Casual — Minimal' : i === 1 ? 'Urban Clean' : `Look ${i + 1}`,
          products: outfitProducts
        });
      }
    }

    if (outfits.length === 0) {
      return wrap([...FALLBACK_OUTFITS], "fallback");
    }

    return wrap(outfits, "supabase");
  } catch (error) {
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
