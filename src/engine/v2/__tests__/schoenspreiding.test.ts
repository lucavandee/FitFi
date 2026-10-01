/**
 * Regressie van 1 okt 2026: na de proefronde (vier nieuwe winkels getagd in de
 * band 50-150) kreeg "man klassiek" 5 outfits in plaats van 6.
 *
 * composeOutfits koos per poging de bovenste schoen uit de toppool en hield niet
 * bij welke schoenen eerdere kandidaten al hadden. diversifyOutfits staat een
 * schoen maar in één outfit toe. Met 10 H&M-schoenen in de band dwong de krapte
 * de spreiding af; met 40 schoenen hadden de 9 kandidaten er nog 5 verschillende.
 *
 * Fixtures: get_kandidaten voor "man klassiek" op 1 okt 2026, ingekort tot de
 * velden die mapKandidaatProduct leest. Het seizoen staat vast, anders verandert
 * de uitkomst met de kalender.
 */
import { describe, expect, it } from "vitest";
import { runEngineV2 } from "../engine";
import { seedFromAnswers } from "@/services/outfits/answersSeed";
import { bereidKandidatenVoor, type KandidaatRij } from "@/services/outfits/kandidaten";
import poolNa from "./fixtures/pool-man-klassiek-2026-10-01.json";
import poolVoor from "./fixtures/pool-man-klassiek-alleen-hm-2026-10-01.json";

const ANSWERS = {
  gender: "male",
  stylePreferences: ["classic"],
  occasions: ["work"],
  budget: { min: 50, max: 150 },
  fit: "regular",
};

function schoenenVan(rijen: unknown) {
  const pool = bereidKandidatenVoor(rijen as KandidaatRij[]);
  const { outfits } = runEngineV2(ANSWERS, pool, { count: 6, seed: seedFromAnswers(ANSWERS), season: "autumn" });
  const schoenen = outfits.map((o) => o.products.find((p) => String(p.category).toLowerCase() === "footwear")?.id);
  return { outfits, schoenen };
}

describe("schoenspreiding in engine v2", () => {
  it("geeft man klassiek zes outfits, elk met een eigen schoen, ook met de rijke pool", () => {
    const { outfits, schoenen } = schoenenVan(poolNa);
    expect(outfits).toHaveLength(6);
    expect(new Set(schoenen).size).toBe(6);
  });

  it("blijft zes outfits geven op de pool van voor de proefronde", () => {
    const { outfits } = schoenenVan(poolVoor);
    expect(outfits).toHaveLength(6);
  });
});
