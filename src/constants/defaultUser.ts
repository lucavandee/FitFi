import { UserProfile } from '../context/UserContext';

/**
 * Default user profile to use as fallback when user data is missing
 */
export const defaultUser: Partial<UserProfile> = {
  id: 'default-user',
  name: 'Stijlzoeker',
  email: 'anoniem@fitfi.ai',
  gender: 'female', // Default to female instead of neutral
  stylePreferences: {
    casual: 3,
    formal: 3,
    sporty: 3,
    vintage: 3,
    minimalist: 3,
  },
  isPremium: false,
  savedRecommendations: [],
};

/**
 * Default user data for onboarding
 */
export const defaultOnboardingData = {
  gender: 'vrouw', // Default to female in Dutch
  name: '',
  archetypes: ['casual_chic'],
  season: 'herfst',
  occasions: ['Casual'],
  preferences: {
    tops: true,
    bottoms: true,
    outerwear: true,
    shoes: true,
    accessories: true
  }
};

export default defaultUser;