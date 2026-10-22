/**
 * De shell rond elke pagina: kop en footer (PR A2, plan fase 2, 4.6 en 5.2).
 *
 * "Begin gratis" wees in de kop en in de footer naar /registreren, terwijl
 * CLAUDE.md deel 10 "Begin gratis" vastlegt voor quiz starten, en de quiz
 * zonder account begint. Een registratiescherm als eerste stap is een drempel
 * die de hero niet heeft.
 *
 * renderToString dekt de desktopkop en de footer. Het mobiele menu rendert pas
 * na een klik (state), dus dat deel toetst de bron: in Navbar.tsx staat geen
 * link meer naar /registreren.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

const gebruiker: { user: null | { name: string } } = { user: null };

vi.mock("@/context/UserContext", () => ({
  useUser: () => ({ user: gebruiker.user, logout: vi.fn() }),
}));

import Navbar from "../Navbar";
import { zetKamerNav } from "@/components/landing/v3/kamerNav";
import Footer from "../Footer";

const render = (pad: string, element: JSX.Element) =>
  renderToString(<MemoryRouter initialEntries={[pad]}>{element}</MemoryRouter>);

/** Alle links met precies deze zichtbare tekst, met hun href. */
function linksMetTekst(html: string, tekst: string): string[] {
  const uit: string[] = [];
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const zichtbaar = m[2].replace(/<[^>]+>/g, "").replace(/<!-- -->/g, "").trim();
    if (zichtbaar !== tekst) continue;
    uit.push(m[1].match(/href="([^"]*)"/)?.[1] ?? "");
  }
  return uit;
}

afterEach(() => {
  gebruiker.user = null;
});

