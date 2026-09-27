/**
 * Client-kant van de stylist-route (spec 4 en 5.4), herzien door het
 * amendement van 27 september 2026 bij paragraaf 5.2.1 van
 * docs/superpowers/specs/2026-09-14-keten-herbouw-design.md.
 *
 * Volgorde: profiel hashen, get_kandidaten, keten_outfit_set (RPC, leest de
 * cache die het vulscript op het Claude Code-abonnement vooraf vult). Nul
 * rijen is een cache-miss, een rij is een hit. Op een hit wordt de
 * niet-wil-lijst van DEZE bezoeker alsnog toegepast: die lijst zit sinds het
 * amendement niet meer in de cache-sleutel (profileHash.ts, punt 4), dus een
 * gecachete set kan een product bevatten dat hij zelf heeft afgewezen. Blijft
 * er na dat filter te weinig over, of was het al een cache-miss, dan draait
 * hier engine v2 op dezelfde kandidaten met seed = fnv1a32(profile_hash),
 * zodat het noodpad herhaalbaar is.
 *
 * Geen fetch en geen edge function meer: het componeren gebeurt vooraf in
 * scripts/keten/stylist-vul-cache.ts, dit bestand leest alleen. Daarmee ook
 * geen functionsUrl en geen anonKey meer in KetenConfig: de Supabase-client
 * draagt zijn eigen sleutel al, en er is geen tweede sleutel voor een
 * Authorization-header nodig zoals bij de vervallen fetch naar
 * compose-outfits.
 *
 * Dit bestand kent geen import.meta.env en geen window: de browser geeft
 * zijn KetenConfig via browserConfig.ts.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { runEngineV2 } from '@/engine/v2/engine';
import type { Outfit, Product } from '@/engine/types';
import { fnv1a32 } from '@/utils/hash';
import { outfitKey } from '@/services/ratings/outfitRatings';
import { profileHash } from './profileHash';
import {
  STYLIST_VERSION,
  type AsNaam,
  type Gelegenheid,
  type Kandidaat,
  type OutfitBron,
  type TasteProfileInput,
  type VerrijktItem,
  type VerrijkteOutfit,
} from './types';

export interface KetenConfig {
  supabase: SupabaseClient;
}

export interface ComposeResultaat {
  profile_hash: string;
  bron: OutfitBron;
  model: string | null;
  latency_ms: number | null;
  /** Tokenverbruik van het vulscript; null bij het noodpad */
  input_tokens: number | null;
  output_tokens: number | null;
  /** Reden van het noodpad, anders null */
  reden: string | null;
  /** Aantal outfits dat het niet-wil-filter uit een gecachete set haalde; 0 buiten een cache-hit */
  weggevallenDoorNietWil: number;
  /** True als de RPC-aanroep een keer moest overnieuw op een statement-timeout (geen stille herkansing) */
  herkanst: boolean;
  kandidaten: Kandidaat[];
  outfits: VerrijkteOutfit[];
  /** Dezelfde outfits in de vorm die de bestaande resultatenpagina rendert */
  engineOutfits: Outfit[];
}

const PER_CATEGORIE = 12;
const AANTAL = 6;

/**
 * Grens van afwijking 2 (brief taak 7): minder dan dit aantal geldige
 * outfits na het niet-wil-filter is geen bruikbare cache-hit meer. Vier of
 * vijf outfits die geen enkel weggeveegd product bevatten zijn beter dan het
 * risico op een afgewezen product terugtonen, en ook beter dan een hele
 * gecachete set van zes wegdoen voor zes v2-outfits. De grens is een keuze,
 * geen afleiding; vandaar de benoemde constante in plaats van een letterlijk
 * getal verderop in dit bestand.
 */
export const MIN_OUTFITS_NA_NIET_WIL_FILTER = 4;

