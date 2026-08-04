#!/usr/bin/env node
/**
 * Genereert een statische HTML-pagina met "meer zoals dit"-grids:
 * 8 voorbeeldproducten met hun top-5 visuele buren, plus de top
 * near-duplicate paren. Voor visuele beoordeling van embedding-kwaliteit.
 *
 * Gebruik: node scripts/visual-embeddings/demo.mjs
 * Output:  scripts/visual-embeddings/out/demo.html
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

// --catalog / --embeddings / --out om een andere set te tonen dan de default
function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}
const catalogFile = arg("catalog", "catalog-images.json");
const embeddingsFile = arg("embeddings", "product-embeddings.json");
const outFile = arg("out", "demo.html");

const catalog = JSON.parse(readFileSync(join(here, "out", catalogFile), "utf8"));
const embeddings = JSON.parse(
  readFileSync(join(here, "out", embeddingsFile), "utf8")
);

const byId = new Map(catalog.map((p) => [String(p.id), p]));
const ids = Object.keys(embeddings).filter((id) => byId.has(id));

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

function neighbors(id, k = 5) {
  const v = embeddings[id];
  return ids
    .filter((o) => o !== id)
    .map((o) => ({ id: o, sim: cosine(v, embeddings[o]) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, k);
}

// Gespreide voorbeelden: per categorie twee, verspreid over de lijst zodat
// het niet alleen de eerste rijen van één merk zijn.
const categories = ["top", "bottom", "footwear", "outerwear", "dress", "accessory"];
const samples = [];
for (const cat of categories) {
  const hits = ids.filter((id) => byId.get(id).category === cat);
  if (hits.length === 0) continue;
  samples.push(hits[0]);
  if (hits.length > 3) samples.push(hits[Math.floor(hits.length / 2)]);
}

function card(p, sim = null) {
  const simLabel = sim === null ? "" : `<div class="sim">${sim.toFixed(3)}</div>`;
  return `<div class="card">${simLabel}<img loading="lazy" src="${p.image_url}" alt=""><div class="nm">${(p.name || "").slice(0, 60)}</div><div class="ct">${p.category ?? ""} · ${p.brand ?? ""}</div></div>`;
}

let rows = "";
for (const id of samples.slice(0, 8)) {
  const p = byId.get(id);
  const nbs = neighbors(id);
  rows += `<section><h2>Meer zoals: ${(p.name || id).slice(0, 70)}</h2><div class="row">${card(p)}<div class="arrow">→</div>${nbs.map((n) => card(byId.get(n.id), n.sim)).join("")}</div></section>`;
}

// Near-duplicates
const dupes = [];
for (let i = 0; i < ids.length; i++) {
  for (let j = i + 1; j < ids.length; j++) {
    const sim = cosine(embeddings[ids[i]], embeddings[ids[j]]);
    if (sim > 0.97) dupes.push({ a: ids[i], b: ids[j], sim });
  }
}
dupes.sort((x, y) => y.sim - x.sim);
let dupeRows = "";
for (const d of dupes.slice(0, 12)) {
  dupeRows += `<div class="row">${card(byId.get(d.a))}<div class="arrow">≈ ${d.sim.toFixed(4)}</div>${card(byId.get(d.b))}</div>`;
}

const html = `<!doctype html><meta charset="utf-8"><title>FitFi visual embeddings demo</title>
<style>
body{font-family:system-ui;margin:2rem;background:#FAFAF8;color:#1A1A1A}
h1{font-size:1.4rem} h2{font-size:1rem;margin:1.5rem 0 .5rem}
.row{display:flex;gap:10px;align-items:flex-start;overflow-x:auto;padding-bottom:8px}
.card{width:130px;flex-shrink:0;background:#fff;border:1px solid #E5E5E5;border-radius:12px;padding:6px;position:relative}
.card img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:8px}
.nm{font-size:.68rem;margin-top:4px} .ct{font-size:.6rem;color:#8A8A8A}
.sim{position:absolute;top:10px;left:10px;background:#C2654A;color:#fff;font-size:.65rem;padding:1px 6px;border-radius:99px}
.arrow{align-self:center;font-size:1.2rem;color:#8A8A8A;flex-shrink:0}
</style>
<h1>FitFi visuele embeddings: meer-zoals-dit + duplicaten</h1>
<p>${ids.length} producten met embedding. Badge = cosine similarity.</p>
${rows}
<h2>Near-duplicates (cosine &gt; 0.97): ${dupes.length} paren</h2>
${dupeRows}`;

writeFileSync(join(here, "out", outFile), html);
console.log(`Demo: scripts/visual-embeddings/out/${outFile} (${ids.length} producten, ${dupes.length} duplicaat-paren)`);
