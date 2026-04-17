import type { ArchetypeKey } from '@/config/archetypes';
import type { Product, Outfit, Season } from '../types';

export type ArchetypeWeights = Partial<Record<ArchetypeKey, number>>;

export type FitKey = 'slim' | 'regular' | 'relaxed' | 'oversized';
export type PrintsKey = 'effen' | 'subtiel' | 'statement' | 'gemengd';
export type TemperatureKey = 'warm' | 'koel' | 'neutraal';
export type ValueKey = 'licht' | 'medium' | 'donker';
export type ContrastKey = 'laag' | 'medium' | 'hoog';
export type ColorSeasonKey = 'lente' | 'zomer' | 'herfst' | 'winter';
export type OccasionKey = 'work' | 'casual' | 'formal' | 'date' | 'travel' | 'sport';
export type GoalKey =
  | 'timeless'
  | 'trendy'
  | 'minimal'
  | 'express'
  | 'professional'
  | 'comfort';

export type NormalizedCategory =
  | 'top'
  | 'bottom'
  | 'footwear'
  | 'outerwear'
  | 'accessory'
  | 'dress'
  | 'jumpsuit';

export interface MoodboardProfile {
  archetypeWeights: ArchetypeWeights;
  likedColors: string[];
  likedStyles: string[];
  avoidedColors: string[];
  likeCount: number;
  totalCount: number;
  confidence: number;
}

export interface ColorPreference {
  temperature: TemperatureKey | null;
  value: ValueKey | null;
  contrast: ContrastKey | null;
  season: ColorSeasonKey | null;
  undertone: 'warm' | 'cool' | 'neutral' | null;
  preferredColors: string[];
  avoidColors: string[];
}

export interface BudgetProfile {
  perItemMax: number;
  perItemMin: number;
  totalMax?: number;
}

export interface UserStyleProfile {
  userId?: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | 'unisex';
  archetypes: ArchetypeWeights;
  primaryArchetype: ArchetypeKey;
  secondaryArchetype: ArchetypeKey | null;
  color: ColorPreference;
  fit: FitKey | null;
  prints: PrintsKey | null;
  materials: {
    preferred: string[];
    avoided: string[];
  };
  budget: BudgetProfile;
  occasions: OccasionKey[];
  goals: GoalKey[];
  sizes: {
    tops?: string;
    bottoms?: string;
    shoes?: string;
  };
  moodboard: MoodboardProfile;
  diagnostics: {
    quizArchetypes: ArchetypeWeights;
    swipeInfluence: number;
    hasMoodboard: boolean;
    hasColorAnalysis: boolean;
  };
}

export interface ScoreBreakdown {
  archetype: number;
  color: number;
  occasion: number;
  material: number;
  budget: number;
  moodboard: number;
  fit: number;
  goals: number;
  season: number;
  prints: number;
  quality: number;
}

export interface ScoredProduct {
  product: Product;
  category: NormalizedCategory;
  score: number;
  breakdown: ScoreBreakdown;
  reasons: string[];
  formality: number;
  archetypeFit: ArchetypeWeights;
  colorTags: string[];
  materialTags: string[];
  silhouetteTags: string[];
}

export interface OutfitCandidate {
  id: string;
  occasion: OccasionKey;
  targetFormality: number;
  products: ScoredProduct[];
  compositionScore: number;
  coherence: {
    colorHarmony: number;
    formalitySpread: number;
    archetypeCoherence: number;
    completeness: number;
  };
  reasons: string[];
}

export interface EngineOptions {
  count?: number;
  season?: Season;
  excludeIds?: string[];
  debug?: boolean;
}

export interface EngineResult {
  outfits: Outfit[];
  profile: UserStyleProfile;
  stats: {
    totalProducts: number;
    eligibleProducts: number;
    outfitsGenerated: number;
    outfitsReturned: number;
    occasionsCovered: OccasionKey[];
  };
}

export type { Product, Outfit, Season, ArchetypeKey };
