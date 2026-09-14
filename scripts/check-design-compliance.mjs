#!/usr/bin/env node
/**
 * Design System Compliance Checker
 *
 * Toetst src/ aan design system v1.0 zoals vastgelegd in CLAUDE.md deel 2.
 *
 * Gebruik:
 *   node scripts/check-design-compliance.mjs              alles in src/
 *   node scripts/check-design-compliance.mjs --changed    alleen bestanden gewijzigd t.o.v. main
 *   node scripts/check-design-compliance.mjs --strict     exit 1 bij harde overtredingen
 *
 * Waarom --changed bestaat: de codebase heeft legacy uit eerdere iteraties. Een poort
 * die de hele repo eist kan niet groen worden en wordt daarom genegeerd. De poort die
 * wel werkt is "nieuwe en gewijzigde code voldoet".
 *
 * LET OP bij aanpassen: de bron van waarheid is CLAUDE.md deel 2, niet dit bestand.
 * Wijkt een regel hier af van CLAUDE.md, dan is dit bestand fout. De vorige versie
 * van dit script rekende `bg-[#A85740]`, `shadow-md` en `py-16` als overtreding,
 * precies de dingen die CLAUDE.md voorschrijft, en scoorde daarmee altijd 0%.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
const CHANGED_ONLY = args.includes('--changed');
const JSON_UIT = args.includes('--json');
const DIR_ARG = args.find(a => a.startsWith('--dir='));

const projectRoot = process.cwd();
const srcDir = DIR_ARG ? DIR_ARG.slice('--dir='.length) : join(projectRoot, 'src');

/* ------------------------------------------------------------------ *
 * Design system v1.0, letterlijk uit CLAUDE.md deel 2
 * ------------------------------------------------------------------ */

const PALET = new Set([
  // primair
  '#a85740', '#9a503b', '#f4e8e3',
  // neutraal
  '#1a1a1a', '#4a4a4a', '#6e6e6e', '#e5e5e5', '#fafaf8', '#ffffff', '#f5f0eb',
  // functioneel
  '#3d8b5e', '#d4913d', '#c24a4a', '#4a7ec2',
  // zwart en transparant, voor de modal-overlay bg-black/40
  '#000000',
]);

// deel 5: geen andere radii
const RADII_TOEGESTAAN = new Set(['rounded-xl', 'rounded-2xl', 'rounded-full', 'rounded-none']);

// deel 6: cards hover:shadow-md, modals shadow-xl, formulier-cards shadow-sm (deel 13)
const SCHADUWEN_TOEGESTAAN = new Set(['shadow-sm', 'shadow-md', 'shadow-xl', 'shadow-none']);

// deel 10: vaste CTA-teksten, geen variaties
const CTA_VAST = [
  'Begin gratis',
  'Ontgrendel premium',
  'Bewaar outfit',
  'Bekijk bij partner',
  'Bekijk je resultaten',
];

// varianten die in het verleden zijn opgedoken en niet mogen
const CTA_VARIANTEN = [
  'Start gratis', 'Begin nu', 'Gratis beginnen', 'Start de quiz', 'Doe de quiz',
  'Upgrade nu', 'Word premium', 'Ontgrendel Premium',
  'Outfit opslaan', 'Sla outfit op',
  'Naar de shop', 'Shop nu', 'Bekijk in de shop',
  'Bekijk resultaten', 'Naar je resultaten', 'Bekijk rapport',
];

const violations = {
  kleurBuitenPalet: [],
  verbodenRadius: [],
  verbodenSchaduw: [],
  arbitraireSpacing: [],
  arbitraireFontSize: [],
  ctaVariant: [],
};

// harde categorieen laten --strict falen, zachte zijn rapportage
const HARD = ['kleurBuitenPalet', 'verbodenRadius', 'verbodenSchaduw', 'ctaVariant'];

let scannedFiles = 0;

/* ------------------------------------------------------------------ *
 * Hulp
 * ------------------------------------------------------------------ */

