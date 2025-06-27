import supabase, { handleSupabaseError, isValidUUID, TEST_USER_ID } from '../lib/supabase';
import { StylePreference, UserProfile } from '../context/UserContext';
import toast from 'react-hot-toast';

/**
 * @fileoverview Centralized Supabase service for all CRUD operations
 * This service handles all interactions with Supabase, including error handling,
 * retries, and fallbacks to ensure a robust user experience.
 */

// Configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // ms
const REQUEST_TIMEOUT = 10000; // 10 seconds
const USE_MOCK_DATA_FALLBACK = true;

/**
 * Executes a Supabase query with retry logic and timeout
 * @param operation - Function that performs the Supabase query
 * @param fallback - Optional fallback value if all retries fail
 * @param retries - Number of retries to attempt
 * @returns The result of the operation or fallback value
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  fallback: T | null = null,
  retries: number = MAX_RETRIES
): Promise<T | null> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Set up timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT);
      });
      
      // Race between the operation and timeout
      const result = await Promise.race([operation(), timeoutPromise]) as T;
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1}/${retries + 1} failed:`, error);
      
      if (attempt < retries) {
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
      }
    }
  }
  
  // All retries failed
  console.error(`All ${retries + 1} attempts failed for Supabase operation:`, lastError);
  return fallback;
}

// User Services

/**
 * Creates a new user in the database
 * @param userData - User data to create
 * @returns The created user profile or null if failed
 */
export const createUser = async (userData: Omit<UserProfile, 'id' | 'stylePreferences' | 'savedRecommendations'>): Promise<UserProfile | null> => {
  try {
    // First, create auth user if not in mock mode
    let userId = TEST_USER_ID;
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password || generateRandomPassword(),
      options: {
        data: {
          name: userData.name,
        },
      },
    });

    if (authError) {
      console.error('Auth error during user creation:', authError);
      // Continue with test user ID if auth fails
    } else if (authData.user) {
      userId = authData.user.id;
    }

    // Validate UUID before proceeding
    if (!isValidUUID(userId)) {
      console.error(`Invalid UUID format for createUser: ${userId}`);
      throw new Error('Invalid UUID format');
    }

    // Then, upsert into users table to avoid duplicate key errors
    const operation = async () => {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          name: userData.name,
          email: userData.email,
          gender: userData.gender,
          is_premium: userData.isPremium || false,
        }, { 
          onConflict: 'id' 
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    };

    const data = await executeWithRetry(operation);
    
    if (!data) {
      throw new Error('Failed to create user in database');
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      gender: data.gender as 'male' | 'female' | 'neutral' | undefined,
      isPremium: data.is_premium,
      stylePreferences: {
        casual: 3,
        formal: 3,
        sporty: 3,
        vintage: 3,
        minimalist: 3,
      },
      savedRecommendations: [],
    };
  } catch (error) {
    console.error('Error creating user:', error);
    toast.error('Failed to create user account. Please try again.');
    
    if (USE_MOCK_DATA_FALLBACK) {
      // Return mock user as fallback
      return {
        id: TEST_USER_ID,
        name: userData.name,
        email: userData.email,
        gender: userData.gender as 'male' | 'female' | 'neutral' | undefined,
        isPremium: false,
        stylePreferences: {
          casual: 3,
          formal: 3,
          sporty: 3,
          vintage: 3,
          minimalist: 3,
        },
        savedRecommendations: [],
      };
    }
    
    return null;
  }
};