/**
 * Client-timeout op de RPC-aanroep naar keten_outfit_set. Geen
 * wachttijd-budget voor een model meer: sinds het amendement componeert
 * niets meer op het moment van bezoek, dus de oude CLIENT_TIMEOUT_MS van
 * 120 s (het budget voor een edge function die tot 100 s mocht duren) is
 * vervallen. keten_outfit_set is gemeten 41,5 ms op het slechtste geval;
 * deze timeout is alleen een vangnet tegen een verbinding die nooit
 * antwoordt. Ruim boven de statement-timeout van de anon-rol (3 s, gemeten
 * in plan 2 op pg_roles.rolconfig) zodat een database die zelf al binnen
 * die 3 s met een fout antwoordt niet alsnog door deze timeout wordt
 * ingehaald voordat die fout is verwerkt.
 */
export const RPC_TIMEOUT_MS = 5_000;

/** SQLSTATE van Postgres voor "canceling statement due to statement timeout". */
const STATEMENT_TIMEOUT_SQLSTATE = '57014';

/**
 * Vertaalt het profiel naar de answers die buildUserStyleProfile (engine v2)
 * leest: gender, occasions, budget, en alleen de assen met zekerheid >= 0.5
 * als fit, prints, neutrals en lightness.
 */
export function answersVanProfiel(p: TasteProfileInput): Record<string, unknown> {
  const zeker = (as: AsNaam): string | undefined => {
    const w = p.axes?.[as];
    if (!w || w.confidence < 0.5 || w.value === null || typeof w.value !== 'string') return undefined;
    return w.value;
  };
  const answers: Record<string, unknown> = {
    gender: p.gender,
    occasions: p.occasions,
    budget: { min: p.budget_min, max: p.budget_max },
  };
  const fit = zeker('silhouette');
  if (fit) answers.fit = fit;
  const prints = zeker('pattern');
  if (prints) answers.prints = prints;
  const neutrals = zeker('color_temp');
  if (neutrals) answers.neutrals = neutrals;
  const lightness = zeker('lightness');
  if (lightness) answers.lightness = lightness;
  return answers;
}

/** Zelfde velden als OutfitService.mapDatabaseProduct, plus de categorie uit product_attributes. */
export function productVanKandidaat(k: Kandidaat): Product {
  const p = k.product;
  return {
    id: p.id,
    name: p.name,
    brand: p.brand ?? undefined,
    price: p.price,
    imageUrl: p.image_url ?? undefined,
    category: k.category,
    gender: p.gender ?? undefined,
    colors: p.colors ?? [],
    color: (p.colors ?? [])[0],
    sizes: p.sizes ?? [],
    tags: [],
    styleTags: [],
    retailer: p.retailer ?? undefined,
    affiliateUrl: p.affiliate_url ?? p.url ?? undefined,
    productUrl: p.product_url ?? p.url ?? undefined,
    description: p.description ?? undefined,
    inStock: p.in_stock ?? true,
    formality: k.attrs?.formality ?? undefined,
    materials: k.attrs?.materials ?? [],
    colorTags: k.attrs?.colors ?? [],
  };
}

/** Naar de Outfit-vorm van de engine, zonder verzonnen matchscore. */
export function outfitVanVerrijkt(o: VerrijkteOutfit, bron: OutfitBron): Outfit {
  const products = o.items.map((i) =>
    productVanKandidaat({ product_id: i.product_id, category: i.role, score: 0, attrs: i.attrs, product: i.product })
  );
  return {
    id: o.outfit_key,
    title: o.title,
    description: o.reason,
    archetype: bron,
    occasion: o.occasion,
    products,
    tags: [o.occasion, bron],
    matchPercentage: 0,
    explanation: o.reason,
    structure: o.items.map((i) => i.role),
    completeness: 100,
  };
}

export async function haalKandidaten(cfg: KetenConfig, p: TasteProfileInput): Promise<Kandidaat[]> {
  const { data, error } = await cfg.supabase.rpc('get_kandidaten', {
    p_gender: p.gender,
    p_occasions: p.occasions,
    p_budget_min: p.budget_min,
    p_budget_max: p.budget_max,
    p_axes: p.axes,
    p_liked_ids: p.liked_product_ids,
    p_disliked_ids: [...p.disliked_product_ids, ...p.nogo_product_ids],
    p_per_category: PER_CATEGORIE,
  });
  if (error) throw new Error(`get_kandidaten: ${error.message}`);
  return (data ?? []) as Kandidaat[];
}

