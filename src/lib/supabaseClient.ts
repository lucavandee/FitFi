import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Één gedeelde clientinstantie
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Default export (voor `import supabase from "@/lib/supabase"`)
export default supabase;

// Helper (voor code die `getSupabase()` gebruikt)
export function getSupabase(): SupabaseClient {
  return supabase;
}

export type { SupabaseClient };