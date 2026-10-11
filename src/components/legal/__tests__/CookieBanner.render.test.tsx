/**
 * De vaste vorm van de cookiebanner (plan fase 2, G19).
 *
 * Gemeten op 8 oktober 2026, voor deze wijziging: de laag van de volle breedte
 * ving op zes desktopmaten de klik op "Begin gratis" in de hero op, droeg
 * aria-modal="true", en "Alles accepteren" was terracotta naast een lichtere
 * "Alleen noodzakelijk".
 *
 * Het moment van verschijnen (op / pas na de halve hero) en de echte klik door
 * de laag heen toetst Playwright op een build; die zitten in effecten, en
 * renderToString draait geen effecten. Hier staat wat statisch vast moet
 * liggen.
 */
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CookieBannerKaart } from "../CookieBanner";
import { KORT } from "../cookieBannerRegels";

const leeg = () => {};
const render = (view: "simple" | "detail") =>
  renderToString(
    <CookieBannerKaart
      view={view}
      analytics={false}
      marketing={false}
      onView={leeg}
      onAnalytics={leeg}
      onMarketing={leeg}
      onAcceptAll={leeg}
      onRejectAll={leeg}
      onSaveCustom={leeg}
    />,
  );

function knopKlassen(html: string, tekst: string): string | undefined {
  for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    if (m[2].replace(/<[^>]+>/g, "").trim() === tekst) return m[1].match(/class="([^"]*)"/)?.[1];
  }
  return undefined;
}

describe("CookieBannerKaart", () => {
  const html = render("simple");

  it("de vaste laag laat klikken door, de kaart vangt ze", () => {
    const laag = html.match(/^<div\b[^>]*class="([^"]*)"/)?.[1] ?? "";
    expect(laag.split(" ")).toEqual(expect.arrayContaining(["fixed", "pointer-events-none"]));
    const kaart = html.match(/<section\b[^>]*class="([^"]*)"/)?.[1] ?? "";
    expect(kaart.split(" ")).toEqual(expect.arrayContaining(["pointer-events-auto", "max-w-sm"]));
  });

  it("is geen modale dialoog maar een regio met een naam", () => {
    expect(html).not.toContain("aria-modal");
    expect(html).not.toContain('role="dialog"');
    expect(html).toMatch(/<section\b[^>]*aria-label="Cookievoorkeuren"/);
  });

  it("'Alles accepteren' en 'Alleen noodzakelijk' hebben dezelfde klassen, minstens 44 px hoog", () => {
    const alles = knopKlassen(html, "Alles accepteren");
    const nodig = knopKlassen(html, "Alleen noodzakelijk");
    expect(alles).toBeDefined();
    expect(alles).toBe(nodig);
    expect(alles!.split(" ")).toContain("min-h-11");
    expect(alles).not.toMatch(/bg-\[#A85740\]/);
  });

  it("ook in de detailweergave weegt geen keuze zwaarder", () => {
    const detail = render("detail");
    expect(knopKlassen(detail, "Voorkeuren opslaan")).toBe(knopKlassen(detail, "Alleen noodzakelijk"));
    expect(detail).not.toMatch(/bg-\[#A85740\]/);
  });
});

/*
 * Fase 4 (toegankelijkheid, 9 oktober 2026): bij 150 procent tekst op 390 breed
 * liepen de twee keuzeknoppen over elkaar en buiten de kaart, op 320 breed paste
 * 'Alleen noodzakelijk' al bij gewone tekst niet, en de kaart had geen
 * maximale hoogte: bij 400 procent zoom viel 'Aanpassen' buiten beeld. Dat
 * gedrag zelf meet Playwright (fase3/r2/scripts); hier de klassen die het
 * dragen, zodat een latere opschoning ze niet stil weghaalt.
 */
describe("CookieBannerKaart bij grote tekst en kleine vensters", () => {
  const simpel = render("simple");
  const detail = render("detail");
  const kaart = (html: string) => (html.match(/<section\b[^>]*class="([^"]*)"/)?.[1] ?? "").split(" ");

  it("de knoptekst mag op twee regels: geen vaste hoogte, geen nowrap", () => {
    for (const [html, tekst] of [[simpel, "Alles accepteren"], [simpel, "Alleen noodzakelijk"], [detail, "Voorkeuren opslaan"]]) {
      const k = knopKlassen(html, tekst)!.split(" ");
      expect(k).not.toContain("whitespace-nowrap");
      expect(k).not.toContain("h-11");
    }
  });

  it("de knoppen staan naast elkaar als ze passen, anders onder elkaar", () => {
    for (const html of [simpel, detail]) {
      expect(html).toContain("grid-cols-[repeat(auto-fit,minmax(min(100%,9.5rem),1fr))]");
    }
  });

  it("de kaart is nooit hoger dan het venster en scrolt dan zelf; de keuzes plakken onderin", () => {
    for (const html of [simpel, detail]) {
      expect(kaart(html)).toEqual(expect.arrayContaining(["overflow-y-auto", "max-h-[calc(100svh-var(--onderbalk-h,0px)-1.5rem)]"]));
      expect(html).toMatch(/class="sticky bottom-0 /);
    }
  });

  it("een muiswiel boven de kaart scrolt de pagina: geen overscroll-contain", () => {
    // Met overscroll-contain op een kaart zonder overloop scrolde Chrome de
    // pagina niet meer (gemeten op 1024, 1279, 1280 en 1440 breed; WebKit wel).
    expect(kaart(simpel)).not.toContain("overscroll-contain");
  });

  it("320 px breed tot 1280 px, daarboven 384, mobiel de volle strook", () => {
    expect(kaart(simpel)).toEqual(expect.arrayContaining(["w-full", "max-w-sm", "md:max-w-xs", "xl:max-w-sm"]));
  });

  it("in een heel laag venster staat de banner in de pagina, met dezelfde grens als KORT", () => {
    const grens = KORT.replace(/\s+/g, "");
    expect(grens).toBe("(max-height:300px)");
    const laag = (simpel.match(/^<div\b[^>]*class="([^"]*)"/)?.[1] ?? "").split(" ");
    expect(laag).toContain(`[@media${grens}]:static`);
    expect(kaart(simpel)).toEqual(expect.arrayContaining([`[@media${grens}]:max-h-none`, `[@media${grens}]:overflow-visible`]));
    expect(simpel).toContain(`[@media${grens}]:static grid`);
  });

  it("de uitleg in de detailweergave staat op 14 px, niet op 12", () => {
    expect(detail).not.toMatch(/\btext-xs\b/);
    expect(detail).toContain("(altijd aan)");
  });
});
