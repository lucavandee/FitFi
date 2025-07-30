import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Simple, robust Supabase client - let Supabase handle storage automatically
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { 
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Test user ID for development
export const TEST_USER_ID = 'test-user-123';

// Feature flag for Supabase usage
export const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

export default supabase;