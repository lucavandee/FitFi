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
    // Verhoogd voor taak 0 (merknaam-fix in productClassifier.ts): het oude
    // "productClassifier-2026-09" hoort bij de classifier van vóór de
    // merknaam-strip. Zonder versiebump zou de veegronde (die alleen rijen
    // met classifier_version is null oppakt) de al geclassificeerde rijen
    // nooit opnieuw langs de gerepareerde classifier sturen.
    expect(CLASSIFIER_VERSIE).toBe("productClassifier-2026-09-17-brand-strip");
  });

  it("laat het merk niet meer de categorie bepalen", () => {
    // Het defect uit taak 0: "Sweater TOMMY JEANS" werd bottom omdat "Jeans"
    // in de merknaam meetelde als categoriewoord. brand meegeven strip dat
    // woord uit de tekst die gescoord wordt, waarna "Sweater" overblijft.
    const r = classificeerRij({
      id: "p8",
      name: "Sweater TOMMY JEANS Men color Navy",
      category: "top",
      brand: "Tommy Jeans",
    });
    expect(r.category).toBe("top");
  });

  it("blijft Moon Boot bij footwear houden ook al staat er geen ander kledingstukwoord in de naam", () => {
    // Moon Boot is het gemeten tegenvoorbeeld: "Ballet Flat MOON BOOT Woman
    // color Black" heeft geen kledingstukwoord los van de merknaam. Strip je
    // "Moon Boot" uit de naam, dan blijft "Ballet Flat" over, dat op geen
    // enkele regel matcht. De classifier valt dan terug op de (ongestripte)
    // beschrijving en categoryPath, niet op de ongestripte naam, en de
    // ruwe feed-category "footwear" in dit voorbeeld staat daar model voor.
    const r = classificeerRij({
      id: "p9",
      name: "Ballet Flat MOON BOOT Woman color Black",
      description: "Ballet Flat MOON BOOT Woman color Black",
      category: "footwear",
      brand: "Moon Boot",
    });
    expect(r.category).toBe("footwear");
  });
});
