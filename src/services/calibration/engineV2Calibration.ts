/**
 * Calibratie-outfits uit engine v2.
 *
 * Achtergrond (2026-08-06). Het calibratiescherm (`CalibrationStep`) haalde
 * zijn drie outfits uit `adaptiveOutfitGenerator` via `calibrationBridge`. Dat
 * pad heeft geen tests en negeerde in de praktijk de antwoorden van de
 * gebruiker:
 *
 * - de gekozen gelegenheid werd niet doorgegeven maar teruggerekend uit een
 *   formaliteitsscore, waardoor "Werk" als "Casual dag uit" op de kaart kwam;
 * - het budget werd platgeslagen tot 'low' | 'medium' | 'high' en die tier
 *   werd vervolgens overschreven door een default uit een lege swipe-historie,
 *   zodat er niets van het ingevulde bedrag overbleef;
 * - de bottom- en footwear-slot hadden helemaal geen prijsfilter;
 * - het vangnet `productSafety` werd niet aangeroepen.
 *
 * Deze module zet het scherm op `runEngineV2`, de enige generator met een
 * golden baseline. De engine doet het werk (classificatie, gender, archetype,
 * gelegenheid, coherentie); deze module doet drie dingen daaromheen:
 *
 * 1. vertaalt de quiz-antwoorden 1-op-1 naar het antwoord-formaat van de
 *    engine, zonder onderweg informatie weg te gooien;
 * 2. snoeit de productpool vooraf op `productSafety.beoordeelProduct` en op
 *    een harde prijsgrens per stuk, zodat de engine een onveilig of te duur
 *    product niet eens kan kiezen;
 * 3. keurt elke gecomponeerde outfit af die niet op de kaart past: geen twee
 *    items in dezelfde slot, altijd een top, een bottom en schoenen, geen
 *    winter-zomerbotsing.
 *
 * De scoringlogica van de engine wordt hier niet aangeraakt.
 */
import { runEngineV2 } from '@/engine/v2';
import type { Outfit, Product, Season } from '@/engine/types';
import { beoordeelProduct, seizoenenBotsen } from '@/engine/productSafety';
import { productVariantKey } from '@/services/outfits/dedupeProductVariants';
import type {
  CalibrationOutfit,
  CalibrationOutfitItem,
} from '@/services/visualPreferences/calibrationService';
import type { ArchetypeWeights } from '@/types/style';
import type { ArchetypeKey } from '@/config/archetypes';

/** Slots die de calibratiekaart kan tonen. */
export type CalibrationSlot =
  | 'top'
  | 'bottom'
  | 'shoes'
  | 'outerwear'
  | 'accessory';

/** Slots die een outfit moet hebben om bruikbaar te zijn op de kaart. */
const VERPLICHTE_SLOTS: CalibrationSlot[] = ['top', 'bottom', 'shoes'];

/**
 * Categorie zoals engine v2 die normaliseert (`NormalizedCategory`) naar de
 * slot van de calibratiekaart. `dress` en `jumpsuit` hebben geen slot: die
 * outfits vallen af op de eis "top, bottom en schoenen".
 */
const SLOT_VAN_CATEGORIE: Record<string, CalibrationSlot | undefined> = {
  top: 'top',
  bottom: 'bottom',
  footwear: 'shoes',
  outerwear: 'outerwear',
  accessory: 'accessory',
};

export type AfkeurReden =
  | 'dubbele-slot'
  | 'slot-ontbreekt'
  | 'onveilig-product'
  | 'boven-budget'
  | 'seizoensbotsing'
  | 'andere-gelegenheid';

export interface CalibrationQuizData {
  gender?: string;
  stylePreferences?: string[];
  occasions?: string[];
  budget?: { min?: number; max?: number };
  budgetRange?: number;
  sizes?: Record<string, string>;
  [key: string]: unknown;
}

export interface BuildCalibrationOptions {
  /** Aantal outfits dat het scherm nodig heeft. Default 3. */
  count?: number;
  /** Vaste seed voor reproduceerbare uitkomsten (tests, evals). */
  seed?: number;
  /** Seizoen; zonder waarde gebruikt de engine de klok. */
  season?: Season;
}

/**
 * Het maximum per stuk zoals de gebruiker het invulde. Spiegelt bewust
 * `buildProfile.parseBudget` van de engine, zodat de pool-grens en de
 * engine-grens op hetzelfde bedrag slaan.
 */
export function resolveBudgetMax(quizData: CalibrationQuizData | undefined): number {
  const explicit = quizData?.budget;
  if (explicit && typeof explicit.max === 'number' && explicit.max > 0) {
    return Math.max(15, explicit.max);
  }
  if (typeof quizData?.budgetRange === 'number' && quizData.budgetRange > 0) {
    return Math.max(15, quizData.budgetRange);
  }
  return 150;
}

