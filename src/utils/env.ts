// src/utils/env.ts

export const env = {
  // ✅ Databron instellingen
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  USE_BOLT: import.meta.env.VITE_USE_BOLT === 'true',
  USE_SUPABASE: import.meta.env.VITE_USE_SUPABASE === 'true',
  USE_LOCAL_FALLBACK: import.meta.env.VITE_USE_LOCAL_FALLBACK === 'true',
  USE_ZALANDO: import.meta.env.VITE_USE_ZALANDO === 'true',

  // ✅ Bolt API
  BOLT_API_URL: import.meta.env.VITE_BOLT_API_URL,
  BOLT_API_KEY: import.meta.env.VITE_BOLT_API_KEY,

  // ✅ Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,

  // ✅ Omgeving & merk
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  BRAND_NAME: import.meta.env.VITE_BRAND_NAME || 'FitFi',

  // ✅ Debug & configuratie
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  API_CONFIG: import.meta.env.VITE_API_CONFIG || '',

  // ✅ Google Analytics (optioneel)
  GTAG_ID: import.meta.env.VITE_GTAG_ID || '',
};
