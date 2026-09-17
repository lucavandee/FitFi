import { describe, expect, it } from "vitest";
import { CLASSIFIER_VERSIE, classificeerRij } from "../classificatie";

describe("classificeerRij", () => {
  it("zet een shirt dat in de feed accessory heet op top", () => {
    const r = classificeerRij({ id: "p1", name: "Shirt FAY Men color Blue", category: "accessory" });
    expect(r).toEqual({ product_id: "p1", category: "top", is_fashion: true });
  });

  it("zet een sneaker met category bottom op footwear", () => {
    const r = classificeerRij({ id: "p2", name: "PUMA Tackle L sneakers uniseks", category: "bottom" });
    expect(r.category).toBe("footwear");
    expect(r.is_fashion).toBe(true);
  });

  it("wijst kinderkleding af, ook als de categorie klopt", () => {
    const r = classificeerRij({ id: "p3", name: "Kinder hoodie met capuchon", category: "top" });
    expect(r).toEqual({ product_id: "p3", category: null, is_fashion: false });
  });

  it("wijst af als products.is_kids waar is, wat de naam ook zegt", () => {
    const r = classificeerRij({ id: "p4", name: "Basic hoodie", category: "top", is_kids: true });
    expect(r).toEqual({ product_id: "p4", category: null, is_fashion: false });
  });

  it("geeft jumpsuit en ondergoed geen van de zes categorieen", () => {
    expect(classificeerRij({ id: "p5", name: "Denim jumpsuit", category: "dress" })).toEqual({
      product_id: "p5",
      category: null,
      is_fashion: false,
    });
    expect(classificeerRij({ id: "p6", name: "Boxershorts 3-pack", category: "bottom" }).is_fashion).toBe(false);
  });

  it("houdt een goed gelabelde rij zoals hij is", () => {
    const r = classificeerRij({ id: "p7", name: "Slim fit jeans", category: "bottom" });
    expect(r).toEqual({ product_id: "p7", category: "bottom", is_fashion: true });
  });

  it("heeft een vaste versiestring", () => {
    expect(CLASSIFIER_VERSIE).toBe("productClassifier-2026-09");
  });
});
