/**
 * Het beweringenregister van de landingspagina (plan "Onder de hero", 3.10 en
 * G22): elke zin onder de hero heeft een bron, en die bron klopt nog.
 *
 * Faalt als een zoektekst uit zijn bestand verdwijnt, als een getal niet meer
 * bij de data past, of als een meting ouder is dan 180 dagen. Dan is de zin op
 * de pagina niet meer bewezen: pas de zin aan, of meet opnieuw.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { quizSteps } from "@/data/quizSteps";
import { getColorPalette } from "@/data/colorPalettes";
import { VOORBEELDPROFIEL } from "@/content/voorbeeldprofiel";
import { PALETSLEUTEL } from "@/content/kleurpiek";
import { LANDING_COPY, type Bron, type DataSleutel, type Zin } from "../landingCopy";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const lees = (pad: string) => readFileSync(`${ROOT}${pad}`, "utf-8");

const isZin = (w: unknown): w is Zin =>
  typeof w === "object" && w !== null && "tekst" in w && "bronnen" in w;

/** Alle zinnen in het register, met hun plek. */
function zinnen(waarde: unknown, pad = "LANDING_COPY"): Array<[string, Zin]> {
  if (isZin(waarde)) return [[pad, waarde]];
  if (Array.isArray(waarde)) return waarde.flatMap((w, i) => zinnen(w, `${pad}[${i}]`));
  if (typeof waarde === "object" && waarde !== null) {
    return Object.entries(waarde).flatMap(([k, w]) => zinnen(w, `${pad}.${k}`));
  }
  return [];
}

const ALLE = zinnen(LANDING_COPY);

