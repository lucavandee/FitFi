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
import poolStreetwear from "./fixtures/pool-man-streetwear-2026-10-02.json";
import poolMinimalistisch from "./fixtures/pool-vrouw-minimalistisch-2026-10-02.json";

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

  // 2 okt 2026, na de grote tagrun: "man streetwear" (casual en party) kreeg 5
  // outfits. Met twee gelegenheden zijn er 18 kandidaten, en dan staat
  // diversifyOutfits elk product maar in één outfit toe. De samensteller
  // herhaalde accessoires en jassen over kandidaten heen (dezelfde pet in 4,
  // hetzelfde trainingsjack in 4), dus zes volledig verschillende waren er niet.
  it("geeft man streetwear zes outfits, ook met twee gelegenheden", () => {
    const answers = { gender: "male", stylePreferences: ["streetwear"], occasions: ["casual", "party"], budget: { min: 25, max: 100 }, fit: "relaxed" };
    const pool = bereidKandidatenVoor(poolStreetwear as unknown as KandidaatRij[]);
    const { outfits } = runEngineV2(answers, pool, { count: 6, seed: seedFromAnswers(answers), season: "autumn" });
    expect(outfits).toHaveLength(6);
  });

  // 2 okt 2026: na de grote tagrun kreeg "vrouw minimalistisch" een "Heeled
  // Sandal VERSACE JEANS COUTURE" in een werkoutfit. Het persona-harnas verbiedt
  // dat (SANDAAL_RE in scripts/keten/persona-run.ts); de engine had er geen
  // regel voor en kwam er tot dan toe mee weg omdat er geen sandaal in de
  // toppool voor werk zat.
  it("zet geen open schoen in een werkoutfit", () => {
    const answers = { gender: "female", stylePreferences: ["minimalist"], occasions: ["work", "date"], budget: { min: 25, max: 100 }, fit: "regular" };
    const pool = bereidKandidatenVoor(poolMinimalistisch as unknown as KandidaatRij[]);
    const { outfits } = runEngineV2(answers, pool, { count: 6, seed: seedFromAnswers(answers), season: "autumn" });
    expect(outfits).toHaveLength(6);
    const open = /\b(sandaal|sandalen|sandal|sandals|sandaletten?|slipper|slippers|teenslipper|flip-?flops?)\b/i;
    for (const o of outfits.filter((x) => x.occasion === "work")) {
      const schoen = o.products.find((p) => String(p.category).toLowerCase() === "footwear");
      expect(schoen?.name ?? "").not.toMatch(open);
    }
  });
});
