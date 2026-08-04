/**
 * Print voor een handvol producten de top-5 visuele buren met naam, merk en
 * categorie. Kwalitatieve tegenhanger van quality-probe.ts: laat zien WAT het
 * model als "lijkt op elkaar" beschouwt, niet alleen hoe vaak de categorie klopt.
 *
 * Gebruik: npx vite-node scripts/visual-embeddings/neighbour-sample.ts
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
const byCat = new Map<string, any[]>();
for (const it of items) {
  byCat.set(it.category, [...(byCat.get(it.category) ?? []), it]);
}

for (const [cat, list] of byCat) {
  const seed = list[Math.floor(list.length / 3)];
  const sims = items
    .filter((o) => o.id !== seed.id)
    .map((o) => ({ o, s: cosineSim(emb[String(seed.id)], emb[String(o.id)]) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 5);
  console.log(`\n[${cat}] ${seed.brand} | ${String(seed.name).slice(0, 58)}`);
  for (const { o, s } of sims) {
    const flag = o.category === seed.category ? ' ' : '!';
    console.log(
      `  ${flag} ${s.toFixed(3)} [${String(o.category).padEnd(9)}] ${String(o.brand).slice(0, 22).padEnd(22)} ${String(o.name).slice(0, 44)}`
    );
  }
}
