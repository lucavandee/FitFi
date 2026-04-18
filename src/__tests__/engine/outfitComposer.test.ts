import { describe, expect, it } from "vitest";
import { composeOutfits } from "@/engine/outfitComposer";

type RawRow = Record<string, unknown>;

const CATALOG_BRANDS = [
  "COS",
  "ARKET",
  "Uniqlo",
  "Filippa K",
  "Drykorn",
  "Boss",
  "Profuomo",
  "Cavallaro",
  "Blue Industry",
  "PME",
  "State of Art",
  "Cast Iron",
];

function mkProduct(
  id: string,
  overrides: Partial<Record<string, unknown>> = {},
): RawRow {
  return {
    id,
    name: "Slim fit katoenen overhemd wit",
    brand: "COS",
    price: 79.95,
    image_url: `https://example.com/${id}.jpg`,
    affiliate_url: `https://partner.example/${id}`,
    category: "top",
    colors: ["wit"],
    style: "smart-casual",
    gender: "male",
    description: "Regular fit katoen overhemd",
    retailer: "example",
    tags: ["katoen"],
    ...overrides,
  };
}

function buildCatalog(size = 40): RawRow[] {
  const rows: RawRow[] = [];
  for (let i = 0; i < size; i++) {
    const brand = CATALOG_BRANDS[i % CATALOG_BRANDS.length];

    rows.push(
      mkProduct(`top-${i}`, {
        name: i % 2 === 0 ? "Katoenen overhemd wit" : "Merino crewneck sweater navy",
        brand,
        category: "top",
        price: 45 + (i % 4) * 20,
        colors: i % 2 === 0 ? ["wit"] : ["navy"],
        style: i % 3 === 0 ? "smart-casual" : "casual",
      }),
    );

    rows.push(
      mkProduct(`bottom-${i}`, {
        name: i % 2 === 0 ? "Slim fit chino beige" : "Regular fit jeans donkerblauw",
        brand,
        category: "bottom",
        price: 55 + (i % 5) * 15,
        colors: i % 2 === 0 ? ["beige"] : ["donkerblauw"],
        style: i % 2 === 0 ? "smart-casual" : "casual",
      }),
    );

    rows.push(
      mkProduct(`footwear-${i}`, {
        name: i % 2 === 0 ? "Leren derby schoen bruin" : "Witte sneaker",
        brand,
        category: "footwear",
        price: 85 + (i % 6) * 20,
        colors: i % 2 === 0 ? ["bruin"] : ["wit"],
        style: i % 2 === 0 ? "smart-casual" : "casual",
      }),
    );

    rows.push(
      mkProduct(`outerwear-${i}`, {
        name: "Wollen blazer navy",
        brand,
        category: "outerwear",
        price: 149 + (i % 3) * 30,
        colors: ["navy"],
        style: "smart-casual",
      }),
    );
  }
  return rows;
}

