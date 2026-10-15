import { reclassifyProducts } from "@/engine/productClassifier";
import { filterVeiligeProducten } from "@/engine/productSafety";
import type { Product } from "@/engine/types";

export type KandidatenGender = "male" | "female" | "unisex";

/** Een stijlas voor get_kandidaten: de waarde die de bezoeker koos en hoe zeker dat is. */
export interface StijlAs {
  value: string;
  confidence: number;
}

/** De assen die de app meestuurt; get_kandidaten vergelijkt ze exact met product_attributes. */
export type StijlAssen = Partial<Record<"silhouette" | "pattern", StijlAs>>;

/** Parameters van de RPC get_kandidaten (spec 5.3), in de volgorde van de functie. */
export interface KandidatenParams {
  p_gender: KandidatenGender;
  p_occasions: string[];
  p_budget_min: number;
  p_budget_max: number;
  p_axes: StijlAssen;
  p_liked_ids: string[];
  p_disliked_ids: string[];
  p_per_category: number;
}

/**
 * De velden van `product` in een rij uit get_kandidaten. Sinds migratie
 * 20261002120000 komt product uit keten_kandidaat_product, een compacte kopie
 * met alleen de velden die de code leest: mapKandidaatProduct hieronder, en
 * productVanKandidaat van de stylist. Leest de code een veld meer, zet het dan
 * ook in keten_kandidaat_product_json; de test in kandidaten.test.ts faalt tot
 * dat gebeurd is.
 */
export const KANDIDAAT_PRODUCT_VELDEN = [
  "id",
  "name",
  "brand",
  "price",
  "image_url",
  "category",
  "type",
  "gender",
  "colors",
  "sizes",
  "tags",
  "style",
  "retailer",
  "affiliate_url",
  "product_url",
  "description",
  "in_stock",
  "rating",
  "review_count",
] as const;

/** Een rij uit get_kandidaten. `product` bevat de velden uit KANDIDAAT_PRODUCT_VELDEN. */
export interface KandidaatRij {
  product_id: string;
  category: string;
  score: number;
  attrs: Record<string, unknown>;
  product: Record<string, any>;
}

export const GELEGENHEDEN = ["work", "casual", "formal", "date", "travel", "sport", "party"] as const;

/**
 * 40 per categorie in plaats van de 12 uit de spec: die 12 is voor het
 * stylist-model (plan 3). Engine v2 componeert zelf en heeft meer keuze nodig
 * om zes verschillende outfits te maken. Maximaal 240 rijen.
 */
export const KANDIDATEN_PER_CATEGORIE = 40;

const STANDAARD_BUDGET_MAX = 150;

/**
 * Geëxporteerd (naast intern gebruik in naarKandidatenParams) zodat
 * profielIdentiteit.ts dezelfde gender/gelegenheden-normalisatie kan
 * hergebruiken voor profile_hash en de engine-seed: dat zijn precies de
 * velden die hier ook de RPC-kandidatenpool bepalen (spec 5.2.1 vs 5.3).
 */
export function naarGender(raw: unknown): KandidatenGender {
  return raw === "male" || raw === "female" ? raw : "unisex";
}

export function naarGelegenheden(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const uit: string[] = [];
  for (const item of raw) {
    let norm = String(item).toLowerCase().trim();
    if (norm === "sports") norm = "sport";
    if ((GELEGENHEDEN as readonly string[]).includes(norm) && !uit.includes(norm)) uit.push(norm);
  }
  return uit;
}

function naarBudget(answers: Record<string, any>): { min: number; max: number } {
  const b = answers.budget;
  if (b && typeof b === "object" && typeof b.max === "number" && b.max > 0) {
    const min = typeof b.min === "number" ? b.min : 0;
    const laag = Math.max(0, Math.floor(Math.min(min, b.max)));
    const hoog = Math.max(laag, Math.ceil(Math.max(min, b.max)));
    return { min: laag, max: hoog };
  }
  if (typeof answers.budgetRange === "number" && answers.budgetRange > 0) {
    return { min: 0, max: Math.ceil(answers.budgetRange) };
  }
  return { min: 0, max: STANDAARD_BUDGET_MAX };
}

/** De RPC levert per categorie minstens 1 en hooguit 60 (greatest(1, least(60, p_per_category))). */
const MIN_PER_CATEGORIE = 1;
const MAX_PER_CATEGORIE = 60;

