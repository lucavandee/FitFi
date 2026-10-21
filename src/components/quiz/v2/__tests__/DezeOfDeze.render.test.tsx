/**
 * Het scherm "Deze of deze?" (src/components/quiz/v2/DezeOfDeze.tsx): de eerste
 * ronde staat er met twee looks die een schermlezer kan voorlezen, het
 * AI-label staat onder de beelden, en er is geen tekst onder 14 px.
 */
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DezeOfDeze } from "../DezeOfDeze";
import { RONDES, LOOKS } from "@/data/dezeOfDeze";

const leeg = () => {};

function html(geslacht: "female" | "male" | "non-binary") {
  return renderToString(<DezeOfDeze geslacht={geslacht} onKlaar={leeg} onTerugNaarVragen={leeg} />).replace(/<!-- -->/g, "");
}

describe("DezeOfDeze", () => {
  it.each(["female", "male"] as const)("%s: de eerste ronde, met de alt-tekst van beide looks", (g) => {
    const h = html(g);
    const [links, rechts] = RONDES[g][0];
    expect(h).toContain(`Linker look: ${LOOKS[links].alt}`);
    expect(h).toContain(`Rechter look: ${LOOKS[rechts].alt}`);
    expect(h).toContain(`${LOOKS[links].beeld}-480.webp 480w`);
    expect(h).toContain("Deze of deze? 1 van 7");
  });

  it("zet het AI-label onder de beelden, niet erover", () => {
    const h = html("female");
    expect(h).toContain("Beelden gemaakt met AI. De personen zijn modellen.");
    expect(h.indexOf("Beelden gemaakt met AI")).toBeGreaterThan(h.lastIndexOf("<img"));
  });

  it("biedt geen van beide, terug en overslaan, zonder tekst onder 14 px", () => {
    const h = html("non-binary");
    expect(h).toContain("Geen van beide");
    expect(h).toContain("Sla deze stap over");
    expect(h).toContain('aria-label="Terug naar de vragen"');
    expect(h).not.toMatch(/text-xs|text-\[1[0-3]px\]|font-size:\s*1[0-3]px/);
    expect(h).not.toMatch(/swipe/i);
  });
});
