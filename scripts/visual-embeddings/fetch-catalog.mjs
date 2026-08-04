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

const PAGE = 1000;
const products = [];
for (let offset = 0; ; offset += PAGE) {
  const res = await fetch(
    `${url}/rest/v1/products?select=id,name,brand,category,gender,image_url,in_stock&order=id&limit=${PAGE}&offset=${offset}`,
    { headers: { apikey: key, authorization: `Bearer ${key}` } }
  );
  if (!res.ok) {
    console.error(`Supabase gaf ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  const page = await res.json();
  products.push(...page);
  console.log(`Opgehaald: ${products.length} producten...`);
  if (page.length < PAGE) break;
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
