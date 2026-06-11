import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/data/dataService", () => ({
  fetchProducts: vi.fn(async () => ({
    data: Array.from({ length: 12 }, (_, i) => ({
      id: `p-${i}`,
      title: `Product ${i}`,
      name: `Product ${i}`,
      brand: "TestBrand",
      price: 10 + i,
      imageUrl: "",
      url: "",
      retailer: "test",
      category: "top",
      tags: [],
    })),
    source: "fallback",
  })),
  fetchOutfits: vi.fn(async () => ({ data: [], source: "fallback" })),
}));

vi.mock("@/services/outfits/outfitService", () => ({
  outfitService: { generateOutfits: vi.fn(async () => []) },
}));

import { getOutfitRecommendations } from "@/services/DataRouter";

describe("DataRouter fallback outfits", () => {
  it("returns non-empty fallback outfits when generation yields nothing", async () => {
    // No localStorage in the node environment -> reading quiz answers throws
    // inside getOutfitRecommendations, which is exactly the fallback path.
    const outfits = await getOutfitRecommendations(undefined, { limit: 3 });
    expect(outfits.length).toBeGreaterThan(0);
    for (const outfit of outfits) {
      expect(outfit.products.length).toBeGreaterThan(0);
    }
  });
});
