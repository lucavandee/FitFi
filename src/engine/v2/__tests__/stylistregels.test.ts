/**
 * Drie dingen die een stylist nooit doet, en die engine v2 tot 13 oktober 2026
 * wel deed (Luc: "dat kan echt niet"):
 *
 * 1. Seizoen. In oktober kwamen er sandalen, linnen en shorts uit. Het seizoen
 *    woog 3 procent in de score en sloot niets uit.
 * 2. Prijsniveau. Een overhemd van 19,99 naast schoenen van 387 euro, een
 *    chino van 24,99 naast loafers van 345. Het budget is per stuk, dus binnen
 *    een outfit mocht alles door elkaar.
 * 3. Accessoires die je niet ziet. Portemonnees, manchetknopen en brilmonturen
 *    vulden het accessoireslot.
 *
 * Fixtures: get_kandidaten zoals de site ze ophaalt. Het seizoen staat vast,
 * anders verandert de uitkomst met de kalender.
 */
import { describe, expect, it } from "vitest";
import { runEngineV2 } from "../engine";
import { seedFromAnswers } from "@/services/outfits/answersSeed";
import { bereidKandidatenVoor, type KandidaatRij } from "@/services/outfits/kandidaten";
import { isZichtbaarAccessoire, pastInSeizoen } from "@/engine/productSafety";
import poolLuc from "./fixtures/pool-man-minimalistisch-tot500-2026-10-13.json";
import poolVrouw from "./fixtures/pool-vrouw-minimalistisch-2026-10-02.json";
import poolStreetwear from "./fixtures/pool-man-streetwear-2026-10-02.json";
import poolKlassiek from "./fixtures/pool-man-klassiek-2026-10-01.json";

const PROFIELEN = [
  {
    naam: "man minimalistisch tot 500",
    pool: poolLuc,
    answers: { gender: "male", stylePreferences: ["minimalist"], occasions: ["casual", "work", "formal"], budget: { min: 0, max: 500 }, fit: "regular" },
  },
  {
    naam: "vrouw minimalistisch",
    pool: poolVrouw,
    answers: { gender: "female", stylePreferences: ["minimalist"], occasions: ["work", "date"], budget: { min: 25, max: 100 }, fit: "regular" },
  },
  {
    naam: "man streetwear",
    pool: poolStreetwear,
    answers: { gender: "male", stylePreferences: ["streetwear"], occasions: ["casual", "party"], budget: { min: 25, max: 100 }, fit: "relaxed" },
  },
  {
    naam: "man klassiek",
    pool: poolKlassiek,
    answers: { gender: "male", stylePreferences: ["classic"], occasions: ["work"], budget: { min: 50, max: 150 }, fit: "regular" },
  },
];

/** Hoogstens zoveel keer duurder dan het goedkoopste stuk in dezelfde outfit. */
const MAX_PRIJSVERHOUDING = 3;

function outfitsVan(profiel: (typeof PROFIELEN)[number], season: "autumn" | "summer") {
  const pool = bereidKandidatenVoor(profiel.pool as unknown as KandidaatRij[]);
  return runEngineV2(profiel.answers, pool, { count: 6, seed: seedFromAnswers(profiel.answers), season }).outfits;
}

