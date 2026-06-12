/**
 * Regressietest voor de quiz-completion crash (prod, juni 2026).
 *
 * Repro: na de swipe-fase klikt de gebruiker "Bekijk de outfits" in de
 * PhaseTransition, waarna OnboardingFlowPage CalibrationStep mount met
 * loading=true. De loading-branch rendert <Spinner />; als die import
 * ontbreekt gooit React een ReferenceError ("Spinner is not defined")
 * tijdens render en vangt de ErrorBoundary de hele pagina af. De quiz
 * kan dan door niemand worden afgerond.
 *
 * Deze test rendert de component server-side (node env, geen jsdom nodig):
 * effects draaien niet, dus we raken exact de initiële loading-branch.
 */
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

vi.mock('@/context/UserContext', () => ({
  useUser: () => ({ user: null }),
}));

vi.mock('@/services/visualPreferences/calibrationService', () => ({
  CalibrationService: {},
}));

vi.mock('@/services/calibration/calibrationBridge', () => ({
  CalibrationBridge: {},
}));

vi.mock('@/services/visualPreferences/visualPreferenceService', () => ({
  VisualPreferenceService: {},
}));

vi.mock('../OutfitCalibrationCard', () => ({
  OutfitCalibrationCard: () => null,
}));

import { CalibrationStep } from '../CalibrationStep';

describe('CalibrationStep initial render (loading state)', () => {
  it('rendert de loading-spinner zonder te crashen', () => {
    let html = '';
    expect(() => {
      html = renderToString(
        <CalibrationStep sessionId="test-session" onComplete={() => {}} />
      );
    }).not.toThrow();

    expect(html).toContain('Outfits voorbereiden');
  });
});
