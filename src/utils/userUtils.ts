import { UserProfile } from '../context/UserContext';
import { defaultUser } from '../constants/defaultUser';

/**
 * Gets a safe user object by merging the provided user with default values
 * @param user - User profile or null/undefined
 * @returns Safe user profile with fallback values for missing properties
 */
export function getSafeUser(user?: UserProfile | null): UserProfile {
  if (!user) {
    return defaultUser as UserProfile;
  }
  
  // Merge user with default values
  return {
    ...defaultUser,
    ...user,
    // Ensure stylePreferences is always defined
    stylePreferences: {
      ...defaultUser.stylePreferences,
      ...(user.stylePreferences || {})
    }
  } as UserProfile;
}

/**
 * Gets the gender of a user with fallback to default
 * @param user - User profile or null/undefined
 * @returns User gender (always 'male' or 'female', never undefined or null)
 */
export function getSafeGender(user?: UserProfile | null): 'male' | 'female' {
  return user?.gender === 'male' ? 'male' : 'female';
}

/**
 * Gets the name of a user with fallback to default
 * @param user - User profile or null/undefined
 * @returns User name or default name
 */
export function getSafeName(user?: UserProfile | null): string {
  return user?.name || defaultUser.name || 'Stijlzoeker';
}

/**
 * Gets the style preferences of a user with fallback to default
 * @param user - User profile or null/undefined
 * @returns User style preferences or default preferences
 */
export function getSafeStylePreferences(user?: UserProfile | null): UserProfile['stylePreferences'] {
  return user?.stylePreferences || defaultUser.stylePreferences || {
    casual: 3,
    formal: 3,
    sporty: 3,
    vintage: 3,
    minimalist: 3
  };
}

/**
 * Logs user data for debugging
 * @param user - User profile or null/undefined
 * @param context - Context for the log
 */
export function logUserData(user?: UserProfile | null, context: string = 'unknown'): void {
  const safeUser = getSafeUser(user);
  console.log(`[FitFi] User data (${context}):`, {
    id: safeUser.id,
    name: safeUser.name,
    gender: safeUser.gender,
    isPremium: safeUser.isPremium,
    stylePreferences: safeUser.stylePreferences
  });
}

export default {
  getSafeUser,
  getSafeGender,
  getSafeName,
  getSafeStylePreferences,
  logUserData
};