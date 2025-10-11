import { supabase } from '@/lib/supabase';
import type { VisualPreferenceEmbedding } from './visualPreferenceService';
import type { ArchetypeWeights } from '@/types/style';

export interface CalibrationOutfit {
  id: string;
  title: string;
  items: {
    top?: { name: string; brand: string; price: number; image_url: string };
    bottom?: { name: string; brand: string; price: number; image_url: string };
    shoes?: { name: string; brand: string; price: number; image_url: string };
    accessory?: { name: string; brand: string; price: number; image_url: string };
  };
  archetypes: ArchetypeWeights;
  dominantColors: string[];
  occasion: string;
  explanation: string;
}

export interface CalibrationFeedback {
  id?: string;
  user_id?: string;
  session_id?: string;
  outfit_data: any;
  feedback: 'spot_on' | 'not_for_me' | 'maybe';
  response_time_ms: number;
  outfit_archetypes: ArchetypeWeights;
  dominant_colors: string[];
  occasion: string;
  created_at?: string;
}

export class CalibrationService {
  /**
   * Generate 3 calibration outfits based on visual preferences
   */
  static generateCalibrationOutfits(
    visualEmbedding: VisualPreferenceEmbedding,
    quizData?: any
  ): CalibrationOutfit[] {
    // Get top 3 archetypes from visual preferences
    const topArchetypes = Object.entries(visualEmbedding)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const outfits: CalibrationOutfit[] = [];

    // Generate 3 distinct outfits
    topArchetypes.forEach(([mainArchetype, score], index) => {
      const archetypeWeights: ArchetypeWeights = {
        [mainArchetype]: score / 100,
        // Add complementary archetype
        ...(topArchetypes[index + 1] ? {
          [topArchetypes[index + 1][0]]: topArchetypes[index + 1][1] / 100 * 0.4
        } : {})
      };

      const outfit = this.createOutfitFromArchetype(
        mainArchetype,
        archetypeWeights,
        index,
        quizData
      );

      outfits.push(outfit);
    });

    return outfits;
  }

  private static createOutfitFromArchetype(
    mainArchetype: string,
    weights: ArchetypeWeights,
    index: number,
    quizData?: any
  ): CalibrationOutfit {
    const archetypeTemplates: Record<string, {
      colors: string[];
      occasion: string;
      description: string;
    }> = {
      'scandi_minimal': {
        colors: ['#FFFFFF', '#F5F5DC', '#808080'],
        occasion: 'casual',
        description: 'strakke, minimalistische lijnen met neutrale tinten'
      },
      'italian_smart_casual': {
        colors: ['#2C3E50', '#ECF0F1', '#8B7355'],
        occasion: 'work',
        description: 'gestructureerde smart casual met verfijnde details'
      },
      'street_refined': {
        colors: ['#1C1C1C', '#FFFFFF', '#808080'],
        occasion: 'casual',
        description: 'urban streetwear met premium touch'
      },
      'classic': {
        colors: ['#000080', '#FFFFFF', '#8B7355'],
        occasion: 'work',
        description: 'tijdloze klassiekers die altijd werken'
      },
      'minimal': {
        colors: ['#000000', '#FFFFFF', '#808080'],
        occasion: 'casual',
        description: 'pure minimalistische basics'
      },
      'bohemian': {
        colors: ['#D2691E', '#F4A460', '#8B4513'],
        occasion: 'casual',
        description: 'vrije, gelaagde bohemian stijl'
      },
      'preppy': {
        colors: ['#000080', '#C41E3A', '#FFFFFF'],
        occasion: 'casual',
        description: 'collegiate preppy met een moderne twist'
      }
    };

    const template = archetypeTemplates[mainArchetype] || archetypeTemplates['minimal'];

    return {
      id: `calibration-${index}`,
      title: `Look ${index + 1}`,
      items: {
        // Placeholder items (in real app, these would come from product database)
        top: {
          name: this.getTopForArchetype(mainArchetype),
          brand: 'Example Brand',
          price: 79,
          image_url: '/images/fallbacks/top.jpg'
        },
        bottom: {
          name: this.getBottomForArchetype(mainArchetype),
          brand: 'Example Brand',
          price: 89,
          image_url: '/images/fallbacks/bottom.jpg'
        },
        shoes: {
          name: this.getShoesForArchetype(mainArchetype),
          brand: 'Example Brand',
          price: 129,
          image_url: '/images/fallbacks/footwear.jpg'
        }
      },
      archetypes: weights,
      dominantColors: template.colors,
      occasion: template.occasion,
      explanation: `Deze look combineert ${template.description}. Perfect voor jouw voorkeur voor ${mainArchetype.replace(/_/g, ' ')}.`
    };
  }

