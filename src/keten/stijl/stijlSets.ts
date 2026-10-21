/**
 * Vooraf keuren, de rekenkant: welke outfits de stijl-agent te zien krijgt, hoe
 * zijn antwoord telt, wanneer een combinatie vol of arm is en wanneer de nacht
 * stopt. Puur, zodat de tests de regels bewaken; scripts/keten/stijl-sets.ts
 * doet de aanroepen en schrijft het logboek. Ontwerp en de redenen achter elk
 * getal: docs/keten/vooraf-keuren-review.md.
 *
 * Het logboek (oordelen.jsonl) is de bron van waarheid. De staat wordt er bij
 * elke start en na elke aanroep opnieuw uit afgeleid, alleen uit regels van
 * dezelfde keurder (keurversie, model en denkniveau). Een andere keurder begint
 * dus met een lege telling, en de oude regels blijven staan.
 */
import type { Product } from "@/engine/types";
import { isDonker } from "@/engine/v2/stijlPoort";
import { productVariantKey } from "@/services/outfits/dedupeProductVariants";
import { outfitKey } from "@/services/ratings/outfitKey";
import type { Combinatie } from "./kandidaatOutfits";
import { bouwKeurOpdracht, leesKeurAntwoord, type Deelscore, type KeurOordeel, type KeurOutfit, type Oordeel } from "./stijlAgent";

/**
 * De acht combinaties van de meetnacht. Alleen wat de quiz kan opleveren
 * (getStyleOptionsForGender): heren krijgen geen "casual", dames geen
 * "athletic".
 */
export const PILOT_CELLEN: Combinatie[] = [
  { geslacht: "female", stijl: "minimalist", gelegenheid: "work" },
  { geslacht: "female", stijl: "casual", gelegenheid: "casual" },
  { geslacht: "female", stijl: "streetwear", gelegenheid: "casual" },
  { geslacht: "female", stijl: "smart-casual", gelegenheid: "work" },
  { geslacht: "female", stijl: "romantic", gelegenheid: "date" },
  { geslacht: "male", stijl: "smart-casual", gelegenheid: "date" },
  { geslacht: "male", stijl: "classic", gelegenheid: "work" },
  { geslacht: "male", stijl: "streetwear", gelegenheid: "casual" },
];

export const REGELS = {
  /** Outfits per aanroep, zoals bij de kalibratie. */
  portie: 9,
  /** Bevestigde outfits waarna een combinatie vol is. */
  vol: 12,
  /** Keuringen in ronde 1 zonder een enkele getelde goed: arm. */
  armZonderGoedNa: 36,
  /** Keuringen in ronde 1 waarna minder dan armMinBevestigd bevestigd arm is. */
  armNa: 72,
  armMinBevestigd: 3,
  /** Nieuwe outfits per combinatie per nacht. */
  ronde1PerNacht: 72,
  /** Hooguit zoveel tweede keuringen per portie, zodat de buren meestal nieuw zijn. */
  maxRonde2PerPortie: 3,
  /** Mislukte aanroepen op rij waarna de nacht stopt, wat de oorzaak ook is. */
  misOpRij: 3,
  /** Een aanroep start alleen als hij voor de deadline klaar kan zijn (de time-out). */
  margeMs: 6 * 60 * 1000,
} as const;

// ---------------------------------------------------------------------------
// Limiet
// ---------------------------------------------------------------------------

/**
 * Zelfde herkenning als de jobs van Luc (~/.claude/scheduled-jobs/_helpers/
 * claude-headless.mjs, LIMIET), plus "resets". Alleen toepassen op een
 * mislukte aanroep, niet op het antwoord van de agent.
 */
