import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { Product } from "@/engine/types";
import { getStyleOptionsForGender } from "@/data/quizSteps";
import { GELEGENHEDEN } from "@/services/outfits/kandidaten";
import type { KeurOordeel } from "../stijlAgent";
import {
  PILOT_CELLEN,
  REGELS,
  bouwNachtrapport,
  celCijfers,
  deadlineVoor,
  herstelStaat,
  isLimiet,
  keurderSleutel,
  kiesPortie,
  leesPortieAntwoord,
  minimumOordelen,
  naarKeurOutfit,
  nachtVan,
  omEnOm,
  redenGroepen,
  naarLogStukken,
  resetTekst,
  schud,
  sleutelVoorStukken,
  telOordeel,
  volgendeStap,
  type AanroepRegel,
  type Kandidaat,
  type LogStuk,
  type OordeelRegel,
  type Telling,
} from "../stijlSets";

const KEURDER = keurderSleutel("keur-x", "claude-sonnet-test", "xhigh");

const goedOordeel = (id: string, over: Partial<KeurOordeel> = {}): KeurOordeel => ({
  id,
  oordeel: "goed",
  stijl: "ja",
  gelegenheid: "ja",
  kleur: "ja",
  samenhang: "ja",
  redenen: [],
  verbetering: "",
  ...over,
});

const stuk = (id: string, over: Partial<LogStuk> = {}): LogStuk => ({
  product_id: id,
  rol: "top",
  naam: `stuk ${id}`,
  merk: "H&M",
  prijs: 40,
  kleuren: ["wit"],
  lichtheid: "licht",
  beeld: null,
  ...over,
});

let teller = 0;
function regel(cel: string, key: string, ronde: 1 | 2, telling: Telling, over: Partial<OordeelRegel> = {}): OordeelRegel {
  teller += 1;
  return {
    tijd: `2026-10-23T00:00:${String(teller % 60).padStart(2, "0")}Z`,
    run: "r1",
    keurder: KEURDER,
    keur_versie: "keur-x",
    model: "claude-sonnet-test",
    effort: "xhigh",
    cel,
    outfit_key: key,
    stukken: [stuk(`${key}-a`, { rol: "top" }), stuk(`${key}-b`, { rol: "bottom", kleuren: ["zwart"], lichtheid: "donker" })],
    p_zaad: 1,
    engine_zaad: 2,
    ronde,
    poging: 1,
    aanroep: teller,
    aanroep_gelukt: true,
    kort_id: "k1",
    ruw: null,
    telling,
    ...over,
  };
}

const kandidaat = (cel: string, key: string, over: Partial<Kandidaat> = {}): Kandidaat => ({
  cel,
  combinatie: { geslacht: "female", stijl: "casual", gelegenheid: "casual" },
  outfit_key: key,
  stukken: [stuk(`${key}-a`)],
  p_zaad: 1,
  engine_zaad: 2,
  ronde: 1,
  poging: 1,
  ...over,
});

describe("pilotcellen", () => {
  it("zijn allemaal te kiezen in de quiz", () => {
    expect(PILOT_CELLEN).toHaveLength(8);
    for (const c of PILOT_CELLEN) {
      const stijlen = getStyleOptionsForGender(c.geslacht).map((o) => o.value);
      expect(stijlen, `${c.geslacht} ${c.stijl}`).toContain(c.stijl);
      expect(GELEGENHEDEN as readonly string[]).toContain(c.gelegenheid);
    }
  });
});

describe("limietmelding", () => {
  it("herkent de vormen uit de logs van Lucs jobs", () => {
    expect(isLimiet("You've hit your limit · resets Oct 22 at 4am (Europe/Amsterdam)")).toBe(true);
    expect(isLimiet("Claude usage limit reached. Your limit will reset at 5pm")).toBe(true);
    expect(isLimiet("API Error: 429 rate_limit_error")).toBe(true);
    expect(isLimiet("kon de uitvoer van claude -p niet als JSON lezen: Hallo")).toBe(false);
  });

  it("haalt de resettijd letterlijk uit de tekst", () => {
    expect(resetTekst("You've hit your limit · resets Oct 22 at 4am (Europe/Amsterdam)")).toBe("Oct 22 at 4am (Europe/Amsterdam)");
    expect(resetTekst("You've hit your limit · resets 11:20pm (Europe/Amsterdam)")).toBe("11:20pm (Europe/Amsterdam)");
    expect(resetTekst("geen limiet")).toBeNull();
  });
});

