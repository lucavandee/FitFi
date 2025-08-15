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
    paletteHints: ['neutraal', 'zwart', 'wit', 'grijs', 'navy'],
    silhouettes: ['slim', 'straight', 'clean'],
    materials: ['katoen', 'wol', 'merino', 'leer'],
    formality: 60,
    vibe: ['clean', 'tijdloos', 'architectural'],
    staples: ['witte sneaker', 'effen t-shirt', 'tailored chino', 'wol blazer'],
  },
  CLASSIC: {
    key: 'CLASSIC',
    label: 'Classic',
    paletteHints: ['navy', 'camel', 'wit', 'denim'],
    silhouettes: ['regular', 'tailored'],
    materials: ['katoen', 'wol', 'denim', 'leer'],
    formality: 70,
    vibe: ['tijdloos', 'verzorgd', 'preppy'],
    staples: ['oxford shirt', 'trenchcoat', 'penny loafers', 'indigo denim'],
  },
  SMART_CASUAL: {
    key: 'SMART_CASUAL',
    label: 'Smart Casual',
    paletteHints: ['aardetinten', 'navy', 'wit'],
    silhouettes: ['relaxed', 'tailored'],
    materials: ['katoen', 'linnen', 'suède', 'wol'],
    formality: 50,
    vibe: ['toegankelijk', 'gepolijst'],
    staples: ['linnen overhemd', 'chino', 'suède loafer', 'overshirt'],
  },
  STREETWEAR: {
    key: 'STREETWEAR',
    label: 'Streetwear',
    paletteHints: ['zwart', 'contrast', 'graphic'],
    silhouettes: ['relaxed', 'oversized', 'boxy'],
    materials: ['fleece', 'tech', 'denim', 'canvas'],
    formality: 20,
    vibe: ['expressief', 'urban', 'sportief'],
    staples: ['hoodie', 'wide-leg jeans', 'high-top sneaker', 'cap'],
  },
  ATHLETIC: {
    key: 'ATHLETIC',
    label: 'Athletic',
    paletteHints: ['monochrome', 'accentkleur'],
    silhouettes: ['slim', 'relaxed'],
    materials: ['tech', 'stretch', 'mesh'],
    formality: 10,
    vibe: ['functioneel', 'clean', 'performance'],
    staples: ['tech tee', 'track pants', 'running sneaker', 'shell jacket'],
  },
  AVANT_GARDE: {
    key: 'AVANT_GARDE',
    label: 'Avant-Garde',
    paletteHints: ['zwart', 'charcoal', 'ton-sur-ton'],
    silhouettes: ['boxy', 'draped', 'asymmetry'],
    materials: ['wol', 'leer', 'coated', 'tech'],
    formality: 40,
    vibe: ['conceptual', 'edge', 'statement'],
    staples: ['asym trui', 'coated denim', 'chunky boot', 'drape coat'],
  },
};

export const DEFAULT_ARCHETYPE_MIX: Partial<Record<ArchetypeKey, number>> = {
  MINIMALIST: 0.7,
  SMART_CASUAL: 0.3,
};