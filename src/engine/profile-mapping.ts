import { StylePreferences } from './types';
// @ts-expect-error typed via ambient d.ts
import { DUTCH_ARCHETYPES, mapAnswersToArchetype } from '../config/profile-mapping.js';

/**
 * Converts array of style preferences (from quiz) to StylePreferences object
 * Supports multiple style selections with equal weighting
 *
 * @param styleArray - Array of selected styles from quiz
 * @returns StylePreferences object with scores
 */
export function convertStyleArrayToPreferences(styleArray: string[]): StylePreferences {
  const preferences: StylePreferences = {
    casual: 0,
    formal: 0,
    sporty: 0,
    vintage: 0,
    minimalist: 0
  };

  if (!styleArray || !Array.isArray(styleArray) || styleArray.length === 0) {
    return preferences;
  }

  // Weight per selection (equal distribution)
  const weight = 1.0 / styleArray.length;

  // Map new style values to legacy preferences
  const styleMapping: Record<string, Partial<StylePreferences>> = {
    // Shared options
    'minimalist': { minimalist: 1.0 },
    'classic': { formal: 0.8, minimalist: 0.3 },
    'streetwear': { casual: 0.7, sporty: 0.5 },

    // Female options
    'bohemian': { casual: 0.6, vintage: 0.5 },
    'romantic': { formal: 0.5, casual: 0.3 },
    'edgy': { casual: 0.7, sporty: 0.3 },

    // Male options
    'smart-casual': { casual: 0.6, formal: 0.6 },
    'athletic': { sporty: 1.0 },
    'rugged': { casual: 0.7, sporty: 0.3 },

    // Non-binary options
    'androgynous': { minimalist: 0.7, casual: 0.4 },

    // Legacy options (backwards compatibility)
    'casual': { casual: 1.0 },
    'formal': { formal: 1.0 },
    'sporty': { sporty: 1.0 },
    'vintage': { vintage: 1.0 }
  };

  // Apply mappings
  styleArray.forEach(style => {
    const normalized = style.toLowerCase().trim();
    const mapping = styleMapping[normalized];

    if (mapping) {
      Object.entries(mapping).forEach(([key, value]) => {
        preferences[key as keyof StylePreferences] += value * weight;
      });
    }
  });

  // Normalize scores to 0-1 range
  const maxScore = Math.max(...Object.values(preferences));
  if (maxScore > 0) {
    Object.keys(preferences).forEach(key => {
      preferences[key as keyof StylePreferences] /= maxScore;
    });
  }

  return preferences;
}

/**
 * Interface for archetype score result
 */
interface ArchetypeScoreResult {
  archetype: string;
  score: number;
}

/**
 * Interface for profile analysis result
 */
interface ProfileAnalysisResult {
  dominantArchetype: string;
  secondaryArchetype: string;
  mixFactor: number; // 0-1 value indicating how much the secondary archetype influences (0 = pure dominant)
  archetypeScores: ArchetypeScoreResult[];
}

/**
 * Analyzes a user's style preferences to determine their archetype profile
 * 
 * @param stylePreferences - User's style preferences
 * @returns Profile analysis result with dominant and secondary archetypes
 */
export function analyzeUserProfile(stylePreferences: StylePreferences): ProfileAnalysisResult {
  // Map style preferences to archetype scores
  const archetypeScores = calculateArchetypeScores(stylePreferences);
  
  // Sort by score (highest first)
  archetypeScores.sort((a, b) => b.score - a.score);
  
  // Default profile for when no scores are available
  const defaultProfile: ProfileAnalysisResult = {
    dominantArchetype: 'casual_chic',
    secondaryArchetype: 'klassiek',
    mixFactor: 0.3,
    archetypeScores: []
  };
  
  // Guard against empty or undefined scores
  if (!archetypeScores?.length) {
    return defaultProfile;
  }
  
  // Get dominant and secondary archetypes
  const dominantArchetype = archetypeScores[0]?.archetype ?? 'casual_chic';
  const secondaryArchetype = archetypeScores[1]?.archetype ?? 'klassiek';
  
  // Calculate mix factor (how much the secondary influences)
  // If dominant score is much higher, mix factor is low
  // If scores are close, mix factor is high
  let mixFactor = 0;
  if (archetypeScores.length >= 2) {
    const dominantScore = archetypeScores[0]?.score ?? 0;
    const secondaryScore = archetypeScores[1]?.score ?? 0;
    
    if (dominantScore > 0) {
      mixFactor = Math.min(secondaryScore / dominantScore, 1);
    }
  }
  
  return {
    dominantArchetype,
    secondaryArchetype,
    mixFactor,
    archetypeScores
  };
}

