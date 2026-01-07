/**
 * Color Palettes - Concrete color recommendations per season/profile
 *
 * Purpose: Transform abstract color theory into practical, named colors
 * that users can identify in stores.
 *
 * Structure:
 * - HEX codes (for visual display)
 * - Dutch names (for identification)
 * - Categories (neutrals, accents, etc.)
 * - A11y compliant labels
 */

export interface ColorSwatch {
  hex: string;
  name: string;
  description?: string;
  category: 'basis' | 'accent' | 'neutraal';
}

export interface ColorPalette {
  season: string;
  description: string;
  colors: ColorSwatch[];
  doColors: ColorSwatch[];  // Recommended colors
  dontColors: ColorSwatch[]; // Colors to avoid
}

// ==========================================
// SEASONAL COLOR PALETTES
// ==========================================

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  winter: {
    season: 'Winter',
    description: 'Heldere, koele kleuren met hoog contrast. Denk aan ijskristallen en juwelen.',
    colors: [
      // Basis kleuren
      { hex: '#FFFFFF', name: 'Zuiver wit', category: 'basis' },
      { hex: '#000000', name: 'Zwart', category: 'basis' },
      { hex: '#1A1A2E', name: 'Marine', category: 'basis' },
      { hex: '#2C3E50', name: 'Donkerblauw', category: 'basis' },

      // Accent kleuren
      { hex: '#E91E63', name: 'Fuchsia', category: 'accent' },
      { hex: '#9C27B0', name: 'Amethyst', category: 'accent' },
      { hex: '#2196F3', name: 'Koningsblauw', category: 'accent' },
      { hex: '#00BCD4', name: 'Turquoise', category: 'accent' },
      { hex: '#4CAF50', name: 'Smaragdgroen', category: 'accent' },
      { hex: '#F06292', name: 'IJsroze', category: 'accent' },
      { hex: '#FF1744', name: 'Helderrood', category: 'accent' },

      // Neutrale tinten
      { hex: '#90A4AE', name: 'Zilvergrijs', category: 'neutraal' },
      { hex: '#607D8B', name: 'Staalgrijs', category: 'neutraal' },
      { hex: '#F5F5F5', name: 'Ijswit', category: 'neutraal' }
    ],
    doColors: [
      { hex: '#FFFFFF', name: 'Zuiver wit', category: 'basis' },
      { hex: '#000000', name: 'Zwart', category: 'basis' },
      { hex: '#2196F3', name: 'Koningsblauw', category: 'accent' },
      { hex: '#4CAF50', name: 'Smaragdgroen', category: 'accent' },
      { hex: '#E91E63', name: 'Fuchsia', category: 'accent' },
      { hex: '#90A4AE', name: 'Zilvergrijs', category: 'neutraal' }
    ],
    dontColors: [
      { hex: '#D4A574', name: 'Camel', description: 'Te warm', category: 'basis' },
      { hex: '#FF6F00', name: 'Oranje', description: 'Te warm', category: 'accent' },
      { hex: '#8D6E63', name: 'Bruin', description: 'Te aards', category: 'basis' },
      { hex: '#FFB74D', name: 'Goud', description: 'Te warm', category: 'accent' }
    ]
  },

  zomer: {
    season: 'Zomer',
    description: 'Zachte, gedempte kleuren met koele ondertoon. Denk aan lavendelvelden en pastels.',
    colors: [
      // Basis kleuren
      { hex: '#F8F8FF', name: 'Zacht wit', category: 'basis' },
      { hex: '#E8EAF6', name: 'Lichtgrijs', category: 'basis' },
      { hex: '#B0BEC5', name: 'Grijs-blauw', category: 'basis' },
      { hex: '#78909C', name: 'Stormblauw', category: 'basis' },

      // Accent kleuren
      { hex: '#CE93D8', name: 'Lavendel', category: 'accent' },
      { hex: '#90CAF9', name: 'Zachtblauw', category: 'accent' },
      { hex: '#F48FB1', name: 'Oudroze', category: 'accent' },
      { hex: '#80CBC4', name: 'Mintgroen', category: 'accent' },
      { hex: '#C5E1A5', name: 'Saliegroen', category: 'accent' },
      { hex: '#B39DDB', name: 'Zachtpaars', category: 'accent' },
      { hex: '#81D4FA', name: 'Babyblauw', category: 'accent' },

      // Neutrale tinten
      { hex: '#ECEFF1', name: 'Duifgrijs', category: 'neutraal' },
      { hex: '#CFD8DC', name: 'Zilvergrijs', category: 'neutraal' },
      { hex: '#E1BEE7', name: 'Lila', category: 'neutraal' }
    ],
    doColors: [
      { hex: '#CE93D8', name: 'Lavendel', category: 'accent' },
      { hex: '#90CAF9', name: 'Zachtblauw', category: 'accent' },
      { hex: '#F48FB1', name: 'Oudroze', category: 'accent' },
      { hex: '#80CBC4', name: 'Mintgroen', category: 'accent' },
      { hex: '#CFD8DC', name: 'Zilvergrijs', category: 'neutraal' },
      { hex: '#F8F8FF', name: 'Zacht wit', category: 'basis' }
    ],
    dontColors: [
      { hex: '#000000', name: 'Zwart', description: 'Te hard', category: 'basis' },
      { hex: '#FF5722', name: 'Felrood', description: 'Te fel', category: 'accent' },
      { hex: '#FF9800', name: 'Oranje', description: 'Te warm', category: 'accent' },
      { hex: '#795548', name: 'Bruin', description: 'Te aards', category: 'basis' }
    ]
  },

  herfst: {
    season: 'Herfst',
    description: 'Warme, aardse tinten met rijke diepte. Denk aan herfstbladeren en specerijen.',
    colors: [
      // Basis kleuren
      { hex: '#FFFBF0', name: 'Ivoorwit', category: 'basis' },
      { hex: '#5D4037', name: 'Chocoladebruin', category: 'basis' },
      { hex: '#6D4C41', name: 'Cognac', category: 'basis' },
      { hex: '#3E2723', name: 'Espresso', category: 'basis' },

      // Accent kleuren
      { hex: '#FF6F00', name: 'Pompoenoranje', category: 'accent' },
      { hex: '#F57F17', name: 'Mosterdgeel', category: 'accent' },
      { hex: '#827717', name: 'Olijfgroen', category: 'accent' },
      { hex: '#BF360C', name: 'Roestbruin', category: 'accent' },
      { hex: '#E65100', name: 'Terracotta', category: 'accent' },
      { hex: '#558B2F', name: 'Mosgroen', category: 'accent' },
      { hex: '#8D6E63', name: 'Karamel', category: 'accent' },

      // Neutrale tinten
      { hex: '#D7CCC8', name: 'Camel', category: 'neutraal' },
      { hex: '#A1887F', name: 'Taupe', category: 'neutraal' },
      { hex: '#BCAAA4', name: 'Zand', category: 'neutraal' }
    ],
    doColors: [
      { hex: '#D7CCC8', name: 'Camel', category: 'neutraal' },
      { hex: '#827717', name: 'Olijfgroen', category: 'accent' },
      { hex: '#6D4C41', name: 'Cognac', category: 'basis' },
      { hex: '#E65100', name: 'Terracotta', category: 'accent' },
      { hex: '#F57F17', name: 'Mosterdgeel', category: 'accent' },
      { hex: '#FFFBF0', name: 'Ivoorwit', category: 'basis' }
    ],
    dontColors: [
      { hex: '#FFFFFF', name: 'Zuiver wit', description: 'Te koel', category: 'basis' },
      { hex: '#E91E63', name: 'Fuchsia', description: 'Te koel', category: 'accent' },
      { hex: '#2196F3', name: 'IJsblauw', description: 'Te koel', category: 'accent' },
      { hex: '#000000', name: 'Zwart', description: 'Te hard', category: 'basis' }
    ]
  },

  lente: {
    season: 'Lente',
    description: 'Heldere, warme kleuren vol energie. Denk aan lentebloemen en koraalriffen.',
    colors: [
      // Basis kleuren
      { hex: '#FFF8E1', name: 'Crème', category: 'basis' },
      { hex: '#FFF3E0', name: 'Perzik', category: 'basis' },
      { hex: '#4DB6AC', name: 'Turquoise', category: 'basis' },
      { hex: '#81C784', name: 'Warm groen', category: 'basis' },

      // Accent kleuren
      { hex: '#FF7043', name: 'Koraalrood', category: 'accent' },
      { hex: '#FFD54F', name: 'Helder geel', category: 'accent' },
      { hex: '#4DD0E1', name: 'Aquamarijn', category: 'accent' },
      { hex: '#9CCC65', name: 'Lentegroen', category: 'accent' },
      { hex: '#FF8A65', name: 'Abrikoos', category: 'accent' },
      { hex: '#FFB74D', name: 'Gouden geel', category: 'accent' },
      { hex: '#AED581', name: 'Lichtgroen', category: 'accent' },

      // Neutrale tinten
      { hex: '#F0F4C3', name: 'Zachtgeel', category: 'neutraal' },
      { hex: '#DCEDC8', name: 'Mintcrème', category: 'neutraal' },
      { hex: '#FFE0B2', name: 'Zandbeige', category: 'neutraal' }
    ],
    doColors: [
      { hex: '#FF7043', name: 'Koraalrood', category: 'accent' },
      { hex: '#4DD0E1', name: 'Aquamarijn', category: 'accent' },
      { hex: '#9CCC65', name: 'Lentegroen', category: 'accent' },
      { hex: '#FFD54F', name: 'Helder geel', category: 'accent' },
      { hex: '#FFF8E1', name: 'Crème', category: 'basis' },
      { hex: '#FFE0B2', name: 'Zandbeige', category: 'neutraal' }
    ],
    dontColors: [
      { hex: '#000000', name: 'Zwart', description: 'Te donker', category: 'basis' },
      { hex: '#263238', name: 'Donkergrijs', description: 'Te donker', category: 'basis' },
      { hex: '#5D4037', name: 'Bruin', description: 'Te aards', category: 'basis' },
      { hex: '#4A148C', name: 'Paars', description: 'Te koel', category: 'accent' }
    ]
  }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get color palette for a season
 */
