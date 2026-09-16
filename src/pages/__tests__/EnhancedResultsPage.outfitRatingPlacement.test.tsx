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
 * een structurele (AST-)controle van de broncode via de TypeScript-compiler:
 * niet regex of ingesprongen tekst (dat is bros, precies waar de opdracht
 * voor waarschuwt), maar de echte syntaxboom, met de attribuut-expressies
 * geextraheerd op naam. Dat overleeft herformatteren, andere inspringing of
 * het verplaatsen van een regel; het overleeft NIET het hernoemen van een
 * prop of het aanroepen van een andere functie voor productIds — precies
 * het soort wijziging waar deze bewaking voor bedoeld is. Wat de AST-controle
 * bewust niet bewijst: dat de top3-plek ook echt bereikbaar is tijdens een
 * bezoek (dat is nu juist het losstaande punt hierboven).
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
// echte syntaxboom, niet in de platte tekst.
// ---------------------------------------------------------------------------
type Plek = "top3" | "grid" | "swipe" | "onbekend";

interface Vondst {
  plek: Plek;
  attrs: Record<string, string>;
}

function vindOutfitRatingButtonsPlekken(): Vondst[] {
  const pagePath = join(process.cwd(), "src/pages/EnhancedResultsPage.tsx");
  const bron = readFileSync(pagePath, "utf-8");
  const sourceFile = ts.createSourceFile(pagePath, bron, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const vondsten: Vondst[] = [];

  function bepaalPlek(node: ts.Node): Plek {
    let huidige: ts.Node | undefined = node;
    while (huidige) {
      if (ts.isJsxAttribute(huidige) && huidige.name.getText(sourceFile) === "renderCard") {
        return "swipe";
      }
      if (ts.isCallExpression(huidige)) {
        const callee = huidige.expression;
        if (ts.isPropertyAccessExpression(callee) && callee.name.getText(sourceFile) === "map") {
          const object = callee.expression.getText(sourceFile);
          if (object === "top3") return "top3";
          if (object === "occasionFilteredOutfits") return "grid";
        }
      }
      huidige = huidige.parent;
    }
    return "onbekend";
  }

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
          attrs[attr.name.getText(sourceFile)] = attr.initializer.expression.getText(sourceFile);
        }
      }
      vondsten.push({ plek: bepaalPlek(node), attrs });
    }
    ts.forEachChild(node, bezoek);
  }

  bezoek(sourceFile);
  return vondsten;
}

describe("OutfitRatingButtons — structurele aanwezigheid op alle drie de plekken", () => {
  it("komt precies drie keer voor: top3, grid en swipe", () => {
    const vondsten = vindOutfitRatingButtonsPlekken();
    const plekken = vondsten.map((v) => v.plek);

    expect(
      plekken.includes("top3"),
      `OutfitRatingButtons ontbreekt in de top3-sectie ('Jouw top outfits'). Gevonden plekken: ${plekken.join(", ") || "geen"}`
    ).toBe(true);
    expect(
      plekken.includes("grid"),
      `OutfitRatingButtons ontbreekt in de grid-weergave. Gevonden plekken: ${plekken.join(", ") || "geen"}`
    ).toBe(true);
    expect(
      plekken.includes("swipe"),
      `OutfitRatingButtons ontbreekt in de swipe-weergave (renderCard). Gevonden plekken: ${plekken.join(", ") || "geen"}`
    ).toBe(true);
    expect(
      vondsten.length,
      `verwacht precies 3 plekken, gevonden ${vondsten.length}: ${plekken.join(", ") || "geen"}`
    ).toBe(3);
  });

  it("gebruikt op alle drie de plekken dezelfde expressie voor productIds en profileHash", () => {
    const vondsten = vindOutfitRatingButtonsPlekken();
    // Als de vorige test al faalt op het aantal plekken, is een uitspraak
    // over "dezelfde bron" niet zinvol; deze test focust op de inhoud.
    if (vondsten.length !== 3) {
      throw new Error(
        `verwacht 3 plekken om te vergelijken, gevonden ${vondsten.length}; zie de vorige test voor welke ontbreekt`
      );
    }

    const productIdsBron = new Map(vondsten.map((v) => [v.plek, v.attrs.productIds]));
    const profileHashBron = new Map(vondsten.map((v) => [v.plek, v.attrs.profileHash]));

    expect(
      new Set(productIdsBron.values()).size,
      `productIds-expressie loopt uiteen tussen plekken: ${[...productIdsBron.entries()].map(([p, e]) => `${p}=${e}`).join(", ")}`
    ).toBe(1);
    expect(
      new Set(profileHashBron.values()).size,
      `profileHash-expressie loopt uiteen tussen plekken: ${[...profileHashBron.entries()].map(([p, e]) => `${p}=${e}`).join(", ")}`
    ).toBe(1);
  });
});
