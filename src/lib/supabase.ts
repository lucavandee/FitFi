import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const useFlag = (import.meta.env.VITE_USE_SUPABASE ?? 'false').toString().toLowerCase() === 'true';

let client: SupabaseClient | null = null;

export const isSupabaseEnabled =
  useFlag && typeof url === 'string' && url.length > 0 && typeof key === 'string' && key.length > 0;

/**
 * Lazy getter: alleen initialiseren als expliciet enabled + envs aanwezig.
 * Retourneert null wanneer Supabase uit staat; callers moeten dan fallbacken.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseEnabled) return null;
  if (client) return client;

  if (!url || !key) {
    // Alleen error wanneer expliciet enabled maar envs ontbreken.
    throw new Error('Missing Supabase environment variables');
  }

  client = createClient(url, key, {
    auth: { persistSession: false },
  });
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

// Backward compatibility export voor bestaande imports
export const supabase = getSupabase();