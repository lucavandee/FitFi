/**
 * Geen losse tekst in de vijf secties onder de hero (plan "Onder de hero",
 * 3.10 en G22). Alle zichtbare tekst, alt-teksten en toegankelijke namen komen
 * uit src/content/landingCopy.ts of src/content/beeld.ts, waar elke zin een
 * bron heeft. Dit doet wat react/jsx-no-literals zou doen; ESLint draait in
 * deze repo niet.
 *
 * Gemeld wordt: tekst tussen JSX-tags, een string als kind ({"..."}), en een
 * string of template met tekst in alt, aria-label, title of placeholder.
 * Witruimte en leestekens alleen tellen niet.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const SECTIES = ["Gedragen", "KleurPiek", "Voorbeeldoutfit", "ZoWerktHet", "Slot"];
const BEELD = ["EigenBeeld", "Beeldlabel", "EenmaligeClip"];
const TEKST_ATTRIBUTEN = new Set(["alt", "aria-label", "title", "placeholder", "aria-roledescription", "aria-valuetext"]);

const heeftWoord = (s: string) => /\p{L}/u.test(s);

function losseTekst(pad: string): string[] {
  const bron = readFileSync(pad, "utf-8");
  const bestand = ts.createSourceFile(pad, bron, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const vondsten: string[] = [];
  const regel = (n: ts.Node) => bestand.getLineAndCharacterOfPosition(n.getStart()).line + 1;

  const bezoek = (n: ts.Node) => {
    if (ts.isJsxText(n) && heeftWoord(n.getText())) {
      vondsten.push(`regel ${regel(n)}: tekst "${n.getText().trim()}"`);
    }
    if (ts.isJsxExpression(n) && n.expression && (ts.isJsxElement(n.parent) || ts.isJsxFragment(n.parent))) {
      const e = n.expression;
      if ((ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) && heeftWoord(e.text)) {
        vondsten.push(`regel ${regel(n)}: string als kind "${e.text}"`);
      }
    }
    if (ts.isJsxAttribute(n) && TEKST_ATTRIBUTEN.has(n.name.getText())) {
      const init = n.initializer;
      let tekst = "";
      if (init && ts.isStringLiteral(init)) tekst = init.text;
      else if (init && ts.isJsxExpression(init) && init.expression) {
        const e = init.expression;
        if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) tekst = e.text;
        if (ts.isTemplateExpression(e)) tekst = [e.head.text, ...e.templateSpans.map((s) => s.literal.text)].join("");
      }
      if (heeftWoord(tekst)) vondsten.push(`regel ${regel(n)}: ${n.name.getText()}="${tekst}"`);
    }
    ts.forEachChild(n, bezoek);
  };
  bezoek(bestand);
  return vondsten;
}

describe("geen losse tekst onder de hero (G22)", () => {
  it.each(SECTIES)("sections/%s.tsx haalt zijn tekst uit het register", (naam) => {
    const pad = fileURLToPath(new URL(`../${naam}.tsx`, import.meta.url));
    expect(losseTekst(pad)).toEqual([]);
  });

  it.each(BEELD)("beeld/%s.tsx haalt zijn tekst uit beeld.ts", (naam) => {
    const pad = fileURLToPath(new URL(`../../beeld/${naam}.tsx`, import.meta.url));
    expect(losseTekst(pad)).toEqual([]);
  });

  it("de controle vindt losse tekst als die er staat", () => {
    const pad = fileURLToPath(new URL("./__fixtures__/MetLosseTekst.tsx.txt", import.meta.url));
    expect(losseTekst(pad)).toHaveLength(4);
  });
});
