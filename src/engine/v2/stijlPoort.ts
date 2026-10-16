/**
 * Stijlpoort: regels die volgen uit wat de bezoeker zelf koos, niet uit het
 * archetype dat de engine daaruit afleidt.
 *
 * Waarom apart van candidateFilter: archetypeHardReject kijkt naar het
 * afgeleide primaire en secundaire archetype. Bij Lucs quiz (alleen
 * streetwear, gelegenheden casual, werk, formeel en date) maakte de
 * gelegenheidsbias klassiek tweede, en daarmee ging de afkeur van formele
 * schoenen uit. De uitslag had pumps, ballerina's en hakken, en geen sneaker
 * (keten-kritiek, 16 oktober 2026).
 *
 * productBreuk werkt per stuk en haalt het uit de pool voordat er
 * gecomponeerd wordt. outfitBreuken werkt per outfit, voor regels die over
 * het geheel gaan. Beide geven de reden terug, zodat een harnas of een log
 * kan zeggen waarom iets niet mocht.
 */
import type { Product } from "@/engine/types";

export interface PoortAntwoorden {
  stylePreferences?: unknown;
  lightness?: unknown;
}

/** Stijlen waar hakken, ballerina's en een clutch niet bij horen. */
const STIJLEN_ZONDER_HAK = new Set(["streetwear", "athletic"]);

const HAK_RE =
  /\b(pumps?|stiletto'?s?|kitten ?heels?|kittenhak(ken)?|naaldhak(ken)?|sleehak(ken)?|slingbacks?|heels?|heeled|hak|hakken|wedges?)\b/i;
const BALLERINA_RE = /\b(ballet ?flats?|ballerina'?s?|ballerinas|mary ?janes?)\b/i;
const CLUTCH_RE = /\b(clutch(es)?|avondtas(je)?|enveloptas)\b/i;
const SNEAKER_RE = /\b(sneakers?|trainers?|runners?|hardloopschoenen?|sportschoenen?|speedcat|samba|gazelle|campus|suede classic|palermo)\b/i;

const DONKERE_KLEUREN = new Set([
  "zwart", "black", "navy", "marine", "marineblauw", "donkerblauw", "antraciet",
  "charcoal", "donkergrijs", "donkerbruin", "bordeaux", "burgundy", "donkergroen",
]);

function gekozenStijlen(a: PoortAntwoorden): string[] {
  const s = a.stylePreferences;
  if (Array.isArray(s)) return s.map((x) => String(x).toLowerCase().trim()).filter(Boolean);
  if (typeof s === "string" && s.trim()) return [s.toLowerCase().trim()];
  return [];
}

/** Alleen als elke gekozen stijl er een is zonder hakken. */
function alleenZonderHak(stijlen: string[]): boolean {
  return stijlen.length > 0 && stijlen.every((s) => STIJLEN_ZONDER_HAK.has(s));
}

function categorie(p: Product): string {
  return String(p.category ?? "").toLowerCase().trim();
}

function isSneaker(p: Product): boolean {
  return String(p.shoeType ?? "").toLowerCase() === "sneaker" || SNEAKER_RE.test(p.name ?? "");
}

/** De reden waarom dit stuk niet bij de keuze van de bezoeker past, of null. */
export function productBreuk(p: Product, a: PoortAntwoorden): string | null {
  const stijlen = gekozenStijlen(a);
  const naam = p.name ?? "";
  const cat = categorie(p);

  if (alleenZonderHak(stijlen)) {
    // Een sneaker-ballerina (PUMA Speedcat ballerina's) is een sneaker.
    const sneaker = cat === "footwear" && isSneaker(p);
    if (cat === "footwear" && !sneaker && HAK_RE.test(naam)) return `hak bij ${stijlen.join(" en ")}`;
    if (cat === "footwear" && !sneaker && BALLERINA_RE.test(naam)) return `ballerina bij ${stijlen.join(" en ")}`;
    if (cat === "accessory" && CLUTCH_RE.test(naam)) return `clutch bij ${stijlen.join(" en ")}`;
  }
  if (stijlen.length > 0 && stijlen.every((s) => s === "athletic")) {
    if (cat === "footwear" && !isSneaker(p)) return "geen sneaker bij sportief";
  }
  return null;
}

/** Donker volgens de tags, of anders volgens de eerste kleur ("zwart/wit" telt als zwart). */
export function isDonker(p: Product): boolean {
  const l = String(p.lightness ?? "").toLowerCase();
  if (l) return l === "donker";
  const kleur = String((p.colors ?? [])[0] ?? p.color ?? "").toLowerCase().split("/")[0].trim();
  return DONKERE_KLEUREN.has(kleur);
}

/** Regels over de outfit als geheel. Leeg betekent: mag. */
export function outfitBreuken(products: Product[], a: PoortAntwoorden): string[] {
  const breuken: string[] = [];
  for (const p of products) {
    const b = productBreuk(p, a);
    if (b) breuken.push(`${b}: ${p.name}`);
  }
  if (String(a.lightness ?? "").toLowerCase() === "licht") {
    const donker = products.filter(isDonker).length;
    if (donker > 1) breuken.push(`${donker} donkere stukken bij licht`);
  }
  return breuken;
}
