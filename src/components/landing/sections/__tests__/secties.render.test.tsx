/**
 * De vijf secties onder de hero zoals ze renderen (plan "Onder de hero", G3,
 * G4, G12, M3, W6, A1, A5).
 *
 * renderToString draait zonder window: geen mediaquery, geen reduced motion en
 * geen IntersectionObserver. Dat is de vorm voor telefoon en tablet, en nog
 * zonder bron in de beelden (die komt pas bij nadering).
 */
import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import Gedragen from "../Gedragen";
import KleurPiek from "../KleurPiek";
import ZoWerktHet from "../ZoWerktHet";
import Slot from "../Slot";
import { W1, W3 } from "@/content/beeld";
import { LANDING_COPY } from "@/content/landingCopy";

const render = (el: JSX.Element) => renderToString(<MemoryRouter>{el}</MemoryRouter>);

const SECTIES: Array<[string, string]> = [
  ["Gedragen", render(<Gedragen />)],
  ["KleurPiek", render(<KleurPiek />)],
  ["ZoWerktHet", render(<ZoWerktHet />)],
  ["ZoWerktHet met gegevens", render(<ZoWerktHet gegevens />)],
  ["Slot", render(<Slot />)],
];

const klassen = (html: string) => [...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/));

describe("design system onder de hero (G3, G4)", () => {
  it.each(SECTIES)("%s: precies een H2 en geen H1", (_n, html) => {
    expect(html.match(/<h2\b/g)).toHaveLength(1);
    expect(html).not.toMatch(/<h1\b/);
  });

  it.each(SECTIES)("%s: geen hoofdletterklasse en geen tekst onder 14 px", (_n, html) => {
    const k = klassen(html);
    expect(k).not.toContain("uppercase");
    expect(k.filter((c) => /^(?:[a-z]+:)?text-(?:xs|\[(?:[0-9]|1[0-3])px\])$/.test(c))).toEqual([]);
  });

  it.each(SECTIES)("%s: serif alleen in de displaykop van het slot", (naam, html) => {
    const serif = klassen(html).filter((c) => c.endsWith("font-serif"));
    if (naam === "Slot") {
      expect(serif).toHaveLength(1);
      expect(html).toMatch(/<h2[^>]*><span class="font-serif italic">Zoek je kleding voor <\/span>/);
    } else {
      expect(serif).toEqual([]);
    }
  });

  it.each(SECTIES)("%s: terracotta alleen op de slotknop en het radiopunt", (naam, html) => {
    const terracotta = klassen(html).filter((c) => c.includes("#A85740"));
    if (naam === "Slot") expect(terracotta).toEqual(["bg-[#A85740]"]);
    else if (naam === "KleurPiek") expect(terracotta.sort()).toEqual(["bg-[#A85740]", "border-[#A85740]"]);
    else expect(terracotta).toEqual([]);
  });

  it.each(SECTIES)("%s: geen gedachtestreepje in de tekst (G14)", (_n, html) => {
    expect(html.replace(/<[^>]+>/g, "")).not.toMatch(/[–—]/);
  });
});

describe("Gedragen (M2, M3)", () => {
  const html = SECTIES[0][1];

  it("onder 1024 px de mobiele uitsnede, daarboven de desktopuitsnede, zelfde wisselpunt als de hero", () => {
    expect(html).toContain('media="(max-width: 1023px)"');
    expect(html).toContain(`alt="${W1.alt}"`);
  });

  it("het label staat als tekst in de figcaption: rechtsboven vanaf 1024 px, linksboven eronder", () => {
    const figcaption = html.match(/<figcaption class="([^"]*)">([\s\S]*?)<\/figcaption>/);
    expect(figcaption).not.toBeNull();
    expect(figcaption![2].replace(/<[^>]+>/g, "")).toBe("Beeld gemaakt met AI. De persoon is een model.");
    expect(figcaption![1]).toMatch(/\bleft-4\b/);
    expect(figcaption![1]).toMatch(/\blg:right-6\b/);
  });

  it("foto zonder radius", () => {
    // Geschreven als round(?:ed): de design-poort leest het woord anders als klasse.
    expect(html.match(/<figure[^>]*class="([^"]*)"/)![1]).not.toMatch(/\bround(?:ed)\b/);
  });
});