const LIMIET =
  /you(?:'|’)?(?:ve|re| have| are)?\s*(?:hit|reached|out of)\s*(?:your\s*)?(?:usage\s*)?limit|usage limit reached|rate.?limit|resets/i;
const RESET = /resets\s+(?:(\w{3})\s+(\d{1,2})\s+at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*\(([^)]+)\)/i;

export function isLimiet(tekst: string): boolean {
  return LIMIET.test(String(tekst ?? ""));
}

/** De resetbelofte letterlijk, zoals claude hem geeft; niet omgerekend. */
export function resetTekst(tekst: string): string | null {
  const m = RESET.exec(String(tekst ?? ""));
  return m ? m[0].replace(/^resets\s+/i, "").trim() : null;
}

// ---------------------------------------------------------------------------
// Invoer
// ---------------------------------------------------------------------------

/** Een stuk zoals het in het logboek staat: genoeg om de outfit later te tonen en te toetsen. */
export interface LogStuk {
  product_id: string;
  /** De categorie bij het keuren: top, bottom, dress, footwear, outerwear, accessory. */
  rol: string;
  /** De naam zoals de agent hem kreeg, zonder ", Maat ...". */
  naam: string;
  merk: string | null;
  prijs: number | null;
  kleuren: string[];
  lichtheid: string | null;
  beeld: string | null;
}

/** Opvulwaarden die geen kleur zijn. */
const GEEN_KLEUR = new Set(["", "unknown", "onbekend"]);

const echteKleuren = (lijst: unknown): string[] =>
  Array.isArray(lijst) ? lijst.map(String).filter((k) => !GEEN_KLEUR.has(k.trim().toLowerCase())) : [];

/**
 * Van engine-producten naar logstukken. De kleur komt eerst uit
 * product_attributes (de tagger). De feed leidt kleur af uit tekst en gaf valse
 * treffers: "red" in "Flared" en "brede", en "unknown" als opvulling (review 21
 * oktober 2026: 52 van de 388 kandidaat-outfits). Alleen als de tagger niets
 * heeft, de feed. Heeft een stuk dan nog geen kleur, dan geeft dit null en wordt
 * de outfit niet gekeurd (de agent keurt op kleur).
 */
export function naarLogStukken(products: Product[], kleurenUitTags: (id: string) => string[] | undefined): LogStuk[] | null {
  const uit: LogStuk[] = [];
  for (const p of products) {
    const id = String(p.id);
    const tags = echteKleuren(kleurenUitTags(id));
    const kleuren = tags.length > 0 ? tags : echteKleuren(p.colors);
    if (kleuren.length === 0) return null;
    const prijs = typeof p.price === "number" ? p.price : Number(p.price);
    const lichtheid = (p as Product & { lightness?: unknown }).lightness;
    uit.push({
      product_id: id,
      rol: String(p.category ?? ""),
      naam: productVariantKey(String(p.name ?? "")),
      merk: p.brand ? String(p.brand) : null,
      prijs: Number.isFinite(prijs) ? prijs : null,
      kleuren,
      lichtheid: typeof lichtheid === "string" && lichtheid ? lichtheid : null,
      beeld: p.imageUrl ? String(p.imageUrl) : null,
    });
  }
  return uit;
}

/**
 * De invoer voor de agent, zoals in de kalibratieset: het profiel zonder
 * lichtheid of kleurtemperatuur (daarop filtert de site per bezoeker), per stuk
 * categorie, naam, merk, prijs en kleuren.
 */
export function naarKeurOutfit(id: string, cel: Combinatie, stukken: LogStuk[]): KeurOutfit {
  return {
    id,
    profiel: { geslacht: cel.geslacht, stijlen: [cel.stijl], gelegenheid: cel.gelegenheid },
    stukken: stukken.map((s) => ({ categorie: s.rol, naam: s.naam, merk: s.merk, prijs: s.prijs, kleuren: s.kleuren })),
  };
}

/** De opdracht voor een portie, met de korte id's die de agent terug moet geven. */
export function bouwPortieOpdracht(portie: Kandidaat[], kortIds: string[]): string {
  return bouwKeurOpdracht(portie.map((k, i) => naarKeurOutfit(kortIds[i], k.combinatie, k.stukken)));
}

/** Dezelfde sleutel als outfit_ratings.outfit_key op de site. */
export function sleutelVoorStukken(productIds: string[]): Promise<string> {
  return outfitKey(productIds);
}

export function combinatieUitSleutel(sleutel: string): Combinatie {
  const [geslacht, stijl, gelegenheid] = sleutel.split("|");
  if ((geslacht !== "female" && geslacht !== "male") || !stijl || !gelegenheid) {
    throw new Error(`Onbekende combinatie: ${sleutel}`);
  }
  return { geslacht, stijl, gelegenheid };
}

// ---------------------------------------------------------------------------
// Oordeel
// ---------------------------------------------------------------------------

export type Telling = Oordeel | "geen oordeel";

/**
 * Een "goed" telt alleen als de agent zelf niets aanmerkt: vier keer "ja" en
 * geen verbetering. Anders telt hij als twijfel; het ruwe oordeel blijft in het
 * logboek.
 */
export function telOordeel(k: KeurOordeel | undefined): Telling {
  if (!k) return "geen oordeel";
  if (k.oordeel !== "goed") return k.oordeel;
  const alleJa = [k.stijl, k.gelegenheid, k.kleur, k.samenhang].every((d) => d === "ja");
  return alleJa && k.verbetering.trim() === "" ? "goed" : "twijfel";
}

/** Minder dan vijf van de negen terug is een mislukte aanroep; bij een kleinere portie naar rato. */
export function minimumOordelen(verstuurd: number): number {
  return Math.ceil((verstuurd * 5) / 9);
}

/**
 * Leest het antwoord: alleen id's uit de verstuurde portie, elk een keer. Komt
 * een id twee keer voor, dan is niet te zeggen welk oordeel bedoeld is, en
 * telt geen van beide.
 */
export function leesPortieAntwoord(tekst: string, verstuurd: string[]): { perId: Map<string, KeurOordeel>; onbekend: number; dubbel: number } {
  const toegestaan = new Set(verstuurd);
  const perId = new Map<string, KeurOordeel>();
  const dubbel = new Set<string>();
  let onbekend = 0;
  for (const k of leesKeurAntwoord(tekst)) {
    if (!toegestaan.has(k.id)) {
      onbekend += 1;
      continue;
    }
    if (perId.has(k.id) || dubbel.has(k.id)) {
      perId.delete(k.id);
      dubbel.add(k.id);
      continue;
    }
    perId.set(k.id, k);
  }
  return { perId, onbekend, dubbel: dubbel.size };
}

// ---------------------------------------------------------------------------
// Logboek en staat
// ---------------------------------------------------------------------------

export function keurderSleutel(keurVersie: string, model: string, effort: string): string {
  return `${keurVersie}|${model}|${effort}`;
}

/** Een regel in oordelen.jsonl: een keuring van een outfit. */
export interface OordeelRegel {
  tijd: string;
  run: string;
  keurder: string;
  keur_versie: string;
  model: string;
  effort: string;
  /** combinatieSleutel, bijvoorbeeld "female|casual|casual". */
  cel: string;
  outfit_key: string;
  /** In weergavevolgorde. */
  stukken: LogStuk[];
  p_zaad: number;
  engine_zaad: number;
  ronde: 1 | 2;
  /** 1 of 2: een outfit zonder oordeel gaat een keer opnieuw mee. */
  poging: number;
  aanroep: number;
  /**
   * Of de aanroep als geheel lukte. Zo niet (time-out, limiet, geen JSON, te
   * weinig oordelen, ander model), dan zegt de regel niets over de outfit: hij
   * staat in het logboek voor de diagnose en telt niet mee.
   */
  aanroep_gelukt: boolean;
  kort_id: string;
  /** Het oordeel zoals de agent het gaf, of null. */
  ruw: KeurOordeel | null;
  /** Het oordeel zoals het telt. */
  telling: Telling;
}

/** Een regel in aanroepen.jsonl. */
export interface AanroepRegel {
  tijd: string;
  run: string;
  nummer: number;
  via: string;
  verstuurd: number;
  gelezen: number;
  onbekend: number;
  dubbel: number;
  gelukt: boolean;
  timeout: boolean;
  duration_ms: number | null;
  total_cost_usd: number | null;
  usage: unknown;
  modelUsage: unknown;
  num_turns: number | null;
  model: string | null;
  apiKeySource: string | null;
  is_error: boolean;
  fout: string | null;
  stopreden: Stopreden | null;
  reset: string | null;
  rate_limits: unknown[];
}

interface Uitslag {
  telling: Telling;
  regel: OordeelRegel;
}

export interface CelStaat {
  cel: string;
  /** Per outfit de beslissende regel van ronde 1: de eerste met een oordeel, of de tweede zonder. */
  ronde1: Map<string, Uitslag>;
  ronde2: Map<string, Uitslag>;
  pogingen1: Map<string, number>;
  pogingen2: Map<string, number>;
  /** De laatste regel per outfit, voor de stukken en zaden bij een volgende keuring. */
  laatste: Map<string, OordeelRegel>;
}

export interface Staat {
  perCel: Map<string, CelStaat>;
}

function nieuweCel(cel: string): CelStaat {
  return { cel, ronde1: new Map(), ronde2: new Map(), pogingen1: new Map(), pogingen2: new Map(), laatste: new Map() };
}

export function herstelStaat(regels: OordeelRegel[], keurder: string): Staat {
  const perCel = new Map<string, CelStaat>();
  for (const r of regels) {
    if (r.keurder !== keurder || !r.aanroep_gelukt) continue;
    const c = perCel.get(r.cel) ?? nieuweCel(r.cel);
    perCel.set(r.cel, c);
    const k = r.outfit_key;
    c.laatste.set(k, r);
    const [uitslagen, pogingen] = r.ronde === 1 ? [c.ronde1, c.pogingen1] : [c.ronde2, c.pogingen2];
    const n = (pogingen.get(k) ?? 0) + 1;
    pogingen.set(k, n);
    const al = uitslagen.get(k);
    if (al && al.telling !== "geen oordeel") continue;
    if (r.telling !== "geen oordeel" || n >= 2) uitslagen.set(k, { telling: r.telling, regel: r });
  }
  return { perCel };
}

export type CelStatus = "open" | "vol" | "arm";

export interface CelCijfers {
  /** Outfits met een oordeel in ronde 1. */
  keuringen: number;
  goedGeteld: number;
  bevestigd: string[];
  /** Goed in ronde 1, nog geen oordeel in ronde 2 en minder dan twee pogingen. */
  wachtrij2: string[];
  /** Een keer zonder oordeel in ronde 1: gaat nog een keer mee. */
  herkansing1: string[];
  /** Klaar in ronde 1: met oordeel, of twee keer zonder. */
  alGekeurd: Set<string>;
  /** Elke outfit die in ronde 1 al een keer verstuurd is. */
  bekend: Set<string>;
  status: CelStatus;
}

export function celCijfers(c: CelStaat): CelCijfers {
  const alGekeurd = new Set(c.ronde1.keys());
  const bekend = new Set(c.pogingen1.keys());
  const echte = [...c.ronde1.entries()].filter(([, u]) => u.telling !== "geen oordeel");
  const goed = echte.filter(([, u]) => u.telling === "goed").map(([k]) => k);
  const bevestigd = goed.filter((k) => c.ronde2.get(k)?.telling === "goed");
  const wachtrij2 = goed.filter((k) => !c.ronde2.has(k) && (c.pogingen2.get(k) ?? 0) < 2);
  const herkansing1 = [...c.pogingen1.entries()].filter(([k, n]) => n === 1 && !c.ronde1.has(k)).map(([k]) => k);
  let status: CelStatus = "open";
  if (bevestigd.length >= REGELS.vol) status = "vol";
  else if (echte.length >= REGELS.armZonderGoedNa && goed.length === 0) status = "arm";
  else if (echte.length >= REGELS.armNa && bevestigd.length < REGELS.armMinBevestigd && wachtrij2.length === 0) status = "arm";
  return { keuringen: echte.length, goedGeteld: goed.length, bevestigd, wachtrij2, herkansing1, alGekeurd, bekend, status };
}

// ---------------------------------------------------------------------------
// Portie
// ---------------------------------------------------------------------------

export interface Kandidaat {
  cel: string;
  combinatie: Combinatie;
  outfit_key: string;
  stukken: LogStuk[];
  p_zaad: number;
  engine_zaad: number;
  ronde: 1 | 2;
  poging: number;
}

/** Een kandidaat voor een volgende keuring, uit de laatste logregel van die outfit. */
export function kandidaatUitRegel(r: OordeelRegel, ronde: 1 | 2, poging: number): Kandidaat {
  return {
    cel: r.cel,
    combinatie: combinatieUitSleutel(r.cel),
    outfit_key: r.outfit_key,
    stukken: r.stukken,
    p_zaad: r.p_zaad,
    engine_zaad: r.engine_zaad,
    ronde,
    poging,
  };
}

/**
 * Stelt een portie samen: eerst hooguit maxRonde2 tweede keuringen, dan de
 * herkansingen, dan nieuwe outfits beurtelings uit de combinaties. Is er dan
 * nog plaats, dan vullen de overige tweede keuringen aan: een halflege portie
 * kost bijna even veel als een volle. Een outfit komt hooguit een keer in een
 * portie.
 */
export function kiesPortie(o: { ronde2: Kandidaat[]; herkansing: Kandidaat[]; nieuw: Kandidaat[][]; grootte: number; maxRonde2: number }): Kandidaat[] {
  const uit: Kandidaat[] = [];
  const gezien = new Set<string>();
  const neem = (k: Kandidaat): void => {
    if (uit.length >= o.grootte || gezien.has(k.outfit_key)) return;
    gezien.add(k.outfit_key);
    uit.push(k);
  };
  for (const k of o.ronde2.slice(0, o.maxRonde2)) neem(k);
  for (const k of o.herkansing) neem(k);
  const langste = Math.max(0, ...o.nieuw.map((l) => l.length));
  for (let i = 0; i < langste && uit.length < o.grootte; i++) {
    for (const lijst of o.nieuw) if (lijst[i]) neem(lijst[i]);
  }
  for (const k of o.ronde2.slice(o.maxRonde2)) neem(k);
  return uit;
}

/** Beurtelings uit elke lijst: de eerste van elk, dan de tweede van elk, enzovoort. */
export function omEnOm<T>(lijsten: T[][]): T[] {
  const uit: T[] = [];
  const langste = Math.max(0, ...lijsten.map((l) => l.length));
  for (let i = 0; i < langste; i++) for (const l of lijsten) if (i < l.length) uit.push(l[i]);
  return uit;
}

/** Vaste husseling per zaad (mulberry32), zodat de plek in de portie niets verraadt. */
export function schud<T>(xs: T[], zaad: number): T[] {
  let a = zaad >>> 0;
  const rnd = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const uit = [...xs];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

// ---------------------------------------------------------------------------
// Noodrem
// ---------------------------------------------------------------------------

export type Stopreden =
  | "klaar"
  | "plafond"
  | "deadline"
  | "drie-mislukt"
  | "limiet"
  | "ander-model"
  | "verkeerde-betaling"
  | "onderbroken";

/** Mag er nog een aanroep? null als ja, anders de reden om te stoppen. */
export function volgendeStap(o: { nu: number; deadline: number | null; aanroepen: number; maxAanroepen: number; misOpRij: number }): Stopreden | null {
  if (o.aanroepen >= o.maxAanroepen) return "plafond";
  if (o.deadline !== null && o.nu + REGELS.margeMs > o.deadline) return "deadline";
  if (o.misOpRij >= REGELS.misOpRij) return "drie-mislukt";
  return null;
}

/** Het eerstvolgende tijdstip HH:MM (lokale tijd) na `nu`. */
export function deadlineVoor(tot: string, nu: Date): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(tot.trim());
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) throw new Error(`Ongeldige tijd "${tot}", verwacht HH:MM`);
  const d = new Date(nu);
  d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  if (d.getTime() <= nu.getTime()) d.setDate(d.getDate() + 1);
  return d.getTime();
}

