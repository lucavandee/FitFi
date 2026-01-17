/**
 * Profile Consistency Analyzer
 *
 * Detecteert of een gebruikersprofiel consistent is of gemengd/eclectisch.
 * Inconsistente profielen krijgen speciale guidance op de results page.
 */

import type { QuizAnswers } from "@/lib/quiz/types";

export interface ConsistencyAnalysis {
  score: number; // 0-100, higher = meer consistent
  level: 'high' | 'medium' | 'low';
  isPrimaryArchetype: boolean; // True als één archetype >50% dominant is
  topArchetypes: Array<{ name: string; score: number }>; // Top 2-3 archetypes
  conflictingAreas: string[]; // Bijv. ["style", "formality"]
  guidance: string; // Wat dit betekent voor de user
  shouldShowBanner: boolean; // Toon banner op results page
}

/**
 * Analyseert quiz-antwoorden voor consistentie
 */
export function analyzeProfileConsistency(answers: QuizAnswers): ConsistencyAnalysis {
  const scores = {
    styleConsistency: calculateStyleConsistency(answers),
    formalityConsistency: calculateFormalityConsistency(answers),
    colorConsistency: calculateColorConsistency(answers),
  };

  // Gemiddelde consistency score
  const totalScore = Math.round(
    (scores.styleConsistency + scores.formalityConsistency + scores.colorConsistency) / 3
  );

  // Bepaal level
  const level: 'high' | 'medium' | 'low' =
    totalScore >= 70 ? 'high' : totalScore >= 50 ? 'medium' : 'low';

  // Detecteer conflicting areas
  const conflictingAreas: string[] = [];
  if (scores.styleConsistency < 50) conflictingAreas.push('style');
  if (scores.formalityConsistency < 50) conflictingAreas.push('formality');
  if (scores.colorConsistency < 50) conflictingAreas.push('color');

  // Detecteer top archetypes (simulatie - in production zou dit uit de echte archetype scores komen)
  const topArchetypes = detectTopArchetypes(answers);
  const isPrimaryArchetype = topArchetypes.length > 0 && topArchetypes[0].score > 50;

  // Generate guidance
  const guidance = generateGuidance(level, topArchetypes, conflictingAreas);

  return {
    score: totalScore,
    level,
    isPrimaryArchetype,
    topArchetypes,
    conflictingAreas,
    guidance,
    shouldShowBanner: level === 'low' || (!isPrimaryArchetype && level === 'medium'),
  };
}

/**
 * Bereken style consistency (casual vs. formal vs. trendy)
 */
function calculateStyleConsistency(answers: QuizAnswers): number {
  const styleAnswers: string[] = [];

  // Verzamel style-gerelateerde antwoorden
  if (answers.stylePref) styleAnswers.push(answers.stylePref);
  if (answers.fashionGoals) styleAnswers.push(answers.fashionGoals);
  if (answers.occasionPref) styleAnswers.push(answers.occasionPref);

  // Categoriseer antwoorden
  const categories = {
    casual: 0,
    formal: 0,
    trendy: 0,
    minimal: 0,
    romantic: 0,
  };

  styleAnswers.forEach(answer => {
    const lower = answer.toLowerCase();
    if (lower.includes('casual') || lower.includes('comfy') || lower.includes('ontspannen')) {
      categories.casual++;
    }
    if (lower.includes('formal') || lower.includes('zakelijk') || lower.includes('elegant')) {
      categories.formal++;
    }
    if (lower.includes('trendy') || lower.includes('modern') || lower.includes('streetwear')) {
      categories.trendy++;
    }
    if (lower.includes('minimal') || lower.includes('simpel') || lower.includes('strak')) {
      categories.minimal++;
    }
    if (lower.includes('romantic') || lower.includes('bohemian') || lower.includes('vrouwelijk')) {
      categories.romantic++;
    }
  });

  // Bereken dominantie van hoogste categorie
  const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
  if (total === 0) return 50; // No data = neutral

  const maxScore = Math.max(...Object.values(categories));
  const dominance = (maxScore / total) * 100;

  return dominance;
}

/**
 * Bereken formality consistency (hoe consistent formal vs casual)
 */
function calculateFormalityConsistency(answers: QuizAnswers): number {
  const formalitySignals: number[] = []; // -1 = casual, 0 = neutral, 1 = formal

  // Occasion preference
  if (answers.occasionPref?.toLowerCase().includes('casual')) formalitySignals.push(-1);
  if (answers.occasionPref?.toLowerCase().includes('formal')) formalitySignals.push(1);
  if (answers.occasionPref?.toLowerCase().includes('zakelijk')) formalitySignals.push(1);

  // Fashion goals
  if (answers.fashionGoals?.toLowerCase().includes('professioneel')) formalitySignals.push(1);
  if (answers.fashionGoals?.toLowerCase().includes('ontspannen')) formalitySignals.push(-1);

  // Pattern preference (prints = casual, solid = formal)
  if (answers.patternPref?.toLowerCase().includes('print')) formalitySignals.push(-1);
  if (answers.patternPref?.toLowerCase().includes('effen')) formalitySignals.push(0.5);

  if (formalitySignals.length === 0) return 50;

  // Bereken standaarddeviatie (lage = consistent)
  const avg = formalitySignals.reduce((sum, val) => sum + val, 0) / formalitySignals.length;
  const variance = formalitySignals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / formalitySignals.length;
  const stdDev = Math.sqrt(variance);

  // Lage stdDev = hoge consistency
  // stdDev van 0 = 100%, stdDev van 1+ = 0%
  const consistency = Math.max(0, Math.min(100, (1 - stdDev) * 100));

  return consistency;
}

