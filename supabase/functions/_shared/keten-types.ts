/**
 * Gedeelde types van de keten (spec 5.2 tot en met 5.5).
 *
 * Dit bestand is de bron. Het staat in supabase/functions/_shared omdat een
 * edge function bij deploy alleen bestanden binnen supabase/functions kan
 * meenemen. src/keten/types.ts exporteert alles hier opnieuw voor de client,
 * de scripts en plan 4. Geen imports, geen Deno- of browser-globals: Deno,
 * Vite en vitest lezen hetzelfde bestand.
 *
 * Wie controleert dit bestand: `npx tsc --noEmit` alleen via de re-export in
 * src/keten/types.ts; `npm run typecheck:keten` rechtstreeks; en
 * `npm run check:shared` (deno check) rechtstreeks. tsconfig.json heeft
 * include: ["src"], dus zonder die twee scripts wordt de rest van deze map
 * nooit getypecheckt.
 *
 * ProductAttrs is afgeleid van migratie
 * supabase/migrations/20260925090000_keten_get_kandidaten_attrs_expliciet.sql,
 * niet van spec 5.1 rechtstreeks: die migratie bouwt attrs met
 * jsonb_build_object en levert twaalf velden, niet de zestien van
 * product_attributes zelf. Bij twijfel of dit nog klopt: draai de query
 * onderaan de ProductAttrs-definitie en vergelijk de sleutels.
 */

export type Geslacht = 'male' | 'female' | 'unisex';

export type Gelegenheid =
  | 'work'
  | 'casual'
  | 'formal'
  | 'date'
  | 'travel'
  | 'sport'
  | 'party';

export const GELEGENHEDEN: readonly Gelegenheid[] = [
  'work',
  'casual',
  'formal',
  'date',
  'travel',
  'sport',
  'party',
];

export type Categorie =
  | 'top'
  | 'bottom'
  | 'footwear'
  | 'outerwear'
  | 'dress'
  | 'accessory';

export const CATEGORIEEN: readonly Categorie[] = [
  'top',
  'bottom',
  'footwear',
  'outerwear',
  'dress',
  'accessory',
];

export type AsNaam =
  | 'formality'
  | 'silhouette'
  | 'color_temp'
  | 'lightness'
  | 'pattern'
  | 'shoe_type';

export const AS_NAMEN: readonly AsNaam[] = [
  'formality',
  'silhouette',
  'color_temp',
  'lightness',
  'pattern',
  'shoe_type',
];

export interface AsWaarde {
  /** formality: 1 tot 5; de andere assen: de tekstwaarde uit spec 5.1; null als onbekend */
  value: string | number | null;
  /** 0 tot 1, zie spec 5.2: |gekozen - afgewezen| / aantal keuzes op de as */
  confidence: number;
}

export type Assen = Record<AsNaam, AsWaarde>;

export function legeAssen(): Assen {
  return {
    formality: { value: null, confidence: 0 },
    silhouette: { value: null, confidence: 0 },
    color_temp: { value: null, confidence: 0 },
    lightness: { value: null, confidence: 0 },
    pattern: { value: null, confidence: 0 },
    shoe_type: { value: null, confidence: 0 },
  };
}

export interface Keuze {
  pair_id: string;
  chosen_set_id: string;
  rejected_set_id: string;
  axis: AsNaam;
}

/** Rij uit taste_profiles (spec 5.2). Plan 4 maakt de tabel; plan 3 gebruikt de vorm. */
export interface TasteProfile {
  id: string;
  profile_hash: string;
  user_id: string | null;
  session_id: string;
  gender: Geslacht;
  occasions: Gelegenheid[];
  budget_min: number;
  budget_max: number;
  nogo_product_ids: string[];
  choices: Keuze[];
  axes: Assen;
  liked_product_ids: string[];
  disliked_product_ids: string[];
  created_at: string;
}

/** Wat de client aanlevert voordat de rij bestaat: alles behalve id, hash en tijd. */
export type TasteProfileInput = Omit<TasteProfile, 'id' | 'profile_hash' | 'created_at'>;