// ---------------------------------------------------------------------------
// Nacht en redenen
// ---------------------------------------------------------------------------

/**
 * De nacht waar een tijdstip bij hoort: de Nederlandse datum van 12 uur eerder.
 * Een nacht loopt zo van 12:00 tot 12:00, en een herstart om 01:00 telt mee bij
 * de avond ervoor (plafond en nachtlimiet per combinatie, 2d en 2f).
 */
export function nachtVan(d: Date): string {
  return new Date(d.getTime() - 12 * 60 * 60 * 1000).toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" });
}

/**
 * Soorten afkeur, op trefwoorden in de vrije zin van de agent. De agent schrijft
 * elke reden anders ("de zwarte pumps", "pumps met hak"), dus tellen op de
 * letterlijke zin geeft alleen enen. Een heuristiek: een zin kan in meer soorten
 * vallen, en wat nergens in past heet overig.
 */
const REDEN_SOORTEN: Array<[string, RegExp]> = [
  ["hak of pump", /\b(hak|hakken|pumps?|stiletto|kitten ?heels?|slingbacks?)\b/i],
  ["ballerina", /ballerina/i],
  ["zomerstuk in de herfst", /zomer|seizoen|sandaal|sandal|slipper|linnen|bandje|strand|open schoen|blote|korte mouw|\bshorts?\b/i],
  ["gedateerd", /gedateerd|ouderwets|2012|2018|skinny|dad-?sneaker|groot logo|logo op/i],
  ["te informeel", /informeel|te casual|te sportief|hoodie|jogging|sweatpants|thuiskleding/i],
  ["te formeel of te net", /te net|te formeel|te chic|avondkleding|gala|paillet/i],
  ["designer of prijs", /designer|prijs|te duur|\beuro\b|luxe/i],
  ["te donker of zwart", /donker|zwart/i],
  ["te veel beige of kleurloos", /beige|kleurloos|saai/i],
  ["kleurcombinatie", /kleur|blauw op blauw|tint|vloek|botst|clash/i],
  ["silhouet of pasvorm", /silhouet|pasvorm|te strak|te ruim|oversized|verhouding/i],
  ["accessoire", /\briem\b|\btas\b|sjaal|ketting|\bpet\b|muts|accessoire|stropdas/i],
  ["stijl past niet", /past niet bij|geen (streetwear|minimal|klassiek|romantisch|casual|smart)|niet (streetwear|minimalistisch|klassiek|romantisch)/i],
  ["onvolledig of dubbel", /ontbreekt|\bmist\b|zonder (jas|schoen)|twee (broeken|tops|jassen)|dubbel/i],
];