describe("stylistregels in engine v2", () => {
  for (const profiel of PROFIELEN) {
    describe(profiel.naam, () => {
      it("geeft nog steeds zes outfits", () => {
        expect(outfitsVan(profiel, "autumn")).toHaveLength(6);
      });

      it("zet in de herfst geen zomerstuk in een outfit", () => {
        const zomer = outfitsVan(profiel, "autumn")
          .flatMap((o) => o.products)
          .filter((p) => !pastInSeizoen(p.name, "autumn"))
          .map((p) => p.name);
        expect(zomer).toEqual([]);
      });

      it("zet in de zomer geen gevoerd winterstuk in een outfit", () => {
        const winter = outfitsVan(profiel, "summer")
          .flatMap((o) => o.products)
          .filter((p) => !pastInSeizoen(p.name, "summer"))
          .map((p) => p.name);
        expect(winter).toEqual([]);
      });

      it("kiest alleen accessoires die je ziet", () => {
        const onzichtbaar = outfitsVan(profiel, "autumn")
          .flatMap((o) => o.products)
          .filter((p) => String(p.category).toLowerCase() === "accessory" && !isZichtbaarAccessoire(p.name))
          .map((p) => p.name);
        expect(onzichtbaar).toEqual([]);
      });

      // De composer kiest binnen een factor 3 als de pool dat toelaat. Heeft een
      // gelegenheid geen ongebruikt stuk meer in die klasse, dan gaat een
      // gevraagde gelegenheid voor: liever een tweede werkoutfit met een
      // goedkopere broek dan geen tweede werkoutfit. Een factor 10 nooit;
      // op main was het 18 (overhemd 19,99, schoenen 387).
      it(`houdt minstens vijf van de zes outfits binnen een factor ${MAX_PRIJSVERHOUDING}, en geen boven de 10`, () => {
        const verhoudingen = outfitsVan(profiel, "autumn")
          .map((o) => o.products.map((p) => Number(p.price)).filter((x) => x > 0))
          .map((prijzen) => Math.max(...prijzen) / Math.min(...prijzen));
        expect(verhoudingen.filter((v) => v > MAX_PRIJSVERHOUDING).length).toBeLessThanOrEqual(1);
        expect(verhoudingen.filter((v) => v > 10)).toEqual([]);
      });

      it("geeft elke gevraagde gelegenheid minstens één outfit", () => {
        const gekregen = new Set(outfitsVan(profiel, "autumn").map((o) => o.occasion));
        for (const g of profiel.answers.occasions) expect(gekregen.has(g)).toBe(true);
      });
    });
  }
});

describe("pastInSeizoen en isZichtbaarAccessoire", () => {
  it("herkent zomerstukken uit de catalogus", () => {
    expect(pastInSeizoen("H & M - Leren sandalen - Zwart", "autumn")).toBe(false);
    expect(pastInSeizoen("Heeled Sandal BIRKENSTOCK Woman color Dove Grey", "autumn")).toBe(false);
    expect(pastInSeizoen("H & M - Leren sandaletten met kittenheel - Beige", "winter")).toBe(false);
    expect(pastInSeizoen("H & M - Broek van linnenmix - Relaxed Fit - Marineblauw", "autumn")).toBe(false);
    expect(pastInSeizoen("H & M - Strandjurk met strikbandjes - Beige", "autumn")).toBe(false);
    expect(pastInSeizoen("H & M - Katoenen chinoshort - Regular Fit - Beige", "autumn")).toBe(false);
    expect(pastInSeizoen("H & M - Sweatshorts - Grijs", "winter")).toBe(false);
    expect(pastInSeizoen("H & M - Leren sandalen - Zwart", "summer")).toBe(true);
  });

  it("weert alleen zware winterstukken in lente en zomer, geen wol", () => {
    expect(pastInSeizoen("H & M - Warmgevoerde boots - Beige", "summer")).toBe(false);
    expect(pastInSeizoen("H & M - Gewatteerd nylon overshirt - Grijs", "spring")).toBe(false);
    expect(pastInSeizoen("H & M - Pantalon van wolmix - Zwart", "summer")).toBe(true);
    expect(pastInSeizoen("H & M - Coltrui van kasjmiermix - Donkerbruin", "autumn")).toBe(true);
  });

  it("onderscheidt zichtbare en onzichtbare accessoires", () => {
    expect(isZichtbaarAccessoire("Wallet BOSS Men color Black")).toBe(false);
    expect(isZichtbaarAccessoire("Cufflinks PAUL SMITH Men color Red")).toBe(false);
    expect(isZichtbaarAccessoire("Optical Frames RAY-BAN Men color Fa01")).toBe(false);
    expect(isZichtbaarAccessoire("H & M - Leren pasjeshouder - Zwart")).toBe(false);
    expect(isZichtbaarAccessoire("H & M - Ovale make-uptas - Donkerbruin/Transparant")).toBe(false);
    expect(isZichtbaarAccessoire("H & M - Toilettas van nylon - Zwart")).toBe(false);
    expect(isZichtbaarAccessoire("Sunglasses BOSS Men color Black")).toBe(true);
    expect(isZichtbaarAccessoire("H & M - Leren handtas - Rood")).toBe(true);
    expect(isZichtbaarAccessoire("Belt VALENTINO GARAVANI Men color Black")).toBe(true);
  });
});
