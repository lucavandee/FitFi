import { describe, expect, it } from "vitest";
import { kiesSteekproef, telSteekproef } from "../steekproef";
import { keurderSleutel, type OordeelRegel, type Telling } from "../stijlSets";

const KEURDER = keurderSleutel("keur-x", "m", "xhigh");
let n = 0;
function regel(cel: string, key: string, ronde: 1 | 2, telling: Telling, over: Partial<OordeelRegel> = {}): OordeelRegel {
  n += 1;
  return {
    tijd: "t",
    run: "r",
    keurder: KEURDER,
    keur_versie: "keur-x",
    model: "m",
    effort: "xhigh",
    cel,
    outfit_key: key,
    stukken: [{ product_id: `${key}-1`, rol: "top", naam: "trui", merk: null, prijs: 30, kleuren: ["crème"], lichtheid: null, beeld: `https://x/${key}.jpg` }],
    p_zaad: 1,
    engine_zaad: 1,
    ronde,
    poging: 1,
    aanroep: n,
    aanroep_gelukt: true,
    kort_id: "k1",
    ruw: null,
    telling,
    ...over,
  };
}

/** Per combinatie: b bevestigd, t twijfel, f fout. */
function logboek(cellen: Record<string, [number, number, number]>): OordeelRegel[] {
  const uit: OordeelRegel[] = [];
  for (const [cel, [b, t, f]] of Object.entries(cellen)) {
    for (let i = 0; i < b; i++) uit.push(regel(cel, `${cel}-b${i}`, 1, "goed"), regel(cel, `${cel}-b${i}`, 2, "goed"));
    for (let i = 0; i < t; i++) uit.push(regel(cel, `${cel}-t${i}`, 1, "twijfel"));
    for (let i = 0; i < f; i++) uit.push(regel(cel, `${cel}-f${i}`, 1, "fout"));
  }
  return uit;
}

const A = "female|casual|casual";
const B = "male|classic|work";

describe("blinde steekproef", () => {
  it("kiest 20 bevestigd, 10 twijfel en 10 fout, door elkaar en genummerd", () => {
    const { outfits, tekort } = kiesSteekproef(logboek({ [A]: [15, 10, 10], [B]: [15, 10, 10] }), KEURDER, { bevestigd: 20, twijfel: 10, fout: 10, zaad: 3 });
    expect(outfits).toHaveLength(40);
    expect(outfits.map((o) => o.nr)).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
    const tel = (g: string) => outfits.filter((o) => o.groep === g).length;
    expect([tel("bevestigd"), tel("twijfel"), tel("fout")]).toEqual([20, 10, 10]);
    expect(tekort).toEqual({ bevestigd: 0, twijfel: 0, fout: 0 });
    // Door elkaar: de eerste tien zijn niet allemaal uit dezelfde groep.
    expect(new Set(outfits.slice(0, 10).map((o) => o.groep)).size).toBeGreaterThan(1);
  });

  it("verdeelt over de combinaties", () => {
    const { outfits } = kiesSteekproef(logboek({ [A]: [15, 10, 10], [B]: [15, 10, 10] }), KEURDER, { bevestigd: 20, twijfel: 10, fout: 10, zaad: 3 });
    const bevestigdA = outfits.filter((o) => o.groep === "bevestigd" && o.cel === A).length;
    expect(bevestigdA).toBe(10);
  });

  it("is vast per zaad", () => {
    const log = logboek({ [A]: [15, 10, 10] });
    const een = kiesSteekproef(log, KEURDER, { bevestigd: 5, twijfel: 3, fout: 3, zaad: 9 }).outfits.map((o) => o.outfit_key);
    const twee = kiesSteekproef(log, KEURDER, { bevestigd: 5, twijfel: 3, fout: 3, zaad: 9 }).outfits.map((o) => o.outfit_key);
    expect(een).toEqual(twee);
  });

  it("meldt een tekort in plaats van aan te vullen uit een andere groep", () => {
    const { outfits, tekort } = kiesSteekproef(logboek({ [A]: [4, 10, 10] }), KEURDER, { bevestigd: 20, twijfel: 10, fout: 10, zaad: 1 });
    expect(outfits.filter((o) => o.groep === "bevestigd")).toHaveLength(4);
    expect(tekort.bevestigd).toBe(16);
  });

  it("neemt een outfit dat in ronde 2 afviel niet als bevestigd en niet als twijfel", () => {
    const log = [regel(A, "x", 1, "goed"), regel(A, "x", 2, "fout")];
    const { outfits } = kiesSteekproef(log, KEURDER, { bevestigd: 5, twijfel: 5, fout: 5, zaad: 1 });
    expect(outfits).toEqual([]);
  });

  it("telt de uitslag: de poort is 17 van 20 bevestigd met ja, en beter dan twijfel en fout", () => {
    const outfits = kiesSteekproef(logboek({ [A]: [20, 10, 10] }), KEURDER, { bevestigd: 20, twijfel: 10, fout: 10, zaad: 2 }).outfits;
    const antwoorden = new Map(outfits.map((o) => [o.nr, o.groep === "bevestigd" ? (o.nr % 10 === 0 ? "nee" : "ja") : o.groep === "twijfel" ? "nee" : "nee"] as const));
    const uitslag = telSteekproef(outfits, antwoorden);
    expect(uitslag.bevestigd).toEqual({ ja: 20 - outfits.filter((o) => o.groep === "bevestigd" && o.nr % 10 === 0).length, totaal: 20 });
    expect(uitslag.geslaagd).toBe(uitslag.bevestigd.ja >= 17);
    const zonderAntwoord = telSteekproef(outfits, new Map());
    expect(zonderAntwoord.geslaagd).toBe(false);
    expect(zonderAntwoord.onbeantwoord).toBe(40);
  });
});