/**
 * Calculates scores for each archetype based on style preferences
 * 
 * @param stylePreferences - User's style preferences
 * @returns Array of archetype scores
 */
function calculateArchetypeScores(stylePreferences: StylePreferences): ArchetypeScoreResult[] {
  const archetypeScores: ArchetypeScoreResult[] = [];
  
  // Define weights for each style preference in relation to archetypes
  const archetypeWeights: Record<string, Record<string, number>> = {
    'klassiek': {
      formal: 1.0,
      minimalist: 0.8,
      casual: 0.2,
      sporty: 0.1,
      vintage: 0.4
    },
    'casual_chic': {
      casual: 0.9,
      minimalist: 0.6,
      formal: 0.5,
      sporty: 0.3,
      vintage: 0.3
    },
    'urban': {
      sporty: 0.8,
      casual: 0.7,
      minimalist: 0.5,
      formal: 0.2,
      vintage: 0.1
    },
    'streetstyle': {
      sporty: 1.0,
      casual: 0.7,
      vintage: 0.4,
      minimalist: 0.2,
      formal: 0.1
    },
    'retro': {
      vintage: 1.0,
      casual: 0.5,
      formal: 0.4,
      minimalist: 0.3,
      sporty: 0.2
    },
    'luxury': {
      formal: 1.0,
      minimalist: 0.7,
      vintage: 0.5,
      casual: 0.3,
      sporty: 0.1
    }
  };
  
  // Calculate score for each archetype
  Object.keys(DUTCH_ARCHETYPES).forEach(archetypeId => {
    const weights = archetypeWeights[archetypeId] || {};
    let score = 0;
    
    // Sum weighted preference values
    Object.entries(stylePreferences).forEach(([style, value]) => {
      const weight = weights[style] || 0;
      score += value * weight;
    });
    
    archetypeScores.push({
      archetype: archetypeId,
      score
    });
  });
  
  return archetypeScores;
}

/**
 * Determines the most suitable archetypes based on quiz answers
 * Returns both primary and secondary archetypes
 * 
 * @param answers - User's quiz answers
 * @param stylePreferences - Optional style preferences to consider
 * @returns Object containing primary and secondary archetypes
 */
export function determineArchetypesFromAnswers(
  answers: Record<string, any>,
  stylePreferences?: StylePreferences
): { primaryArchetype: string; secondaryArchetype: string; mixFactor: number } {
  // If we have style preferences, use them for more accurate analysis
  if (stylePreferences) {
    const profileAnalysis = analyzeUserProfile(stylePreferences);
    return {
      primaryArchetype: profileAnalysis.dominantArchetype,
      secondaryArchetype: profileAnalysis.secondaryArchetype,
      mixFactor: profileAnalysis.mixFactor
    };
  }
  
  // Otherwise, use the existing mapping function for primary archetype
  const primaryArchetype = mapAnswersToArchetype(answers);
  
  // For secondary archetype, we'll use a different approach
  // We'll look at secondary signals in the answers
  let secondaryArchetype = determineSecondaryArchetype(answers, primaryArchetype);
  
  // Default mix factor - can be adjusted based on answer confidence
  const mixFactor = 0.3; // 30% influence from secondary archetype
  
  return {
    primaryArchetype,
    secondaryArchetype,
    mixFactor
  };
}

