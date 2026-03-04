import type { ArchetypeKey } from '@/config/archetypes';

export type ArchetypeWeights = Partial<Record<ArchetypeKey, number>>;

export type ProductLike = {
  id: string;
  title: string;
  brand?: string;
  category?: string;
  colorTags?: string[];
  materialTags?: string[];
  silhouetteTags?: string[];
  formality?: number;
  seasonTags?: string[];
  image?: string;
  price?: number;
  style?: string;
};

export type FusionScoreDetail = {
  totalScore: number;            // 0..1
  byArchetype: Record<string, number>; // key->0..1 bijdrage
  matchedSignals: string[];      // tokens die matchten
};

export type OutfitExplain = {
  headline: string;
  rationale: string[];
  archetypeBlend: string; // "70% Minimalist + 30% Streetwear"
  signals: string[];      // bijv. "clean silhouette", "zwart-wit", "wol"
};