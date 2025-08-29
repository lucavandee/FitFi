import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Create a single shared client instance
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Default export (common pattern across the app)
export default supabase;

// Named helper used by services (e.g., dataService.ts)
export function getSupabase(): SupabaseClient {
  return supabase;
}

// (optional) re-export type if you need it elsewhere
export type { SupabaseClient };