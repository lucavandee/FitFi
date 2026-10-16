/**
 * Wat FitFi een betalende of registrerende bezoeker belooft, moet bestaan.
 *
 * Aanleiding (16 oktober 2026, keten-kritiek). Het abonnementsoverzicht
 * beloofde premium "Nova AI-stylist (onbeperkt)", "Seizoensupdate elke maand",
 * "Gepersonaliseerde trendinsights" en "Prioriteitsondersteuning". Nova heeft
 * sinds oktober 2025 geen backend; de andere drie zijn nooit gebouwd. De
 * prijzenpagina beloofde gratis "3 outfits" en premium "onbeperkt", terwijl de
 * code 6 en 12 gaf. De Google-beschrijving noemde Nova en "een persoonlijke
 * stylist". De Founder-kaart beloofde beta-toegang en prioritaire support. Het
 * profiel liet e-mails aanzetten die niemand verstuurt.
 *
 * Gelezen wordt alleen wat een bezoeker ziet: strings, templates en tekst
 * tussen JSX-tags. Namen in de code (NovaChatProvider) en commentaar tellen
 * niet.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const WORTEL = join(__dirname, "../..");

function zichtbareTekst(pad: string): string {
  const bron = readFileSync(join(WORTEL, pad), "utf-8");
  const bestand = ts.createSourceFile(pad, bron, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const stukken: string[] = [];
  const bezoek = (n: ts.Node) => {
    if (ts.isImportDeclaration(n)) return;
    if (ts.isJsxText(n)) stukken.push(n.getText());
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) stukken.push(n.text);
    if (ts.isTemplateExpression(n)) {
      stukken.push(n.head.text, ...n.templateSpans.map((s) => s.literal.text));
    }
    ts.forEachChild(n, bezoek);
  };
  bezoek(bestand);
  return stukken.join(" ").replace(/\s+/g, " ");
}

/** Bestanden die premium, de plannen of een account aanprijzen. */
const PLANBESTANDEN = [
  "src/App.tsx",
  "src/pages/PricingPage.tsx",
  "src/components/landing/sections/PrijsGrens.tsx",
  "src/components/dashboard/SubscriptionManager.tsx",
  "src/components/results/SaveOutfitsModal.tsx",
];

const NIET_BELOVEN: Array<[RegExp, string]> = [
  [/Nova/, "Nova heeft geen backend"],
  [/onbeperkt|unlimited/i, "premium geeft een vast aantal outfits"],
  [/seizoensupdate/i, "er is geen seizoensupdate"],
  [/trendinsights/i, "er zijn geen trendinsights"],
  [/persoonlijke stylist|persoonlijk advies/i, "er is geen stylist of adviesdienst"],
  [/beta-toegang/i, "er is geen beta"],
  [/prioriteit|prioritair/i, "er is geen voorrangsondersteuning"],
  [/organiseer/i, "outfits organiseren bestaat niet"],
  [/\b3 (gepersonaliseerde )?outfit|drie outfits|drie complete sets/i, "gratis geeft het aantal uit OUTFIT_LIMIET"],
];

describe("premium en account beloven alleen wat bestaat", () => {
  for (const pad of PLANBESTANDEN) {
    const tekst = zichtbareTekst(pad);
    for (const [patroon, reden] of NIET_BELOVEN) {
      it(`${pad}: niet ${patroon} (${reden})`, () => {
        expect(tekst).not.toMatch(patroon);
      });
    }
  }

  it("de plannen halen hun aantallen uit OUTFIT_LIMIET", () => {
    for (const pad of [
      "src/App.tsx",
      "src/pages/PricingPage.tsx",
      "src/components/landing/sections/PrijsGrens.tsx",
      "src/components/dashboard/SubscriptionManager.tsx",
    ]) {
      expect(readFileSync(join(WORTEL, pad), "utf-8"), pad).toContain("OUTFIT_LIMIET");
    }
  });

  it("/results en het dashboard rekenen met dezelfde limiet", () => {
    for (const pad of ["src/pages/EnhancedResultsPage.tsx", "src/pages/DashboardPage.tsx"]) {
      expect(readFileSync(join(WORTEL, pad), "utf-8"), pad).toContain("outfitLimietVoor");
    }
  });

  it("de quiz noemt geen assistent die niet bestaat", () => {
    expect(zichtbareTekst("src/components/quiz/PhaseTransition.tsx")).not.toMatch(/Nova/);
  });

  it("het profiel laat geen e-mails aanzetten die niemand verstuurt", () => {
    expect(existsSync(join(WORTEL, "src/components/profile/EmailPreferences.tsx"))).toBe(false);
    const profiel = zichtbareTekst("src/pages/ProfilePage.tsx");
    expect(profiel).not.toMatch(/Notificaties|Outfit suggesties|Weekoverzicht/);
  });
});
