import { describe, expect, it } from "vitest";
import { dedupeProductVariants, productVariantKey } from "../outfits/dedupeProductVariants";

const variant = (name: string, extra: Record<string, any> = {}) => ({
  id: name,
  name,
  gender: "male",
  category: "top",
  price: 29.95,
  inStock: true,
  sizes: [],
  ...extra,
});

describe("productVariantKey", () => {
  it("strips a trailing size suffix", () => {
    expect(productVariantKey("PUMA Evostripe broek voor Heren, Grijs, Maat XXL")).toBe(
      "PUMA Evostripe broek voor Heren, Grijs"
    );
    expect(productVariantKey("PUMA Tackle L sneakers uniseks, Zwart/Goud, Maat 44,5")).toBe(
      "PUMA Tackle L sneakers uniseks, Zwart/Goud"
    );
  });

  it("leaves names without a size suffix untouched", () => {
    expect(productVariantKey("Jeans FRAME Woman color Blue")).toBe("Jeans FRAME Woman color Blue");
  });
});

describe("dedupeProductVariants", () => {
  it("collapses size variants of the same product into one", () => {
    const result = dedupeProductVariants([
      variant("PUMA CLOUDSPUN T-shirt voor Heren, Zwart, Maat S"),
      variant("PUMA CLOUDSPUN T-shirt voor Heren, Zwart, Maat M"),
      variant("PUMA CLOUDSPUN T-shirt voor Heren, Zwart, Maat L"),
    ]);
    expect(result).toHaveLength(1);
  });

  it("keeps the cheapest in-stock variant and merges available sizes", () => {
    const result = dedupeProductVariants([
      variant("Shirt, Maat S", { price: 34.95, sizes: ["S"] }),
      variant("Shirt, Maat M", { price: 24.95, sizes: ["M"] }),
      variant("Shirt, Maat L", { price: 29.95, sizes: ["L"], inStock: false }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].price).toBe(24.95);
    expect(result[0].inStock).toBe(true);
    expect([...result[0].sizes].sort()).toEqual(["L", "M", "S"]);
  });

  it("does not merge different products or genders", () => {
    const result = dedupeProductVariants([
      variant("Shirt A, Maat M"),
      variant("Shirt B, Maat M"),
      variant("Shirt A, Maat M", { gender: "female" }),
    ]);
    expect(result).toHaveLength(3);
  });
});
