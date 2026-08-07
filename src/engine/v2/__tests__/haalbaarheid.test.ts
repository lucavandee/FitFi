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

// Baseline-floors, hermeten 2026-08-05 met GOLDEN_SEED op dezelfde getagde
// snapshot. De vorige cijfers (2026-06-12) waren gemeten met de tijdgebonden
// seed van de engine en waren daarom niet reproduceerbaar: afhankelijk van het
// tijdvak van 5 minuten zakte nu eens "date", dan weer "sports" door de vloer
// zonder dat er code was veranderd. Conventie ongewijzigd: één punt marge waar
// de meting ruimte heeft (6), exact waar de meting krap is (4-5).
//
// Hermeten 2026-08-06, nadat engine v2 twee controles kreeg die het
// calibratiescherm al draaide: beoordeelProduct op productniveau in
// candidateFilter, en seizoenenBotsen op outfitniveau in tryCompose.
// Beide dunnen de pool bewust uit. Gemeten op de fixture:
//   - beoordeelProduct weigert 10 van de 602 producten, alle tien met een
//     kindermaat in de naam ("Maat 5-6Y", "7-8Y", "9-10Y"). Eén ervan heet
//     "PUMA Essentials Logo Lab relaxed short voor Heren, Maat 7-8Y": als
//     herenkleding gelabeld, feitelijk kindermaat. Precies het soort item
//     dat eerder als peuterschoen in een outfit belandde.
//   - seizoenenBotsen raakt 3 winteritems (alle drie gewatteerde pufferjacks)
//     tegen 15 shorts; de overige 584 producten zijn allseason.
// Van de 42 cellen zakken er hierdoor twee met één outfit. Dat is de prijs
// en die is het waard: liever vier bruikbare outfits dan vijf waarvan één
// een kindershort bevat.
//
// Let op de derde wijziging: vrouw-expressief/sports gaat juist OMHOOG van 4
// naar 5, want die cel meet nu 6. Vloeren gaan hier omhoog zodra de meting
// dat toelaat; ze worden niet alleen verlaagd om rood groen te maken.
const BASELINE: Record<string, Record<string, number>> = {
  "man-klassiek":      { work: 5, casual: 5, formal: 5, date: 5, party: 5, sports: 5, travel: 5 },
  "man-casual":        { work: 5, casual: 5, formal: 5, date: 5, party: 5, sports: 5, travel: 5 },
  "man-sportief":      { work: 5, casual: 5, formal: 5, date: 5, party: 5, sports: 4, travel: 5 },
  "vrouw-klassiek":    { work: 5, casual: 5, formal: 5, date: 5, party: 5, sports: 5, travel: 5 },
  "vrouw-expressief":  { work: 5, casual: 5, formal: 5, date: 5, party: 5, sports: 5, travel: 5 },
  "vrouw-sportief":    { work: 5, casual: 5, formal: 4, date: 5, party: 5, sports: 5, travel: 5 },
};

// Vaste seed. Zonder deze seedt de engine op Math.floor(Date.now()/300000),
// dus een nieuw tijdvak van 5 minuten geeft een andere outfit-samenstelling en
// daarmee een andere uitkomst van deze "golden" baseline. Op 2026-08-05 zakte
// daardoor nu eens "date" en dan weer "fan-merch" door de vloer, zonder dat er
// code was veranderd. Een baseline die van de klok afhangt is geen baseline.
const GOLDEN_SEED = 20260805;

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
            { count: 6, seed: GOLDEN_SEED }
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
    // club-jacks. Na feed-uitbreiding dit plafond stapsgewijs naar 0 brengen.
    //
    // Plafond op 5, de reproduceerbare meting met GOLDEN_SEED (was 3, gemeten
    // onder de oude klok-afhankelijke seed). Dit is bewust GEEN
    // versoepeling om een rode test groen te krijgen: op die datum is
    // geprobeerd de penalty te verzwaren (0.80, 0.78, 0.75, 0.70, 0.60, 0.50)
    // en elke waarde onder 0.85 laat de haalbaarheidsfloor voor "werk" van 5
    // naar 4 outfits zakken. De leakage is dus een eigenschap van de dunne
    // catalogus, niet van de scoring, en alleen met feed-uitbreiding op te
    // lossen. Verlaag dit plafond weer zodra de feed breder is.
    const products = pools.get("male")!;
    const result = runEngineV2(
      { ...PROFILES["man-casual"], occasions: ["work"] },
      products as any,
      { count: 6, seed: GOLDEN_SEED }
    );
    const fanMerchItems = result.outfits.flatMap((o: any) =>
      (o.products || []).filter((p: any) =>
        (p.tags || []).includes("fan-merch")
      )
    );
    expect(fanMerchItems.length).toBeLessThanOrEqual(5);
  });
});
