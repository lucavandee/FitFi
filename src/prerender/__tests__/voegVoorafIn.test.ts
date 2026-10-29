/**
 * Het invoegen van de vooraf getekende held (voegVoorafIn.ts) en de regels in
 * index.css die bepalen wat ervan zichtbaar is. De tweede review van 22 oktober
 * 2026 liet zien dat de opzet stuk kon zonder dat een test rood werd: held op
 * elke route, nooit, of met zichtbare tekst. Deze tests sluiten die gaten.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { INVOEGEN, LEGE_ROOT, voegVoorafIn } from "../voegVoorafIn";
import { LG, ONDER_LG } from "@/components/landing/v3/stijl";

const CSS = readFileSync(join(__dirname, "../../index.css"), "utf-8");
const KAAL = `<!doctype html><html><head></head><body>${LEGE_ROOT}<script type="module" src="/x.js"></script></body></html>`;
const HELD = '<div class="kk-vooraf"><picture><img src="/beeld/kleurkamer/kk.avif"></picture></div>';

/** Het invoeg-script uitvoeren in een nep-document; geeft terug wat er in #root kwam. */
function voerUit(klassen: string[], metTemplate = true) {
  const inRoot: unknown[] = [];
  const kloon = { gekloond: true };
  const document = {
    documentElement: { classList: { contains: (k: string) => klassen.includes(k) } },
    getElementById: (id: string) =>
      id === "kk-vooraf"
        ? metTemplate
          ? { content: { cloneNode: () => kloon } }
          : null
        : id === "root"
          ? { appendChild: (n: unknown) => inRoot.push(n) }
          : null,
  };
  runInNewContext(INVOEGEN, { document });
  return inRoot;
}

describe("voegVoorafIn", () => {
  it("zet de held in een template direct na de lege root, met het invoeg-script erachter", () => {
    const uit = voegVoorafIn(KAAL, HELD);
    expect(uit).toContain(`${LEGE_ROOT}\n    <template id="kk-vooraf">${HELD}</template>\n    <script>${INVOEGEN}</script>`);
  });

  it("buiten de template staat geen beeld: andere routes halen niets op", () => {
    const uit = voegVoorafIn(KAAL, HELD);
    const buiten = uit.replace(/<template id="kk-vooraf">[\s\S]*?<\/template>/, "");
    expect(buiten).not.toMatch(/<img|<picture|\/beeld\//);
  });

  it("zonder lege root breekt de build af in plaats van stil niets te doen", () => {
    expect(() => voegVoorafIn("<html><body><div id=\"root\">x</div></body></html>", HELD)).toThrow(/niet gevonden/);
  });
});

describe("het invoeg-script", () => {
  it("zet de held in #root als de head kk-vooraf-aan zette (op / zonder keuze)", () => {
    expect(voerUit(["kk-home", "kk-vooraf-aan"])).toEqual([{ gekloond: true }]);
  });

  it("doet niets zonder die klasse (andere routes, of / met ?kleur=)", () => {
    expect(voerUit(["kk-home"])).toEqual([]);
    expect(voerUit([])).toEqual([]);
  });

  it("doet niets en faalt niet zonder template", () => {
    expect(voerUit(["kk-vooraf-aan"], false)).toEqual([]);
  });
});

describe("dark-mode.css", () => {
  const DARK = readFileSync(join(__dirname, "../../styles/dark-mode.css"), "utf-8");
  it("de kleurovergang op elk element geldt niet op de homepage, met specificiteit 0", () => {
    expect(DARK).toMatch(/:where\(html:not\(\.kk-home\)\) \* \{\s*transition: background-color/);
    expect(DARK).not.toMatch(/^\* \{/m);
  });
});

describe("index.html: letters van de rest van de site", () => {
  const HTML = readFileSync(join(__dirname, "../../../index.html"), "utf-8");
  const thuis = HTML.slice(HTML.indexOf('if (p === "/") {'), HTML.indexOf("} else {"));
  it("op / na het laden Jakarta en de serif voorladen, met lage prioriteit en niet bij Save-Data", () => {
    expect(thuis).toContain('addEventListener("load"');
    expect(thuis).toContain('l.rel = "prefetch"');
    expect(thuis).toMatch(/saveData/);
    for (const f of ["plus-jakarta-sans-latin", "instrument-serif-italic-latin", "instrument-serif-latin"]) expect(thuis).toContain(`/fonts/${f}.`);
  });
});

describe("index.css", () => {
  /** De declaraties binnen het blok dat met deze kop begint. */
  function blok(kop: string): string {
    const i = CSS.indexOf(kop);
    expect(i, kop).toBeGreaterThanOrEqual(0);
    let diepte = 0;
    for (let j = CSS.indexOf("{", i); j < CSS.length; j++) {
      if (CSS[j] === "{") diepte++;
      if (CSS[j] === "}" && --diepte === 0) return CSS.slice(i, j + 1);
    }
    return "";
  }

  it("het blok is standaard weg en alleen met kk-vooraf-aan zichtbaar", () => {
    expect(blok(".kk-vooraf {")).toMatch(/display:\s*none/);
    expect(blok("html.kk-vooraf-aan .kk-vooraf {")).toMatch(/display:\s*block/);
  });

  it("per breedte één variant, met het exacte complement van lg", () => {
    expect(blok(`@media ${ONDER_LG} {`)).toMatch(/\.kk-vooraf-liggend\s*{\s*display:\s*none/);
    expect(blok(`@media ${LG} {\n  .kk-vooraf-staand`)).toMatch(/\.kk-vooraf-staand\s*{\s*display:\s*none/);
  });

  it("alleen foto, veld en AI-label zichtbaar; tekst komt met React", () => {
    expect(blok(".kk-vooraf section * {")).toMatch(/visibility:\s*hidden/);
    const zichtbaar = blok(".kk-vooraf figure,");
    expect(zichtbaar).toContain(".kk-vooraf figure *");
    expect(zichtbaar).toContain('.kk-vooraf [id^="kk-ai-label"]');
    expect(zichtbaar).toMatch(/visibility:\s*visible/);
  });

  it("de scrollbalk staat er vanaf de eerste verf, alleen op de homepage", () => {
    expect(blok("html.kk-home.kk-vooraf-aan {")).toMatch(/overflow-y:\s*scroll/);
  });
});