describe("invoer voor de agent", () => {
  const product = (over: Partial<Product> & { lightness?: string }): Product =>
    ({ id: "p1", name: "Wollen trui, Maat M", brand: "H&M", price: 39.99, category: "top", colors: ["crème"], imageUrl: "https://x/1.jpg", ...over }) as Product;

  it("haalt de maat uit de naam en neemt merk, prijs en kleur mee", () => {
    const [s] = naarLogStukken([product({ lightness: "licht" } as Partial<Product>)], () => undefined)!;
    expect(s).toEqual({ product_id: "p1", rol: "top", naam: "Wollen trui", merk: "H&M", prijs: 39.99, kleuren: ["crème"], lichtheid: "licht", beeld: "https://x/1.jpg" });
  });

  it("vult een lege kleur aan met de kleur van de tagger", () => {
    const [s] = naarLogStukken([product({ colors: [] })], (id) => (id === "p1" ? ["olijf"] : undefined))!;
    expect(s.kleuren).toEqual(["olijf"]);
  });

  it("neemt de kleur van de tagger boven die van de feed", () => {
    // De feed leidt kleur af uit tekst: "Flared" en "brede" gaven een valse "red".
    const [s] = naarLogStukken([product({ name: "H & M - Flared High Jeans - Blauw", colors: ["blauw", "red"] })], () => ["blauw"])!;
    expect(s.kleuren).toEqual(["blauw"]);
  });

  it("laat de opvulwaarde unknown uit de feed weg", () => {
    expect(naarLogStukken([product({ colors: ["unknown"] })], () => undefined)).toBeNull();
    const [s] = naarLogStukken([product({ colors: ["zwart", "unknown"] })], () => [])!;
    expect(s.kleuren).toEqual(["zwart"]);
  });

  it("keurt geen outfit met een stuk zonder enige kleur", () => {
    expect(naarLogStukken([product({}), product({ id: "p2", colors: [] })], () => [])).toBeNull();
  });

  it("geeft de agent alleen geslacht, stijl en gelegenheid, zonder lichtheid of temperatuur", () => {
    const o = naarKeurOutfit("k3", { geslacht: "male", stijl: "classic", gelegenheid: "work" }, [stuk("a")]);
    expect(o.id).toBe("k3");
    expect(o.profiel).toEqual({ geslacht: "male", stijlen: ["classic"], gelegenheid: "work" });
    expect(o.stukken[0]).toEqual({ categorie: "top", naam: "stuk a", merk: "H&M", prijs: 40, kleuren: ["wit"] });
  });

  it("maakt dezelfde outfit_key als de beoordelingen op de site", async () => {
    const ids = ["b", "a", "b"];
    const verwacht = createHash("sha256").update("a,b").digest("hex");
    expect(await sleutelVoorStukken(ids)).toBe(verwacht);
  });
});

describe("oordeel tellen", () => {
  it("telt goed alleen met vier keer ja en geen verbetering", () => {
    expect(telOordeel(goedOordeel("k1"))).toBe("goed");
    expect(telOordeel(goedOordeel("k1", { kleur: "deels" }))).toBe("twijfel");
    expect(telOordeel(goedOordeel("k1", { verbetering: "vervang de riem" }))).toBe("twijfel");
    expect(telOordeel(goedOordeel("k1", { oordeel: "fout", stijl: "nee" }))).toBe("fout");
    expect(telOordeel(undefined)).toBe("geen oordeel");
  });

  it("vraagt van een portie van negen er minstens vijf terug, naar rato bij minder", () => {
    expect(minimumOordelen(9)).toBe(5);
    expect(minimumOordelen(4)).toBe(3);
    expect(minimumOordelen(1)).toBe(1);
  });

  it("leest alleen verstuurde id's, en een dubbel id telt niet", () => {
    const tekst = JSON.stringify({
      oordelen: [goedOordeel("k1"), goedOordeel("k2"), goedOordeel("k2", { oordeel: "fout" }), goedOordeel("k9"), goedOordeel("p1-o1")],
    });
    const r = leesPortieAntwoord(`Hier: ${tekst}`, ["k1", "k2", "k3"]);
    expect([...r.perId.keys()]).toEqual(["k1"]);
    expect(r.dubbel).toBe(1);
    expect(r.onbekend).toBe(2);
  });
});

