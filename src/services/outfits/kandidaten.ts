import { reclassifyProducts } from "@/engine/productClassifier";
import { filterVeiligeProducten } from "@/engine/productSafety";
import type { Product } from "@/engine/types";

export type KandidatenGender = "male" | "female" | "unisex";

/** Parameters van de RPC get_kandidaten (spec 5.3), in de volgorde van de functie. */
export interface KandidatenParams {
  p_gender: KandidatenGender;
  p_occasions: string[];
  p_budget_min: number;
  p_budget_max: number;
  p_axes: Record<string, never>;
  p_liked_ids: string[];
  p_disliked_ids: string[];
  p_per_category: number;
}

/** Een rij uit get_kandidaten. `product` is de volledige products-rij als json. */
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

function naarGender(raw: unknown): KandidatenGender {
  return raw === "male" || raw === "female" ? raw : "unisex";
}

function naarGelegenheden(raw: unknown): string[] {
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

/** Vertaalt de bestaande quiz-antwoorden (LS_KEYS.QUIZ_ANSWERS) naar de RPC-parameters. */
export function naarKandidatenParams(answers: Record<string, any>): KandidatenParams {
  const a = answers ?? {};
  const budget = naarBudget(a);
  return {
    p_gender: naarGender(a.gender),
    p_occasions: naarGelegenheden(a.occasions),
    p_budget_min: budget.min,
    p_budget_max: budget.max,
    p_axes: {},
    p_liked_ids: [],
    p_disliked_ids: [],
    p_per_category: KANDIDATEN_PER_CATEGORIE,
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

/**
 * Van RPC-rijen naar de pool die engine v2 krijgt. De categorie komt uit
 * product_attributes (rij.category, na de classifier van taak 2), niet uit
 * de ruwe feed. reclassifyProducts draait daarna als tweede net; het is
 * dezelfde code, dus hij hoort niets te veranderen (zie
 * telCategorieAfwijkingen). Daarna het veiligheidsnet tegen kinderkleding.
 * De dedupe zit in de database (canonical_id), dus dedupeProductVariants
 * wordt hier niet meer aangeroepen.
 */
export function bereidKandidatenVoor(rijen: KandidaatRij[]): Product[] {
  const ruw = rijen.map((rij) => ({
    ...mapKandidaatProduct(rij.product),
    category: rij.category,
  }));
  const { classified } = reclassifyProducts(ruw);
  const { veilig, geweigerd } = filterVeiligeProducten(classified);
  if (geweigerd.length > 0) {
    const perReden = geweigerd.reduce<Record<string, number>>((acc, g) => {
      acc[g.reden] = (acc[g.reden] ?? 0) + 1;
      return acc;
    }, {});
    console.log("[kandidaten] veiligheidsnet weigerde producten:", perReden);
  }
  return veilig;
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
