/**
 * De secties onder de held van de homepage (kleurkamer, 22 oktober 2026): wat
 * er moet staan, wat er niet meer mag staan, en dat de winkelrij wegblijft als
 * er geen drie stukken in die kleur zijn.
 */
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import DeKamers from "../DeKamers";
import InDeWinkel from "../InDeWinkel";
import JeRapport from "../JeRapport";
import Slot from "../Slot";
import Werkwijze from "../Werkwijze";
import { KAMERS, KLEURKAMER_COPY } from "@/content/kleurkamers";
import { COLOR_PALETTES } from "@/data/colorPalettes";

const render = (el: JSX.Element) => renderToString(<MemoryRouter>{el}</MemoryRouter>);
const tel = (html: string, tekst: string) => html.split(tekst).length - 1;

describe("DeKamers", () => {
  it("zes stills van dezelfde persoon, elk met de naam van de kamer, en één AI-label", () => {
    const html = render(<DeKamers wie="dames" />);
    expect(html.match(/<figure/g)).toHaveLength(6);
    for (const k of KAMERS) expect(html).toContain(`alt="Dezelfde vrouw in de kamer ${k.naam.toLowerCase()}."`);
    expect(tel(html, KLEURKAMER_COPY.held.aiLabel)).toBe(1);
    expect(html).toContain('loading="lazy"');
  });

  it("volgt de keuze voor heren", () => {
    expect(render(<DeKamers wie="heren" />)).toContain('alt="Dezelfde man in de kamer diep rood."');
  });
});

describe("InDeWinkel", () => {
  it("partnerlinks in een nieuw venster, met dat in de naam van de link, en de melding over de vergoeding", () => {
    const html = render(<InDeWinkel kamer="dieprood" wie="dames" />);
    const links = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map((m) => m[0]);
    expect(links.length).toBeGreaterThanOrEqual(3);
    for (const a of links) {
      expect(a).toContain('rel="sponsored noopener noreferrer"');
      expect(a).toMatch(/aria-label="Bekijk bij partner: [^"]+, opent in een nieuw venster"/);
    }
    expect(html).toContain('href="/affiliate-disclosure"');
  });

  it("geen rij als er geen drie stukken in die kleur zijn (warm terracotta)", () => {
    expect(render(<InDeWinkel kamer="warmterracotta" wie="dames" />)).toBe("");
  });
});

describe("JeRapport", () => {
  it("de omslag volgt het echte rapport: inkt, dezelfde labels, de kleurcode met namen", () => {
    const html = render(<JeRapport />);
    expect(html).toContain("bg-[#1A1A1A]");
    expect(html).toContain("Jouw stijlrapport");
    expect(html).toContain("Jouw kleurcode");
    for (const k of COLOR_PALETTES.winter.doColors) expect(html).toContain(`>${k.name}</span>`);
  });

  it("het label 'Voorbeeld' staat er één keer, en de link gaat naar het voorbeeldrapport", () => {
    const html = render(<JeRapport />);
    expect(tel(html, ">Voorbeeld<")).toBe(1);
    expect(html).toMatch(/<a [^>]*href="\/results\/preview"[^>]*>Bekijk voorbeeld<\/a>/);
  });
});

describe("Slot", () => {
  it("wie een kamer koos, krijgt de vraag over die kleur; anders de algemene vraag", () => {
    // De kleurnaam klein midden in de zin, met een harde spatie ervoor (geen wees aan het eind van de regel).
    expect(render(<Slot wie="dames" eigenKeuze="olijfgroen" />)).toContain("Draag jij\u00a0olijfgroen?");
    expect(render(<Slot wie="heren" eigenKeuze={null} />)).toContain(">Welke kleur draag jij?</h2>");
  });

  it("een id per variant, en zonder keuze geen tweede regio met de naam van de held", () => {
    const zonder = render(<Slot wie="dames" eigenKeuze={null} />);
    expect(zonder).not.toMatch(/<section[^>]*aria-labelledby/);
    expect(tel(zonder, 'id="slot-kop"')).toBe(1);
    expect(tel(zonder, 'id="slot-kop-breed"')).toBe(1);
    expect(render(<Slot wie="dames" eigenKeuze="olijfgroen" />)).toMatch(/<section[^>]*aria-labelledby="slot-kop"/);
  });

  it("de knop naar de quiz, de plannen en het AI-label onder de grijze kamer", () => {
    const html = render(<Slot wie="dames" eigenKeuze={null} />);
    expect(html).toMatch(/<a [^>]*href="\/onboarding"[^>]*>Begin gratis<\/a>/);
    expect(html).toContain(KLEURKAMER_COPY.slot.plannen.tekst);
    expect(html).toContain(KLEURKAMER_COPY.slot.aiLabel);
  });
});

describe("Werkwijze", () => {
  it("drie stappen in een lijst, zonder de oude opname van de quiz", () => {
    const html = render(<Werkwijze />);
    expect(html.match(/<li /g)?.length).toBeGreaterThanOrEqual(3);
    expect(html).not.toMatch(/<video|OPNAME|\.mp4/);
  });
});
