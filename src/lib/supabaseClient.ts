import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anon) {
  console.error('Supabase env missing', { url: !!url, anon: !!anon });
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

// Singleton client
const client: SupabaseClient = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'fitfi.auth',
  },
});

// Hybride: functie die client retourneert + alle client props (auth, from, etc.)
type SupabaseCompat = SupabaseClient & (() => SupabaseClient);
const supabaseCompat = Object.assign(() => client, client) as SupabaseCompat;

// Exports
export const supabase = supabaseCompat;     // named (callable + object)
export const supabaseClient = client;       // named (puur object)
export type { SupabaseClient };
export default supabaseCompat;              // default (callable + object)