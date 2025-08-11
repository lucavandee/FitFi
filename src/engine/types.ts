import { UserProfile } from '../context/UserContext';

/**
 * Product interface representing a clothing item
 */
export interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  type?: string;
  category?: string; // Added explicit category field
  styleTags?: string[];
  description?: string;
  price?: number;
  brand?: string;
  affiliateUrl?: string;
  matchScore?: number;
  season?: string[]; // Season property
}

/**
 * Style preferences for a user
 */
export interface StylePreferences {
  casual: number;
  formal: number;
  sporty: number;
  vintage: number;
  minimalist: number;
  [key: string]: number;
}

/**
 * Outfit interface representing a complete outfit
 */
export interface Outfit {
  id: string;
  title: string;
  description: string;
  archetype: string;
  secondaryArchetype?: string; // Added secondary archetype
  mixFactor?: number; // Added mix factor between archetypes
  occasion: string;
  products: Product[];
  imageUrl?: string;
  tags: string[];
  matchPercentage: number;
  explanation: string;
  season?: Season; // Season property (now using the Season type)
  structure?: string[]; // Added structure property to track outfit composition
  weather?: Weather; // Weather property
  categoryRatio?: CategoryRatio; // Added category ratio
  completeness?: number; // Added completeness score (0-100)
  novaExplanation?: string; // Nova's personalized explanation
}

/**
 * Season type
 */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/**
 * Weather type
 */
export type Weather = 'cold' | 'mild' | 'warm' | 'hot' | 'rainy' | 'snowy' | 'windy';

/**
 * Product category types for outfit composition
 */
export enum ProductCategory {
  TOP = 'top',
  BOTTOM = 'bottom',
  FOOTWEAR = 'footwear',
  ACCESSORY = 'accessory',
  OUTERWEAR = 'outerwear',
  DRESS = 'dress',
  JUMPSUIT = 'jumpsuit',
  OTHER = 'other'
}

/**
 * Category ratio for outfit balance
 */
export interface CategoryRatio {
  top: number;
  bottom: number;
  footwear: number;
  accessory: number;
  outerwear: number;
  dress: number;
  jumpsuit: number;
  other: number;
}

/**
 * Variation level for outfit generation
 */
export type VariationLevel = 'low' | 'medium' | 'high';

/**
 * Options for generating outfits
 */
export interface OutfitGenerationOptions {
  excludeIds?: string[]; // IDs of outfits to exclude from generation
  preferredOccasions?: string[]; // Preferred occasions to prioritize
  preferredSeasons?: Season[]; // Preferred seasons to prioritize
  weather?: Weather; // Current or preferred weather
  maxAttempts?: number; // Maximum number of attempts to generate a unique outfit
  variationLevel?: VariationLevel; // Level of variation between outfits
  enforceCompletion?: boolean; // Whether to strictly enforce outfit completion
  minCompleteness?: number; // Minimum completeness score (0-100)
}

/**
 * User archetype profile interface
 */
export interface UserArchetypeProfile {
  primaryArchetype: string;
  secondaryArchetype: string;
  mixFactor: number; // 0-1 value indicating how much the secondary archetype influences
  archetypeScores: ArchetypeScoreResult[];
}

/**
 * Archetype score result interface
 */
interface ArchetypeScoreResult {
  archetype: string;
  score: number;
}

/**
 * Extended user profile with season and weather preferences
 */
export interface ExtendedUserProfile extends UserProfile {
  preferredSeason?: Season;
  preferredWeather?: Weather;
  location?: string; // For future weather API integration
}

/**
 * Re-export UserProfile from UserContext
 * This allows other modules to import all types from one place
 */
export type { UserProfile };