/**
 * Bereken color consistency (warme vs koele vs neutrale voorkeuren)
 */
function calculateColorConsistency(answers: QuizAnswers): number {
  // In production zou dit kijken naar mood photo swipes en kleur-antwoorden
  // Voor nu: simulatie based on answers

  const colorSignals: number[] = []; // -1 = cool, 0 = neutral, 1 = warm

  if (answers.colorPref) {
    const lower = answers.colorPref.toLowerCase();
    if (lower.includes('warm') || lower.includes('aarde') || lower.includes('beige')) {
      colorSignals.push(1);
    }
    if (lower.includes('koel') || lower.includes('cool') || lower.includes('blauw')) {
      colorSignals.push(-1);
    }
  }

  if (colorSignals.length === 0) return 70; // Assume consistent if no strong signals

  // Bereken spread
  const avg = colorSignals.reduce((sum, val) => sum + val, 0) / colorSignals.length;
  const variance = colorSignals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / colorSignals.length;
  const stdDev = Math.sqrt(variance);

  const consistency = Math.max(0, Math.min(100, (1 - stdDev * 2) * 100));
  return consistency;
}

/**
 * Detecteer top 2-3 archetypes (simulatie)
 * In production: gebruik echte archetype scores uit style analysis
 */
function detectTopArchetypes(answers: QuizAnswers): Array<{ name: string; score: number }> {
  // Dit zou in production uit de echte archetyping engine komen
  // Voor nu: simulatie based on quiz answers

  const archetypeScores: Record<string, number> = {
    Minimalistisch: 0,
    Romantisch: 0,
    Casual: 0,
    Chic: 0,
    Boho: 0,
    Streetwear: 0,
    Classic: 0,
  };

  // Score based on style preferences
  if (answers.stylePref?.toLowerCase().includes('minimal')) archetypeScores.Minimalistisch += 30;
  if (answers.stylePref?.toLowerCase().includes('romantic')) archetypeScores.Romantisch += 30;
  if (answers.stylePref?.toLowerCase().includes('casual')) archetypeScores.Casual += 30;
  if (answers.stylePref?.toLowerCase().includes('chic')) archetypeScores.Chic += 30;
  if (answers.stylePref?.toLowerCase().includes('boho')) archetypeScores.Boho += 30;
  if (answers.stylePref?.toLowerCase().includes('street')) archetypeScores.Streetwear += 30;
  if (answers.stylePref?.toLowerCase().includes('classic')) archetypeScores.Classic += 30;

  // Score based on fashion goals
  if (answers.fashionGoals?.toLowerCase().includes('professioneel')) {
    archetypeScores.Chic += 20;
    archetypeScores.Classic += 20;
  }
  if (answers.fashionGoals?.toLowerCase().includes('trendy')) {
    archetypeScores.Streetwear += 20;
  }
  if (answers.fashionGoals?.toLowerCase().includes('tijdloos')) {
    archetypeScores.Classic += 20;
    archetypeScores.Minimalistisch += 10;
  }

  // Convert to array and sort
  const sorted = Object.entries(archetypeScores)
    .map(([name, score]) => ({ name, score }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return sorted;
}

/**
 * Genereer guidance text op basis van consistency analysis
 */
function generateGuidance(
  level: 'high' | 'medium' | 'low',
  topArchetypes: Array<{ name: string; score: number }>,
  conflictingAreas: string[]
): string {
  if (level === 'high' && topArchetypes.length > 0) {
    return `Je hebt een duidelijk en consistent stijlprofiel als **${topArchetypes[0].name}**. De outfits hieronder passen allemaal bij deze stijl.`;
  }

  if (level === 'medium' && topArchetypes.length >= 2) {
    const top1 = topArchetypes[0].name;
    const top2 = topArchetypes[1].name;
    return `Je hebt een **gemengd profiel**: ${top1} (${topArchetypes[0].score}%) en ${top2} (${topArchetypes[1].score}%). We tonen outfits voor beide stijlen.`;
  }

  if (level === 'low') {
    const areaText = conflictingAreas.length > 0
      ? ` (vooral in ${conflictingAreas.join(', ')})`
      : '';

    if (topArchetypes.length >= 2) {
      return `Je hebt verschillende stijlvoorkeuren gekozen${areaText}. We tonen een mix van **${topArchetypes[0].name}** en **${topArchetypes[1].name}** outfits. Voor een gerichtere focus kun je de quiz opnieuw doen.`;
    }

    return `Je hebt verschillende stijlvoorkeuren gekozen${areaText}. We tonen een breed scala aan outfits. Voor meer gerichte adviezen kun je de quiz opnieuw doen en focussen op één stijlrichting.`;
  }

  // Fallback
  return "Je stijlprofiel is geanalyseerd. De outfits hieronder zijn geselecteerd op basis van jouw voorkeuren.";
}

/**
 * Helper: Bepaal of profiel "dual archetype" approach nodig heeft
 */
export function isDualArchetypeProfile(analysis: ConsistencyAnalysis): boolean {
  return (
    analysis.level === 'low' ||
    (analysis.level === 'medium' && analysis.topArchetypes.length >= 2 &&
     analysis.topArchetypes[0].score < 60)
  );
}

/**
 * Helper: Get outfit categorization labels voor mixed profiles
 */
export function getOutfitCategories(analysis: ConsistencyAnalysis): string[] {
  if (!isDualArchetypeProfile(analysis)) return [];

  return analysis.topArchetypes.slice(0, 2).map(arch => arch.name);
}
