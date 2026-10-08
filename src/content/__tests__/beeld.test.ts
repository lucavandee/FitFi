/**
 * Eigen beeld onder de hero (plan "Onder de hero", 3.6, 3.8, 3.9; G13, M4,
 * K10, A4).
 *
 * Elk bestand staat in public/beeld/ of public/video/, de naam draagt de
 * verhouding en de eerste acht tekens van de sha256, en elk gegenereerd beeld
 * draagt in XMP de herkomst (trainedAlgorithmicMedia) en zijn Higgsfield-job.
 * Een beeld dat stilletjes vervangen wordt zonder nieuwe naam blijft door de
 * immutable-cache een jaar oud bij bezoekers; een beeld zonder herkomst valt
 * buiten wat de AI-labels beloven.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { LABEL, W1, W2, W3, type BeeldBestand, type Beeldset } from "../beeld";

const inPublic = (pad: string) => fileURLToPath(new URL(`../../../public${pad}`, import.meta.url));
const KB = 1024;

const SETS: Array<[string, Beeldset, string]> = [
  ["W1 desktop", W1.desktop, "4x5"],
  ["W1 mobiel", W1.mobiel, "4x5"],
  ["W2", W2.set, "4x5"],
  ["W3 desktop", W3.desktop, "16x9"],
  ["W3 mobiel", W3.mobiel, "9x16"],
  ["W3 clipstart", W3.clipstart, "16x9"],
];

const NAAM = /^\/beeld\/[a-z0-9-]+_(\d+)x(\d+)-(\d+)\.([0-9a-f]{8})\.(avif|webp)$/;

describe.each(SETS)("%s", (_naam, set, verhouding) => {
  const bestanden: Array<[string, BeeldBestand, "avif" | "webp"]> = [
    ...set.avif.map((b): [string, BeeldBestand, "avif"] => [b.pad, b, "avif"]),
    ...set.webp.map((b): [string, BeeldBestand, "webp"] => [b.pad, b, "webp"]),
  ];

  it("AVIF en WebP in dezelfde breedtes, smal naar breed", () => {
    expect(set.avif.map((b) => b.breedte)).toEqual(set.webp.map((b) => b.breedte));
    const breedtes = set.avif.map((b) => b.breedte);
    expect([...breedtes].sort((a, b) => a - b)).toEqual(breedtes);
  });

  it("heeft een job-ID en een mediaankleur", () => {
    expect(set.jobId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(set.mediaankleur).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it.each(bestanden)("%s: naam, hash, maat en herkomst", (pad, b, soort) => {
    const m = pad.match(NAAM);
    expect(m, "naam volgt <onderwerp>_<verhouding>-<breedte>.<hash8>.<ext>").not.toBeNull();
    const [, vb, vh, breedte, hash, ext] = m!;
    expect(`${vb}x${vh}`).toBe(verhouding);
    expect(Number(breedte)).toBe(b.breedte);
    expect(ext).toBe(soort);
    // Verhouding van de opgegeven maat, op een pixel na (afronding bij 9:16 en 16:9).
    expect(Math.abs(b.hoogte - (b.breedte * Number(vh)) / Number(vb))).toBeLessThanOrEqual(1);

    const bestand = inPublic(pad);
    expect(existsSync(bestand), `${pad} ontbreekt in public/`).toBe(true);
    const inhoud = readFileSync(bestand);
    expect(createHash("sha256").update(inhoud).digest("hex").slice(0, 8)).toBe(hash);
    const tekst = inhoud.toString("latin1");
    expect(tekst).toContain("trainedAlgorithmicMedia");
    expect(tekst).toContain(`Higgsfield job ${set.jobId}`);
  });
});

/** Plafonds uit plan 3.8 (M4, K10 en de W3-rij). */
describe("gewicht", () => {
  const grootte = (pad: string) => statSync(inPublic(pad)).size;
  const bij = (lijst: readonly BeeldBestand[], breedte: number) => {
    const b = lijst.find((x) => x.breedte === breedte);
    expect(b, `geen bestand van ${breedte} breed`).toBeDefined();
    return grootte(b!.pad);
  };

  it("W1: AVIF 1440 hoogstens 250 KB, WebP 320 KB; mobiel AVIF 780 hoogstens 110 KB, WebP 140 KB", () => {
    expect(bij(W1.desktop.avif, 1440)).toBeLessThanOrEqual(250 * KB);
    expect(bij(W1.desktop.webp, 1440)).toBeLessThanOrEqual(320 * KB);
    expect(bij(W1.mobiel.avif, 780)).toBeLessThanOrEqual(110 * KB);
    expect(bij(W1.mobiel.webp, 780)).toBeLessThanOrEqual(140 * KB);
  });

  it("W2: AVIF 1440 hoogstens 250 KB, 1728 hoogstens 330 KB, 780 hoogstens 110 KB", () => {
    expect(bij(W2.set.avif, 1440)).toBeLessThanOrEqual(250 * KB);
    expect(bij(W2.set.avif, 1728)).toBeLessThanOrEqual(330 * KB);
    expect(bij(W2.set.avif, 780)).toBeLessThanOrEqual(110 * KB);
  });

  it("W3: AVIF 2560 hoogstens 300 KB, mobiel (9:16) AVIF 780 hoogstens 140 KB", () => {
    expect(bij(W3.desktop.avif, 2560)).toBeLessThanOrEqual(300 * KB);
    expect(bij(W3.mobiel.avif, 780)).toBeLessThanOrEqual(140 * KB);
  });
});

