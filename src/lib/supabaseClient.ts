import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
const useFlag = (import.meta.env.VITE_USE_SUPABASE ?? 'false').toString().toLowerCase() === 'true';

let _client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (_client) return _client;

  if (!useFlag) {
    console.warn('⚠️ [SupabaseClient] Supabase disabled via VITE_USE_SUPABASE flag');
    return null;
  }

  if (!url || !anonKey) {
    console.error('❌ [SupabaseClient] Missing credentials:', {
      hasUrl: !!url,
      hasKey: !!anonKey,
      url: url ? `${url.substring(0, 30)}...` : 'undefined'
    });
    return null;
  }

  console.log('🔧 [Supabase] Initializing client:', {
    url: `${url.substring(0, 30)}...`,
    hasKey: !!anonKey
  });

  try {
    const authKey = "fitfi.supabase.auth";
    const stored = localStorage.getItem(authKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== 'object') {
        console.warn('⚠️ [Supabase] Clearing corrupted auth state');
        localStorage.removeItem(authKey);
      }
    }
  } catch (e) {
    console.warn('⚠️ [Supabase] Error checking auth state:', e);
    localStorage.removeItem("fitfi.supabase.auth");
  }

  _client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "fitfi.supabase.auth",
      detectSessionInUrl: false,
    },
  });

  return _client;
}
