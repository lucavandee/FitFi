/**
 * Geen matchpercentage en geen pasvormlabel op de outfitkaarten.
 *
 * Aanleiding (keten-kritiek, 16 oktober 2026). Het percentage kwam uit
 * 20 + score x 75 met een ondergrens van 0,35, dus vrijwel elke outfit kreeg
 * 53 of 54 procent (Lucs uitslag: zeven keer 54). Het getal leek precies en
 * zei niets. Het label naast het percentage was het pasvormantwoord van de
 * bezoeker zelf ("regular"), op elke kaart hetzelfde.
 *
 * Gelezen wordt alleen tekst die een bezoeker ziet (JSX-tekst en strings).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const WORTEL = join(__dirname, "../../..");

function zichtbareTekst(pad: string): string {
  const bron = readFileSync(join(WORTEL, pad), "utf-8");
  const bestand = ts.createSourceFile(pad, bron, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const stukken: string[] = [];
  const bezoek = (n: ts.Node) => {
    if (ts.isImportDeclaration(n)) return;
    if (ts.isJsxText(n)) stukken.push(n.getText());
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) stukken.push(n.text);
    if (ts.isTemplateExpression(n)) stukken.push(n.head.text, ...n.templateSpans.map((s) => s.literal.text));
    ts.forEachChild(n, bezoek);
  };
  bezoek(bestand);
  return stukken.join(" ");
}

describe("outfitkaarten op /results", () => {
  for (const pad of ["src/pages/EnhancedResultsPage.tsx", "src/components/results/ResultsOutfitCard.tsx"]) {
    it(`${pad} toont geen matchpercentage`, () => {
      expect(zichtbareTekst(pad)).not.toMatch(/% match/i);
    });
  }

  it("de pagina zet het pasvormantwoord niet als label op een kaart", () => {
    const bron = readFileSync(join(WORTEL, "src/pages/EnhancedResultsPage.tsx"), "utf-8");
    expect(bron).not.toMatch(/fitLabel=\{answers\?\.fit/);
    expect(bron).not.toMatch(/\{answers\.fit\}/);
  });
});
