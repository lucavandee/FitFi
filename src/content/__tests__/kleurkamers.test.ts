/**
 * De kleurkamer op de homepage (22 oktober 2026): kleuren, contrast, bestanden,
 * producten en teksten. Zie src/content/kleurkamers.ts.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { COLOR_PALETTES } from "@/data/colorPalettes";
import { quizSteps } from "@/data/quizSteps";
import { AANTAL_RONDES, RONDES } from "@/data/dezeOfDeze";
import {
  GRIJZE_KAMER,
  INKT,
  KAMERS,
  KLEURKAMER_COPY,
  START_KAMER,
  kamerBeeld,
  kamerFilm,
  tekstKleur,
  type Wie,
} from "@/content/kleurkamers";
import { KLEURKAMER_PRODUCTEN } from "@/content/kleurkamerProducten";
import { SIZES_LIGGEND, SIZES_STAAND } from "@/components/landing/v3/Kleurkamer";

const ROOT = join(__dirname, "../../../");
const WIE: Wie[] = ["dames", "heren"];

function kanaal(c: number) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
function luminantie(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => kanaal(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string) {
  const [x, y] = [luminantie(a), luminantie(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

describe("kamers", () => {
  it("zes kamers, van koel naar warm, uit vier paletten", () => {
    expect(KAMERS).toHaveLength(6);
    const kant = KAMERS.map((k) => k.kant);
    expect(kant.indexOf("warm")).toBeGreaterThan(kant.lastIndexOf("koel"));
    expect(new Set(KAMERS.map((k) => k.seizoen)).size).toBe(4);
    expect(KAMERS.some((k) => k.sleutel === START_KAMER)).toBe(true);
  });

  it("elke staal staat met dezelfde naam en hex in zijn palet", () => {
    for (const k of KAMERS) {
      const palet = COLOR_PALETTES[k.seizoen];
      const alle = [...palet.colors, ...palet.doColors];
      expect(alle.some((c) => c.name === k.naam && c.hex.toUpperCase() === k.hex.toUpperCase()), `${k.naam} in ${k.seizoen}`).toBe(true);
    }
  });

  it("tekst op het gemeten veld haalt 4,5:1, per kamer en per persoon", () => {
    for (const k of KAMERS) {
      for (const w of WIE) {
        expect(contrast(tekstKleur(k), k.veld[w]), `${k.naam} ${w}`).toBeGreaterThanOrEqual(4.5);
      }
    }
    for (const w of WIE) expect(contrast(INKT, GRIJZE_KAMER.veld[w]), `grijs ${w}`).toBeGreaterThanOrEqual(4.5);
  });
});

describe("bestanden", () => {
  it("elke kamer heeft een liggende en staande still per persoon, in AVIF en WebP, en ze bestaan", () => {
    for (const sleutel of [...KAMERS.map((k) => k.sleutel), "grijs" as const]) {
      for (const w of WIE) {
        for (const staand of [false, true]) {
          const bron = kamerBeeld(sleutel, w, staand);
          const paden = [...Object.values(bron.avif), ...Object.values(bron.webp)];
          expect(paden.length).toBeGreaterThanOrEqual(6);
          for (const p of paden) expect(existsSync(join(ROOT, "public", p)), p).toBe(true);
        }
      }
    }
  });

  it("elke kamer heeft een clip per persoon en per oriëntatie, en die bestaat", () => {
    for (const k of KAMERS) {
      for (const w of WIE) {
        for (const staand of [false, true]) {
          const film = kamerFilm(k.sleutel, w, staand);
          expect(film, `${k.sleutel} ${w} ${staand}`).toBeTruthy();
          expect(existsSync(join(ROOT, "public", film!)), film).toBe(true);
        }
      }
    }
  });

  /*
   * Met de BT.709-overdracht van de bron toonden Chrome en Safari de clips
   * ongeveer 10 niveaus lichter dan de still: een lichte doos rond het model en
   * wit op olijf onder 4,5:1. Met sRGB (13) in het colr-atoom valt de muur in
   * beide samen met de still (gemeten 22 oktober 2026). Ook de AIGC-tag van de
   * bron moet erin blijven (Higgsfield-voorwaarde 5.5).
   */
  it("elke clip draagt sRGB als overdracht in het colr-atoom, en de AIGC-tag", () => {
    const map = join(ROOT, "public/video/kleurkamer");
    const clips = readdirSync(map).filter((f) => f.endsWith(".mp4"));
    expect(clips.length).toBe(24);
    for (const f of clips) {
      const data = readFileSync(join(map, f));
      const i = data.indexOf("colrnclx");
      expect(i, `${f}: colr`).toBeGreaterThan(0);
      const [primaries, overdracht, matrix] = [0, 2, 4].map((d) => data.readUInt16BE(i + 8 + d));
      expect({ f, primaries, overdracht, matrix }).toEqual({ f, primaries: 1, overdracht: 13, matrix: 1 });
      expect(data.indexOf("AIGC"), `${f}: AIGC`).toBeGreaterThan(0);
    }
  });

  it("index.html: op / de klasse kk-home en Archivo vooraf, Jakarta alleen elders", () => {
    const html = readFileSync(join(ROOT, "index.html"), "utf-8");
    const thuis = html.slice(html.indexOf('if (p === "/") {'), html.indexOf("} else {"));
    const elders = html.slice(html.indexOf("} else {"), html.indexOf("})();"));
    expect(thuis).toContain('classList.add("kk-home")');
    expect(thuis).toContain("archivo-latin");
    // geen preload op hoge prioriteit; voorladen na het load-event (prefetch) mag wel
    expect(thuis).not.toMatch(/pre\(\{[^}]*plus-jakarta/);
    expect(elders).toContain("plus-jakarta-sans-latin");
    expect(html.replace(/<script>[\s\S]*?<\/script>/g, "")).not.toMatch(/rel="preload"[^>]*plus-jakarta/);
  });

  it("index.html laadt precies het startbeeld vooraf, met dezelfde sizes als de held", () => {
    const html = readFileSync(join(ROOT, "index.html"), "utf-8");
    const staand = kamerBeeld(START_KAMER, "dames", true);
    const liggend = kamerBeeld(START_KAMER, "dames", false);
    for (const p of [...Object.values(staand.avif), ...Object.values(liggend.avif)]) expect(html).toContain(p);
    expect(html).toContain(`imagesizes: "${SIZES_STAAND}"`);
    expect(html).toContain(`imagesizes: "${SIZES_LIGGEND}"`);
  });
});