/**
 * attrs zoals get_kandidaten hem teruggeeft, niet "product_attributes zonder
 * embedding". De vorige versie van dit type (16 velden: is_fashion, gender,
 * price_band, confidence, tagger_version erbij) matchte de oude
 * to_jsonb(pa) - 'embedding'-vorm van de RPC. Die vorm liep op de
 * statement-timeout zodra er embeddings in de tabel stonden (6.198 van
 * 16.023 kandidaten op 25 september) en is vervangen door migratie
 * 20260925090000, die attrs met een expliciete jsonb_build_object van twaalf
 * velden opbouwt. Zelf gecontroleerd op de live database:
 *
 *   supabase db query --linked "select jsonb_object_keys(attrs) from
 *   get_kandidaten('female', array['casual']::text[], 0, 200, '{}'::jsonb,
 *   null, null, 1) limit 20" -o table
 *
 * geeft precies deze twaalf sleutels (per rij herhaald): category,
 * classifier_version, formality, occasions, silhouette, color_temp,
 * lightness, pattern, shoe_type, colors, materials, seasons.
 *
 * is_fashion, gender, price_band, confidence en tagger_version staan wel op
 * product_attributes (spec 5.1) maar niet in attrs: gender en price_band
 * staan al op het "product"-object (products.gender, en price_band is
 * afgeleid van products.price); confidence, tagger_version en tagged_at zijn
 * interne tag-boekhouding zonder consument in get_kandidaten. Niet
 * optioneel maken: optioneel suggereert dat ze soms wel meekomen, en dat
 * gebeurt nooit. Heeft een latere taak zo'n veld nodig, dan moeten de RPC en
 * dit type samen mee als een zichtbare migratie, niet als een stille
 * undefined.
 */
export interface ProductAttrs {
  category: Categorie;
  /**
   * Verplicht, nooit null: de basis-CTE van get_kandidaten filtert op
   * `pa.classifier_version is not null` (migratie 20260925090000, regel
   * "and pa.classifier_version is not null"). Bewaakt ook door
   * src/services/outfits/__tests__/getKandidaten.live.test.ts
   * (`rij.attrs.classifier_version` toBeTruthy()).
   */
  classifier_version: string;
  formality: number | null;
  occasions: string[];
  silhouette: string | null;
  color_temp: string | null;
  lightness: string | null;
  pattern: string | null;
  /** null als het item geen footwear is (spec 5.1) */
  shoe_type: string | null;
  colors: string[];
  materials: string[];
  seasons: string[];
}

/** De ruwe products-rij zoals get_kandidaten hem in product zet. */
export interface RuwProduct {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  image_url: string | null;
  retailer: string | null;
  url: string | null;
  affiliate_url: string | null;
  product_url: string | null;
  gender: string | null;
  colors: string[] | null;
  sizes: string[] | null;
  in_stock: boolean | null;
  description: string | null;
}

/** Een rij uit get_kandidaten (spec 5.3). */
export interface Kandidaat {
  product_id: string;
  category: Categorie;
  score: number;
  attrs: ProductAttrs;
  product: RuwProduct;
}

/** Wat het model teruggeeft (spec 5.4, punt 2). */
export interface StylistItem {
  product_id: string;
  role: Categorie;
}

export interface StylistOutfit {
  title: string;
  occasion: Gelegenheid;
  items: StylistItem[];
  reason: string;
}

/** Wat in outfit_sets.outfits staat en naar de client gaat: verrijkt met productdata. */
export interface VerrijktItem extends StylistItem {
  product: RuwProduct;
  attrs: ProductAttrs;
}

export interface VerrijkteOutfit {
  /** sha256 van de gesorteerde, ontdubbelde product_ids met komma (spec 5.6; zelfde formule als outfitKey in src/services/ratings/outfitRatings.ts) */
  outfit_key: string;
  title: string;
  occasion: Gelegenheid;
  items: VerrijktItem[];
  reason: string;
}

export type OutfitBron = 'stylist' | 'cache' | 'v2-fallback';

/**
 * Versie van de stylist-prompt en het validatieschema (spec 5.4, taak 5).
 * Hoort inhoudelijk bij stylist-prompt.ts, maar staat hier omdat dit het
 * enige bestand van de drie is zonder eigen imports: stylist-prompt.ts
 * importeert Deno-stijl met een expliciete .ts-extensie
 * (`from './keten-types.ts'`), en dat breekt `npx tsc --noEmit` zodra een
 * src-bestand (zoals composeClient.ts, taak 7) stylist-prompt.ts transitief
 * meeneemt: de hoofd-tsconfig kent geen allowImportingTsExtensions, in
 * tegenstelling tot tsconfig.keten.json. Verhoog je de prompt of het schema,
 * verhoog dan deze constante; dat maakt de cache in outfit_sets automatisch
 * ongeldig voor de oude versie. stylist-prompt.ts re-exporteert hem
 * ongewijzigd zodat bestaande imports uit dat bestand blijven werken.
 */
export const STYLIST_VERSION = 'stylist-v1';

export interface ComposeVerzoek {
  profile_hash: string;
  profile: TasteProfileInput;
  kandidaten: Kandidaat[];
}

export type ComposeAntwoord =
  | {
      fallback: false;
      source: 'stylist' | 'cache';
      stylist_version: string;
      model: string;
      latency_ms: number;
      /** Tokenverbruik van de aanroep(en) die deze set maakten; null bij een oude cache-rij zonder die kolommen */
      input_tokens: number | null;
      output_tokens: number | null;
      outfits: VerrijkteOutfit[];
    }
  | {
      fallback: true;
      reason: string;
      kandidaten: Kandidaat[];
    };