interface GecachetSetRij {
  outfits: VerrijkteOutfit[];
  model: string | null;
  latency_ms: number | null;
  input_tokens: number | null;
  output_tokens: number | null;
}

/** Genoeg van een Postgres-fout om te bepalen of het een statement-timeout was. */
interface RpcFout {
  code: string;
  message: string;
}

function isStatementTimeout(fout: RpcFout): boolean {
  return fout.code === STATEMENT_TIMEOUT_SQLSTATE || /statement timeout/i.test(fout.message);
}

/**
 * Een enkele aanroep van keten_outfit_set, nooit een throw: elke fout (een
 * Postgres-foutobject, een afgebroken verbinding via AbortSignal.timeout, of
 * iets anders onverwachts) komt terug als `fout`, zodat de beller zelf
 * beslist of dat een herkansing verdient of meteen het noodpad ingaat.
 */
async function eenPogingKetenOutfitSet(
  cfg: KetenConfig,
  hash: string
): Promise<{ rij: GecachetSetRij | null; fout: RpcFout | null }> {
  try {
    const { data, error } = await cfg.supabase
      .rpc('keten_outfit_set', { p_profile_hash: hash, p_stylist_version: STYLIST_VERSION })
      .abortSignal(AbortSignal.timeout(RPC_TIMEOUT_MS))
      .maybeSingle();
    if (error) return { rij: null, fout: { code: error.code, message: error.message } };
    return { rij: (data as GecachetSetRij | null) ?? null, fout: null };
  } catch (err) {
    const naam = err instanceof Error ? err.name : 'onbekend';
    const bericht = err instanceof Error ? err.message : String(err);
    return { rij: null, fout: { code: naam, message: bericht } };
  }
}

/**
 * Leest de vooraf gevulde cache (afwijking 1 uit de brief). De anon-route
 * heeft een statement-timeout van 3 s (gemeten in plan 2 op
 * pg_roles.rolconfig) en juist een koude eerste aanroep kan daar overheen
 * gaan; dat is hier een enkele, ZICHTBARE herkansing waard, want er komt
 * geen model aan te pas en die is dus goedkoop. Geen stille herkansing:
 * `herkanst` komt terug in het resultaat zodat taak 9 kan tonen dat de
 * database een keer moest overnieuw, in plaats van te doen alsof de
 * infrastructuur altijd in een keer antwoordt. Elke andere fout (geen
 * statement-timeout, of de herkansing faalt ook) betekent geen gecachete
 * rij; dat verschilt in de praktijk niet van een cache-miss, en dus geen
 * throw hier: de beller (composeVoorProfiel) valt vanzelf terug op engine
 * v2, precies zoals bij een miss.
 */
async function leesGecachetSet(
  cfg: KetenConfig,
  hash: string
): Promise<{ rij: GecachetSetRij | null; herkanst: boolean; fout: string | null }> {
  let poging = await eenPogingKetenOutfitSet(cfg, hash);
  let herkanst = false;
  if (poging.fout && isStatementTimeout(poging.fout)) {
    herkanst = true;
    poging = await eenPogingKetenOutfitSet(cfg, hash);
  }
  if (poging.fout) {
    return { rij: null, herkanst, fout: `keten_outfit_set: ${poging.fout.message}` };
  }
  return { rij: poging.rij, herkanst, fout: null };
}

/**
 * Afwijking 2 (brief taak 7): filtert een gecachete set op de niet-wil-lijst
 * van DEZE bezoeker. Bevat een outfit een product uit die lijst, dan valt de
 * HELE outfit weg: een item eruit halen maakt hem incompleet, en een
 * incomplete outfit is geen outfit. `nietWilIds` is bewust een Set: de lijst
 * kan tientallen ids bevatten en dit filtert over alle items van alle
 * outfits.
 */
export function filterNietWilProducten(
  outfits: readonly VerrijkteOutfit[],
  nietWilIds: ReadonlySet<string>
): { overgebleven: VerrijkteOutfit[]; weggevallen: number } {
  if (nietWilIds.size === 0) return { overgebleven: [...outfits], weggevallen: 0 };
  const overgebleven = outfits.filter((o) => !o.items.some((i) => nietWilIds.has(i.product_id)));
  return { overgebleven, weggevallen: outfits.length - overgebleven.length };
}

