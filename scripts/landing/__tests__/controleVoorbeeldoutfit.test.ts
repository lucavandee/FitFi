/**
 * De wekelijkse controle van de voorbeeldoutfit (O9): hij vraagt nooit een
 * affiliate-URL op (elk verzoek telt bij Daisycon als klik), en hij leest een
 * 403 van H&M als onbekend, niet als kapot.
 */
import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { controleer } from "../controleVoorbeeldoutfit";

const FOTO = Buffer.from("foto");
const SHA = createHash("sha256").update(FOTO).digest("hex");

function stuk(nr: string) {
  return {
    artikelnummer: nr,
    imageUrl: `https://image.hm.com/${nr}.jpg`,
    fotoSha256: SHA,
    productpagina: `https://www2.hm.com/nl_nl/productpage.${nr}.html`,
    affiliateUrl: `https://jf79.net/c/?murl=${nr}`,
  };
}

const data = {
  hoofd: { stukken: ["1", "2", "3", "4"].map(stuk) },
  reserve: { stukken: ["5", "6", "7", "8"].map(stuk) },
};

describe("controle-voorbeeldoutfit", () => {
  it("vraagt foto en productpagina op, nooit de affiliate-URL", async () => {
    const gevraagd: string[] = [];
    const ophalen = async (url: string) => {
      gevraagd.push(url);
      if (url.startsWith("https://image.hm.com/")) return new Response(FOTO, { status: 200 });
      const nr = url.match(/productpage\.(\d+)\.html/)?.[1] ?? "";
      return new Response(`<html>artikel ${nr}</html>`, { status: 200 });
    };
    const regels = await controleer(data, ophalen);
    expect(gevraagd).toHaveLength(16);
    expect(gevraagd.some((u) => u.includes("jf79.net"))).toBe(false);
    expect(regels.every((r) => r.uitslag === "goed")).toBe(true);
  });

  it("een andere foto is kapot, een 403 op de productpagina is onbekend, een doorverwijzing naar een categorie is kapot", async () => {
    const ophalen = async (url: string) => {
      if (url.includes("/1.jpg")) return new Response(Buffer.from("andere foto"), { status: 200 });
      if (url.startsWith("https://image.hm.com/")) return new Response(FOTO, { status: 200 });
      if (url.includes("productpage.2.")) return new Response("Access Denied", { status: 403 });
      if (url.includes("productpage.3.")) return new Response(null, { status: 301, headers: { location: "https://www2.hm.com/nl_nl/dames/broeken.html" } });
      const nr = url.match(/productpage\.(\d+)\.html/)?.[1] ?? "";
      return new Response(`<html>artikel ${nr}</html>`, { status: 200 });
    };
    const regels = await controleer(data, ophalen);
    const van = (nr: string, wat: string) => regels.find((r) => r.artikelnummer === nr && r.wat === wat)?.uitslag;
    expect(van("1", "foto")).toBe("kapot");
    expect(van("2", "productpagina")).toBe("onbekend");
    expect(van("3", "productpagina")).toBe("kapot");
    expect(van("4", "productpagina")).toBe("goed");
  });

  it("het script noemt het veld affiliateUrl alleen om te zeggen dat het niet gebruikt wordt", () => {
    for (const naam of ["../controleVoorbeeldoutfit.ts", "../controle-voorbeeldoutfit.ts"]) {
      const bron = readFileSync(fileURLToPath(new URL(naam, import.meta.url)), "utf-8");
      expect(bron).not.toMatch(/\.affiliateUrl/);
    }
  });
});
