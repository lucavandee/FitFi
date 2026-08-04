/**
 * Vindt de naam-gaten in productClassifier.ts.
 *
 * Lijst alle echte producten waarvan de NAAM op geen enkele regel matcht.
 * Dat zijn precies de producten waarvoor de classifier terugvalt op de
 * beschrijving, waar marketingtekst de categorie bepaalt. Groepeert op het
 * laatste woorddeel zodat Nederlandse gesloten samenstellingen (bomberjack,
 * trainingstop, sportbh) zichtbaar worden als patroon in plaats van als
 * losse gevallen.
 *
 * Gebruik: npx vite-node scripts/visual-embeddings/classifier-gaps.ts
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyProductDetailed } from '../../src/engine/productClassifier';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

type Row = { id: string; name: string; category?: string; description?: string };
const rows: Row[] = [];

function load(path: string) {
  try {
    const data = JSON.parse(readFileSync(path, 'utf8')) as any[];
    rows.push(
      ...data.map((p) => ({
        id: String(p.id),
        name: p.name,
        category: p.category,
        description: p.description,
      }))
    );
  } catch {
    /* bestand ontbreekt, overslaan */
  }
}

load(join(here, 'out', 'diverse-catalog.json'));
load(join(root, 'src/engine/v2/__tests__/fixtures/catalog-tagged-2026-06-11.json'));

const seen = new Set<string>();
const unique = rows.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));

const unmatched = unique.filter(
  (r) => classifyProductDetailed(r.name, '', '').category === 'other'
);

console.log(`Producten: ${unique.length}`);
console.log(`Naam matcht nergens op: ${unmatched.length} (${((unmatched.length / unique.length) * 100).toFixed(1)}%)\n`);

// Groepeer op kandidaat-kernwoord: het langste woord in de naam dat geen
// merk-, kleur- of maataanduiding is. Voor Nederlandse samenstellingen is
// dat meestal het woord dat de categorie zou moeten bepalen.
const STOP = new Set([
  'voor', 'heren', 'dames', 'uniseks', 'maat', 'met', 'het', 'een', 'van', 'de',
  'zwart', 'wit', 'blauw', 'rood', 'groen', 'grijs', 'geel', 'roze', 'bruin',
  'beige', 'donkerblauw', 'lichtblauw', 'zilver', 'goud', 'oranje', 'paars',
  'puma', 'nike', 'adidas', 'and', 'the', 'color', 'woman', 'men', 'man',
]);

const byWord = new Map<string, Row[]>();
for (const r of unmatched) {
  const words = String(r.name || '')
    .toLowerCase()
    .replace(/[^a-zà-ü\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((w) => w.length >= 5 && !STOP.has(w));
  const key = words.sort((a, b) => b.length - a.length)[0] ?? '(geen)';
  byWord.set(key, [...(byWord.get(key) ?? []), r]);
}

console.log('Meest voorkomende kernwoorden zonder regel (opgeslagen categorie -> nu):');
[...byWord.entries()]
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 18)
  .forEach(([w, list]) => {
    const withDesc = new Map<string, number>();
    for (const r of list) {
      const c = classifyProductDetailed(r.name, r.description ?? '', '').category;
      withDesc.set(c, (withDesc.get(c) ?? 0) + 1);
    }
    const stored = new Map<string, number>();
    for (const r of list) stored.set(r.category ?? '?', (stored.get(r.category ?? '?') ?? 0) + 1);
    console.log(
      `  ${String(list.length).padStart(3)}x ${w.padEnd(20)} opgeslagen: ${[...stored].map(([c, n]) => `${c}=${n}`).join(',')}  ->  na fallback: ${[...withDesc].map(([c, n]) => `${c}=${n}`).join(',')}`
    );
    console.log(`       bv. ${String(list[0].name).slice(0, 66)}`);
  });
