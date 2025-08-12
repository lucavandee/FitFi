import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const useFlag =
  (import.meta.env.VITE_USE_SUPABASE ?? 'false').toString().toLowerCase() === 'true';

// Lazy singleton
let client: SupabaseClient | null = null;

/** Of Supabase functioneel is (toggle + geldige env). */
export const isSupabaseEnabled =
  useFlag && typeof url === 'string' && url.length > 0 && typeof key === 'string' && key.length > 0;

/** Maak/haal de client op. Retourneert null wanneer disabled. Gooit NIET bij import. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseEnabled) return null;
  if (client) return client;
  // url/key zijn truthy als isSupabaseEnabled true is
  client = createClient(url!, key!, { auth: { persistSession: false } });
  return client;
}

/** Forceer Supabase of leg duidelijk uit wat te doen. */
export function requireSupabase(): SupabaseClient {
  const sb = getSupabase();
  if (!sb) {
    throw new Error(
      'Supabase is disabled. Set VITE_USE_SUPABASE=true and provide VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.'
    );
  }
  return sb;
}

/** ▶ Named export die veel code verwacht: kan null zijn als disabled. */
export const supabase = getSupabase();

/** Gebruikt door ErrorBoundary/debug */
export const TEST_USER_ID = 'test-user';

/** (optioneel) default export met alle helpers bij elkaar */
const supabaseApi = { getSupabase, requireSupabase, isSupabaseEnabled, supabase, TEST_USER_ID };
export default supabaseApi;