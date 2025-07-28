import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test user ID for development
export const TEST_USER_ID = 'test-user-123';

// Feature flag for Supabase usage
export const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

export default supabase;