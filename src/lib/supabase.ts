// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase'; // Let op: pas dit pad aan als nodig

// 1. Haal Supabase config uit env (met fallback voor development)
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || 'https://wojexzgjyhijuxzperhq.supabase.co';
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvamV4emdqeWhpanV4enBlcmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTM2NDAsImV4cCI6MjA2NjQyOTY0MH0.nLozOsn1drQPvRuSWRl_gLsh0_EvgtjidiUxpdUnhg0';

// 2. Warn als env ontbreekt (mag NIET in productie, dus check je Netlify/Vercel!)
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase] Supabase URL or anon key missing in .env – using hardcoded fallback. Zet altijd je env vars goed!'
  );
}

// 3. Maak de client aan, met beste settings voor frontend
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// 4. Utility: Error handling
export function handleSupabaseError(error: Error | null, fallbackMessage: string = 'Er ging iets mis') {
  if (error) {
    console.error('[Supabase] Error:', error);
    return error.message;
  }
  return fallbackMessage;
}

// 5. Utility: Connection check (gebruik in health checks)
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      console.error('[Supabase] Connection check error:', error);
    }
    return !error;
  } catch (err) {
    console.error('[Supabase] Fatal connection error:', err);
    return false;
  }
}

// 6. Utility: UUID validatie
export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

// 7. (DEV) Test user voor lokale dev of test scenarios
export const TEST_USER_ID = 'f8993892-a1c1-4d7d-89e9-5886e3f5a3e8';

// 8. Export default client voor gebruik door hele app
export default supabase;
