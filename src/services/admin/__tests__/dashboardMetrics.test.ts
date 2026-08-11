/**
 * Regressietest voor de crash van het admin-dashboard.
 *
 * Repro: een admin opent /admin. De RPC `get_dashboard_metrics` slaagt,
 * dus `metrics` is een object en het dashboard rendert de vier tegels.
 * Tegel 2 leest `metrics?.growth.last_7d`. De optional chain dekt alleen
 * `metrics`, niet `growth`. Sinds migratie
 * 20251103103800_20251103_fix_dashboard_metrics_recursion.sql levert de
 * functie een plattere payload zonder `growth`, `engagement`, `referrals`
 * en `admin_count`, dus `undefined.last_7d` gooit een TypeError tijdens de
 * render. De ErrorBoundary vangt de hele pagina af: "Er ging iets mis".
 * Elke keer opnieuw, want de payload is altijd hetzelfde.
 *
 * De fix zit in de service: die vertaalt beide payload-vormen naar één
 * compleet DashboardMetrics-object, zodat de UI nooit meer op een
 * ontbrekende sleutel stuit.
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabaseClient', () => ({
  supabase: () => null,
}));

import { normalizeDashboardMetrics } from '@/services/admin/adminService';

/** Wat get_dashboard_metrics() vandaag teruggeeft (migratie 20251103103800). */
const HUIDIGE_PAYLOAD = {
  total_users: 240,
  premium_users: 18,
  active_users_last_7_days: 31,
  quiz_completion_rate: 0.25,
  tier_breakdown: { free: 210, premium: 12, founder: 6 },
};

/** Wat de UI verwachtte: de vorm van migratie 20251020135118. */
const LEGACY_PAYLOAD = {
  total_users: 240,
  admin_count: 3,
  tier_breakdown: { free: 210, premium: 12, founder: 6 },
  growth: { last_7d: 31, last_30d: 88, last_90d: 140 },
  engagement: { with_style_profile: 90, with_saved_outfits: 40, with_quiz_completed: 60 },
  referrals: { users_with_referrals: 12, total_referrals: 20 },
};

describe('normalizeDashboardMetrics', () => {
  it('legt vast waarom het dashboard crashte: de huidige payload heeft geen growth', () => {
    expect((HUIDIGE_PAYLOAD as Record<string, unknown>).growth).toBeUndefined();
    expect(() => (HUIDIGE_PAYLOAD as any).growth.last_7d).toThrow(TypeError);
  });

  it('vult de huidige payload aan tot een compleet object', () => {
    const m = normalizeDashboardMetrics(HUIDIGE_PAYLOAD);

    expect(m).not.toBeNull();
    expect(m!.total_users).toBe(240);
    // active_users_last_7_days is de nieuwe naam van growth.last_7d
    expect(m!.growth.last_7d).toBe(31);
    expect(m!.growth.last_30d).toBe(0);
    expect(m!.tier_breakdown.premium).toBe(12);
    // 0.25 van 240 gebruikers = 60 afgeronde quiz-afrondingen
    expect(m!.engagement.with_quiz_completed).toBe(60);
    expect(m!.referrals.total_referrals).toBe(0);
  });

  it('laat de legacy payload ongemoeid', () => {
    const m = normalizeDashboardMetrics(LEGACY_PAYLOAD);

    expect(m!.admin_count).toBe(3);
    expect(m!.growth).toEqual({ last_7d: 31, last_30d: 88, last_90d: 140 });
    expect(m!.engagement.with_quiz_completed).toBe(60);
    expect(m!.referrals).toEqual({ users_with_referrals: 12, total_referrals: 20 });
  });

  it('overleeft een lege of onverwachte payload zonder te gooien', () => {
    for (const payload of [{}, { total_users: 'veel' }, [], 'kapot']) {
      const m = normalizeDashboardMetrics(payload);
      expect(m!.total_users).toBe(0);
      expect(m!.growth.last_7d).toBe(0);
      expect(m!.tier_breakdown.founder).toBe(0);
      expect(m!.engagement.with_quiz_completed).toBe(0);
    }
  });

  it('geeft null terug als er geen payload is', () => {
    expect(normalizeDashboardMetrics(null)).toBeNull();
    expect(normalizeDashboardMetrics(undefined)).toBeNull();
  });

  it('rekent geen quiz-percentage uit zonder gebruikers', () => {
    const m = normalizeDashboardMetrics({ total_users: 0, quiz_completion_rate: 0.5 });
    expect(m!.engagement.with_quiz_completed).toBe(0);
  });
});
