import { VisualPreferenceService, type MoodPhoto } from '../visualPreferences/visualPreferenceService';
import { ArchetypeDetector } from './archetypeDetector';
import type { ColorProfile } from '@/lib/quiz/types';
import type { ArchetypeKey } from '@/config/archetypes';
import { archetypeToDutch } from '@/config/archetypeMapping';

export interface QuizColorAnswers {
  colorPreference?: string;
  colorTemp?: string;
  neutrals?: boolean;
  style?: string[];
  fit?: string;
  goals?: string[];
  [key: string]: any;
}

export interface StyleProfileResult {
  colorProfile: ColorProfile;
  archetype: ArchetypeKey;
  secondaryArchetype: ArchetypeKey | null;
  confidence: number;
  dataSource: 'quiz+swipes' | 'quiz_only' | 'swipes_only' | 'fallback';
}

export class StyleProfileGenerator {
  /**
   * Generate complete style profile from quiz answers + visual swipes
   */
  static async generateStyleProfile(
    quizAnswers: QuizColorAnswers,
    userId?: string,
    sessionId?: string
  ): Promise<StyleProfileResult> {
    console.log('[StyleProfileGenerator] Generating style profile...', {
      hasQuiz: !!quizAnswers,
      userId,
      sessionId
    });

    // 1. Get swipe data if available
    const swipeData = userId || sessionId
      ? await this.getSwipeData(userId, sessionId)
      : null;

    // 2. ✅ DETECT ARCHETYPE FROM QUIZ + SWIPES
    const archetypeResult = ArchetypeDetector.detect(
      quizAnswers,
      swipeData ? {
        photos: swipeData.photos,
        likedCount: swipeData.swipes.length,
        rejectedCount: 0
      } : null
    );

    console.log('[StyleProfileGenerator] Archetype detected:', {
      primary: archetypeResult.primary,
      secondary: archetypeResult.secondary,
      confidence: archetypeResult.confidence
    });

    // 3. Analyze colors from both sources
    const quizColors = this.analyzeQuizColors(quizAnswers);
    const swipeColors = swipeData ? this.analyzeSwipeColors(swipeData) : null;

    console.log('[StyleProfileGenerator] Color analysis:', {
      quizColors,
      swipeColors
    });

    // 4. Combine data with priority: swipes > quiz > fallback
    const colorProfile = this.combineColorData(quizColors, swipeColors);

    // 5. Calculate confidence based on data sources
    const confidence = Math.max(
      this.calculateConfidence(quizColors, swipeColors),
      archetypeResult.confidence
    );

    // 6. Determine data source
    let dataSource: StyleProfileResult['dataSource'] = 'fallback';
    if (quizColors && swipeColors) {
      dataSource = 'quiz+swipes';
    } else if (quizColors) {
      dataSource = 'quiz_only';
    } else if (swipeColors) {
      dataSource = 'swipes_only';
    }

    // Convert English archetypes to Dutch for compatibility with recommendationEngine
    const dutchArchetype = archetypeToDutch(archetypeResult.primary);
    const dutchSecondary = archetypeToDutch(archetypeResult.secondary);

    console.log('[StyleProfileGenerator] ✅ Style profile generated:', {
      archetype: archetypeResult.primary,
      dutchArchetype,
      secondaryArchetype: archetypeResult.secondary,
      dutchSecondary,
      temperature: colorProfile.temperature,
      chroma: colorProfile.chroma,
      contrast: colorProfile.contrast,
      paletteName: colorProfile.paletteName,
      confidence,
      dataSource
    });

    return {
      colorProfile,
      archetype: archetypeResult.primary,
      secondaryArchetype: archetypeResult.secondary,
      confidence,
      dataSource
    };
  }

  /**
   * Get swipe data from database
   */
  private static async getSwipeData(userId?: string, sessionId?: string) {
    try {
      const swipes = userId
        ? await VisualPreferenceService.getUserSwipes(userId)
        : sessionId
        ? await VisualPreferenceService.getSessionSwipes(sessionId)
        : [];

      if (swipes.length === 0) {
        console.log('[StyleProfileGenerator] No swipe data found');
        return null;
      }

      // Get liked swipes with mood photo data
      const likedSwipes = swipes.filter(s => s.swipe_direction === 'right');

      if (likedSwipes.length === 0) {
        console.log('[StyleProfileGenerator] No liked swipes found');
        return null;
      }

      // Fetch mood photos for liked swipes
      const client = (await import('@/lib/supabase')).getSupabase();
      if (!client) return null;

      const photoIds = likedSwipes.map(s => s.mood_photo_id);
      const { data: photos } = await client
        .from('mood_photos')
        .select('*')
        .in('id', photoIds);

      return {
        swipes: likedSwipes,
        photos: photos || []
      };
    } catch (error) {
      console.error('[StyleProfileGenerator] Error fetching swipe data:', error);
      return null;
    }
  }