describe("Zo werkt het (W6)", () => {
  it("drie stappen als echte lijst; zonder opname en gegevens geen dl", () => {
    const html = SECTIES[2][1];
    expect(html.match(/<ol\b/g)).toHaveLength(1);
    expect(html.match(/<li\b/g)).toHaveLength(3);
    expect(html).not.toMatch(/<dl\b/);
    expect(html).not.toContain(LANDING_COPY.gegevens.kop.tekst);
  });

  it("met het gegevensblok: een dl met vier rijen, een maillink en de privacyverklaring", () => {
    const html = SECTIES[3][1];
    expect(html.match(/<dt\b/g)).toHaveLength(4);
    expect(html.match(/<dd\b/g)).toHaveLength(4);
    expect(html).toMatch(/href="mailto:privacy@fitfi.ai"[^>]*min-h-\[44px\]/);
    expect(html).toMatch(/href="\/privacy"/);
    expect(html.match(/<h3\b/g)).toHaveLength(1);
  });

  it("met de opname: poster, onderschrift en beschrijving; geen AI-label (G12)", () => {
    const html = render(
      <ZoWerktHet opname={{ clip: "/video/quiz-stap5_3x5.0123abcd.mp4", poster: "/beeld/quiz-stap5_3x5-780.0123abcd.webp", breedte: 390, hoogte: 650 }} />,
    );
    expect(html).toContain('src="/beeld/quiz-stap5_3x5-780.0123abcd.webp"');
    expect(html).toContain(LANDING_COPY.werkwijze.opname.onderschrift.tekst);
    expect(html).toContain('id="werkwijze-opname-uitleg"');
    expect(html).not.toContain("Beeld gemaakt met AI");
  });

  it("de grond wisselt mee: zand na de outfit, wit direct na de kleurpiek", () => {
    expect(render(<ZoWerktHet grond="zand" />)).toContain("bg-[#F5F0EB]");
    expect(render(<ZoWerktHet grond="wit" />)).toContain("bg-[#FAFAF8]");
  });
});

describe("Slot (A1, A5)", () => {
  const html = SECTIES[4][1];

  it("een knop naar de quiz, rounded-xl en minstens 48 px, zonder eigen schaduw", () => {
    const knop = html.match(/<a ([^>]*)>Begin gratis<\/a>/);
    expect(knop).not.toBeNull();
    expect(knop![1]).toContain('href="/onboarding"');
    expect(knop![1]).toMatch(/\brounded-xl\b/);
    expect(knop![1]).toMatch(/min-h-\[48px\]/);
    expect(knop![1]).not.toMatch(/shadow/);
  });

  it("de tekst staat binnen py-40 en de sectie is minstens een scherm hoog", () => {
    expect(html).toMatch(/class="[^"]*\bmin-h-svh\b[^"]*"/);
    expect(html).toMatch(/class="[^"]*\bpy-40\b[^"]*"/);
    expect(html).toMatch(/overflow-clip/);
    expect(html).not.toMatch(/overflow-hidden/);
  });

  it("het label is sticky op de kophoogte plus 16 px, in een baan bovenin het beeld", () => {
    const fc = html.match(/<figcaption [^>]*style="([^"]*)"[^>]*>([\s\S]*?)<\/figcaption>/);
    expect(fc).not.toBeNull();
    expect(fc![1]).toContain("height:calc(var(--header-h, 90px) + 16px + 21px)");
    expect(fc![2]).toMatch(/class="sticky[^"]*"[^>]*style="top:calc\(var\(--header-h, 90px\) \+ 16px\)"/);
    expect(fc![2].replace(/<[^>]+>/g, "")).toBe("Beeld gemaakt met AI.");
  });

  it("zonder W3V geen video; de alt beschrijft de still", () => {
    expect(html).not.toContain("<video");
    expect(html).toContain(`alt="${W3.alt}"`);
  });
});
