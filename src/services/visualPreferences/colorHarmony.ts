/**
 * Color Harmony Validator
 * Checks if outfit color combinations work well together
 */

interface ColorHSL {
  h: number; // Hue: 0-360
  s: number; // Saturation: 0-100
  l: number; // Lightness: 0-100
}

export class ColorHarmonyService {
  /**
   * Convert hex color to HSL
   */
  private static hexToHSL(hex: string): ColorHSL | null {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Parse hex
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Check if two colors are complementary (opposite on color wheel)
   */
  private static areComplementary(color1: ColorHSL, color2: ColorHSL): boolean {
    const hueDiff = Math.abs(color1.h - color2.h);
    return hueDiff > 150 && hueDiff < 210; // ~180° ± 30°
  }

  /**
   * Check if two colors are analogous (adjacent on color wheel)
   */
  private static areAnalogous(color1: ColorHSL, color2: ColorHSL): boolean {
    const hueDiff = Math.abs(color1.h - color2.h);
    return hueDiff < 60; // Within 60°
  }

  /**
   * Check if two colors are monochromatic (same hue, different lightness)
   */
  private static areMonochromatic(color1: ColorHSL, color2: ColorHSL): boolean {
    const hueDiff = Math.abs(color1.h - color2.h);
    return hueDiff < 15; // Same hue ± 15°
  }

  /**
   * Check if color is neutral (black, white, gray, beige)
   */
  private static isNeutral(color: ColorHSL): boolean {
    return color.s < 20; // Low saturation = neutral
  }

  /**
   * Validate outfit color harmony
   * Returns a score from 0-100 and explanation
   */
  static validateOutfitColors(dominantColors: string[]): {
    score: number;
    harmony: 'excellent' | 'good' | 'acceptable' | 'poor';
    explanation: string;
    tips?: string[];
  } {
    if (!dominantColors || dominantColors.length < 2) {
      return {
        score: 50,
        harmony: 'acceptable',
        explanation: 'Insufficient color data for analysis'
      };
    }

    // Convert all colors to HSL
    const hslColors = dominantColors
      .map(hex => this.hexToHSL(hex))
      .filter(Boolean) as ColorHSL[];

    if (hslColors.length < 2) {
      return {
        score: 50,
        harmony: 'acceptable',
        explanation: 'Could not analyze colors'
      };
    }

    let score = 50; // Start neutral
    let explanation = '';
    const tips: string[] = [];

    // Count neutrals
    const neutralCount = hslColors.filter(c => this.isNeutral(c)).length;
    const colorCount = hslColors.length - neutralCount;

    // Rule 1: Neutrals always work well
    if (neutralCount >= hslColors.length - 1) {
      score = 90;
      explanation = 'Neutrale kleuren harmoniëren perfect. Tijdloos en elegant.';
      return { score, harmony: 'excellent', explanation };
    }

    // Rule 2: Check color relationships
    if (colorCount === 2) {
      const [color1, color2] = hslColors.filter(c => !this.isNeutral(c));

      if (this.areMonochromatic(color1, color2)) {
        score = 85;
        explanation = 'Monochromatisch schema: verschillende tinten van dezelfde kleur.';
      } else if (this.areAnalogous(color1, color2)) {
        score = 80;
        explanation = 'Analoog schema: aangrenzende kleuren harmoniëren natuurlijk.';
      } else if (this.areComplementary(color1, color2)) {
        score = 75;
        explanation = 'Complementair schema: contrast dat aandacht trekt.';
        tips.push('Overweeg een neutrale tint toe te voegen voor balans');
      } else {
        score = 60;
        explanation = 'Kleurcombinatie werkt, maar geen klassiek harmonieschema.';
        tips.push('Voeg een neutrale kleur toe voor meer samenhang');
      }
    } else if (colorCount > 2) {
      // Multiple colors: check if they work together
      let harmoniousCount = 0;

      for (let i = 0; i < hslColors.length - 1; i++) {
        for (let j = i + 1; j < hslColors.length; j++) {
          const c1 = hslColors[i];
          const c2 = hslColors[j];

          if (this.isNeutral(c1) || this.isNeutral(c2)) {
            harmoniousCount++;
          } else if (
            this.areMonochromatic(c1, c2) ||
            this.areAnalogous(c1, c2) ||
            this.areComplementary(c1, c2)
          ) {
            harmoniousCount++;
          }
        }
      }

      const totalPairs = (hslColors.length * (hslColors.length - 1)) / 2;
      const harmonyRatio = harmoniousCount / totalPairs;

      if (harmonyRatio > 0.7) {
        score = 85;
        explanation = 'Uitstekende kleurbalans met meerdere harmonieuze combinaties.';
      } else if (harmonyRatio > 0.5) {
        score = 70;
        explanation = 'Goede kleurmix, de meeste combinaties werken goed samen.';
      } else {
        score = 55;
        explanation = 'Veel kleuren samen kan overweldigend zijn.';
        tips.push('Overweeg minder kleuren te gebruiken');
        tips.push('Voeg meer neutrale tinten toe voor balans');
      }
    }

    // Determine harmony level
    let harmony: 'excellent' | 'good' | 'acceptable' | 'poor';
    if (score >= 80) {
      harmony = 'excellent';
    } else if (score >= 70) {
      harmony = 'good';
    } else if (score >= 55) {
      harmony = 'acceptable';
    } else {
      harmony = 'poor';
    }

    return { score, harmony, explanation, tips: tips.length > 0 ? tips : undefined };
  }
}
