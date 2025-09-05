import { hasSupabase } from "@/lib/supabaseClient";
import SupabaseService from "@/services/supabaseService";

export async function fetchProducts(): Promise<Product[]> {
  if (!hasSupabase) return [];
  return SupabaseService.select<Product>("products", "*");
}

export async function fetchOutfits(): Promise<Outfit[]> {
  if (!hasSupabase) return [];
  return SupabaseService.select<Outfit>("outfits", "*");
}

const SupabaseSource = { fetchProducts, fetchOutfits };
export default SupabaseSource;