export function redenGroepen(reden: string): string[] {
  const uit = REDEN_SOORTEN.filter(([, re]) => re.test(reden)).map(([soort]) => soort);
  return uit.length > 0 ? uit : ["overig"];
}

const lokaal = (iso: string): string =>
  new Date(iso).toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam", dateStyle: "short", timeStyle: "short" });

// ---------------------------------------------------------------------------
// Nachtrapport
// ---------------------------------------------------------------------------

/** Uitgeput: open, maar er is niets meer te keuren. Geen kandidaten: de pool gaf niets. */
export type RapportStatus = CelStatus | "uitgeput" | "geen kandidaten";

/** Wat het script over een combinatie weet: kandidaten uit de pool en wat er nog over is. */
export interface CelInfo {
  cel: string;
  kandidaten: number;
  nogTeKeuren: number;
  reden?: string;
}

export interface CelRapport {
  cel: string;
  status: RapportStatus;
  kandidaten?: number;
  reden?: string;
  keuringen: number;
  goedGeteld: number;
  goedRuw: number;
  bevestigd: number;
  twijfel: number;
  fout: number;
  geenOordeel: number;
  wachtrij2: number;
  /** Hoe vaak een deelscore niet "ja" was bij een outfit die niet goed telde. */
  afgekeurdOp: Record<"stijl" | "gelegenheid" | "kleur" | "samenhang", number>;
  /** De drie soorten afkeur die het vaakst voorkomen (redenGroepen), met een voorbeeld. */
  redenen: string[];
  jurk: number;
  topBroek: number;
  /** Bevestigde outfits waarvan elk stuk binnen het budget per stuk valt. */
  budget: { tot75: number; tot150: number; tot250: number };
  /** Bevestigde outfits met hooguit een donker stuk. */
  licht: number;
}