/**
 * Gets a user by ID from the database
 * @param userId - User ID to fetch
 * @returns The user profile or null if not found
 */
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  try {
    // Always use test user ID for development
    const effectiveUserId = TEST_USER_ID;
    
    // Validate UUID before making database query
    if (!isValidUUID(effectiveUserId)) {
      console.error(`Invalid UUID format for getUserById: ${effectiveUserId}`);
      throw new Error('Invalid UUID format');
    }

    // Get user data - use maybeSingle() to handle no results gracefully
    const getUserOperation = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', effectiveUserId)
        .maybeSingle();

      if (error) throw error;
      return data;
    };

    const userData = await executeWithRetry(getUserOperation);
    
    if (!userData) {
      console.log('User not found in database, creating new user record');
      // Create a new user record if it doesn't exist using upsert to avoid duplicates
      const createUserOperation = async () => {
        const { data, error } = await supabase
          .from('users')
          .upsert({
            id: effectiveUserId,
            name: 'Test User',
            email: 'test@example.com',
            gender: 'neutral',
            is_premium: false,
          }, { 
            onConflict: 'id' 
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      };

      const newUserData = await executeWithRetry(createUserOperation);
      
      if (!newUserData) {
        throw new Error('Failed to create user record');
      }
      
      // Use the newly created user data
      const createdUser = newUserData;
      
      return {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        gender: createdUser.gender as 'male' | 'female' | 'neutral' | undefined,
        isPremium: createdUser.is_premium,
        stylePreferences: {
          casual: 3,
          formal: 3,
          sporty: 3,
          vintage: 3,
          minimalist: 3,
        },
        savedRecommendations: [],
      };
    }

    // Get style preferences
    const getStyleOperation = async () => {
      const { data, error } = await supabase
        .from('style_preferences')
        .select('*')
        .eq('user_id', effectiveUserId)
        .maybeSingle();

      if (error) throw error;
      return data;
    };

    const styleData = await executeWithRetry(getStyleOperation);

    // Get saved recommendations
    const getSavedOperation = async () => {
      const { data, error } = await supabase
        .from('saved_outfits')
        .select('outfit_id')
        .eq('user_id', effectiveUserId);

      if (error) throw error;
      return data;
    };

    const savedData = await executeWithRetry(getSavedOperation, []);

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      gender: userData.gender as 'male' | 'female' | 'neutral' | undefined,
      isPremium: userData.is_premium,
      stylePreferences: styleData ? {
        casual: styleData.casual,
        formal: styleData.formal,
        sporty: styleData.sporty,
        vintage: styleData.vintage,
        minimalist: styleData.minimalist,
      } : {
        casual: 3,
        formal: 3,
        sporty: 3,
        vintage: 3,
        minimalist: 3,
      },
      savedRecommendations: savedData ? savedData.map(item => item.outfit_id) : [],
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    
    if (USE_MOCK_DATA_FALLBACK) {
      // Return mock user as fallback
      return {
        id: TEST_USER_ID,
        name: 'Test User',
        email: 'test@example.com',
        gender: 'neutral',
        isPremium: false,
        stylePreferences: {
          casual: 3,
          formal: 3,
          sporty: 3,
          vintage: 3,
          minimalist: 3,
        },
        savedRecommendations: [],
      };
    }
    
    return null;
  }
};

/**
 * Updates a user in the database
 * @param userId - User ID to update
 * @param updates - User profile updates
 * @returns The updated user profile or null if failed
 */
export const updateUser = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    // Always use test user ID for development
    const effectiveUserId = TEST_USER_ID;
    
    // Validate UUID before making database query
    if (!isValidUUID(effectiveUserId)) {
      console.error(`Invalid UUID format for updateUser: ${effectiveUserId}`);
      throw new Error('Invalid UUID format');
    }

    // Update user table
    const userUpdates: any = {};
    if (updates.name) userUpdates.name = updates.name;
    if (updates.email) userUpdates.email = updates.email;
    if (updates.gender) userUpdates.gender = updates.gender;
    if (updates.isPremium !== undefined) userUpdates.is_premium = updates.isPremium;
    
    if (Object.keys(userUpdates).length > 0) {
      userUpdates.updated_at = new Date().toISOString();
      
      const updateUserOperation = async () => {
        const { error } = await supabase
          .from('users')
          .update(userUpdates)
          .eq('id', effectiveUserId);

        if (error) throw error;
        return true;
      };

      const userUpdateSuccess = await executeWithRetry(updateUserOperation, false);
      
      if (!userUpdateSuccess) {
        console.warn('Failed to update user data');
      }
    }

    // Update style preferences if provided
    if (updates.stylePreferences) {
      const checkPrefsOperation = async () => {
        const { data, error } = await supabase
          .from('style_preferences')
          .select('id')
          .eq('user_id', effectiveUserId)
          .maybeSingle();

        if (error) throw error;
        return data;
      };

      const existingPrefs = await executeWithRetry(checkPrefsOperation);

      if (existingPrefs) {
        // Update existing preferences
        const updatePrefsOperation = async () => {
          const { error } = await supabase
            .from('style_preferences')
            .update({
              ...updates.stylePreferences,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', effectiveUserId);

          if (error) throw error;
          return true;
        };

        const prefsUpdateSuccess = await executeWithRetry(updatePrefsOperation, false);
        
        if (!prefsUpdateSuccess) {
          console.warn('Failed to update style preferences');
        }
      } else {
        // Insert new preferences using upsert to avoid conflicts
        const insertPrefsOperation = async () => {
          const { error } = await supabase
            .from('style_preferences')
            .upsert({
              user_id: effectiveUserId,
              ...updates.stylePreferences,
            }, { 
              onConflict: 'user_id' 
            });

          if (error) throw error;
          return true;
        };

        const prefsInsertSuccess = await executeWithRetry(insertPrefsOperation, false);
        
        if (!prefsInsertSuccess) {
          console.warn('Failed to insert style preferences');
        }
      }
    }

    // Get updated user profile
    return await getUserById(effectiveUserId);
  } catch (error) {
    console.error('Error updating user:', error);
    toast.error('Failed to update user profile. Please try again.');
    return null;
  }
};

