export const env = {
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  USE_BOLT: import.meta.env.VITE_USE_BOLT === 'true',
  USE_SUPABASE: import.meta.env.VITE_USE_SUPABASE === 'true',
  USE_LOCAL_FALLBACK: import.meta.env.VITE_USE_LOCAL_FALLBACK === 'true',

  BOLT_API_URL: import.meta.env.VITE_BOLT_API_URL,
  BOLT_API_KEY: import.meta.env.VITE_BOLT_API_KEY,

  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,

  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  BRAND_NAME: import.meta.env.VITE_BRAND_NAME || 'FitFi',
};
