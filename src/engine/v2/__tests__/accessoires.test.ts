/**
 * Een accessoire dat botst, valt uit de outfit; de outfit zelf blijft.
 *
 * Aanleiding: de stijl-agent keurde op 21 oktober 2026 smart-casual en
 * klassieke outfits af om een grijze riem bij zwarte Blücher-schoenen, een
 * beige riem bij bruine loafers, een multicolor riem bij een neutrale outfit
 * en een stropdas bij een poloshirt met jeans.
 */
import { describe, expect, it } from "vitest";
import { zonderBotsendAccessoire } from "../stijlPoort";
import type { Product } from "@/engine/types";

const stuk = (category: string, name: string, colors: string[] = []): Product =>
  ({ id: name, name, category, colors, price: 40 }) as Product;

describe("zonderBotsendAccessoire", () => {
  it("laat een riem weg die niet bij nette schoenen past", () => {
    const outfit = [
      stuk("top", "Overhemd", ["wit"]),
      stuk("bottom", "Chino", ["beige"]),
      stuk("footwear", "Leren loafers", ["bruin"]),
      stuk("accessory", "Riem", ["beige"]),
    ];
    expect(zonderBotsendAccessoire(outfit).map((p) => p.name)).toEqual(["Overhemd", "Chino", "Leren loafers"]);
  });

  it("houdt een riem die bij de schoenen past, en een riem bij sneakers", () => {
    const bruin = [stuk("footwear", "Leren loafers", ["bruin"]), stuk("accessory", "Riem", ["cognac"])];
    expect(zonderBotsendAccessoire(bruin)).toHaveLength(2);
    const sneaker = [stuk("footwear", "PUMA Club sneakers", ["wit"]), stuk("accessory", "Riem", ["zwart"])];
    expect(zonderBotsendAccessoire(sneaker)).toHaveLength(2);
  });

  it("laat een veelkleurige riem bij nette schoenen weg", () => {
    const outfit = [stuk("footwear", "Leren derby's", ["zwart"]), stuk("accessory", "Riem", ["multicolor"])];
    expect(zonderBotsendAccessoire(outfit)).toHaveLength(1);
  });

  it("houdt een stropdas alleen bij een overhemd met colbert", () => {
    const polo = [stuk("top", "Poloshirt", ["navy"]), stuk("bottom", "Jeans", ["blauw"]), stuk("accessory", "Stropdas", ["blauw"])];
    expect(zonderBotsendAccessoire(polo)).toHaveLength(2);
    const pak = [stuk("top", "Overhemd", ["wit"]), stuk("outerwear", "Colbert", ["navy"]), stuk("accessory", "Stropdas", ["blauw"])];
    expect(zonderBotsendAccessoire(pak)).toHaveLength(3);
  });
});
