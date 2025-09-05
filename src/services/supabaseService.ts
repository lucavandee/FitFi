import supabase, { hasSupabase } from "@/lib/supabaseClient";

export type Table = "profiles" | "outfits" | "products";

export async function select<T = any>(table: Table, query = "*"): Promise<T[]> {
  if (!hasSupabase || !supabase) return [];
  const { data, error } = await supabase.from(table).select(query as any);
  if (error) throw error;
  return (data as T[]) || [];
}

export async function insert<T = any>(table: Table, payload: any): Promise<T | null> {
  if (!hasSupabase || !supabase) return null;
  const { data, error } = await supabase.from(table).insert(payload).select().single();
  if (error) throw error;
  return (data as T) || null;
}

const SupabaseService = { select, insert };
export default SupabaseService;