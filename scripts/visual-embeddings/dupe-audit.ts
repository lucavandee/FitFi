/**
 * Meet visuele duplicaten VOOR en NA de bestaande dedupeProductVariants.
 *
 * De vraag die dit beantwoordt: vangt de huidige (tekst-gebaseerde) dedupe de
 * productvarianten al af, of blijven er visueel identieke producten in de pool
 * die de engine als losse items kan aanbieden?
 *
 * Gebruik: npx vite-node scripts/visual-embeddings/dupe-audit.ts
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dedupeProductVariants } from '../../src/services/outfits/dedupeProductVariants';
import { cosineSim } from '../../src/engine/v2/scoring/visualCoherence';
import raw from '../../src/engine/v2/__tests__/fixtures/catalog-tagged-2026-06-11.json';

const here = dirname(fileURLToPath(import.meta.url));
const embeddings: Record<string, number[]> = JSON.parse(
  readFileSync(join(here, 'out', 'product-embeddings.json'), 'utf8')
);

const THRESHOLD = 0.98;

function mapProduct(p: any) {
  return {
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
  };
}

function countDupes(ids: string[]): { pairs: number; clusters: number[][] } {
  const withVec = ids.filter((id) => embeddings[id]);
  const parent = new Map<string, string>(withVec.map((id) => [id, id]));
  const find = (x: string): string => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)!)!);
      x = parent.get(x)!;
    }
    return x;
  };
  let pairs = 0;
  for (let i = 0; i < withVec.length; i++) {
    for (let j = i + 1; j < withVec.length; j++) {
      if (cosineSim(embeddings[withVec[i]], embeddings[withVec[j]]) > THRESHOLD) {
        pairs++;
        const a = find(withVec[i]);
        const b = find(withVec[j]);
        if (a !== b) parent.set(a, b);
      }
    }
  }
  const groups = new Map<string, string[]>();
  for (const id of withVec) {
    const root = find(id);
    groups.set(root, [...(groups.get(root) ?? []), id]);
  }
  const clusters = [...groups.values()].filter((g) => g.length > 1).map((g) => g as any);
  return { pairs, clusters };
}

const all = (raw as any[]).map(mapProduct);
const deduped = dedupeProductVariants(all as any) as any[];

const beforeIds = all.map((p) => String(p.id));
const afterIds = deduped.map((p) => String(p.id));

const before = countDupes(beforeIds);
const after = countDupes(afterIds);

const byId = new Map((raw as any[]).map((p) => [String(p.id), p]));

console.log(`Drempel: cosine > ${THRESHOLD}`);
console.log(`\nVOOR dedupe:  ${beforeIds.length} producten`);
console.log(`  duplicaat-paren:     ${before.pairs}`);
console.log(`  duplicaat-clusters:  ${before.clusters.length}`);
console.log(`\nNA dedupeProductVariants: ${afterIds.length} producten`);
console.log(`  duplicaat-paren:     ${after.pairs}`);
console.log(`  duplicaat-clusters:  ${after.clusters.length}`);
const removable = after.clusters.reduce((n, c) => n + (c.length - 1), 0);
console.log(
  `  nog te winnen:       ${removable} producten zitten in een visueel identiek cluster`
);

console.log(`\nGrootste resterende clusters:`);
[...after.clusters]
  .sort((a, b) => b.length - a.length)
  .slice(0, 8)
  .forEach((c) => {
    console.log(`  ${c.length} items:`);
    c.slice(0, 4).forEach((id: string) =>
      console.log(`     ${String(byId.get(id)?.name ?? id).slice(0, 70)}`)
    );
    if (c.length > 4) console.log(`     ... en ${c.length - 4} meer`);
  });