/**
 * Quiz-antwoorden naar het antwoord-formaat van de engine. Alles wat de
 * gebruiker invulde gaat mee; `budget` wordt expliciet gezet zodat de engine
 * niet op de default van 150 terugvalt wanneer alleen `budgetRange` bestaat.
 */
export function buildCalibrationAnswers(
  quizData: CalibrationQuizData | undefined
): Record<string, unknown> {
  const budgetMax = resolveBudgetMax(quizData);
  const budgetMin =
    typeof quizData?.budget?.min === 'number' ? quizData.budget.min : 0;

  return {
    ...(quizData ?? {}),
    budget: { min: Math.min(budgetMin, budgetMax), max: budgetMax },
    budgetRange: budgetMax,
    occasions: Array.isArray(quizData?.occasions) ? quizData.occasions : [],
  };
}

/**
 * De pool waaruit de engine mag kiezen: alles wat het vangnet doorlaat en
 * binnen het maximum per stuk valt. Een product zonder prijs blijft staan; de
 * engine rekent daar zelf met 0 en de kaart toont dan geen bedrag.
 */
export function selectCalibrationPool(
  products: Product[],
  budgetMax: number
): { pool: Product[]; geweigerd: Array<{ product: Product; reden: string }> } {
  const pool: Product[] = [];
  const geweigerd: Array<{ product: Product; reden: string }> = [];

  for (const product of products) {
    const verdict = beoordeelProduct({
      name: product.name,
      category: product.category,
      sizes: product.sizes,
    });
    if (!verdict.ok) {
      geweigerd.push({ product, reden: verdict.reden ?? 'onbekend' });
      continue;
    }
    if (typeof product.price === 'number' && product.price > budgetMax) {
      geweigerd.push({ product, reden: 'boven-budget' });
      continue;
    }
    pool.push(product);
  }

  return { pool, geweigerd };
}

function toCalibrationItem(product: Product): CalibrationOutfitItem {
  return {
    id: product.id,
    // Zonder maat-achtervoegsel. De feed levert elke maat als aparte rij en
    // `dedupeProductVariants` houdt de goedkoopste variant over: dat is hoe
    // iemand die maat M invulde een kaart met "Maat XXS" te zien kreeg,
    // terwijl het product wel degelijk in M bestaat (de maten van alle
    // varianten staan samengevoegd in `sizes`). De naam mag dus geen maat
    // suggereren die niets met de keuze van de gebruiker te maken heeft.
    name: productVariantKey(product.name),
    brand: product.brand ?? '',
    price: typeof product.price === 'number' ? product.price : 0,
    image_url: product.imageUrl ?? '',
    category: product.category,
    colors: product.colors ?? [],
    affiliate_link: product.affiliateUrl ?? product.productUrl,
  };
}

function kleurUitTags(product: Product): string[] {
  const uit: string[] = [];
  for (const tag of product.tags ?? []) {
    const match = /^kleur:(.+)$/i.exec(String(tag));
    if (match) uit.push(match[1].toLowerCase());
  }
  return uit;
}

function dominanteKleuren(products: Product[]): string[] {
  const gezien: string[] = [];
  for (const product of products) {
    for (const kleur of [...(product.colors ?? []), ...kleurUitTags(product)]) {
      const norm = String(kleur).toLowerCase().trim();
      if (norm && !gezien.includes(norm)) gezien.push(norm);
    }
  }
  return gezien.slice(0, 4);
}

export interface OutfitBeoordeling {
  ok: boolean;
  reden?: AfkeurReden;
  items?: Partial<Record<CalibrationSlot, CalibrationOutfitItem>>;
}

/**
 * Past deze engine-outfit op de calibratiekaart, en klopt hij met wat de
 * gebruiker invulde?
 */
export function beoordeelOutfit(
  outfit: Outfit,
  budgetMax: number,
  toegestaneGelegenheden: string[]
): OutfitBeoordeling {
  if (
    toegestaneGelegenheden.length > 0 &&
    !toegestaneGelegenheden.includes(outfit.occasion)
  ) {
    return { ok: false, reden: 'andere-gelegenheid' };
  }

  const items: Partial<Record<CalibrationSlot, CalibrationOutfitItem>> = {};

  for (const product of outfit.products) {
    const slot = SLOT_VAN_CATEGORIE[String(product.category ?? '').toLowerCase()];
    if (!slot) continue;
    if (items[slot]) return { ok: false, reden: 'dubbele-slot' };

    const verdict = beoordeelProduct({
      name: product.name,
      category: product.category,
      sizes: product.sizes,
    });
    if (!verdict.ok) return { ok: false, reden: 'onveilig-product' };

    if (typeof product.price === 'number' && product.price > budgetMax) {
      return { ok: false, reden: 'boven-budget' };
    }

    items[slot] = toCalibrationItem(product);
  }

  for (const slot of VERPLICHTE_SLOTS) {
    if (!items[slot]) return { ok: false, reden: 'slot-ontbreekt' };
  }

  if (seizoenenBotsen(outfit.products.map((p) => p.name))) {
    return { ok: false, reden: 'seizoensbotsing' };
  }

  return { ok: true, items };
}

