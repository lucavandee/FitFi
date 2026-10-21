/**
 * Een formele outfit in een klassieke, zakelijke of smart-casual stijl heeft een
 * colbert of jas. De stijl-agent keurde op 21 oktober 2026 klassieke
 * herenoutfits voor formeel af: "Voor een formele gelegenheid ontbreekt een
 * colbert; overhemd met pantalon zonder jasje is te casual voor bruiloft,
 * diner of uitvaart." De kans op een jas was bij formeel 50 procent.
 */
import { describe, expect, it } from "vitest";
import { runEngineV2 } from "../engine";
import { seedFromAnswers } from "@/services/outfits/answersSeed";
import { bereidKandidatenVoor, type KandidaatRij } from "@/services/outfits/kandidaten";
import poolKlassiek from "./fixtures/pool-man-klassiek-2026-10-01.json";

describe("formeel met jas", () => {
  for (const stijl of ["classic", "business", "smart-casual"]) {
    it(`${stijl}: elke formele outfit heeft een jas of colbert`, () => {
      const answers = { gender: "male", stylePreferences: [stijl], occasions: ["formal"], budget: { min: 50, max: 150 }, fit: "regular" };
      const pool = bereidKandidatenVoor(poolKlassiek as unknown as KandidaatRij[]);
      const { outfits } = runEngineV2(answers, pool, { count: 6, seed: seedFromAnswers(answers), season: "autumn" });
      expect(outfits.length).toBeGreaterThan(0);
      const zonder = outfits.filter((o) => !o.products.some((p) => String(p.category).toLowerCase() === "outerwear"));
      expect(zonder.map((o) => o.title)).toEqual([]);
    });
  }
});