/** Noodpad (spec 5.4 punt 4): engine v2 op dezelfde kandidaten met vaste seed. */
export async function fallbackV2(
  p: TasteProfileInput,
  kandidaten: Kandidaat[],
  hash: string
): Promise<VerrijkteOutfit[]> {
  const perId = new Map<string, Kandidaat>();
  for (const k of kandidaten) perId.set(k.product_id, k);

  // seed = fnv1a32(profile_hash): FNV-1a uit src/utils/hash.ts (taak 2), hetzelfde
  // algoritme als hashString dat image.ts al gebruikte en als de seed uit plan 1.
  const result = runEngineV2(answersVanProfiel(p), kandidaten.map(productVanKandidaat), {
    count: AANTAL,
    seed: fnv1a32(hash),
  });

  const uit: VerrijkteOutfit[] = [];
  for (const o of result.outfits) {
    const items: VerrijktItem[] = [];
    for (const product of o.products) {
      const k = perId.get(product.id);
      if (!k) continue;
      items.push({ product_id: k.product_id, role: k.category, product: k.product, attrs: k.attrs });
    }
    if (items.length === 0) continue;
    uit.push({
      outfit_key: await outfitKey(items.map((i) => i.product_id)),
      title: o.title,
      occasion: o.occasion as Gelegenheid,
      items,
      reason: o.explanation,
    });
  }
  return uit;
}

async function naarV2FallbackResultaat(
  p: TasteProfileInput,
  kandidaten: Kandidaat[],
  hash: string,
  reden: string,
  weggevallenDoorNietWil: number,
  herkanst: boolean
): Promise<ComposeResultaat> {
  const outfits = await fallbackV2(p, kandidaten, hash);
  return {
    profile_hash: hash,
    bron: 'v2-fallback',
    model: null,
    latency_ms: null,
    input_tokens: null,
    output_tokens: null,
    reden,
    weggevallenDoorNietWil,
    herkanst,
    kandidaten,
    outfits,
    engineOutfits: outfits.map((o) => outfitVanVerrijkt(o, 'v2-fallback')),
  };
}

export async function composeVoorProfiel(cfg: KetenConfig, p: TasteProfileInput): Promise<ComposeResultaat> {
  const hash = await profileHash(p);
  const kandidaten = await haalKandidaten(cfg, p);
  if (kandidaten.length === 0) {
    throw new Error('get_kandidaten gaf nul kandidaten voor dit profiel');
  }

  const { rij, herkanst, fout } = await leesGecachetSet(cfg, hash);

  if (!rij) {
    return naarV2FallbackResultaat(
      p,
      kandidaten,
      hash,
      fout ?? 'geen gecachete set voor dit profiel (cache-miss)',
      0,
      herkanst
    );
  }

  const nietWilIds = new Set<string>([...p.nogo_product_ids, ...p.disliked_product_ids]);
  const { overgebleven, weggevallen } = filterNietWilProducten(rij.outfits, nietWilIds);

  if (overgebleven.length < MIN_OUTFITS_NA_NIET_WIL_FILTER) {
    const reden =
      `gecachete set had na het niet-wil-filter nog maar ${overgebleven.length} van de ${rij.outfits.length} ` +
      `outfits over (grens ${MIN_OUTFITS_NA_NIET_WIL_FILTER}), ${weggevallen} weggevallen door een niet-wil-product`;
    return naarV2FallbackResultaat(p, kandidaten, hash, reden, weggevallen, herkanst);
  }

  return {
    profile_hash: hash,
    bron: 'cache',
    model: rij.model,
    latency_ms: rij.latency_ms,
    input_tokens: rij.input_tokens,
    output_tokens: rij.output_tokens,
    reden: null,
    weggevallenDoorNietWil: weggevallen,
    herkanst,
    kandidaten,
    outfits: overgebleven,
    engineOutfits: overgebleven.map((o) => outfitVanVerrijkt(o, 'cache')),
  };
}
