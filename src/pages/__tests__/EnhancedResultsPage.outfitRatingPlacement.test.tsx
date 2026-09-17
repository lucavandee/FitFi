/**
 * Bewaking: OutfitRatingButtons ("Zou ik dragen" / "Nooit") moet op alle drie
 * de plekken van /results blijven staan (top3-sectie, grid, swipe), met
 * dezelfde bron voor productIds en profileHash op elke plek. Zonder deze test
 * kan een latere refactor van EnhancedResultsPage.tsx (een groot, veel
 * aangeraakt bestand — drie plannen raken deze pagina nog aan) een van de
 * drie plekken laten vallen, of productIdsVan tussen twee plekken laten
 * uiteenlopen, zonder dat tsc, vitest of vite build iets opmerkt: het is
 * geldige TypeScript en een geldige build, alleen wordt er stilletjes minder
 * gemeten. Dat is precies het risico waar het hele stuurcijfer op leunt (vier
 * van de zes outfits zou een bezoeker moeten dragen).
 *
 * Waarom een hybride vorm, en wat hij bewust niet dekt:
 *
 * De grid- en de swipe-weergave zijn ECHT te renderen met renderToString
 * (geen jsdom nodig, net als CalibrationStep.render.test.tsx): beide plekken
 * worden bereikt vanuit de daadwerkelijke initiele component-staat
 * (activeTab start altijd op 'outfits'; galleryMode is hier omgezet naar een
 * useState-initializer die window.innerWidth leest in plaats van pas in een
 * useEffect — zie de toelichting bij die regel in EnhancedResultsPage.tsx).
 * Voor die twee plekken toetst dit bestand dus echt gedrag: de pagina wordt
 * gerenderd, en we lezen af welke outfitId en productIds de (gemockte)
 * OutfitRatingButtons daadwerkelijk kreeg.
 *
 * De top3-sectie ("Jouw top outfits") is met de huidige code NIET op deze
 * manier te bereiken: hij zit in de JSX onder de voorwaarde
 * `!hasCompletedQuiz || activeTab === 'overzicht'`, en activeTab wordt
 * geinitialiseerd als `occasionFilter ? 'outfits' : 'outfits'` — beide
 * takken van die ternary geven letterlijk dezelfde waarde. Bij een afgeronde
 * quiz is 'overzicht' dus vanuit de initiele staat onbereikbaar, en zonder
 * jsdom kan een test geen tab-klik simuleren om er alsnog te komen. Dit is
 * een bestaand, op zichzelf staand punt (zie taak-10-report.md, sectie
 * "Zorgen" en de escalatie in de fixronde-aantekening) dat niet in deze
 * bewaking wordt opgelost. Voor de top3-plek valt deze test daarom terug op
 * een structurele (AST-)controle van de broncode via de TypeScript-compiler,
 * niet regex of ingesprongen tekst.
 *
 * Die AST-controle identificeert de gevonden plekken NIET bij naam (niet via
 * de variabele top3, niet via occasionFilteredOutfits, niet via renderCard):
 * een eerdere versie deed dat wel, en een her-review liet zien dat een pure
 * hernoeming van de lokale variabele top3 dan een misleidende melding gaf
 * ("OutfitRatingButtons ontbreekt in de top3-sectie" terwijl de plek er
 * gewoon stond). In plaats daarvan telt hij simpelweg hoeveel keer
 * `<OutfitRatingButtons />` voorkomt en vergelijkt hij de attributen tussen
 * de gevonden plekken, gerapporteerd op regelnummer in plaats van op naam.
 * Dat overleeft herformatteren, verplaatsen en hernoemen van omliggende
 * variabelen of functies. Het overleeft ook overbodige haakjes en
 * witruimteverschillen: expressies worden voor vergelijking genormaliseerd
 * door de AST te ontdoen van ParenthesizedExpression-knopen en opnieuw af te
 * drukken met de TypeScript-printer, zodat `productIdsVan(outfit)` en
 * `productIdsVan((outfit))` als gelijk gelden. Het overleeft NIET een andere
 * functie of een ander argument voor een prop — precies het soort wijziging
 * waar deze bewaking voor bedoeld is. Wat de AST-controle bewust niet
 * bewijst: dat de top3-plek ook echt bereikbaar is tijdens een bezoek (dat is
 * het losstaande punt hierboven), en zonder naam-identificatie kan hij bij
 * een ontbrekende plek niet zeggen WELKE van de drie het is — alleen hoeveel
 * er zijn en op welke regels, waarna de lezer dat zelf tegen
 * EnhancedResultsPage.tsx kan afzetten.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import ts from "typescript";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LS_KEYS } from "@/lib/quiz/types";

// ---------------------------------------------------------------------------
// Vaste testdata, gedeeld tussen de gemockte hooks (hierdoor via vi.hoisted,
// want vi.mock-fabrieken worden boven de imports gehesen) en de assertions.
// ---------------------------------------------------------------------------
const fixture = vi.hoisted(() => ({
  outfit: {
    id: "outfit-1",
    name: "Test Outfit",
    matchScore: 82,
    products: [
      { id: "prod-a", name: "Product A", imageUrl: "https://example.com/a.jpg" },
      { id: "prod-b", name: "Product B", imageUrl: "https://example.com/b.jpg" },
    ],
  },
  ratingCalls: [] as any[],
}));

// ---------------------------------------------------------------------------
// OutfitRatingButtons zelf wordt gemockt: dit bestand bewaakt of
// EnhancedResultsPage 'm op de juiste plekken met de juiste props aanroept,
// niet zijn eigen interne gedrag (dat dekt taak 9 al).
// ---------------------------------------------------------------------------
vi.mock("@/components/results/OutfitRatingButtons", () => ({
  OutfitRatingButtons: (props: any) => {
    fixture.ratingCalls.push(props);
    return null;
  },
}));

// SwipeableOutfitGallery: roept de echte renderCard-closure van de pagina aan
// met de fixture-outfit, zodat we de echte JSX van de swipe-kaart uitvoeren
// zonder de swipe-mechaniek zelf (drag, index-state) na te hoeven bouwen.
vi.mock("@/components/outfits/SwipeableOutfitGallery", () => ({
  SwipeableOutfitGallery: (props: any) => {
    const outfits = Array.isArray(props.outfits) ? props.outfits : [];
    return React.createElement(
      React.Fragment,
      null,
      outfits.map((outfit: any, i: number) =>
        React.createElement(React.Fragment, { key: i }, props.renderCard(outfit))
      )
    );
  },
}));

// Overige afhankelijkheden: gemockt omdat ze ofwel niets bijdragen aan wat
// deze test toetst (framer-motion, Helmet, toast, modals), ofwel zelf weer
// react-router-dom-hooks gebruiken die we niet allemaal willen naspelen
// (Breadcrumbs).
vi.mock("react-router-dom", () => ({
  NavLink: () => null,
  useNavigate: () => () => {},
  useSearchParams: () => [new URLSearchParams(), () => {}],
}));

vi.mock("framer-motion", () => {
  const stripFramerProps = (props: any) => {
    const {
      initial, animate, exit, transition, variants,
      whileHover, whileTap, whileInView, layout, layoutId,
      ...rest
    } = props ?? {};
    return rest;
  };
  const motionProxy = new Proxy(
    {},
    {
      get: (_target, tag) =>
        typeof tag === "string"
          ? (props: any) => React.createElement(tag, stripFramerProps(props))
          : undefined,
    }
  );
  return {
    motion: motionProxy,
    AnimatePresence: (props: any) => props.children ?? null,
    useScroll: () => ({ scrollY: { get: () => 0, on: () => () => {} } }),
    useTransform: () => 0,
  };
});

vi.mock("react-helmet-async", () => ({ Helmet: () => null }));
vi.mock("react-hot-toast", () => ({ default: { success: () => {}, error: () => {} } }));
vi.mock("@/context/UserContext", () => ({ useUser: () => ({ user: null }) }));
vi.mock("@/hooks/useExitIntent", () => ({
  useExitIntent: () => ({ shouldShow: false, dismiss: () => {} }),
}));
vi.mock("@/hooks/useMonthlyUpgrades", () => ({
  useMonthlyUpgrades: () => ({ data: 0, isLoading: false }),
}));
vi.mock("@/hooks/useOutfits", () => ({
  useOutfits: () => ({ data: [fixture.outfit], loading: false, error: null }),
}));
vi.mock("@/components/results/SaveOutfitsModal", () => ({ SaveOutfitsModal: () => null }));
vi.mock("@/components/navigation/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/results/OutfitDetailModal", () => ({ OutfitDetailModal: () => null }));
vi.mock("@/components/results/ShareModal", () => ({ ShareModal: () => null }));
vi.mock("@/components/results/ExitIntentModal", () => ({ ExitIntentModal: () => null }));
vi.mock("@/components/results/ResultsFeedbackWidget", () => ({ ResultsFeedbackWidget: () => null }));

import EnhancedResultsPage from "../EnhancedResultsPage";

// ---------------------------------------------------------------------------
// In-memory localStorage: leest de quiz-antwoorden zodat hasCompletedQuiz
// true is. De pagina leest dit in een useMemo-initializer, niet in een
// effect, dus dit werkt onder renderToString (zelfde conventie als
// CalibrationStep.render.test.tsx).
// ---------------------------------------------------------------------------
function maakOpslag(waarden: Record<string, string>): Storage {
  const data = { ...waarden };
  return {
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => { data[k] = v; },
    removeItem: (k: string) => { delete data[k]; },
    clear: () => { for (const k of Object.keys(data)) delete data[k]; },
    key: (i: number) => Object.keys(data)[i] ?? null,
    get length() { return Object.keys(data).length; },
  } as Storage;
}

const FIXTURE_ANSWERS = { gender: "female", fit: "regular" };

function renderResultsPage(vensterbreedte: number): string {
  (globalThis as any).window = { innerWidth: vensterbreedte };
  (globalThis as any).localStorage = maakOpslag({
    [LS_KEYS.QUIZ_ANSWERS]: JSON.stringify(FIXTURE_ANSWERS),
  });
  return renderToString(React.createElement(EnhancedResultsPage));
}

describe("OutfitRatingButtons — gedrag op de bereikbare plekken (grid en swipe)", () => {
  beforeEach(() => {
    fixture.ratingCalls.length = 0;
  });

  it("staat onder de outfit-kaart in de grid-weergave, met de echte outfitId en productIds", () => {
    expect(() => renderResultsPage(1024)).not.toThrow();

    expect(
      fixture.ratingCalls.length,
      "OutfitRatingButtons is niet aangeroepen in de grid-weergave (venster >= 768px, standaard-tab 'outfits')"
    ).toBe(1);

    const call = fixture.ratingCalls[0];
    expect(call.outfitId).toBe(fixture.outfit.id);
    expect(call.productIds).toEqual(fixture.outfit.products.map((p) => p.id));
  });

  it("staat in het info-blok van de swipe-kaart, met de echte outfitId en productIds", () => {
    expect(() => renderResultsPage(320)).not.toThrow();

    expect(
      fixture.ratingCalls.length,
      "OutfitRatingButtons is niet aangeroepen in de swipe-weergave (venster < 768px)"
    ).toBe(1);

    const call = fixture.ratingCalls[0];
    expect(call.outfitId).toBe(fixture.outfit.id);
    expect(call.productIds).toEqual(fixture.outfit.products.map((p) => p.id));
  });
});

// ---------------------------------------------------------------------------
// Structurele controle (AST, geen regex) voor alle drie de plekken, en met
// name voor de top3-sectie die hierboven niet gerenderd kan worden. Leest
// EnhancedResultsPage.tsx met de TypeScript-compiler (dezelfde package die
// ook tsc --noEmit draait) en zoekt elk <OutfitRatingButtons /> op in de
// echte syntaxboom, niet in de platte tekst. Identificeert bewust NIET welke
// van de drie plekken een vondst is (geen afhankelijkheid van de naam top3,
// occasionFilteredOutfits of renderCard) — zie de toelichting bovenaan dit
// bestand. Meldingen werken daarom met regelnummers, niet met plek-namen.
// ---------------------------------------------------------------------------
interface Vondst {
  /** 1-indexed regelnummer in EnhancedResultsPage.tsx, voor menselijke identificatie. */
  regel: number;
  /** attribuutnaam -> genormaliseerde (haakjes/witruimte-vrije) brontekst van de expressie. */
  attrs: Record<string, string>;
}

