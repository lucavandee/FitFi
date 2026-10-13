import { afterEach, describe, expect, it } from 'vitest';
import { buildUserStyleProfile } from '@/engine/v2/buildProfile';
import { SwipeAnalyzer } from '../swipeAnalyzer';
import { bewaarSwipeUitkomst } from '../swipeOpslag';
import type { MoodPhoto } from '../visualPreferenceService';

function foto(id: number, gewichten: Record<string, number>): MoodPhoto {
  return {
    id, image_url: '', mood_tags: [], dominant_colors: ['zwart'], style_attributes: {},
    archetype_weights: gewichten, active: true, display_order: id,
  };
}

const STRAAT = { STREETWEAR: 85, ATHLETIC: 40, SMART_CASUAL: 30, MINIMALIST: 20, CLASSIC: 5, BUSINESS: 5, AVANT_GARDE: 20 };
const PAK = { BUSINESS: 90, CLASSIC: 70, MINIMALIST: 35, SMART_CASUAL: 35, STREETWEAR: 5, ATHLETIC: 5, AVANT_GARDE: 10 };

function opslag() {
  const kaart = new Map<string, string>();
  return {
    kaart,
    setItem: (k: string, v: string) => void kaart.set(k, v),
    removeItem: (k: string) => void kaart.delete(k),
    getItem: (k: string) => kaart.get(k) ?? null,
  };
}

function swipe(analyzer: SwipeAnalyzer, id: number, gewichten: Record<string, number>, richting: 'left' | 'right') {
  analyzer.addSwipe(foto(id, gewichten), { mood_photo_id: id, swipe_direction: richting, response_time_ms: 900 });
}

const ANTWOORDEN = { gender: 'male', stylePreferences: ['minimalist'], occasions: ['casual'] };

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe('de swipes bereiken het stijlprofiel', () => {
  it('wie streetwear liket en pakken afwijst, krijgt meer streetwear in het profiel', () => {
    const analyzer = new SwipeAnalyzer();
    for (let i = 0; i < 10; i++) swipe(analyzer, i, STRAAT, 'right');
    for (let i = 10; i < 20; i++) swipe(analyzer, i, PAK, 'left');
    const o = opslag();
    bewaarSwipeUitkomst(o, 20, analyzer.getPattern());

    const zonder = buildUserStyleProfile(ANTWOORDEN);
    (globalThis as { window?: unknown }).window = { localStorage: o };
    const met = buildUserStyleProfile(ANTWOORDEN);

    expect(JSON.parse(o.kaart.get('ff_visual_embedding')!).STREETWEAR).toBeGreaterThan(0);
    expect(zonder.diagnostics.swipeInfluence).toBe(0);
    expect(met.diagnostics.swipeInfluence).toBeGreaterThan(0.4);
    expect(met.archetypes.STREETWEAR ?? 0).toBeGreaterThan(zonder.archetypes.STREETWEAR ?? 0);
  });

  it('zonder likes verdwijnt de stijl van een eerdere quiz op hetzelfde apparaat', () => {
    const o = opslag();
    o.setItem('ff_visual_embedding', JSON.stringify(STRAAT));
    const analyzer = new SwipeAnalyzer();
    for (let i = 0; i < 15; i++) swipe(analyzer, i, PAK, 'left');
    bewaarSwipeUitkomst(o, 15, analyzer.getPattern());
    expect(o.kaart.has('ff_visual_embedding')).toBe(false);
  });
});
