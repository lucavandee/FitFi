/**
 * Datakwaliteits-audit van de LIVE catalogus met beeld-embeddings.
 *
 * Twee dingen die alleen met beeld te vinden zijn:
 *  1. Exacte duplicaten: producten met een visueel identieke foto (cosine
 *     >= 0.999). In de live catalogus staan producten meermaals; de engine
 *     kan die als losse items aanbieden.
 *  2. Verkeerd gelabelde categorieen: producten waarvan de visuele buren
 *     eensgezind een andere categorie hebben dan het product zelf. Een
 *     T-shirt dat als "accessory" in de database staat, valt zo op.
 *
 * Gebruik: npx vite-node scripts/visual-embeddings/data-quality-audit.ts
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cosineSim } from '../../src/engine/v2/scoring/visualCoherence';

const here = dirname(fileURLToPath(import.meta.url));
const catalog: any[] = JSON.parse(
  readFileSync(join(here, 'out', 'diverse-catalog.json'), 'utf8')
);
const emb: Record<string, number[]> = JSON.parse(
  readFileSync(join(here, 'out', 'diverse-embeddings.json'), 'utf8')
);

const items = catalog.filter((p) => emb[String(p.id)]);
const N = items.length;
console.log(`Steekproef live catalogus: ${N} producten met embedding\n`);

// Alle paarsgewijze similarities eenmalig
const sim: Float32Array = new Float32Array(N * N);
for (let i = 0; i < N; i++) {
  for (let j = i + 1; j < N; j++) {
    const s = cosineSim(emb[String(items[i].id)], emb[String(items[j].id)]);
    sim[i * N + j] = s;
    sim[j * N + i] = s;
  }
}

// 1. Exacte duplicaten via union-find
const parent = Array.from({ length: N }, (_, i) => i);
const find = (x: number): number => {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]];
    x = parent[x];
  }
  return x;
};
for (let i = 0; i < N; i++) {
  for (let j = i + 1; j < N; j++) {
    if (sim[i * N + j] >= 0.999) {
      const a = find(i);
      const b = find(j);
      if (a !== b) parent[a] = b;
    }
  }
}
const clusters = new Map<number, number[]>();
for (let i = 0; i < N; i++) {
  const r = find(i);
  clusters.set(r, [...(clusters.get(r) ?? []), i]);
}
const dupeClusters = [...clusters.values()].filter((c) => c.length > 1);
const redundant = dupeClusters.reduce((n, c) => n + c.length - 1, 0);

console.log(`=== 1. Exacte duplicaten (cosine >= 0.999) ===`);
console.log(`Clusters:            ${dupeClusters.length}`);
console.log(
  `Overtollige items:   ${redundant} van ${N} (${((redundant / N) * 100).toFixed(1)}% van de steekproef)`
);
console.log(`Grootste clusters:`);
[...dupeClusters]
  .sort((a, b) => b.length - a.length)
  .slice(0, 5)
  .forEach((c) => {
    const it = items[c[0]];
    console.log(`  ${String(c.length).padStart(3)}x  ${it.brand} | ${String(it.name).slice(0, 58)}`);
  });

// 2. Categorie-afwijkingen: buren-consensus tegen eigen label
console.log(`\n=== 2. Mogelijk verkeerd gelabelde categorieen ===`);
const K = 8;
const suspects: Array<{ idx: number; own: string; consensus: string; agree: number }> = [];
for (let i = 0; i < N; i++) {
  const nbrs: Array<{ j: number; s: number }> = [];
  for (let j = 0; j < N; j++) {
    if (i === j) continue;
    // sla exacte duplicaten over: die delen het foute label
    if (sim[i * N + j] >= 0.999) continue;
    nbrs.push({ j, s: sim[i * N + j] });
  }
  nbrs.sort((a, b) => b.s - a.s);
  const top = nbrs.slice(0, K);
  if (top.length < K) continue;
  const votes = new Map<string, number>();
  for (const n of top) {
    const c = items[n.j].category;
    votes.set(c, (votes.get(c) ?? 0) + 1);
  }
  const [best, count] = [...votes.entries()].sort((a, b) => b[1] - a[1])[0];
  if (best !== items[i].category && count >= 6) {
    suspects.push({ idx: i, own: items[i].category, consensus: best, agree: count });
  }
}
console.log(
  `${suspects.length} van ${N} producten (${((suspects.length / N) * 100).toFixed(1)}%) hebben een categorie die afwijkt van minstens 6 van hun 8 visuele buren.`
);
console.log(`\nVoorbeelden (label in database -> consensus van buren):`);
suspects
  .sort((a, b) => b.agree - a.agree)
  .slice(0, 12)
  .forEach((s) => {
    const it = items[s.idx];
    console.log(
      `  ${String(s.own).padEnd(9)} -> ${String(s.consensus).padEnd(9)} (${s.agree}/8)  ${String(it.brand).slice(0, 18).padEnd(18)} ${String(it.name).slice(0, 42)}`
    );
  });
