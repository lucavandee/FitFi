import { describe, expect, it } from "vitest";
import type { KandidaatRij } from "@/services/outfits/kandidaten";
import { bouwShopItems, gelegenheidsTekst, mixCategorieen } from "../shopItems";

/**
 * Een rij zoals get_kandidaten hem geeft: de categorie van product_attributes
 * bovenaan, en in product de ruwe feedcategorie (die in de feed vaak fout is).
 */
const rij = (
  id: string,
  category: string,
  name: string,
  occasions: string[] = [],
  product: Record<string, unknown> = {}
): KandidaatRij => ({
  product_id: id,
  category,
  score: 0,
  attrs: { category, occasions },
  product: {
    id,
    name,
    brand: "Merk",
    price: 50,
    gender: "male",
    in_stock: true,
    image_url: `https://x/${id}.jpg`,
    affiliate_url: `https://x/aff/${id}`,
    product_url: `https://x/p/${id}`,
    category: "accessory",
    ...product,
  },
});

const item = (id: string, category?: string) => ({ id, category });

describe("mixCategorieen", () => {
  // get_kandidaten geeft de rijen per categorie achter elkaar. In de shop zou
  // "Alle" dan eerst zestig accessoires tonen en pas daarna een top.
  it("wisselt de categorieen af in plaats van ze achter elkaar te zetten", () => {
    const uit = mixCategorieen([
      item("t1", "top"), item("t2", "top"), item("t3", "top"),
      item("b1", "bottom"), item("b2", "bottom"),
      item("f1", "footwear"),
    ]);
    expect(uit.map((i) => i.id)).toEqual(["t1", "b1", "f1", "t2", "b2", "t3"]);
  });

  it("houdt de volgorde binnen een categorie vast en gebruikt een vaste categorievolgorde", () => {
    const uit = mixCategorieen([
      item("a1", "accessory"), item("a2", "accessory"),
      item("o1", "outerwear"),
      item("d1", "dress"),
      item("t1", "top"),
    ]);
    expect(uit.map((i) => i.id)).toEqual(["t1", "d1", "o1", "a1", "a2"]);
  });

  it("zet items zonder bekende categorie achteraan in elke ronde", () => {
    const uit = mixCategorieen([item("x1"), item("t1", "top"), item("x2", "onbekend"), item("t2", "top")]);
    expect(uit.map((i) => i.id)).toEqual(["t1", "x1", "t2", "x2"]);
  });

  it("geeft bij een lege lijst een lege lijst", () => {
    expect(mixCategorieen([])).toEqual([]);
  });
});

describe("gelegenheidsTekst", () => {
  it.each([
    [[], undefined],
    [["work"], "Past bij werk."],
    [["work", "casual"], "Past bij werk en casual."],
    [["work", "casual", "formal"], "Past bij werk, casual en formeel."],
    [["date", "sport", "party", "travel"], "Past bij date night, sport & actief, uitgaan / feest en reizen."],
    [["onzin"], undefined],
    [["onzin", "work"], "Past bij werk."],
  ])("%j geeft %j", (invoer, verwacht) => {
    expect(gelegenheidsTekst(invoer as string[])).toBe(verwacht);
  });
});

describe("bouwShopItems", () => {
  it("zet een kandidaat om naar het item dat de shop toont", () => {
    const [uit] = bouwShopItems([rij("p1", "top", "Basic T-shirt", ["work"], { brand: "Acme", price: 29.95 })], ["work"]);
    expect(uit).toMatchObject({
      id: "p1",
      title: "Basic T-shirt",
      brand: "Acme",
      price: 29.95,
      imageUrl: "https://x/p1.jpg",
      category: "top",
    });
  });

  it("linkt naar de affiliate-link, en valt terug op de productpagina", () => {
    const [met, zonder] = bouwShopItems(
      [
        rij("p1", "top", "Basic T-shirt"),
        rij("p2", "top", "Wit overhemd", [], { affiliate_url: null }),
      ],
      []
    );
    expect(met.url).toBe("https://x/aff/p1");
    expect(zonder.url).toBe("https://x/p/p2");
  });

  it("neemt de categorie van product_attributes, niet die van de feed", () => {
    // Audit: 'Shirt FAY Men color Blue' stond in de feed als accessory.
    const [uit] = bouwShopItems([rij("p1", "top", "Shirt FAY Men color Blue")], []);
    expect(uit.category).toBe("top");
  });

  it("noemt een reden als de gelegenheid van het item overeenkomt met wat de bezoeker koos", () => {
    const uit = bouwShopItems(
      [
        rij("p1", "top", "Basic T-shirt", ["casual", "work"]),
        rij("p2", "bottom", "Slim jeans", ["party"]),
      ],
      ["work", "casual"]
    );
    expect(uit.find((i) => i.id === "p1")?.itemReason).toBe("Past bij werk en casual.");
    expect(uit.find((i) => i.id === "p2")?.itemReason).toBeUndefined();
  });

  it("claimt geen afstemming als de bezoeker geen gelegenheden koos", () => {
    const uit = bouwShopItems([rij("p1", "top", "Basic T-shirt", ["casual", "work"])], []);
    expect(uit[0].itemReason).toBeUndefined();
  });

  it("wisselt de categorieen af", () => {
    const uit = bouwShopItems(
      [
        rij("t1", "top", "Basic T-shirt"),
        rij("t2", "top", "Wit overhemd"),
        rij("f1", "footwear", "Witte sneakers"),
      ],
      []
    );
    expect(uit.map((i) => i.id)).toEqual(["t1", "f1", "t2"]);
  });

  it("laat producten vallen die de classifier niet kan plaatsen", () => {
    const uit = bouwShopItems(
      [rij("p1", "top", "Basic T-shirt"), rij("p2", "top", "Onbekend Merkartikel 9000")],
      []
    );
    expect(uit.map((i) => i.id)).toEqual(["p1"]);
  });

  it("geeft een lege lijst bij geen rijen", () => {
    expect(bouwShopItems([], ["work"])).toEqual([]);
  });
});
