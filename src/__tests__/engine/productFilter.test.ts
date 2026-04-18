import { describe, expect, it } from "vitest";
import {
  classifyCategory,
  isAdultClothingProduct,
} from "@/engine/productFilter";

const adultBase = {
  name: "Regular Fit Overhemd",
  price: 59.95,
  image_url: "https://example.com/shirt.jpg",
};

describe("isAdultClothingProduct", () => {
  it("accepts a standard adult clothing item", () => {
    expect(isAdultClothingProduct(adultBase)).toBe(true);
  });

  it("rejects items priced below the adult minimum", () => {
    expect(
      isAdultClothingProduct({ ...adultBase, price: 5.99 }),
    ).toBe(false);
  });

  it("rejects items without an image", () => {
    expect(
      isAdultClothingProduct({
        name: "Hoodie",
        price: 40,
      }),
    ).toBe(false);
  });

  it("rejects children's clothing by name", () => {
    expect(
      isAdultClothingProduct({
        ...adultBase,
        name: "Jongens t-shirt wit",
      }),
    ).toBe(false);
  });

  it("rejects socks, underwear and other non-outfit items", () => {
    const rejected = [
      "Heren sokken 3-pack",
      "Boxer shorts",
      "Pyjama set",
      "Badjas",
    ];
    for (const name of rejected) {
      expect(
        isAdultClothingProduct({ ...adultBase, name }),
      ).toBe(false);
    }
  });

  it("rejects items whose description mentions kids", () => {
    expect(
      isAdultClothingProduct({
        ...adultBase,
        description: "Perfect voor jongens in de lagere school",
      }),
    ).toBe(false);
  });
});

describe("classifyCategory", () => {
  it("classifies tops correctly", () => {
    expect(classifyCategory({ name: "Katoenen overhemd wit" })).toBe("top");
    expect(classifyCategory({ name: "Crewneck sweater navy" })).toBe("top");
  });

  it("classifies bottoms correctly", () => {
    expect(classifyCategory({ name: "Slim fit chino beige" })).toBe("bottom");
    expect(classifyCategory({ name: "Relaxed jeans donkerblauw" })).toBe(
      "bottom",
    );
  });

  it("classifies footwear correctly", () => {
    expect(classifyCategory({ name: "Witte sneaker leer" })).toBe("footwear");
    expect(classifyCategory({ name: "Chelsea boot zwart" })).toBe("footwear");
  });

  it("falls back to 'other' for unknown names without a db category", () => {
    expect(classifyCategory({ name: "Iets mysterieus" })).toBe("other");
  });

  it("uses the database category as a fallback when name is ambiguous", () => {
    expect(
      classifyCategory({ name: "Mysterie item", category: "outerwear" }),
    ).toBe("outerwear");
  });
});
