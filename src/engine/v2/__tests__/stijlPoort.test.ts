/**
 * De stijlpoort: wat een bezoeker koos, mag een outfit niet tegenspreken.
 *
 * Aanleiding (keten-kritiek, 16 oktober 2026). Lucs quiz: vrouw, alleen
 * streetwear, licht, casual + werk + formeel + date, budget tot 500. De
 * uitslag had negen outfits met het label streetwear en geen enkele sneaker:
 * drie ballerina's, twee pumps, een laars met kitten heel, een laarsje met hak,
 * twee clutches en kleine tasjes. Acht van de negen hadden een zwart stuk,
 * zes waren vooral donker. Formeel en date kwamen niet voor, zonder melding.
 *
 * De oude afkeur (candidateFilter, archetypeHardReject) keek naar het
 * afgeleide archetype en ging uit zodra klassiek tweede werd; bij Luc maakten
 * de gelegenheden formeel en date klassiek tweede. Deze poort kijkt naar wat
 * de bezoeker zelf koos.
 *
 * Fixture: get_kandidaten voor Lucs antwoorden op 16 oktober, de standaardpool
 * (H&M en Mart Visser) plus de 240 rijen van de designer-outlet die er tot die
 * dag in zaten. Zo bewijst de test dat de poort ook houdt als zulke stukken in
 * de pool zitten.
 */
import { describe, expect, it } from "vitest";
import { runEngineV2 } from "../engine";
import { outfitBreuken, productBreuk } from "../stijlPoort";
import { seedFromAnswers } from "@/services/outfits/answersSeed";
import { bereidKandidatenVoor, type KandidaatRij } from "@/services/outfits/kandidaten";
import type { Product } from "@/engine/types";
import poolLuc from "./fixtures/pool-vrouw-streetwear-luc-2026-10-16.json";

const LUC = {
  gender: "female",
  stylePreferences: ["streetwear"],
  occasions: ["casual", "work", "formal", "date"],
  budget: { min: 0, max: 500 },
  fit: "regular",
  prints: "effen",
  lightness: "licht",
  neutrals: "warm",
  contrast: "laag",
  materials: ["katoen", "wol", "denim"],
};

const stuk = (category: string, name: string, extra: Partial<Product> = {}): Product =>
  ({ id: name, name, category, price: 50, ...extra }) as Product;

describe("productBreuk", () => {
  const street = { stylePreferences: ["streetwear"] };

  it("houdt hakken, pumps en ballerina's weg bij alleen streetwear", () => {
    for (const naam of [
      "Pump BOSS Woman color Burgundy",
      "Ballet Flat BY FAR Woman color Black",
      "H & M - Leren laarzen met kittenheel - Zwart",
      "H & M - Leren laarsjes met hak - Zwart",
      "Slingback TOTEME Woman color Black",
    ]) {
      expect(productBreuk(stuk("footwear", naam), street), naam).not.toBeNull();
    }
  });

  it("laat sneakers, platte laarzen en loafers door bij streetwear", () => {
    for (const naam of [
      "H & M - Sneakers - Wit",
      "Boots SEE BY CHLOÉ Woman color Black",
      "H & M - Leren loafers - Bruin",
    ]) {
      expect(productBreuk(stuk("footwear", naam), street), naam).toBeNull();
    }
  });

  it("laat een sneaker-ballerina door: dat is een sneaker", () => {
    expect(productBreuk(stuk("footwear", "PUMA Speedcat Suede ballerina's voor Dames, Zwart, Maat 42,5"), street)).toBeNull();
    expect(productBreuk(stuk("footwear", "Ballerina's Zwart", { shoeType: "sneaker" }), street)).toBeNull();
  });

  it("houdt een clutch weg bij streetwear, een tas niet", () => {
    expect(productBreuk(stuk("accessory", "Clutch THEMOIRÈ Woman color Black"), street)).not.toBeNull();
    expect(productBreuk(stuk("accessory", "H & M - Canvas shopper - Beige"), street)).toBeNull();
  });

  it("laat hakken toe zodra de bezoeker ook een stijl met hakken koos", () => {
    const pump = stuk("footwear", "Pump BOSS Woman color Burgundy");
    expect(productBreuk(pump, { stylePreferences: ["streetwear", "classic"] })).toBeNull();
    expect(productBreuk(pump, { stylePreferences: ["minimalist"] })).toBeNull();
    expect(productBreuk(pump, {})).toBeNull();
  });

  it("vraagt bij alleen sportief een sneaker", () => {
    const sport = { stylePreferences: ["athletic"] };
    expect(productBreuk(stuk("footwear", "H & M - Leren loafers - Bruin"), sport)).not.toBeNull();
    expect(productBreuk(stuk("footwear", "PUMA Speedcat OG"), sport)).toBeNull();
    expect(productBreuk(stuk("footwear", "H & M - Schoenen", { shoeType: "sneaker" }), sport)).toBeNull();
  });

  it("raakt geen kleding: een top met 'heel' in de naam is geen schoen", () => {
    expect(productBreuk(stuk("top", "Top met heel korte mouw"), { stylePreferences: ["streetwear"] })).toBeNull();
  });
});

describe("outfitBreuken", () => {
  it("staat bij licht hooguit één donker stuk toe", () => {
    const licht = { lightness: "licht" };
    const een = [stuk("top", "a", { lightness: "licht" }), stuk("bottom", "b", { lightness: "donker" })];
    const twee = [...een, stuk("footwear", "c", { lightness: "donker" })];
    expect(outfitBreuken(een, licht)).toEqual([]);
    expect(outfitBreuken(twee, licht)).not.toEqual([]);
  });

  it("leest de kleur als de lichtheid ontbreekt", () => {
    const twee = [stuk("top", "a", { colors: ["zwart"] }), stuk("bottom", "b", { colors: ["navy"] })];
    expect(outfitBreuken(twee, { lightness: "licht" })).not.toEqual([]);
  });

  it("heeft geen lichtheidsregel bij medium of donker", () => {
    const twee = [stuk("top", "a", { lightness: "donker" }), stuk("bottom", "b", { lightness: "donker" })];
    expect(outfitBreuken(twee, { lightness: "medium" })).toEqual([]);
    expect(outfitBreuken(twee, { lightness: "donker" })).toEqual([]);
  });
});

describe("engine v2 met Lucs quiz van 16 oktober", () => {
  const pool = bereidKandidatenVoor(poolLuc as unknown as KandidaatRij[]);
  const uitslag = runEngineV2(LUC, pool, { count: 9, seed: seedFromAnswers(LUC), season: "autumn" });

  it("geeft outfits", () => {
    expect(uitslag.outfits.length).toBeGreaterThanOrEqual(3);
  });

  it("zet geen stuk in een outfit dat de stijlkeuze tegenspreekt", () => {
    const fout = uitslag.outfits
      .flatMap((o) => o.products)
      .filter((p) => productBreuk(p, LUC))
      .map((p) => p.name);
    expect(fout).toEqual([]);
  });

  it("houdt zich aan licht", () => {
    const fout = uitslag.outfits.filter((o) => outfitBreuken(o.products, LUC).length > 0).map((o) => o.title);
    expect(fout).toEqual([]);
  });

  it("meldt welke gevraagde gelegenheden geen outfit kregen", () => {
    const gedekt = new Set(uitslag.outfits.map((o) => o.occasion));
    const verwacht = LUC.occasions.filter((g) => !gedekt.has(g));
    expect(uitslag.stats.occasionsMissing).toEqual(verwacht);
  });
});
