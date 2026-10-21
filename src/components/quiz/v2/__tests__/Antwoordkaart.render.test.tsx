/**
 * De antwoordkaart van de quiz (src/components/quiz/v2/Antwoordkaart.tsx):
 * geen tekst onder 14 px, aria-pressed voor de keuze, en een kleurstrook bij
 * de kleurvragen.
 */
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Antwoordkaart } from "../Antwoordkaart";
import { QUIZ_KLEURSTROKEN } from "@/data/quizKleurstroken";
import { quizSteps } from "@/data/quizSteps";

const leeg = () => {};

describe("Antwoordkaart", () => {
  it("geeft de keuze door met aria-pressed", () => {
    expect(renderToString(<Antwoordkaart label="Warm" gekozen soort="een" onKies={leeg} />)).toContain('aria-pressed="true"');
    expect(renderToString(<Antwoordkaart label="Warm" gekozen={false} soort="een" onKies={leeg} />)).toContain('aria-pressed="false"');
  });

  it("heeft geen tekst kleiner dan 14 px", () => {
    const html = renderToString(<Antwoordkaart label="Warm" toelichting="Beige, camel" gekozen={false} soort="meer" onKies={leeg} />);
    expect(html).not.toMatch(/text-xs|text-\[1[0-3]px\]|font-size:\s*1[0-3]px/);
  });

  it("toont een kleurstrook als het antwoord kleuren heeft", () => {
    const html = renderToString(
      <Antwoordkaart label="Warme tinten" gekozen={false} soort="een" kleuren={QUIZ_KLEURSTROKEN.neutrals.warm} onKies={leeg} />,
    );
    expect(html).toContain('aria-label="Kleurcode: beige, camel, olijfgroen, terracotta, bruin"');
  });
});

describe("QUIZ_KLEURSTROKEN", () => {
  it("heeft voor elk antwoord van de drie kleurvragen een strook", () => {
    for (const veld of ["neutrals", "lightness", "contrast"]) {
      const stap = quizSteps.find((s) => s.field === veld);
      expect(stap, veld).toBeDefined();
      for (const optie of stap!.options ?? []) {
        expect(QUIZ_KLEURSTROKEN[veld][optie.value], `${veld}.${optie.value}`).toBeDefined();
      }
    }
  });
});