export interface NachtrapportJson {
  keurder: string;
  run: string;
  start: string;
  stop: string;
  stopreden: Stopreden | null;
  reset: string | null;
  via: string;
  git: string;
  aanroepen: { totaal: number; gelukt: number; mislukt: number; timeout: number; dollar: number; gemiddeldeSeconden: number | null };
  cellen: CelRapport[];
  herhaalbaarheid: { beoordeeld: number; blevenGoed: number };
}

function donkerStuk(s: LogStuk): boolean {
  return isDonker({ lightness: s.lichtheid ?? undefined, colors: s.kleuren } as unknown as Product);
}

function binnenBudget(stukken: LogStuk[], max: number): boolean {
  return stukken.every((s) => s.prijs !== null && s.prijs <= max);
}

function celRapport(c: CelStaat): CelRapport {
  const cijfers = celCijfers(c);
  const ronde1 = [...c.ronde1.values()];
  const echte = ronde1.filter((u) => u.telling !== "geen oordeel");
  const afgekeurdOp = { stijl: 0, gelegenheid: 0, kleur: 0, samenhang: 0 };
  const soorten = new Map<string, { n: number; voorbeeld: string }>();
  for (const u of echte) {
    if (u.telling === "goed" || !u.regel.ruw) continue;
    for (const veld of ["stijl", "gelegenheid", "kleur", "samenhang"] as const) {
      if ((u.regel.ruw[veld] as Deelscore) !== "ja") afgekeurdOp[veld] += 1;
    }
    // Per keuring telt een soort een keer, ook als meer redenen erin vallen.
    const dezeKeer = new Map<string, string>();
    for (const reden of u.regel.ruw.redenen) {
      const r = reden.trim();
      if (r) for (const soort of redenGroepen(r)) if (!dezeKeer.has(soort)) dezeKeer.set(soort, r);
    }
    for (const [soort, voorbeeld] of dezeKeer) {
      const al = soorten.get(soort);
      soorten.set(soort, { n: (al?.n ?? 0) + 1, voorbeeld: al?.voorbeeld ?? voorbeeld });
    }
  }
  const redenen = [...soorten.entries()]
    .sort((a, b) => b[1].n - a[1].n)
    .slice(0, 3)
    .map(([soort, { n, voorbeeld }]) => `${soort} (${n}x): ${voorbeeld.slice(0, 100)}`);
  const rollen = (u: Uitslag) => new Set(u.regel.stukken.map((s) => s.rol));
  const bevestigd = cijfers.bevestigd.map((k) => c.laatste.get(k)!.stukken);
  return {
    cel: c.cel,
    status: cijfers.status,
    keuringen: cijfers.keuringen,
    goedGeteld: cijfers.goedGeteld,
    goedRuw: echte.filter((u) => u.telling === "goed" || u.regel.ruw?.oordeel === "goed").length,
    bevestigd: cijfers.bevestigd.length,
    twijfel: echte.filter((u) => u.telling === "twijfel").length,
    fout: echte.filter((u) => u.telling === "fout").length,
    geenOordeel: ronde1.length - echte.length,
    wachtrij2: cijfers.wachtrij2.length,
    afgekeurdOp,
    redenen,
    jurk: echte.filter((u) => rollen(u).has("dress")).length,
    topBroek: echte.filter((u) => rollen(u).has("top") && rollen(u).has("bottom")).length,
    budget: {
      tot75: bevestigd.filter((s) => binnenBudget(s, 75)).length,
      tot150: bevestigd.filter((s) => binnenBudget(s, 150)).length,
      tot250: bevestigd.filter((s) => binnenBudget(s, 250)).length,
    },
    licht: bevestigd.filter((s) => s.filter(donkerStuk).length <= 1).length,
  };
}