/** Hoe de data een getal geeft. Bij een niet-geexporteerde constante: uit de bron gelezen. */
const DATA: Record<DataSleutel, () => number> = {
  aantalStappen: () => quizSteps.length,
  optioneleStappen: () => quizSteps.filter((s) => !s.required).length,
  stapGeslacht: () => quizSteps.findIndex((s) => s.field === "gender") + 1,
  stapKleuren: () => quizSteps.findIndex((s) => s.field === "neutrals") + 1,
  stapContrast: () => quizSteps.findIndex((s) => s.field === "contrast") + 1,
  minimumSwipes: () => {
    const m = lees("src/components/quiz/VisualPreferenceStepClean.tsx").match(/const MIN_SWIPES_TO_COMPLETE = (\d+);/);
    return Number(m?.[1]);
  },
  kalibratieOutfits: () => {
    const bron = lees("src/components/quiz/CalibrationStep.tsx");
    // Alleen geldig zolang engine v2 de kalibratie maakt.
    if (!/const USE_ENGINE_V2 = true;/.test(bron)) return Number.NaN;
    const m = bron.match(/generateCalibrationOutfitsV2\([\s\S]*?\{ count: (\d+) \}/);
    return Number(m?.[1]);
  },
  budgetVoorbeeldprofiel: () => VOORBEELDPROFIEL.antwoorden.budget.max,
};

const GETALWOORD: Record<number, string> = {
  1: "een", 2: "twee", 3: "drie", 4: "vier", 5: "vijf", 6: "zes", 7: "zeven", 8: "acht", 9: "negen", 10: "tien",
};

const MAX_DAGEN = 180;

describe("beweringenregister: elke zin heeft een bron", () => {
  it("bevat zinnen", () => {
    expect(ALLE.length).toBeGreaterThan(30);
  });

  it.each(ALLE)("%s heeft minstens een bron", (_pad, zin) => {
    expect(zin.tekst.trim().length).toBeGreaterThan(0);
    expect(zin.bronnen.length).toBeGreaterThan(0);
  });
});

describe("beweringenregister: de bronnen kloppen nog", () => {
  const metBron = ALLE.flatMap(([pad, zin]) => zin.bronnen.map((b): [string, string, Bron] => [pad, zin.tekst, b]));

  const code = metBron.filter((r): r is [string, string, { bestand: string; zoek: string }] => "bestand" in r[2]);
  it.each(code)("%s: de zoektekst staat in het bestand", (_pad, _tekst, bron) => {
    expect(existsSync(`${ROOT}${bron.bestand}`), `${bron.bestand} bestaat niet meer`).toBe(true);
    expect(lees(bron.bestand), `"${bron.zoek}" staat niet meer in ${bron.bestand}`).toContain(bron.zoek);
  });

  const data = metBron.filter(
    (r): r is [string, string, { data: DataSleutel; waarde: number; inTekst: string }] => "waarde" in r[2],
  );
  it.each(data)("%s: het getal past bij de data", (_pad, tekst, bron) => {
    expect(DATA[bron.data](), `${bron.data}`).toBe(bron.waarde);
    expect(tekst).toContain(bron.inTekst);
    const goed = [String(bron.waarde), GETALWOORD[bron.waarde]].filter(Boolean);
    expect(goed).toContain(bron.inTekst.toLowerCase());
  });

  const plaatshouders = metBron.filter(
    (r): r is [string, string, { data: "outfitsInRun"; plaatshouder: string }] => "plaatshouder" in r[2],
  );
  it.each(plaatshouders)("%s: de plaatshouder staat in de zin", (_pad, tekst, bron) => {
    expect(tekst).toContain(bron.plaatshouder);
  });

  const metingen = metBron.filter(
    (r): r is [string, string, { meting: string; datum: string; script: string }] => "meting" in r[2],
  );
  it.each(metingen)("%s: de meting is hoogstens 180 dagen oud", (_pad, _tekst, bron) => {
    const datum = new Date(`${bron.datum}T00:00:00Z`);
    expect(Number.isNaN(datum.getTime())).toBe(false);
    const dagen = (Date.now() - datum.getTime()) / 86_400_000;
    expect(dagen, `meting van ${bron.datum}: opnieuw meten (${bron.script})`).toBeLessThanOrEqual(MAX_DAGEN);
    expect(bron.script.length).toBeGreaterThan(0);
  });
});

describe("beweringenregister: vorm", () => {
  it("geen gedachtestreepje (U+2014, U+2013) in een zin (G14)", () => {
    for (const [pad, zin] of ALLE) expect(zin.tekst, pad).not.toMatch(/[\u2013\u2014]/);
  });

  it("de displaykop van het slot is de eerste vraag van de quiz, in twee delen", () => {
    expect(LANDING_COPY.slot.kopDelen.join("")).toBe(LANDING_COPY.slot.kop.tekst);
    expect(quizSteps[0].title).toBe(LANDING_COPY.slot.kop.tekst);
  });

  it("de kop van de piek is vraag 3 letterlijk, met het antwoord van het voorbeeldprofiel", () => {
    const stap = quizSteps.find((s) => s.field === "neutrals");
    expect(stap?.title).toBe(LANDING_COPY.kleur.kop.tekst);
    const optie = stap?.options?.find((o) => o.value === VOORBEELDPROFIEL.antwoorden.neutrals);
    expect(optie?.label).toBe(LANDING_COPY.kleur.antwoord.tekst);
    expect(optie?.description).toBe(LANDING_COPY.kleur.antwoordUitleg.tekst);
  });

  it("de profielregel van de outfit volgt het voorbeeldprofiel", () => {
    const tekst = LANDING_COPY.outfit.tekst.tekst;
    expect(VOORBEELDPROFIEL.antwoorden.gender).toBe("female");
    expect(tekst).toContain("dames");
    const warm = quizSteps.find((s) => s.field === "neutrals")?.options?.find((o) => o.value === "warm");
    expect(VOORBEELDPROFIEL.antwoorden.neutrals).toBe("warm");
    expect(tekst).toContain(warm!.label.toLowerCase());
    expect(tekst).toContain(`tot ${VOORBEELDPROFIEL.antwoorden.budget.max} euro per stuk`);
  });

  it("'gratis account' staat er twee keer, niet vaker (plan 4.0)", () => {
    const keren = ALLE.map(([, z]) => z.tekst).join(" ").match(/gratis account/g) ?? [];
    expect(keren).toHaveLength(2);
  });

  /*
   * G20: hoogstens 300 woorden in de vijf secties, zonder labels. Geteld zoals
   * de pagina ze toont met alles aan (outfit, opname, gegevensblok), plus de
   * zes kleurnamen. Niet meegeteld: toegankelijke namen en alt-teksten.
   */
  it("hoogstens 300 woorden onder de hero (G20)", () => {
    const c = LANDING_COPY;
    const zichtbaar = [
      c.gedragen.kop, ...c.gedragen.tekst,
      c.kleur.stap, c.kleur.kop, c.kleur.antwoord, c.kleur.antwoordUitleg, c.kleur.profiel, c.kleur.slot,
      c.outfit.kop, c.outfit.tekst,
      ...Object.values(c.outfit.stukken), ...Object.values(c.outfit.stukken).map(() => c.outfit.partnerlink),
      c.outfit.vergoeding, c.outfit.vergoedingLink, c.outfit.begin,
      c.werkwijze.kop, ...c.werkwijze.stappen.flatMap((s) => [s.titel, ...s.tekst]), c.werkwijze.opname.onderschrift,
      c.gegevens.kop, ...c.gegevens.rijen.flatMap((r) => [r.label, r.tekst]), c.gegevens.link,
      c.slot.stap, c.slot.kop, c.slot.tekst, c.slot.knop,
    ].map((z) => z.tekst.replace("{N}", "6"));
    const namen = getColorPalette(PALETSLEUTEL)?.doColors.map((k) => k.name) ?? [];
    // Vier keer de winkelnaam onder de foto's.
    const woorden = [...zichtbaar, ...namen, "H&M", "H&M", "H&M", "H&M"].join(" ").split(/\s+/).filter(Boolean);
    expect(woorden.length).toBeLessThanOrEqual(300);
  });
});
