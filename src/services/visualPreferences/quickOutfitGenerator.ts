import type { SwipePattern } from './swipeAnalyzer';

export interface QuickOutfitItem {
  id: string;
  category: 'top' | 'bottom' | 'footwear' | 'accessory';
  name: string;
  imageUrl: string;
  color: string;
  style: string;
}

export interface QuickOutfit {
  top?: QuickOutfitItem;
  bottom?: QuickOutfitItem;
  footwear?: QuickOutfitItem;
  confidence: number;
  styleDescription: string;
}

const STYLE_OUTFITS: Record<string, {
  top: Partial<QuickOutfitItem>;
  bottom: Partial<QuickOutfitItem>;
  footwear: Partial<QuickOutfitItem>;
  description: string;
}> = {
  minimal: {
    top: {
      category: 'top',
      name: 'Wit basic T-shirt',
      color: '#FFFFFF',
      style: 'minimal'
    },
    bottom: {
      category: 'bottom',
      name: 'Zwarte slim jeans',
      color: '#000000',
      style: 'minimal'
    },
    footwear: {
      category: 'footwear',
      name: 'Witte sneakers',
      color: '#FFFFFF',
      style: 'minimal'
    },
    description: 'Strak minimalistische look'
  },
  classic: {
    top: {
      category: 'top',
      name: 'Oxford overhemd',
      color: '#E8E8E8',
      style: 'classic'
    },
    bottom: {
      category: 'bottom',
      name: 'Chino broek',
      color: '#8B7355',
      style: 'classic'
    },
    footwear: {
      category: 'footwear',
      name: 'Leren loafers',
      color: '#5D4037',
      style: 'classic'
    },
    description: 'Tijdloze klassieke stijl'
  },
  romantic: {
    top: {
      category: 'top',
      name: 'Zijden blouse',
      color: '#FFB6C1',
      style: 'romantic'
    },
    bottom: {
      category: 'bottom',
      name: 'Midi rok',
      color: '#F5DEB3',
      style: 'romantic'
    },
    footwear: {
      category: 'footwear',
      name: 'Elegante pumps',
      color: '#D2B48C',
      style: 'romantic'
    },
    description: 'Zachte romantische uitstraling'
  },
  bohemian: {
    top: {
      category: 'top',
      name: 'Geborduurd vest',
      color: '#D2691E',
      style: 'bohemian'
    },
    bottom: {
      category: 'bottom',
      name: 'Wide-leg broek',
      color: '#8B7355',
      style: 'bohemian'
    },
    footwear: {
      category: 'footwear',
      name: 'Suède laarzen',
      color: '#A0522D',
      style: 'bohemian'
    },
    description: 'Vrije bohemian vibes'
  },
  bold: {
    top: {
      category: 'top',
      name: 'Statement blazer',
      color: '#DC143C',
      style: 'bold'
    },
    bottom: {
      category: 'bottom',
      name: 'Zwarte broek',
      color: '#000000',
      style: 'bold'
    },
    footwear: {
      category: 'footwear',
      name: 'Chunky boots',
      color: '#000000',
      style: 'bold'
    },
    description: 'Gedurfde statement look'
  },
  urban: {
    top: {
      category: 'top',
      name: 'Hoodie',
      color: '#808080',
      style: 'urban'
    },
    bottom: {
      category: 'bottom',
      name: 'Cargo broek',
      color: '#2F4F4F',
      style: 'urban'
    },
    footwear: {
      category: 'footwear',
      name: 'High-top sneakers',
      color: '#000000',
      style: 'urban'
    },
    description: 'Urban streetstyle'
  },
  sporty: {
    top: {
      category: 'top',
      name: 'Sport T-shirt',
      color: '#00CED1',
      style: 'sporty'
    },
    bottom: {
      category: 'bottom',
      name: 'Joggingbroek',
      color: '#2F4F4F',
      style: 'sporty'
    },
    footwear: {
      category: 'footwear',
      name: 'Running shoes',
      color: '#FFFFFF',
      style: 'sporty'
    },
    description: 'Sportieve comfort'
  },
  refined: {
    top: {
      category: 'top',
      name: 'Gestructureerde blouse',
      color: '#F5F5DC',
      style: 'refined'
    },
    bottom: {
      category: 'bottom',
      name: 'Tailored broek',
      color: '#2C3E50',
      style: 'refined'
    },
    footwear: {
      category: 'footwear',
      name: 'Elegante pumps',
      color: '#000000',
      style: 'refined'
    },
    description: 'Verfijnde elegantie'
  },
  relaxed: {
    top: {
      category: 'top',
      name: 'Oversized sweater',
      color: '#87CEEB',
      style: 'relaxed'
    },
    bottom: {
      category: 'bottom',
      name: 'Comfy jeans',
      color: '#4682B4',
      style: 'relaxed'
    },
    footwear: {
      category: 'footwear',
      name: 'Canvas sneakers',
      color: '#FFFFFF',
      style: 'relaxed'
    },
    description: 'Relaxte casual vibe'
  },
  professional: {
    top: {
      category: 'top',
      name: 'Tailored blazer',
      color: '#2C3E50',
      style: 'professional'
    },
    bottom: {
      category: 'bottom',
      name: 'Pencil rok',
      color: '#34495E',
      style: 'professional'
    },
    footwear: {
      category: 'footwear',
      name: 'Klassieke pumps',
      color: '#000000',
      style: 'professional'
    },
    description: 'Professionele elegantie'
  }
};

export function generateQuickOutfit(pattern: SwipePattern): QuickOutfit | null {
  if (!pattern.topArchetypes || pattern.topArchetypes.length === 0) {
    return null;
  }

  const topArchetype = pattern.topArchetypes[0];
  const outfitTemplate = STYLE_OUTFITS[topArchetype];

  if (!outfitTemplate) {
    return null;
  }

  const outfit: QuickOutfit = {
    top: {
      id: `quick-top-${topArchetype}`,
      category: 'top',
      name: outfitTemplate.top.name || 'Top',
      imageUrl: '/images/fallbacks/top.jpg',
      color: outfitTemplate.top.color || '#000000',
      style: topArchetype
    },
    bottom: {
      id: `quick-bottom-${topArchetype}`,
      category: 'bottom',
      name: outfitTemplate.bottom.name || 'Bottom',
      imageUrl: '/images/fallbacks/bottom.jpg',
      color: outfitTemplate.bottom.color || '#000000',
      style: topArchetype
    },
    footwear: {
      id: `quick-footwear-${topArchetype}`,
      category: 'footwear',
      name: outfitTemplate.footwear.name || 'Footwear',
      imageUrl: '/images/fallbacks/footwear.jpg',
      color: outfitTemplate.footwear.color || '#000000',
      style: topArchetype
    },
    confidence: pattern.confidence || 0.5,
    styleDescription: outfitTemplate.description
  };

  return outfit;
}

export function getStyleEmoji(archetype: string): string {
  const emojis: Record<string, string> = {
    minimal: '⚪',
    classic: '👔',
    romantic: '🌸',
    bohemian: '🌿',
    bold: '⚡',
    urban: '🏙️',
    sporty: '⚽',
    refined: '✨',
    relaxed: '😌',
    professional: '💼'
  };

  return emojis[archetype] || '👗';
}
