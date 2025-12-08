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
  AVANT_GARDE: 'avant_garde'
};

export const DUTCH_TO_ARCHETYPE: Record<string, ArchetypeKey> = {
  minimalistisch: 'MINIMALIST',
  klassiek: 'CLASSIC',
  casual_chic: 'SMART_CASUAL',
  urban: 'STREETWEAR',
  sportief: 'ATHLETIC',
  avant_garde: 'AVANT_GARDE'
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
