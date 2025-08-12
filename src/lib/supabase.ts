import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseClient;
}

export function requireSupabase() {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }
  return client;
}

export function isSupabaseEnabled(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Named export for compatibility
export const supabase = getSupabase();

// Default export for legacy imports
const supabaseApi = { getSupabase, requireSupabase, isSupabaseEnabled, supabase };
export default supabaseApi;