/** W3V: een keer, hoogstens vijf seconden, met de herkomstmarkering van Kling (A4). */
describe("W3V, de avondclip", () => {
  const pad = W3.clip.pad;
  const inhoud = () => readFileSync(inPublic(pad));

  /** Duur in seconden uit de mvhd-box onder moov. */
  function mp4Duur(data: Buffer): number {
    for (let i = 0; i + 8 <= data.length; ) {
      const lengte = data.readUInt32BE(i);
      if (lengte < 8) break;
      if (data.toString("latin1", i + 4, i + 8) === "moov") {
        for (let j = i + 8; j + 8 <= i + lengte; ) {
          const kind = data.readUInt32BE(j);
          if (kind < 8) break;
          if (data.toString("latin1", j + 4, j + 8) === "mvhd") {
            if (data.readUInt8(j + 8) === 1) return Number(data.readBigUInt64BE(j + 32)) / data.readUInt32BE(j + 28);
            return data.readUInt32BE(j + 24) / data.readUInt32BE(j + 20);
          }
          j += kind;
        }
      }
      i += lengte;
    }
    throw new Error("geen mvhd-box gevonden");
  }

  it("staat onder /video/ met de hash van de inhoud in de naam, hoogstens 2,5 MB", () => {
    const m = pad.match(/^\/video\/[a-z0-9-]+_16x9\.([0-9a-f]{8})\.mp4$/);
    expect(m).not.toBeNull();
    expect(createHash("sha256").update(inhoud()).digest("hex").slice(0, 8)).toBe(m![1]);
    expect(inhoud().length).toBeLessThanOrEqual(2.5 * 1024 * 1024);
  });

  it("duurt hoogstens vijf seconden", () => {
    expect(mp4Duur(inhoud())).toBeLessThanOrEqual(5);
  });

  it("draagt de AIGC-herkomstmarkering van Kling", () => {
    expect(inhoud().toString("latin1")).toMatch(/"Label":"1","ContentProducer":"kling","ProduceID":"KLingMuse_[0-9a-f-]{36}"/);
  });

  it("alleen vanaf 1024 px", () => {
    expect(W3.clip.breekpunt).toBe("(min-width: 1024px)");
  });
});

describe("labels (plan 3.6)", () => {
  it("een mens in beeld krijgt de tweede zin, een plek niet", () => {
    expect(W1.label).toEqual(LABEL.mens);
    expect(LABEL.mens.join(" ")).toBe("Beeld gemaakt met AI. De persoon is een model.");
    expect(W2.label).toEqual(LABEL.plek);
    expect(W3.label).toEqual(LABEL.plek);
    expect(LABEL.plek.join(" ")).toBe("Beeld gemaakt met AI.");
  });

  it("geen gedachtestreepje in alt of label", () => {
    for (const t of [W1.alt, W2.alt, W3.alt, ...LABEL.mens, ...LABEL.plek]) expect(t).not.toMatch(/[–—]/);
  });

  it("W1 rechtsboven vanaf 1024 px en linksboven eronder; W2 en W3 linksboven", () => {
    expect(W1.labelHoek).toEqual({ vanafLg: "rechtsboven", onderLg: "linksboven" });
    expect(W2.labelHoek).toBe("linksboven");
    expect(W3.labelHoek).toBe("linksboven");
  });

  it("de verlopen voor de labels blijven op hoogstens 0,7 dekking (plan 3.6)", () => {
    const verlopen = [W1.verloop.vanafLg, W1.verloop.onderLg, W2.verloop, W3.verloop.onderMd];
    for (const v of verlopen) {
      for (const [, a] of v.matchAll(/rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/g)) expect(Number(a)).toBeLessThanOrEqual(0.7);
    }
  });

  it("het slot heeft het verloop van de hero, plus een band bovenin voor het label", () => {
    const landing = readFileSync(fileURLToPath(new URL("../../pages/LandingPage.tsx", import.meta.url)), "utf-8");
    const [rechts, onder, boven] = W3.verloop.basis.split(/,\s*(?=linear-gradient)/);
    expect(landing).toContain(`${rechts}, ${onder}`);
    expect(boven).toBe("linear-gradient(to bottom, rgba(20,18,15,0.5) 0%, transparent 25%)");
  });
});
