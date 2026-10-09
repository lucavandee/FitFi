/**
 * De voorbeeldoutfit (plan "Onder de hero", 4.3; O1, O2, O4 tot O8).
 *
 * Het echte bestand (src/content/voorbeeldoutfit.json) komt er pas als een
 * hoofd- en een reserveoutfit alle poorten halen. Deze tests draaien daarom op
 * een nagemaakte outfit met dezelfde velden als bouw-voorbeeldoutfit.py
 * schrijft, en toetsen het echte bestand zodra het er staat.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import {
  VOLGORDE,
  VOORBEELDOUTFIT,
  fotoOmschrijving,
  kiesWeergave,
  leesVoorbeeldoutfit,
  winkelnaam,
  type Categorie,
} from "@/content/voorbeeldoutfit";
import { LANDING_COPY } from "@/content/landingCopy";
import Voorbeeldoutfit from "../Voorbeeldoutfit";

const HEX64 = "a".repeat(64);

function stuk(categorie: Categorie, nr: string, extra: Record<string, unknown> = {}) {
  return {
    productId: `00000000-0000-4000-8000-${nr.padStart(12, "0")}`,
    artikelnummer: nr,
    maat: "M",
    categorie,
    soort: categorie,
    titel: `H & M - Stuk ${nr} - Beige`,
    titelInFeed: `H & M - Stuk ${nr} - Lichtbeige`,
    kleurInFeed: "Lichtbeige",
    winkel: "H&M (NL)",
    prijsOpDieDag: 29.99,
    imageUrl: `https://image.hm.com/assets/hm/${nr}.jpg`,
    fotoSha256: HEX64,
    fotoBytes: 400_000,
    fotoPixels: [2333, 3500],
    affiliateUrl: `https://jf79.net/c/?si=17004&li=1&murl=${nr}`,
    productpagina: `https://www2.hm.com/nl_nl/productpage.${nr}.html`,
    inFeed: true,
    matenInFeed: ["S", "M", "L"],
    fotoGezien: "Effen, klopt met profiel.",
    bekekenDoor: "Luc",
    bekekenOp: "2026-10-09",
    valtAfOp: [],
    ...extra,
  };
}

function outfit(basis: string, extra: Record<string, unknown> = {}) {
  return {
    persona: "voorbeeldprofiel",
    runId: "2026-10-09T08-00-00-000Z",
    gitShaEngine: "70fb24d9c34ffc34438a927c015369c940d82ce8",
    datum: "2026-10-09T08:00:00.000Z",
    N: 6,
    index: 2,
    // Bewust in een andere volgorde dan de pagina: de lezer sorteert.
    stukken: [
      stuk("footwear", `${basis}4`),
      stuk("outerwear", `${basis}1`),
      stuk("bottom", `${basis}3`),
      stuk("top", `${basis}2`),
    ],
    ...extra,
  };
}

const COMPLEET = { status: "gekozen", hoofd: outfit("100"), reserve: outfit("200", { index: 5 }) };

describe("voorbeeldoutfit.json lezen (O1)", () => {
  it("een complete hoofd- en reserveoutfit, de stukken in de volgorde jas, trui, broek, schoenen", () => {
    const data = leesVoorbeeldoutfit(COMPLEET);
    expect(data).not.toBeNull();
    expect(data!.hoofd.stukken.map((s) => s.categorie)).toEqual([...VOLGORDE]);
    expect(data!.reserve.stukken.map((s) => s.categorie)).toEqual([...VOLGORDE]);
  });

  it.each([
    ["zonder reserve", { ...COMPLEET, reserve: null }],
    ["zonder hoofd", { ...COMPLEET, hoofd: null }],
    ["de stand van fase 3: geen kandidaat", { status: "geen kandidaat", hoofd: null, reserve: null }],
    ["drie stukken", { ...COMPLEET, hoofd: { ...outfit("100"), stukken: outfit("100").stukken.slice(0, 3) } }],
    ["twee broeken", { ...COMPLEET, hoofd: { ...outfit("100"), stukken: [stuk("bottom", "1"), stuk("top", "2"), stuk("bottom", "3"), stuk("footwear", "4")] } }],
    ["een foto over http", { ...COMPLEET, hoofd: { ...outfit("100"), stukken: [stuk("outerwear", "1", { imageUrl: "http://image.hm.com/x.jpg" }), ...outfit("100").stukken.slice(0, 3)] } }],
    ["een stuk dat in de handcontrole afviel", { ...COMPLEET, reserve: { ...outfit("200"), stukken: [stuk("outerwear", "1", { valtAfOp: ["dessin"] }), stuk("top", "2"), stuk("bottom", "3"), stuk("footwear", "4")] } }],
    ["een ander profiel", { ...COMPLEET, hoofd: outfit("100", { persona: "klassiek-man" }) }],
    ["geen N", { ...COMPLEET, hoofd: outfit("100", { N: 0 }) }],
    ["niet bekeken", { ...COMPLEET, hoofd: { ...outfit("100"), stukken: [stuk("outerwear", "1", { bekekenDoor: "" }), stuk("top", "2"), stuk("bottom", "3"), stuk("footwear", "4")] } }],
  ])("geen sectie: %s", (_n, ruw) => {
    expect(leesVoorbeeldoutfit(ruw)).toBeNull();
  });
});

describe("een foto die niet laadt (O4)", () => {
  it("eerst de hoofdoutfit, na een kapotte foto de hele reserve, daarna niets", () => {
    expect(kiesWeergave(new Set())).toBe("hoofd");
    expect(kiesWeergave(new Set(["hoofd"]))).toBe("reserve");
    expect(kiesWeergave(new Set(["reserve"]))).toBe("hoofd");
    expect(kiesWeergave(new Set(["hoofd", "reserve"]))).toBeNull();
  });
});

describe("weergave (O2, O5, O6, O7)", () => {
  const data = leesVoorbeeldoutfit(COMPLEET)!;
  const html = renderToString(
    <MemoryRouter>
      <Voorbeeldoutfit data={data} />
    </MemoryRouter>,
  );

  it("vier stukken met hun soort en winkel, in de volgorde van de pagina", () => {
    const soorten = [...html.matchAll(/<p class="mt-3 text-sm font-semibold[^"]*">([^<]+)<\/p>/g)].map((m) => m[1]);
    expect(soorten).toEqual(["Jas", "Trui", "Broek", "Schoenen"]);
    expect(html.match(/>H&amp;M<\/p>/g)).toHaveLength(4);
  });

  it("de N in de zin komt uit het bestand", () => {
    expect(html).toContain(`Een van de ${data.hoofd.N} outfits`);
  });

  it("elke partnerlink: zichtbare tekst, naam die daarmee begint, sponsored en noopener, nieuw venster, de affiliate_url", () => {
    const links = [...html.matchAll(/<a ([^>]*)>([\s\S]*?)<\/a>/g)].filter((m) => m[1].includes('target="_blank"'));
    expect(links).toHaveLength(4);
    links.forEach((m, i) => {
      const attrs = m[1];
      expect(m[2]).toContain(LANDING_COPY.outfit.partnerlink.tekst);
      expect(attrs).toMatch(/aria-label="Bekijk bij partner: [a-z]+ van H&amp;M, opent in een nieuw venster"/);
      expect(attrs).toMatch(/rel="sponsored noopener"/);
      expect(attrs).toContain(`href="${data.hoofd.stukken[i].affiliateUrl.replace(/&/g, "&amp;")}"`);
      expect(attrs).toMatch(/min-h-\[44px\]/);
    });
  });

  it("het vak heeft de verhouding van de foto, zonder uitsnede, radius of iets eroverheen", () => {
    expect(html.match(/aspect-ratio:2333 \/ 3500/g)).toHaveLength(4);
    expect(html).not.toContain("object-cover");
    const fotos = [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
    expect(fotos).toHaveLength(4);
    // round(?:ed): de design-poort leest het woord anders als klasse.
    for (const f of fotos) expect(f).not.toMatch(/\bround(?:ed)\b/);
    expect(fotos[0]).toContain('alt="Productfoto van H&amp;M: stuk 1001, lichtbeige"');
  });

  it("geen prijs en geen voorraad, wel de vergoedingsregel en een tekstlink naar de quiz", () => {
    expect(html).not.toMatch(/€|29[.,]99|voorraad/i);
    expect(html).toContain(LANDING_COPY.outfit.vergoeding.tekst);
    expect(html).toContain('href="/affiliate-disclosure"');
    expect(html).toMatch(/href="\/onboarding"[^>]*>Begin gratis/);
    expect(html).not.toMatch(/bg-\[#A85740\]/);
  });

  it("zonder bestand rendert de sectie niet", () => {
    expect(renderToString(<MemoryRouter><Voorbeeldoutfit data={null} /></MemoryRouter>)).toBe("");
  });
});

describe("hulpjes", () => {
  it("winkelnaam en foto-omschrijving", () => {
    expect(winkelnaam("H&M (NL)")).toBe("H&M");
    expect(fotoOmschrijving({ titel: "H & M - Polotrui - Beige", titelInFeed: null })).toBe("polotrui, beige");
  });
});

/** Het echte bestand, zodra het er is (O1, O3, O8). */
const PAD = fileURLToPath(new URL("../../../../content/voorbeeldoutfit.json", import.meta.url));
const BESTAAT = existsSync(PAD);

