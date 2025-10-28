import type { MoodPhoto, StyleSwipe } from './visualPreferenceService';

export interface SwipePattern {
  dominantColors: string[];
  preferredStyles: string[];
  avgResponseTime: number;
  confidence: number;
  likeRate: number;
  shouldAdapt?: boolean;
  archetypeWeights?: Record<string, number>;
  topArchetypes?: string[];
}

export interface NovaInsight {
  message: string;
  confidence: number;
  trigger: 'color' | 'style' | 'speed' | 'pattern';
  shouldShow: boolean;
}

export class SwipeAnalyzer {
  private swipes: Array<{ photo: MoodPhoto; swipe: StyleSwipe }> = [];
  private insightsShown = 0;

  addSwipe(photo: MoodPhoto, swipe: StyleSwipe) {
    this.swipes.push({ photo, swipe });
  }

  getPattern(): SwipePattern {
    const likes = this.swipes.filter(s => s.swipe.swipe_direction === 'right');
    const total = this.swipes.length;

    if (total === 0) {
      return {
        dominantColors: [],
        preferredStyles: [],
        avgResponseTime: 0,
        confidence: 0,
        likeRate: 0,
        shouldAdapt: false,
        archetypeWeights: {},
        topArchetypes: []
      };
    }

    // Analyze colors from liked photos
    const colorCounts: Record<string, number> = {};
    likes.forEach(({ photo }) => {
      photo.color_palette?.forEach(color => {
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      });
    });

    const dominantColors = Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([color]) => color);

    // Analyze style tags from liked photos
    const styleCounts: Record<string, number> = {};
    likes.forEach(({ photo }) => {
      photo.style_tags?.forEach(tag => {
        styleCounts[tag] = (styleCounts[tag] || 0) + 1;
      });
    });

    const preferredStyles = Object.entries(styleCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag);

    // Analyze archetype weights from liked photos (NEW!)
    const archetypeWeights: Record<string, number> = {};
    likes.forEach(({ photo }) => {
      if (photo.archetype_weights) {
        Object.entries(photo.archetype_weights).forEach(([archetype, weight]) => {
          const numWeight = typeof weight === 'number' ? weight : 0;
          archetypeWeights[archetype] = (archetypeWeights[archetype] || 0) + numWeight;
        });
      }
    });