describe("staat uit het logboek", () => {
  const C = "female|casual|casual";

  it("telt regels uit een mislukte aanroep niet mee", () => {
    const staat = herstelStaat([regel(C, "x", 1, "geen oordeel", { aanroep_gelukt: false })], KEURDER);
    expect(staat.perCel.get(C)).toBeUndefined();
  });

  it("negeert regels van een andere keurder", () => {
    const staat = herstelStaat([regel(C, "x", 1, "goed", { keurder: "ander" })], KEURDER);
    expect(staat.perCel.get(C)).toBeUndefined();
  });

  it("zet een goede outfit uit ronde 1 in de wachtrij voor ronde 2 en bevestigt na een tweede goed", () => {
    let staat = herstelStaat([regel(C, "x", 1, "goed")], KEURDER);
    expect(celCijfers(staat.perCel.get(C)!).wachtrij2).toEqual(["x"]);
    staat = herstelStaat([regel(C, "x", 1, "goed"), regel(C, "x", 2, "goed")], KEURDER);
    const c = celCijfers(staat.perCel.get(C)!);
    expect(c.bevestigd).toEqual(["x"]);
    expect(c.wachtrij2).toEqual([]);
  });

  it("bevestigt niet als ronde 2 twijfelt", () => {
    const c = celCijfers(herstelStaat([regel(C, "x", 1, "goed"), regel(C, "x", 2, "twijfel")], KEURDER).perCel.get(C)!);
    expect(c.bevestigd).toEqual([]);
    expect(c.wachtrij2).toEqual([]);
  });

  it("geeft een outfit zonder oordeel een tweede kans, daarna niet meer", () => {
    let c = celCijfers(herstelStaat([regel(C, "x", 1, "geen oordeel")], KEURDER).perCel.get(C)!);
    expect(c.herkansing1).toEqual(["x"]);
    expect(c.alGekeurd.has("x")).toBe(false);
    c = celCijfers(herstelStaat([regel(C, "x", 1, "geen oordeel"), regel(C, "x", 1, "geen oordeel", { poging: 2 })], KEURDER).perCel.get(C)!);
    expect(c.herkansing1).toEqual([]);
    expect(c.alGekeurd.has("x")).toBe(true);
    expect(c.keuringen).toBe(0);
  });

  it("geeft ook in ronde 2 een tweede kans zonder oordeel", () => {
    const c = celCijfers(herstelStaat([regel(C, "x", 1, "goed"), regel(C, "x", 2, "geen oordeel")], KEURDER).perCel.get(C)!);
    expect(c.wachtrij2).toEqual(["x"]);
  });

  it("is vol bij twaalf bevestigde outfits", () => {
    const regels = Array.from({ length: REGELS.vol }, (_, i) => [regel(C, `o${i}`, 1, "goed"), regel(C, `o${i}`, 2, "goed")]).flat();
    expect(celCijfers(herstelStaat(regels, KEURDER).perCel.get(C)!).status).toBe("vol");
  });

  it("is arm na 36 keuringen zonder een enkele goede", () => {
    const regels = Array.from({ length: REGELS.armZonderGoedNa }, (_, i) => regel(C, `o${i}`, 1, i % 2 ? "fout" : "twijfel"));
    expect(celCijfers(herstelStaat(regels, KEURDER).perCel.get(C)!).status).toBe("arm");
    expect(celCijfers(herstelStaat(regels.slice(1), KEURDER).perCel.get(C)!).status).toBe("open");
  });

  it("is arm na 72 keuringen met minder dan drie bevestigd, maar pas als ronde 2 leeg is", () => {
    const fout = Array.from({ length: REGELS.armNa - 2 }, (_, i) => regel(C, `f${i}`, 1, "fout"));
    const goed = [regel(C, "g1", 1, "goed"), regel(C, "g2", 1, "goed"), regel(C, "g1", 2, "goed")];
    expect(celCijfers(herstelStaat([...fout, ...goed], KEURDER).perCel.get(C)!).status).toBe("open");
    const klaar = [...fout, ...goed, regel(C, "g2", 2, "fout")];
    expect(celCijfers(herstelStaat(klaar, KEURDER).perCel.get(C)!).status).toBe("arm");
  });
});

