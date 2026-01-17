/**
 * Outfit Context & Occasion Labeling System
 *
 * Genereert contextuele labels en captions voor outfits
 * zodat gebruikers direct zien waarvoor elk outfit bedoeld is.
 */

export type OccasionCategory =
  | 'daily_casual'
  | 'work_office'
  | 'evening_smart'
  | 'weekend_relaxed'
  | 'date_night'
  | 'special_event'
  | 'sport_active'
  | 'travel_comfortable';

export interface OutfitContext {
  occasion: OccasionCategory;
  label: string; // Short label: "Dagelijks", "Kantoor", etc.
  caption: string; // Full caption: "Perfect voor een ontspannen dag"
  emoji: string; // Visual indicator
  tags: string[]; // Context tags: ["casual", "comfy", "everyday"]
}

/**
 * Mapping van occasions naar labels (NL)
 */
const OCCASION_METADATA: Record<OccasionCategory, Omit<OutfitContext, 'occasion'>> = {
  daily_casual: {
    label: 'Dagelijks',
    caption: 'Perfect voor een ontspannen dag',
    emoji: '☕',
    tags: ['casual', 'comfortabel', 'dagelijks'],
  },
  work_office: {
    label: 'Kantoor',
    caption: 'Professioneel en stijlvol op het werk',
    emoji: '💼',
    tags: ['zakelijk', 'professioneel', 'werk'],
  },
  evening_smart: {
    label: 'Avond uit',
    caption: 'Elegant voor een diner of borrel',
    emoji: '🌙',
    tags: ['elegant', 'avond', 'uitgaan'],
  },
  weekend_relaxed: {
    label: 'Weekend',
    caption: 'Relaxed en moeiteloos stijlvol',
    emoji: '🌿',
    tags: ['relaxed', 'weekend', 'vrije tijd'],
  },
  date_night: {
    label: 'Date Night',
    caption: 'Indrukwekkend en zelfverzekerd',
    emoji: '💫',
    tags: ['date', 'romantisch', 'speciaal'],
  },
  special_event: {
    label: 'Speciaal Event',
    caption: 'Voor bruiloften, feesten en gala\'s',
    emoji: '✨',
    tags: ['feestelijk', 'chic', 'event'],
  },
  sport_active: {
    label: 'Sport & Actief',
    caption: 'Functioneel en comfortabel bewegen',
    emoji: '🏃',
    tags: ['sport', 'actief', 'fitness'],
  },
  travel_comfortable: {
    label: 'Reizen',
    caption: 'Comfortabel en praktisch onderweg',
    emoji: '✈️',
    tags: ['reizen', 'comfortabel', 'praktisch'],
  },
};

/**
 * Genereer outfit context op basis van archetype en index
 * Diversificeert occasions over outfit-reeks voor variatie
 */
export function generateOutfitContext(
  archetype: string,
  outfitIndex: number,
  totalOutfits: number
): OutfitContext {
  // Archetype-specifieke occasion preferences
  const archetypePreferences = getArchetypeOccasionPreferences(archetype);

  // Cycle through occasions voor diversiteit
  const occasionIndex = outfitIndex % archetypePreferences.length;
  const occasion = archetypePreferences[occasionIndex];

  return {
    occasion,
    ...OCCASION_METADATA[occasion],
  };
}

/**
 * Bepaal welke occasions prioriteit hebben per archetype
 */
function getArchetypeOccasionPreferences(archetype: string): OccasionCategory[] {
  const archetypeLower = archetype.toLowerCase();

  // Minimalist: werk, dagelijks, avond
  if (archetypeLower.includes('minimal')) {
    return ['work_office', 'daily_casual', 'evening_smart', 'weekend_relaxed'];
  }

  // Classic: werk, speciaal, avond, dagelijks
  if (archetypeLower.includes('classic')) {
    return ['work_office', 'special_event', 'evening_smart', 'daily_casual'];
  }

  // Smart Casual: werk, weekend, avond, dagelijks
  if (archetypeLower.includes('smart') || archetypeLower.includes('casual')) {
    return ['work_office', 'weekend_relaxed', 'evening_smart', 'daily_casual'];
  }

  // Streetwear: dagelijks, weekend, avond
  if (archetypeLower.includes('street')) {
    return ['daily_casual', 'weekend_relaxed', 'evening_smart', 'date_night'];
  }

  // Athletic: sport, dagelijks, weekend
  if (archetypeLower.includes('athletic') || archetypeLower.includes('sport')) {
    return ['sport_active', 'daily_casual', 'weekend_relaxed', 'travel_comfortable'];
  }

  // Avant-garde: avond, speciaal, date, dagelijks
  if (archetypeLower.includes('avant')) {
    return ['evening_smart', 'special_event', 'date_night', 'daily_casual'];
  }

  // Romantic/Bohemian: weekend, avond, date, dagelijks
  if (archetypeLower.includes('romantic') || archetypeLower.includes('boho')) {
    return ['weekend_relaxed', 'evening_smart', 'date_night', 'daily_casual'];
  }

  // Chic: avond, werk, speciaal, date
  if (archetypeLower.includes('chic')) {
    return ['evening_smart', 'work_office', 'special_event', 'date_night'];
  }

  // Default fallback: goede mix
  return ['daily_casual', 'work_office', 'evening_smart', 'weekend_relaxed'];
}

