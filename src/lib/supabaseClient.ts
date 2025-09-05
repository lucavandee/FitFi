import { createClient, SupabaseClient } from "@supabase/supabase-js";

function readMeta(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  return el?.content || undefined;
}

const url = (import.meta as any).env?.VITE_SUPABASE_URL || readMeta("supabase-url");
const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || readMeta("supabase-anon-key");

let client: SupabaseClient | null = null;
try {
  if (url && anonKey) client = createClient(url, anonKey);
} catch (e) {
  console.warn("[supabaseClient] init failed:", e);
}

export default client;
export const hasSupabase = !!client;