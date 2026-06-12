/**
 * Golden-test / eval-laag voor engine v2: de haalbaarheidsmatrix.
 *
 * Draait de volledige engine op een vaste catalogus-snapshot (live productie,
 * 2026-06-11, mét LLM-tagging zoals apply-product-tags.sql die aanbrengt) en
 * bewaakt per profiel × gelegenheid een minimum aantal outfits. Zakt een cel
 * onder de baseline door een engine- of classifier-wijziging, dan faalt de
 * test. Baselines zijn floors, geen exacte waarden: verbeteren mag altijd.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { runEngineV2 } from "../engine";
import { reclassifyProducts } from "@/engine/productClassifier";
import { dedupeProductVariants } from "@/services/outfits/dedupeProductVariants";
import rawCatalog from "./fixtures/catalog-tagged-2026-06-11.json";

// Zelfde mapping als OutfitService.mapDatabaseProduct
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
  "man-klassiek":     { gender: "male", fit: "regular", neutrals: "koel", goals: ["timeless", "professional"], budgetRange: 150, prints: "effen" },
  "man-casual":       { gender: "male", fit: "relaxed", neutrals: "warm", goals: ["comfort"], budgetRange: 100, prints: "effen" },
  "man-sportief":     { gender: "male", fit: "slim", neutrals: "neutraal", goals: ["comfort", "trendy"], budgetRange: 120, prints: "effen" },
  "vrouw-klassiek":   { gender: "female", fit: "tailored", neutrals: "koel", goals: ["timeless", "professional"], budgetRange: 150, prints: "effen" },
  "vrouw-expressief": { gender: "female", fit: "oversized", neutrals: "warm", goals: ["express", "trendy"], budgetRange: 120, prints: "patroon" },
  "vrouw-sportief":   { gender: "female", fit: "slim", neutrals: "neutraal", goals: ["comfort"], budgetRange: 100, prints: "effen" },
};

// Baseline-floors, gemeten 2026-06-12 op de getagde snapshot (na de
// llm-tag-scoring patch). Eén punt marge onder de meting waar de meting 5-6
// was, exact waar de meting al krap was (4).
const BASELINE: Record<string, Record<string, number>> = {
  "man-klassiek":     { work: 5, casual: 5, formal: 4, date: 5, party: 4, sports: 5, travel: 5 },
  "man-casual":       { work: 5, casual: 5, formal: 4, date: 5, party: 4, sports: 5, travel: 5 },
  "man-sportief":     { work: 5, casual: 5, formal: 4, date: 5, party: 5, sports: 5, travel: 5 },
  "vrouw-klassiek":   { work: 5, casual: 5, formal: 4, date: 5, party: 5, sports: 4, travel: 5 },
  "vrouw-expressief": { work: 5, casual: 5, formal: 4, date: 5, party: 4, sports: 5, travel: 5 },
  "vrouw-sportief":   { work: 4, casual: 5, formal: 5, date: 5, party: 5, sports: 5, travel: 5 },
};

const OCCASIONS = Object.keys(BASELINE["man-klassiek"]);

const pools = new Map<string, any[]>();

beforeAll(() => {
  for (const gender of ["male", "female"]) {
    const rows = (rawCatalog as any[]).filter(
      (p) => p.gender === gender || p.gender === "unisex"
    );
    const mapped = dedupeProductVariants(rows.map(mapDatabaseProduct));
    const { classified } = reclassifyProducts(mapped as any);
    pools.set(gender, classified);
  }
});

describe("haalbaarheidsmatrix (golden baseline)", () => {
  for (const [profileName, base] of Object.entries(PROFILES)) {
    describe(profileName, () => {
      for (const occ of OCCASIONS) {
        it(`${occ}: levert minstens ${BASELINE[profileName][occ]} outfits`, () => {
          const products = pools.get(base.gender)!;
          const result = runEngineV2(
            { ...base, occasions: [occ] },
            products as any,
            { count: 6 }
          );
          expect(result.outfits.length).toBeGreaterThanOrEqual(
            BASELINE[profileName][occ]
          );
        });
      }
    });
  }

  it("houdt fan-merch buiten sport-gelegenheden onder het plafond", () => {
    // De penalty (geen harde uitsluiting) kan fan-merch niet volledig weren
    // zolang de catalogus dun is: heren-outerwear telt 10 items waarvan 7
    // club-jacks. Plafond = gemeten stand 2026-06-12 (3 items over 6 outfits).
    // Na feed-uitbreiding dit plafond stapsgewijs naar 0 brengen.
    const products = pools.get("male")!;
    const result = runEngineV2(
      { ...PROFILES["man-casual"], occasions: ["work"] },
      products as any,
      { count: 6 }
    );
    const fanMerchItems = result.outfits.flatMap((o: any) =>
      (o.products || []).filter((p: any) =>
        (p.tags || []).includes("fan-merch")
      )
    );
    expect(fanMerchItems.length).toBeLessThanOrEqual(3);
  });
});