  private static getTopForArchetype(archetype: string): string {
    const tops: Record<string, string> = {
      'scandi_minimal': 'Premium Organic Cotton T-Shirt',
      'italian_smart_casual': 'Structured Oxford Shirt',
      'street_refined': 'Oversized Premium Hoodie',
      'classic': 'Classic Oxford Shirt',
      'minimal': 'Essential Crew Neck Tee',
      'bohemian': 'Flowing Linen Tunic',
      'preppy': 'Classic Polo Shirt'
    };
    return tops[archetype] || 'Essential T-Shirt';
  }

  private static getBottomForArchetype(archetype: string): string {
    const bottoms: Record<string, string> = {
      'scandi_minimal': 'Straight Fit Chinos',
      'italian_smart_casual': 'Tailored Dress Pants',
      'street_refined': 'Tapered Joggers',
      'classic': 'Classic Chino Pants',
      'minimal': 'Slim Fit Jeans',
      'bohemian': 'Wide-Leg Linen Pants',
      'preppy': 'Slim Chinos'
    };
    return bottoms[archetype] || 'Classic Jeans';
  }

  private static getShoesForArchetype(archetype: string): string {
    const shoes: Record<string, string> = {
      'scandi_minimal': 'Minimalist White Sneakers',
      'italian_smart_casual': 'Leather Loafers',
      'street_refined': 'Premium Hi-Top Sneakers',
      'classic': 'Oxford Dress Shoes',
      'minimal': 'Low-Top Leather Sneakers',
      'bohemian': 'Suede Desert Boots',
      'preppy': 'Canvas Boat Shoes'
    };
    return shoes[archetype] || 'Classic Sneakers';
  }

  /**
   * Record user feedback on calibration outfit
   */
  static async recordFeedback(feedback: Omit<CalibrationFeedback, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('outfit_calibration_feedback')
      .insert(feedback);

    if (error) {
      console.error('Failed to record calibration feedback:', error);
      throw error;
    }
  }

  /**
   * Apply all calibration feedback to update profile
   */
  static async applyCalibrationToProfile(
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    const { error } = await supabase.rpc('apply_calibration_to_profile', {
      p_user_id: userId || null,
      p_session_id: sessionId || null
    });

    if (error) {
      console.error('Failed to apply calibration:', error);
      throw error;
    }
  }

  /**
   * Get calibration feedback for user
   */
  static async getFeedbackHistory(
    userId?: string,
    sessionId?: string
  ): Promise<CalibrationFeedback[]> {
    let query = supabase
      .from('outfit_calibration_feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else {
      return [];
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch feedback history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Compute adjustments from feedback (for preview before applying)
   */
  static async computeAdjustments(
    userId?: string,
    sessionId?: string
  ): Promise<Record<string, number>> {
    const { data, error } = await supabase.rpc('compute_calibration_adjustments', {
      p_user_id: userId || null,
      p_session_id: sessionId || null
    });

    if (error) {
      console.error('Failed to compute adjustments:', error);
      throw error;
    }

    return data || {};
  }

  /**
   * Get calibration effectiveness analytics
   */
  static async getEffectiveness(): Promise<Array<{
    feedback_type: string;
    total_count: number;
    avg_response_time: number;
    most_common_archetype: string;
  }>> {
    const { data, error } = await supabase.rpc('get_calibration_effectiveness');

    if (error) {
      console.error('Failed to fetch calibration effectiveness:', error);
      return [];
    }

    return data || [];
  }
}
