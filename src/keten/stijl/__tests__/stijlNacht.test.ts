import { describe, expect, it } from "vitest";
import type { AanroepUitkomst } from "../claudeUitvoer";
import { draaiNacht, type NachtOpties } from "../stijlNacht";
import { celCijfers, herstelStaat, keurderSleutel, type AanroepRegel, type Kandidaat, type OordeelRegel } from "../stijlSets";

const MODEL = "claude-sonnet-test";
const KEURDER = keurderSleutel("keur-x", MODEL, "xhigh");
const A = "female|casual|casual";
const B = "male|classic|work";

function kandidaat(cel: string, key: string): Kandidaat {
  const [geslacht, stijl, gelegenheid] = cel.split("|") as ["female" | "male", string, string];
  return {
    cel,
    combinatie: { geslacht, stijl, gelegenheid },
    outfit_key: key,
    stukken: [{ product_id: `${key}-1`, rol: "top", naam: "trui", merk: "H&M", prijs: 40, kleuren: ["crème"], lichtheid: "licht", beeld: null }],
    p_zaad: 1,
    engine_zaad: 2,
    ronde: 1,
    poging: 1,
  };
}

/** De korte id's uit een opdracht, in volgorde. */
const idsIn = (opdracht: string) => [...opdracht.matchAll(/^### (k\d+)$/gm)].map((m) => m[1]);

const oordeel = (id: string, goed = true) => ({
  id,
  oordeel: goed ? "goed" : "fout",
  stijl: goed ? "ja" : "nee",
  gelegenheid: "ja",
  kleur: "ja",
  samenhang: "ja",
  redenen: goed ? [] : ["past niet"],
  verbetering: goed ? "" : "anders",
});

const uitkomst = (over: Partial<AanroepUitkomst> = {}): AanroepUitkomst => ({
  ok: true,
  tekst: "",
  timeout: false,
  model: MODEL,
  apiKeySource: "ANTHROPIC_API_KEY",
  duration_ms: 100000,
  total_cost_usd: 0.27,
  usage: null,
  modelUsage: null,
  num_turns: 1,
  rateLimits: [],
  ...over,
});

/** Een nep-agent: per aanroep een functie van de opdracht naar een uitkomst. */
function opzet(antwoorden: Array<(opdracht: string) => AanroepUitkomst>, over: Partial<NachtOpties> = {}, nu = () => Date.parse("2026-10-23T00:00:00+02:00")) {
  const oordelen: OordeelRegel[] = [];
  const aanroepen: AanroepRegel[] = [];
  const opdrachten: string[] = [];
  let i = 0;
  const opties: NachtOpties = {
    run: "r1",
    keurVersie: "keur-x",
    model: MODEL,
    effort: "xhigh",
    via: "sleutel",
    maxAanroepen: 72,
    deadline: null,
    cellen: [A, B],
    nieuw: new Map([
      [A, ["a1", "a2", "a3", "a4", "a5", "a6"].map((k) => kandidaat(A, k))],
      [B, ["b1", "b2", "b3", "b4", "b5", "b6"].map((k) => kandidaat(B, k))],
    ]),
    bestaand: [],
    ...over,
  };
  const deps = {
    roepAan: async (opdracht: string) => {
      opdrachten.push(opdracht);
      const f = antwoorden[Math.min(i, antwoorden.length - 1)];
      i += 1;
      return f(opdracht);
    },
    schrijfOordeel: (r: OordeelRegel) => oordelen.push(r),
    schrijfAanroep: (r: AanroepRegel) => aanroepen.push(r),
    nu,
  };
  return { opties, deps, oordelen, aanroepen, opdrachten };
}

const alles = (goed = true) => (opdracht: string) => uitkomst({ tekst: JSON.stringify({ oordelen: idsIn(opdracht).map((id) => oordeel(id, goed)) }) });

describe("de nacht", () => {
  it("keurt alles twee keer en stopt als er niets meer te keuren is", async () => {
    const { opties, deps, oordelen, aanroepen } = opzet([alles()]);
    const uit = await draaiNacht(opties, deps);
    expect(uit.stopreden).toBe("klaar");
    const staat = herstelStaat(oordelen, KEURDER);
    expect(celCijfers(staat.perCel.get(A)!).bevestigd).toHaveLength(6);
    expect(celCijfers(staat.perCel.get(B)!).bevestigd).toHaveLength(6);
    expect(aanroepen.every((a) => a.gelukt)).toBe(true);
    // Elke outfit precies een keer in ronde 1 en een keer in ronde 2.
    expect(oordelen.filter((r) => r.ronde === 1)).toHaveLength(12);
    expect(oordelen.filter((r) => r.ronde === 2)).toHaveLength(12);
  });

  it("zet een outfit nooit in ronde 2 binnen dezelfde aanroep als ronde 1", async () => {
    const { opties, deps, oordelen } = opzet([alles()]);
    await draaiNacht(opties, deps);
    for (const r2 of oordelen.filter((r) => r.ronde === 2)) {
      const r1 = oordelen.find((r) => r.ronde === 1 && r.outfit_key === r2.outfit_key)!;
      expect(r2.aanroep).toBeGreaterThan(r1.aanroep);
    }
  });

  it("stopt direct op een limietmelding en bewaart de resettijd", async () => {
    const { opties, deps, aanroepen, oordelen } = opzet([() => uitkomst({ ok: false, tekst: "You've hit your limit · resets 4am (Europe/Amsterdam)", model: null, apiKeySource: null })]);
    const uit = await draaiNacht(opties, deps);
    expect(uit.stopreden).toBe("limiet");
    expect(aanroepen).toHaveLength(1);
    expect(aanroepen[0]).toMatchObject({ stopreden: "limiet", reset: "4am (Europe/Amsterdam)", gelukt: false });
    expect(oordelen.every((r) => !r.aanroep_gelukt)).toBe(true);
  });

  it("stopt na drie mislukte aanroepen op rij: geen JSON, 4 van 9, onbekende id's", async () => {
    const vier = (opdracht: string) => uitkomst({ tekst: JSON.stringify({ oordelen: idsIn(opdracht).slice(0, 4).map((id) => oordeel(id)) }) });
    const onbekend = (opdracht: string) => uitkomst({ tekst: JSON.stringify({ oordelen: idsIn(opdracht).map((id) => oordeel(id.replace("k", "x"))) }) });
    const { opties, deps, aanroepen, oordelen } = opzet([() => uitkomst({ tekst: "Ik kan dit niet beoordelen." }), vier, onbekend]);
    const uit = await draaiNacht(opties, deps);
    expect(uit.stopreden).toBe("drie-mislukt");
    expect(aanroepen.map((a) => [a.gelukt, a.gelezen, a.onbekend])).toEqual([
      [false, 0, 0],
      [false, 4, 0],
      [false, 0, 9],
    ]);
    // Een mislukte aanroep zegt niets over de outfits: die zijn nog vers.
    expect(herstelStaat(oordelen, KEURDER).perCel.size).toBe(0);
  });

  it("telt een time-out als mislukt en gaat door", async () => {
    const { opties, deps, aanroepen } = opzet([() => uitkomst({ ok: false, timeout: true, tekst: "time-out na 360 s", model: null }), alles()]);
    const uit = await draaiNacht(opties, deps);
    expect(uit.stopreden).toBe("klaar");
    expect(aanroepen[0]).toMatchObject({ gelukt: false, timeout: true, stopreden: null });
  });

  it("stopt als er een ander model antwoordt, en telt die oordelen niet", async () => {
    const { opties, deps, oordelen } = opzet([(o) => ({ ...alles()(o), model: "claude-opus-anders" })]);
    const uit = await draaiNacht(opties, deps);
    expect(uit.stopreden).toBe("ander-model");
    expect(oordelen).toHaveLength(9);
    expect(herstelStaat(oordelen, KEURDER).perCel.size).toBe(0);
  });

  it("stopt als de betaalroute niet klopt met wat gekozen is", async () => {
    const { opties, deps } = opzet([(o) => ({ ...alles()(o), apiKeySource: "none" })]);
    expect((await draaiNacht(opties, deps)).stopreden).toBe("verkeerde-betaling");
    const abo = opzet([(o) => ({ ...alles()(o), apiKeySource: "none" })], { via: "abonnement" });
    expect((await draaiNacht(abo.opties, abo.deps)).stopreden).toBe("klaar");
  });

  it("stopt op het plafond", async () => {
    const { opties, deps, aanroepen } = opzet([alles()], { maxAanroepen: 2 });
    expect((await draaiNacht(opties, deps)).stopreden).toBe("plafond");
    expect(aanroepen).toHaveLength(2);
  });

  it("start niet meer vlak voor de deadline", async () => {
    const deadline = Date.parse("2026-10-23T02:30:00+02:00");
    const { opties, deps, aanroepen } = opzet([alles()], { deadline }, () => Date.parse("2026-10-23T02:25:00+02:00"));
    expect((await draaiNacht(opties, deps)).stopreden).toBe("deadline");
    expect(aanroepen).toHaveLength(0);
  });

  it("geeft outfits zonder oordeel een tweede kans in een volgende portie", async () => {
    const zeven = (opdracht: string) => uitkomst({ tekst: JSON.stringify({ oordelen: idsIn(opdracht).slice(0, 7).map((id) => oordeel(id, false)) }) });
    const { opties, deps, oordelen } = opzet([zeven, alles(false)]);
    await draaiNacht(opties, { ...deps });
    const tweede = oordelen.filter((r) => r.aanroep === 2 && r.ronde === 1 && r.poging === 2);
    expect(tweede).toHaveLength(2);
  });

  it("gaat verder waar een eerdere nacht stopte", async () => {
    const eerst = opzet([alles()], { maxAanroepen: 1 });
    await draaiNacht(eerst.opties, eerst.deps);
    const daarna = opzet([alles()], { bestaand: eerst.oordelen, run: "r2" });
    await draaiNacht(daarna.opties, daarna.deps);
    // De eerste portie van de tweede nacht: drie tweede keuringen vooraan, de
    // drie nieuwe die nog over zijn, en aangevuld met nog drie tweede keuringen.
    const eersteDaarna = daarna.oordelen.filter((r) => r.aanroep === 1);
    expect(eersteDaarna.filter((r) => r.ronde === 2)).toHaveLength(6);
    expect(eersteDaarna.filter((r) => r.ronde === 1)).toHaveLength(3);
    // Niets uit nacht 1 wordt in ronde 1 opnieuw gekeurd.
    const nacht1 = new Set(eerst.oordelen.map((r) => r.outfit_key));
    expect(daarna.oordelen.filter((r) => r.ronde === 1 && nacht1.has(r.outfit_key))).toHaveLength(0);
  });

  it("verdeelt de keuringen eerlijk over de combinaties als de nacht vroeg stopt", async () => {
    const cellen = ["female|minimalist|work", "female|casual|casual", "female|streetwear|casual", "female|smart-casual|work", "female|romantic|date", "male|smart-casual|date", "male|classic|work", "male|streetwear|casual"];
    const nieuw = new Map(cellen.map((cel) => [cel, Array.from({ length: 72 }, (_, i) => kandidaat(cel, `${cel}#${i}`))]));
    // Een op de vier goed, vast per outfit: de agent ziet de sleutel in de stuknaam niet, dus via het stuk-id.
    const kwart = (opdracht: string) =>
      uitkomst({ tekst: JSON.stringify({ oordelen: idsIn(opdracht).map((id, i) => oordeel(id, (opdracht.length + i) % 4 === 0)) }) });
    const { opties, deps, oordelen } = opzet([kwart], { cellen, nieuw, maxAanroepen: 30 });
    await draaiNacht(opties, deps);
    const per = cellen.map((cel) => oordelen.filter((r) => r.cel === cel && r.ronde === 1 && r.aanroep_gelukt).length);
    expect(Math.max(...per) - Math.min(...per)).toBeLessThanOrEqual(2);
  });

  it("telt eerdere aanroepen van dezelfde nacht mee voor het plafond", async () => {
    const { opties, deps, aanroepen } = opzet([alles()], { maxAanroepen: 72, eerder: { aanroepen: 70, ronde1PerCel: new Map() } });
    expect((await draaiNacht(opties, deps)).stopreden).toBe("plafond");
    expect(aanroepen).toHaveLength(2);
  });

  it("telt eerdere keuringen van dezelfde nacht mee voor de nachtlimiet per combinatie", async () => {
    const { opties, deps, oordelen } = opzet([alles()], { eerder: { aanroepen: 0, ronde1PerCel: new Map([[A, 70]]) } });
    await draaiNacht(opties, deps);
    expect(oordelen.filter((r) => r.cel === A && r.ronde === 1 && r.poging === 1 && r.aanroep_gelukt)).toHaveLength(2);
  });

  it("bewaart het begin van een antwoord dat niet te lezen was", async () => {
    const { opties, deps, aanroepen } = opzet([() => uitkomst({ tekst: "Ik kan dit niet beoordelen." }), alles()]);
    await draaiNacht(opties, deps);
    expect(aanroepen[0]).toMatchObject({ gelukt: false, fout: "Ik kan dit niet beoordelen." });
  });

  it("verstuurt korte id's die per portie uniek zijn, en vertaalt ze terug", async () => {
    const { opties, deps, oordelen, opdrachten } = opzet([alles()]);
    await draaiNacht(opties, deps);
    const ids = idsIn(opdrachten[0]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(oordelen.filter((r) => r.aanroep === 1).map((r) => r.kort_id)).toEqual(ids);
  });
});
