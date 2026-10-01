/**
 * Bouwt een TasteProfileInput uit de bestaande quiz-antwoorden
 * (localStorage LS_KEYS.QUIZ_ANSWERS). Tijdelijk: zodra plan 4 de onboarding
 * v2 met dit-of-dat-paren heeft, komt het profiel uit taste_profiles.
 *
 * Expliciete quiz-antwoorden (fit, prints, neutrals, lightness) worden assen
 * met zekerheid 1: de bezoeker heeft ze zelf gekozen.
 */
import { GELEGENHEDEN, legeAssen, type Gelegenheid, type Geslacht, type TasteProfileInput } from './types';

const MAX_GELEGENHEDEN = 3;
const STANDAARD_BUDGET_MAX = 150;

function isGelegenheid(x: string): x is Gelegenheid {
  return (GELEGENHEDEN as readonly string[]).includes(x);
}

function tekst(x: unknown): string | null {
  return typeof x === 'string' && x.trim() ? x.trim().toLowerCase() : null;
}

export function profielVanQuizAnswers(
  answers: Record<string, any> | null | undefined,
  sessionId: string
): TasteProfileInput | null {
  if (!answers || typeof answers !== 'object') return null;

  const g = tekst(answers.gender);
  const gender: Geslacht = g === 'male' || g === 'female' ? g : 'unisex';

  const occasions = (Array.isArray(answers.occasions) ? answers.occasions : [])
    .map((o: unknown) => String(o).toLowerCase().trim())
    .filter(isGelegenheid)
    .slice(0, MAX_GELEGENHEDEN);
  if (occasions.length === 0) occasions.push('casual');

  let budget_min = 0;
  let budget_max = STANDAARD_BUDGET_MAX;
  const b = answers.budget;
  if (b && typeof b === 'object' && typeof b.max === 'number' && b.max > 0) {
    budget_max = b.max;
    budget_min = typeof b.min === 'number' ? Math.max(0, Math.min(b.min, b.max)) : 0;
  } else if (typeof answers.budgetRange === 'number' && answers.budgetRange > 0) {
    budget_max = answers.budgetRange;
  }

  const axes = legeAssen();
  const fit = tekst(answers.fit);
  if (fit === 'slim' || fit === 'regular' || fit === 'relaxed' || fit === 'oversized') {
    axes.silhouette = { value: fit, confidence: 1 };
  }
  const prints = tekst(answers.prints);
  if (prints === 'effen' || prints === 'subtiel' || prints === 'statement') {
    axes.pattern = { value: prints, confidence: 1 };
  }
  const neutrals = tekst(Array.isArray(answers.neutrals) ? answers.neutrals[0] : answers.neutrals);
  if (neutrals === 'warm' || neutrals === 'koel' || neutrals === 'neutraal') {
    axes.color_temp = { value: neutrals, confidence: 1 };
  }
  // Quizstap 4 (src/data/quizSteps.ts, field 'lightness', verplicht): dezelfde
  // drie waarden als LIGHTNESS in scripts/keten/tagging.ts, dus get_kandidaten
  // kan er rechtstreeks op scoren (pa.lightness = a.as_waarde).
  const lightness = tekst(answers.lightness);
  if (lightness === 'licht' || lightness === 'medium' || lightness === 'donker') {
    axes.lightness = { value: lightness, confidence: 1 };
  }

  return {
    user_id: null,
    session_id: sessionId,
    gender,
    occasions,
    budget_min,
    budget_max,
    nogo_product_ids: [],
    choices: [],
    axes,
    liked_product_ids: [],
    disliked_product_ids: [],
  };
}
