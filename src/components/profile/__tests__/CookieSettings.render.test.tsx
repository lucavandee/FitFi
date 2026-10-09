/**
 * De cookie-instellingen bieden dezelfde twee keuzes als de cookiebanner.
 *
 * Aanleiding (copy-controle fase 4, bevinding 7). De banner bood een schakelaar
 * Marketing aan, en "Alles accepteren" zette hem aan, maar hier stond die rij als
 * "Niet gebruikt" zonder knop. Wie partnermeting had aangezet, kon hem op de
 * cookiepagina en in het profiel niet meer los uitzetten.
 *
 * Server-side gerenderd: effects draaien niet, dus de voorkeuren staan op de
 * beginwaarde (alles uit).
 */
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CookieSettings } from "../CookieSettings";

const html = renderToString(
  <MemoryRouter>
    <CookieSettings />
  </MemoryRouter>,
);

describe("CookieSettings", () => {
  it("heeft een schakelaar voor analytics en een voor partnermeting", () => {
    const schakelaars = [...html.matchAll(/<button\b[^>]*role="switch"[^>]*>/g)].map((m) => m[0]);
    expect(schakelaars).toHaveLength(2);
    expect(schakelaars.some((s) => s.includes('aria-label="Analytische cookies"'))).toBe(true);
    expect(schakelaars.some((s) => s.includes('aria-label="Partnermeting"'))).toBe(true);
  });

  it("zegt wat er aan staat zonder te beloven dat er niets is", () => {
    const tekst = html.replace(/<[^>]+>/g, " ");
    expect(tekst).toContain("Analytics en partnermeting staan uit");
    expect(tekst).not.toMatch(/Niet gebruikt|Geen tracking actief/);
  });
});
