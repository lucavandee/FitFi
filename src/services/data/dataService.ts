import Local from "./localSource";
import Remote from "./supabaseSource";
import { hasSupabase } from "@/lib/supabaseClient";

export async function getProducts() {
  const remote = hasSupabase ? await Remote.fetchProducts() : [];
  return remote.length ? remote : Local.fetchProducts();
}

export async function getOutfits() {
  const remote = hasSupabase ? await Remote.fetchOutfits() : [];
  return remote.length ? remote : Local.fetchOutfits();
}

const DataService = { getProducts, getOutfits };
export default DataService;