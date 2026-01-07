/**
 * Swipe Insight Extractor - Convert swipe data to actionable insights
 *
 * Purpose:
 * - Analyze visual preference swipes
 * - Extract patterns and preferences
 * - Generate human-readable insights
 * - Connect to style identity
 */

export interface SwipeData {
  photo_url: string;
  direction: 'left' | 'right';
  tags?: string[];
  category?: string;
  colors?: string[];
  patterns?: string[];
  style_notes?: string[];
}

export interface SwipeInsights {
  favoriteCategories: string[];
  preferredPatterns: string[];
  preferredColors: string[];
  styleNotes: string[];
  silhouettePreferences: string[];
  materialPreferences: string[];
}

/**
 * Analyze swipe data to extract user preferences
 */
export function extractSwipeInsights(swipes: SwipeData[]): SwipeInsights {
  // Filter only right swipes (likes)
  const likedSwipes = swipes.filter(s => s.direction === 'right');

  if (likedSwipes.length === 0) {
    return {
      favoriteCategories: [],
      preferredPatterns: [],
      preferredColors: [],
      styleNotes: [],
      silhouettePreferences: [],
      materialPreferences: []
    };
  }

  // Extract categories
  const categoryCount = new Map<string, number>();
  likedSwipes.forEach(swipe => {
    if (swipe.category) {
      categoryCount.set(swipe.category, (categoryCount.get(swipe.category) || 0) + 1);
    }
  });

  const favoriteCategories = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => humanizeCategory(category));

  // Extract patterns
  const patternCount = new Map<string, number>();
  likedSwipes.forEach(swipe => {
    swipe.patterns?.forEach(pattern => {
      patternCount.set(pattern, (patternCount.get(pattern) || 0) + 1);
    });
  });

  const preferredPatterns = Array.from(patternCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([pattern]) => humanizePattern(pattern));

  // Extract colors
  const colorCount = new Map<string, number>();
  likedSwipes.forEach(swipe => {
    swipe.colors?.forEach(color => {
      colorCount.set(color, (colorCount.get(color) || 0) + 1);
    });
  });

  const preferredColors = Array.from(colorCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color]) => humanizeColor(color));

  // Extract style notes
  const noteCount = new Map<string, number>();
  likedSwipes.forEach(swipe => {
    swipe.style_notes?.forEach(note => {
      noteCount.set(note, (noteCount.get(note) || 0) + 1);
    });
  });

  const styleNotes = Array.from(noteCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([note]) => note);

  // Detect silhouette preferences from tags
  const silhouettePreferences = detectSilhouettes(likedSwipes);

  // Detect material preferences from tags
  const materialPreferences = detectMaterials(likedSwipes);

  return {
    favoriteCategories,
    preferredPatterns,
    preferredColors,
    styleNotes,
    silhouettePreferences,
    materialPreferences
  };
}

/**
 * Detect silhouette preferences from swipe tags
 */
function detectSilhouettes(swipes: SwipeData[]): string[] {
  const silhouetteKeywords = [
    'slim', 'fitted', 'tailored', 'relaxed', 'loose',
    'oversized', 'boxy', 'straight', 'wide', 'cropped'
  ];

  const silhouetteCount = new Map<string, number>();

  swipes.forEach(swipe => {
    swipe.tags?.forEach(tag => {
      const lowerTag = tag.toLowerCase();
      silhouetteKeywords.forEach(keyword => {
        if (lowerTag.includes(keyword)) {
          silhouetteCount.set(keyword, (silhouetteCount.get(keyword) || 0) + 1);
        }
      });
    });
  });

  return Array.from(silhouetteCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([silhouette]) => silhouette);
}

/**
 * Detect material preferences from swipe tags
 */
function detectMaterials(swipes: SwipeData[]): string[] {
  const materialKeywords = [
    'katoen', 'wol', 'leer', 'denim', 'linnen',
    'tech', 'fleece', 'mesh', 'canvas', 'suède'
  ];

  const materialCount = new Map<string, number>();

  swipes.forEach(swipe => {
    swipe.tags?.forEach(tag => {
      const lowerTag = tag.toLowerCase();
      materialKeywords.forEach(keyword => {
        if (lowerTag.includes(keyword)) {
          materialCount.set(keyword, (materialCount.get(keyword) || 0) + 1);
        }
      });
    });
  });

  return Array.from(materialCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([material]) => material);
}

/**
 * Humanize category names
 */