describe("composeOutfits", () => {
  it("returns an empty array when there are no products", () => {
    const result = composeOutfits([], "MINIMALIST", 3);
    expect(result).toEqual([]);
  });

  it("returns an empty array when a required category pool is missing", () => {
    const rows = buildCatalog(10).filter((r) => r.category !== "footwear");
    const result = composeOutfits(rows, "MINIMALIST", 3);
    expect(result).toEqual([]);
  });

  it("always builds outfits with the required top, bottom and footwear (never two tops)", () => {
    const rows = buildCatalog(30);
    const outfits = composeOutfits(rows, "SMART_CASUAL", 3);

    expect(outfits.length).toBeGreaterThan(0);

    for (const outfit of outfits) {
      const categories = outfit.products.map((p) => p.category);
      expect(categories).toContain("top");
      expect(categories).toContain("bottom");
      expect(categories).toContain("footwear");

      const tops = categories.filter((c) => c === "top").length;
      expect(tops).toBe(1);

      const bottoms = categories.filter((c) => c === "bottom").length;
      expect(bottoms).toBe(1);

      const footwear = categories.filter((c) => c === "footwear").length;
      expect(footwear).toBe(1);
    }
  });

  it("respects a tight budget ceiling when preferences include one", () => {
    const rows: RawRow[] = [];
    for (let i = 0; i < 40; i++) {
      const brand = CATALOG_BRANDS[i % CATALOG_BRANDS.length];
      rows.push(
        mkProduct(`top-${i}`, {
          name: "Katoenen overhemd wit",
          brand,
          category: "top",
          price: 40,
          style: "smart-casual",
        }),
        mkProduct(`bottom-${i}`, {
          name: "Slim fit chino beige",
          brand,
          category: "bottom",
          price: 45,
          style: "smart-casual",
        }),
        mkProduct(`footwear-${i}`, {
          name: "Witte sneaker",
          brand,
          category: "footwear",
          price: 50,
          style: "casual",
        }),
      );
    }

    const maxBudget = 60;
    const outfits = composeOutfits(rows, "SMART_CASUAL", 3, "male", {
      budget: { min: 0, max: maxBudget },
    });

    expect(outfits.length).toBeGreaterThan(0);

    const ceiling = maxBudget * 1.35;
    for (const outfit of outfits) {
      for (const product of outfit.products) {
        expect(product.price).toBeLessThanOrEqual(ceiling);
      }
    }
  });

  it("produces different outfits when preferences change — scoring is not hardcoded", () => {
    const rows = buildCatalog(40);

    const casualOutfits = composeOutfits(rows, "SMART_CASUAL", 2, "male", {
      goals: ["comfort"],
      prints: "effen",
      fit: "relaxed",
    });
    const trendyOutfits = composeOutfits(rows, "SMART_CASUAL", 2, "male", {
      goals: ["trendy"],
      prints: "statement",
      fit: "slim",
    });

    expect(casualOutfits.length).toBeGreaterThan(0);
    expect(trendyOutfits.length).toBeGreaterThan(0);

    const casualIds = casualOutfits
      .flatMap((o) => o.products.map((p) => p.id))
      .sort();
    const trendyIds = trendyOutfits
      .flatMap((o) => o.products.map((p) => p.id))
      .sort();

    expect(casualIds).not.toEqual(trendyIds);
  });

  it("filters to the requested gender when enough gender-specific stock exists", () => {
    const rows: RawRow[] = [];
    for (let i = 0; i < 40; i++) {
      rows.push(
        mkProduct(`m-top-${i}`, {
          category: "top",
          gender: "male",
          name: "Katoenen overhemd wit",
        }),
        mkProduct(`m-bottom-${i}`, {
          category: "bottom",
          gender: "male",
          name: "Slim fit chino beige",
        }),
        mkProduct(`m-foot-${i}`, {
          category: "footwear",
          gender: "male",
          name: "Witte sneaker",
        }),
        mkProduct(`f-top-${i}`, {
          category: "top",
          gender: "female",
          name: "Zijden blouse",
        }),
      );
    }

    const outfits = composeOutfits(rows, "SMART_CASUAL", 3, "male");

    expect(outfits.length).toBeGreaterThan(0);
    for (const outfit of outfits) {
      for (const product of outfit.products) {
        expect(["male", "unisex"]).toContain(product.gender);
      }
    }
  });

  it("assigns a match score in a reasonable range (55-98)", () => {
    const rows = buildCatalog(30);
    const outfits = composeOutfits(rows, "MINIMALIST", 3);

    expect(outfits.length).toBeGreaterThan(0);
    for (const outfit of outfits) {
      expect(outfit.matchScore).toBeGreaterThanOrEqual(55);
      expect(outfit.matchScore).toBeLessThanOrEqual(98);
    }
  });

  it("handles an empty preferences object without crashing", () => {
    const rows = buildCatalog(30);
    expect(() =>
      composeOutfits(rows, "MINIMALIST", 3, undefined, {}),
    ).not.toThrow();
  });
});
