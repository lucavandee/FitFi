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