function legeCel(info: CelInfo): CelRapport {
  return {
    cel: info.cel,
    status: info.kandidaten === 0 ? "geen kandidaten" : info.nogTeKeuren === 0 ? "uitgeput" : "open",
    kandidaten: info.kandidaten,
    reden: info.reden,
    keuringen: 0,
    goedGeteld: 0,
    goedRuw: 0,
    bevestigd: 0,
    twijfel: 0,
    fout: 0,
    geenOordeel: 0,
    wachtrij2: 0,
    afgekeurdOp: { stijl: 0, gelegenheid: 0, kleur: 0, samenhang: 0 },
    redenen: [],
    jurk: 0,
    topBroek: 0,
    budget: { tot75: 0, tot150: 0, tot250: 0 },
    licht: 0,
  };
}

/**
 * Het nachtrapport. `cellen` komt van het script: elke combinatie uit de pool,
 * ook als ze geen enkele keuring kreeg, met het aantal kandidaten en wat er nog
 * over is. Zonder `cellen` alleen de combinaties uit het logboek.
 */
export function bouwNachtrapport(o: {
  regels: OordeelRegel[];
  aanroepen: AanroepRegel[];
  keurder: string;
  run: string;
  meta: { start: string; stop: string; git: string; via: string; stopreden?: Stopreden | null };
  cellen?: CelInfo[];
}): { md: string; json: NachtrapportJson } {
  const staat = herstelStaat(o.regels, o.keurder);
  const infos: CelInfo[] = o.cellen ?? [...staat.perCel.keys()].sort().map((cel) => ({ cel, kandidaten: -1, nogTeKeuren: -1 }));
  const cellen = infos.map((info): CelRapport => {
    const c = staat.perCel.get(info.cel);
    if (!c) return legeCel(info);
    const rapport = celRapport(c);
    const uitgeput = rapport.status === "open" && info.nogTeKeuren === 0 && rapport.wachtrij2 === 0;
    return {
      ...rapport,
      status: uitgeput ? "uitgeput" : rapport.status,
      kandidaten: info.kandidaten >= 0 ? info.kandidaten : undefined,
      reden: info.reden,
    };
  });
  let beoordeeld = 0;
  let blevenGoed = 0;
  for (const c of staat.perCel.values()) {
    for (const [k, u] of c.ronde1) {
      const twee = c.ronde2.get(k);
      if (u.telling !== "goed" || !twee || twee.telling === "geen oordeel") continue;
      beoordeeld += 1;
      if (twee.telling === "goed") blevenGoed += 1;
    }
  }
  const deze = o.aanroepen.filter((a) => a.run === o.run);
  const duren = deze.map((a) => a.duration_ms).filter((d): d is number => typeof d === "number");
  const dollar = deze.reduce((s, a) => s + (a.total_cost_usd ?? 0), 0);
  const laatste = deze[deze.length - 1];
  const json: NachtrapportJson = {
    keurder: o.keurder,
    run: o.run,
    start: o.meta.start,
    stop: o.meta.stop,
    stopreden: o.meta.stopreden ?? laatste?.stopreden ?? null,
    reset: laatste?.reset ?? null,
    via: o.meta.via,
    git: o.meta.git,
    aanroepen: {
      totaal: deze.length,
      gelukt: deze.filter((a) => a.gelukt).length,
      mislukt: deze.filter((a) => !a.gelukt).length,
      timeout: deze.filter((a) => a.timeout).length,
      dollar: Math.round(dollar * 100) / 100,
      gemiddeldeSeconden: duren.length ? Math.round(duren.reduce((s, d) => s + d, 0) / duren.length / 1000) : null,
    },
    cellen,
    herhaalbaarheid: { beoordeeld, blevenGoed },
  };

  const r: string[] = [];
  r.push(`# Nachtrapport vooraf keuren, ${lokaal(o.meta.start)}`, "");
  r.push(`Keurder ${o.keurder}, via ${o.meta.via}, git ${o.meta.git}. Tijden in Nederlandse tijd.`);
  r.push(`Gestopt ${lokaal(o.meta.stop)}, reden: ${json.stopreden ?? "onbekend"}${json.reset ? ` (reset ${json.reset})` : ""}.`);
  const a = json.aanroepen;
  r.push(
    `Aanroepen: ${a.totaal}, waarvan ${a.gelukt} gelukt, ${a.mislukt} mislukt (${a.timeout} time-out). Gemiddeld ${a.gemiddeldeSeconden ?? "?"} s per aanroep, ${a.dollar.toFixed(2)} dollar.`
  );
  r.push(`Herhaalbaarheid: van ${beoordeeld} outfits met twee keuringen bleven er ${blevenGoed} goed.`, "");
  r.push("## Per combinatie (alle nachten van deze keurder samen)", "");
  r.push("| combinatie | status | kandidaten | gekeurd | goed (ruw) | bevestigd | twijfel | fout | geen oordeel | in ronde 2 | jurk | top en broek | tot 75 | tot 150 | tot 250 | licht |");
  r.push("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const c of cellen) {
    const status = c.reden ? `${c.status} (${c.reden})` : c.status;
    r.push(
      `| ${c.cel} | ${status} | ${c.kandidaten ?? "?"} | ${c.keuringen} | ${c.goedGeteld} (${c.goedRuw}) | ${c.bevestigd} | ${c.twijfel} | ${c.fout} | ${c.geenOordeel} | ${c.wachtrij2} | ${c.jurk} | ${c.topBroek} | ${c.budget.tot75} | ${c.budget.tot150} | ${c.budget.tot250} | ${c.licht} |`
    );
  }
  r.push("", "## Waarop het misging", "");
  for (const c of cellen) {
    const op = c.afgekeurdOp;
    r.push(`- ${c.cel}: stijl ${op.stijl}, gelegenheid ${op.gelegenheid}, kleur ${op.kleur}, samenhang ${op.samenhang}.${c.redenen.length ? ` Vaakst: ${c.redenen.join("; ")}` : ""}`);
  }
  return { md: r.join("\n") + "\n", json };
}