export function getColorPalette(season: string): ColorPalette | null {
  const normalizedSeason = season.toLowerCase();
  return COLOR_PALETTES[normalizedSeason] || null;
}

/**
 * Get color name from hex code
 */
export function getColorName(hex: string): string {
  // Search all palettes for matching hex
  for (const palette of Object.values(COLOR_PALETTES)) {
    const color = palette.colors.find(c => c.hex.toLowerCase() === hex.toLowerCase());
    if (color) return color.name;
  }
  return hex; // Fallback to hex if no name found
}

/**
 * Get accessible color description for screen readers
 */
export function getColorAriaLabel(swatch: ColorSwatch): string {
  const category = swatch.category === 'basis' ? 'Basiskleur' :
                   swatch.category === 'accent' ? 'Accentkleur' :
                   'Neutrale kleur';

  return `${category}: ${swatch.name}${swatch.description ? ` - ${swatch.description}` : ''}`;
}

/**
 * Check color contrast for accessibility (WCAG AA)
 */
export function hasGoodContrast(hex1: string, hex2: string): boolean {
  // Simplified contrast check - in production use proper WCAG algorithm
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const ratio = (Math.max(lum1, lum2) + 5) / (Math.min(lum1, lum2) + 5);

  return ratio >= 4.5; // WCAG AA standard for normal text
}

/**
 * Group colors by category
 */
export function groupColorsByCategory(colors: ColorSwatch[]): {
  basis: ColorSwatch[];
  accent: ColorSwatch[];
  neutraal: ColorSwatch[];
} {
  return {
    basis: colors.filter(c => c.category === 'basis'),
    accent: colors.filter(c => c.category === 'accent'),
    neutraal: colors.filter(c => c.category === 'neutraal')
  };
}
