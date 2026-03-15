/**
 * Centralized Dutch display name mappings for user-facing text.
 * Use these instead of raw English archetype keys or labels.
 */

/** Dutch display names for archetype keys/labels */
const ARCHETYPE_DISPLAY_NL: Record<string, string> = {
  minimalist: 'Minimalistisch',
  'clean minimal': 'Minimalistisch',
  classic: 'Klassiek',
  'classic soft': 'Klassiek',
  'smart casual': 'Smart Casual',
  smart_casual: 'Smart Casual',
  streetwear: 'Streetwear',
  athletic: 'Sportief',
  'sporty sharp': 'Sportief',
  'avant-garde': 'Avant-Garde',
  'avant garde': 'Avant-Garde',
  avant_garde: 'Avant-Garde',
};

/** Dutch display names for fit values */
const FIT_DISPLAY_NL: Record<string, string> = {
  slim: 'Slim fit',
  relaxed: 'Relaxed fit',
  regular: 'Regular fit',
  oversized: 'Oversized',
  tailored: 'Tailored fit',
};

/**
 * Convert any archetype name/key to its Dutch display name.
 * Falls back to the original value if no mapping is found.
 */
export function getArchetypeDisplayNL(name: string): string {
  return ARCHETYPE_DISPLAY_NL[name.toLowerCase().trim()] || name;
}

/**
 * Convert a fit value to its Dutch display name.
 */
export function getFitDisplayNL(fit: string): string {
  return FIT_DISPLAY_NL[fit.toLowerCase().trim()] || fit;
}
