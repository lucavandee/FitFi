import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
const telQuery = vi.fn();
const runEngineV2 = vi.fn();

vi.mock("@/lib/supabaseClient", () => ({
  supabase: () => ({
    rpc,
    from: () => ({ select: telQuery }),
  }),
}));

vi.mock("@/engine/v2", () => ({
  runEngineV2: (...args: unknown[]) => runEngineV2(...args),
}));

import { CatalogusOnbereikbaar, outfitService } from "../outfitService";
import { seedFromAnswers } from "../answersSeed";
import { KANDIDATEN_PER_CATEGORIE } from "../kandidaten";

// Een naam die de echte classifier (reclassifyProducts, ongemockt) ook
// daadwerkelijk als deze categorie herkent. "Product p1" matcht geen enkele
// regel in productClassifier.ts en zou als "unclassifiable" wegvallen; zie
// het gelijke patroon (Basic T-shirt / Witte sneakers) in kandidaten.test.ts.
const NAMEN_PER_CATEGORIE: Record<string, string> = {
  top: "Basic T-shirt",
  footwear: "Witte sneakers",
};

const rij = (id: string, category: string, price: number) => ({
  product_id: id,
  category,
  score: 0,
  attrs: { category },
  product: {
    id,
    name: NAMEN_PER_CATEGORIE[category] ?? `Product ${id}`,
    brand: "Merk",
    price,
    category,
    gender: "male",
    in_stock: true,
  },
});

// Matcht geen enkele regel in productClassifier.ts (geen "top"-trefwoord in
// naam of categorietekst) en valt dus als "unclassifiable" in `rejected`.
// Zelfde fixture als kandidaten.test.ts ("bereidKandidatenVoorMetDiagnose").
const nietClassificeerbaar = (id: string) => ({
  product_id: id,
  category: "top",
  score: 0,
  attrs: { category: "top" },
  product: { id, name: "Onbekend Merkartikel 9000", brand: "Merk", price: 60, category: "top", gender: "male", in_stock: true },
});

// Wordt prima als footwear geclassificeerd, maar de hele maatreeks valt
// binnen de EU-kinderschoenband: het veiligheidsnet weigert hem, niet de
// classifier. Zelfde fixture als kandidaten.test.ts.
const kinderschoen = (id: string) => ({
  product_id: id,
  category: "footwear",
  score: 0,
  attrs: { category: "footwear" },
  product: {
    id,
    name: "Witte sneakers",
    brand: "Merk",
    price: 60,
    category: "footwear",
    gender: "male",
    in_stock: true,
    sizes: ["24", "25", "26"],
  },
});

const outfit = {
  id: "o1",
  title: "Outfit",
  description: "",
  archetype: "classic",
  occasion: "work",
  products: [],
  tags: [],
  matchPercentage: 80,
  explanation: "Klaar voor kantoor.",
};

const answers = { gender: "male", occasions: ["work"], budget: { min: 50, max: 150 } };

beforeEach(() => {
  rpc.mockReset();
  telQuery.mockReset();
  runEngineV2.mockReset();
  outfitService.clearCache();
  runEngineV2.mockReturnValue({ outfits: [outfit], stats: {} });
});

describe("outfitService.getProducts", () => {
  it("roept get_kandidaten aan met de vertaalde antwoorden", async () => {
    rpc.mockResolvedValue({ data: [rij("p1", "top", 60), rij("p2", "footwear", 90)], error: null });
    const producten = await outfitService.getProducts(answers);
    expect(rpc).toHaveBeenCalledWith("get_kandidaten", {
      p_gender: "male",
      p_occasions: ["work"],
      p_budget_min: 50,
      p_budget_max: 150,
      p_axes: {},
      p_liked_ids: [],
      p_disliked_ids: [],
      p_per_category: KANDIDATEN_PER_CATEGORIE,
    });
    expect(producten.map((p) => p.id).sort()).toEqual(["p1", "p2"]);
  });

  it("leest een string als gender, voor de kalibratie-aanroepers", async () => {
    rpc.mockResolvedValue({ data: [rij("p1", "top", 60)], error: null });
    await outfitService.getProducts("female");
    expect(rpc.mock.calls[0][1]).toMatchObject({ p_gender: "female", p_budget_min: 0, p_budget_max: 150 });
  });

  it("gooit CatalogusOnbereikbaar bij een rpc-fout", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "boem" } });
    await expect(outfitService.getProducts(answers)).rejects.toBeInstanceOf(CatalogusOnbereikbaar);
  });

  it("gooit CatalogusOnbereikbaar als product_attributes leeg is", async () => {
    rpc.mockResolvedValue({ data: [], error: null });
    telQuery.mockResolvedValue({ count: 0, error: null });
    await expect(outfitService.getProducts(answers)).rejects.toThrow("product_attributes is leeg");
  });

  it("geeft een lege lijst als er wel attributen zijn maar niets binnen de filters", async () => {
    rpc.mockResolvedValue({ data: [], error: null });
    telQuery.mockResolvedValue({ count: 1234, error: null });
    await expect(outfitService.getProducts(answers)).resolves.toEqual([]);
  });
});

