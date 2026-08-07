#!/usr/bin/env node
/**
 * Haalt de productcatalogus (id + image_url + basisvelden) op uit Supabase
 * en schrijft scripts/visual-embeddings/out/catalog-images.json.
 *
 * Credentials komen uit env of een lokale .env in de repo-root:
 *   VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (of SUPABASE_URL / SUPABASE_ANON_KEY)
 * Waarden worden nooit gelogd.
 *
 * Gebruik: node scripts/visual-embeddings/fetch-catalog.mjs
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function loadDotEnv() {
  const path = join(root, ".env");
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const dotenv = loadDotEnv();
const env = (k) => process.env[k] ?? dotenv[k];
const url = env("VITE_SUPABASE_URL") ?? env("SUPABASE_URL");
const key = env("VITE_SUPABASE_ANON_KEY") ?? env("SUPABASE_ANON_KEY");

if (!url || !key) {
  console.error(
    "Geen Supabase-credentials gevonden. Zet VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in je omgeving of in .env in de repo-root."
  );
  process.exit(1);
}

const SELECT = "id,name,brand,category,gender,image_url,in_stock";
const products = [];

async function get(query) {
  const res = await fetch(`${url}/rest/v1/products?${query}`, {
    headers: { apikey: key, authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    console.error(`Supabase gaf ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  return res.json();
}

// --ids-from <json>: haal alleen de producten op waarvan het id in het
// opgegeven bestand voorkomt (array van objecten met id, of array van ids).
// Zonder deze vlag wordt de hele tabel doorlopen met keyset-paginatie;
// offset-paginatie loopt op deze tabel (80k+ rijen) in een statement timeout.
const idsFromIdx = process.argv.indexOf("--ids-from");
if (idsFromIdx !== -1) {
  const raw = JSON.parse(readFileSync(process.argv[idsFromIdx + 1], "utf8"));
  const ids = [...new Set(raw.map((r) => String(r.id ?? r)))];
  console.log(`Gericht ophalen: ${ids.length} ids`);
  const CHUNK = 100;
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    products.push(
      ...(await get(`select=${SELECT}&id=in.(${chunk.join(",")})`))
    );
    if (i % 500 === 0) console.log(`  ${products.length}/${ids.length}...`);
  }
} else {
  const PAGE = 1000;
  let cursor = null;
  for (;;) {
    const after = cursor ? `&id=gt.${cursor}` : "";
    const page = await get(`select=${SELECT}&order=id.asc&limit=${PAGE}${after}`);
    if (page.length === 0) break;
    products.push(...page);
    cursor = page[page.length - 1].id;
    if (products.length % 5000 < PAGE) {
      console.log(`Opgehaald: ${products.length} producten...`);
    }
    if (page.length < PAGE) break;
  }
}

const withImage = products.filter(
  (p) => typeof p.image_url === "string" && p.image_url.startsWith("http")
);
const outDir = join(root, "scripts", "visual-embeddings", "out");
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, "catalog-images.json"),
  JSON.stringify(withImage, null, 1)
);
console.log(
  `Klaar: ${withImage.length}/${products.length} producten met afbeelding -> scripts/visual-embeddings/out/catalog-images.json`
);
