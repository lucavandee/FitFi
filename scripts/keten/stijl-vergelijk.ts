/**
 * Legt de snelle labeler naast de stijl-agent en bouwt de stijlmatrix.
 *
 *   npm run keten:stijl-vergelijk -- --in producten.json --labels labels.json [--schrijf]
 *
 * 1. Soort stuk: hoe vaak geeft stukUitNaam (labeler.ts) hetzelfde woord als de agent?
 * 2. Stijlmatrix: per soort stuk de stijlen die de agent het vaakst geeft, gebouwd
 *    op de producten met een even volgnummer.
 * 3. Toets op de oneven helft: geeft de matrix (soort uit de naam, stijlen uit de
 *    matrix) dezelfde stijlen als de agent? Gemeten per stijl: van de producten
 *    die de matrix die stijl geeft, hoeveel gaf de agent hem ook (precisie), en
 *    andersom (dekking).
 * Met --schrijf komt de matrix (op alle producten) in src/keten/stijl/stijlmatrix.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import type { LabelProduct, ProductLabel } from "../../src/keten/stijl/stijlAgent";
import { naamWoorden, stijlenUitNaam, stukUitNaam, type StijlMatrix } from "../../src/keten/stijl/labeler";
import { heeftVlag, leesVlag } from "./args";

const argv = process.argv.slice(2);
const IN = leesVlag(argv, "in")!;
const LABELS = leesVlag(argv, "labels")!;
/** Een stijl komt in de matrix voor een soort als de agent hem bij minstens dit deel gaf. */
const DREMPEL = Number(leesVlag(argv, "drempel") || 0.4);
const MIN_AANTAL = 3;
/** Een woord telt pas mee als het in minstens zoveel namen staat. */
const MIN_WOORD = 4;

type Matrix = Record<string, Record<string, string[]>>;

/** Woorden die in de agentlabels een stijl duidelijk toevoegen of weghalen ten opzichte van het soort stuk. */
function bouwWoorden(paren: Array<{ p: LabelProduct; l: ProductLabel }>, soorten: Matrix): StijlMatrix["woorden"] {
  const tel: Record<string, { n: number; stijl: Record<string, number>; verwacht: Record<string, number> }> = {};
  for (const { p, l } of paren) {
    const stuk = stukUitNaam(p.naam, p.categorie);
    const basis = new Set(stuk ? soorten[p.categorie]?.[stuk] ?? [] : []);
    for (const w of naamWoorden(p.naam)) {
      const t = (tel[w] ??= { n: 0, stijl: {}, verwacht: {} });
      t.n++;
      for (const s of l.stijlen) t.stijl[s] = (t.stijl[s] ?? 0) + 1;
      for (const s of basis) t.verwacht[s] = (t.verwacht[s] ?? 0) + 1;
    }
  }
  const uit: StijlMatrix["woorden"] = {};
  for (const [w, t] of Object.entries(tel)) {
    if (t.n < MIN_WOORD) continue;
    const plus = Object.entries(t.stijl).filter(([s, n]) => n / t.n >= 0.7 && (t.verwacht[s] ?? 0) / t.n < 0.5).map(([s]) => s);
    const min = Object.entries(t.verwacht).filter(([s, n]) => n / t.n >= 0.5 && (t.stijl[s] ?? 0) / t.n <= 0.15).map(([s]) => s);
    if (plus.length || min.length) uit[w] = { plus, min };
  }
  return uit;
}

function bouwMatrix(paren: Array<{ p: LabelProduct; l: ProductLabel }>): Matrix {
  const tel: Record<string, { n: number; stijl: Record<string, number> }> = {};
  for (const { p, l } of paren) {
    const sleutel = `${p.categorie}|${l.stuk}`;
    const t = (tel[sleutel] ??= { n: 0, stijl: {} });
    t.n++;
    for (const s of l.stijlen) t.stijl[s] = (t.stijl[s] ?? 0) + 1;
  }
  const m: Matrix = {};
  for (const [sleutel, t] of Object.entries(tel)) {
    if (t.n < MIN_AANTAL) continue;
    const [cat, stuk] = sleutel.split("|");
    const stijlen = Object.entries(t.stijl)
      .filter(([, n]) => n / t.n >= DREMPEL)
      .sort((a, b) => b[1] - a[1])
      .map(([s]) => s);
    if (stijlen.length) (m[cat] ??= {})[stuk] = stijlen;
  }
  return m;
}

