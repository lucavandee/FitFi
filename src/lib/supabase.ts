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

// Global error interceptor for 401 handling
const originalRequest = supabase.rest.request;
supabase.rest.request = async function(options: any) {
  try {
    return await originalRequest.call(this, options);
  } catch (error: any) {
    // Handle 401 errors gracefully - show toast but don't sign out
    if (error?.status === 401 || error?.code === '42501') {
      console.warn('Supabase 401 error intercepted:', error.message);
      toast.error('Toegang geweigerd - probeer opnieuw in te loggen');
      // Don't automatically sign out - let user decide
      return { data: null, error };
    }
    throw error;
  }
};

// Test user ID for development
export const TEST_USER_ID = 'test-user-123';

// Feature flag for Supabase usage
export const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

export default supabase;