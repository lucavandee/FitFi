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

/**
 * Van engine-producten naar logstukken. Een lege kleur wordt aangevuld met de
 * kleur van de tagger; heeft een stuk dan nog geen kleur, dan geeft dit null en
 * wordt de outfit niet gekeurd (de agent keurt op kleur).
 */
export function naarLogStukken(products: Product[], kleurenUitTags: (id: string) => string[] | undefined): LogStuk[] | null {
  const uit: LogStuk[] = [];
  for (const p of products) {
    const id = String(p.id);
    const eigen = Array.isArray(p.colors) ? p.colors.map(String).filter(Boolean) : [];
    const kleuren = eigen.length > 0 ? eigen : (kleurenUitTags(id) ?? []).map(String).filter(Boolean);
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
// Nachtrapport
// ---------------------------------------------------------------------------

export interface CelRapport {
  cel: string;
  status: CelStatus;
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
  const redenTelling = new Map<string, number>();
  for (const u of echte) {
    if (u.telling === "goed" || !u.regel.ruw) continue;
    for (const veld of ["stijl", "gelegenheid", "kleur", "samenhang"] as const) {
      if ((u.regel.ruw[veld] as Deelscore) !== "ja") afgekeurdOp[veld] += 1;
    }
    for (const reden of u.regel.ruw.redenen) {
      const r = reden.trim();
      if (r) redenTelling.set(r, (redenTelling.get(r) ?? 0) + 1);
    }
  }
  const redenen = [...redenTelling.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([r, n]) => (n > 1 ? `${r} (${n}x)` : r));
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

export function bouwNachtrapport(o: {
  regels: OordeelRegel[];
  aanroepen: AanroepRegel[];
  keurder: string;
  run: string;
  meta: { start: string; stop: string; git: string; via: string; stopreden?: Stopreden | null };
}): { md: string; json: NachtrapportJson } {
  const staat = herstelStaat(o.regels, o.keurder);
  const cellen = [...staat.perCel.values()].map(celRapport).sort((a, b) => a.cel.localeCompare(b.cel));
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
  r.push(`# Nachtrapport vooraf keuren, ${o.meta.start.slice(0, 16).replace("T", " ")}`, "");
  r.push(`Keurder ${o.keurder}, via ${o.meta.via}, git ${o.meta.git}.`);
  r.push(`Gestopt ${o.meta.stop.slice(0, 16).replace("T", " ")}, reden: ${json.stopreden ?? "onbekend"}${json.reset ? ` (reset ${json.reset})` : ""}.`);
  const a = json.aanroepen;
  r.push(
    `Aanroepen: ${a.totaal}, waarvan ${a.gelukt} gelukt, ${a.mislukt} mislukt (${a.timeout} time-out). Gemiddeld ${a.gemiddeldeSeconden ?? "?"} s per aanroep, ${a.dollar.toFixed(2)} dollar.`
  );
  r.push(`Herhaalbaarheid: van ${beoordeeld} outfits met twee keuringen bleven er ${blevenGoed} goed.`, "");
  r.push("## Per combinatie (alle nachten van deze keurder samen)", "");
  r.push("| combinatie | status | gekeurd | goed (ruw) | bevestigd | twijfel | fout | geen oordeel | in ronde 2 | jurk | top en broek | tot 75 | tot 150 | tot 250 | licht |");
  r.push("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const c of cellen) {
    r.push(
      `| ${c.cel} | ${c.status} | ${c.keuringen} | ${c.goedGeteld} (${c.goedRuw}) | ${c.bevestigd} | ${c.twijfel} | ${c.fout} | ${c.geenOordeel} | ${c.wachtrij2} | ${c.jurk} | ${c.topBroek} | ${c.budget.tot75} | ${c.budget.tot150} | ${c.budget.tot250} | ${c.licht} |`
    );
  }
  r.push("", "## Waarop het misging", "");
  for (const c of cellen) {
    const op = c.afgekeurdOp;
    r.push(`- ${c.cel}: stijl ${op.stijl}, gelegenheid ${op.gelegenheid}, kleur ${op.kleur}, samenhang ${op.samenhang}.${c.redenen.length ? ` Vaakst: ${c.redenen.join("; ")}` : ""}`);
  }
  return { md: r.join("\n") + "\n", json };
}