describe("portie kiezen", () => {
  it("neemt hooguit drie uit ronde 2, dan de herkansingen, dan beurtelings uit de cellen", () => {
    const ronde2 = ["r1", "r2", "r3", "r4"].map((k) => kandidaat("A", k, { ronde: 2 }));
    const herkansing = [kandidaat("B", "h1", { poging: 2 })];
    const nieuw = [
      ["a1", "a2", "a3"].map((k) => kandidaat("A", k)),
      ["b1", "b2", "b3"].map((k) => kandidaat("B", k)),
    ];
    const p = kiesPortie({ ronde2, herkansing, nieuw, grootte: 9, maxRonde2: 3 });
    expect(p.map((k) => k.outfit_key)).toEqual(["r1", "r2", "r3", "h1", "a1", "b1", "a2", "b2", "a3"]);
  });

  it("vult een portie aan met tweede keuringen als de nieuwe op zijn", () => {
    const ronde2 = ["r1", "r2", "r3", "r4", "r5"].map((k) => kandidaat("A", k, { ronde: 2 }));
    const p = kiesPortie({ ronde2, herkansing: [], nieuw: [[kandidaat("A", "a1")]], grootte: 9, maxRonde2: 3 });
    expect(p.map((k) => k.outfit_key)).toEqual(["r1", "r2", "r3", "a1", "r4", "r5"]);
  });

  it("zet lijsten om en om achter elkaar", () => {
    expect(omEnOm([["a1", "a2", "a3"], ["b1"], ["c1", "c2"]])).toEqual(["a1", "b1", "c1", "a2", "c2", "a3"]);
  });

  it("neemt een outfit nooit twee keer in dezelfde portie", () => {
    const p = kiesPortie({ ronde2: [], herkansing: [kandidaat("A", "x", { poging: 2 })], nieuw: [[kandidaat("A", "x")]], grootte: 9, maxRonde2: 3 });
    expect(p.map((k) => k.outfit_key)).toEqual(["x"]);
  });

  it("husselt vast per zaad, zodat de volgorde niets verraadt", () => {
    const xs = Array.from({ length: 9 }, (_, i) => i);
    expect(schud(xs, 7)).toEqual(schud(xs, 7));
    expect(schud(xs, 7)).not.toEqual(xs);
    expect([...schud(xs, 7)].sort()).toEqual(xs);
  });
});

describe("noodrem", () => {
  const basis = { nu: Date.parse("2026-10-23T00:00:00+02:00"), deadline: Date.parse("2026-10-23T02:30:00+02:00"), aanroepen: 0, maxAanroepen: 72, misOpRij: 0 };

  it("stopt op het plafond", () => {
    expect(volgendeStap({ ...basis, aanroepen: 72 })).toBe("plafond");
    expect(volgendeStap({ ...basis, aanroepen: 71 })).toBeNull();
  });

  it("start geen aanroep die over de deadline kan lopen", () => {
    expect(volgendeStap({ ...basis, nu: Date.parse("2026-10-23T02:24:01+02:00") })).toBe("deadline");
    expect(volgendeStap({ ...basis, nu: Date.parse("2026-10-23T02:23:59+02:00") })).toBeNull();
    expect(volgendeStap({ ...basis, deadline: null, nu: Date.parse("2026-10-23T05:00:00+02:00") })).toBeNull();
  });

  it("stopt na drie mislukte aanroepen op rij", () => {
    expect(volgendeStap({ ...basis, misOpRij: 3 })).toBe("drie-mislukt");
    expect(volgendeStap({ ...basis, misOpRij: 2 })).toBeNull();
  });

  it("legt de deadline op het eerstvolgende tijdstip", () => {
    const avond = new Date(2026, 9, 22, 21, 30);
    expect(new Date(deadlineVoor("02:30", avond))).toEqual(new Date(2026, 9, 23, 2, 30));
    const nacht = new Date(2026, 9, 23, 1, 0);
    expect(new Date(deadlineVoor("02:30", nacht))).toEqual(new Date(2026, 9, 23, 2, 30));
    expect(() => deadlineVoor("25:00", avond)).toThrow();
  });
});

describe("nachtdatum", () => {
  it("rekent een nacht van 12:00 tot 12:00, in Nederlandse tijd", () => {
    expect(nachtVan(new Date("2026-10-22T19:30:00Z"))).toBe("2026-10-22"); // 21:30
    expect(nachtVan(new Date("2026-10-23T00:30:00Z"))).toBe("2026-10-22"); // 02:30
    expect(nachtVan(new Date("2026-10-23T09:59:00Z"))).toBe("2026-10-22"); // 11:59
    expect(nachtVan(new Date("2026-10-23T10:01:00Z"))).toBe("2026-10-23"); // 12:01
  });
});

describe("redenen per soort", () => {
  it("deelt vrije zinnen in in vaste soorten", () => {
    expect(redenGroepen("De zwarte pumps passen niet bij streetwear")).toContain("hak of pump");
    expect(redenGroepen("Satijnen top met dunne bandjes is een zomerstuk")).toContain("zomerstuk in de herfst");
    expect(redenGroepen("Skinny jeans ogen gedateerd")).toContain("gedateerd");
    expect(redenGroepen("Blauw op blauw van twee merken vloekt")).toContain("kleurcombinatie");
    expect(redenGroepen("Iets heel anders")).toEqual(["overig"]);
  });
});