describe.runIf(BESTAAT)("src/content/voorbeeldoutfit.json", () => {
  const ruw = BESTAAT ? JSON.parse(readFileSync(PAD, "utf-8")) : null;

  it("bevat een complete hoofd- en reserveoutfit", () => {
    expect(leesVoorbeeldoutfit(ruw)).not.toBeNull();
    expect(VOORBEELDOUTFIT).not.toBeNull();
  });

  it("de vier originele foto's van een outfit wegen samen hoogstens 2,4 MB (O3)", () => {
    for (const o of [ruw.hoofd, ruw.reserve]) {
      const som = o.stukken.reduce((n: number, s: { fotoBytes?: number }) => n + (s.fotoBytes ?? Infinity), 0);
      expect(som).toBeLessThanOrEqual(2_400_000);
    }
  });

  it("elk stuk tot 50 euro, samen tot 200 euro", () => {
    for (const o of [ruw.hoofd, ruw.reserve]) {
      const prijzen = o.stukken.map((s: { prijsOpDieDag: number }) => s.prijsOpDieDag);
      for (const p of prijzen) expect(p).toBeLessThanOrEqual(50);
      expect(prijzen.reduce((a: number, b: number) => a + b, 0)).toBeLessThanOrEqual(200);
    }
  });
});

describe.runIf(!BESTAAT)("zonder voorbeeldoutfit.json", () => {
  it("is er geen outfit, dus geen sectie", () => {
    expect(VOORBEELDOUTFIT).toBeNull();
  });
});
