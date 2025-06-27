// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase'; // Let op: pad afhankelijk van jouw projectstructuur
import type { UserProfile } from '../context/UserContext';

// Supabase config ophalen
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || 'https://wojexzgjyhijuxzperhq.supabase.co';
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1Ni...'; // ingekort voor leesbaarheid

// Fallback waarschuwing in development
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('[Supabase] URL of anon key ontbreekt in .env – fallback actief!');
}

// Supabase client aanmaken
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helpers
export function handleSupabaseError(error: Error | null, fallbackMessage: string = 'Er ging iets mis') {
  if (error) {
    console.error('[Supabase] Error:', error);
    return error.message;
  }
  return fallbackMessage;
}

export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    return !error;
  } catch (err) {
    console.error('[Supabase] Connection check failed:', err);
    return false;
  }
}

export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export const TEST_USER_ID = 'f8993892-a1c1-4d7d-89e9-5886e3f5a3e8';

// ---------- DATA FUNCTIES ----------

export async function getUserById(id: string): Promise<UserProfile | null> {
  try {
    // Use mock data for development to avoid Supabase connection issues
    return {
      id: TEST_USER_ID,
      name: 'Test User',
      email: 'test@example.com',
      gender: 'neutral',
      isPremium: false,
      stylePreferences: {
        casual: 4,
        formal: 3,
        sporty: 2,
        vintage: 5,
        minimalist: 4
      },
      savedRecommendations: []
    };
  } catch (error) {
    console.error('[Supabase] getUserById error:', error);
    return null;
  }
}

export async function createUser(profile: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    // Use mock data for development to avoid Supabase connection issues
    return {
      id: TEST_USER_ID,
      name: profile.name || 'Test User',
      email: profile.email || 'test@example.com',
      gender: profile.gender as 'male' | 'female' | 'neutral' | undefined,
      isPremium: false,
      stylePreferences: {
        casual: 3,
        formal: 3,
        sporty: 3,
        vintage: 3,
        minimalist: 3
      },
      savedRecommendations: []
    };
  } catch (error) {
    console.error('[Supabase] createUser error:', error);
    return null;
  }
}

export async function updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    // Use mock data for development to avoid Supabase connection issues
    return {
      id: TEST_USER_ID,
      name: updates.name || 'Test User',
      email: updates.email || 'test@example.com',
      gender: updates.gender as 'male' | 'female' | 'neutral' | undefined,
      isPremium: updates.isPremium || false,
      stylePreferences: updates.stylePreferences || {
        casual: 4,
        formal: 3,
        sporty: 2,
        vintage: 5,
        minimalist: 4
      },
      savedRecommendations: updates.savedRecommendations || []
    };
  } catch (error) {
    console.error('[Supabase] updateUser error:', error);
    return null;
  }
}

export async function saveOutfit(userId: string, outfitId: string): Promise<boolean> {
  try {
    // Mock successful save
    return true;
  } catch (error) {
    console.error('[Supabase] saveOutfit error:', error);
    return false;
  }
}

export async function unsaveOutfit(userId: string, outfitId: string): Promise<boolean> {
  try {
    // Mock successful unsave
    return true;
  } catch (error) {
    console.error('[Supabase] unsaveOutfit error:', error);
    return false;
  }
}

// Export client als default
export default supabase;