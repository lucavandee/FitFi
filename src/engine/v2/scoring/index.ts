import type {
  OccasionKey,
  ScoredProduct,
  ScoreBreakdown,
  Season,
  UserStyleProfile,
} from '../types';
import { scoreArchetypeFit } from './archetype';
import { scoreColor } from './color';
import { scoreFit } from './fit';
import { scoreMaterial } from './material';
import { scorePrints } from './prints';
import { scoreBudget } from './budget';
import { scoreGoals } from './goals';
import { scoreOccasion } from './occasion';
import { scoreSeason } from './season';
import { scoreMoodboard } from './moodboard';
import { scoreQuality } from './quality';
import { scoreBrand } from './brand';

export const BASE_WEIGHTS: ScoreBreakdown = {
  archetype: 0.22,
  color: 0.14,
  occasion: 0.12,
  material: 0.09,
  budget: 0.08,
  moodboard: 0.07,
  fit: 0.07,
  goals: 0.06,
  brand: 0.05,
  season: 0.05,
  prints: 0.03,
  quality: 0.02,
};

export function computeProductScore(
  product: ScoredProduct,
  profile: UserStyleProfile,
  occasion: OccasionKey,
  season: Season
): void {
  const archetype = scoreArchetypeFit(product, profile);
  product.archetypeFit = archetype.byArchetype;

  const color = scoreColor(product, profile);
  const occasionRes = scoreOccasion(product, occasion);
  const material = scoreMaterial(product, profile);
  const budget = scoreBudget(product, profile);
  const moodboard = scoreMoodboard(product, profile);
  const fit = scoreFit(product, profile);
  const goals = scoreGoals(product, profile);
  const season_ = scoreSeason(product, season);
  const prints = scorePrints(product, profile);
  const quality = scoreQuality(product);
  const brand = scoreBrand(product, profile);

  const breakdown: ScoreBreakdown = {
    archetype: archetype.score,
    color: color.score,
    occasion: occasionRes.score,
    material: material.score,
    budget: budget.score,
    moodboard: moodboard.score,
    fit: fit.score,
    goals: goals.score,
    season: season_.score,
    prints: prints.score,
    quality: quality.score,
    brand: brand.score,
  };

  const weights = BASE_WEIGHTS;
  const weightedSum =
    weights.archetype * breakdown.archetype +
    weights.color * breakdown.color +
    weights.occasion * breakdown.occasion +
    weights.material * breakdown.material +
    weights.budget * breakdown.budget +
    weights.moodboard * breakdown.moodboard +
    weights.fit * breakdown.fit +
    weights.goals * breakdown.goals +
    weights.season * breakdown.season +
    weights.prints * breakdown.prints +
    weights.quality * breakdown.quality +
    weights.brand * breakdown.brand;

  const archetypePenalty =
    archetype.score < 0.2 ? 0.6 : archetype.score < 0.35 ? 0.85 : 1;
  const occasionPenalty = occasionRes.score < 0.2 ? 0.85 : 1;
  const budgetPenalty = budget.score < 0.2 ? 0.8 : 1;
  const multiplier = archetypePenalty * occasionPenalty * budgetPenalty;

  product.score = Math.max(0, Math.min(1, weightedSum * multiplier));
  product.breakdown = breakdown;
  product.reasons = [
    archetype.reason,
    color.reason,
    occasionRes.reason,
    material.reason,
    budget.reason,
    moodboard.reason,
    fit.reason,
    goals.reason,
    season_.reason,
    prints.reason,
    quality.reason,
    brand.reason,
  ];
}