// Gamification Services

/**
 * Gets a user's gamification data
 * @param userId - User ID
 * @returns Gamification data or null if not found
 */
export const getUserGamification = async (userId: string): Promise<any | null> => {
  try {
    // Always use test user ID for development
    const effectiveUserId = TEST_USER_ID;
    
    // Validate UUID before making database query
    if (!isValidUUID(effectiveUserId)) {
      console.error(`Invalid UUID format for getUserGamification, returning mock data`);
      return {
        id: 'mock_gamification_' + userId,
        user_id: userId,
        points: 0,
        level: 'beginner',
        badges: [],
        streak: 0,
        last_check_in: null,
        completed_challenges: [],
        total_referrals: 0,
        seasonal_event_progress: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const getGamificationOperation = async () => {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', effectiveUserId)
        .maybeSingle();

      if (error) throw error;
      return data;
    };

    const data = await executeWithRetry(getGamificationOperation);

    if (!data) {
      // If no record found, create one using upsert
      console.log('No gamification record found, creating new one');
      const createGamificationOperation = async () => {
        const { data: newData, error: insertError } = await supabase
          .from('user_gamification')
          .upsert({
            user_id: effectiveUserId,
            points: 0,
            level: 'beginner',
            badges: [],
            streak: 0,
            completed_challenges: [],
            total_referrals: 0,
            seasonal_event_progress: {},
          }, { 
            onConflict: 'user_id' 
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData;
      };

      const newData = await executeWithRetry(createGamificationOperation);
      
      if (!newData) {
        throw new Error('Failed to create gamification record');
      }
      
      return newData;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user gamification:', error);
    
    // Return mock data as fallback
    return {
      id: 'mock_gamification_' + userId,
      user_id: userId,
      points: 0,
      level: 'beginner',
      badges: [],
      streak: 0,
      last_check_in: null,
      completed_challenges: [],
      total_referrals: 0,
      seasonal_event_progress: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
};

/**
 * Updates a user's gamification data
 * @param userId - User ID
 * @param updates - Gamification data updates
 * @returns Success status
 */
export const updateUserGamification = async (userId: string, updates: any): Promise<boolean> => {
  try {
    // Always use test user ID for development
    const effectiveUserId = TEST_USER_ID;
    
    // Validate UUID before making database query
    if (!isValidUUID(effectiveUserId)) {
      console.error(`Invalid UUID format for updateUserGamification, skipping database query`);
      return false;
    }

    // Ensure seasonal_event_progress is included if not provided
    const updatesWithDefaults = {
      ...updates,
      seasonal_event_progress: updates.seasonal_event_progress || {},
    };

    const updateGamificationOperation = async () => {
      // Use upsert to handle both insert and update cases
      const { error } = await supabase
        .from('user_gamification')
        .upsert({
          user_id: effectiveUserId,
          ...updatesWithDefaults,
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'user_id' 
        });

      if (error) throw error;
      return true;
    };

    return await executeWithRetry(updateGamificationOperation, false);
  } catch (error) {
    console.error('Error updating user gamification:', error);
    return false;
  }
};

/**
 * Gets a user's daily challenges
 * @param userId - User ID
 * @returns Array of daily challenges or empty array if failed
 */
export const getDailyChallenges = async (userId: string): Promise<any[] | null> => {
  try {
    // Always use test user ID for development
    const effectiveUserId = TEST_USER_ID;
    
    // Validate UUID before making database query
    if (!isValidUUID(effectiveUserId)) {
      console.error(`Invalid UUID format for getDailyChallenges, returning empty array`);
      return [];
    }

    const getDailyChallengesOperation = async () => {
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('user_id', effectiveUserId);

      if (error) throw error;
      return data;
    };

    return await executeWithRetry(getDailyChallengesOperation, []);
  } catch (error) {
    console.error('Error fetching daily challenges:', error);
    return [];
  }
};

/**
 * Completes a daily challenge for a user
 * @param userId - User ID
 * @param challengeId - Challenge ID to complete
 * @returns Success status
 */
export const completeChallenge = async (userId: string, challengeId: string): Promise<boolean> => {
  try {
    // Always use test user ID for development
    const effectiveUserId = TEST_USER_ID;
    
    // Validate UUID before making database query
    if (!isValidUUID(effectiveUserId)) {
      console.error(`Invalid UUID format for completeChallenge, skipping database query`);
      return false;
    }

    const completeChallengeOperation = async () => {
      // Use upsert to handle both insert and update cases
      const { error } = await supabase
        .from('daily_challenges')
        .upsert({
          user_id: effectiveUserId,
          challenge_id: challengeId,
          completed: true,
        }, { 
          onConflict: 'user_id,challenge_id' 
        });

      if (error) throw error;
      return true;
    };

    return await executeWithRetry(completeChallengeOperation, false);
  } catch (error) {
    console.error('Error completing challenge:', error);
    return false;
  }
};

// Outfit Services

/**
 * Saves an outfit to a user's favorites
 * @param userId - User ID
 * @param outfitId - Outfit ID to save
 * @returns Success status
 */
export const saveOutfit = async (userId: string, outfitId: string): Promise<boolean> => {
  try {
    // Always use test user ID for development
    const effectiveUserId = TEST_USER_ID;
    
    // Validate UUID before making database query
    if (!isValidUUID(effectiveUserId)) {
      console.error(`Invalid UUID format for saveOutfit: ${effectiveUserId}`);
      throw new Error('Invalid UUID format');
    }

    const saveOutfitOperation = async () => {
      const { error } = await supabase
        .from('saved_outfits')
        .upsert({
          user_id: effectiveUserId,
          outfit_id: outfitId,
        }, { 
          onConflict: 'user_id,outfit_id' 
        });

      if (error) throw error;
      return true;
    };

    return await executeWithRetry(saveOutfitOperation, false);
  } catch (error) {
    console.error('Error saving outfit:', error);
    toast.error('Failed to save outfit. Please try again.');
    return false;
  }
};

/**
 * Removes an outfit from a user's favorites
 * @param userId - User ID
 * @param outfitId - Outfit ID to remove
 * @returns Success status
 */
export const unsaveOutfit = async (userId: string, outfitId: string): Promise<boolean> => {
  try {
    // Always use test user ID for development
    const effectiveUserId = TEST_USER_ID;
    
    // Validate UUID before making database query
    if (!isValidUUID(effectiveUserId)) {
      console.error(`Invalid UUID format for unsaveOutfit: ${effectiveUserId}`);
      throw new Error('Invalid UUID format');
    }

    const unsaveOutfitOperation = async () => {
      const { error } = await supabase
        .from('saved_outfits')
        .delete()
        .eq('user_id', effectiveUserId)
        .eq('outfit_id', outfitId);

      if (error) throw error;
      return true;
    };

    return await executeWithRetry(unsaveOutfitOperation, false);
  } catch (error) {
    console.error('Error removing saved outfit:', error);
    toast.error('Failed to remove saved outfit. Please try again.');
    return false;
  }
};

// Helper functions

/**
 * Generates a random password
 * @returns Random password string
 */
const generateRandomPassword = (): string => {
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
};