    // Get top 3 archetypes
    const topArchetypes = Object.entries(archetypeWeights)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([archetype]) => archetype);

    // Calculate average response time
    const avgResponseTime = this.swipes.reduce((sum, s) =>
      sum + (s.swipe.response_time_ms || 0), 0
    ) / total;

    // Confidence increases with more swipes
    const confidence = Math.min(total / 10, 1.0);

    const likeRate = likes.length / total;

    // Should adapt if:
    // - At least 3 swipes done
    // - Like rate is between 0.33 and 0.8 (not too picky, not liking everything)
    // - Clear top archetype (at least 2 likes in same archetype)
    const shouldAdapt = total >= 3 &&
                        likeRate >= 0.33 &&
                        likeRate <= 0.8 &&
                        topArchetypes.length > 0;

    return {
      dominantColors,
      preferredStyles,
      avgResponseTime,
      confidence,
      likeRate,
      shouldAdapt,
      archetypeWeights,
      topArchetypes
    };
  }

  generateInsight(currentSwipeCount: number): NovaInsight | null {
    const pattern = this.getPattern();

    // Only generate insights after 3+ swipes
    if (currentSwipeCount < 3) {
      return null;
    }

    // Limit to max 2 insights per session
    if (this.insightsShown >= 2) {
      return null;
    }

    // Show insight at swipe 3 and 7
    if (currentSwipeCount !== 3 && currentSwipeCount !== 7) {
      return null;
    }

    const insight = this.pickInsight(pattern, currentSwipeCount);
    if (insight && insight.shouldShow) {
      this.insightsShown++;
    }

    return insight;
  }

  private pickInsight(pattern: SwipePattern, swipeCount: number): NovaInsight | null {
    const { preferredStyles, likeRate, avgResponseTime, confidence } = pattern;

    // Insight 1 (swipe 3): Style preference
    if (swipeCount === 3 && preferredStyles.length > 0) {
      const styleDesc = this.translateStyleTag(preferredStyles[0]);

      if (likeRate > 0.6) {
        return {
          message: `Ik merk dat je houdt van ${styleDesc} — klopt dat?`,
          confidence,
          trigger: 'style',
          shouldShow: true
        };
      } else if (likeRate < 0.4) {
        return {
          message: `Je bent selectief — ik zie dat je duidelijk weet wat je wél en niet wilt!`,
          confidence,
          trigger: 'pattern',
          shouldShow: true
        };
      }
    }

    // Insight 2 (swipe 7): More refined observation
    if (swipeCount === 7 && preferredStyles.length > 1) {
      const style1 = this.translateStyleTag(preferredStyles[0]);
      const style2 = this.translateStyleTag(preferredStyles[1]);

      // Fast swiper = decisive
      if (avgResponseTime < 1500) {
        return {
          message: `Je swipet snel en zeker — ${style1} met een vleugje ${style2} past perfect bij je.`,
          confidence,
          trigger: 'speed',
          shouldShow: true
        };
      }

      // Thoughtful swiper
      if (avgResponseTime > 2500) {
        return {
          message: `Je neemt de tijd om details te bekijken. Ik zie een voorkeur voor ${style1} en ${style2}.`,
          confidence,
          trigger: 'speed',
          shouldShow: true
        };
      }

      // Color-focused
      if (pattern.dominantColors.length > 0) {
        const colorDesc = this.translateColor(pattern.dominantColors[0]);
        return {
          message: `Ik zie dat ${colorDesc} vaak terugkomt in wat je mooi vindt — rustige tinten en gestructureerde silhouetten?`,
          confidence,
          trigger: 'color',
          shouldShow: true
        };
      }
    }

    return null;
  }

  private translateStyleTag(tag: string): string {
    const translations: Record<string, string> = {
      'scandi_minimal': 'strakke minimalistische looks',
      'italian_smart_casual': 'gestructureerde smart casual',
      'street_refined': 'verfijnde streetwear',
      'bohemian': 'bohemian lagen en texturen',
      'preppy': 'klassieke preppy stijl',
      'athleisure': 'sportieve comfort',
      'romantic': 'zachte romantische lijnen',
      'monochrome': 'monochrome elegantie',
      'coastal': 'luchtige coastal vibes',
      'bold': 'gedurfde statement pieces',
      'minimal': 'minimalistische stukken',
      'classic': 'tijdloze klassiekers',
      'refined': 'verfijnde details',
      'urban': 'urban streetstyle',
      'casual': 'relaxte casual looks',
      'tailored': 'getailleerde snits',
      'elevated': 'elevated basics',
      'contemporary': 'moderne silhouetten',
      'artistic': 'artistieke expressie',
      'layered': 'gelaagde outfits',
      'polished': 'gepolijste looks',
      'sporty': 'sportieve styling',
      'comfortable': 'comfortabele fits',
      'feminine': 'vrouwelijke vormen',
      'soft': 'zachte lijnen',
      'sophisticated': 'gedistingeerde looks',
      'breezy': 'luchtige stukken',
      'colorful': 'kleurrijke combinaties',
      'statement': 'opvallende items'
    };

    return translations[tag] || tag.replace(/_/g, ' ');
  }

  private translateColor(hex: string): string {
    // Convert hex to color description
    const colorNames: Record<string, string> = {
      '#FFFFFF': 'wit',
      '#000000': 'zwart',
      '#808080': 'grijs',
      '#F5F5DC': 'beige',
      '#8B7355': 'camel',
      '#2C3E50': 'donkerblauw',
      '#ECF0F1': 'off-white',
      '#34495E': 'slate',
      '#1C1C1C': 'antraciet',
      '#DC143C': 'rood',
      '#D2691E': 'terracotta',
      '#F4A460': 'zandkleur',
      '#8B4513': 'bruin',
      '#000080': 'marineblauw',
      '#C41E3A': 'rood',
      '#00CED1': 'turquoise',
      '#FFB6C1': 'roze',
      '#DDA0DD': 'lila',
      '#87CEEB': 'lichtblauw',
      '#F0E68C': 'geel',
      '#FF6347': 'oranje',
      '#FFD700': 'goud',
      '#4169E1': 'kobaltblauw'
    };

    const closest = this.findClosestColor(hex, Object.keys(colorNames));
    return colorNames[closest] || 'neutrale kleuren';
  }

  private findClosestColor(targetHex: string, colorHexes: string[]): string {
    // Simple color distance calculation
    const target = this.hexToRgb(targetHex);
    if (!target) return colorHexes[0];

    let minDistance = Infinity;
    let closest = colorHexes[0];

    for (const hex of colorHexes) {
      const color = this.hexToRgb(hex);
      if (!color) continue;

      const distance = Math.sqrt(
        Math.pow(target.r - color.r, 2) +
        Math.pow(target.g - color.g, 2) +
        Math.pow(target.b - color.b, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closest = hex;
      }
    }

    return closest;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  getInsightsShown(): number {
    return this.insightsShown;
  }

  reset() {
    this.swipes = [];
    this.insightsShown = 0;
  }
}
