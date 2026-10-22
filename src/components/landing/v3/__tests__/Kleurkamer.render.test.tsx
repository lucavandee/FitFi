/**
 * De held van de homepage (kleurkamer): wat een schermlezer en de cookiebanner
 * erin moeten vinden, en dat de wissel van kamer de juiste namen en kleuren geeft.
 */
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Kleurkamer from "../Kleurkamer";
import type { KleurkamerStand } from "../useKleurkamer";
import { HERO_SELECTOR } from "@/components/legal/cookieBannerRegels";
import type { KamerSleutel, Wie } from "@/content/kleurkamers";

function stand(kamer: KamerSleutel, wie: Wie = "dames"): KleurkamerStand {
  return { kamer, wie, eigenKeuze: null, bewegingUit: false, kies: vi.fn(), kiesWie: vi.fn(), zetBeweging: vi.fn() };
}
const render = (s: KleurkamerStand) =>
  renderToString(
    <MemoryRouter>
      <Kleurkamer stand={s} />
    </MemoryRouter>,
  );

describe("Kleurkamer", () => {
  it("is de held die de cookiebanner zoekt, met de kop als naam", () => {
    const html = render(stand("dieprood"));
    expect(HERO_SELECTOR).toBe('section[aria-labelledby="hero-heading"]');
    expect(html).toContain('aria-labelledby="hero-heading"');
    expect(html).toMatch(/<h1 id="hero-heading"[^>]*>Welke kleur<br\/>draag jij\?<\/h1>/);
  });

  it("zes stalen in een radiogroep; de actieve kamer is aangevinkt en heeft de focus", () => {
    const html = render(stand("dieprood"));
    expect(html).toContain('role="radiogroup" aria-label="Kleur van de kamer"');
    expect(html.match(/role="radio"/g)?.length).toBe(8); // zes stalen en Dames · Heren
    expect(html).toMatch(/role="radio" aria-checked="true" aria-label="Diep rood, uit het winterpalet" tabindex="0"/);
    expect(html.match(/aria-label="[^"]+, uit het (winter|zomer|lente|herfst)palet" tabindex="-1"/g)?.length).toBe(5);
  });

  it("het veld en de tekst volgen de kamer: papier op donker, inkt op licht, wit op olijf", () => {
    expect(render(stand("dieprood"))).toMatch(/background-color:#933126;color:#FAFAF8/);
    expect(render(stand("softblauw", "heren"))).toMatch(/background-color:#85C1E1;color:#1A1A1A/);
    expect(render(stand("olijfgroen"))).toMatch(/background-color:#6D7A45;color:#FFFFFF/);
  });

  it("de still beschrijft wat je ziet, met het AI-label als beschrijving", () => {
    const html = render(stand("olijfgroen", "heren"));
    expect(html).toContain("Man met kort haar in een antraciet overjas en broek met een olijfgroene trui");
    expect(html).toContain('aria-describedby="kk-ai-label"');
    expect(html).toContain('id="kk-ai-label"');
    expect(html).toContain("Beeld gemaakt met AI. De persoon is een model.");
  });

  it("de knop is 'Begin gratis' naar de quiz", () => {
    expect(render(stand("chocolade"))).toMatch(/<a [^>]*href="\/onboarding"[^>]*>Begin gratis<\/a>/);
  });
});
