import { describe, expect, it } from "vitest";
import {
  KANDIDATEN_PER_CATEGORIE,
  bereidKandidatenVoor,
  bereidKandidatenVoorMetDiagnose,
  mapKandidaatProduct,
  naarKandidatenParams,
  telCategorieAfwijkingen,
} from "../kandidaten";

describe("naarKandidatenParams", () => {
  it("vertaalt de standaard quiz-antwoorden", () => {
    const p = naarKandidatenParams({
      gender: "male",
      occasions: ["work", "date"],
      budget: { min: 50, max: 150 },
    });
    expect(p).toEqual({
      p_gender: "male",
      p_occasions: ["work", "date"],
      p_budget_min: 50,
      p_budget_max: 150,
      p_axes: {},
      p_liked_ids: [],
      p_disliked_ids: [],
      p_per_category: KANDIDATEN_PER_CATEGORIE,
    });
  });

  it("maakt non-binary, prefer-not-to-say en ontbrekend gender unisex", () => {
    expect(naarKandidatenParams({ gender: "non-binary" }).p_gender).toBe("unisex");
    expect(naarKandidatenParams({ gender: "prefer-not-to-say" }).p_gender).toBe("unisex");
    expect(naarKandidatenParams({}).p_gender).toBe("unisex");
  });

  it("houdt alleen geldige gelegenheden over en vertaalt sports naar sport", () => {
    const p = naarKandidatenParams({ occasions: ["Work", "sports", "onzin", "party", "party"] });
    expect(p.p_occasions).toEqual(["work", "sport", "party"]);
  });

  it("geeft een lege lijst bij een leeg of ontbrekend occasions-veld", () => {
    expect(naarKandidatenParams({}).p_occasions).toEqual([]);
    expect(naarKandidatenParams({ occasions: [] }).p_occasions).toEqual([]);
  });

  it("valt terug op budgetRange en daarna op 0 tot 150", () => {
    expect(naarKandidatenParams({ budgetRange: 80 })).toMatchObject({ p_budget_min: 0, p_budget_max: 80 });
    expect(naarKandidatenParams({})).toMatchObject({ p_budget_min: 0, p_budget_max: 150 });
  });

  it("zet een omgekeerd of negatief budget recht en rondt op hele euro's", () => {
    expect(naarKandidatenParams({ budget: { min: 120.4, max: 60.2 } })).toMatchObject({
      p_budget_min: 60,
      p_budget_max: 121,
    });
    expect(naarKandidatenParams({ budget: { min: -5, max: 40 } })).toMatchObject({
      p_budget_min: 0,
      p_budget_max: 40,
    });
  });
});

describe("mapKandidaatProduct", () => {
  it("zet een products-rij om naar het engine-Product", () => {
    const product = mapKandidaatProduct({
      id: "p1",
      name: "Basic T-shirt",
      brand: "Merk",
      price: 29.95,
      image_url: "https://x/img.jpg",
      category: "top",
      gender: "male",
      colors: ["zwart"],
      sizes: ["M"],
      tags: ["basic"],
      style: "minimalist, casual",
      retailer: "H&M",
      affiliate_url: "https://x/aff",
      product_url: "https://x/p",
      in_stock: true,
    });
    expect(product).toMatchObject({
      id: "p1",
      name: "Basic T-shirt",
      imageUrl: "https://x/img.jpg",
      category: "top",
      color: "zwart",
      styleTags: ["basic", "minimalist", "casual"],
      affiliateUrl: "https://x/aff",
      productUrl: "https://x/p",
      inStock: true,
    });
  });
});

const rij = (id: string, category: string, product: Record<string, any>) => ({
  product_id: id,
  category,
  score: 0,
  attrs: { category },
  product: { id, brand: "Merk", price: 50, gender: "male", in_stock: true, ...product },
});

describe("bereidKandidatenVoor", () => {
  it("maakt van RPC-rijen een geclassificeerde, veilige pool", () => {
    const pool = bereidKandidatenVoor([
      rij("p1", "top", { name: "Basic T-shirt", category: "top" }),
      rij("p2", "footwear", { name: "Witte sneakers", category: "footwear" }),
    ]);
    expect(pool.map((p) => p.id).sort()).toEqual(["p1", "p2"]);
    expect(pool.find((p) => p.id === "p2")?.category).toBe("footwear");
  });

  it("neemt de categorie van product_attributes, niet die van de feed", () => {
    // In de feed stond dit shirt als accessory (audit: 'Shirt FAY Men color Blue').
    const pool = bereidKandidatenVoor([
      rij("p3", "top", { name: "Shirt FAY Men color Blue", category: "accessory" }),
    ]);
    expect(pool).toHaveLength(1);
    expect(pool[0].category).toBe("top");
  });
});

describe("telCategorieAfwijkingen", () => {
  it("is 0 als de client-classifier het met product_attributes eens is", () => {
    const rijen = [rij("p1", "top", { name: "Basic T-shirt", category: "accessory" })];
    const pool = bereidKandidatenVoor(rijen);
    expect(telCategorieAfwijkingen(rijen, pool)).toBe(0);
  });

  it("telt een product waarvan de pool-categorie afwijkt van de RPC-categorie", () => {
    const rijen = [rij("p1", "accessory", { name: "Basic T-shirt", category: "accessory" })];
    const pool = bereidKandidatenVoor(rijen); // classifier zegt top
    expect(telCategorieAfwijkingen(rijen, pool)).toBe(1);
  });
});

describe("bereidKandidatenVoorMetDiagnose", () => {
  it("maakt een door de classifier volledig afgekeurd product zichtbaar in plaats van het spoorloos te laten verdwijnen", () => {
    // "Onbekend Merkartikel 9000" matcht geen enkele categorie-regel en komt
    // dus niet in classified terecht, maar in rejected (unclassifiable).
    // Zonder deze fix verdween dit product uit bereidKandidatenVoor zonder
    // dat telCategorieAfwijkingen (die alleen over de pool itereert) dat kon
    // zien: de stopregel was blind voor precies dit scenario.
    const rijen = [
      rij("p1", "top", { name: "Basic T-shirt", category: "top" }),
      rij("p2", "top", { name: "Onbekend Merkartikel 9000", category: "top" }),
    ];

    const resultaat = bereidKandidatenVoorMetDiagnose(rijen);

    expect(resultaat.pool.map((p) => p.id)).toEqual(["p1"]);
    expect(resultaat.classifierAfgekeurd).toBe(1);
    expect(resultaat.veiligheidsnetGeweigerd).toBe(0);

    // bereidKandidatenVoor (het brief-contract) blijft alleen de pool geven.
    expect(bereidKandidatenVoor(rijen).map((p) => p.id)).toEqual(["p1"]);
  });

  it("telt ook wat het veiligheidsnet weigert, per reden", () => {
    // Sneakers die de classifier prima als footwear herkent, maar waarvan de
    // hele maatreeks binnen de EU-kinderschoenband valt: dat ziet alleen het
    // veiligheidsnet, niet de classifier.
    const rijen = [rij("p1", "footwear", { name: "Witte sneakers", category: "footwear", sizes: ["24", "25", "26"] })];
    const resultaat = bereidKandidatenVoorMetDiagnose(rijen);
    expect(resultaat.pool).toHaveLength(0);
    expect(resultaat.classifierAfgekeurd).toBe(0);
    expect(resultaat.veiligheidsnetGeweigerd).toBe(1);
    expect(resultaat.geweigerdPerReden).toMatchObject({ kinderschoenmaat: 1 });
  });
});
