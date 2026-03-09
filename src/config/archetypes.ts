export type ArchetypeKey =
  | 'MINIMALIST'
  | 'CLASSIC'
  | 'SMART_CASUAL'
  | 'STREETWEAR'
  | 'ATHLETIC'
  | 'AVANT_GARDE';

export type ArchetypeDescriptor = {
  key: ArchetypeKey;
  label: string;
  paletteHints: string[];    // globale kleurtrefwoorden
  silhouettes: string[];     // bv. 'slim', 'boxy', 'relaxed'
  materials: string[];       // bv. 'katoen', 'wol', 'tech', 'leer'
  formality: number;         // 0-100: casual -> formeel
  vibe: string[];            // beschrijvende woorden
  staples: string[];         // kenmerkende items
};

export const ARCHETYPES: Record<ArchetypeKey, ArchetypeDescriptor> = {
  MINIMALIST: {
    key: 'MINIMALIST',
    label: 'Minimalist',
    paletteHints: ['zwart', 'wit', 'grijs', 'navy', 'camel', 'charcoal', 'monochrome'],
    silhouettes: ['slim', 'straight', 'clean', 'tailored'],
    materials: ['katoen', 'wol', 'merino', 'leer', 'kasjmier', 'linnen', 'viscose'],
    formality: 60,
    vibe: ['clean', 'tijdloos', 'architectural'],
    staples: ['witte sneaker', 'effen t-shirt', 'tailored chino', 'wol blazer'],
  },
  CLASSIC: {
    key: 'CLASSIC',
    label: 'Classic',
    paletteHints: ['navy', 'camel', 'wit', 'denim', 'bruin', 'grijs', 'aardetinten'],
    silhouettes: ['straight', 'tailored', 'slim'],
    materials: ['katoen', 'wol', 'denim', 'leer', 'linnen', 'kasjmier', 'zijde'],
    formality: 70,
    vibe: ['tijdloos', 'verzorgd', 'preppy'],
    staples: ['oxford shirt', 'trenchcoat', 'penny loafers', 'indigo denim'],
  },
  SMART_CASUAL: {
    key: 'SMART_CASUAL',
    label: 'Smart Casual',
    paletteHints: ['aardetinten', 'navy', 'wit', 'camel', 'grijs', 'bruin', 'groen'],
    silhouettes: ['relaxed', 'tailored', 'straight'],
    materials: ['katoen', 'linnen', 'leer', 'wol', 'denim', 'viscose'],
    formality: 50,
    vibe: ['toegankelijk', 'gepolijst'],
    staples: ['linnen overhemd', 'chino', 'suède loafer', 'overshirt'],
  },
  STREETWEAR: {
    key: 'STREETWEAR',
    label: 'Streetwear',
    paletteHints: ['zwart', 'contrast', 'wit', 'grijs', 'aardetinten', 'monochrome'],
    silhouettes: ['relaxed', 'oversized', 'straight', 'cropped'],
    materials: ['denim', 'canvas', 'katoen', 'ribstof', 'fleece', 'coated', 'leer'],
    formality: 20,
    vibe: ['expressief', 'urban', 'statement'],
    staples: ['hoodie', 'wide-leg jeans', 'high-top sneaker', 'cap', 'cargo', 'bomber'],
  },
  ATHLETIC: {
    key: 'ATHLETIC',
    label: 'Athletic',
    paletteHints: ['zwart', 'grijs', 'wit', 'navy', 'monochrome'],
    silhouettes: ['slim', 'relaxed', 'straight'],
    materials: ['tech', 'stretch', 'mesh', 'fleece', 'katoen'],
    formality: 10,
    vibe: ['functioneel', 'clean', 'performance'],
    staples: ['tech tee', 'track pants', 'running sneaker', 'shell jacket'],
  },
  AVANT_GARDE: {
    key: 'AVANT_GARDE',
    label: 'Avant-Garde',
    paletteHints: ['zwart', 'charcoal', 'grijs', 'monochrome', 'contrast'],
    silhouettes: ['oversized', 'draped', 'cropped', 'longline'],
    materials: ['wol', 'leer', 'coated', 'tech', 'viscose', 'zijde'],
    formality: 40,
    vibe: ['conceptual', 'edge', 'statement'],
    staples: ['asym trui', 'coated denim', 'chunky boot', 'drape coat'],
  },
};

export const DEFAULT_ARCHETYPE_MIX: Partial<Record<ArchetypeKey, number>> = {
  MINIMALIST: 0.7,
  SMART_CASUAL: 0.3,
};