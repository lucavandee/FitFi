/**
 * Regressietest voor de 500 op style_profiles.
 *
 * De faalende request was:
 *   GET /rest/v1/style_profiles?select=*&user_id=eq.<uuid>&order=created_at.desc
 * Geen `limit`. De code eromheen doet wel `.maybeSingle()`, dus de bedoeling
 * is "pak het nieuwste profiel". Zonder `.limit(1)` haalt PostgREST alle
 * profielrijen van die gebruiker op, met alle kolommen: quiz_answers,
 * color_analysis, visual_preference_embedding en locked_embedding.
 *
 * Dat gaat op drie manieren mis, en ze versterken elkaar:
 *
 *  1. postgrest-js lost `maybeSingle()` op een GET client-side op. Bij meer
 *     dan één rij geeft het PGRST116 terug in plaats van data. Het profiel
 *     wordt dus niet hersteld.
 *  2. syncLocalToRemote gebruikt diezelfde query om te kijken of er al een
 *     profiel bestaat. Faalt die, dan denkt de sync "nog geen profiel" en
 *     doet een INSERT. Elke sync legt er zo een rij bij.
 *  3. Die groeiende set rijen wordt daarna elke paginalading integraal
 *     opgehaald, inclusief embeddings.
 *
 * De fix is `.limit(1)` op elke plek waar het nieuwste profiel wordt gezocht.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const opgevraagd: { tabel: string; limiet: number | null; volgorde: string | null }[] = [];

/** Minimale namaak van de postgrest query builder: onthoudt wat er gevraagd is. */
function nepQuery(tabel: string, rijen: unknown[]) {
  const staat = { tabel, limiet: null as number | null, volgorde: null as string | null };
  opgevraagd.push(staat);

  const builder: Record<string, unknown> = {
    select: () => builder,
    eq: () => builder,
    order: (kolom: string) => {
      staat.volgorde = kolom;
      return builder;
    },
    limit: (n: number) => {
      staat.limiet = n;
      return builder;
    },
    maybeSingle: async () => {
      // Precies het gedrag van postgrest-js: meer dan één rij is een fout.
      if (staat.limiet === null && rijen.length > 1) {
        return {
          data: null,
          error: {
            code: 'PGRST116',
            message: 'JSON object requested, multiple (or no) rows returned',
            details: `Results contain ${rijen.length} rows`,
          },
        };
      }
      return { data: rijen[0] ?? null, error: null };
    },
  };
  return builder;
}

/** Deze gebruiker heeft drie profielrijen, zoals een account dat de quiz vaker deed. */
const DRIE_RIJEN = [
  { id: 'nieuwste', quiz_answers: { a: 1 }, completed_at: '2026-08-01T00:00:00Z' },
  { id: 'ouder', quiz_answers: { a: 1 }, completed_at: '2026-05-01T00:00:00Z' },
  { id: 'oudste', quiz_answers: { a: 1 }, completed_at: '2026-01-01T00:00:00Z' },
];

vi.mock('@/lib/supabaseClient', () => ({
  supabase: () => ({
    from: (tabel: string) => nepQuery(tabel, DRIE_RIJEN),
    auth: { getUser: async () => ({ data: { user: { id: 'gebruiker-1' } } }) },
  }),
}));

vi.mock('@/utils/sessionId', () => ({ getSessionId: () => 'sessie-1' }));

const opslag = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => opslag.get(k) ?? null,
  setItem: (k: string, v: string) => void opslag.set(k, v),
  removeItem: (k: string) => void opslag.delete(k),
  clear: () => opslag.clear(),
});

import { profileSyncService } from '@/services/data/profileSyncService';

describe('profileSyncService haalt altijd één profiel op', () => {
  beforeEach(() => {
    opgevraagd.length = 0;
    opslag.clear();
  });

  it('vraagt bij restoreForUser om precies één rij', async () => {
    await profileSyncService.restoreForUser('gebruiker-1');

    const query = opgevraagd.find(q => q.tabel === 'style_profiles');
    expect(query).toBeDefined();
    expect(query!.volgorde).toBe('created_at');
    expect(query!.limiet).toBe(1);
  });

  it('herstelt het profiel ook als de gebruiker meerdere profielrijen heeft', async () => {
    // Vóór de fix gaf maybeSingle hier PGRST116 en viel het herstel stil terug
    // op het lokale profiel. Nu komt de nieuwste rij gewoon binnen.
    const hersteld = await profileSyncService.restoreForUser('gebruiker-1');
    expect(hersteld).toBe(true);
    expect(opslag.get('ff_sync_status')).toBe('synced');
  });

  it('vraagt bij getProfile om precies één rij', async () => {
    await profileSyncService.getProfile();

    const query = opgevraagd.find(q => q.tabel === 'style_profiles');
    expect(query!.limiet).toBe(1);
  });
});