describe("in de winkel", () => {
  /*
   * Een rij met minder dan drie stukken blijft weg (InDeWinkel). Warm
   * terracotta heeft er op 22 oktober geen: in de catalogus stonden geen drie
   * stukken die echt die kleur hebben. Liever geen rij dan een rij in een
   * andere kleur; vijf van de zes kamers moeten er wel een hebben.
   */
  it("elke rij heeft nul of minstens drie stukken, met prijs, beeld en partnerlink", () => {
    for (const k of KAMERS) {
      for (const w of WIE) {
        const stukken = KLEURKAMER_PRODUCTEN[k.sleutel][w];
        expect(stukken.length === 0 || stukken.length >= 3, `${k.sleutel} ${w}: ${stukken.length}`).toBe(true);
        for (const s of stukken) {
          expect(s.prijs).toBeGreaterThan(0);
          expect(s.beeld).toMatch(/^https:\/\//);
          expect(s.link).toMatch(/^https:\/\//);
        }
      }
    }
  });

  it("minstens vijf van de zes kamers hebben een winkelrij, voor dames en voor heren", () => {
    for (const w of WIE) {
      expect(KAMERS.filter((k) => KLEURKAMER_PRODUCTEN[k.sleutel][w].length >= 3).length, w).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("teksten", () => {
  const zinnen = [
    KLEURKAMER_COPY.held.kopBron,
    KLEURKAMER_COPY.held.onderregel,
    KLEURKAMER_COPY.kamers.tekst,
    KLEURKAMER_COPY.rapport.tekst,
    KLEURKAMER_COPY.slot.tekst,
    KLEURKAMER_COPY.slot.plannen,
  ];

  it("elke bewering rust op een bestand dat de zoektekst nog bevat, of op data die klopt", () => {
    for (const z of zinnen) {
      for (const b of z.bronnen) {
        if ("bestand" in b) {
          expect(readFileSync(join(ROOT, b.bestand), "utf-8"), `${b.bestand}: ${b.zoek}`).toContain(b.zoek);
        } else if ("data" in b && b.data === "aantalStappen") {
          expect(quizSteps.length).toBe(b.waarde);
          expect(z.tekst).toContain(b.inTekst);
        } else if ("data" in b && b.data === "rondesDezeOfDeze") {
          expect(AANTAL_RONDES).toBe(b.waarde);
          expect(RONDES.female).toHaveLength(b.waarde);
          expect(RONDES.male).toHaveLength(b.waarde);
          expect(z.tekst).toContain(b.inTekst);
        } else {
          throw new Error(`onbekende bron: ${JSON.stringify(b)}`);
        }
      }
    }
  });

  it("geen gedachtestreepjes", () => {
    const alles = JSON.stringify(KLEURKAMER_COPY);
    expect(alles).not.toMatch(/[—–]/);
  });
});