/**
 * Print een expressie opnieuw nadat overbodige ParenthesizedExpression-
 * knopen zijn verwijderd, en normaliseert resterende witruimte. Zo gelden
 * `productIdsVan(outfit)` en `productIdsVan((outfit))` als gelijk, terwijl
 * een echt andere functie of een ander argument nog steeds een andere
 * uitkomst geeft.
 */
function normaliseerExpressie(expr: ts.Expression, sourceFile: ts.SourceFile): string {
  const resultaat = ts.transform(expr, [
    (context: ts.TransformationContext) => {
      const visit: ts.Visitor = (node) => {
        const bezocht = ts.visitEachChild(node, visit, context);
        return ts.isParenthesizedExpression(bezocht) ? bezocht.expression : bezocht;
      };
      return (node: ts.Node) => ts.visitNode(node, visit) as ts.Node;
    },
  ]);
  try {
    const genormaliseerdeNode = resultaat.transformed[0] as ts.Expression;
    const printer = ts.createPrinter({ removeComments: true });
    const tekst = printer.printNode(ts.EmitHint.Unspecified, genormaliseerdeNode, sourceFile);
    return tekst.replace(/\s+/g, " ").trim();
  } finally {
    resultaat.dispose();
  }
}

function vindOutfitRatingButtonsPlekken(): Vondst[] {
  const pagePath = join(process.cwd(), "src/pages/EnhancedResultsPage.tsx");
  const bron = readFileSync(pagePath, "utf-8");
  const sourceFile = ts.createSourceFile(pagePath, bron, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const vondsten: Vondst[] = [];

  function bezoek(node: ts.Node) {
    const isDoelElement =
      (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
      node.tagName.getText(sourceFile) === "OutfitRatingButtons";

    if (isDoelElement) {
      const element = node as ts.JsxSelfClosingElement | ts.JsxOpeningElement;
      const attrs: Record<string, string> = {};
      for (const attr of element.attributes.properties) {
        if (
          ts.isJsxAttribute(attr) &&
          attr.initializer &&
          ts.isJsxExpression(attr.initializer) &&
          attr.initializer.expression
        ) {
          attrs[attr.name.getText(sourceFile)] = normaliseerExpressie(attr.initializer.expression, sourceFile);
        }
      }
      const regel = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
      vondsten.push({ regel, attrs });
    }
    ts.forEachChild(node, bezoek);
  }

  bezoek(sourceFile);
  return vondsten.sort((a, b) => a.regel - b.regel);
}

describe("OutfitRatingButtons — structurele aanwezigheid en propsvorm (identiteit-onafhankelijk)", () => {
  it("komt op precies drie plekken voor", () => {
    const vondsten = vindOutfitRatingButtonsPlekken();
    const regels = vondsten.map((v) => v.regel);

    expect(
      vondsten.length,
      `verwacht 3 plekken, gevonden ${vondsten.length} (regel${vondsten.length === 1 ? "" : "s"} ${regels.join(", ") || "geen"}). ` +
        `Vergelijk deze regelnummers met de top3-sectie, het grid en de swipe-kaart in EnhancedResultsPage.tsx om te zien welke ontbreekt.`
    ).toBe(3);
  });

  it("gebruikt op elke gevonden plek dezelfde attributen en dezelfde (betekenisvolle) expressies", () => {
    const vondsten = vindOutfitRatingButtonsPlekken();
    if (vondsten.length < 2) {
      throw new Error(
        `te weinig plekken gevonden om onderling te vergelijken (${vondsten.length}, regel${vondsten.length === 1 ? "" : "s"} ${
          vondsten.map((v) => v.regel).join(", ") || "geen"
        }); zie de vorige test`
      );
    }

    const referentie = vondsten[0];
    const referentieNamen = Object.keys(referentie.attrs).sort().join(", ");

    for (const vondst of vondsten.slice(1)) {
      const namen = Object.keys(vondst.attrs).sort().join(", ");
      expect(
        namen,
        `de attributen op regel ${vondst.regel} (${namen}) wijken af van regel ${referentie.regel} (${referentieNamen})`
      ).toBe(referentieNamen);
    }

    for (const naam of Object.keys(referentie.attrs)) {
      const perRegel = vondsten.map((v) => [v.regel, v.attrs[naam]] as const);
      const unieke = new Set(perRegel.map(([, expressie]) => expressie));
      expect(
        unieke.size,
        `${naam}-expressie loopt uiteen tussen plekken: ${perRegel.map(([regel, expressie]) => `regel ${regel} = ${expressie}`).join(", ")}`
      ).toBe(1);
    }
  });
});
