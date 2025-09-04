/**
 * Canonical Supabase client (singleton).
 * 
 * Gebruik overal:
 * import supabase from "@/lib/supabaseClient";
 */
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Fail fast in dev; in production log helder bericht.
  const msg =
    "[Supabase] Ontbrekende env vars: verwacht VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY. " +
    "Zet deze in je .env en Netlify env.";
  if (import.meta.env.DEV) throw new Error(msg);
  // In productie gooien we geen harde throw (kan SSR/preview breken), maar loggen we.
  // UI moet hier netjes op reageren (empty/error states).
  // eslint-disable-next-line no-console
  console.error(msg);
}

// Singleton – module scope
const supabase = createClient(url ?? "", anonKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;