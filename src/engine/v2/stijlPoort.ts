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

/** Categorieen die het beeld van een outfit bepalen. Een accessoire doet dat niet. */
const BEELDBEPALEND = new Set(["top", "bottom", "dress", "jumpsuit", "outerwear", "footwear"]);

/** De reden waarom dit stuk niet bij de keuze van de bezoeker past, of null. */
export function productBreuk(p: Product, a: PoortAntwoorden): string | null {
  const stijlen = gekozenStijlen(a);
  const naam = p.name ?? "";
  const cat = categorie(p);

  // Stijllabels van de stijl-agent (keten_stijl_labels). Een beeldbepalend
  // stuk met labels moet een van de gekozen stijlen hebben.
  const labels = Array.isArray(p.stijlen) ? (p.stijlen as string[]) : null;
  if (labels && stijlen.length > 0 && BEELDBEPALEND.has(cat) && !labels.some((s) => stijlen.includes(s))) {
    return `geen ${stijlen.join(" of ")} volgens de stijl-agent`;
  }

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

/** Vanaf zoveel gelabelde stukken in de gekozen stijl vallen de ongelabelde in die categorie weg. */
export const MIN_GELABELD = 6;

/**
 * Geef gelabelde stukken voorrang. Heeft een beeldbepalende categorie genoeg
 * stukken die de stijl-agent bij de gekozen stijl plaatst, dan doen de
 * ongelabelde stukken in die categorie niet mee: die komen uit de pool zonder
 * stijl (get_kandidaten) en zijn de reden dat een streetwear-profiel blouses
 * en pantalons kreeg. Zijn er te weinig, dan blijven ze als terugval.
 */
export function voorkeurVoorGelabeld(products: Product[], a: PoortAntwoorden): Product[] {
  const stijlen = gekozenStijlen(a);
  if (stijlen.length === 0) return products;
  const genoeg = new Map<string, number>();
  for (const p of products) {
    const cat = categorie(p);
    const labels = Array.isArray(p.stijlen) ? (p.stijlen as string[]) : null;
    if (labels && BEELDBEPALEND.has(cat) && labels.some((s) => stijlen.includes(s))) {
      genoeg.set(cat, (genoeg.get(cat) ?? 0) + 1);
    }
  }
  return products.filter((p) => {
    const cat = categorie(p);
    if (!BEELDBEPALEND.has(cat) || Array.isArray(p.stijlen)) return true;
    return (genoeg.get(cat) ?? 0) < MIN_GELABELD;
  });
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

// ---------------------------------------------------------------------------
// Accessoires die botsen
// ---------------------------------------------------------------------------

const RIEM_RE = /\b(riem|ceintuur|belt)\b/i;
const STROPDAS_RE = /\b(stropdas|tie|vlinderdas)\b/i;
const OVERHEMD_RE = /overhemd|\bshirt\b.*(heren|men)|oxford|popeline/i;
const COLBERT_RE = /colbert|blazer|jasje|smoking|pak\b/i;
const NETTE_SCHOEN_RE = /loafer|derby|blucher|blücher|veter|brogue|oxford|chelsea|laars|boots|pump|hak|geklede|mocassin/i;

/** Kleurfamilie voor riem en schoenen; null als de kleur niet te plaatsen is. */
function familie(p: Product): "zwart" | "bruin" | "licht" | "bont" | null {
  const k = String((p.colors ?? [])[0] ?? "").toLowerCase();
  if (!k) return null;
  if (/multi|print|dessin|gestreept|ruit/.test(k)) return "bont";
  if (/zwart|black|antraciet|donkergrijs|grijs|grey|gray/.test(k)) return "zwart";
  if (/bruin|brown|cognac|camel|tan\b|chocolade/.test(k)) return "bruin";
  if (/beige|taupe|crème|creme|wit|white|naturel|ecru|zand/.test(k)) return "licht";
  return null;
}

/**
 * De outfit zonder accessoires die botsen. Een riem bij nette schoenen hoort in
 * dezelfde kleurfamilie (bij sneakers mag alles); een veelkleurige riem bij
 * nette schoenen valt altijd weg. Een stropdas blijft alleen bij een overhemd
 * met colbert. De outfit zelf blijft compleet: een accessoire is nooit
 * verplicht.
 */
export function zonderBotsendAccessoire(products: Product[]): Product[] {
  const schoen = products.find((p) => categorie(p) === "footwear");
  const netteSchoen = schoen && !isSneaker(schoen) && NETTE_SCHOEN_RE.test(schoen.name ?? "");
  const metOverhemd = products.some((p) => categorie(p) === "top" && OVERHEMD_RE.test(p.name ?? ""));
  const metColbert = products.some((p) => ["outerwear", "top"].includes(categorie(p)) && COLBERT_RE.test(p.name ?? ""));
  return products.filter((p) => {
    if (categorie(p) !== "accessory") return true;
    const naam = p.name ?? "";
    if (RIEM_RE.test(naam) && netteSchoen) {
      const riem = familie(p);
      const schoenFamilie = familie(schoen!);
      if (riem === "bont") return false;
      if (riem && schoenFamilie && riem !== schoenFamilie) return false;
    }
    if (STROPDAS_RE.test(naam) && !(metOverhemd && metColbert)) return false;
    return true;
  });
}
