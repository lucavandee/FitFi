// src/lib/supabase.ts
import { validateEnv } from "./envValidator";
import { createClient } from '@supabase/supabase-js';
import { env } from '../utils/env';

validateEnv(); // Voert directe check uit bij startup

// 🔐 Supabase configuratie
const supabaseUrl: string = env.SUPABASE_URL;
const supabaseAnonKey: string = env.SUPABASE_ANON_KEY;

// ✅ Validatie op omgeving
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(`
[⚠️ Supabase Warning]
Je .env mist de volgende variabelen:
${!supabaseUrl ? '- VITE_SUPABASE_URL' : ''}
${!supabaseAnonKey ? '- VITE_SUPABASE_ANON_KEY' : ''}
Fallback-gedrag wordt nu geactiveerd. Supabase zal mogelijk geen requests uitvoeren.
`);
}

// 🔧 Supabase client aanmaken
const supabase = createClient(
  supabaseUrl || 'https://fallback.supabase.co',
  supabaseAnonKey || 'public-anon-key-fallback'
);

// 🔎 UUID validatiefunctie
export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

// 🧪 Testgebruiker voor dev/testomgeving
export const TEST_USER_ID = 'f8993892-a1c1-4d7d-89e9-5886e3f5a3e8';

// Export USE_SUPABASE from env
export const USE_SUPABASE = env.USE_SUPABASE;

// 🧠 Export de Supabase client
export default supabase;
