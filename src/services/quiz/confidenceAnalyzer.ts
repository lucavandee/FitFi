/**
 * Quiz Confidence Analyzer
 *
 * Detecteert wanneer gebruikers diffuse/inconsistente antwoorden geven
 * en berekent confidence scores voor style profile resultaten.
 *
 * Use cases:
 * - Random clicks zonder duidelijke voorkeur
 * - Inconsistente color/style keuzes
 * - Diffuse visual preference swipes
 */

interface QuizAnswers {
  [key: string]: any;
}

interface ConfidenceAnalysis {
  overallConfidence: number; // 0-100
  colorConfidence: number;
  styleConfidence: number;
  isAmbiguous: boolean;
  recommendations: string[];
  explanation: string;
}

/**
 * Analyseert quiz antwoorden en berekent confidence score
 */
export function analyzeQuizConfidence(answers: QuizAnswers): ConfidenceAnalysis {
  const scores: number[] = [];
  const recommendations: string[] = [];

  // 1. Style Consistency Check
  const styleScore = analyzeStyleConsistency(answers);
  scores.push(styleScore);

  // 2. Color Preference Consistency
  const colorScore = analyzeColorConsistency(answers);
  scores.push(colorScore);

  // 3. Visual Preference Variance
  const visualScore = analyzeVisualPreferenceConsistency(answers);
  scores.push(visualScore);

  // 4. Time Spent Analysis (rushed = lower confidence)
  const timeScore = analyzeQuizTiming(answers);
  if (timeScore < 50) {
    scores.push(timeScore);
  }

  // Calculate overall confidence
  const overallConfidence = Math.round(
    scores.reduce((sum, score) => sum + score, 0) / scores.length
  );

  const colorConfidence = colorScore;
  const styleConfidence = styleScore;
  const isAmbiguous = overallConfidence < 60;

  // Generate recommendations based on confidence
  if (isAmbiguous) {
    recommendations.push(
      'Je stijl lijkt veelzijdig en eclectisch - dat betekent dat je in meerdere richtingen kunt!'
    );
  }

  if (colorScore < 60) {
    recommendations.push(
      'Je kleurvoorkeur is flexibel. Probeer zowel warme als koele kleuren uit om te zien wat je het beste staat.'
    );
  }

  if (styleScore < 60) {
    recommendations.push(
      'Je combineert elementen uit verschillende stijlen. Dit geeft je veel vrijheid in je kledingkeuzes!'
    );
  }

  if (visualScore < 50) {
    recommendations.push(
      'Je visuele voorkeuren variëren sterk. We adviseren om verschillende looks uit te proberen.'
    );
  }

  // Generate explanation
  const explanation = generateConfidenceExplanation(
    overallConfidence,
    isAmbiguous,
    styleScore,
    colorScore
  );

  return {
    overallConfidence,
    colorConfidence,
    styleConfidence,
    isAmbiguous,
    recommendations,
    explanation
  };
}

/**
 * Check style consistency across answers
 */
function analyzeStyleConsistency(answers: QuizAnswers): number {
  const styleAnswers = [
    answers.style_preference,
    answers.occasion_preference,
    answers.formality_level,
    answers.personality_traits
  ].filter(Boolean);

  if (styleAnswers.length === 0) return 70; // Default middle score

  // Check for contradictions
  const hasMinimalist = styleAnswers.some((a: any) =>
    String(a).toLowerCase().includes('minimalist')
  );
  const hasMaximalist = styleAnswers.some((a: any) =>
    String(a).toLowerCase().includes('bold') || String(a).toLowerCase().includes('statement')
  );

  if (hasMinimalist && hasMaximalist) {
    return 45; // Contradictory
  }

  // Check for consistent patterns
  const casualAnswers = styleAnswers.filter((a: any) =>
    String(a).toLowerCase().includes('casual') ||
    String(a).toLowerCase().includes('relaxed')
  ).length;

  const formalAnswers = styleAnswers.filter((a: any) =>
    String(a).toLowerCase().includes('formal') ||
    String(a).toLowerCase().includes('professional')
  ).length;

  if (casualAnswers > 0 && formalAnswers > 0 && casualAnswers === formalAnswers) {
    return 55; // Mixed signals
  }

  // Consistent answers = high confidence
  if (casualAnswers >= 2 || formalAnswers >= 2) {
    return 85;
  }

  return 70; // Moderate confidence
}

/**
 * Analyze color answer consistency
 */
