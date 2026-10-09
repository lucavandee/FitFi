import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();

vi.mock("@/lib/supabaseClient", () => ({
  supabase: () => ({ rpc }),
}));

import { CatalogusOnbereikbaar } from "@/services/outfits/outfitService";
import { haalShopItems } from "../shopService";

const rij = (id: string, category: string, name: string, occasions: string[] = []) => ({
  product_id: id,
  category,
  score: 0,
  attrs: { category, occasions },
  product: {
    id,
    name,
    brand: "Merk",
    price: 40,
    gender: "male",
    in_stock: true,
    image_url: `https://x/${id}.jpg`,
    affiliate_url: `https://x/aff/${id}`,
    category: "accessory",
  },
});

describe("haalShopItems", () => {
  beforeEach(() => {
    rpc.mockReset();
  });

  it("vraagt de gecureerde kandidaten op voor de quizantwoorden van de bezoeker, met zestig per categorie", async () => {
    rpc.mockResolvedValue({ data: [rij("p1", "top", "Basic T-shirt", ["work"])], error: null });

    const items = await haalShopItems({
      gender: "male",
      occasions: ["work"],
      budget: { min: 50, max: 150 },
    });

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("get_kandidaten", {
      p_gender: "male",
      p_occasions: ["work"],
      p_budget_min: 50,
      p_budget_max: 150,
      p_axes: {},
      p_liked_ids: [],
      p_disliked_ids: [],
      p_per_category: 60,
    });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: "p1", category: "top", itemReason: "Past bij werk." });
  });

  it("werkt ook zonder quizantwoorden, met de standaardwaarden van de site", async () => {
    rpc.mockResolvedValue({ data: [rij("p1", "top", "Basic T-shirt", ["work"])], error: null });

    const items = await haalShopItems(null);

    expect(rpc).toHaveBeenCalledWith(
      "get_kandidaten",
      expect.objectContaining({ p_gender: "unisex", p_occasions: [], p_budget_min: 0, p_budget_max: 150, p_per_category: 60 })
    );
    // Geen gekozen gelegenheden: de shop belooft geen afstemming.
    expect(items[0].itemReason).toBeUndefined();
  });

  it("probeert het één keer opnieuw bij een tijdelijke fout", async () => {
    rpc
      .mockResolvedValueOnce({ data: null, error: { code: "57014", message: "canceling statement due to statement timeout" } })
      .mockResolvedValueOnce({ data: [rij("p1", "top", "Basic T-shirt")], error: null });

    const items = await haalShopItems({});

    expect(rpc).toHaveBeenCalledTimes(2);
    expect(items.map((i) => i.id)).toEqual(["p1"]);
  });

  it("geeft op na één herkansing", async () => {
    rpc.mockResolvedValue({ data: null, error: { code: "57014", message: "canceling statement due to statement timeout" } });

    await expect(haalShopItems({})).rejects.toBeInstanceOf(CatalogusOnbereikbaar);
    expect(rpc).toHaveBeenCalledTimes(2);
  });

  it("probeert een permanente fout niet opnieuw", async () => {
    rpc.mockResolvedValue({ data: null, error: { code: "42501", message: "permission denied for function get_kandidaten" } });

    await expect(haalShopItems({})).rejects.toBeInstanceOf(CatalogusOnbereikbaar);
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("geeft een lege lijst als niets bij de filters past", async () => {
    rpc.mockResolvedValue({ data: [], error: null });

    await expect(haalShopItems({ gender: "female", budget: { min: 0, max: 5 } })).resolves.toEqual([]);
  });

  it("geeft op met CatalogusOnbereikbaar als de database niet binnen de tijdslimiet antwoordt, zonder het opnieuw te proberen", async () => {
    vi.useFakeTimers();
    try {
      rpc.mockReturnValue(new Promise(() => {}));
      const uit = haalShopItems({});
      const verwacht = expect(uit).rejects.toBeInstanceOf(CatalogusOnbereikbaar);
      await vi.advanceTimersByTimeAsync(20_000);
      await verwacht;
      expect(rpc).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
