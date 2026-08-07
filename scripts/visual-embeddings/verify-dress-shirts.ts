/**
 * Verifieert per product met category=dress wat de visuele buren zeggen.
 *
 * Gebruikt de embeddings van de diverse steekproef als referentiepool. Per
 * kandidaat: de 8 dichtstbijzijnde buren (exacte duplicaten uitgesloten) en
 * hun categorie-consensus. Dit onderbouwt de voorgestelde correctie met beeld
 * in plaats van met een regex op de productnaam.
 *
 * Gebruik: npx vite-node scripts/visual-embeddings/verify-dress-shirts.ts
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

const pool = catalog.filter((p) => emb[String(p.id)]);
const candidates = pool.filter((p) => p.category === 'dress');

console.log(`Referentiepool: ${pool.length} producten met embedding`);
console.log(`Kandidaten (category=dress in de pool): ${candidates.length}\n`);

const K = 8;
let agreeTop = 0;

// Systematisch fout gelabelde clusters bevestigen zichzelf: 14 OLYMP-overhemden
// zijn elkaars naaste buren en stemmen allemaal "dress". Met --exclude-brand
// tellen alleen buren van ANDERE merken mee, wat die circulariteit doorbreekt.
const excludeBrand = process.argv.includes('--exclude-brand');
console.log(
  excludeBrand
    ? 'Modus: buren van hetzelfde merk uitgesloten (doorbreekt zelfbevestiging)\n'
    : 'Modus: alle buren tellen mee\n'
);

for (const c of candidates) {
  const vc = emb[String(c.id)];
  const nbrs = pool
    .filter((o) => o.id !== c.id)
    .filter((o) => !excludeBrand || o.brand !== c.brand)
    .map((o) => ({ o, s: cosineSim(vc, emb[String(o.id)]) }))
    .filter((x) => x.s < 0.999) // exacte duplicaten delen hetzelfde foute label
    .sort((a, b) => b.s - a.s)
    .slice(0, K);

  const votes = new Map<string, number>();
  for (const n of nbrs) votes.set(n.o.category, (votes.get(n.o.category) ?? 0) + 1);
  const ranked = [...votes.entries()].sort((a, b) => b[1] - a[1]);
  const [best, count] = ranked[0];

  const isShirt = /dress shirt/i.test(c.name || '');
  const verdict =
    best === c.category ? 'BEVESTIGT dress' : `WIJST NAAR ${best} (${count}/${K})`;
  if (isShirt && best === 'top') agreeTop++;

  console.log(
    `${isShirt ? 'SHIRT ' : '      '}${String(c.brand).slice(0, 16).padEnd(16)} ${String(c.name).slice(0, 46).padEnd(46)} -> ${verdict}`
  );
}

const shirts = candidates.filter((c) => /dress shirt/i.test(c.name || ''));
console.log(
  `\nVan de ${shirts.length} 'Dress Shirt'-producten in de pool wijst de beeld-consensus er ${agreeTop} naar 'top'.`
);
