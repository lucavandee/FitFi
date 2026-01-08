/**
 * Terminology Mapping - Consistent labels across marketing & results
 *
 * Purpose:
 * - Ensure terminology consistency between landing/marketing and results
 * - User recognizes terms from marketing on results page
 * - Professional presentation (not technical jargon)
 *
 * Source: FeatureBlocksV3/V4 marketing copy
 *
 * Marketing Terms Used:
 * - "Contrast & ondertoon analyse"
 * - "Seizoensgebonden kleurpalet"
 * - "Complementaire combinaties"
 * - "kleurtemperatuur"
 */

export interface StyleDNALabel {
  // Internal technical key
  technicalKey: string;

  // User-facing label (matches marketing)
  label: string;

  // Subtitle/description
  subtitle: string;

  // Value formatter
  formatValue?: (value: string) => string;
}

/**
 * Style DNA Card Labels
 *
 * Maps internal technical keys to user-friendly marketing terms
 */
export const STYLE_DNA_LABELS: Record<string, StyleDNALabel> = {
  archetype: {
    technicalKey: 'archetype',
    label: 'Jouw Stijltype',
    subtitle: 'Gebaseerd op je quizantwoorden',
    formatValue: (value: string) => value
  },

  season: {
    technicalKey: 'season',
    label: 'Seizoenstype',
    subtitle: 'Uit je visuele voorkeuren',
    formatValue: (value: string) => {
      // Capitalize first letter
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  },

  contrast: {
    technicalKey: 'contrast',
    label: 'Contrast & Ondertoon',
    subtitle: 'Hoe kleuren jou flatteren',
    formatValue: (value: string) => {
      const contrastMap: Record<string, string> = {
        'high': 'Hoog contrast',
        'medium': 'Gemiddeld contrast',
        'low': 'Laag contrast',
        'hoog': 'Hoog contrast',
        'laag': 'Laag contrast'
      };
      return contrastMap[value.toLowerCase()] || value;
    }
  },

  temperature: {
    technicalKey: 'temperature',
    label: 'Kleurtemperatuur',
    subtitle: 'Warm of koel ondertoon',
    formatValue: (value: string) => {
      const tempMap: Record<string, string> = {
        'warm': 'Warme tonen',
        'cool': 'Koele tonen',
        'neutral': 'Neutrale tonen',
        'koel': 'Koele tonen'
      };
      return tempMap[value.toLowerCase()] || value;
    }
  },

  chroma: {
    technicalKey: 'chroma',
    label: 'Kleurintensiteit',
    subtitle: 'Helder of gedempt',
    formatValue: (value: string) => {
      const chromaMap: Record<string, string> = {
        'bright': 'Heldere kleuren',
        'muted': 'Gedempte kleuren',
        'soft': 'Zachte kleuren',
        'helder': 'Heldere kleuren',
        'gedempt': 'Gedempte kleuren'
      };
      return chromaMap[value.toLowerCase()] || value;
    }
  }
};

/**
 * Color Profile Terminology
 *
 * Maps internal keys to marketing-consistent descriptions
 */
export const COLOR_PROFILE_TERMS: Record<string, string> = {
  // Season descriptions
  winter: 'Winter – hoog contrast, koele tonen',
  summer: 'Zomer – zachte tonen, gedempte pastels',
  autumn: 'Herfst – warme tonen, aardse kleuren',
  spring: 'Lente – heldere tonen, warme kleuren',

  // Temperature descriptions
  warm: 'warme ondertoon',
  cool: 'koele ondertoon',
  neutral: 'neutrale ondertoon',

  // Contrast descriptions
  high: 'hoog contrast (fel & donker)',
  medium: 'gemiddeld contrast (evenwichtig)',
  low: 'laag contrast (subtiel & harmonieus)',

  // Value descriptions
  light: 'lichte kleuren',
  medium_light: 'medium-lichte kleuren',
  medium_dark: 'medium-donkere kleuren',
  dark: 'donkere kleuren',

  // Chroma descriptions
  bright: 'heldere, verzadigde kleuren',
  soft: 'zachte, gedempte kleuren',
  muted: 'gedempte, subtiele kleuren'
};

/**
 * Get user-friendly label for style DNA attribute
 */
export function getStyleDNALabel(attribute: string): StyleDNALabel {
  return STYLE_DNA_LABELS[attribute] || {
    technicalKey: attribute,
    label: attribute.charAt(0).toUpperCase() + attribute.slice(1),
    subtitle: '',
    formatValue: (v) => v
  };
}

/**
 * Get formatted value for style DNA attribute
 */
export function formatStyleDNAValue(attribute: string, value: string): string {
  const label = STYLE_DNA_LABELS[attribute];
  if (label?.formatValue) {
    return label.formatValue(value);
  }
  return value;
}

/**
 * Get marketing-consistent description for color profile attribute
 */
export function getColorProfileDescription(key: string, value: string): string {
  const lookupKey = `${key}_${value}`.toLowerCase();
  return COLOR_PROFILE_TERMS[lookupKey] ||
         COLOR_PROFILE_TERMS[value.toLowerCase()] ||
         value;
}

/**
 * Generate complete season description matching marketing
 *
 * Example output: "Winter – hoog contrast, koele tonen"
 */
export function getSeasonDescription(
  season: string,
  contrast: string,
  temperature: string
): string {
  const seasonName = season.charAt(0).toUpperCase() + season.slice(1);
  const contrastDesc = formatStyleDNAValue('contrast', contrast).toLowerCase();
  const tempDesc = formatStyleDNAValue('temperature', temperature).toLowerCase();

  return `${seasonName} – ${contrastDesc}, ${tempDesc}`;
}

/**
 * Marketing-consistent tooltip explanations
 */
export const STYLE_DNA_TOOLTIPS: Record<string, Record<string, string>> = {
  season: {
    winter: "Jouw seizoenstype is Winter: je komt het best tot je recht in heldere, koele kleuren met hoog contrast. Denk aan fel wit, diep zwart, ijsblauw en bordeauxrood.",
    summer: "Jouw seizoenstype is Zomer: je straalt in zachte, gedempte pasteltinten met lage tot medium contrast. Denk aan lavendel, mintgroen, zachtroze en lichtgrijs.",
    autumn: "Jouw seizoenstype is Herfst: warme, aardse kleuren met diepte staan jou het beste. Denk aan caramel, olijfgroen, roestbruin en goudgeel.",
    spring: "Jouw seizoenstype is Lente: heldere, warme kleuren met medium tot hoog contrast flatteren jou. Denk aan koraalrood, appelgroen, turquoise en zonnig geel."
  },

  contrast: {
    high: "Hoog contrast betekent dat er veel verschil zit tussen de lichtste en donkerste delen van je natuurlijke kleuren. Kies outfits met duidelijke contrasten: denk aan zwart-wit, navy-wit, of donker-licht combinaties.",
    medium: "Gemiddeld contrast betekent dat je natuurlijke kleuren niet extreem verschillen. Je kunt zowel met contrast als zonder contrast werken. Mix lichte en medium tonen voor een harmonieus effect.",
    low: "Laag contrast betekent dat je natuurlijke kleuren dicht bij elkaar liggen. Kies outfits in dezelfde toonhoogte: monochrome looks of subtiele kleurverschillen staan jou het beste."
  },

  temperature: {
    warm: "Warme ondertoon betekent dat je huid goud- of perzikachtige ondertonen heeft. Kleuren met gele, oranje of rode basis flatteren jou het meest: denk aan camel, terracotta, olijfgroen en warm bruin.",
    cool: "Koele ondertoon betekent dat je huid roze of blauwe ondertonen heeft. Kleuren met blauwe of paarse basis staan jou het beste: denk aan navy, ijsblauw, bordeaux en koel grijs.",
    neutral: "Neutrale ondertoon betekent dat je zowel warme als koele kleuren kunt dragen. Je hebt veel flexibiliteit: experimenteer met verschillende kleurtemperaturen om te ontdekken wat jou het beste bevalt."
  },

  chroma: {
    bright: "Heldere kleuren (bright chroma) zijn verzadigd en intens. Je komt het best tot je recht in felle, pure kleuren met veel kracht: denk aan kobaltblauw, smaragdgroen en scharlaken rood.",
    soft: "Zachte kleuren (soft chroma) zijn licht gedempt maar niet grauw. Denk aan dusty rose, sage groen, lichtblauw en zacht lila. Deze kleuren zijn subtiel maar niet flets.",
    muted: "Gedempte kleuren (muted chroma) hebben een grijs- of beigetint. Denk aan donkergroen, aubergine, bruin-grijs en gebroken wit. Deze kleuren zijn sophisticated en tijdloos."
  }
};

/**
 * Get tooltip text for style DNA attribute/value
 */
export function getStyleDNATooltip(attribute: string, value: string): string {
  const tooltips = STYLE_DNA_TOOLTIPS[attribute];
  if (!tooltips) return '';

  const normalizedValue = value.toLowerCase();
  return tooltips[normalizedValue] || '';
}
