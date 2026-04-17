export { runEngineV2 } from './engine';
export { buildUserStyleProfile } from './buildProfile';
export { filterAndPrepare } from './candidateFilter';
export { computeProductScore, BASE_WEIGHTS } from './scoring';
export { evaluateCoherence, coherenceMultiplier, isHardMismatch } from './coherence';
export { composeOutfits } from './composer';
export { diversifyOutfits } from './diversify';
export { getCurrentSeason } from './scoring/season';
export type {
  UserStyleProfile,
  ScoredProduct,
  ScoreBreakdown,
  OutfitCandidate,
  EngineResult,
  EngineOptions,
  OccasionKey,
  GoalKey,
  FitKey,
  PrintsKey,
  NormalizedCategory,
  ArchetypeWeights,
  ColorPreference,
  BudgetProfile,
  MoodboardProfile,
} from './types';