function main(): void {
  const producten = JSON.parse(readFileSync(IN, "utf8")) as LabelProduct[];
  const labels = (JSON.parse(readFileSync(LABELS, "utf8")) as { labels: Record<string, ProductLabel> }).labels;
  const paren = producten.filter((p) => labels[p.id]).map((p) => ({ p, l: labels[p.id] }));
  console.log(`${paren.length} van ${producten.length} producten hebben een agentlabel.`);

  // 1. Soort stuk
  let gelijk = 0;
  const verschillen: string[] = [];
  for (const { p, l } of paren) {
    const s = stukUitNaam(p.naam, p.categorie);
    if (s === l.stuk) gelijk++;
    else if (verschillen.length < 25) verschillen.push(`${p.categorie}: labeler ${s ?? "geen"}, agent ${l.stuk} | ${p.naam.slice(0, 70)}`);
  }
  console.log(`\n1. Soort stuk gelijk: ${gelijk} van ${paren.length} (${Math.round((gelijk / paren.length) * 100)}%)`);
  for (const v of verschillen) console.log("   " + v);

  // 2 en 3. Matrix op de even helft, toets op de oneven helft
  const nummer = (id: string) => Number(id.replace(/\D/g, "")) || 0;
  const bouw = paren.filter(({ p }) => nummer(p.id) % 2 === 0);
  const toets = paren.filter(({ p }) => nummer(p.id) % 2 === 1);
  const soorten = bouwMatrix(bouw);
  const matrix: StijlMatrix = { soorten, woorden: heeftVlag(argv, "zonder-woorden") ? {} : bouwWoorden(bouw, soorten) };
  console.log(`\n2. Matrix: ${Object.values(soorten).reduce((n, m) => n + Object.keys(m).length, 0)} soorten, ${Object.keys(matrix.woorden).length} woorden.`);
  const perStijl: Record<string, { tp: number; fp: number; fn: number }> = {};
  let zonderMatrix = 0;
  for (const { p, l } of toets) {
    const voorspeld = new Set(stijlenUitNaam(p.naam, p.categorie, matrix));
    if (voorspeld.size === 0) zonderMatrix++;
    const echt = new Set(l.stijlen);
    for (const s of new Set([...voorspeld, ...echt])) {
      const t = (perStijl[s] ??= { tp: 0, fp: 0, fn: 0 });
      if (voorspeld.has(s) && echt.has(s)) t.tp++;
      else if (voorspeld.has(s)) t.fp++;
      else t.fn++;
    }
  }
  console.log(`\n3. Toets op ${toets.length} producten (matrix uit ${bouw.length}); ${zonderMatrix} zonder voorspelling.`);
  console.log("   stijl            precisie  dekking  (agent gaf hem)");
  for (const [s, t] of Object.entries(perStijl).sort((a, b) => b[1].tp + b[1].fn - (a[1].tp + a[1].fn))) {
    const prec = t.tp + t.fp ? Math.round((t.tp / (t.tp + t.fp)) * 100) : 0;
    const dek = t.tp + t.fn ? Math.round((t.tp / (t.tp + t.fn)) * 100) : 0;
    console.log(`   ${s.padEnd(16)} ${String(prec).padStart(6)}%  ${String(dek).padStart(6)}%  (${t.tp + t.fn})`);
  }

  if (heeftVlag(argv, "schrijf")) {
    const alleSoorten = bouwMatrix(paren);
    const volledig: StijlMatrix = { soorten: alleSoorten, woorden: bouwWoorden(paren, alleSoorten) };
    writeFileSync("src/keten/stijl/stijlmatrix.json", JSON.stringify({ bron: LABELS, drempel: DREMPEL, ...volledig }, null, 1) + "\n");
    console.log("\nMatrix geschreven naar src/keten/stijl/stijlmatrix.json");
  }
}

main();