function toCalibrationOutfit(
  outfit: Outfit,
  items: Partial<Record<CalibrationSlot, CalibrationOutfitItem>>,
  archetypes: ArchetypeWeights
): CalibrationOutfit {
  const getoond = Object.values(items).filter(Boolean) as CalibrationOutfitItem[];
  const getoondeProducten = outfit.products.filter((p) =>
    getoond.some((item) => item.id === p.id)
  );

  return {
    id: outfit.id,
    title: outfit.title,
    items,
    archetypes,
    dominantColors: dominanteKleuren(getoondeProducten),
    occasion: outfit.occasion,
    explanation: outfit.explanation,
    matchScore: outfit.matchPercentage / 100,
    badges: [],
  };
}

/**
 * Synchrone kern: van productlijst naar calibratie-outfits. Los van Supabase,
 * zodat de eisen op een vaste catalogus getest kunnen worden.
 */
export function buildCalibrationOutfits(
  products: Product[],
  quizData: CalibrationQuizData | undefined,
  options: BuildCalibrationOptions = {}
): CalibrationOutfit[] {
  const gevraagd = Math.max(1, options.count ?? 3);
  const budgetMax = resolveBudgetMax(quizData);
  const answers = buildCalibrationAnswers(quizData);
  const { pool } = selectCalibrationPool(products, budgetMax);

  if (pool.length === 0) return [];

  // Ruim vragen en daarna afkeuren: de engine levert per gelegenheid een
  // beperkt aantal composities, en een deel valt af op de kaart-eisen.
  const result = runEngineV2(answers, pool, {
    count: Math.max(9, gevraagd * 4),
    seed: options.seed,
    season: options.season,
  });

  const toegestaneGelegenheden = result.profile.occasions.length
    ? (result.profile.occasions as string[])
    : [];

  const archetypes: ArchetypeWeights = {
    [result.profile.primaryArchetype as ArchetypeKey]: 1,
  };
  if (result.profile.secondaryArchetype) {
    archetypes[result.profile.secondaryArchetype as ArchetypeKey] = 0.4;
  }

  const uit: CalibrationOutfit[] = [];
  for (const outfit of result.outfits) {
    const oordeel = beoordeelOutfit(outfit, budgetMax, toegestaneGelegenheden);
    if (!oordeel.ok || !oordeel.items) continue;
    uit.push(toCalibrationOutfit(outfit, oordeel.items, archetypes));
    if (uit.length >= gevraagd) break;
  }

  return uit;
}

/**
 * Alternatieven voor één slot, uit dezelfde gekeurde outfits. Zo blijft de
 * vervang-knop op de kaart binnen hetzelfde vangnet: het alternatief is per
 * definitie gender-passend, binnen budget en door productSafety heen.
 */
export function buildSlotAlternatives(
  products: Product[],
  quizData: CalibrationQuizData | undefined,
  slot: CalibrationSlot,
  options: BuildCalibrationOptions & { excludeIds?: string[] } = {}
): CalibrationOutfitItem[] {
  const uitgesloten = new Set(options.excludeIds ?? []);
  const outfits = buildCalibrationOutfits(products, quizData, {
    ...options,
    count: options.count ?? 8,
  });

  const gezien = new Set<string>();
  const uit: CalibrationOutfitItem[] = [];
  for (const outfit of outfits) {
    const item = outfit.items[slot];
    if (!item || uitgesloten.has(item.id) || gezien.has(item.id)) continue;
    gezien.add(item.id);
    uit.push(item);
  }
  return uit;
}

/**
 * Seed uit de sessie: dezelfde sessie ziet na een refresh dezelfde drie
 * outfits, een andere sessie ziet andere. Zonder sessie valt hij terug op het
 * tijdvak-gedrag van de engine (seed undefined).
 */
export function seedVoorSessie(sessionId?: string | null): number | undefined {
  if (!sessionId) return undefined;
  let hash = 2166136261;
  for (let i = 0; i < sessionId.length; i++) {
    hash ^= sessionId.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash % 1000000);
}
