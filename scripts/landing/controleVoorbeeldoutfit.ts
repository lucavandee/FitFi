/**
 * Wekelijkse controle van de voorbeeldoutfit (plan "Onder de hero", 4.3; O9).
 *
 * Per stuk van de hoofd- en de reserveoutfit:
 * - de foto: 200 en dezelfde sha256 als bij het bevriezen. Een andere foto of
 *   een plaatshouder is een fout.
 * - de productpagina: 200 en nog steeds de pagina van dit artikelnummer, geen
 *   doorverwijzing naar een categorie. H&M zet er Akamai voor; 403 of een
 *   pagina met "Access Denied" telt als onbekend, niet als kapot (fase 3,
 *   outfit.md). Dan meldt de run het wel, zodat iemand kijkt.
 *
 * Nooit de affiliate-URL: elk verzoek daarop telt bij Daisycon als klik. Dit
 * script leest dat veld niet eens.
 *
 * De opdrachtregel staat in controle-voorbeeldoutfit.ts; dit bestand is los te
 * toetsen (__tests__/controleVoorbeeldoutfit.test.ts).
 */
import { createHash } from "node:crypto";

export interface TeControlerenStuk {
  artikelnummer: string;
  imageUrl: string;
  fotoSha256: string;
  productpagina: string;
}

export type Uitslag = "goed" | "kapot" | "onbekend";

export interface Regel {
  outfit: "hoofd" | "reserve";
  artikelnummer: string;
  wat: "foto" | "productpagina";
  uitslag: Uitslag;
  reden: string;
}

type Ophalen = (url: string, init?: RequestInit) => Promise<Response>;

const KOP = {
  "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
  "accept-language": "nl-NL,nl;q=0.9",
};

export async function controleerFoto(stuk: TeControlerenStuk, ophalen: Ophalen): Promise<[Uitslag, string]> {
  const antwoord = await ophalen(stuk.imageUrl, { headers: KOP });
  if (antwoord.status !== 200) return ["kapot", `status ${antwoord.status}`];
  const inhoud = Buffer.from(await antwoord.arrayBuffer());
  const sha = createHash("sha256").update(inhoud).digest("hex");
  if (sha !== stuk.fotoSha256) return ["kapot", `andere foto (sha256 ${sha.slice(0, 8)})`];
  return ["goed", `${inhoud.length} bytes`];
}

export async function controleerPagina(stuk: TeControlerenStuk, ophalen: Ophalen): Promise<[Uitslag, string]> {
  const antwoord = await ophalen(stuk.productpagina, { headers: KOP, redirect: "manual" });
  if (antwoord.status === 403) return ["onbekend", "403 (Akamai)"];
  if (antwoord.status >= 300 && antwoord.status < 400) {
    const naar = antwoord.headers.get("location") ?? "";
    if (naar.includes(`productpage.${stuk.artikelnummer}`)) return ["goed", `doorverwezen naar dezelfde pagina`];
    return ["kapot", `doorverwezen naar ${naar || "onbekend"}`];
  }
  if (antwoord.status !== 200) return ["kapot", `status ${antwoord.status}`];
  const tekst = await antwoord.text();
  if (/Access Denied/i.test(tekst)) return ["onbekend", "200 met Access Denied (Akamai)"];
  if (!tekst.includes(stuk.artikelnummer)) return ["kapot", "pagina noemt het artikelnummer niet meer"];
  return ["goed", "productpagina"];
}

export async function controleer(
  data: { hoofd: { stukken: TeControlerenStuk[] }; reserve: { stukken: TeControlerenStuk[] } },
  ophalen: Ophalen,
): Promise<Regel[]> {
  const regels: Regel[] = [];
  for (const outfit of ["hoofd", "reserve"] as const) {
    for (const s of data[outfit].stukken) {
      // Alleen deze drie velden; de affiliate-URL komt hier nooit langs.
      const stuk: TeControlerenStuk = {
        artikelnummer: s.artikelnummer,
        imageUrl: s.imageUrl,
        fotoSha256: s.fotoSha256,
        productpagina: s.productpagina,
      };
      const [foto, fotoReden] = await controleerFoto(stuk, ophalen);
      regels.push({ outfit, artikelnummer: stuk.artikelnummer, wat: "foto", uitslag: foto, reden: fotoReden });
      const [pagina, paginaReden] = await controleerPagina(stuk, ophalen);
      regels.push({ outfit, artikelnummer: stuk.artikelnummer, wat: "productpagina", uitslag: pagina, reden: paginaReden });
    }
  }
  return regels;
}
