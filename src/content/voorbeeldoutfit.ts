/**
 * De voorbeeldoutfit onder "Kleur" (plan "Onder de hero", 4.3).
 *
 * Vier stukken die engine v2 voor het voorbeeldprofiel samenstelde, via
 * dezelfde weg als het rapport (get_kandidaten, dan runEngineV2), vastgelegd
 * door het persona-harnas en per stuk nagekeken. Bevroren op artikelnummer en
 * maat; de pagina doet geen databaseverzoek en noemt geen prijs of voorraad.
 *
 * Het bestand voorbeeldoutfit.json staat er pas als een hoofd- en een
 * reserveoutfit alle poorten halen (struikeldraad T1). Tot dan is
 * VOORBEELDOUTFIT null: de sectie rendert niet en "Bekijk voorbeeld" wijst naar
 * #kleur. import.meta.glob geeft een leeg object als het bestand ontbreekt, dus
 * het bestand neerzetten is de enige wijziging die de sectie aanzet.
 *
 * Een foto die niet laadt, zet de hele reserveoutfit neer (nooit een los stuk);
 * zijn beide stuk, dan verdwijnt de sectie (kiesWeergave).
 */

export type Categorie = "outerwear" | "top" | "bottom" | "footwear";

/** Jas, trui of vest, broek, schoenen: de volgorde op de pagina. */
export const VOLGORDE: readonly Categorie[] = ["outerwear", "top", "bottom", "footwear"];

export interface Stuk {
  productId: string;
  artikelnummer: string;
  maat: string;
  categorie: Categorie;
  titel: string;
  titelInFeed?: string | null;
  winkel: string;
  /** Exact de URL uit de feed: geen kopie, geen verkleining, geen uitsnede. */
  imageUrl: string;
  fotoSha256: string;
  /** Breedte en hoogte van de originele foto; het vak krijgt die verhouding. */
  fotoPixels: [number, number];
  affiliateUrl: string;
  productpagina: string;
  bekekenDoor: string;
  bekekenOp: string;
}

export interface Outfit {
  persona: string;
  runId: string;
  gitShaEngine: string;
  datum: string;
  /** Aantal outfits in de run: de N in "Een van de N outfits". */
  N: number;
  index: number;
  stukken: Stuk[];
}

export interface Voorbeeldoutfit {
  hoofd: Outfit;
  reserve: Outfit;
}

const isTekst = (w: unknown): w is string => typeof w === "string" && w.trim().length > 0;
const isHttps = (w: unknown): w is string => isTekst(w) && /^https:\/\/[^\s]+$/.test(w);
const isRecord = (w: unknown): w is Record<string, unknown> =>
  typeof w === "object" && w !== null && !Array.isArray(w);

function leesStuk(ruw: unknown): Stuk | null {
  if (!isRecord(ruw)) return null;
  const s = ruw;
  if (!VOLGORDE.includes(s.categorie as Categorie)) return null;
  for (const veld of ["productId", "artikelnummer", "maat", "titel", "winkel", "bekekenDoor", "bekekenOp"]) {
    if (!isTekst(s[veld])) return null;
  }
  if (!isHttps(s.imageUrl) || !isHttps(s.affiliateUrl) || !isHttps(s.productpagina)) return null;
  if (!isTekst(s.fotoSha256) || !/^[0-9a-f]{64}$/.test(s.fotoSha256)) return null;
  const px = s.fotoPixels;
  if (!Array.isArray(px) || px.length !== 2 || !px.every((n) => typeof n === "number" && n > 0)) return null;
  // Een stuk dat in de handcontrole afviel, hoort hier nooit te staan.
  if (Array.isArray(s.valtAfOp) && s.valtAfOp.length > 0) return null;
  return s as unknown as Stuk;
}

function leesOutfitRuw(ruw: unknown): Outfit | null {
  if (!isRecord(ruw)) return null;
  if (ruw.persona !== "voorbeeldprofiel") return null;
  if (!isTekst(ruw.runId) || !isTekst(ruw.gitShaEngine) || !isTekst(ruw.datum)) return null;
  if (!Number.isInteger(ruw.N) || (ruw.N as number) < 1) return null;
  if (!Number.isInteger(ruw.index)) return null;
  if (!Array.isArray(ruw.stukken) || ruw.stukken.length !== VOLGORDE.length) return null;

  const stukken = ruw.stukken.map(leesStuk);
  if (stukken.some((s) => s === null)) return null;
  // Precies een stuk per categorie, in de volgorde van de pagina.
  const gesorteerd = VOLGORDE.map((c) => (stukken as Stuk[]).filter((s) => s.categorie === c));
  if (gesorteerd.some((groep) => groep.length !== 1)) return null;
  return { ...(ruw as unknown as Outfit), stukken: gesorteerd.map((groep) => groep[0]) };
}

/**
 * Een complete hoofd- en reserveoutfit, of null. Zonder reserve geen sectie:
 * een kapotte foto moet een volledige vervanger hebben.
 */
export function leesVoorbeeldoutfit(ruw: unknown): Voorbeeldoutfit | null {
  if (!isRecord(ruw)) return null;
  const hoofd = leesOutfitRuw(ruw.hoofd);
  const reserve = leesOutfitRuw(ruw.reserve);
  if (!hoofd || !reserve) return null;
  return { hoofd, reserve };
}

export type Weergave = "hoofd" | "reserve";

/** Welke outfit staat er, gegeven welke outfits een foto hadden die niet laadde. */
export function kiesWeergave(kapot: ReadonlySet<Weergave>): Weergave | null {
  if (!kapot.has("hoofd")) return "hoofd";
  if (!kapot.has("reserve")) return "reserve";
  return null;
}

/** "H&M (NL)" wordt "H&M": de winkel zoals hij onder de foto staat. */
export function winkelnaam(winkel: string): string {
  return winkel.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

/**
 * De titel uit de feed zonder merk, in kleine letters, voor de alt:
 * "H & M - Polotrui - Beige" wordt "polotrui, beige".
 */
export function fotoOmschrijving(stuk: Pick<Stuk, "titel" | "titelInFeed">): string {
  const delen = (stuk.titelInFeed || stuk.titel).split(" - ").map((d) => d.trim()).filter(Boolean);
  const zonderMerk = delen.length > 1 ? delen.slice(1) : delen;
  return zonderMerk.join(", ").toLowerCase();
}

const bestanden = import.meta.glob<unknown>("./voorbeeldoutfit.json", { eager: true, import: "default" });

export const VOORBEELDOUTFIT: Voorbeeldoutfit | null = leesVoorbeeldoutfit(
  bestanden["./voorbeeldoutfit.json"],
);
