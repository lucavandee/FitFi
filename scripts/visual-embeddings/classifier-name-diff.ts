/**
 * Vergelijkt de naam-classificatie van ALLE lokaal beschikbare echte producten
 * met de opgeslagen categorie in de catalogus. Bedoeld om na een wijziging in
 * productClassifier.ts te zien wat er feitelijk verschuift, inclusief de
 * producten waarvan de naam nergens op matcht (die vallen terug op de
 * beschrijving, wat de bron is van meerdere misclassificaties).
 *
 * Gebruik: npx vite-node scripts/visual-embeddings/classifier-name-diff.ts
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyProductDetailed } from '../../src/engine/productClassifier';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

type Row = { id: string; name: string; category?: string; description?: string };
const rows: Row[] = [];

function load(path: string, label: string) {
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
    console.log(`  ${label}: ${data.length}`);
  } catch {
    console.log(`  ${label}: niet gevonden`);
  }
}

console.log('Bronnen:');
load(join(here, 'out', 'diverse-catalog.json'), 'live steekproef');
load(join(root, 'src/engine/v2/__tests__/fixtures/catalog-tagged-2026-06-11.json'), 'golden fixture');

const seen = new Set<string>();
const unique = rows.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));
console.log(`\nUnieke producten: ${unique.length}\n`);

// Classificatie op alleen de naam (zoals de engine hem gebruikt), plus de
// classificatie met beschrijving erbij (de fallback-route).
const shifts = new Map<string, string[]>();
let nameOnlyUnmatched = 0;

for (const r of unique) {
  const nameOnly = classifyProductDetailed(r.name, '', '');
  const withDesc = classifyProductDetailed(r.name, r.description ?? '', '');
  if (nameOnly.category === 'other') nameOnlyUnmatched++;

  const stored = r.category ?? '?';
  if (withDesc.category !== stored) {
    const key = `${stored} -> ${withDesc.category}`;
    shifts.set(key, [...(shifts.get(key) ?? []), r.name]);
  }
}

console.log(
  `Producten waarvan ALLEEN de naam nergens op matcht: ${nameOnlyUnmatched} (${((nameOnlyUnmatched / unique.length) * 100).toFixed(1)}%)`
);
console.log('Die vallen terug op de beschrijving, waar marketingtekst de categorie bepaalt.\n');

console.log('Verschil tussen opgeslagen categorie en classificatie (naam + beschrijving):');
[...shifts.entries()]
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 12)
  .forEach(([k, names]) => {
    console.log(`  ${String(names.length).padStart(4)}x  ${k}`);
    names.slice(0, 2).forEach((n) => console.log(`          ${String(n).slice(0, 62)}`));
  });

// Gerichte controle op de patronen uit de red-team audit
console.log('\nGerichte controle op de gevonden patronen:');
const probes = [
  { label: 'enkelvoud "short"', re: /\bshort\b/i },
  { label: 'samenstelling *short', re: /\b[a-z]+short\b/i },
  { label: '"tight"', re: /\btights?\b/i },
];
for (const p of probes) {
  const hits = unique.filter((r) => p.re.test(r.name || ''));
  if (!hits.length) {
    console.log(`  ${p.label}: geen producten`);
    continue;
  }
  const cats = new Map<string, number>();
  for (const h of hits) {
    const c = classifyProductDetailed(h.name, h.description ?? '', '').category;
    cats.set(c, (cats.get(c) ?? 0) + 1);
  }
  console.log(
    `  ${p.label}: ${hits.length} producten -> ${[...cats.entries()].map(([c, n]) => `${c}=${n}`).join(' ')}`
  );
}

// Regressie-controle: "short sleeve" mag nooit bottom worden
console.log('\nRegressie-controle op de bewuste guard:');
for (const name of [
  'Nike Short Sleeve Training Shirt',
  'COS Overhemd met korte mouw',
  'Boss Short Trench Coat',
  'PUMA CLRT relaxte uniseks short, Zwart, Maat L',
  'PUMA Borussia Dortmund 25/26 keepersshort voor Heren',
  'PUMA Essentials Poly tight voor Dames, Zwart, Maat L',
]) {
  console.log(`  ${classifyProductDetailed(name, '', '').category.padEnd(9)} ${name}`);
}
