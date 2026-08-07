import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSessionId, isUuid, resetSessionId } from '../sessionId';

/** Minimale sessionStorage voor de node-omgeving. */
function nepOpslag() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    get length() {
      return map.size;
    },
  } as Storage;
}

beforeEach(() => {
  vi.stubGlobal('localStorage', nepOpslag());
  vi.stubGlobal('sessionStorage', nepOpslag());
  vi.stubGlobal('window', { localStorage, sessionStorage });
});

describe('isUuid', () => {
  it('herkent een geldige v4 uuid', () => {
    expect(isUuid('3f2504e0-4f89-41d3-9a0c-0305e82c3301')).toBe(true);
  });

  it('wijst af wat affiliate.ts vroeger genereerde', () => {
    // `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    expect(isUuid('1754521234567_x8k2m9qp1')).toBe(false);
  });

  it('wijst leeg, null en bijna-uuid af', () => {
    expect(isUuid(null)).toBe(false);
    expect(isUuid(undefined)).toBe(false);
    expect(isUuid('')).toBe(false);
    expect(isUuid('3f2504e0-4f89-41d3-9a0c')).toBe(false);
  });
});

describe('getSessionId', () => {
  it('geeft altijd een uuid', () => {
    expect(isUuid(getSessionId())).toBe(true);
  });

  it('houdt dezelfde waarde vast binnen een tab', () => {
    expect(getSessionId()).toBe(getSessionId());
  });

  it('vervangt een niet-uuid die er al stond', () => {
    // Dit is de kern: raakte de gebruiker eerst een affiliate-link aan, dan
    // stond er een niet-uuid in de sleutel en faalde daarna elke insert op
    // style_swipes en swipe_preferences, die allebei UUID NOT NULL zijn.
    localStorage.setItem('ff_session_id', '1754521234567_x8k2m9qp1');

    const id = getSessionId();

    expect(isUuid(id)).toBe(true);
    expect(localStorage.getItem('ff_session_id')).toBe(id);
  });

  it('respecteert een uuid die er al stond', () => {
    const bestaand = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
    localStorage.setItem('ff_session_id', bestaand);

    expect(getSessionId()).toBe(bestaand);
  });

  it('neemt een geldige uuid over uit de oude sessionStorage-sleutel', () => {
    // Zo raakt iemand die midden in de quiz zit zijn swipes niet kwijt.
    const oud = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
    sessionStorage.setItem('fitfi_session_id', oud);

    expect(getSessionId()).toBe(oud);
    expect(localStorage.getItem('ff_session_id')).toBe(oud);
  });

  it('neemt een ONgeldige waarde uit de oude sleutel niet over', () => {
    sessionStorage.setItem('fitfi_session_id', '1754521234567_x8k2m9qp1');

    const id = getSessionId();
    expect(isUuid(id)).toBe(true);
    expect(id).not.toBe('1754521234567_x8k2m9qp1');
  });

  it('resetSessionId wist beide sleutels', () => {
    const eerste = getSessionId();
    resetSessionId();
    expect(localStorage.getItem('ff_session_id')).toBeNull();
    expect(getSessionId()).not.toBe(eerste);
  });

  it('valt niet om als de opslag gooit', () => {
    const kapot = {
      getItem: () => { throw new Error('private mode'); },
      setItem: () => { throw new Error('private mode'); },
      removeItem: () => { throw new Error('private mode'); },
    } as unknown as Storage;
    vi.stubGlobal('localStorage', kapot);
    vi.stubGlobal('sessionStorage', kapot);
    vi.stubGlobal('window', { localStorage: kapot, sessionStorage: kapot });

    expect(isUuid(getSessionId())).toBe(true);
  });
});
