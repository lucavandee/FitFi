import { UserProfile } from '../context/UserContext';

/**
 * Product interface representing a clothing item
 */
export interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  type?: string;
  styleTags?: string[];
  description?: string;
  price?: number;
  brand?: string;
  affiliateUrl?: string;
  matchScore?: number;
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
  occasion: string;
  products: Product[];
  imageUrl?: string;
  tags: string[];
  matchPercentage: number;
  explanation: string;
}

/**
 * Re-export UserProfile from UserContext
 * This allows other modules to import all types from one place
 */
export type { UserProfile };