describe("outfitService.getProducts - lege pool na classificatie en veiligheidsnet (fixronde 1)", () => {
  it("cachet geen lege pool: een volgende aanroep met dezelfde antwoorden probeert het opnieuw", async () => {
    // Eerste ronde: de enige rij valt volledig weg (classifier), dus de pool
    // is leeg terwijl de RPC wel data teruggaf (geen "nul rijen"-pad).
    rpc.mockResolvedValueOnce({ data: [nietClassificeerbaar("p1")], error: null });
    const eersteRonde = await outfitService.getProducts(answers);
    expect(eersteRonde).toEqual([]);

    // Tweede ronde, zelfde antwoorden (dus zelfde cacheKey), geen forceRefresh:
    // was de lege pool gecachet, dan kwam dit nooit bij de rpc terecht en
    // bleef het resultaat [] voor de volle CACHE_DURATION (30 minuten).
    rpc.mockResolvedValueOnce({ data: [rij("p2", "footwear", 60)], error: null });
    const tweedeRonde = await outfitService.getProducts(answers);
    expect(tweedeRonde.map((p) => p.id)).toEqual(["p2"]);
    expect(rpc).toHaveBeenCalledTimes(2);
  });

  it("meldt luid als de classifier alleen de hele pool afkeurt", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    rpc.mockResolvedValueOnce({ data: [nietClassificeerbaar("p1")], error: null });
    const pool = await outfitService.getProducts(answers);
    expect(pool).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("meldt ook luid als alleen het veiligheidsnet de hele pool afkeurt", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    rpc.mockResolvedValueOnce({ data: [kinderschoen("p1")], error: null });
    const pool = await outfitService.getProducts(answers);
    expect(pool).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("meldt ook luid als classifier en veiligheidsnet samen, elk voor een deel, de hele pool afkeuren", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    rpc.mockResolvedValueOnce({ data: [nietClassificeerbaar("p1"), kinderschoen("p2")], error: null });
    const pool = await outfitService.getProducts(answers);
    expect(pool).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("blijft stil bij een enkel geweigerd product op een verder gezonde pool (ruis, geen signaal)", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const rijen = [
      ...Array.from({ length: 9 }, (_, i) => rij(`goed-${i}`, "top", 60)),
      nietClassificeerbaar("slecht-1"),
    ]; // 1 op 10 afgekeurd = 10%, onder AFWIJZINGSDREMPEL (20%)
    rpc.mockResolvedValueOnce({ data: rijen, error: null });
    const pool = await outfitService.getProducts(answers);
    expect(pool.length).toBe(9);
    const opvallendeMelding = warnSpy.mock.calls.some(
      ([boodschap]) => typeof boodschap === "string" && boodschap.includes("opvallend deel")
    );
    expect(opvallendeMelding).toBe(false);
    warnSpy.mockRestore();
  });

  it("waarschuwt als een aanzienlijk deel van de pool wordt afgekeurd, ook als er nog producten overblijven", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const rijen = [
      rij("goed-1", "top", 60),
      rij("goed-2", "top", 60),
      rij("goed-3", "top", 60),
      nietClassificeerbaar("slecht-1"),
      nietClassificeerbaar("slecht-2"),
    ]; // 2 op 5 afgekeurd = 40%, boven AFWIJZINGSDREMPEL (20%)
    rpc.mockResolvedValueOnce({ data: rijen, error: null });
    const pool = await outfitService.getProducts(answers);
    expect(pool.length).toBe(3);
    const opvallendeMelding = warnSpy.mock.calls.some(
      ([boodschap]) => typeof boodschap === "string" && boodschap.includes("opvallend deel")
    );
    expect(opvallendeMelding).toBe(true);
    warnSpy.mockRestore();
  });
});

describe("outfitService.generateOutfits", () => {
  it("geeft engine v2 de seed uit de antwoorden mee", async () => {
    rpc.mockResolvedValue({ data: [rij("p1", "top", 60)], error: null });
    await outfitService.generateOutfits(answers, 6);
    expect(runEngineV2).toHaveBeenCalledTimes(1);
    const opties = runEngineV2.mock.calls[0][2] as { seed?: number; count?: number };
    expect(opties.seed).toBe(seedFromAnswers(answers));
    expect(opties.count).toBe(6);
  });

  it("valt terug op een vaste seed als de antwoorden niet stabiel te hashen zijn, in plaats van leeg te renderen", async () => {
    rpc.mockResolvedValue({ data: [rij("p1", "top", 60)], error: null });
    const kapotteAntwoorden = { gender: "male", budget: { min: 0, max: NaN } };
    const outfits = await outfitService.generateOutfits(kapotteAntwoorden, 6);
    expect(outfits).toEqual([outfit]);
    expect(runEngineV2).toHaveBeenCalledTimes(1);
    const opties = runEngineV2.mock.calls[0][2] as { seed?: number };
    expect(typeof opties.seed).toBe("number");
    expect(Number.isFinite(opties.seed)).toBe(true);
  });
});
