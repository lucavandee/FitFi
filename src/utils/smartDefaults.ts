/**
 * Smart defaults utility for FitFi
 * Automatically detects season, suggests defaults, and provides intelligent fallbacks
 */

export interface SmartDefaults {
  season: 'lente' | 'zomer' | 'herfst' | 'winter';
  occasions: string[];
  archetype: string;
  confidence: number; // 0-1 score indicating how confident we are in these defaults
  reasoning: string;
}

/**
 * Detect current season based on date and location
 */
export function detectCurrentSeason(): 'lente' | 'zomer' | 'herfst' | 'winter' {
  const now = new Date();
  const month = now.getMonth(); // 0-11 (Jan-Dec)
  
  // Northern Hemisphere seasons (Netherlands)
  if (month >= 2 && month <= 4) {
    return 'lente'; // March-May
  } else if (month >= 5 && month <= 7) {
    return 'zomer'; // June-August
  } else if (month >= 8 && month <= 10) {
    return 'herfst'; // September-November
  } else {
    return 'winter'; // December-February
  }
}

/**
 * Get season-appropriate occasions
 */
export function getSeasonalOccasions(season: string): string[] {
  const seasonalOccasions: Record<string, string[]> = {
    'lente': ['Casual', 'Werk', 'Weekend', 'Lunch'],
    'zomer': ['Casual', 'Vakantie', 'Festival', 'Uitgaan'],
    'herfst': ['Werk', 'Casual', 'Weekend', 'Zakelijk diner'],
    'winter': ['Werk', 'Formeel', 'Feest', 'Casual']
  };
  
  return seasonalOccasions[season] || ['Casual', 'Werk'];
}

/**
 * Detect user context based on time of day and day of week
 */
export function detectUserContext(): {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayType: 'weekday' | 'weekend';
  suggestedOccasions: string[];
} {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Determine time of day
  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  if (hour >= 6 && hour < 12) {
    timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
  } else if (hour >= 17 && hour < 22) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }
  
  // Determine day type
  const dayType = (dayOfWeek === 0 || dayOfWeek === 6) ? 'weekend' : 'weekday';
  
  // Suggest occasions based on context
  let suggestedOccasions: string[];
  if (dayType === 'weekday') {
    if (timeOfDay === 'morning' || timeOfDay === 'afternoon') {
      suggestedOccasions = ['Werk', 'Zakelijk diner', 'Lunch'];
    } else {
      suggestedOccasions = ['Casual', 'Uitgaan', 'Date'];
    }
  } else {
    suggestedOccasions = ['Weekend', 'Casual', 'Uitgaan', 'Festival'];
  }
  
  return { timeOfDay, dayType, suggestedOccasions };
}

/**
 * Generate smart defaults based on current context
 */
export function generateSmartDefaults(): SmartDefaults {
  const season = detectCurrentSeason();
  const userContext = detectUserContext();
  const seasonalOccasions = getSeasonalOccasions(season);
  
  // Combine seasonal and contextual occasions
  const combinedOccasions = [
    ...userContext.suggestedOccasions,
    ...seasonalOccasions
  ];
  
  // Remove duplicates and take top 3
  const uniqueOccasions = Array.from(new Set(combinedOccasions)).slice(0, 3);
  
  // Determine archetype based on context
  let archetype = 'casual_chic'; // Default
  if (userContext.dayType === 'weekday' && (userContext.timeOfDay === 'morning' || userContext.timeOfDay === 'afternoon')) {
    archetype = 'klassiek'; // Work context
  } else if (userContext.dayType === 'weekend') {
    archetype = 'casual_chic'; // Weekend context
  }
  
  // Calculate confidence based on how specific the context is
  let confidence = 0.7; // Base confidence
  if (userContext.dayType === 'weekday' && userContext.timeOfDay === 'morning') {
    confidence = 0.9; // High confidence for work context
  } else if (userContext.dayType === 'weekend') {
    confidence = 0.8; // Good confidence for weekend
  }
  
  const reasoning = `Gedetecteerd: ${season} seizoen, ${userContext.dayType === 'weekday' ? 'werkdag' : 'weekend'}, ${userContext.timeOfDay === 'morning' ? 'ochtend' : userContext.timeOfDay === 'afternoon' ? 'middag' : userContext.timeOfDay === 'evening' ? 'avond' : 'nacht'}`;
  
  return {
    season,
    occasions: uniqueOccasions,
    archetype,
    confidence,
    reasoning
  };
}

/**
 * Get weather-appropriate suggestions (future enhancement)
 */
export function getWeatherDefaults(): Promise<Partial<SmartDefaults>> {
  // Placeholder for weather API integration
  return Promise.resolve({
    occasions: ['Casual'], // Could be adjusted based on weather
    confidence: 0.5
  });
}

export default {
  detectCurrentSeason,
  getSeasonalOccasions,
  detectUserContext,
  generateSmartDefaults,
  getWeatherDefaults
};