function normaliseerHex(hex) {
  let h = hex.toLowerCase();
  if (h.length === 4) {
    // #abc -> #aabbcc
    h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }
  if (h.length === 9) {
    // #rrggbbaa -> alpha negeren, de kleur telt
    h = h.slice(0, 7);
  }
  return h;
}

function regelVan(content, index) {
  return content.substring(0, index).split('\n').length;
}

// In --changed-modus: alleen de regels die deze branch of werkboom heeft
// aangeraakt. Anders dwingt een tekstwijziging in een legacy-bestand je om
// eerst honderden oude overtredingen op te ruimen, en dan wordt de poort
// omzeild in plaats van gebruikt.
let regelFilter = null;

function meld(categorie, filePath, content, index, match, uitleg) {
  const line = regelVan(content, index);
  if (regelFilter && !regelFilter.has(line)) return;
  violations[categorie].push({
    file: relative(projectRoot, filePath),
    line,
    match,
    uitleg,
    code: content.split('\n')[line - 1]?.trim().slice(0, 120),
  });
}

/* ------------------------------------------------------------------ *
 * Checks
 * ------------------------------------------------------------------ */

/**
 * Kleuren. CLAUDE.md schrijft hex-klassen voor (`bg-[#A85740]`), dus de notatie
 * is geen overtreding. De overtreding is een hex die niet in het palet staat.
 *
 * Alleen hexes die de INTERFACE kleuren tellen mee: Tailwind arbitrary values en
 * style-props. Losse hexes in datastructuren zijn domeindata (kledingkleuren,
 * seizoenspaletten voor kleuradvies) en vallen buiten het design system. Zonder
 * dat onderscheid vlagt de checker src/data/colorPalettes.ts met 200+ "overtredingen"
 * die geen van alle over de UI gaan.
 */
function checkKleuren(content, filePath) {
  // 1. Tailwind arbitrary values: bg-[#fff], text-[#1A1A1A]/80, hover:border-[#A85740]
  const utilityPattern = /\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|decoration|divide|accent|caret|shadow)-\[(#[0-9A-Fa-f]{3,8})\]/g;
  let match;
  while ((match = utilityPattern.exec(content)) !== null) {
    const hex = normaliseerHex(match[1]);
    if (!PALET.has(hex)) {
      meld('kleurBuitenPalet', filePath, content, match.index, match[1],
        `${match[1]} kleurt de interface maar staat niet in het palet van CLAUDE.md deel 2`);
    }
  }

  // 2. echte style-props. Alleen binnen style={{ ... }} of style="...", niet elk
  // objectveld dat toevallig `color` heet: `color: '#8B7355'` op een Chino broek
  // in quickOutfitGenerator.ts is productdata, geen interfacekleur.
  const styleBlok = /style\s*=\s*(?:\{\{([^}]*)\}\}|["']([^"']*)["'])/g;
  let blok;
  while ((blok = styleBlok.exec(content)) !== null) {
    const inhoud = blok[1] || blok[2] || '';
    const hexPattern = /#[0-9A-Fa-f]{3,8}\b/g;
    let h;
    while ((h = hexPattern.exec(inhoud)) !== null) {
      const hex = normaliseerHex(h[0]);
      if (!PALET.has(hex)) {
        meld('kleurBuitenPalet', filePath, content, blok.index + h.index, h[0],
          `${h[0]} kleurt de interface via een style-prop maar staat niet in het palet van CLAUDE.md deel 2`);
      }
    }
  }
}

/**
 * Radii. Deel 5: buttons xl, cards 2xl, badges full. Geen andere radii.
 */