function humanizeCategory(category: string): string {
  const humanNames: Record<string, string> = {
    'casual-dag-uit': 'casual dagoutfits',
    'kantoor': 'kantoor looks',
    'avond': 'avondkleding',
    'sport': 'sportieve looks',
    'formeel': 'formele outfits',
    'weekend': 'weekend outfits'
  };

  return humanNames[category] || category;
}

/**
 * Humanize pattern names
 */
function humanizePattern(pattern: string): string {
  const humanNames: Record<string, string> = {
    'solid': 'effen',
    'striped': 'gestreept',
    'checked': 'geruit',
    'printed': 'geprint',
    'textured': 'getextureerd',
    'graphic': 'grafische prints'
  };

  return humanNames[pattern] || pattern;
}

/**
 * Humanize color names
 */
function humanizeColor(color: string): string {
  const humanNames: Record<string, string> = {
    'black': 'zwart',
    'white': 'wit',
    'gray': 'grijs',
    'navy': 'navy',
    'blue': 'blauw',
    'red': 'rood',
    'green': 'groen',
    'brown': 'bruin',
    'beige': 'beige',
    'camel': 'camel',
    'olive': 'olijfgroen',
    'burgundy': 'bordeauxrood'
  };

  return humanNames[color.toLowerCase()] || color;
}

/**
 * Generate style narrative from insights
 */
export function generateStyleNarrative(insights: SwipeInsights): string[] {
  const narratives: string[] = [];

  // Category preference
  if (insights.favoriteCategories.length > 0) {
    const categories = insights.favoriteCategories.slice(0, 2).join(' en ');
    narratives.push(`Je hebt een voorkeur voor ${categories}`);
  }

  // Pattern preference
  if (insights.preferredPatterns.length > 0) {
    const pattern = insights.preferredPatterns[0];
    if (pattern === 'effen') {
      narratives.push("Je houdt van effen stoffen zonder opvallende prints");
    } else if (pattern === 'gestreept') {
      narratives.push("Je waardeert subtiele strepen en geometrische patronen");
    } else {
      narratives.push(`Je houdt van ${pattern} patronen`);
    }
  }

  // Silhouette preference
  if (insights.silhouettePreferences.length > 0) {
    const silhouette = insights.silhouettePreferences[0];
    const silhouetteDescriptions: Record<string, string> = {
      'slim': "Je verkiest slimme, getailleerde silhouetten",
      'relaxed': "Je waardeert comfortabele, relaxed pasvormen",
      'oversized': "Je houdt van oversized, losse silhouetten",
      'tailored': "Je waardeert goed gesneden, tailored pieces",
      'boxy': "Je houdt van boxy, moderne silhouetten",
      'fitted': "Je kiest voor fitted, body-conscious silhouetten"
    };

    if (silhouetteDescriptions[silhouette]) {
      narratives.push(silhouetteDescriptions[silhouette]);
    }
  }

  // Material preference
  if (insights.materialPreferences.length > 0) {
    const material = insights.materialPreferences[0];
    const materialDescriptions: Record<string, string> = {
      'katoen': "natuurlijke stoffen zoals katoen",
      'wol': "kwalitatieve materialen zoals wol",
      'tech': "technische, functionele materialen",
      'leer': "luxe materialen zoals leer",
      'linnen': "luchtige, natuurlijke stoffen",
      'fleece': "zachte, comfortabele materialen",
      'denim': "robuuste, veelzijdige denim"
    };

    if (materialDescriptions[material]) {
      narratives.push(`Je waardeert ${materialDescriptions[material]}`);
    }
  }

  // Color preference
  if (insights.preferredColors.length > 0) {
    const colors = insights.preferredColors.slice(0, 3);
    if (colors.every(c => ['zwart', 'wit', 'grijs', 'navy'].includes(c))) {
      narratives.push("Je houdt van neutrale, veelzijdige kleuren");
    } else if (colors.some(c => ['rood', 'blauw', 'groen'].includes(c))) {
      narratives.push("Je bent niet bang voor kleur in je outfits");
    }
  }

  return narratives.slice(0, 4); // Max 4 narratives
}

/**
 * Mock data for development/testing
 */
export function getMockSwipeInsights(): SwipeInsights {
  return {
    favoriteCategories: ['casual dagoutfits', 'weekend outfits'],
    preferredPatterns: ['effen', 'gestreept'],
    preferredColors: ['zwart', 'wit', 'navy', 'grijs'],
    styleNotes: ['clean', 'minimaal', 'tijdloos'],
    silhouettePreferences: ['relaxed', 'straight'],
    materialPreferences: ['katoen', 'denim']
  };
}
