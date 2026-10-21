/**
 * Maps English archetype keys to Dutch archetype names
 * Used to bridge ArchetypeDetector output with recommendationEngine input
 */

import type { ArchetypeKey } from './archetypes';

export const ARCHETYPE_TO_DUTCH: Record<ArchetypeKey, string> = {
  MINIMALIST: 'minimalistisch',
  CLASSIC: 'klassiek',
  SMART_CASUAL: 'casual_chic',
  STREETWEAR: 'urban',
  ATHLETIC: 'sportief',
  AVANT_GARDE: 'avant_garde',
  BUSINESS: 'zakelijk'
};

export const DUTCH_TO_ARCHETYPE: Record<string, ArchetypeKey> = {
  minimalistisch: 'MINIMALIST',
  klassiek: 'CLASSIC',
  casual_chic: 'SMART_CASUAL',
  urban: 'STREETWEAR',
  sportief: 'ATHLETIC',
  avant_garde: 'AVANT_GARDE',
  zakelijk: 'BUSINESS'
};

/**
 * Convert English archetype to Dutch name
 */
export function archetypeToDutch(archetype: ArchetypeKey | null | undefined): string {
  if (!archetype) return 'casual_chic';
  return ARCHETYPE_TO_DUTCH[archetype] || 'casual_chic';
}

/**
 * Convert Dutch archetype name to English key
 */
export function dutchToArchetype(dutch: string | null | undefined): ArchetypeKey {
  if (!dutch) return 'SMART_CASUAL';
  return DUTCH_TO_ARCHETYPE[dutch] || 'SMART_CASUAL';
}

/**
 * Elke vorm die in style_profiles.archetype staat, naar de sleutel. Op 21
 * oktober 2026 stonden er tien vormen door elkaar: sleutels (STREETWEAR),
 * Engelse labels (Smart Casual) en de Nederlandse namen hierboven (urban,
 * minimalistisch, klassiek, zakelijk). De resultatenpagina kende alleen de
 * Engelse en viel bij de rest terug op SMART_CASUAL: 38 streetwearprofielen
 * ("urban") en 14 minimalistische zagen "Smart Casual" in hun profielblok.
 */
const ALIASSEN: Record<string, ArchetypeKey> = {
  minimalist: 'MINIMALIST',
  minimalistisch: 'MINIMALIST',
  clean_minimal: 'MINIMALIST',
  classic: 'CLASSIC',
  klassiek: 'CLASSIC',
  classic_soft: 'CLASSIC',
  smart_casual: 'SMART_CASUAL',
  casual_chic: 'SMART_CASUAL',
  streetwear: 'STREETWEAR',
  urban: 'STREETWEAR',
  athletic: 'ATHLETIC',
  sportief: 'ATHLETIC',
  sporty_sharp: 'ATHLETIC',
  avant_garde: 'AVANT_GARDE',
  business: 'BUSINESS',
  zakelijk: 'BUSINESS',
};

export function archetypeSleutelVan(naam: unknown): ArchetypeKey {
  if (typeof naam !== 'string') return 'SMART_CASUAL';
  return ALIASSEN[naam.trim().toLowerCase().replace(/[\s-]+/g, '_')] ?? 'SMART_CASUAL';
}

/** De naam die een gebruiker ziet, in het Nederlands. */
export const ARCHETYPE_WEERGAVE: Record<ArchetypeKey, string> = {
  MINIMALIST: 'Minimalistisch',
  CLASSIC: 'Klassiek',
  SMART_CASUAL: 'Smart casual',
  STREETWEAR: 'Streetwear',
  ATHLETIC: 'Sportief',
  AVANT_GARDE: 'Avant-garde',
  BUSINESS: 'Zakelijk',
};
