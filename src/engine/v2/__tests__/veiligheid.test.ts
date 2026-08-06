/**
 * Bewaakt dat engine v2 dezelfde veiligheidsgrenzen aanhoudt als het
 * calibratiescherm. Tot 2026-08-06 gold dat alleen op het calibratiescherm:
 * dat draaide beoordeelOutfit na afloop, terwijl /results (EnhancedResultsPage
 * -> useOutfits -> outfitService -> runEngineV2) helemaal geen controle deed.
 * De gebruiker kreeg daardoor kinderkleding tussen zijn resultaten.
 *
 * De checks zitten nu in de engine zelf: beoordeelProduct in candidateFilter
 * (productniveau) en seizoenenBotsen in tryCompose (outfitniveau). Deze test
 * kijkt naar de uitkomst van de hele engine, niet naar de losse functies, want
 * die worden al door productSafety.test.ts en seizoen.test.ts gedekt. Wat hier
 * misgaat is niet de regex maar de bedrading.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { runEngineV2 } from "../engine";
import { seizoenVan } from "@/engine/productSafety";
import { reclassifyProducts } from "@/engine/productClassifier";
import { dedupeProductVariants } from "@/services/outfits/dedupeProductVariants";
import rawCatalog from "./fixtures/catalog-tagged-2026-06-11.json";

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

const GOLDEN_SEED = 20260805;
const OCCASIONS = ["work", "casual", "formal", "date", "party", "sports", "travel"];
const PROFILES = [
  { naam: "man-sportief", gender: "male", fit: "slim", neutrals: "neutraal", goals: ["comfort", "trendy"], budgetRange: 120, prints: "effen" },
  { naam: "vrouw-sportief", gender: "female", fit: "slim", neutrals: "neutraal", goals: ["comfort"], budgetRange: 100, prints: "effen" },
];

/** "Maat 5-6Y", "7-8Y", "9-10Y": leeftijdsmaten, dus kinderkleding. */
const KINDERMAAT = /\b\d{1,2}-\d{1,2}\s*Y\b/i;

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

describe("engine v2 houdt zich aan de veiligheidsgrenzen", () => {
  it("de fixture bevat wel degelijk kinderkleding, anders bewijst deze test niets", () => {
    const alles = [...pools.get("male")!, ...pools.get("female")!];
    const kinder = alles.filter((p) => KINDERMAAT.test(String(p.name ?? "")));
    expect(kinder.length).toBeGreaterThan(0);
  });

  for (const profiel of PROFILES) {
    for (const occ of OCCASIONS) {
      it(`${profiel.naam} / ${occ}: geen kindermaat en geen seizoensbotsing`, () => {
        const result = runEngineV2(
          { ...profiel, occasions: [occ] } as any,
          pools.get(profiel.gender)! as any,
          { count: 6, seed: GOLDEN_SEED }
        );

        for (const outfit of result.outfits) {
          const namen = outfit.products.map((p: any) => String(p.name ?? ""));

          const kinder = namen.filter((n) => KINDERMAAT.test(n));
          expect(kinder, `kindermaat in outfit: ${kinder.join(", ")}`).toHaveLength(0);

          const seizoenen = namen.map(seizoenVan);
          const botst =
            seizoenen.includes("winter") && seizoenen.includes("zomer");
          expect(botst, `winter en zomer in een outfit: ${namen.join(" + ")}`).toBe(false);
        }
      });
    }
  }
});
