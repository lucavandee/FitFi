import { describe, expect, it } from 'vitest';
import { normaliseerProfiel, profileHash } from '../profileHash';
import { legeAssen, type TasteProfileInput } from '../types';

const basis: TasteProfileInput = {
  user_id: null,
  session_id: 'sessie-1',
  gender: 'male',
  occasions: ['work', 'casual'],
  budget_min: 50,
  budget_max: 150,
  nogo_product_ids: ['b', 'a'],
  choices: [
    { pair_id: 'p2', chosen_set_id: 'x', rejected_set_id: 'y', axis: 'formality' },
    { pair_id: 'p1', chosen_set_id: 'q', rejected_set_id: 'r', axis: 'pattern' },
  ],
  axes: legeAssen(),
  liked_product_ids: ['zzz'],
  disliked_product_ids: ['b', 'a'],
};

describe('normaliseerProfiel (spec 5.2.1)', () => {
  it('sorteert gelegenheden, no-go ids en keuzes', () => {
    expect(normaliseerProfiel(basis)).toBe('male|casual,work|50|150|a,b|p1:q,p2:x');
  });

  it('is onafhankelijk van de volgorde van de invoer', () => {
    const gedraaid: TasteProfileInput = {
      ...basis,
      occasions: ['casual', 'work'],
      nogo_product_ids: ['a', 'b'],
      choices: [...basis.choices].reverse(),
    };
    expect(normaliseerProfiel(gedraaid)).toBe(normaliseerProfiel(basis));
  });

  it('neemt session_id, liked ids, disliked ids en assen niet mee', () => {
    const anders: TasteProfileInput = {
      ...basis,
      session_id: 'sessie-2',
      liked_product_ids: [],
      disliked_product_ids: [],
      axes: { ...legeAssen(), formality: { value: 5, confidence: 1 } },
    };
    expect(normaliseerProfiel(anders)).toBe(normaliseerProfiel(basis));
  });

  it('verandert bij een ander budget', () => {
    expect(normaliseerProfiel({ ...basis, budget_max: 200 })).not.toBe(normaliseerProfiel(basis));
  });
});

describe('profileHash', () => {
  it('is 64 hex-tekens en gelijk voor gelijke keuzes', async () => {
    const a = await profileHash(basis);
    const b = await profileHash({ ...basis, session_id: 'iemand-anders' });
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).toBe(b);
  });

  it('verandert bij een andere keuze', async () => {
    const anders = await profileHash({
      ...basis,
      choices: [{ pair_id: 'p1', chosen_set_id: 'r', rejected_set_id: 'q', axis: 'pattern' }],
    });
    expect(anders).not.toBe(await profileHash(basis));
  });
});
