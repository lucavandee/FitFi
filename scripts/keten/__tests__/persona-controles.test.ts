/**
 * Tests voor de pure controles van het persona-harnas (spec 5.7),
 * scripts/keten/persona-controles.ts.
 *
 * Aanleiding (1 oktober 2026): persona-run.ts toetste per outfit of zijn
 * gelegenheid gevraagd WAS, maar niet of elke gevraagde gelegenheid in
 * minstens een outfit voorkomt. valideerSet (de stylist-route) toetst dat
 * laatste wel. Drie groepen:
 * 1. de controle zelf: faalt bij een ontbrekende gelegenheid, slaagt bij
 *    volledige dekking;
 * 2. gelijkloop met valideerSet op dezelfde invoer, zodat de twee paden niet
 *    uit elkaar lopen;
 * 3. de aansluiting in persona-run.ts. Dat bestand kan een test niet
 *    importeren (het start bij het laden het hele harnas tegen de live
 *    database), dus het wordt als bron gelezen, zoals productClassifier.test.ts
 *    dat doet voor de lookbehind.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { controleerGelegenheidsdekking } from "../persona-controles";
import { VEREIST_AANTAL_OUTFITS, valideerSet } from "../../../supabase/functions/_shared/valideer-set.ts";
import type { Gelegenheid, StylistOutfit } from "../../../supabase/functions/_shared/keten-types.ts";

const ZES = 6;

/** persona-run.ts als tekst, zonder commentaar (de docstrings noemen de namen die hieronder gezocht worden). */
const personaRunBron = readFileSync(new URL("../persona-run.ts", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "");

/** Outfits met alleen een gelegenheid: meer heeft deze controle niet nodig. */
function metGelegenheden(...gelegenheden: string[]): Array<{ occasion: string }> {
  return gelegenheden.map((occasion) => ({ occasion }));
}

describe("controleerGelegenheidsdekking: faalt bij een ontbrekende gelegenheid", () => {
  it("meldt casual als alle vijf outfits work zijn, en noemt wat wel gedekt is", () => {
    // De situatie uit de aanleiding: een persona vraagt work en casual, de
    // engine levert vijf outfits en allemaal work. Het harnas meldde dit als
    // "minder dan 6 outfits: 5", een cijfer, niet als de oorzaak.
    const fouten = controleerGelegenheidsdekking(metGelegenheden("work", "work", "work", "work", "work"), ["work", "casual"], ZES);
    expect(fouten).toEqual(["gelegenheid(-heden) niet gedekt: casual; gevraagd: work, casual; wel gedekt: work (5 outfits)"]);
  });

  it("faalt ook bij zes outfits van een gelegenheid: een poort die alleen telt zou dit laten passeren", () => {
    const fouten = controleerGelegenheidsdekking(metGelegenheden(...Array(6).fill("work")), ["work", "casual"], ZES);
    expect(fouten).toHaveLength(1);
    expect(fouten[0]).toContain("niet gedekt: casual");
  });

  it("noemt alle ontbrekende gelegenheden, niet alleen de eerste", () => {
    const fouten = controleerGelegenheidsdekking(metGelegenheden("work", "work", "date"), ["work", "casual", "date", "party"], ZES);
    expect(fouten).toEqual([
      "gelegenheid(-heden) niet gedekt: casual, party; gevraagd: work, casual, date, party; wel gedekt: work (2 outfits), date (1 outfit)",
    ]);
  });

  it("meldt dat niets gedekt is als er helemaal geen outfits zijn", () => {
    const fouten = controleerGelegenheidsdekking([], ["work"], ZES);
    expect(fouten).toEqual(["gelegenheid(-heden) niet gedekt: work; gevraagd: work; wel gedekt: niets"]);
  });

  it("telt een gelegenheid die niet gevraagd was niet als dekking van een gevraagde", () => {
    // Zes party-outfits voor een persona die work en casual vroeg: geen enkele
    // gevraagde gelegenheid is gedekt. (Dat een outfit party is terwijl party
    // niet gevraagd was, meldt de andere kant van de poort, per outfit.)
    const fouten = controleerGelegenheidsdekking(metGelegenheden(...Array(6).fill("party")), ["work", "casual"], ZES);
    expect(fouten).toEqual(["gelegenheid(-heden) niet gedekt: work, casual; gevraagd: work, casual; wel gedekt: party (6 outfits)"]);
  });

  it("vergelijkt zonder hoofdletters, zoals de controle per outfit dat ook doet", () => {
    expect(controleerGelegenheidsdekking(metGelegenheden("Work", "CASUAL"), ["work", "Casual"], ZES)).toEqual([]);
    expect(controleerGelegenheidsdekking(metGelegenheden("Work"), ["work", "Casual"], ZES)).toHaveLength(1);
  });
});

describe("controleerGelegenheidsdekking: slaagt bij volledige dekking", () => {
  it("geeft geen fouten als elke gevraagde gelegenheid voorkomt", () => {
    expect(controleerGelegenheidsdekking(metGelegenheden("work", "casual", "work", "casual", "work", "casual"), ["work", "casual"], ZES)).toEqual([]);
  });

  it("eist geen gelijke verdeling: een enkele outfit per gelegenheid volstaat", () => {
    expect(controleerGelegenheidsdekking(metGelegenheden("work", "work", "work", "work", "work", "casual"), ["work", "casual"], ZES)).toEqual([]);
  });

  it("telt een dubbel gevraagde gelegenheid een keer", () => {
    expect(controleerGelegenheidsdekking(metGelegenheden("work"), ["work", "work", "Work"], ZES)).toEqual([]);
  });

  it("laat een extra, niet gevraagde gelegenheid hier met rust: dat is de andere kant van de poort", () => {
    expect(controleerGelegenheidsdekking(metGelegenheden("work", "casual", "party"), ["work", "casual"], ZES)).toEqual([]);
  });
});

describe("controleerGelegenheidsdekking: randgevallen, zelfde lijn als valideerSet", () => {
  it("nul gevraagde gelegenheden: de regel vervalt", () => {
    expect(controleerGelegenheidsdekking(metGelegenheden("work"), [], ZES)).toEqual([]);
    expect(controleerGelegenheidsdekking([], [], ZES)).toEqual([]);
  });

  it("meer gevraagd dan er outfits gevraagd worden: minstens zes verschillende gelegenheden volstaat", () => {
    const zeven = ["work", "casual", "formal", "date", "travel", "sport", "party"];
    expect(controleerGelegenheidsdekking(metGelegenheden(...zeven.slice(0, 6)), zeven, ZES)).toEqual([]);
  });

  it("meer gevraagd dan er outfits gevraagd worden, maar vijf verschillende gedekt: faalt, en zegt waarom", () => {
    const zeven = ["work", "casual", "formal", "date", "travel", "sport", "party"];
    const fouten = controleerGelegenheidsdekking(metGelegenheden("work", "work", "casual", "formal", "date", "travel"), zeven, ZES);
    expect(fouten).toEqual([
      "persona vraagt 7 gelegenheden, meer dan de 6 outfits kunnen dekken; verwacht daarom minstens 6 verschillende gelegenheden in de set, kreeg er 5 (work, casual, formal, date, travel)",
    ]);
  });

  it("precies zoveel gevraagd als er outfits zijn: volledige dekking blijft de eis", () => {
    const zes = ["work", "casual", "formal", "date", "travel", "sport"];
    expect(controleerGelegenheidsdekking(metGelegenheden(...zes), zes, ZES)).toEqual([]);
    expect(controleerGelegenheidsdekking(metGelegenheden("work", "casual", "formal", "date", "travel", "travel"), zes, ZES)).toHaveLength(1);
  });

  it("de grens volgt het aantal outfits dat het harnas vraagt, geen vast getal", () => {
    // Drie gevraagd bij een harnas dat twee outfits vraagt: volledige dekking kan niet,
    // dus volstaan twee verschillende gelegenheden.
    expect(controleerGelegenheidsdekking(metGelegenheden("work", "casual"), ["work", "casual", "date"], 2)).toEqual([]);
    expect(controleerGelegenheidsdekking(metGelegenheden("work", "work"), ["work", "casual", "date"], 2)).toHaveLength(1);
  });
});

describe("controleerGelegenheidsdekking loopt gelijk met valideerSet (de stylist-route)", () => {
  /** Zes outfits met elk unieke producten, zodat de overige regels van valideerSet er niet tussen komen. */
  function stylistOutfits(...gelegenheden: Gelegenheid[]): StylistOutfit[] {
    return gelegenheden.map((occasion, i) => ({
      title: "Titel",
      occasion,
      items: [
        { product_id: `top${i}`, role: "top" as const },
        { product_id: `bottom${i}`, role: "bottom" as const },
        { product_id: `schoen${i}`, role: "footwear" as const },
      ],
      reason: "Omdat het past.",
    }));
  }

  /**
   * valideerSet meldt de dekking als enige regel met "gelegenhe" erin: de gewone
   * melding zegt "gelegenheid(-heden)", de terugval bij meer dan zes gevraagd zegt
   * "gelegenheden", en die twee delen alleen deze stam.
   */
  function stylistMeldtDekking(outfits: StylistOutfit[], gevraagd: Gelegenheid[]): boolean {
    return valideerSet(outfits, { occasions: gevraagd }).fouten.some((f) => f.includes("gelegenhe"));
  }

  const ALLE: Gelegenheid[] = ["work", "casual", "formal", "date", "travel", "sport", "party"];
  const gevallen: Array<{ naam: string; outfits: Gelegenheid[]; gevraagd: Gelegenheid[] }> = [
    { naam: "alles work, work gevraagd", outfits: Array(6).fill("work"), gevraagd: ["work"] },
    { naam: "alles work, work en casual gevraagd", outfits: Array(6).fill("work"), gevraagd: ["work", "casual"] },
    { naam: "alles work, work en date gevraagd", outfits: Array(6).fill("work"), gevraagd: ["work", "date"] },
    { naam: "vijf work en een date, work en date gevraagd", outfits: ["work", "work", "work", "work", "work", "date"], gevraagd: ["work", "date"] },
    { naam: "drie gevraagd en alle drie gedekt", outfits: ["work", "work", "date", "date", "casual", "casual"], gevraagd: ["work", "date", "casual"] },
    { naam: "drie gevraagd en een ontbreekt", outfits: ["work", "work", "date", "date", "date", "date"], gevraagd: ["work", "date", "casual"] },
    { naam: "nul gevraagd", outfits: Array(6).fill("work"), gevraagd: [] },
    { naam: "dubbel gevraagd", outfits: Array(6).fill("work"), gevraagd: ["work", "work"] },
    { naam: "alle zeven gevraagd, zes verschillende gedekt", outfits: ALLE.slice(0, 6), gevraagd: ALLE },
    { naam: "alle zeven gevraagd, vijf verschillende gedekt", outfits: ["work", "work", "casual", "formal", "date", "travel"], gevraagd: ALLE },
    { naam: "zes gevraagd en zes gedekt", outfits: ALLE.slice(0, 6), gevraagd: ALLE.slice(0, 6) },
    { naam: "zes gevraagd en vijf gedekt", outfits: ["work", "casual", "formal", "date", "travel", "travel"], gevraagd: ALLE.slice(0, 6) },
    { naam: "ongevraagde gelegenheid erbij", outfits: ["work", "work", "work", "work", "casual", "party"], gevraagd: ["work", "casual"] },
  ];

  it("de gevallen hieronder gaan uit van zes outfits, het getal dat valideerSet eist", () => {
    expect(VEREIST_AANTAL_OUTFITS).toBe(ZES);
  });

  it("het harnas vraagt evenveel outfits als valideerSet eist, dus de grens van de terugval is gelijk", () => {
    // De terugval bij meer gevraagde gelegenheden dan outfits hangt aan dit getal. Loopt het harnas
    // hier ooit van weg, dan toetsen de twee paden niet meer dezelfde regel: bewust kiezen, niet per ongeluk.
    const getal = /\bconst AANTAL_OUTFITS = (\d+);/.exec(personaRunBron)?.[1];
    expect(getal).toBeDefined();
    expect(Number(getal)).toBe(VEREIST_AANTAL_OUTFITS);
  });

  for (const geval of gevallen) {
    it(`geeft hetzelfde oordeel: ${geval.naam}`, () => {
      const stylist = stylistMeldtDekking(stylistOutfits(...geval.outfits), geval.gevraagd);
      const harnas = controleerGelegenheidsdekking(metGelegenheden(...geval.outfits), geval.gevraagd, VEREIST_AANTAL_OUTFITS).length > 0;
      expect(harnas).toBe(stylist);
    });
  }
});

describe("persona-run.ts sluit de dekkingscontrole aan", () => {
  it("importeert controleerGelegenheidsdekking uit persona-controles", () => {
    expect(personaRunBron).toMatch(/import\s*\{[^}]*\bcontroleerGelegenheidsdekking\b[^}]*\}\s*from\s*"\.\/persona-controles"/);
  });

  it("zet de uitkomst in fouten, met het aantal outfits dat het harnas vraagt als grens", () => {
    // Gebouwd maar nooit aangesloten is een controle die groen staat omdat ze niet draait.
    expect(personaRunBron).toMatch(
      /fouten\.push\(\s*\.\.\.controleerGelegenheidsdekking\(\s*outfits\s*,\s*gevraagdeGelegenheden\(persona\)\s*,\s*AANTAL_OUTFITS\s*\)\s*\)/
    );
  });
});
