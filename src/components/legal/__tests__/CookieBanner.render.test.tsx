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

  it("'Alles accepteren' en 'Alleen noodzakelijk' hebben dezelfde klassen, 44 px hoog", () => {
    const alles = knopKlassen(html, "Alles accepteren");
    const nodig = knopKlassen(html, "Alleen noodzakelijk");
    expect(alles).toBeDefined();
    expect(alles).toBe(nodig);
    expect(alles!.split(" ")).toContain("h-11");
    expect(alles).not.toMatch(/bg-\[#A85740\]/);
  });

  it("ook in de detailweergave weegt geen keuze zwaarder", () => {
    const detail = render("detail");
    expect(knopKlassen(detail, "Voorkeuren opslaan")).toBe(knopKlassen(detail, "Alleen noodzakelijk"));
    expect(detail).not.toMatch(/bg-\[#A85740\]/);
  });
});
