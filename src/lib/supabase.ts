/**
 * DEPRECATED: Use @/lib/supabaseClient instead
 * This file now re-exports the singleton client to prevent multiple instances
 */
import { supabase as supabaseClientFn } from './supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';

const client = supabaseClientFn();

export const isSupabaseEnabled = !!client;

export function getSupabase(): SupabaseClient | null {
  return supabaseClientFn();
}

export function requireSupabase(): SupabaseClient {
  const sb = supabaseClientFn();
  if (!sb) {
    throw new Error(
      'Supabase is disabled. Set VITE_USE_SUPABASE=true and provide VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.'
    );
  }
  return sb;
}

export const supabase = client;

export const TEST_USER_ID = 'test-user';

const supabaseApi = { getSupabase, requireSupabase, isSupabaseEnabled, supabase, TEST_USER_ID };
export default supabaseApi;
