import { ARCHETYPES, type ArchetypeKey } from '@/config/archetypes';
import type { MoodPhoto } from '../visualPreferences/visualPreferenceService';

export interface ArchetypeScore {
  archetype: ArchetypeKey;
  score: number;
  reasons: string[];
}

export interface ArchetypeDetectionResult {
  primary: ArchetypeKey;
  secondary: ArchetypeKey | null;
  scores: ArchetypeScore[];
  confidence: number;
}

interface QuizInputs {
  style?: string[];
  fit?: string;
  comfort?: string;
  goals?: string[];
  occasions?: string[];
  materials?: string;
  prints?: string;
  [key: string]: any;
}

interface SwipeData {
  photos: MoodPhoto[];
  likedCount: number;
  rejectedCount: number;
}

export class ArchetypeDetector {
  /**
   * Detect archetype from quiz + swipe data
   */
  static detect(
    quizInputs: QuizInputs,
    swipeData?: SwipeData | null
  ): ArchetypeDetectionResult {
    console.log('[ArchetypeDetector] Detecting archetype...', {
      hasQuiz: !!quizInputs,
      hasSwipes: !!swipeData,
      likedCount: swipeData?.likedCount || 0
    });

    // Calculate scores for each archetype
    const scores: ArchetypeScore[] = [];

    Object.entries(ARCHETYPES).forEach(([key, descriptor]) => {
      const archetypeKey = key as ArchetypeKey;
      let score = 0;
      const reasons: string[] = [];

      // QUIZ ANALYSIS (40% weight)
      const quizScore = this.analyzeQuiz(quizInputs, descriptor);
      score += quizScore.score * 0.4;
      reasons.push(...quizScore.reasons);

      // SWIPE ANALYSIS (60% weight - more reliable)
      if (swipeData && swipeData.likedCount > 0) {
        const swipeScore = this.analyzeSwipes(swipeData, descriptor);
        score += swipeScore.score * 0.6;
        reasons.push(...swipeScore.reasons);
      }

      scores.push({
        archetype: archetypeKey,
        score: Math.round(score * 100) / 100,
        reasons
      });
    });

    // Sort by score
    scores.sort((a, b) => b.score - a.score);

    console.log('[ArchetypeDetector] Archetype scores:', scores.map(s => ({
      archetype: s.archetype,
      score: s.score
    })));

    const primary = scores[0].archetype;
    const secondary = scores[1] && scores[1].score > 20 ? scores[1].archetype : null;

    // Confidence based on score difference
    const confidence = scores[0].score >= 50 ? 0.9 :
                      scores[0].score >= 35 ? 0.7 :
                      scores[0].score >= 20 ? 0.5 : 0.3;

    console.log('[ArchetypeDetector] ✅ Result:', {
      primary,
      secondary,
      confidence,
      primaryScore: scores[0].score
    });

    return {
      primary,
      secondary,
      scores,
      confidence
    };
  }