describe("Navbar", () => {
  it("'Begin gratis' gaat naar /onboarding", () => {
    for (const pad of ["/", "/prijzen", "/blog"]) {
      const html = render(pad, <Navbar />);
      expect(linksMetTekst(html, "Begin gratis")).toEqual(["/onboarding"]);
    }
  });

  it("bevat geen link meer naar /registreren (ook niet in het mobiele menu)", () => {
    const bron = readFileSync(join(__dirname, "../Navbar.tsx"), "utf-8");
    expect(bron).not.toContain('"/registreren"');
  });

  /*
   * Fase 4 (toegankelijkheid): op / stond de kop transparant boven de hero met
   * witte tekst op 70 procent, 1,08 tot 3,1:1 (WCAG 1.4.3), en de vijf links
   * hadden outline-none ring-0, dus geen zichtbare focus (2.4.7). Tussen 768
   * en 1023 px paste de desktopnavigatie niet: de kop werd 104 tot 125 px hoog.
   */
  it("op / vanaf het begin de dekkende kop, zonder witte tekst", () => {
    const html = render("/", <Navbar />);
    expect(html).not.toMatch(/text-white\/70|variant="light"|opacity-0/);
    // Op de homepage een platte balk op papier met een haarlijn, tekst in inkt.
    expect(html).toContain("absolute inset-0 bg-[#FAFAF8] border-b");
    expect(html).toContain("border-bottom-color:rgba(26,26,26,0.14)");
    expect(html).toContain("color:#1A1A1A");
    expect(html).not.toContain("bg-transparent");
  });

  /*
   * De kleurkamer (homepage, 22 oktober 2026): zolang de held bovenin staat,
   * is de kop transparant met tekst in de kleur van de kamer. Die kleur is per
   * kamer op contrast getoetst (content/__tests__/kleurkamers.test.ts); de
   * oude transparante kop zette wit op een wisselende foto.
   */
  it("op / boven de kleurkamer: geen pil, band en tekst in de kamerkleur, geen tweede knop", () => {
    zetKamerNav({ actief: true, tekst: "#FAFAF8", licht: true, veld: "#933126" });
    try {
      const html = render("/", <Navbar />);
      expect(html).not.toContain("bg-white border border-[#E5E5E5]");
      expect(html).toContain("color:#FAFAF8");
      expect(html).toContain("background-color:#933126");
      // De knop houdt zijn plek, maar is onzichtbaar, niet focusbaar en niet voorgelezen.
      const knop = html.match(/<a\b[^>]*href="\/onboarding"[^>]*>/)?.[0] ?? "";
      expect(knop).toContain('aria-hidden="true"');
      expect(knop).toContain('tabindex="-1"');
      expect(knop).toMatch(/\binvisible\b/);
    } finally {
      zetKamerNav(null);
    }
  });

  it("de kamerstand geldt alleen op /", () => {
    zetKamerNav({ actief: true, tekst: "#FAFAF8", licht: true, veld: "#8E2F25" });
    try {
      const html = render("/prijzen", <Navbar />);
      expect(html).toContain("bg-white border border-[#E5E5E5]");
      expect(html).not.toContain("color:#FAFAF8");
    } finally {
      zetKamerNav(null);
    }
  });

  it("logo en elke link in de kop krijgen een zichtbare focusring", () => {
    const ring = "focus-visible:outline-[#1A1A1A]";
    // Op / volgt de kleur van de ring de tekst (de kamer), dus staat die inline.
    for (const pad of ["/prijzen", "/"]) {
      const html = render(pad, <Navbar />);
      for (const m of html.matchAll(/<a\b([^>]*)>/g)) {
        const attrs = m[1];
        if (/sr-only/.test(attrs)) continue; // de skiplink heeft zijn eigen stijl
        if (/bg-\[#A85740\]/.test(attrs)) continue; // 'Begin gratis' houdt de globale ring
        if (pad === "/") {
          expect(attrs).toContain("focus-visible:outline-2");
          expect(attrs).toMatch(/focus-visible:outline-\[#1A1A1A\]|outline-color:#1A1A1A/);
        } else {
          expect(attrs).toContain(ring);
        }
      }
    }
    // Het mobiele menu rendert pas na een klik: daar de bron, zonder commentaar.
    const bron = readFileSync(join(__dirname, "../Navbar.tsx"), "utf-8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
    expect(bron).not.toMatch(/outline-none ring-0/);
    expect(bron).toMatch(/py-3 px-4 text-base rounded-xl[^`]*\$\{FOCUS\}/);
  });

  it("de desktopnavigatie begint bij lg; daaronder het menu achter de knop", () => {
    const html = render("/prijzen", <Navbar />);
    expect(html).toMatch(/<nav class="hidden lg:flex[^"]*" aria-label="Hoofdmenu"/);
    expect(html).toMatch(/<button[^>]*class="lg:hidden /);
    expect(html).not.toMatch(/\bmd:(flex|hidden)\b/);
  });
});

describe("Footer (F1 en F2)", () => {
  it("X als letter, niet als Twitter-vogeltje", () => {
    const html = render("/", <Footer />);
    expect(html).not.toContain("lucide-twitter");
    expect(html).toMatch(/<a [^>]*href="https:\/\/x\.com\/fitfi_ai"[^>]*aria-label="Volg FitFi op X"[^>]*>[\s\S]*?>X<\/span>/);
  });

  it("geen CTA-strook waar de pagina zelf al met een knop naar de quiz eindigt", () => {
    for (const pad of ["/", "/prijzen", "/hoe-het-werkt", "/veelgestelde-vragen", "/results/preview"]) {
      const html = render(pad, <Footer />);
      expect(linksMetTekst(html, "Begin gratis")).toEqual([]);
      expect(html).not.toContain("Ontdek jouw stijl");
    }
  });

  it("elders opent de CTA-strook de quiz, onder een kop in de sans", () => {
    for (const pad of ["/blog", "/over-ons", "/contact"]) {
      const html = render(pad, <Footer />);
      expect(linksMetTekst(html, "Begin gratis")).toEqual(["/onboarding"]);
      expect(html).toContain("Ontdek jouw stijl");
    }
  });

  it("de kop van de CTA-strook is een h2, geen p met kopopmaak (axe p-as-heading)", () => {
    const html = render("/blog", <Footer />);
    expect(html).toMatch(/<h2\b[^>]*>\s*Ontdek jouw stijl\s*<\/h2>/);
  });

  it("geen slogan onder het logo", () => {
    for (const pad of ["/", "/prijzen"]) {
      expect(render(pad, <Footer />)).not.toContain("afgestemd op jou");
    }
  });

  it("bij 200 procent tekst mogen kolommen krimpen en lange woorden breken", () => {
    const html = render("/", <Footer />);
    expect(html).toContain("lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]");
    expect(html).toContain("grid-cols-[repeat(auto-fit,minmax(min(100%,max(7rem,calc(50%-0.75rem))),1fr))]");
    const links = [...html.matchAll(/<a\b[^>]*class="block py-3[^"]*"/g)];
    expect(links.length).toBeGreaterThan(0);
    for (const l of links) expect(l[0]).toContain("[overflow-wrap:anywhere]");
  });

  it("geen CTA-strook voor wie ingelogd is", () => {
    gebruiker.user = { name: "Test" };
    expect(linksMetTekst(render("/blog", <Footer />), "Begin gratis")).toEqual([]);
  });

  it("geen serif, kapitalen, terracotta tekst, GDPR- of SSL-pil; de gewone container", () => {
    for (const pad of ["/", "/prijzen"]) {
      const html = render(pad, <Footer />);
      expect(html).not.toMatch(/font-serif|uppercase|text-\[#A85740\]/);
      expect(html).not.toMatch(/>\s*(GDPR|SSL)\s*</);
      expect(html).not.toContain("max-w-[1400px]");
      // Op de homepage op de linkerrand van de kleurkamer (--rand), elders de gewone container.
      expect(html).toContain(pad === "/" ? "px-[var(--rand)]" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8");
    }
  });

  it("rendert niet tijdens de quiz", () => {
    expect(render("/onboarding", <Footer />)).toBe("");
  });
});
