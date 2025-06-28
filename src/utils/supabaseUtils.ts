import { isValidUUID, TEST_USER_ID } from '../lib/supabase';
import { logError } from './errorHandling';

/**
 * Utility functions for Supabase operations
 */

/**
 * Gets the effective user ID for Supabase operations
 * In development, always use the test user ID
 * @param userId - The user ID to check
 * @returns The effective user ID to use
 */
export const getEffectiveUserId = (userId: string): string => {
  // In development, always use the test user ID
  if (process.env.NODE_ENV === 'development') {
    return TEST_USER_ID;
  }
  
  // In production, validate the UUID
  if (isValidUUID(userId)) {
    return userId;
  }
  
  // Log error for invalid UUID
  logError(new Error(`Invalid UUID format: ${userId}`), {
    context: 'getEffectiveUserId',
    userId
  });
  
  // Return test user ID as fallback
  return TEST_USER_ID;
};

/**
 * Validates a user ID for Supabase operations
 * @param userId - The user ID to validate
 * @param context - Context for error logging
 * @returns Whether the user ID is valid
 */
export const validateUserId = (userId: string, context: string = 'unknown'): boolean => {
  if (!userId) {
    logError(new Error('Missing user ID'), { context });
    return false;
  }
  
  // Always use test user ID in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  if (!isValidUUID(userId)) {
    logError(new Error(`Invalid UUID format: ${userId}`), { context });
    return false;
  }
  
  return true;
};

/**
 * Formats a Supabase error for logging and display
 * @param error - The Supabase error
 * @param context - Context for error logging
 * @returns Formatted error message
 */
export const formatSupabaseError = (error: any, context: string = 'unknown'): string => {
  if (!error) return 'Unknown error';
  
  // Extract error message
  let message = error.message || 'Unknown error';
  
  // Check for Supabase error format
  if (error.code) {
    switch (error.code) {
      case 'PGRST116':
        message = 'Resource not found';
        break;
      case '23505':
        message = 'Duplicate record';
        break;
      case '22P02':
        message = 'Invalid input format';
        break;
      case '42P01':
        message = 'Table does not exist';
        break;
      case '42501':
        message = 'Insufficient permissions';
        break;
      default:
        message = `Database error (${error.code}): ${message}`;
    }
  }
  
  // Log the error
  logError(new Error(message), {
    context,
    supabaseError: error
  });
  
  return message;
};

export default {
  getEffectiveUserId,
  validateUserId,
  formatSupabaseError
};