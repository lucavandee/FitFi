/**
 * De held die bij de build vooraf in index.html komt (plugins/kleurkamer-vooraf.ts).
 * Wat moet kloppen: per breedte haalt alleen de juiste variant een foto op, en
 * precies het bestand dat de preload in index.html al haalt (zelfde srcset en
 * sizes), anders is de winst weg.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderVoorafHeld } from "../kleurkamerVooraf";
import { SIZES_LIGGEND, SIZES_STAAND } from "@/components/landing/v3/Kleurkamer";
import { LG, ONDER_LG } from "@/components/landing/v3/stijl";

const HTML = readFileSync(join(__dirname, "../../../index.html"), "utf-8");
const vooraf = renderVoorafHeld();
const [, staand = "", liggend = ""] = vooraf.split(/<div class="kk-vooraf-(?:staand|liggend)">/);

function preload(media: string) {
  const regel = HTML.split("\n").find((r) => r.includes(`media: "${media}"`)) ?? "";
  const volgende = HTML.split("\n")[HTML.split("\n").indexOf(regel) + 1] ?? "";
  return {
    sizes: regel.match(/imagesizes: "([^"]+)"/)?.[1],
    srcset: volgende.match(/imagesrcset: "([^"]+)"/)?.[1],
  };
}

function avifBron(variant: string) {
  const m = variant.match(/<source type="image\/avif" srcSet="([^"]+)" sizes="([^"]+)"/);
  return { srcset: m?.[1], sizes: m?.[2] };
}

describe("de vooraf getekende held", () => {
  it("staand en liggend, elk met de kop, zonder video", () => {
    expect(vooraf.startsWith('<div class="kk-vooraf" aria-hidden="true">')).toBe(true);
    expect(staand).toMatch(/<h1 id="hero-heading-vs"[^>]*>Welke kleur<br\/>draag jij\?<\/h1>/);
    expect(liggend).toMatch(/<h1 id="hero-heading-vl"[^>]*>Welke kleur<br\/>draag jij\?<\/h1>/);
    expect(vooraf).not.toContain("<video");
  });

  it("geen id dubbel, en elke verwijzing wijst naar een id in dezelfde variant", () => {
    const ids = [...vooraf.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const m of vooraf.matchAll(/aria-(?:labelledby|describedby)="([^"]+)"/g)) {
      for (const id of m[1].split(" ")) expect(ids, id).toContain(id);
    }
  });

  it("de variant die op deze breedte verborgen is, haalt geen foto op", () => {
    expect(staand).toContain(`<picture><source media="${LG}" srcset="data:image/gif;base64,`);
    expect(liggend).toContain(`<picture><source media="${ONDER_LG}" srcset="data:image/gif;base64,`);
  });

  it("staand en liggend vragen precies wat de preload in index.html al haalt", () => {
    expect(avifBron(staand)).toEqual({ srcset: preload(ONDER_LG).srcset, sizes: SIZES_STAAND });
    expect(preload(ONDER_LG).sizes).toBe(SIZES_STAAND);
    expect(avifBron(liggend)).toEqual({ srcset: preload(LG).srcset, sizes: SIZES_LIGGEND });
    expect(preload(LG).sizes).toBe(SIZES_LIGGEND);
  });
});

describe("index.html", () => {
  it("de viewport staat voor het preload-script (anders rekent de preload op 980 px)", () => {
    expect(HTML.indexOf('<meta name="viewport"')).toBeGreaterThan(0);
    expect(HTML.indexOf('<meta name="viewport"')).toBeLessThan(HTML.indexOf("<script>"));
  });

  it("de vooraf getekende held alleen op / zonder ?kleur= of ?wie=", () => {
    const thuis = HTML.slice(HTML.indexOf('if (p === "/") {'), HTML.indexOf("} else {"));
    const zonderKeuze = thuis.slice(thuis.indexOf("if (!/[?&](kleur|wie)=/.test(q)) {"));
    expect(zonderKeuze).toContain('classList.add("kk-vooraf-aan")');
    expect(HTML.slice(0, HTML.indexOf('if (p === "/") {'))).not.toContain("kk-vooraf-aan");
    expect(HTML.slice(HTML.indexOf("} else {"), HTML.indexOf("})();"))).not.toContain("kk-vooraf-aan");
    expect(thuis.slice(0, thuis.indexOf("if (!/[?&](kleur|wie)=/.test(q)) {"))).not.toContain("kk-vooraf-aan");
  });
});
