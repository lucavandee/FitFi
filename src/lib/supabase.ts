import { createClient } from '@supabase/supabase-js';
import { CookieStorage } from '@supabase/auth-helpers-shared';
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
    // Cookie fallback for private browsing mode
    return {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: new CookieStorage({
        cookieOptions: {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: 'lax',
          secure: window.location.protocol === 'https:',
          path: '/'
        }
      })
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