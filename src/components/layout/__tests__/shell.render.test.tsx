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
    expect(html).toContain("bg-white border border-[#E5E5E5]");
  });

  it("logo en elke link in de kop krijgen een zichtbare focusring", () => {
    const html = render("/", <Navbar />);
    const ring = "focus-visible:outline-[#1A1A1A]";
    for (const m of html.matchAll(/<a\b([^>]*)>/g)) {
      const attrs = m[1];
      if (/sr-only/.test(attrs)) continue; // de skiplink heeft zijn eigen stijl
      if (/bg-\[#A85740\]/.test(attrs)) continue; // 'Begin gratis' houdt de globale ring
      expect(attrs).toContain(ring);
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
  it("op / geen CTA-strook", () => {
    const html = render("/", <Footer />);
    expect(linksMetTekst(html, "Begin gratis")).toEqual([]);
    expect(html).not.toContain("Ontdek jouw stijl");
  });

  it("elders opent de CTA-strook de quiz, onder een kop in de sans", () => {
    for (const pad of ["/prijzen", "/hoe-het-werkt", "/blog"]) {
      const html = render(pad, <Footer />);
      expect(linksMetTekst(html, "Begin gratis")).toEqual(["/onboarding"]);
      expect(html).toContain("Ontdek jouw stijl");
    }
  });

  it("de kop van de CTA-strook is een h2, geen p met kopopmaak (axe p-as-heading)", () => {
    const html = render("/prijzen", <Footer />);
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
    expect(linksMetTekst(render("/prijzen", <Footer />), "Begin gratis")).toEqual([]);
  });

  it("geen serif, kapitalen, terracotta tekst, GDPR- of SSL-pil; de gewone container", () => {
    for (const pad of ["/", "/prijzen"]) {
      const html = render(pad, <Footer />);
      expect(html).not.toMatch(/font-serif|uppercase|text-\[#A85740\]/);
      expect(html).not.toMatch(/>\s*(GDPR|SSL)\s*</);
      expect(html).not.toContain("max-w-[1400px]");
      expect(html).toContain("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8");
    }
  });

  it("rendert niet tijdens de quiz", () => {
    expect(render("/onboarding", <Footer />)).toBe("");
  });
});