describe("nachtrapport", () => {
  const C = "female|casual|casual";
  const aanroep = (over: Partial<AanroepRegel> = {}): AanroepRegel => ({
    tijd: "2026-10-23T00:00:00Z",
    run: "r1",
    nummer: 1,
    via: "sleutel",
    verstuurd: 9,
    gelezen: 9,
    onbekend: 0,
    dubbel: 0,
    gelukt: true,
    timeout: false,
    duration_ms: 120000,
    total_cost_usd: 0.27,
    usage: null,
    modelUsage: null,
    num_turns: 1,
    model: "claude-sonnet-test",
    apiKeySource: "ANTHROPIC_API_KEY",
    is_error: false,
    fout: null,
    stopreden: null,
    reset: null,
    rate_limits: [],
    ...over,
  });

  it("telt per cel, per budget, bij licht en de herhaalbaarheid", () => {
    const duur = [stuk("d1", { prijs: 200 }), stuk("d2", { rol: "bottom", prijs: 60 })];
    const regels = [
      regel(C, "g1", 1, "goed"),
      regel(C, "g1", 2, "goed"),
      regel(C, "g2", 1, "goed", { stukken: duur }),
      regel(C, "g2", 2, "goed", { stukken: duur }),
      regel(C, "g3", 1, "goed"),
      regel(C, "g3", 2, "twijfel"),
      regel(C, "f1", 1, "fout", { ruw: goedOordeel("k1", { oordeel: "fout", kleur: "nee", redenen: ["te veel beige"] }) }),
      regel(C, "t1", 1, "twijfel", { ruw: goedOordeel("k2", { kleur: "deels" }) }),
    ];
    const { json, md } = bouwNachtrapport({
      regels,
      aanroepen: [aanroep(), aanroep({ nummer: 2, gelukt: false, is_error: true, fout: "time-out na 360s", timeout: true, duration_ms: null, total_cost_usd: null, stopreden: "drie-mislukt" })],
      keurder: KEURDER,
      run: "r1",
      meta: { start: "2026-10-22T21:30:00+02:00", stop: "2026-10-23T00:10:00+02:00", git: "abc123", via: "sleutel" },
    });
    const cel = json.cellen.find((c) => c.cel === C)!;
    expect(cel.keuringen).toBe(5);
    expect(cel.goedGeteld).toBe(3);
    expect(cel.goedRuw).toBe(4);
    expect(cel.bevestigd).toBe(2);
    expect(cel.budget).toEqual({ tot75: 1, tot150: 1, tot250: 2 });
    expect(cel.licht).toBe(2);
    expect(cel.afgekeurdOp.kleur).toBe(2);
    expect(json.herhaalbaarheid).toEqual({ beoordeeld: 3, blevenGoed: 2 });
    expect(json.aanroepen).toEqual({ totaal: 2, gelukt: 1, mislukt: 1, timeout: 1, dollar: 0.27, gemiddeldeSeconden: 120 });
    expect(json.stopreden).toBe("drie-mislukt");
    expect(md).toContain("female|casual|casual");
    expect(md).not.toMatch(/\u2014/);
    expect(cel.redenen[0]).toMatch(/^te veel beige of kleurloos \(1x\): te veel beige/);
  });

  it("toont ook combinaties zonder keuring, en een uitgeputte als uitgeput", () => {
    const regels = [regel(C, "f1", 1, "fout")];
    const { json, md } = bouwNachtrapport({
      regels,
      aanroepen: [aanroep({ stopreden: null })],
      keurder: KEURDER,
      run: "r1",
      meta: { start: "2026-10-22T19:30:00.000Z", stop: "2026-10-22T22:00:00.000Z", git: "abc", via: "sleutel", stopreden: "plafond" },
      cellen: [
        { cel: C, kandidaten: 1, nogTeKeuren: 0 },
        { cel: "male|classic|work", kandidaten: 0, nogTeKeuren: 0, reden: "geen stijlpool" },
      ],
    });
    expect(json.stopreden).toBe("plafond");
    expect(json.cellen.map((c) => [c.cel, c.status])).toEqual([
      [C, "uitgeput"],
      ["male|classic|work", "geen kandidaten"],
    ]);
    expect(md).toContain("geen stijlpool");
    expect(md).toContain("21:30");
  });
});