function checkRadii(content, filePath) {
  const ZIJKANTEN = new Set(['t', 'b', 'l', 'r', 'tl', 'tr', 'bl', 'br', 's', 'e', 'ss', 'se', 'es', 'ee']);
  const MATEN = new Set(['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full']);

  // Eerst het hele token pakken, dan zelf splitsen. Een regex met een optionele
  // zijkant-groep leest `rounded-lg` als zijkant `l` plus rest `g`.
  const pattern = /\brounded(?:-(?:\[[^\]]+\]|[a-z0-9]+))*/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const klasse = match[0];
    const delen = klasse.split('-').slice(1);

    let maat;
    if (delen.length > 1 && ZIJKANTEN.has(delen[0])) {
      maat = delen.slice(1).join('-');
    } else if (delen.length === 1 && ZIJKANTEN.has(delen[0]) && !MATEN.has(delen[0])) {
      maat = '';
    } else {
      maat = delen.join('-');
    }

    if (maat === '') {
      meld('verbodenRadius', filePath, content, match.index, klasse,
        `\`${klasse}\` is de standaard 4px, gebruik rounded-xl (buttons/inputs) of rounded-2xl (cards)`);
      continue;
    }
    if (maat.startsWith('[')) {
      meld('verbodenRadius', filePath, content, match.index, klasse,
        `\`${klasse}\` is een arbitraire radius, alleen rounded-xl, rounded-2xl en rounded-full`);
      continue;
    }
    if (!MATEN.has(maat)) continue; // geen radius-klasse, bijvoorbeeld een variabelenaam
    if (!RADII_TOEGESTAAN.has(`rounded-${maat}`)) {
      meld('verbodenRadius', filePath, content, match.index, klasse,
        `\`${klasse}\` mag niet, alleen rounded-xl (buttons/inputs), rounded-2xl (cards/modals) en rounded-full (badges)`);
    }
  }
}

/**
 * Schaduwen. Deel 6: cards hover:shadow-md, modals shadow-xl, formulier-cards
 * shadow-sm. Geen andere schaduwen.
 */
function checkSchaduwen(content, filePath) {
  const pattern = /\b(?:drop-)?shadow-\[[^\]]+\]|\b(?:drop-)?shadow-(?:none|sm|md|lg|xl|2xl|inner)\b/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const klasse = match[0];
    if (klasse.startsWith('drop-shadow')) {
      meld('verbodenSchaduw', filePath, content, match.index, klasse,
        'drop-shadow staat niet in het design system');
      continue;
    }
    if (klasse.includes('[')) {
      meld('verbodenSchaduw', filePath, content, match.index, klasse,
        'arbitraire schaduw, alleen shadow-sm, shadow-md en shadow-xl');
      continue;
    }
    if (!SCHADUWEN_TOEGESTAAN.has(klasse)) {
      meld('verbodenSchaduw', filePath, content, match.index, klasse,
        `${klasse} mag niet, alleen shadow-sm (formulier-cards), hover:shadow-md (cards) en shadow-xl (modals)`);
    }
  }
}

/**
 * Spacing. CLAUDE.md schrijft de Tailwind-schaal voor en gebruikt in de
 * componentspecs zelf py-3, px-4, px-6 en top-3. De schaal zelf is dus nooit
 * de overtreding. Wat wel fout is: arbitraire waarden buiten de schaal.
 */
function checkSpacing(content, filePath) {
  const pattern = /\b(?:gap|space-[xy]|p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr)-\[([^\]]+)\]/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    meld('arbitraireSpacing', filePath, content, match.index, match[0],
      'arbitraire spacing, gebruik de Tailwind-schaal (8px-basis)');
  }
}

/**
 * Typografie. Deel 2 geeft een vaste schaal in Tailwind-klassen. Arbitraire
 * groottes vallen daarbuiten. Onder 14px is sowieso verboden (deel 12).
 */
function checkTypografie(content, filePath) {
  const pattern = /\btext-\[(?!var\()([\d.]+)(px|rem|em)\]/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const waarde = parseFloat(match[1]);
    const eenheid = match[2];
    const px = eenheid === 'px' ? waarde : waarde * 16;
    const uitleg = px < 14
      ? `${match[0]} is ${px}px, onder de ondergrens van 14px uit deel 12`
      : `${match[0]} valt buiten de type-schaal, gebruik text-xs t/m text-5xl`;
    meld('arbitraireFontSize', filePath, content, match.index, match[0], uitleg);
  }
}