/**
 * Genereer archetype-specifieke caption (meer gepersonaliseerd)
 */
export function generatePersonalizedCaption(
  archetype: string,
  occasion: OccasionCategory,
  outfitIndex: number
): string {
  const archetypeLower = archetype.toLowerCase();
  const baseCaption = OCCASION_METADATA[occasion].caption;

  // Voeg archetype-specifieke twist toe
  const templates: Record<OccasionCategory, string[]> = {
    daily_casual: [
      `${baseCaption} met ${archetypeLower} flair`,
      `Moeiteloos ${archetypeLower} voor elke dag`,
      `Dagelijkse ${archetypeLower} elegantie`,
    ],
    work_office: [
      `${baseCaption} in ${archetypeLower} stijl`,
      `Professioneel ${archetypeLower} met impact`,
      `Kantoorklaar ${archetypeLower} look`,
    ],
    evening_smart: [
      `${baseCaption} met ${archetypeLower} uitstraling`,
      `Avondlook met ${archetypeLower} statement`,
      `Elegant ${archetypeLower} voor speciale momenten`,
    ],
    weekend_relaxed: [
      `${baseCaption} – ${archetypeLower} comfort`,
      `Weekend ${archetypeLower} in perfecte balans`,
      `Relaxed ${archetypeLower} voor vrije tijd`,
    ],
    date_night: [
      `${baseCaption} met ${archetypeLower} charme`,
      `Romantisch ${archetypeLower} met flair`,
      `Date-ready ${archetypeLower} look`,
    ],
    special_event: [
      `${baseCaption} in ${archetypeLower} stijl`,
      `Feestelijk ${archetypeLower} met impact`,
      `Event-klaar ${archetypeLower} elegantie`,
    ],
    sport_active: [
      `${baseCaption} met ${archetypeLower} vibe`,
      `Actief ${archetypeLower} comfort`,
      `Sport-ready ${archetypeLower} functionaliteit`,
    ],
    travel_comfortable: [
      `${baseCaption} in ${archetypeLower} stijl`,
      `Reis-klaar ${archetypeLower} comfort`,
      `Travel ${archetypeLower} met gemak`,
    ],
  };

  const options = templates[occasion];
  const variantIndex = outfitIndex % options.length;
  return options[variantIndex];
}

/**
 * Genereer complete outfit description met context
 */
export function generateOutfitDescription(
  archetype: string,
  outfitIndex: number,
  totalOutfits: number
): {
  title: string;
  context: OutfitContext;
  description: string;
} {
  const context = generateOutfitContext(archetype, outfitIndex, totalOutfits);
  const personalizedCaption = generatePersonalizedCaption(archetype, context.occasion, outfitIndex);

  return {
    title: `Outfit ${outfitIndex + 1}: ${context.label}`,
    context,
    description: personalizedCaption,
  };
}

/**
 * Helper: Filter outfits op occasion
 */
export function filterOutfitsByOccasion(
  outfits: any[],
  archetype: string,
  targetOccasion?: OccasionCategory
): any[] {
  if (!targetOccasion) return outfits;

  return outfits.filter((_, idx) => {
    const context = generateOutfitContext(archetype, idx, outfits.length);
    return context.occasion === targetOccasion;
  });
}

/**
 * Helper: Get all unique occasions in outfit set
 */
export function getUniqueOccasions(
  totalOutfits: number,
  archetype: string
): OccasionCategory[] {
  const occasions = new Set<OccasionCategory>();

  for (let i = 0; i < totalOutfits; i++) {
    const context = generateOutfitContext(archetype, i, totalOutfits);
    occasions.add(context.occasion);
  }

  return Array.from(occasions);
}
