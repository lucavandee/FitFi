import { supabase } from '@/lib/supabaseClient';
import type { KetenConfig } from './composeClient';

/**
 * KetenConfig voor de browser; null als Supabase uit staat of de env
 * ontbreekt. Sinds afwijking 1 (taak 7) is dat de enige eis: KetenConfig
 * bevat geen functionsUrl en geen anonKey meer (die dienden alleen de
 * vervallen fetch naar de edge function), en supabase() zelf controleert al
 * of VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY aanwezig zijn.
 */
export function browserKetenConfig(): KetenConfig | null {
  const client = supabase();
  if (!client) return null;
  return { supabase: client };
}
