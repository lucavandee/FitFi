import { createClient } from '@supabase/supabase-js';
import { storageAvailable } from '../utils/storageUtils';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Detect storage availability and configure appropriate persistence
const getStorageConfig = () => {
  if (storageAvailable()) {
    return {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    };
  } else {
    // Simple fallback for private browsing mode - use default storage
    return {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    };
  }
};
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: getStorageConfig()
});

// Test user ID for development
export const TEST_USER_ID = 'test-user-123';

// Feature flag for Supabase usage
export const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

export default supabase;