import type { OccasionKey } from '../types';

/**
 * Leest de LLM-tagging uit de products-tabel (aangebracht via
 * apply-product-tags.sql): occ:<gelegenheid>, formality:<1-5>, fan-merch,
 * en archetype-keys in de style-kolom (komen binnen via styleTags).
 * Producten zonder deze tags krijgen neutrale info terug, zodat alle
 * scoring-aanpassingen no-ops zijn op een ongetagde catalogus.
 */

export interface LlmTagInfo {
  hasOccasionTags: boolean;
  occasions: Set<OccasionKey>;
  /** formality:1-5 feed-tag genormaliseerd naar 0-1, of null zonder tag */
  formality01: number | null;
  fanMerch: boolean;
  archetypes: Set<string>;
}

// feed-tags gebruiken quiz-keys ("sports"); de engine gebruikt "sport"
const OCC_TAG_TO_KEY: Record<string, OccasionKey> = {
  work: 'work',
  casual: 'casual',
  formal: 'formal',
  date: 'date',
  travel: 'travel',
  sport: 'sport',
  sports: 'sport',
  party: 'party',
};

const ARCHETYPE_KEYS = new Set([
  'MINIMALIST',
  'CLASSIC',
  'SMART_CASUAL',
  'STREETWEAR',
  'ATHLETIC',
  'AVANT_GARDE',
  'BUSINESS',
]);

export function readLlmTags(product: {
  tags?: string[];
  styleTags?: string[];
}): LlmTagInfo {
  const all = [...(product.tags ?? []), ...(product.styleTags ?? [])];
  const occasions = new Set<OccasionKey>();
  let formality01: number | null = null;
  let fanMerch = false;
  const archetypes = new Set<string>();

  for (const raw of all) {
    const tag = raw.trim();
    if (tag.startsWith('occ:')) {
      const key = OCC_TAG_TO_KEY[tag.slice(4).toLowerCase()];
      if (key) occasions.add(key);
    } else if (tag.startsWith('formality:')) {
      const n = Number(tag.slice(10));
      if (n >= 1 && n <= 5) formality01 = (n - 1) / 4;
    } else if (tag === 'fan-merch') {
      fanMerch = true;
    } else if (ARCHETYPE_KEYS.has(tag.toUpperCase())) {
      archetypes.add(tag.toUpperCase());
    }
  }

  return {
    hasOccasionTags: occasions.size > 0,
    occasions,
    formality01,
    fanMerch,
    archetypes,
  };
}
