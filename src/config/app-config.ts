// Application configuration settings
// This file centralizes important app-wide settings

/**
 * Base URL for Bolt API or static JSON files
 */
export const BOLT_API_URL = "/data/bolt";

/**
 * Toggle for Supabase integration
 * When set to false, the app will use local fallback data instead of making Supabase API calls
 */
export const USE_SUPABASE = false;

/**
 * Toggle for Bolt API integration
 * When set to true, the app will try to use Bolt API as a fallback when Supabase is unavailable
 */
export const USE_BOLT = true;

/**
 * Toggle for Zalando integration
 * When set to true, the app will try to use Zalando products when Supabase is unavailable
 */
export const USE_ZALANDO = true;

/**
 * Debug mode toggle
 * When enabled, additional console logs will be shown
 */
export const DEBUG_MODE = true;

/**
 * Default user ID for testing
 * Used when Supabase is disabled or for development purposes
 */
export const DEFAULT_USER_ID = 'f8993892-a1c1-4d7d-89e9-5886e3f5a3e8';

/**
 * API configuration
 */
export const API_CONFIG = {
  // Maximum number of retries for failed API requests
  maxRetries: 2,
  // Delay between retries in milliseconds
  retryDelay: 1000,
  // Request timeout in milliseconds
  timeout: 10000,
  // Cache TTL in milliseconds (5 minutes)
  cacheTTL: 5 * 60 * 1000
};

/**
 * Feature flags
 */
export const FEATURES = {
  // Enable gamification features
  gamification: true,
  // Enable photo upload feature
  photoUpload: true,
  // Enable premium features
  premium: true
};
