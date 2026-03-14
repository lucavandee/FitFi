/**
 * Color Palettes - 2025 Wearable Color Trends
 *
 * Purpose: Practical, trend-aligned colors that people actually wear
 * Based on: Quiet luxury, dopamine minimalism, timeless sophistication
 *
 * Structure:
 * - HEX codes (for visual display)
 * - Dutch names (for store identification)
 * - Categories (basis, accent, neutraal)
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
// 2025 SEASONAL COLOR PALETTES
// Wearable, sophisticated, trend-aligned
// ==========================================

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  winter: {
    season: 'Winter',
    description: 'Heldere, koele kleuren met hoog contrast. Sophisticated en tijdloos.',
    colors: [
      // Basis kleuren - Classic & Wearable
      { hex: '#FFFFFF', name: 'Zuiver wit', category: 'basis' },
      { hex: '#000000', name: 'Zwart', category: 'basis' },
      { hex: '#1C2833', name: 'Navy', category: 'basis' },
      { hex: '#34495E', name: 'Donkerblauw', category: 'basis' },

      // Accent kleuren - 2025 Wearable
      { hex: '#6A1B4D', name: 'Bourgogne', category: 'accent' },
      { hex: '#1E8449', name: 'Smaragdgroen', category: 'accent' },
      { hex: '#154360', name: 'Sapphire', category: 'accent' },
      { hex: '#0E6655', name: 'Petrol', category: 'accent' },
      { hex: '#943126', name: 'Diep rood', category: 'accent' },
      { hex: '#117A65', name: 'Bosgroen', category: 'accent' },
      { hex: '#512E5F', name: 'Aubergine', category: 'accent' },

      // Neutrale tinten
      { hex: '#95A5A6', name: 'Zilvergrijs', category: 'neutraal' },
      { hex: '#AAB7B8', name: 'Lichtgrijs', category: 'neutraal' },
      { hex: '#F8F9F9', name: 'Gebroken wit', category: 'neutraal' }
    ],
    doColors: [
      { hex: '#FFFFFF', name: 'Zuiver wit', category: 'basis' },
      { hex: '#000000', name: 'Zwart', category: 'basis' },
      { hex: '#1C2833', name: 'Navy', category: 'basis' },
      { hex: '#6A1B4D', name: 'Bourgogne', category: 'accent' },
      { hex: '#1E8449', name: 'Smaragdgroen', category: 'accent' },
      { hex: '#95A5A6', name: 'Zilvergrijs', category: 'neutraal' }
    ],
    dontColors: [
      { hex: '#D4A574', name: 'Camel', description: 'Te warm', category: 'basis' },
      { hex: '#E67E22', name: 'Oranje', description: 'Te warm', category: 'accent' },
      { hex: '#7D6608', name: 'Mosterd', description: 'Te warm', category: 'accent' },
      { hex: '#D4AC0D', name: 'Goud', description: 'Te warm', category: 'accent' }
    ]
  },

  zomer: {
    season: 'Zomer',
    description: 'Zachte, gedempte kleuren met koele ondertoon. Elegant en verfijnd.',
    colors: [
      // Basis kleuren - Soft & Sophisticated
      { hex: '#FDFEFE', name: 'Soft white', category: 'basis' },
      { hex: '#ECF0F1', name: 'Lichtgrijs', category: 'basis' },
      { hex: '#85929E', name: 'Grijs-blauw', category: 'basis' },
      { hex: '#5D6D7E', name: 'Slate', category: 'basis' },

      // Accent kleuren - Muted & Wearable
      { hex: '#AEB6BF', name: 'Duifgrijs', category: 'accent' },
      { hex: '#85C1E2', name: 'Soft blauw', category: 'accent' },
      { hex: '#B7B7B7', name: 'Medium grijs', category: 'accent' },
      { hex: '#7B8A8B', name: 'Eucalyptus', category: 'accent' },
      { hex: '#A3B1C1', name: 'Zachte lavendel', category: 'accent' },
      { hex: '#9BA3A8', name: 'Silver sage', category: 'accent' },
      { hex: '#C3B1C0', name: 'Dusty mauve', category: 'accent' },

      // Neutrale tinten
      { hex: '#D5D8DC', name: 'Pearl grey', category: 'neutraal' },
      { hex: '#E5E8E8', name: 'Cloud', category: 'neutraal' },
      { hex: '#BDC3C7', name: 'Silver', category: 'neutraal' }
    ],
    doColors: [
      { hex: '#85C1E2', name: 'Soft blauw', category: 'accent' },
      { hex: '#7B8A8B', name: 'Eucalyptus', category: 'accent' },
      { hex: '#A3B1C1', name: 'Zachte lavendel', category: 'accent' },
      { hex: '#FDFEFE', name: 'Soft white', category: 'basis' },
      { hex: '#D5D8DC', name: 'Pearl grey', category: 'neutraal' },
      { hex: '#85929E', name: 'Grijs-blauw', category: 'basis' }
    ],
    dontColors: [
      { hex: '#000000', name: 'Zwart', description: 'Te hard', category: 'basis' },
      { hex: '#CB4335', name: 'Felrood', description: 'Te fel', category: 'accent' },
      { hex: '#D68910', name: 'Oranje', description: 'Te warm', category: 'accent' },
      { hex: '#6E2C00', name: 'Bruin', description: 'Te aards', category: 'basis' }
    ]
  },

  herfst: {
    season: 'Herfst',
    description: 'Warme, aardse tinten met rijke diepte. Quiet luxury voor 2025.',
    colors: [
      // Basis kleuren - Quiet Luxury
      { hex: '#FAF0E6', name: 'Ivory', category: 'basis' },
      { hex: '#D4A373', name: 'Camel', category: 'basis' },
      { hex: '#4E342E', name: 'Chocolade', category: 'basis' },
      { hex: '#5D4037', name: 'Espresso', category: 'basis' },

      // Accent kleuren - Earthy 2025 Trends
      { hex: '#A0785A', name: 'Cognac', category: 'accent' },
      { hex: '#9C7A5E', name: 'Warm taupe', category: 'accent' },
      { hex: '#C17767', name: 'Terracotta', category: 'accent' },
      { hex: '#6B8E23', name: 'Olijfgroen', category: 'accent' },
      { hex: '#8B6F47', name: 'Hazelnoot', category: 'accent' },
      { hex: '#9C8170', name: 'Warm beige', category: 'accent' },
      { hex: '#A0826D', name: 'Toffee', category: 'accent' },

      // Neutrale tinten
      { hex: '#E8DDD3', name: 'Sand', category: 'neutraal' },
      { hex: '#C9B8A9', name: 'Greige', category: 'neutraal' },
      { hex: '#AFA396', name: 'Taupe', category: 'neutraal' }
    ],
    doColors: [
      { hex: '#D4A373', name: 'Camel', category: 'basis' },
      { hex: '#A0785A', name: 'Cognac', category: 'accent' },
      { hex: '#6B8E23', name: 'Olijfgroen', category: 'accent' },
      { hex: '#C17767', name: 'Terracotta', category: 'accent' },
      { hex: '#FAF0E6', name: 'Ivory', category: 'basis' },
      { hex: '#C9B8A9', name: 'Greige', category: 'neutraal' }
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
    description: 'Heldere, warme kleuren met zachte energie. Fresh en toegankelijk.',
    colors: [
      // Basis kleuren - Warm & Approachable
      { hex: '#FFF8DC', name: 'Crème', category: 'basis' },
      { hex: '#F5F5DC', name: 'Beige', category: 'basis' },
      { hex: '#5F7A61', name: 'Sage groen', category: 'basis' },
      { hex: '#8B9D83', name: 'Warm groen', category: 'basis' },

      // Accent kleuren - Fresh 2025
      { hex: '#E08E79', name: 'Warm terracotta', category: 'accent' },
      { hex: '#D4A373', name: 'Licht camel', category: 'accent' },
      { hex: '#A3B899', name: 'Licht sage', category: 'accent' },
      { hex: '#C4A77D', name: 'Soft gold', category: 'accent' },
      { hex: '#E5B299', name: 'Peach', category: 'accent' },
      { hex: '#B4926B', name: 'Warm sand', category: 'accent' },
      { hex: '#98B4AA', name: 'Mint sage', category: 'accent' },

      // Neutrale tinten
      { hex: '#F0EAD6', name: 'Eggshell', category: 'neutraal' },
      { hex: '#E8DCC4', name: 'Warm ivory', category: 'neutraal' },
      { hex: '#D5C7B8', name: 'Linen', category: 'neutraal' }
    ],
    doColors: [
      { hex: '#E08E79', name: 'Warm terracotta', category: 'accent' },
      { hex: '#5F7A61', name: 'Sage groen', category: 'basis' },
      { hex: '#D4A373', name: 'Licht camel', category: 'accent' },
      { hex: '#C4A77D', name: 'Soft gold', category: 'accent' },
      { hex: '#FFF8DC', name: 'Crème', category: 'basis' },
      { hex: '#E8DCC4', name: 'Warm ivory', category: 'neutraal' }
    ],
    dontColors: [
      { hex: '#000000', name: 'Zwart', description: 'Te donker', category: 'basis' },
      { hex: '#1C2833', name: 'Navy', description: 'Te donker', category: 'basis' },
      { hex: '#4E342E', name: 'Donkerbruin', description: 'Te zwaar', category: 'basis' },
      { hex: '#512E5F', name: 'Paars', description: 'Te koel', category: 'accent' }
    ]
  }
};

// ==========================================
// P2.4: 12 SUB-SEIZOENSPALETTEN
// Elke seizoen krijgt 3 varianten op basis van value, contrast en chroma.
// Sub-paletten erven de basis van hun ouder-seizoen maar verschuiven accenten.
// ==========================================

export const SUB_SEASON_PALETTES: Record<string, ColorPalette> = {
  // --- LENTE VARIANTEN ---
  'licht-lente': {
    season: 'Licht Lente',
    description: 'Zachte, lichte tinten met laag contrast. Pastel en subtiel.',
    colors: [
      { hex: '#FFF8DC', name: 'Crème', category: 'basis' },
      { hex: '#F5F5DC', name: 'Beige', category: 'basis' },
      { hex: '#F0EAD6', name: 'Eggshell', category: 'basis' },
      { hex: '#E8DCC4', name: 'Warm ivory', category: 'basis' },
      { hex: '#E5B299', name: 'Peach', category: 'accent' },
      { hex: '#A3B899', name: 'Licht sage', category: 'accent' },
      { hex: '#98B4AA', name: 'Mint sage', category: 'accent' },
      { hex: '#D4A373', name: 'Licht camel', category: 'accent' },
      { hex: '#C4A77D', name: 'Soft gold', category: 'accent' },
      { hex: '#D4B5B0', name: 'Poederroze', category: 'accent' },
      { hex: '#B8C5D6', name: 'Licht lavendel', category: 'accent' },
      { hex: '#D5C7B8', name: 'Linen', category: 'neutraal' },
      { hex: '#EDE4D8', name: 'Parel', category: 'neutraal' },
      { hex: '#F5EFE6', name: 'Schelp', category: 'neutraal' },
    ],
    doColors: COLOR_PALETTES.lente.doColors,
    dontColors: [
      ...COLOR_PALETTES.lente.dontColors,
      { hex: '#C17767', name: 'Terracotta', description: 'Te sterk', category: 'accent' },
    ],
  },
  // Default variant — identiek aan parent seizoen. Wijzig hier als de standaardvariant moet afwijken.
  'warm-lente': {
    season: 'Warm Lente',
    description: 'Warme, levendige lentetinten. Goud en terracotta als accent.',
    colors: COLOR_PALETTES.lente.colors,
    doColors: COLOR_PALETTES.lente.doColors,
    dontColors: COLOR_PALETTES.lente.dontColors,
  },
  'helder-lente': {
    season: 'Helder Lente',
    description: 'Heldere, warme kleuren met hoger contrast. Levendig en fris.',
    colors: [
      { hex: '#FFF8DC', name: 'Crème', category: 'basis' },
      { hex: '#5F7A61', name: 'Sage groen', category: 'basis' },
      { hex: '#8B9D83', name: 'Warm groen', category: 'basis' },
      { hex: '#F5F5DC', name: 'Beige', category: 'basis' },
      { hex: '#E08E79', name: 'Warm terracotta', category: 'accent' },
      { hex: '#C4A77D', name: 'Soft gold', category: 'accent' },
      { hex: '#D4A373', name: 'Licht camel', category: 'accent' },
      { hex: '#B4926B', name: 'Warm sand', category: 'accent' },
      { hex: '#D48B6A', name: 'Warm koraal', category: 'accent' },
      { hex: '#7BA05B', name: 'Appelgroen', category: 'accent' },
      { hex: '#C2855A', name: 'Koper', category: 'accent' },
      { hex: '#F0EAD6', name: 'Eggshell', category: 'neutraal' },
      { hex: '#D5C7B8', name: 'Linen', category: 'neutraal' },
      { hex: '#E8DCC4', name: 'Warm ivory', category: 'neutraal' },
    ],
    doColors: [
      { hex: '#E08E79', name: 'Warm terracotta', category: 'accent' },
      { hex: '#C4A77D', name: 'Soft gold', category: 'accent' },
      { hex: '#5F7A61', name: 'Sage groen', category: 'basis' },
      { hex: '#FFF8DC', name: 'Crème', category: 'basis' },
    ],
    dontColors: COLOR_PALETTES.lente.dontColors,
  },

  // --- ZOMER VARIANTEN ---
  'licht-zomer': {
    season: 'Licht Zomer',
    description: 'Ultra-zachte, lichte koele tinten. Etherisch en verfijnd.',
    colors: [
      { hex: '#FDFEFE', name: 'Soft white', category: 'basis' },
      { hex: '#ECF0F1', name: 'Lichtgrijs', category: 'basis' },
      { hex: '#E5E8E8', name: 'Cloud', category: 'basis' },
      { hex: '#D5D8DC', name: 'Pearl grey', category: 'basis' },
      { hex: '#85C1E2', name: 'Soft blauw', category: 'accent' },
      { hex: '#A3B1C1', name: 'Zachte lavendel', category: 'accent' },
      { hex: '#C3B1C0', name: 'Dusty mauve', category: 'accent' },
      { hex: '#98B4AA', name: 'Mint', category: 'accent' },
      { hex: '#C4B7C9', name: 'Poederpaars', category: 'accent' },
      { hex: '#A8C8C8', name: 'Licht aqua', category: 'accent' },
      { hex: '#B0C4DE', name: 'Hemelsblauw', category: 'accent' },
      { hex: '#BDC3C7', name: 'Silver', category: 'neutraal' },
      { hex: '#E8E6EA', name: 'IJsparel', category: 'neutraal' },
      { hex: '#D9DDE1', name: 'Dauw', category: 'neutraal' },
    ],
    doColors: COLOR_PALETTES.zomer.doColors,
    dontColors: [
      ...COLOR_PALETTES.zomer.dontColors,
      { hex: '#4E342E', name: 'Chocolade', description: 'Te zwaar', category: 'basis' },
    ],
  },
  'koel-zomer': {
    season: 'Koel Zomer',
    description: 'Koele, gedempte tinten met wat meer diepte. Koel en elegant.',
    colors: [
      { hex: '#FDFEFE', name: 'Soft white', category: 'basis' },
      { hex: '#85929E', name: 'Grijs-blauw', category: 'basis' },
      { hex: '#5D6D7E', name: 'Slate', category: 'basis' },
      { hex: '#ECF0F1', name: 'Lichtgrijs', category: 'basis' },
      { hex: '#AEB6BF', name: 'Duifgrijs', category: 'accent' },
      { hex: '#85C1E2', name: 'Soft blauw', category: 'accent' },
      { hex: '#7B8A8B', name: 'Eucalyptus', category: 'accent' },
      { hex: '#9BA3A8', name: 'Silver sage', category: 'accent' },
      { hex: '#A3B1C1', name: 'Zachte lavendel', category: 'accent' },
      { hex: '#6E7B8B', name: 'Grafiet blauw', category: 'accent' },
      { hex: '#8D7B8A', name: 'Gedempte mauve', category: 'accent' },
      { hex: '#BDC3C7', name: 'Silver', category: 'neutraal' },
      { hex: '#D5D8DC', name: 'Pearl grey', category: 'neutraal' },
      { hex: '#E0E3E5', name: 'Mist', category: 'neutraal' },
    ],
    doColors: COLOR_PALETTES.zomer.doColors,
    dontColors: COLOR_PALETTES.zomer.dontColors,
  },
  // Default variant — identiek aan parent seizoen. Wijzig hier als de standaardvariant moet afwijken.
  'zacht-zomer': {
    season: 'Zacht Zomer',
    description: 'Zachte, gedempte tinten met laag contrast. Serene harmonie.',
    colors: COLOR_PALETTES.zomer.colors,
    doColors: COLOR_PALETTES.zomer.doColors,
    dontColors: COLOR_PALETTES.zomer.dontColors,
  },

  // --- HERFST VARIANTEN ---
  'zacht-herfst': {
    season: 'Zacht Herfst',
    description: 'Gedempte, warme herfsttinten met laag contrast. Subtle en warm.',
    colors: [
      { hex: '#FAF0E6', name: 'Ivory', category: 'basis' },
      { hex: '#D4A373', name: 'Camel', category: 'basis' },
      { hex: '#E8DDD3', name: 'Sand', category: 'basis' },
      { hex: '#C9B8A9', name: 'Greige', category: 'basis' },
      { hex: '#9C7A5E', name: 'Warm taupe', category: 'accent' },
      { hex: '#9C8170', name: 'Warm beige', category: 'accent' },
      { hex: '#A0826D', name: 'Toffee', category: 'accent' },
      { hex: '#AFA396', name: 'Taupe', category: 'accent' },
      { hex: '#8B6F47', name: 'Hazelnoot', category: 'accent' },
      { hex: '#8B8B5E', name: 'Gedempte olijf', category: 'accent' },
      { hex: '#B39387', name: 'Rozenhout', category: 'accent' },
      { hex: '#E8DDD3', name: 'Sand', category: 'neutraal' },
      { hex: '#C9B8A9', name: 'Greige', category: 'neutraal' },
      { hex: '#E0D5C8', name: 'Champagne', category: 'neutraal' },
    ],
    doColors: [
      { hex: '#D4A373', name: 'Camel', category: 'basis' },
      { hex: '#9C7A5E', name: 'Warm taupe', category: 'accent' },
      { hex: '#FAF0E6', name: 'Ivory', category: 'basis' },
      { hex: '#C9B8A9', name: 'Greige', category: 'neutraal' },
    ],
    dontColors: [
      ...COLOR_PALETTES.herfst.dontColors,
      { hex: '#943126', name: 'Diep rood', description: 'Te sterk', category: 'accent' },
    ],
  },
  // Default variant — identiek aan parent seizoen. Wijzig hier als de standaardvariant moet afwijken.
  'warm-herfst': {
    season: 'Warm Herfst',
    description: 'Warme, rijke herfsttinten. De klassieke herfstpalette.',
    colors: COLOR_PALETTES.herfst.colors,
    doColors: COLOR_PALETTES.herfst.doColors,
    dontColors: COLOR_PALETTES.herfst.dontColors,
  },
  'diep-herfst': {
    season: 'Diep Herfst',
    description: 'Diepe, warme herfsttinten met hoog contrast. Dramatisch en rijk.',
    colors: [
      { hex: '#4E342E', name: 'Chocolade', category: 'basis' },
      { hex: '#5D4037', name: 'Espresso', category: 'basis' },
      { hex: '#D4A373', name: 'Camel', category: 'basis' },
      { hex: '#FAF0E6', name: 'Ivory', category: 'basis' },
      { hex: '#A0785A', name: 'Cognac', category: 'accent' },
      { hex: '#C17767', name: 'Terracotta', category: 'accent' },
      { hex: '#6B8E23', name: 'Olijfgroen', category: 'accent' },
      { hex: '#8B4513', name: 'Saddle brown', category: 'accent' },
      { hex: '#6A1B4D', name: 'Bourgogne', category: 'accent' },
      { hex: '#556B2F', name: 'Donker olijf', category: 'accent' },
      { hex: '#7B3F61', name: 'Pruim', category: 'accent' },
      { hex: '#AFA396', name: 'Taupe', category: 'neutraal' },
      { hex: '#E8DDD3', name: 'Sand', category: 'neutraal' },
      { hex: '#C9B8A9', name: 'Greige', category: 'neutraal' },
    ],
    doColors: [
      { hex: '#4E342E', name: 'Chocolade', category: 'basis' },
      { hex: '#A0785A', name: 'Cognac', category: 'accent' },
      { hex: '#C17767', name: 'Terracotta', category: 'accent' },
      { hex: '#6B8E23', name: 'Olijfgroen', category: 'accent' },
      { hex: '#FAF0E6', name: 'Ivory', category: 'basis' },
    ],
    dontColors: COLOR_PALETTES.herfst.dontColors,
  },

  // --- WINTER VARIANTEN ---
  'koel-winter': {
    season: 'Koel Winter',
    description: 'Koele, gedempte wintertinten met gematigd contrast. Ijzig en ingetogen.',
    colors: [
      { hex: '#FFFFFF', name: 'Zuiver wit', category: 'basis' },
      { hex: '#1C2833', name: 'Navy', category: 'basis' },
      { hex: '#34495E', name: 'Donkerblauw', category: 'basis' },
      { hex: '#95A5A6', name: 'Zilvergrijs', category: 'basis' },
      { hex: '#154360', name: 'Sapphire', category: 'accent' },
      { hex: '#0E6655', name: 'Petrol', category: 'accent' },
      { hex: '#1E8449', name: 'Smaragdgroen', category: 'accent' },
      { hex: '#512E5F', name: 'Aubergine', category: 'accent' },
      { hex: '#708090', name: 'Staalgrijs', category: 'accent' },
      { hex: '#4682B4', name: 'IJsblauw', category: 'accent' },
      { hex: '#7A6F8E', name: 'Koel lavendel', category: 'accent' },
      { hex: '#AAB7B8', name: 'Lichtgrijs', category: 'neutraal' },
      { hex: '#F8F9F9', name: 'Gebroken wit', category: 'neutraal' },
      { hex: '#C8CDD0', name: 'Platina', category: 'neutraal' },
    ],
    doColors: [
      { hex: '#FFFFFF', name: 'Zuiver wit', category: 'basis' },
      { hex: '#1C2833', name: 'Navy', category: 'basis' },
      { hex: '#154360', name: 'Sapphire', category: 'accent' },
      { hex: '#0E6655', name: 'Petrol', category: 'accent' },
    ],
    dontColors: COLOR_PALETTES.winter.dontColors,
  },
  'diep-winter': {
    season: 'Diep Winter',
    description: 'Donker en dramatisch met hoog contrast. Bold en krachtig.',
    colors: [
      { hex: '#000000', name: 'Zwart', category: 'basis' },
      { hex: '#FFFFFF', name: 'Zuiver wit', category: 'basis' },
      { hex: '#1C2833', name: 'Navy', category: 'basis' },
      { hex: '#34495E', name: 'Donkerblauw', category: 'basis' },
      { hex: '#6A1B4D', name: 'Bourgogne', category: 'accent' },
      { hex: '#943126', name: 'Diep rood', category: 'accent' },
      { hex: '#117A65', name: 'Bosgroen', category: 'accent' },
      { hex: '#1E8449', name: 'Smaragdgroen', category: 'accent' },
      { hex: '#512E5F', name: 'Aubergine', category: 'accent' },
      { hex: '#154360', name: 'Sapphire', category: 'accent' },
      { hex: '#2C3E50', name: 'Middernacht', category: 'accent' },
      { hex: '#95A5A6', name: 'Zilvergrijs', category: 'neutraal' },
      { hex: '#F8F9F9', name: 'Gebroken wit', category: 'neutraal' },
      { hex: '#6C7A86', name: 'Leisteen', category: 'neutraal' },
    ],
    doColors: [
      { hex: '#000000', name: 'Zwart', category: 'basis' },
      { hex: '#FFFFFF', name: 'Zuiver wit', category: 'basis' },
      { hex: '#6A1B4D', name: 'Bourgogne', category: 'accent' },
      { hex: '#943126', name: 'Diep rood', category: 'accent' },
      { hex: '#1E8449', name: 'Smaragdgroen', category: 'accent' },
    ],
    dontColors: COLOR_PALETTES.winter.dontColors,
  },
  // Default variant — identiek aan parent seizoen. Wijzig hier als de standaardvariant moet afwijken.
  'helder-winter': {
    season: 'Helder Winter',
    description: 'Heldere, felle kleuren met hoog contrast. Levendig en opvallend.',
    colors: COLOR_PALETTES.winter.colors,
    doColors: COLOR_PALETTES.winter.doColors,
    dontColors: COLOR_PALETTES.winter.dontColors,
  },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get color palette for a season or sub-season.
 * Checks sub-season palettes first, then falls back to base season palettes.
 */
export function getColorPalette(season: string): ColorPalette | null {
  const normalizedSeason = season.toLowerCase();
  return SUB_SEASON_PALETTES[normalizedSeason] || COLOR_PALETTES[normalizedSeason] || null;
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