  /**
   * Analyze quiz inputs
   */
  private static analyzeQuiz(
    inputs: QuizInputs,
    descriptor: typeof ARCHETYPES[ArchetypeKey]
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Style keywords
    if (inputs.style && Array.isArray(inputs.style)) {
      const styleKeywords = inputs.style.map(s => s.toLowerCase());

      // MINIMALIST detection
      if (descriptor.key === 'MINIMALIST') {
        if (styleKeywords.some(s => s.includes('minimalis') || s.includes('clean') || s.includes('effen'))) {
          score += 30;
          reasons.push('Minimalist style preference');
        }
      }

      // STREETWEAR detection
      if (descriptor.key === 'STREETWEAR') {
        if (styleKeywords.some(s => s.includes('street') || s.includes('urban') || s.includes('sport') || s.includes('casual'))) {
          score += 30;
          reasons.push('Streetwear/urban style preference');
        }
      }

      // ATHLETIC detection
      if (descriptor.key === 'ATHLETIC') {
        if (styleKeywords.some(s => s.includes('atleti') || s.includes('sport') || s.includes('actief'))) {
          score += 30;
          reasons.push('Athletic style preference');
        }
      }

      // CLASSIC detection
      if (descriptor.key === 'CLASSIC') {
        if (styleKeywords.some(s => s.includes('klassiek') || s.includes('classic') || s.includes('preppy'))) {
          score += 30;
          reasons.push('Classic style preference');
        }
      }
    }

    // Fit preferences
    if (inputs.fit) {
      const fit = inputs.fit.toLowerCase();

      if (descriptor.silhouettes.some(s => fit.includes(s))) {
        score += 15;
        reasons.push(`Fit matches: ${fit}`);
      }

      // Oversized fit
      if (fit.includes('oversized') || fit.includes('loose') || fit.includes('relaxed')) {
        if (descriptor.key === 'STREETWEAR' || descriptor.key === 'AVANT_GARDE') {
          score += 20;
          reasons.push('Oversized fit preference');
        }
      }

      // Slim fit
      if (fit.includes('slim') || fit.includes('tailored')) {
        if (descriptor.key === 'MINIMALIST' || descriptor.key === 'CLASSIC') {
          score += 15;
          reasons.push('Slim/tailored fit preference');
        }
      }
    }

    // Goals/Occasions
    if (inputs.goals && Array.isArray(inputs.goals)) {
      const goals = inputs.goals.map(g => g.toLowerCase());

      if (goals.some(g => g.includes('sport') || g.includes('actief'))) {
        if (descriptor.key === 'ATHLETIC' || descriptor.key === 'STREETWEAR') {
          score += 15;
          reasons.push('Athletic/active goals');
        }
      }

      if (goals.some(g => g.includes('werk') || g.includes('office') || g.includes('professioneel'))) {
        if (descriptor.key === 'SMART_CASUAL' || descriptor.key === 'CLASSIC') {
          score += 15;
          reasons.push('Professional/work goals');
        }
      }

      if (goals.some(g => g.includes('minimal') || g.includes('timeless') || g.includes('tijdloos'))) {
        if (descriptor.key === 'MINIMALIST') {
          score += 20;
          reasons.push('Minimalist/timeless goals');
        }
      }
    }

    // Materials
    if (inputs.materials) {
      const mat = inputs.materials.toLowerCase();

      if (mat.includes('tech') && descriptor.key === 'ATHLETIC') {
        score += 10;
        reasons.push('Tech material preference');
      }

      if (mat.includes('fleece') && descriptor.key === 'STREETWEAR') {
        score += 10;
        reasons.push('Fleece material preference');
      }
    }

    // Prints (minimalist = effen)
    if (inputs.prints) {
      const prints = inputs.prints.toLowerCase();

      if (prints.includes('effen') && descriptor.key === 'MINIMALIST') {
        score += 10;
        reasons.push('Solid/plain preference');
      }

      if (prints.includes('statement') && descriptor.key === 'STREETWEAR') {
        score += 10;
        reasons.push('Statement prints preference');
      }
    }

    return { score, reasons };
  }