  /**
   * Analyze quiz answers for color preferences
   */
  private static analyzeQuizColors(answers: QuizColorAnswers): {
    temperature: string;
    isNeutral: boolean;
    preferredColors: string[];
  } | null {
    if (!answers || Object.keys(answers).length === 0) {
      return null;
    }

    // ✅ Check for color preference answers (support multiple field names for backwards compatibility)
    // CRITICAL: Quiz uses "baseColors", NOT "colorPreference"
    const colorPref = answers.baseColors || answers.colorPreference || answers.colors || answers.colorTemp || answers.neutrals;
    const neutralPreference = answers.neutrals || answers.neutral || false;

    console.log('[StyleProfileGenerator] analyzeQuizColors input:', {
      hasBaseColors: !!answers.baseColors,
      baseColors: answers.baseColors,
      hasNeutrals: !!answers.neutrals,
      colorPref
    });

    // Map quiz answers to temperature
    let temperature = 'neutraal';
    const preferredColors: string[] = [];

    if (typeof colorPref === 'string') {
      const pref = colorPref.toLowerCase();

      // ✅ Map baseColors values from quiz (EXACT quiz values)
      if (pref === 'neutral' || pref.includes('neutrale') || pref.includes('zwart') || pref.includes('wit') || pref.includes('grijs')) {
        temperature = 'koel'; // Zwart/wit/grijs = cool tones
        preferredColors.push('zwart', 'wit', 'grijs', 'beige', 'navy');
      } else if (pref === 'earth' || pref.includes('aardse') || pref.includes('warm') || pref.includes('beige') || pref.includes('camel') || pref.includes('bruin')) {
        temperature = 'warm';
        preferredColors.push('bruin', 'camel', 'khaki', 'olijfgroen');
      } else if (pref === 'jewel' || pref.includes('juweel') || pref.includes('koel') || pref.includes('blauw') || pref.includes('navy') || pref.includes('saffierblauw') || pref.includes('smaragdgroen')) {
        temperature = 'koel';
        preferredColors.push('smaragdgroen', 'saffierblauw', 'robijnrood');
      } else if (pref === 'pastel' || pref.includes('pastel') || pref.includes('roze') || pref.includes('lavendel') || pref.includes('lichtblauw')) {
        temperature = 'koel';
        preferredColors.push('roze', 'lichtblauw', 'lavendel');
      } else if (pref === 'bold' || pref.includes('fel') || pref.includes('felrood') || pref.includes('elektrisch') || pref.includes('neon')) {
        // ✅ BOLD colors = WARM + HIGH saturation
        temperature = 'warm';
        preferredColors.push('rood', 'elektrischblauw', 'neongeel', 'oranje');
      }

      console.log('[StyleProfileGenerator] Color mapping:', {
        input: pref,
        temperature,
        preferredColors
      });
    }

    return {
      temperature,
      isNeutral: neutralPreference || preferredColors.length > 0,
      preferredColors
    };
  }

  /**
   * Analyze swipe data for color preferences
   */
  private static analyzeSwipeColors(swipeData: { swipes: any[]; photos: MoodPhoto[] }): {
    dominantColors: string[];
    temperature: string;
    chroma: string;
    contrast: string;
  } | null {
    if (!swipeData || swipeData.photos.length === 0) {
      return null;
    }

    // Analyze dominant colors from liked photos
    const colorCounts: Record<string, number> = {};

    swipeData.photos.forEach(photo => {
      if (photo.dominant_colors && Array.isArray(photo.dominant_colors)) {
        photo.dominant_colors.forEach(color => {
          const normalized = this.normalizeColor(color);
          colorCounts[normalized] = (colorCounts[normalized] || 0) + 1;
        });
      }
    });

    const dominantColors = Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([color]) => color);

    console.log('[StyleProfileGenerator] Swipe color analysis:', {
      colorCounts,
      dominantColors
    });

    // Determine temperature based on dominant colors
    const temperature = this.determineTemperature(dominantColors);

    // Determine chroma (saturation) based on color analysis
    const chroma = this.determineChroma(dominantColors);

    // Determine contrast based on color combinations
    const contrast = this.determineContrast(dominantColors);