/**
 * Vaste CTA-teksten. Deel 10: geen variaties.
 */
function checkCtaTeksten(content, filePath) {
  for (const variant of CTA_VARIANTEN) {
    const pattern = new RegExp(`(?<![\\w])${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w])`, 'g');
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const juiste = CTA_VAST.find(c => c.split(' ')[0].toLowerCase() === variant.split(' ')[0].toLowerCase());
      meld('ctaVariant', filePath, content, match.index, variant,
        `"${variant}" is een variatie op een vaste CTA-tekst${juiste ? `, gebruik "${juiste}"` : ''} (deel 10)`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * Bestanden verzamelen
 * ------------------------------------------------------------------ */

function getAllFiles(dir, files = []) {
  for (const item of readdirSync(dir)) {
    const fullPath = join(dir, item);
    if (statSync(fullPath).isDirectory()) {
      // __fixtures__ bevat met opzet foute code voor de zelftest. Die hoort niet
      // in de gewone scan, anders vervuilt de fixture zijn eigen rapport.
      if (!['node_modules', 'dist', 'build', '.git', '__fixtures__'].includes(item)) {
        getAllFiles(fullPath, files);
      }
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function gitUit(cmd) {
  return execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function getChangedFiles() {
  // LET OP: geen stille terugval op de hele src/. Een strict-poort die niet kan
  // bepalen wat er gewijzigd is en dan maar alles scant, gaat rood om een reden
  // die niets met deze wijziging te maken heeft. Dan wordt hij genegeerd, en dat
  // is precies hoe de vorige versie van dit script betekenisloos werd.
  const BASIS_ARG = args.find(a => a.startsWith('--base='));
  const kandidaten = BASIS_ARG ? [BASIS_ARG.slice('--base='.length)] : ['origin/main', 'main'];

  let basis = null;
  for (const ref of kandidaten) {
    try {
      basis = gitUit(`git merge-base HEAD ${ref}`);
      break;
    } catch {
      // volgende kandidaat
    }
  }

  basisRef = basis;

  if (!basis) {
    console.error(`Kon geen merge-base vinden met ${kandidaten.join(' of ')}.`);
    console.error('In CI: zet fetch-depth: 0 op actions/checkout, anders is main daar niet bekend.');
    console.error('Lokaal: geef een ref mee met --base=<ref>.');
    process.exit(2);
  }

  const paden = new Set([
    ...gitUit(`git diff --name-only --diff-filter=ACMR ${basis} HEAD`).split('\n'),
    ...gitUit('git diff --name-only --diff-filter=ACMR HEAD').split('\n'),
  ].map(p => p.trim()).filter(Boolean));

  return [...paden]
    .filter(p => p.startsWith('src/') && (p.endsWith('.ts') || p.endsWith('.tsx')))
    .filter(p => !p.includes('__fixtures__'))
    .map(p => join(projectRoot, p))
    .filter(p => { try { return statSync(p).isFile(); } catch { return false; } });
}

let basisRef = null;

function gewijzigdeRegels(relPad) {
  const regels = new Set();
  let diff = '';
  try {
    // basis..werkboom in een keer: dekt commits op de branch en niet-gecommit werk
    diff = gitUit(`git diff -U0 ${basisRef} -- "${relPad}"`);
  } catch {
    return null; // onbekend, dan het hele bestand toetsen
  }
  for (const m of diff.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)) {
    const start = parseInt(m[1], 10);
    const lengte = m[2] === undefined ? 1 : parseInt(m[2], 10);
    for (let i = 0; i < lengte; i++) regels.add(start + i);
  }
  return regels;
}

function scanFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    scannedFiles++;
    regelFilter = CHANGED_ONLY && basisRef ? gewijzigdeRegels(relative(projectRoot, filePath)) : null;
    checkKleuren(content, filePath);
    checkRadii(content, filePath);
    checkSchaduwen(content, filePath);
    checkSpacing(content, filePath);
    checkTypografie(content, filePath);
    checkCtaTeksten(content, filePath);
  } catch (err) {
    console.error(`Fout bij scannen van ${filePath}:`, err.message);
  }
}

/* ------------------------------------------------------------------ *
 * Rapport
 * ------------------------------------------------------------------ */

const CATEGORIEEN = [
  { key: 'kleurBuitenPalet', naam: 'Kleur buiten het palet', emoji: '🎨' },
  { key: 'verbodenRadius', naam: 'Verboden border-radius', emoji: '⬜' },
  { key: 'verbodenSchaduw', naam: 'Verboden schaduw', emoji: '🌑' },
  { key: 'ctaVariant', naam: 'Variatie op een vaste CTA-tekst', emoji: '🔤' },
  { key: 'arbitraireSpacing', naam: 'Arbitraire spacing', emoji: '📐' },
  { key: 'arbitraireFontSize', naam: 'Arbitraire font-size', emoji: '📝' },
];

function printResults() {
  if (JSON_UIT) {
    const hardTotaal = HARD.reduce((n, k) => n + violations[k].length, 0);
    console.log(JSON.stringify({ scannedFiles, hardTotaal, violations }, null, 2));
    if (STRICT && hardTotaal > 0) process.exit(1);
    return;
  }
  const totaal = Object.values(violations).reduce((n, v) => n + v.length, 0);
  const hardTotaal = HARD.reduce((n, k) => n + violations[k].length, 0);

  const bestandenMetOvertreding = new Set(
    Object.values(violations).flat().map(v => v.file)
  ).size;
  const schoon = scannedFiles - bestandenMetOvertreding;
  const score = scannedFiles === 0 ? 100 : Math.round((schoon / scannedFiles) * 100);

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║      FITFI DESIGN SYSTEM v1.0 COMPLIANCE                      ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  console.log(`Bereik:           ${CHANGED_ONLY ? 'alleen gewijzigde regels t.o.v. main' : 'hele src/'}`);
  console.log(`Gescand:          ${scannedFiles} bestanden`);
  console.log(`Schoon:           ${schoon} bestanden (${score}%)`);
  console.log(`Overtredingen:    ${totaal} (${hardTotaal} hard, ${totaal - hardTotaal} zacht)\n`);

  for (const { key, naam, emoji } of CATEGORIEEN) {
    const items = violations[key];
    const hardLabel = HARD.includes(key) ? 'hard' : 'zacht';
    if (items.length === 0) {
      console.log(`${emoji} ${naam}: geen (${hardLabel})`);
      continue;
    }
    console.log(`\n${emoji} ${naam}: ${items.length} (${hardLabel})`);
    const perBestand = {};
    for (const v of items) (perBestand[v.file] ||= []).push(v);
    const bestanden = Object.keys(perBestand).sort((a, b) => perBestand[b].length - perBestand[a].length);
    for (const f of bestanden.slice(0, 8)) {
      console.log(`  ${f}`);
      for (const v of perBestand[f].slice(0, 4)) {
        console.log(`    regel ${v.line}: ${v.uitleg}`);
      }
      if (perBestand[f].length > 4) console.log(`    en nog ${perBestand[f].length - 4} in dit bestand`);
    }
    if (bestanden.length > 8) console.log(`  en nog ${bestanden.length - 8} bestanden`);
  }

  console.log('');

  if (STRICT) {
    if (hardTotaal > 0) {
      console.log(`Poort dicht: ${hardTotaal} harde overtredingen (kleur, radius, schaduw, CTA-tekst).`);
      console.log('Zachte overtredingen (spacing, font-size) laten de poort open.\n');
      process.exit(1);
    }
    console.log('Poort open: geen harde overtredingen.\n');
  }
}

function main() {
  const files = CHANGED_ONLY ? getChangedFiles() : getAllFiles(srcDir);
  if (files.length === 0) {
    console.log('Geen bestanden om te scannen.');
    return;
  }
  for (const file of files) scanFile(file);
  printResults();
}

main();
