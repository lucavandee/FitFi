import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ENV, logEnvOnce } from '@/env';

logEnvOnce();

if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  console.error('Supabase env missing', {
    url: !!ENV.SUPABASE_URL,
    anon: !!ENV.SUPABASE_ANON_KEY,
  });
  throw new Error('Missing Supabase env (URL or ANON KEY)');
}

const client: SupabaseClient = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'fitfi.auth',
  },
});

// Hybride export: functie die client retourneert + alle props
type SupabaseCompat = SupabaseClient & (() => SupabaseClient);
const compat = Object.assign(() => client, client) as SupabaseCompat;

export const supabase = compat;       // named (callable + object)
export const supabaseClient = client; // named (object)
export type { SupabaseClient };
export default compat;                // default (callable + object)