function naarPerCategorie(waarde: number | undefined): number {
  if (waarde === undefined || !Number.isFinite(waarde)) return KANDIDATEN_PER_CATEGORIE;
  return Math.min(MAX_PER_CATEGORIE, Math.max(MIN_PER_CATEGORIE, Math.floor(waarde)));
}

const PASVORMEN = ["slim", "regular", "relaxed", "oversized"];
const PRINTS = ["effen", "subtiel", "statement"];

function gekozen(raw: unknown, toegestaan: string[]): StijlAs | undefined {
  const waarde = typeof raw === "string" ? raw.trim().toLowerCase() : Array.isArray(raw) ? String(raw[0] ?? "").trim().toLowerCase() : "";
  return toegestaan.includes(waarde) ? { value: waarde, confidence: 1 } : undefined;
}

/**
 * De stijlassen uit de quiz die over het kledingstuk zelf gaan: pasvorm en
 * prints. De bezoeker koos ze zelf, dus zekerheid 1 (zelfde keuze als
 * vanQuiz.ts in de stylist, plan 3). De quizwaarden zijn exact de waarden van
 * de tagger. "gemengd" bij prints is geen as.
 *
 * Tot 15 oktober 2026 stuurde de app p_axes {} mee. get_kandidaten scoort
 * 0,5 op de assen, 0,3 op de gelegenheid en 0,2 op gelikete producten; zonder
 * assen en likes kreeg elk product alleen de gelegenheidsscore, die voor
 * duizenden producten gelijk is, en koos het product-ID welke 40 per
 * categorie de engine te zien kreeg.
 *
 * Kleurtemperatuur en lichtheid gaan bewust niet mee. Gemeten op Lucs quiz
 * (warm, licht): met die twee erbij paste elk van de 200 producten op alle
 * vier de assen en werd elke outfit beige van top tot schoen, met 4 van de 6
 * casual. Een outfit leeft van contrast; de kleurvoorkeur geldt voor het
 * geheel, en daar weegt de engine al op (kleurscore en harmonie per outfit).
 * Met alleen pasvorm en print: gevarieerde kleuren en 2 werk, 2 casual,
 * 2 formeel.
 */
export function naarAssen(answers: Record<string, any>): StijlAssen {
  const a = answers ?? {};
  const assen: StijlAssen = {};
  const silhouette = gekozen(a.fit, PASVORMEN);
  const pattern = gekozen(a.prints, PRINTS);
  if (silhouette) assen.silhouette = silhouette;
  if (pattern) assen.pattern = pattern;
  return assen;
}

/**
 * Vertaalt de bestaande quiz-antwoorden (LS_KEYS.QUIZ_ANSWERS) naar de
 * RPC-parameters. `perCategorie` is voor wie meer of minder dan de 40 van de
 * engine wil (de shop vraagt het maximum); het wordt begrensd op wat de RPC
 * levert.
 */
export function naarKandidatenParams(answers: Record<string, any>, perCategorie?: number): KandidatenParams {
  const a = answers ?? {};
  const budget = naarBudget(a);
  return {
    p_gender: naarGender(a.gender),
    p_occasions: naarGelegenheden(a.occasions),
    p_budget_min: budget.min,
    p_budget_max: budget.max,
    p_axes: naarAssen(a),
    p_liked_ids: [],
    p_disliked_ids: [],
    p_per_category: naarPerCategorie(perCategorie),
  };
}

/** Zelfde mapping als OutfitService.mapDatabaseProduct had; nu deelbaar met scripts. */
export function mapKandidaatProduct(dbProduct: Record<string, any>): Product {
  const tags: string[] = dbProduct.tags || [];
  const style: string = dbProduct.style || "";
  const styleTags = style
    ? [...tags, ...style.split(/[,;/]+/).map((s: string) => s.trim()).filter(Boolean)]
    : tags;

  return {
    id: dbProduct.id,
    name: dbProduct.name || dbProduct.title,
    brand: dbProduct.brand,
    price: typeof dbProduct.price === "string" ? Number(dbProduct.price) : dbProduct.price,
    imageUrl: dbProduct.image_url || dbProduct.imageUrl,
    category: dbProduct.category,
    type: dbProduct.type,
    gender: dbProduct.gender,
    colors: dbProduct.colors || [],
    color: (dbProduct.colors || [])[0],
    sizes: dbProduct.sizes || [],
    tags,
    styleTags,
    retailer: dbProduct.retailer,
    affiliateUrl: dbProduct.affiliate_url || dbProduct.affiliateUrl,
    productUrl: dbProduct.product_url || dbProduct.productUrl,
    description: dbProduct.description,
    inStock: dbProduct.in_stock ?? true,
    rating: dbProduct.rating,
    reviewCount: dbProduct.review_count,
  };
}

