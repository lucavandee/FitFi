/**
 * Before/after-eval van visuele coherentie in engine v2.
 *
 * Draait de 6 golden profielen x 7 gelegenheden op de fixture-catalogus,
 * één keer zonder en één keer mét visuele embeddings, en rapporteert:
 *  - dekkingsgraad embeddings over de fixture
 *  - gemiddelde intra-outfit visuele coherentie voor/na
 *  - golden floors gehaald in beide standen
 *  - top near-duplicate paren (cosine > 0.97)
 *
 * Gebruik: npx tsx scripts/visual-embeddings/eval.ts
 * Vereist: scripts/visual-embeddings/out/product-embeddings.json
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runEngineV2 } from "../../src/engine/v2/engine";
import { outfitVisualCoherence, cosineSim } from "../../src/engine/v2/scoring/visualCoherence";
import { reclassifyProducts } from "../../src/engine/productClassifier";
import { dedupeProductVariants } from "../../src/services/outfits/dedupeProductVariants";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");

// De classifier logt per product een low-confidence regel; die ruis verbergt
// de eval-uitkomst. Tellen in plaats van printen.
const classifierNotes: string[] = [];
const realLog = console.log;
console.log = (...args: unknown[]) => {
  const first = typeof args[0] === "string" ? args[0] : "";
  if (first.startsWith("[classifier:") || first.startsWith("[engine/v2]")) {
    classifierNotes.push(first);
    return;
  }
  realLog(...args);
};

const rawCatalog = JSON.parse(
  readFileSync(
    join(root, "src/engine/v2/__tests__/fixtures/catalog-tagged-2026-06-11.json"),
    "utf8"
  )
);
const embeddings: Record<string, number[]> = JSON.parse(
  readFileSync(join(here, "out", "product-embeddings.json"), "utf8")
);

// Zelfde mapping en profielen als haalbaarheid.test.ts
function mapDatabaseProduct(dbProduct: any) {
  const tags: string[] = dbProduct.tags || [];
  const style: string = dbProduct.style || "";
  const styleTags = style
    ? [...tags, ...style.split(/[,;/]+/).map((s: string) => s.trim()).filter(Boolean)]
    : tags;
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    brand: dbProduct.brand,
    price: dbProduct.price,
    category: dbProduct.category,
    gender: dbProduct.gender,
    colors: [],
    sizes: [],
    tags,
    styleTags,
    description: dbProduct.description,
    inStock: dbProduct.in_stock ?? true,
  };
}

const PROFILES: Record<string, Record<string, any>> = {
  "man-klassiek": { gender: "male", fit: "regular", neutrals: "koel", goals: ["timeless", "professional"], budgetRange: 150, prints: "effen" },
  "man-casual": { gender: "male", fit: "relaxed", neutrals: "warm", goals: ["comfort"], budgetRange: 100, prints: "effen" },
  "man-sportief": { gender: "male", fit: "slim", neutrals: "neutraal", goals: ["comfort", "trendy"], budgetRange: 120, prints: "effen" },
  "vrouw-klassiek": { gender: "female", fit: "tailored", neutrals: "koel", goals: ["timeless", "professional"], budgetRange: 150, prints: "effen" },
  "vrouw-expressief": { gender: "female", fit: "oversized", neutrals: "warm", goals: ["express", "trendy"], budgetRange: 120, prints: "patroon" },
  "vrouw-sportief": { gender: "female", fit: "slim", neutrals: "neutraal", goals: ["comfort"], budgetRange: 100, prints: "effen" },
};

const BASELINE: Record<string, Record<string, number>> = {
  "man-klassiek": { work: 5, casual: 5, formal: 4, date: 5, party: 4, sports: 5, travel: 5 },
  "man-casual": { work: 5, casual: 5, formal: 4, date: 5, party: 4, sports: 5, travel: 5 },
  "man-sportief": { work: 5, casual: 5, formal: 4, date: 5, party: 5, sports: 5, travel: 5 },
  "vrouw-klassiek": { work: 5, casual: 5, formal: 4, date: 5, party: 5, sports: 4, travel: 5 },
  "vrouw-expressief": { work: 5, casual: 5, formal: 4, date: 5, party: 4, sports: 5, travel: 5 },
  "vrouw-sportief": { work: 4, casual: 5, formal: 5, date: 5, party: 5, sports: 5, travel: 5 },
};

// Dekkingsgraad
const fixtureIds = new Set((rawCatalog as any[]).map((p) => String(p.id)));
const covered = [...fixtureIds].filter((id) => embeddings[id]);
console.log(`\n=== Dekkingsgraad ===`);
console.log(
  `${covered.length}/${fixtureIds.size} fixture-producten hebben een embedding (${Math.round((covered.length / fixtureIds.size) * 100)}%)`
);

// Pools per gender
const pools = new Map<string, any[]>();
for (const gender of ["male", "female"]) {
  const rows = (rawCatalog as any[]).filter(
    (p) => p.gender === gender || p.gender === "unisex"
  );
  const mapped = dedupeProductVariants(rows.map(mapDatabaseProduct));
  const { classified } = reclassifyProducts(mapped as any);
  pools.set(gender, classified);
}

// Before/after per profiel x gelegenheid
type CellResult = { count: number; coherence: number | null };
function runMatrix(withVisual: boolean): Record<string, Record<string, CellResult>> {
  const out: Record<string, Record<string, CellResult>> = {};
  for (const [name, base] of Object.entries(PROFILES)) {
    out[name] = {};
    for (const occ of Object.keys(BASELINE[name])) {
      const result = runEngineV2(
        { ...base, occasions: [occ] },
        pools.get(base.gender)! as any,
        withVisual
          ? { count: 6, seed: 42, visualEmbeddings: embeddings, visualWeight: 0.15 }
          : { count: 6, seed: 42 }
      );
      const coherences = result.outfits
        .map((o) =>
          outfitVisualCoherence(
            { products: o.products.map((p) => ({ product: p })) } as any,
            embeddings
          )
        )
        .filter((c): c is number => c !== null);
      out[name][occ] = {
        count: result.outfits.length,
        coherence: coherences.length
          ? coherences.reduce((a, b) => a + b, 0) / coherences.length
          : null,
      };
    }
  }
  return out;
}

console.log(`\n=== Engine-runs (dit kan even duren) ===`);
const before = runMatrix(false);
const after = runMatrix(true);

let floorsBefore = 0;
let floorsAfter = 0;
let cells = 0;
let cohBeforeSum = 0;
let cohAfterSum = 0;
let cohCells = 0;
for (const name of Object.keys(PROFILES)) {
  for (const occ of Object.keys(BASELINE[name])) {
    cells++;
    if (before[name][occ].count >= BASELINE[name][occ]) floorsBefore++;
    if (after[name][occ].count >= BASELINE[name][occ]) floorsAfter++;
    const cb = before[name][occ].coherence;
    const ca = after[name][occ].coherence;
    if (cb !== null && ca !== null) {
      cohBeforeSum += cb;
      cohAfterSum += ca;
      cohCells++;
    }
  }
}

console.log(`\n=== Resultaat ===`);
console.log(`Golden floors zonder visueel: ${floorsBefore}/${cells}`);
console.log(`Golden floors met visueel:    ${floorsAfter}/${cells}`);
if (cohCells > 0) {
  const b = cohBeforeSum / cohCells;
  const a = cohAfterSum / cohCells;
  console.log(`Gem. intra-outfit visuele coherentie zonder: ${b.toFixed(4)}`);
  console.log(`Gem. intra-outfit visuele coherentie met:    ${a.toFixed(4)}`);
  console.log(`Delta: ${(((a - b) / Math.abs(b)) * 100).toFixed(1)}%`);
} else {
  console.log("Geen cellen met voldoende embedding-dekking voor coherentie-meting.");
}

// Near-duplicates
console.log(`\n=== Classifier-signaal ===`);
console.log(
  `${classifierNotes.length} low-confidence classificaties tijdens de runs (zie eval-log voor detail).`
);

console.log(`\n=== Near-duplicates (cosine > 0.97) ===`);
const ids = covered;
const byId = new Map(
  (rawCatalog as any[]).map((p) => [String(p.id), p as any])
);
const dupes: Array<{ a: string; b: string; sim: number }> = [];
for (let i = 0; i < ids.length; i++) {
  for (let j = i + 1; j < ids.length; j++) {
    const sim = cosineSim(embeddings[ids[i]], embeddings[ids[j]]);
    if (sim > 0.97) dupes.push({ a: ids[i], b: ids[j], sim });
  }
}
dupes.sort((x, y) => y.sim - x.sim);
console.log(`${dupes.length} paren gevonden; top 20:`);
for (const d of dupes.slice(0, 20)) {
  const na = byId.get(d.a)?.name ?? d.a;
  const nb = byId.get(d.b)?.name ?? d.b;
  console.log(`  ${d.sim.toFixed(4)}  ${String(na).slice(0, 48)}  <->  ${String(nb).slice(0, 48)}`);
}
