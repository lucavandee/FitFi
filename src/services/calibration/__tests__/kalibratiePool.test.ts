/**
 * De kalibratiestap vraagt dezelfde pool als de uitslag, zonder de oordelen
 * uit die stap zelf (src/services/calibration/calibrationOutfitsV2.ts).
 * Tot 21 oktober 2026 ging alleen het gender mee, en kreeg een quiz met vier
 * gelegenheden tot 500 euro een hoodie met denim rok als "formeel".
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/services/outfits/outfitService', () => ({ outfitService: { getProducts: vi.fn() } }));

import { naarKandidatenParams } from '@/services/outfits/kandidaten';
import { poolAntwoordenVoorKalibratie } from '../calibrationOutfitsV2';

const quiz = {
  gender: 'female',
  stylePreferences: ['streetwear'],
  occasions: ['casual', 'work', 'formal', 'date'],
  budget: { min: 0, max: 500 },
  fit: 'regular',
  prints: 'effen',
};

describe('poolAntwoordenVoorKalibratie', () => {
  it('stuurt gelegenheden, budget, pasvorm, print en schoentype mee', () => {
    const p = naarKandidatenParams(poolAntwoordenVoorKalibratie(quiz));
    expect(p.p_gender).toBe('female');
    expect(p.p_occasions).toEqual(['casual', 'work', 'formal', 'date']);
    expect(p.p_budget_max).toBe(500);
    expect(p.p_axes).toEqual({
      silhouette: { value: 'regular', confidence: 1 },
      pattern: { value: 'effen', confidence: 1 },
      shoe_type: { value: 'sneaker', confidence: 1 },
    });
  });

  it('laat de oordelen uit de kalibratiestap zelf weg, zodat een wissel dezelfde pool houdt', () => {
    const id = '00000000-0000-4000-8000-000000000001';
    const metOordelen = { ...quiz, calibrationRatings: { liked: [id], disliked: [] } };
    expect(naarKandidatenParams(poolAntwoordenVoorKalibratie(metOordelen))).toEqual(naarKandidatenParams(quiz));
    expect(naarKandidatenParams(metOordelen).p_liked_ids).toEqual([id]);
  });

  it('wie nog niets beoordeelde, vraagt dezelfde parameters als de uitslag', () => {
    // De vorm waarin OnboardingFlowPage de quiz aan het kalibratiescherm geeft.
    const quizData = { ...quiz, archetype: 'streetwear', colors: [], budgetRange: 500 };
    expect(naarKandidatenParams(poolAntwoordenVoorKalibratie(quizData))).toEqual(naarKandidatenParams(quiz));
  });
});
