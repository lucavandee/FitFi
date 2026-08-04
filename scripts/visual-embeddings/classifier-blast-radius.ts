/**
 * Blast-radius check voor een wijziging in productClassifier.ts.
 *
 * Draait de huidige classifier over alle lokaal beschikbare ECHTE
 * productnamen (live steekproef + golden fixture) en vergelijkt de uitkomst
 * met de oude dress-regel. Zo is precies zichtbaar welke producten van
 * categorie veranderen, in plaats van te vertrouwen op losse voorbeelden.
 *
 * Gebruik: npx vite-node scripts/visual-embeddings/classifier-blast-radius.ts
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyProductDetailed } from '../../src/engine/productClassifier';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

type Row = { id: string; name: string; brand?: string; category?: string };
const rows: Row[] = [];

function load(path: string, label: string) {
  try {
    const data = JSON.parse(readFileSync(path, 'utf8')) as any[];
    rows.push(...data.map((p) => ({ id: String(p.id), name: p.name, brand: p.brand, category: p.category })));
    console.log(`  ${label}: ${data.length}`);
  } catch {
    console.log(`  ${label}: niet gevonden, overgeslagen`);
  }
}

console.log('Bronnen:');
load(join(here, 'out', 'diverse-catalog.json'), 'live steekproef');
load(join(root, 'src/engine/v2/__tests__/fixtures/catalog-tagged-2026-06-11.json'), 'golden fixture');

const seen = new Set<string>();
const unique = rows.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));
console.log(`\nUnieke producten: ${unique.length}\n`);

// De oude regel: elk voorkomen van "dress" telde als jurk. We simuleren het
// verschil door te kijken welke namen de nieuwe uitsluiting raakt.
const OLD = /\bdress\b/i;
const NEW = /\bdress\b(?!\s*(?:shirt|shoes?|boots?|pants?|trousers?|socks?|code))/i;

const affected = unique.filter((r) => OLD.test(r.name || '') && !NEW.test(r.name || ''));
console.log(`Namen waar de oude regel wel en de nieuwe regel niet matcht: ${affected.length}`);

if (affected.length) {
  console.log('\nNieuwe classificatie van die producten:');
  const shift = new Map<string, number>();
  for (const r of affected) {
    const now = classifyProductDetailed(r.name, '', '').category;
    const key = `${r.category ?? '?'} -> ${now}`;
    shift.set(key, (shift.get(key) ?? 0) + 1);
  }
  [...shift.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, n]) => console.log(`  ${String(n).padStart(4)}x  ${k}`));

  console.log('\nVoorbeelden:');
  affected.slice(0, 12).forEach((r) => {
    const now = classifyProductDetailed(r.name, '', '').category;
    console.log(`  ${String(r.category ?? '?').padEnd(9)} -> ${String(now).padEnd(9)} ${String(r.name).slice(0, 58)}`);
  });
}

// Controle: producten die jurk BLIJVEN, mogen niet zijn veranderd
const stillDress = unique.filter((r) => NEW.test(r.name || ''));
const brokenDresses = stillDress.filter(
  (r) => classifyProductDetailed(r.name, '', '').category !== 'dress'
);
console.log(`\nProducten waar de nieuwe dress-regel matcht: ${stillDress.length}`);
console.log(
  `Daarvan NIET als dress geclassificeerd: ${brokenDresses.length} (andere regel wint, bijvoorbeeld tweedelige sets)`
);
brokenDresses.slice(0, 6).forEach((r) =>
  console.log(
    `  -> ${classifyProductDetailed(r.name, '', '').category.padEnd(9)} ${String(r.name).slice(0, 58)}`
  )
);
