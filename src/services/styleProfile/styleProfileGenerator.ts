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
  dataSource: 'photo_analysis' | 'quiz+swipes' | 'quiz_only' | 'swipes_only' | 'fallback';
}

export class StyleProfileGenerator {
  /**
   * Generate complete style profile with THREE-TIER PRIORITY:
   * 1. Photo Analysis (OBJECTIVE - highest accuracy)
   * 2. Visual Swipes (SUBJECTIVE - medium accuracy)
   * 3. Quiz Answers (SUBJECTIVE - lowest accuracy)
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

    // 🎯 PRIORITY 1: Try Photo Analysis FIRST (OBJECTIVE)
    if (userId) {
      const photoAnalysis = await this.getPhotoAnalysis(userId);
      if (photoAnalysis && photoAnalysis.confidence > 0.7) {
        console.log('[StyleProfileGenerator] ✅ Using PHOTO ANALYSIS (Priority 1, highest accuracy)');
        return this.buildProfileFromPhotoAnalysis(photoAnalysis, quizAnswers);
      }
    }

    // 🎯 PRIORITY 2: Get swipe data (SUBJECTIVE but more data points)
    const swipeData = userId || sessionId
      ? await this.getSwipeData(userId, sessionId)
      : null;

    // Detect archetype from quiz + swipes
    const archetypeResult = ArchetypeDetector.detect(
      quizAnswers,
      swipeData ? {
        photos: swipeData.photos,
        likedCount: swipeData.photos.length,
        rejectedCount: 0
      } : null
    );

    console.log('[StyleProfileGenerator] Archetype detected:', {
      primary: archetypeResult.primary,
      secondary: archetypeResult.secondary,
      confidence: archetypeResult.confidence
    });

    // Analyze colors from both sources
    const quizColors = this.analyzeQuizColors(quizAnswers);
    const swipeColors = swipeData ? this.analyzeSwipeColors(swipeData) : null;

    console.log('[StyleProfileGenerator] Color analysis:', {
      quizColors,
      swipeColors
    });

    // 🎯 PRIORITY 2/3: Combine quiz + swipes with fallback
    const colorProfile = this.combineColorData(quizColors, swipeColors);

    // Calculate confidence based on data sources
    const confidence = Math.max(
      this.calculateConfidence(quizColors, swipeColors),
      archetypeResult.confidence
    );

    // Determine data source
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
      console.warn('[StyleProfileGenerator] analyzeQuizColors: No answers provided');
      return null;
    }

    // Quiz uses "neutrals" (string: 'warm'|'koel'|'neutraal'), NOT "baseColors"
    // Support legacy field names for backwards compatibility
    const colorPref = answers.neutrals || answers.baseColors || answers.colorPreference || answers.colors || answers.colorTemp;
    const neutralPreference = typeof answers.neutrals === 'boolean' ? answers.neutrals : (answers.neutral || false);

    console.log('[StyleProfileGenerator] analyzeQuizColors input:', {
      allAnswers: Object.keys(answers),
      hasNeutrals: !!answers.neutrals,
      neutrals: answers.neutrals,
      colorPref,
      answersCount: Object.keys(answers).length
    });

    // ✅ If no color preference data at all, derive from style preferences
    if (!colorPref) {
      console.warn('[StyleProfileGenerator] No baseColors found in quiz answers, using fallback logic');

      // Check if user has ANY answers at all
      const hasStylePreferences = Array.isArray(answers.stylePreferences) && answers.stylePreferences.length > 0;
      const hasGoals = Array.isArray(answers.goals) && answers.goals.length > 0;

      if (!hasStylePreferences && !hasGoals) {
        console.error('[StyleProfileGenerator] No quiz data available for color analysis');
        return null;
      }

      // Derive temperature from style preferences
      let temperature = 'neutraal';
      const preferredColors: string[] = [];

      if (hasStylePreferences) {
        const styles = answers.stylePreferences as string[];
        const hasBold = styles.some(s => s.toLowerCase().includes('bold') || s.toLowerCase().includes('statement'));
        const hasMinimal = styles.some(s => s.toLowerCase().includes('minimal') || s.toLowerCase().includes('clean'));

        if (hasBold) {
          temperature = 'warm';
          preferredColors.push('rood', 'elektrischblauw', 'neongeel');
        } else if (hasMinimal) {
          temperature = 'koel';
          preferredColors.push('zwart', 'wit', 'grijs', 'navy');
        }
      }

      return {
        temperature,
        isNeutral: temperature === 'koel' || preferredColors.includes('zwart') || preferredColors.includes('wit'),
        preferredColors
      };
    }

    // Map quiz answers to temperature
    let temperature = 'neutraal';
    const preferredColors: string[] = [];

    if (typeof colorPref === 'string') {
      const pref = colorPref.toLowerCase().trim();

      // Direct quiz values: 'warm' | 'koel' | 'neutraal'
      if (pref === 'warm' || pref.includes('aardse') || pref.includes('beige') || pref.includes('camel') || pref.includes('bruin')) {
        temperature = 'warm';
        preferredColors.push('bruin', 'camel', 'khaki', 'olijfgroen', 'beige');
      } else if (pref === 'koel' || pref.includes('blauw') || pref.includes('navy') || pref.includes('saffierblauw') || pref.includes('smaragdgroen') || pref.includes('juweel')) {
        temperature = 'koel';
        preferredColors.push('smaragdgroen', 'saffierblauw', 'navy', 'robijnrood');
      } else if (pref === 'neutraal' || pref === 'neutral' || pref.includes('zwart') || pref.includes('wit') || pref.includes('grijs') || pref.includes('neutrale')) {
        temperature = 'neutraal';
        preferredColors.push('zwart', 'wit', 'grijs', 'beige', 'navy');
      } else if (pref === 'pastel' || pref.includes('pastel') || pref.includes('roze') || pref.includes('lavendel') || pref.includes('lichtblauw')) {
        temperature = 'koel';
        preferredColors.push('roze', 'lichtblauw', 'lavendel');
      } else if (pref === 'bold' || pref.includes('fel') || pref.includes('felrood') || pref.includes('elektrisch') || pref.includes('neon')) {
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

  /**
   * 🎯 PRIORITY 1: Get photo analysis from database (OBJECTIVE data)
   */
  private static async getPhotoAnalysis(userId: string): Promise<any | null> {
    try {
      const client = (await import('@/lib/supabase')).getSupabase();
      if (!client) return null;

      const { data, error } = await client
        .from('style_profiles')
        .select('color_analysis, photo_url')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.log('[StyleProfileGenerator] No photo analysis found:', error.message);
        return null;
      }

      if (!data?.color_analysis) {
        console.log('[StyleProfileGenerator] User has no color_analysis data');
        return null;
      }

      console.log('[StyleProfileGenerator] Photo analysis found:', {
        has_photo: !!data.photo_url,
        undertone: data.color_analysis.undertone,
        season: data.color_analysis.seasonal_type,
        confidence: data.color_analysis.confidence
      });

      return data.color_analysis;
    } catch (error) {
      console.error('[StyleProfileGenerator] Error fetching photo analysis:', error);
      return null;
    }
  }

  /**
   * 🎯 PRIORITY 1: Build profile from photo analysis (HIGHEST ACCURACY)
   */
  private static buildProfileFromPhotoAnalysis(
    analysis: any,
    quizAnswers: QuizColorAnswers
  ): StyleProfileResult {
    // Map AI analysis to our color profile format
    const temperature = analysis.undertone || 'neutraal'; // 'warm' | 'cool' | 'neutral'
    const seasonRaw = analysis.seasonal_type || 'lente'; // 'spring' | 'summer' | 'autumn' | 'winter'

    // Map English seasons to Dutch
    const seasonMap: Record<string, string> = {
      'spring': 'lente',
      'summer': 'zomer',
      'autumn': 'herfst',
      'winter': 'winter'
    };
    const season = seasonMap[seasonRaw] || seasonRaw;

    // Calculate contrast from skin + hair
    const contrast = this.calculatePhotoContrast(
      analysis.skin_tone,
      analysis.hair_color
    );

    // Calculate chroma from seasonal type
    const chroma = this.calculateChromaFromSeason(seasonRaw);

    // Build palette name
    const paletteName = `${season.charAt(0).toUpperCase() + season.slice(1)} (geanalyseerd via AI)`;

    // Build notes from best colors
    const notes: string[] = [
      `Je ondertoon is ${temperature}.`,
      `Je seizoen is ${season}.`,
      `Contrast niveau: ${contrast}.`
    ];

    if (analysis.best_colors && Array.isArray(analysis.best_colors)) {
      const topColors = analysis.best_colors.slice(0, 3).join(', ');
      notes.push(`Kleuren die je flatteren: ${topColors}.`);
    }

    if (analysis.avoid_colors && Array.isArray(analysis.avoid_colors) && analysis.avoid_colors.length > 0) {
      const avoidColors = analysis.avoid_colors.slice(0, 2).join(', ');
      notes.push(`Vermijd: ${avoidColors}.`);
    }

    // Still detect archetype from quiz
    const archetypeResult = ArchetypeDetector.detect(quizAnswers, null);

    console.log('[StyleProfileGenerator] ✅ Profile from photo analysis:', {
      temperature,
      season,
      contrast,
      chroma,
      paletteName,
      confidence: analysis.confidence,
      archetype: archetypeResult.primary
    });

    return {
      colorProfile: {
        temperature,
        season,
        contrast,
        chroma,
        value: contrast, // Same as contrast for compatibility
        paletteName,
        notes
      },
      archetype: archetypeResult.primary,
      secondaryArchetype: archetypeResult.secondary,
      confidence: analysis.confidence || 0.9, // AI analysis is highly confident
      dataSource: 'photo_analysis'
    };
  }

  /**
   * Calculate contrast from skin tone + hair color (OBJECTIVE)
   */
  private static calculatePhotoContrast(
    skinTone: string,
    hairColor: string
  ): string {
    if (!skinTone || !hairColor) return 'medium';

    const skin = skinTone.toLowerCase();
    const hair = hairColor.toLowerCase();

    // HIGH CONTRAST: Light skin + dark hair OR deep skin + light hair
    if (
      (['fair', 'light'].some(s => skin.includes(s)) &&
       ['black', 'dark brown', 'dark'].some(h => hair.includes(h)))
      ||
      (['deep', 'tan', 'dark'].some(s => skin.includes(s)) &&
       ['blonde', 'light', 'grey', 'white'].some(h => hair.includes(h)))
    ) {
      return 'hoog';
    }

    // LOW CONTRAST: Similar tones
    if (
      (['fair', 'light'].some(s => skin.includes(s)) &&
       ['blonde', 'light brown', 'light'].some(h => hair.includes(h)))
      ||
      (['deep', 'tan'].some(s => skin.includes(s)) &&
       ['brown', 'black', 'dark'].some(h => hair.includes(h)))
    ) {
      return 'laag';
    }

    // MEDIUM: Everything else
    return 'medium';
  }

  /**
   * Calculate chroma (saturation) from seasonal type (COLOR THEORY)
   */
  private static calculateChromaFromSeason(season: string): string {
    const s = season.toLowerCase();

    // SPRING: Bright, warm, high saturation
    if (s.includes('spring') || s === 'lente') {
      return 'gedurfd';
    }

    // SUMMER: Soft, cool, low saturation
    if (s.includes('summer') || s === 'zomer') {
      return 'zacht';
    }

    // AUTUMN: Muted, warm, medium saturation
    if (s.includes('autumn') || s === 'herfst') {
      return 'gemiddeld';
    }

    // WINTER: Bold, cool, high saturation
    if (s.includes('winter') || s === 'winter') {
      return 'gedurfd';
    }

    // Fallback
    return 'gemiddeld';
  }
}
