/**
 * Labels versie 2 (21 oktober 2026): seizoen en formaliteit van de stijl-agent.
 * De eindtoets met stijllabels gaf 8 van 48 goed; de afkeuringen gingen over
 * zomerstukken in oktober (stro, strappy jurk, slingbacks) en over te
 * informele stukken voor kantoor en formeel (capuchonjurk, T-shirt met jeans).
 */
import { describe, expect, it } from "vitest";
import { buitenSeizoen, formeelTeLaag } from "../stijlPoort";
import type { Product } from "@/engine/types";

const stuk = (category: string, name: string, extra: Partial<Product> = {}): Product =>
  ({ id: name, name, category, price: 40, ...extra }) as Product;

describe("buitenSeizoen", () => {
  it("houdt lente-zomerstukken weg in herfst en winter", () => {
    const stro = stuk("footwear", "Mary Jane-ballerina's van stro", { seizoen: "lente-zomer" });
    expect(buitenSeizoen(stro, "autumn")).toBe(true);
    expect(buitenSeizoen(stro, "winter")).toBe(true);
    expect(buitenSeizoen(stro, "summer")).toBe(false);
  });

  it("laat heel-jaar, herfst-winter en ongelabelde stukken staan", () => {
    expect(buitenSeizoen(stuk("bottom", "Jeans", { seizoen: "heel-jaar" }), "autumn")).toBe(false);
    expect(buitenSeizoen(stuk("outerwear", "Wollen jas", { seizoen: "herfst-winter" }), "autumn")).toBe(false);
    expect(buitenSeizoen(stuk("top", "Trui"), "autumn")).toBe(false);
  });
});

describe("formeelTeLaag", () => {
  it("weigert een te informeel hoofdstuk voor kantoor en formeel", () => {
    const capuchonjurk = [stuk("dress", "Capuchonjurk", { formeel: 1 }), stuk("footwear", "Sneakers", { formeel: 1 })];
    expect(formeelTeLaag(capuchonjurk, "work")).not.toBeNull();
    const tshirtJeans = [stuk("top", "Oversized T-shirt", { formeel: 1 }), stuk("bottom", "Wide jeans", { formeel: 2 })];
    expect(formeelTeLaag(tshirtJeans, "formal")).not.toBeNull();
  });

  it("laat schoenen, ongelabelde stukken en andere gelegenheden met rust", () => {
    const kantoor = [stuk("top", "Blouse", { formeel: 3 }), stuk("bottom", "Pantalon", { formeel: 3 }), stuk("footwear", "Leren sneakers", { formeel: 2 })];
    expect(formeelTeLaag(kantoor, "work")).toBeNull();
    expect(formeelTeLaag([stuk("top", "Hoodie", { formeel: 1 })], "casual")).toBeNull();
    expect(formeelTeLaag([stuk("top", "Trui")], "work")).toBeNull();
  });
});
