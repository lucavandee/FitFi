/**
 * Audit van de tekst-gebaseerde productclassifier op de golden fixture.
 *
 * Telt producten waarvan de productnaam een eenduidige categorie-hint bevat
 * (bijvoorbeeld "short", "bomberjack", "sneakers") terwijl de classifier een
 * andere categorie toekent. Dit kwantificeert hoe vaak outfits met een
 * verkeerd geclassificeerd item worden gebouwd, en daarmee de potentie van
 * beeld-gebaseerde classificatie als correctie op tekst-heuristiek.
 *
 * Gebruik: npx vite-node scripts/visual-embeddings/classifier-audit.ts
 */
import { reclassifyProducts } from '../../src/engine/productClassifier';
import { dedupeProductVariants } from '../../src/services/outfits/dedupeProductVariants';
import raw from '../../src/engine/v2/__tests__/fixtures/catalog-tagged-2026-06-11.json';

const orig = console.log;
console.log = (...a: unknown[]) => {
  const f = typeof a[0] === 'string' ? a[0] : '';
  if (f.startsWith('[classifier')) return;
  orig(...a);
};

const mapped = (raw as any[]).map((p: any) => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  price: p.price,
  category: p.category,
  gender: p.gender,
  colors: [],
  sizes: [],
  tags: p.tags || [],
  styleTags: p.tags || [],
  description: p.description,
  inStock: true,
}));
const { classified } = reclassifyProducts(dedupeProductVariants(mapped) as any);

const NAME_HINT: Record<string, RegExp> = {
  bottom: /\b(short|shorts|broek|jeans|legging|rok)\b/i,
  outerwear: /\b(jack|jas|bomberjack|parka|blazer)\b/i,
  footwear: /\b(schoen|schoenen|sneaker|sneakers|boot|laars|slipper|sandaal|spikes)\b/i,
  top: /\b(shirt|polo|trui|hoodie|sweater|blouse)\b/i,
};

let mismatch = 0;
let checked = 0;
const examples: string[] = [];
const byShift = new Map<string, number>();

for (const p of classified as any[]) {
  const hits = Object.entries(NAME_HINT).filter(([, re]) => re.test(p.name || ''));
  if (hits.length !== 1) continue; // alleen eenduidige naamhints tellen mee
  checked++;
  const expected = hits[0][0];
  if (p.category !== expected) {
    mismatch++;
    const key = `${expected} -> ${p.category}`;
    byShift.set(key, (byShift.get(key) ?? 0) + 1);
    if (examples.length < 10) {
      examples.push(`${String(p.category).padEnd(10)} <- ${String(p.name).slice(0, 62)}`);
    }
  }
}

orig(`Producten na dedupe/classificatie: ${(classified as any[]).length}`);
orig(`Beoordeeld (eenduidige naamhint):   ${checked}`);
orig(
  `Conflicten naam vs. categorie:      ${mismatch} (${
    checked ? Math.round((mismatch / checked) * 100) : 0
  }%)`
);
orig('\nMeest voorkomende verschuivingen (verwacht -> toegewezen):');
[...byShift.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)
  .forEach(([k, n]) => orig(`  ${String(n).padStart(4)}x  ${k}`));
orig('\nVoorbeelden (toegewezen categorie <- productnaam):');
examples.forEach((e) => orig('  ' + e));
