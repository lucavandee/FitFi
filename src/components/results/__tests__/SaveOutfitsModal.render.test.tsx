/**
 * De bewaar-modal is de uitnodiging voor een anonieme bezoeker die de
 * resultatenpagina lijkt te verlaten.
 *
 * Aanleiding (8 oktober 2026). Op dezelfde trigger hing een tweede modal met
 * een korting die nergens bestond. Die is verwijderd, zodat deze modal de
 * enige uitnodiging is. Let op: /results staat achter RequireAuth en de
 * trigger werkt alleen zonder gebruiker, dus op dit moment bereikt geen
 * bezoeker deze modal. Wat erin staat moet kloppen voor de dag dat dat
 * verandert.
 */
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/context/UserContext", () => ({ useUser: () => ({ user: null }) }));

import { SaveOutfitsModal } from "../SaveOutfitsModal";

// React zet bij `{aantal} tekst` een <!-- --> tussen de twee stukken. Voor een
// lezer is dat één zin, dus de test leest hem ook zo.
const render = (props: { isOpen?: boolean; outfitCount?: number } = {}) =>
  renderToString(
    <MemoryRouter>
      <SaveOutfitsModal isOpen onClose={() => {}} {...props} />
    </MemoryRouter>
  ).replace(/<!-- -->/g, "");

describe("SaveOutfitsModal", () => {
  it("rendert niets zolang hij dicht is", () => {
    expect(render({ isOpen: false })).toBe("");
  });

  it("noemt het aantal outfits als de bezoeker er heeft", () => {
    expect(render({ outfitCount: 12 })).toContain("12 persoonlijke outfits");
  });

  it("zegt 'je persoonlijke outfits' als er geen aantal is, nooit '0 persoonlijke outfits'", () => {
    const html = render({ outfitCount: 0 });
    expect(html).not.toContain("0 persoonlijke");
    expect(html).toContain("je persoonlijke outfits");
  });

  it("belooft geen wekelijkse suggesties: die functie bestaat niet", () => {
    expect(render({ outfitCount: 12 })).not.toMatch(/elke week|wekelijks/i);
  });

  it("heeft een Nederlandse kop", () => {
    const html = render({ outfitCount: 12 });
    expect(html).toContain("Bewaar je outfits");
    expect(html).not.toContain("Love deze");
  });

  it("verwijst naar registratie en laat een bezoeker zonder account niet vastzitten", () => {
    const html = render({ outfitCount: 12 });
    expect(html).toContain("Maak gratis account");
    expect(html).toContain("Nee, bedankt");
    expect(html).toContain('aria-label="Sluiten"');
  });
});
