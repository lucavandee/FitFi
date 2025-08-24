export const APP_ENV = {
  USE_SUPABASE: (import.meta.env.VITE_USE_SUPABASE ?? "false") === "true",
  USE_MOCK_DATA: (import.meta.env.VITE_USE_MOCK_DATA ?? "true") === "true",
  DEBUG_MODE: (import.meta.env.VITE_DEBUG_MODE ?? "false") === "true",
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT ?? "development",
  IS_PRODUCTION: (import.meta.env.VITE_IS_PRODUCTION ?? "false") === "true",
} as const;

export type AppEnvironment = typeof APP_ENV;

// Health check utilities
export function isSupabaseConfigured(): boolean {
  return !!(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  );
}

export function shouldUseSupabase(): boolean {
  return APP_ENV.USE_SUPABASE && isSupabaseConfigured();
}

export default APP_ENV;