function analyzeColorConsistency(answers: QuizAnswers): number {
  const colorAnswers = [
    answers.favorite_colors,
    answers.color_preference,
    answers.skin_tone,
    answers.hair_color,
    answers.eye_color
  ].filter(Boolean);

  if (colorAnswers.length < 2) return 70;

  // Check for warm vs cool consistency
  const warmColors = ['warm', 'yellow', 'orange', 'red', 'gold', 'brown', 'beige'];
  const coolColors = ['cool', 'blue', 'green', 'purple', 'silver', 'grey', 'pink'];

  const warmCount = colorAnswers.filter((a: any) =>
    warmColors.some(c => String(a).toLowerCase().includes(c))
  ).length;

  const coolCount = colorAnswers.filter((a: any) =>
    coolColors.some(c => String(a).toLowerCase().includes(c))
  ).length;

  // Equal warm and cool = ambiguous
  if (warmCount === coolCount && warmCount > 0) {
    return 50;
  }

  // Clear preference = high confidence
  if (warmCount >= 2 || coolCount >= 2) {
    return 85;
  }

  return 65;
}

/**
 * Analyze visual preference swipe patterns
 */
function analyzeVisualPreferenceConsistency(answers: QuizAnswers): number {
  // Check swipe data if available
  const swipeData = answers.visual_preferences || answers.mood_photo_swipes;

  if (!swipeData) return 70; // No swipe data = default

  if (Array.isArray(swipeData)) {
    const likes = swipeData.filter((s: any) => s.liked || s.action === 'like').length;
    const total = swipeData.length;

    if (total === 0) return 70;

    const likeRatio = likes / total;

    // Like everything (50%+) or nothing (<20%) = indecisive
    if (likeRatio > 0.5 || likeRatio < 0.2) {
      return 45;
    }

    // Moderate selection = good confidence
    if (likeRatio >= 0.3 && likeRatio <= 0.4) {
      return 80;
    }

    return 65;
  }

  return 70;
}

/**
 * Analyze time spent on quiz (rushed = lower confidence)
 */
function analyzeQuizTiming(answers: QuizAnswers): number {
  const startTime = answers._quiz_start_time;
  const endTime = answers._quiz_end_time;

  if (!startTime || !endTime) return 100; // No timing data

  const timeSpentSeconds = (endTime - startTime) / 1000;
  const expectedMinTime = 60; // 1 minute minimum
  const expectedMaxTime = 600; // 10 minutes max

  // Too fast = rushed
  if (timeSpentSeconds < expectedMinTime) {
    return 40;
  }

  // Reasonable time = good
  if (timeSpentSeconds >= expectedMinTime && timeSpentSeconds <= expectedMaxTime) {
    return 85;
  }

  // Too slow = maybe left tab open
  return 60;
}

/**
 * Generate human-readable explanation
 */
function generateConfidenceExplanation(
  overall: number,
  isAmbiguous: boolean,
  styleScore: number,
  colorScore: number
): string {
  if (overall >= 80) {
    return 'Je hebt een duidelijk en consistent stijlprofiel. De aanbevelingen zijn specifiek afgestemd op jouw voorkeuren.';
  }

  if (overall >= 60) {
    return 'Je stijl heeft wat variatie, wat betekent dat je flexibel bent in je kledingkeuzes. De aanbevelingen geven je een goede richting, maar experimenteer gerust!';
  }

  // Ambiguous case
  const parts: string[] = [
    'Je resultaten tonen een veelzijdige stijl.'
  ];

  if (styleScore < 60) {
    parts.push('Je combineert elementen uit verschillende stijlen');
  }

  if (colorScore < 60) {
    parts.push('en je kunt zowel in warme als koele kleuren stralen afhankelijk van de context');
  }

  parts.push('Dit geeft je veel vrijheid om te experimenteren met verschillende looks!');

  return parts.join(' ') + '.';
}

/**
 * Get confidence badge for UI display
 */
export function getConfidenceBadge(confidence: number): {
  label: string;
  color: string;
  icon: string;
} {
  if (confidence >= 80) {
    return {
      label: 'Zeer specifiek',
      color: 'green',
      icon: '✓'
    };
  }

  if (confidence >= 60) {
    return {
      label: 'Goed beeld',
      color: 'blue',
      icon: '○'
    };
  }

  return {
    label: 'Veelzijdig profiel',
    color: 'orange',
    icon: '◐'
  };
}

/**
 * Should show ambiguity warning?
 */
export function shouldShowAmbiguityWarning(analysis: ConfidenceAnalysis): boolean {
  return analysis.isAmbiguous && analysis.overallConfidence < 55;
}