/** Rijke uitkomst van de poolopbouw, voor wie de afgevallen aantallen nodig heeft. */
export interface KandidatenPoolMetDiagnose {
  pool: Product[];
  /** Aantal producten dat reclassifyProducts volledig afkeurde (result.rejected). */
  classifierAfgekeurd: number;
  /** Aantal producten dat het veiligheidsnet weigerde, met reden in geweigerdPerReden. */
  veiligheidsnetGeweigerd: number;
  geweigerdPerReden: Record<string, number>;
}

/**
 * Bouwt de pool en meet in één klassificatiepas hoeveel producten onderweg
 * afvallen. `bereidKandidatenVoor` gebruikt dit intern en geeft alleen de
 * pool terug (het contract uit de brief); `bereidKandidatenVoorMetDiagnose`
 * geeft er de aantallen bij voor wie de stopregel programmatisch wil
 * bewaken in plaats van op een consolelog te vertrouwen (taak 7, het
 * persona-harnas).
 */
function bouwKandidatenPool(rijen: KandidaatRij[]): KandidatenPoolMetDiagnose {
  const ruw = rijen.map((rij) => ({
    ...mapKandidaatProduct(rij.product),
    category: rij.category,
  }));
  const { classified, rejected } = reclassifyProducts(ruw);
  const { veilig, geweigerd } = filterVeiligeProducten(classified);
  const geweigerdPerReden = geweigerd.reduce<Record<string, number>>((acc, g) => {
    acc[g.reden] = (acc[g.reden] ?? 0) + 1;
    return acc;
  }, {});
  if (rejected.length > 0 || geweigerd.length > 0) {
    // console.debug in plaats van console.log: dit draait straks (taak 7) bij
    // elke bezoeker van de resultatenpagina mee, en hoort dus niet standaard
    // in ieders browserconsole te verschijnen. Zelfde patroon als elders in
    // de repo, bijvoorbeeld src/services/supabaseService.ts.
    console.debug("[kandidaten] producten uit de pool gehaald:", {
      classifier_afgekeurd: rejected.length,
      veiligheidsnet_geweigerd: geweigerdPerReden,
    });
  }
  return {
    pool: veilig,
    classifierAfgekeurd: rejected.length,
    veiligheidsnetGeweigerd: geweigerd.length,
    geweigerdPerReden,
  };
}

/**
 * Van RPC-rijen naar de pool die engine v2 krijgt. De categorie komt uit
 * product_attributes (rij.category, na de classifier van taak 2), niet uit
 * de ruwe feed. reclassifyProducts draait daarna als tweede net; het is
 * dezelfde code, dus hij hoort niets te veranderen (zie
 * telCategorieAfwijkingen). Daarna het veiligheidsnet tegen kinderkleding.
 * De dedupe zit in de database (canonical_id), dus dedupeProductVariants
 * wordt hier niet meer aangeroepen.
 *
 * Producten die reclassifyProducts volledig afkeurt (rejected, bijvoorbeeld
 * onclassificeerbaar) verdwijnen hier stil uit de pool, net als de
 * producten die het veiligheidsnet weigert. bereidKandidatenVoorMetDiagnose
 * geeft die aantallen terug voor wie ze nodig heeft.
 */
export function bereidKandidatenVoor(rijen: KandidaatRij[]): Product[] {
  return bouwKandidatenPool(rijen).pool;
}

/** Zelfde als bereidKandidatenVoor, met de aantallen die onderweg zijn afgevallen. */
export function bereidKandidatenVoorMetDiagnose(rijen: KandidaatRij[]): KandidatenPoolMetDiagnose {
  return bouwKandidatenPool(rijen);
}

/**
 * Hoeveel producten in de pool een andere categorie hebben dan
 * product_attributes zei. Hoort 0 te zijn; anders is de classificatie in de
 * database ouder dan de code (stopregel 2 in het plan): draai
 * scripts/keten/classificeer-attributes.ts opnieuw.
 */
export function telCategorieAfwijkingen(rijen: KandidaatRij[], pool: Product[]): number {
  const verwacht = new Map(rijen.map((r) => [String(r.product_id), String(r.category).toLowerCase()]));
  let afwijkingen = 0;
  for (const p of pool) {
    const db = verwacht.get(String(p.id));
    if (db && String(p.category ?? "").toLowerCase() !== db) afwijkingen++;
  }
  return afwijkingen;
}
