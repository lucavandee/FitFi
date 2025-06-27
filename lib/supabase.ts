// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Supabase config
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || 'https://wojexzgjyhijuxzperhq.supabase.co';
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1Ni...'; // shortened for readability

// Fallback warning in development
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('[Supabase] URL or anon key missing in .env – fallback active!');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helpers
export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export const TEST_USER_ID = 'f8993892-a1c1-4d7d-89e9-5886e3f5a3e8';

export default supabase;