/**
 * Determines a secondary archetype based on quiz answers
 * 
 * @param answers - User's quiz answers
 * @param primaryArchetype - The already determined primary archetype
 * @returns A secondary archetype that's different from the primary
 */
function determineSecondaryArchetype(answers: Record<string, any>, primaryArchetype: string): string {
  // Define complementary archetypes that work well together
  const complementaryArchetypes: Record<string, string[]> = {
    'klassiek': ['casual_chic', 'luxury'],
    'casual_chic': ['klassiek', 'urban'],
    'urban': ['streetstyle', 'casual_chic'],
    'streetstyle': ['urban', 'retro'],
    'retro': ['streetstyle', 'casual_chic'],
    'luxury': ['klassiek', 'retro']
  };
  
  // Get complementary archetypes for the primary
  const complementary = complementaryArchetypes[primaryArchetype] || Object.keys(DUTCH_ARCHETYPES);
  
  // If we have style preference in answers, use that to influence secondary
  if (answers.style) {
    // Map style to archetype
    const styleMapping: Record<string, string> = {
      'minimalist': 'klassiek',
      'classic': 'klassiek',
      'bohemian': 'casual_chic',
      'streetwear': 'streetstyle',
      'vintage': 'retro',
      'luxury': 'luxury'
    };
    
    const styleArchetype = styleMapping[answers.style];
    
    // If style maps to a different archetype than primary, use it as secondary
    if (styleArchetype && styleArchetype !== primaryArchetype) {
      return styleArchetype;
    }
  }
  
  // Check occasion preferences
  if (answers.occasion && Array.isArray(answers.occasion)) {
    const occasionMapping: Record<string, string> = {
      'work': 'klassiek',
      'formal': 'luxury',
      'casual': 'casual_chic',
      'active': 'urban',
      'night': 'streetstyle',
      'festival': 'retro'
    };
    
    // Find an occasion that maps to a different archetype
    for (const occasion of answers.occasion) {
      const occasionArchetype = occasionMapping[occasion];
      if (occasionArchetype && occasionArchetype !== primaryArchetype) {
        return occasionArchetype;
      }
    }
  }
  
  // If no specific secondary found, pick the first complementary
  return complementary[0] || 'casual_chic';
}

/**
 * Generates style keywords based on archetype
 * 
 * @param archetype - Archetype ID
 * @returns Array of style keywords
 */
export function getStyleKeywords(archetype: string): string[] {
  const archetypeData = DUTCH_ARCHETYPES[archetype];
  
  if (!archetypeData) {
    return ['versatile', 'timeless', 'adaptable'];
  }
  
  return archetypeData.keywords;
}

/**
 * Combines style keywords from two archetypes with weighting
 * 
 * @param primaryArchetype - Primary archetype ID
 * @param secondaryArchetype - Secondary archetype ID
 * @param mixFactor - How much influence the secondary archetype has (0-1)
 * @returns Combined array of style keywords
 */
function getCombinedStyleKeywords(
  primaryArchetype: string,
  secondaryArchetype: string,
  mixFactor: number = 0.3
): string[] {
  // Get keywords for both archetypes
  const primaryKeywords = getStyleKeywords(primaryArchetype);
  const secondaryKeywords = getStyleKeywords(secondaryArchetype);
  
  // If archetypes are the same or mixFactor is 0, just return primary keywords
  if (primaryArchetype === secondaryArchetype || mixFactor <= 0) {
    return primaryKeywords;
  }
  
  // Calculate how many keywords to take from each archetype
  const totalKeywords = 5; // Target total keywords
  const primaryCount = Math.round(totalKeywords * (1 - mixFactor));
  const secondaryCount = totalKeywords - primaryCount;
  
  // Get unique keywords from both archetypes
  const combinedKeywords = [
    ...primaryKeywords.slice(0, primaryCount),
    ...secondaryKeywords
      .filter(keyword => !primaryKeywords.includes(keyword)) // Ensure uniqueness
      .slice(0, secondaryCount)
  ];
  
  return combinedKeywords;
}

