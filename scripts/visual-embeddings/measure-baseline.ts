/**
 * Meet de haalbaarheidsmatrix onder een VASTE seed.
 *
 * De golden baseline in haalbaarheid.test.ts was oorspronkelijk gemeten met de
 * tijdgebonden seed van de engine (Math.floor(Date.now()/300000)), waardoor de
 * uitkomst per tijdvak van 5 minuten verschilde. Dit script produceert de
 * reproduceerbare stand die als nieuwe baseline dient.
 *
 * Gebruik: npx vite-node scripts/visual-embeddings/measure-baseline.ts
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runEngineV2 } from '../../src/engine/v2/engine';
import { reclassifyProducts } from '../../src/engine/productClassifier';
import { dedupeProductVariants } from '../../src/services/outfits/dedupeProductVariants';

const here = dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(
  readFileSync(join(here, '../../src/engine/v2/__tests__/fixtures/catalog-tagged-2026-06-11.json'), 'utf8')
) as any[];

const GOLDEN_SEED = 20260805;

function mapDatabaseProduct(p: any) {
  const tags: string[] = p.tags || [];
  const style: string = p.style || '';
  return {
    id: p.id, name: p.name, brand: p.brand, price: p.price, category: p.category,
    gender: p.gender, colors: [], sizes: [], tags,
    styleTags: style ? [...tags, ...style.split(/[,;/]+/).map((s: string) => s.trim()).filter(Boolean)] : tags,
    description: p.description, inStock: p.in_stock ?? true,
  };
}

const PROFILES: Record<string, any> = {
  'man-klassiek': { gender: 'male', fit: 'regular', neutrals: 'koel', goals: ['timeless', 'professional'], budgetRange: 150, prints: 'effen' },
  'man-casual': { gender: 'male', fit: 'relaxed', neutrals: 'warm', goals: ['comfort'], budgetRange: 100, prints: 'effen' },
  'man-sportief': { gender: 'male', fit: 'slim', neutrals: 'neutraal', goals: ['comfort', 'trendy'], budgetRange: 120, prints: 'effen' },
  'vrouw-klassiek': { gender: 'female', fit: 'tailored', neutrals: 'koel', goals: ['timeless', 'professional'], budgetRange: 150, prints: 'effen' },
  'vrouw-expressief': { gender: 'female', fit: 'oversized', neutrals: 'warm', goals: ['express', 'trendy'], budgetRange: 120, prints: 'patroon' },
  'vrouw-sportief': { gender: 'female', fit: 'slim', neutrals: 'neutraal', goals: ['comfort'], budgetRange: 100, prints: 'effen' },
};
const OCCASIONS = ['work', 'casual', 'formal', 'date', 'party', 'sports', 'travel'];

const orig = console.log;
console.log = (...a: unknown[]) => {
  const f = typeof a[0] === 'string' ? a[0] : '';
  if (f.startsWith('[classifier') || f.startsWith('[ProductClassifier') || f.startsWith('[engine')) return;
  orig(...a);
};

const pools = new Map<string, any[]>();
for (const gender of ['male', 'female']) {
  const rows = raw.filter((p) => p.gender === gender || p.gender === 'unisex');
  const { classified } = reclassifyProducts(dedupeProductVariants(rows.map(mapDatabaseProduct)) as any);
  pools.set(gender, classified);
}

orig(`Gemeten met seed ${GOLDEN_SEED}\n`);
const out: Record<string, Record<string, number>> = {};
for (const [name, base] of Object.entries(PROFILES)) {
  out[name] = {};
  const cells: string[] = [];
  for (const occ of OCCASIONS) {
    const r = runEngineV2({ ...base, occasions: [occ] }, pools.get(base.gender)! as any, {
      count: 6, seed: GOLDEN_SEED,
    });
    out[name][occ] = r.outfits.length;
    cells.push(`${occ}: ${r.outfits.length}`);
  }
  orig(`  "${name}": { ${cells.join(', ')} },`);
}

const fm = runEngineV2({ ...PROFILES['man-casual'], occasions: ['work'] }, pools.get('male')! as any, {
  count: 6, seed: GOLDEN_SEED,
});
const fanMerch = fm.outfits.flatMap((o: any) =>
  (o.products || []).filter((p: any) => (p.tags || []).includes('fan-merch'))
);
orig(`\nfan-merch items in man-casual/work: ${fanMerch.length}`);
