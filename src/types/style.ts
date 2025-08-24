import type { ArchetypeKey } from "@/config/archetypes";

export type ArchetypeWeights = Partial<Record<ArchetypeKey, number>>;

export type ProductLike = {
  id: string;
  title: string;
  brand?: string;
  category?: string; // top/bottom/shoes/jacket/accessory
  colorTags?: string[]; // 'zwart','navy','wit','earth','contrast'
  materialTags?: string[]; // 'katoen','wol','leer','tech','linnen',...
  silhouetteTags?: string[]; // 'slim','relaxed','boxy','tailored'
  formality?: number; // 0-100
  seasonTags?: string[]; // 'spring','summer','autumn','winter'
  image?: string;
  price?: number;
};

export type FusionScoreDetail = {
  totalScore: number; // 0..1
  byArchetype: Record<string, number>; // key->0..1 bijdrage
  matchedSignals: string[]; // tokens die matchten
};

export type OutfitExplain = {
  headline: string;
  rationale: string[];
  archetypeBlend: string; // "70% Minimalist + 30% Streetwear"
  signals: string[]; // bijv. "clean silhouette", "zwart-wit", "wol"
};
