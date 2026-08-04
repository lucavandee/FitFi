/**
 * Kwaliteitstoets van de beeld-embeddings op de diverse steekproef.
 *
 * Meet of de embeddings echt visueel signaal dragen, los van de engine:
 *  1. Categorie-overeenkomst van de dichtstbijzijnde buur (top-1 en top-5).
 *     Een sneaker hoort naast een sneaker te liggen, niet naast een jurk.
 *  2. Gemiddelde similarity binnen dezelfde categorie versus tussen
 *     verschillende categorieen (separatie).
 *  3. Random-baseline ter vergelijking.
 *
 * Gebruik: npx vite-node scripts/visual-embeddings/quality-probe.ts
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cosineSim } from '../../src/engine/v2/scoring/visualCoherence';

const here = dirname(fileURLToPath(import.meta.url));
const catalog: any[] = JSON.parse(
  readFileSync(join(here, 'out', 'diverse-catalog.json'), 'utf8')
);
const embeddings: Record<string, number[]> = JSON.parse(
  readFileSync(join(here, 'out', 'diverse-embeddings.json'), 'utf8')
);

const items = catalog
  .filter((p) => embeddings[String(p.id)])
  .map((p) => ({ id: String(p.id), category: p.category, brand: p.brand, name: p.name }));

console.log(`Steekproef: ${items.length} producten met embedding`);
const cats = new Map<string, number>();
for (const it of items) cats.set(it.category, (cats.get(it.category) ?? 0) + 1);
console.log(
  'Categorieverdeling:',
  [...cats.entries()].sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}=${n}`).join(' ')
);

// 1. Nearest-neighbour categorie-overeenkomst
let top1 = 0;
let top5 = 0;
let sameSum = 0;
let sameN = 0;
let diffSum = 0;
let diffN = 0;

for (let i = 0; i < items.length; i++) {
  const vi = embeddings[items[i].id];
  const sims: Array<{ j: number; s: number }> = [];
  for (let j = 0; j < items.length; j++) {
    if (i === j) continue;
    const s = cosineSim(vi, embeddings[items[j].id]);
    sims.push({ j, s });
    if (items[i].category === items[j].category) {
      sameSum += s;
      sameN++;
    } else {
      diffSum += s;
      diffN++;
    }
  }
  sims.sort((a, b) => b.s - a.s);
  if (items[sims[0].j].category === items[i].category) top1++;
  const hit5 = sims.slice(0, 5).filter((x) => items[x.j].category === items[i].category).length;
  top5 += hit5 / 5;
}

// Random-baseline: kans dat een willekeurig ander item dezelfde categorie heeft
let randomBaseline = 0;
for (const [, n] of cats) {
  randomBaseline += (n / items.length) * ((n - 1) / (items.length - 1));
}

console.log(`\n=== Categorie-signaal ===`);
console.log(`Top-1 buur zelfde categorie: ${((top1 / items.length) * 100).toFixed(1)}%`);
console.log(`Top-5 buren zelfde categorie: ${((top5 / items.length) * 100).toFixed(1)}%`);
console.log(`Random-baseline:              ${(randomBaseline * 100).toFixed(1)}%`);

console.log(`\n=== Separatie ===`);
const same = sameSum / sameN;
const diff = diffSum / diffN;
console.log(`Gem. similarity binnen categorie:  ${same.toFixed(4)}`);
console.log(`Gem. similarity tussen categorieen: ${diff.toFixed(4)}`);
console.log(`Verschil:                           ${(same - diff).toFixed(4)}`);

// 3. Merk-signaal: hoe vaak is de top-1 buur van hetzelfde merk?
let brandTop1 = 0;
let brandBaseline = 0;
const brands = new Map<string, number>();
for (const it of items) brands.set(it.brand, (brands.get(it.brand) ?? 0) + 1);
for (const [, n] of brands) {
  brandBaseline += (n / items.length) * ((n - 1) / (items.length - 1));
}
for (let i = 0; i < items.length; i++) {
  let best = -Infinity;
  let bestJ = -1;
  for (let j = 0; j < items.length; j++) {
    if (i === j) continue;
    const s = cosineSim(embeddings[items[i].id], embeddings[items[j].id]);
    if (s > best) {
      best = s;
      bestJ = j;
    }
  }
  if (items[bestJ].brand === items[i].brand) brandTop1++;
}
console.log(`\n=== Merk-signaal ===`);
console.log(`Top-1 buur zelfde merk: ${((brandTop1 / items.length) * 100).toFixed(1)}%`);
console.log(`Random-baseline:        ${(brandBaseline * 100).toFixed(1)}%`);
