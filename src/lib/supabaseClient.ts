import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Safe Supabase singleton.
 * - Gebruikt VITE_ env op build-time.
 * - Valt optioneel terug op <meta name="supabase-url"> runtime.
 * - Export is client of null (nooit een functie), zodat "supabase is not a function" niet kan gebeuren.
 */
function readMeta(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  return el?.content || undefined;
}

const url = (import.meta as any).env?.VITE_SUPABASE_URL || readMeta("supabase-url");
const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || readMeta("supabase-anon-key");

let client: SupabaseClient | null = null;
try {
  if (url && anonKey) {
    client = createClient(url, anonKey);
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn("[supabaseClient] Could not initialize Supabase:", e);
}

/** Default export kan `null` zijn – altijd checken voor gebruik. */
export default client;

/** Convenience flag */
export const hasSupabase = !!client;