  /**
   * Analyze swipe data
   */
  private static analyzeSwipes(
    swipeData: SwipeData,
    descriptor: typeof ARCHETYPES[ArchetypeKey]
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    const { photos } = swipeData;

    // Analyze style tags from liked photos
    const styleTags: string[] = [];
    photos.forEach(photo => {
      if (photo.style_tags && Array.isArray(photo.style_tags)) {
        styleTags.push(...photo.style_tags);
      }
      if (photo.mood_tags && Array.isArray(photo.mood_tags)) {
        styleTags.push(...photo.mood_tags);
      }
    });

    // Count tag occurrences
    const tagCounts: Record<string, number> = {};
    styleTags.forEach(tag => {
      const normalized = tag.toLowerCase();
      tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
    });

    // MINIMALIST detection from swipes
    if (descriptor.key === 'MINIMALIST') {
      const minimalTags = ['minimal', 'clean', 'effen', 'simpel', 'monochrome'];
      const matchCount = minimalTags.reduce((sum, tag) => {
        return sum + (tagCounts[tag] || 0);
      }, 0);

      if (matchCount > 0) {
        score += Math.min(matchCount * 15, 40);
        reasons.push(`Minimalist tags: ${matchCount}`);
      }

      // Check for neutral colors (zwart/wit/grijs)
      const colors = this.extractColors(photos);
      const neutrals = ['zwart', 'wit', 'grijs'];
      const neutralCount = colors.filter(c => neutrals.some(n => c.includes(n))).length;

      if (neutralCount >= 2) {
        score += 20;
        reasons.push('Neutral color palette (zwart/wit/grijs)');
      }
    }

    // STREETWEAR detection from swipes
    if (descriptor.key === 'STREETWEAR') {
      const streetTags = ['street', 'urban', 'oversized', 'hoodie', 'sneaker', 'casual', 'relaxed'];
      const matchCount = streetTags.reduce((sum, tag) => {
        return sum + (tagCounts[tag] || 0);
      }, 0);

      if (matchCount > 0) {
        score += Math.min(matchCount * 15, 40);
        reasons.push(`Streetwear tags: ${matchCount}`);
      }

      // Check for oversized silhouettes
      if (tagCounts['oversized'] || tagCounts['loose'] || tagCounts['boxy']) {
        score += 20;
        reasons.push('Oversized silhouette preference');
      }
    }

    // ATHLETIC detection from swipes
    if (descriptor.key === 'ATHLETIC') {
      const athleticTags = ['sport', 'athletic', 'performance', 'tech', 'training', 'actief'];
      const matchCount = athleticTags.reduce((sum, tag) => {
        return sum + (tagCounts[tag] || 0);
      }, 0);

      if (matchCount > 0) {
        score += Math.min(matchCount * 15, 40);
        reasons.push(`Athletic tags: ${matchCount}`);
      }
    }

    // CLASSIC detection from swipes
    if (descriptor.key === 'CLASSIC') {
      const classicTags = ['classic', 'tailored', 'preppy', 'refined', 'smart'];
      const matchCount = classicTags.reduce((sum, tag) => {
        return sum + (tagCounts[tag] || 0);
      }, 0);

      if (matchCount > 0) {
        score += Math.min(matchCount * 15, 40);
        reasons.push(`Classic tags: ${matchCount}`);
      }
    }

    // AVANT_GARDE detection from swipes
    if (descriptor.key === 'AVANT_GARDE') {
      const avantTags = ['avant', 'conceptual', 'asymmetric', 'drape', 'statement'];
      const matchCount = avantTags.reduce((sum, tag) => {
        return sum + (tagCounts[tag] || 0);
      }, 0);

      if (matchCount > 0) {
        score += Math.min(matchCount * 15, 40);
        reasons.push(`Avant-garde tags: ${matchCount}`);
      }
    }

    // Analyze archetype_weights from photos (if available)
    const archetypeWeights: Record<string, number> = {};
    photos.forEach(photo => {
      if (photo.archetype_weights) {
        Object.entries(photo.archetype_weights).forEach(([arch, weight]) => {
          const numWeight = typeof weight === 'number' ? weight : 0;
          archetypeWeights[arch] = (archetypeWeights[arch] || 0) + numWeight;
        });
      }
    });

    // Match archetype weights
    const archetypeKey = descriptor.key.toLowerCase();
    if (archetypeWeights[archetypeKey]) {
      score += Math.min(archetypeWeights[archetypeKey] * 10, 30);
      reasons.push(`Archetype weight match: ${archetypeWeights[archetypeKey]}`);
    }

    return { score, reasons };
  }

  /**
   * Extract colors from photos
   */
  private static extractColors(photos: MoodPhoto[]): string[] {
    const colors: string[] = [];

    photos.forEach(photo => {
      if (photo.dominant_colors && Array.isArray(photo.dominant_colors)) {
        photo.dominant_colors.forEach(color => {
          const normalized = this.normalizeColor(color);
          colors.push(normalized);
        });
      }
    });

    return colors;
  }

  /**
   * Normalize color names
   */
  private static normalizeColor(color: string): string {
    const normalized = color.toLowerCase().trim();

    const colorMap: Record<string, string> = {
      'black': 'zwart',
      'white': 'wit',
      'gray': 'grijs',
      'grey': 'grijs',
      'beige': 'beige',
      'camel': 'camel',
      'brown': 'bruin',
      'navy': 'navy',
      'blue': 'blauw'
    };

    return colorMap[normalized] || normalized;
  }
}
