import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Helpt direct zien als env ontbreekt (ook in productie)
if (!url || !anon) {
  console.error('Supabase env missing', { url: !!url, anon: !!anon });
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

// Eén singleton client
const client: SupabaseClient = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'fitfi.auth',
  },
});

// Backwards-compatible exports
export const supabase = client;          // named export
export const supabaseClient = client;    // named export
export type { SupabaseClient };
export default client;                   // default export