    return {
      dominantColors,
      temperature,
      chroma,
      contrast
    };
  }

  /**
   * Normalize color names for consistent comparison
   */
  private static normalizeColor(color: string): string {
    const normalized = color.toLowerCase().trim();

    // Map variations to standard names
    const colorMap: Record<string, string> = {
      'black': 'zwart',
      'white': 'wit',
      'gray': 'grijs',
      'grey': 'grijs',
      'beige': 'beige',
      'camel': 'camel',
      'brown': 'bruin',
      'navy': 'navy',
      'blue': 'blauw',
      'red': 'rood',
      'green': 'groen',
      'yellow': 'geel',
      'orange': 'oranje',
      'pink': 'roze',
      'purple': 'paars'
    };

    return colorMap[normalized] || normalized;
  }

  /**
   * Determine temperature from color list
   */
  private static determineTemperature(colors: string[]): string {
    const warmColors = ['beige', 'camel', 'bruin', 'rood', 'oranje', 'geel'];
    const coolColors = ['zwart', 'wit', 'grijs', 'navy', 'blauw', 'paars'];

    let warmCount = 0;
    let coolCount = 0;

    colors.forEach(color => {
      if (warmColors.some(w => color.includes(w))) warmCount++;
      if (coolColors.some(c => color.includes(c))) coolCount++;
    });

    if (coolCount > warmCount) return 'koel';
    if (warmCount > coolCount) return 'warm';
    return 'neutraal';
  }

  /**
   * Determine chroma (saturation) from colors
   */
  private static determineChroma(colors: string[]): string {
    // Neutral colors (zwart/wit/grijs) = high saturation if combined = 'gedurfd'
    // Neutral colors only = low saturation = 'zacht'
    // Colorful = high saturation = 'gedurfd'

    const neutralColors = ['zwart', 'wit', 'grijs'];
    const isAllNeutral = colors.every(c => neutralColors.some(n => c.includes(n)));
    const hasBlack = colors.some(c => c.includes('zwart'));
    const hasWhite = colors.some(c => c.includes('wit'));

    // Black + white = high contrast = gedurfd
    if (hasBlack && hasWhite) {
      return 'gedurfd';
    }

    // All black or mostly black = gedurfd (statement)
    if (hasBlack && isAllNeutral) {
      return 'gedurfd';
    }

    // Mix of neutrals only = zacht
    if (isAllNeutral) {
      return 'zacht';
    }

    // Has colors = gemiddeld to gedurfd
    return 'gemiddeld';
  }

  /**
   * Determine contrast level from color combinations
   */
  private static determineContrast(colors: string[]): string {
    const hasBlack = colors.some(c => c.includes('zwart'));
    const hasWhite = colors.some(c => c.includes('wit'));
    const hasGray = colors.some(c => c.includes('grijs'));

    // Black + white = highest contrast
    if (hasBlack && hasWhite) return 'hoog';

    // Black or white with grays = medium-high
    if ((hasBlack || hasWhite) && hasGray) return 'medium';

    // Only neutrals without black/white = low
    if (hasGray && !hasBlack && !hasWhite) return 'laag';

    // Has black OR white = medium
    if (hasBlack || hasWhite) return 'medium';

    return 'laag';
  }

  /**
   * Combine quiz + swipe data with priority
   */
  private static combineColorData(
    quizColors: ReturnType<typeof this.analyzeQuizColors>,
    swipeColors: ReturnType<typeof this.analyzeSwipeColors>
  ): ColorProfile {
    // Priority: swipes > quiz > fallback

    // If we have both, combine intelligently
    if (quizColors && swipeColors) {
      const temperature = swipeColors.temperature; // Swipes have priority
      const chroma = swipeColors.chroma;
      const contrast = swipeColors.contrast;

      // Build palette name
      const paletteName = this.buildPaletteName(
        swipeColors.dominantColors,
        temperature,
        quizColors.isNeutral
      );

      return {
        temperature,
        value: contrast === 'hoog' ? 'hoog' : contrast === 'laag' ? 'laag' : 'medium',
        contrast,
        chroma,
        season: this.determineSeason(temperature),
        paletteName,
        notes: this.buildNotes(swipeColors.dominantColors, chroma, contrast)
      };
    }

    // Swipes only
    if (swipeColors) {
      const temperature = swipeColors.temperature;
      const paletteName = this.buildPaletteName(
        swipeColors.dominantColors,
        temperature,
        false
      );

      return {
        temperature,
        value: swipeColors.contrast === 'hoog' ? 'hoog' : swipeColors.contrast === 'laag' ? 'laag' : 'medium',
        contrast: swipeColors.contrast,
        chroma: swipeColors.chroma,
        season: this.determineSeason(temperature),
        paletteName,
        notes: this.buildNotes(swipeColors.dominantColors, swipeColors.chroma, swipeColors.contrast)
      };
    }

    // Quiz only
    if (quizColors) {
      const temperature = quizColors.temperature;

      // ✅ IMPROVED: Determine chroma based on color selection
      let chroma: string;
      let contrast: string;

      // Check if user selected bold/vibrant colors
      const hasBoldColors = quizColors.preferredColors.some(c =>
        c.includes('rood') || c.includes('blauw') || c.includes('geel') ||
        c.includes('elektrisch') || c.includes('neon') || c.includes('oranje')
      );

      // Check if user selected high-contrast colors (zwart + wit)
      const hasBlackWhite = quizColors.preferredColors.includes('zwart') && quizColors.preferredColors.includes('wit');

      if (hasBoldColors) {
        chroma = 'gedurfd'; // Bold colors = high chroma
        contrast = 'hoog';
      } else if (hasBlackWhite) {
        chroma = 'gedurfd'; // Zwart/wit = high contrast
        contrast = 'hoog';
      } else if (quizColors.isNeutral) {
        chroma = 'zacht';
        contrast = 'laag';
      } else {
        chroma = 'gemiddeld';
        contrast = 'medium';
      }

      console.log('[StyleProfileGenerator] Quiz-only profile:', {
        temperature,
        chroma,
        contrast,
        hasBoldColors,
        hasBlackWhite,
        preferredColors: quizColors.preferredColors
      });

      return {
        temperature,
        value: contrast === 'hoog' ? 'hoog' : contrast === 'laag' ? 'laag' : 'medium',
        contrast,
        chroma,
        season: this.determineSeason(temperature),
        paletteName: this.buildPaletteName(quizColors.preferredColors, temperature, quizColors.isNeutral),
        notes: this.buildNotes(quizColors.preferredColors, chroma, contrast)
      };
    }

    // Fallback (should rarely happen)
    return {
      temperature: 'neutraal',
      value: 'medium',
      contrast: 'laag',
      chroma: 'zacht',
      season: 'zomer',
      paletteName: 'Soft Cool Tonals (neutraal)',
      notes: ['Tonal outfits met zachte texturen.', 'Vermijd harde contrasten.']
    };
  }

  /**
   * Build palette name from color analysis
   */
  private static buildPaletteName(colors: string[], temperature: string, isNeutral: boolean): string {
    if (!colors || colors.length === 0) {
      return `${temperature.charAt(0).toUpperCase() + temperature.slice(1)} Neutrals`;
    }

    // Check for black-dominant palette
    if (colors.some(c => c.includes('zwart'))) {
      if (colors.some(c => c.includes('wit'))) {
        return 'Monochrome Contrast (koel)';
      }
      return 'Dark Sophisticated (koel)';
    }

    // Check for neutral palette
    if (isNeutral || colors.every(c => ['wit', 'grijs', 'beige', 'camel'].some(n => c.includes(n)))) {
      return `Earthy ${temperature.charAt(0).toUpperCase() + temperature.slice(1)} Neutrals (neutraal)`;
    }

    // Colorful palette
    return `${temperature.charAt(0).toUpperCase() + temperature.slice(1)} Signature Colors`;
  }

  /**
   * Determine season from temperature
   */
  private static determineSeason(temperature: string): string {
    if (temperature === 'warm') return 'herfst';
    if (temperature === 'koel') return 'winter';
    return 'lente';
  }

  /**
   * Build styling notes
   */
  private static buildNotes(colors: string[], chroma: string, contrast: string): string[] {
    const notes: string[] = [];

    // Color-based notes
    if (colors.includes('zwart')) {
      notes.push('Zwart als basis kleur voor een sterke statement.');
    }
    if (colors.includes('wit')) {
      notes.push('Wit voor helderheid en frisse contrasten.');
    }
    if (colors.includes('grijs') || colors.includes('beige')) {
      notes.push('Neutrale tinten als foundation voor layering.');
    }

    // Chroma notes
    if (chroma === 'gedurfd') {
      notes.push('Durf kleurcontrasten en statement pieces.');
    } else if (chroma === 'zacht') {
      notes.push('Houd het subtiel met tonal combinaties.');
    }

    // Contrast notes
    if (contrast === 'hoog') {
      notes.push('Speel met high-contrast voor impact.');
    } else if (contrast === 'laag') {
      notes.push('Vermijd harde contrasten, kies voor flow.');
    }

    return notes.length > 0 ? notes : ['Tijdloze stukken die bij je stijl passen.'];
  }

  /**
   * Calculate confidence score (0-1)
   */
  private static calculateConfidence(
    quizColors: ReturnType<typeof this.analyzeQuizColors>,
    swipeColors: ReturnType<typeof this.analyzeSwipeColors>
  ): number {
    let confidence = 0;

    // Quiz data adds 0.4
    if (quizColors) {
      confidence += 0.4;
    }

    // Swipe data adds 0.6 (more reliable)
    if (swipeColors) {
      confidence += 0.6;
    }

    return Math.min(confidence, 1.0);
  }
}
