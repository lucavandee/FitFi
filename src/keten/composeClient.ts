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
 *
 * Fixronde 1 (coordinator, 27 september 2026): get_kandidaten en
 * keten_outfit_set draaien allebei als anon en hebben dezelfde
 * statement-timeout van 3 s (plan 2, gemeten: een koude aanroep gaf HTTP 500
 * na 3,47 s, de tweede 200 OK in 0,59 s). Beide RPC's krijgen daarom precies
 * een zichtbare herkansing op zo'n timeout (nooit stil, nooit meer dan een
 * keer). Nul kandidaten of een RPC-fout die ook na de herkansing blijft, is
 * een verwachte toestand (een dun getagde gender/gelegenheid/prijsband-
 * combinatie), geen storing: composeVoorProfiel gooit daar niet op, maar
 * geeft een resultaat terug met `reden` gevuld en lege outfits, zodat de
 * aanroeper (achter de lokale vlag ff_keten_stylist) zelf kan terugvallen op
 * de bestaande route.
 *
 * Bijgewerkt op 1 oktober 2026: de 3 s hierboven is de instelling van de
 * anon-rol. Sinds PR 116 (op main, migratie 20261001150000) heeft
 * get_kandidaten zelf statement_timeout = 8s als functie-instelling, die voor
 * die van de rol gaat; keten_outfit_set heeft nog de 3 s. De herkansing blijft
 * voor beide RPC's staan als vangnet. Wat een statement-timeout is staat in
 * src/utils/statementTimeout.ts, gedeeld met outfitService.ts.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { runEngineV2 } from '@/engine/v2/engine';
import type { Outfit, Product } from '@/engine/types';
import { fnv1a32 } from '@/utils/hash';
import { outfitKey } from '@/services/ratings/outfitRatings';
import { isStatementTimeout, type RpcFout } from '@/utils/statementTimeout';
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
  /**
   * Fix 4 (eindreview plan 3, 27 sept 2026): keten_outfit_set geeft model,
   * input_tokens en output_tokens niet meer terug aan anon (de badge heeft
   * alleen `bron` nodig; taak 8 leest de kostenkolommen straks rechtstreeks
   * uit outfit_sets via de service role). Dit resultaat droeg ze voorheen
   * hier, maar de RPC levert ze niet meer, dus zijn ze hier ook weg in plaats
   * van een veld dat altijd null is.
   */
  latency_ms: number | null;
  /** Reden van het noodpad, anders null */
  reden: string | null;
  /** Aantal outfits dat het niet-wil-filter uit een gecachete set haalde; 0 buiten een cache-hit */
  weggevallenDoorNietWil: number;
  /**
   * Fix 1 (eindreview plan 3): aantal outfits dat het budget-hertoets-filter
   * uit een gecachete set haalde; 0 buiten een cache-hit. Het vulscript
   * schrijft een set die geldig is voor de hele prijsband (fix 1a hieronder),
   * niet voor het smallere profielbudget van deze ene bezoeker, dus dit
   * filter hertoetst dat budget op het gelezen resultaat, met hetzelfde
   * mechanisme als het niet-wil-filter hierboven.
   */
  weggevallenDoorBudget: number;
  /** True als get_kandidaten een keer moest overnieuw op een statement-timeout (geen stille herkansing) */
  herkanstKandidaten: boolean;
  /** True als keten_outfit_set een keer moest overnieuw op een statement-timeout (geen stille herkansing) */
  herkanstCache: boolean;
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
 *
 * Fix 1 (eindreview plan 3): dezelfde grens geldt sinds deze fix ook na het
 * budgetfilter (filterBuitenBudgetProducten), toegepast op wat na het
 * niet-wil-filter overblijft. Eén grens voor de gecombineerde uitval, geen
 * twee losse grenzen: allebei zijn "een cachetreffer die na hertoetsing te
 * weinig overhoudt", en dat verdient dezelfde afweging.
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

// Wat een statement-timeout is (errcode 57014 of het bericht) staat in
// src/utils/statementTimeout.ts, want outfitService.ts herkanst er ook op en
// die twee moeten het over dezelfde fout hebben.

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

export interface KandidatenResultaat {
  kandidaten: Kandidaat[];
  /** True als de eerste aanroep een statement-timeout gaf en de herkansing nodig was. */
  herkanst: boolean;
  /**
   * Foutmelding als get_kandidaten ook na de herkansing niet lukte, anders
   * null. Nul kandidaten ZONDER fout is geen fout: dat is een normale, dun
   * getagde band (fixronde 1: bijvoorbeeld vrouwen boven200, waar alleen 27
   * jassen en 4 broeken getagd staan). composeVoorProfiel maakt dat
   * onderscheid, deze functie gooit nooit zelf.
   */
  fout: string | null;
}

async function eenPogingGetKandidaten(
  cfg: KetenConfig,
  p: TasteProfileInput
): Promise<{ kandidaten: Kandidaat[] | null; fout: RpcFout | null }> {
  try {
    const { data, error } = await cfg.supabase
      .rpc('get_kandidaten', {
        p_gender: p.gender,
        p_occasions: p.occasions,
        p_budget_min: p.budget_min,
        p_budget_max: p.budget_max,
        p_axes: p.axes,
        p_liked_ids: p.liked_product_ids,
        p_disliked_ids: [...p.disliked_product_ids, ...p.nogo_product_ids],
        p_per_category: PER_CATEGORIE,
      })
      .abortSignal(AbortSignal.timeout(RPC_TIMEOUT_MS));
    if (error) return { kandidaten: null, fout: { code: error.code, message: error.message } };
    return { kandidaten: (data ?? []) as Kandidaat[], fout: null };
  } catch (err) {
    const naam = err instanceof Error ? err.name : 'onbekend';
    const bericht = err instanceof Error ? err.message : String(err);
    return { kandidaten: null, fout: { code: naam, message: bericht } };
  }
}

/**
 * Haalt de kandidaten op (RPC get_kandidaten). Zelfde vorm als
 * leesGecachetSet hieronder, en om dezelfde reden (fixronde 1, coordinator):
 * get_kandidaten wordt door de browser als anon aangeroepen en heeft dus
 * dezelfde statement-timeout van 3 s als het cache-leespad. Plan 2 heeft dit
 * gemeten, niet alleen als theoretisch risico: een koude aanroep gaf HTTP
 * 500 na 3,47 s, de tweede 200 OK in 0,59 s. Een enkele, zichtbare
 * herkansing op precies een statement-timeout; nooit een throw, want
 * composeVoorProfiel moet zelf kunnen beslissen of nul kandidaten of een
 * blijvende fout hier een normale toestand is (zie KandidatenResultaat.fout).
 */
export async function haalKandidaten(cfg: KetenConfig, p: TasteProfileInput): Promise<KandidatenResultaat> {
  let poging = await eenPogingGetKandidaten(cfg, p);
  let herkanst = false;
  if (poging.fout && isStatementTimeout(poging.fout)) {
    herkanst = true;
    poging = await eenPogingGetKandidaten(cfg, p);
  }
  if (poging.fout) {
    return { kandidaten: [], herkanst, fout: `get_kandidaten: ${poging.fout.message}` };
  }
  return { kandidaten: poging.kandidaten ?? [], herkanst, fout: null };
}

/**
 * Fix 4 (eindreview plan 3): model, input_tokens en output_tokens staan hier
 * bewust niet meer bij. keten_outfit_set geeft ze sinds deze fix niet meer
 * terug aan anon (zie de migratie): de badge op de resultatenpagina heeft
 * alleen de bron nodig, en taak 8 leest de kostenkolommen straks
 * rechtstreeks uit outfit_sets via de service role, niet via deze RPC.
 */
interface GecachetSetRij {
  outfits: VerrijkteOutfit[];
  latency_ms: number | null;
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

export interface FilterUitkomst {
  overgebleven: VerrijkteOutfit[];
  weggevallen: number;
}

/**
 * Fix 1 (eindreview plan 3): generiek mechanisme achter beide hertoets-
 * filters hieronder. Een item eruit halen maakt een outfit incompleet, dus
 * bij een treffer valt de HELE outfit weg, nooit alleen het item. Eén
 * filterfunctie met twee redenen (niet-wil, budget) is beter dan twee bijna
 * identieke functies.
 */
function filterOutfitsMetOngeldigItem(
  outfits: readonly VerrijkteOutfit[],
  isOngeldig: (item: VerrijktItem) => boolean
): FilterUitkomst {
  const overgebleven = outfits.filter((o) => !o.items.some(isOngeldig));
  return { overgebleven, weggevallen: outfits.length - overgebleven.length };
}

/**
 * Afwijking 2 (brief taak 7): filtert een gecachete set op de niet-wil-lijst
 * van DEZE bezoeker. `nietWilIds` is bewust een Set: de lijst kan tientallen
 * ids bevatten en dit filtert over alle items van alle outfits.
 */
export function filterNietWilProducten(
  outfits: readonly VerrijkteOutfit[],
  nietWilIds: ReadonlySet<string>
): FilterUitkomst {
  if (nietWilIds.size === 0) return { overgebleven: [...outfits], weggevallen: 0 };
  return filterOutfitsMetOngeldigItem(outfits, (item) => nietWilIds.has(item.product_id));
}

/**
 * Fix 1 (eindreview plan 3): hertoetst het budget van DEZE bezoeker op een
 * gecachete set. Het vulscript (fix 1a) valideert tegen het bandbereik, niet
 * tegen het smallere profielbudget: de weggeschreven set is dus geldig voor
 * de hele band, en kan een item bevatten dat voor deze specifieke bezoeker te
 * goedkoop of te duur is. Precies hetzelfde mechanisme als
 * filterNietWilProducten hierboven: een item buiten [budgetMin, budgetMax]
 * gooit de hele outfit weg.
 */
export function filterBuitenBudgetProducten(
  outfits: readonly VerrijkteOutfit[],
  budgetMin: number,
  budgetMax: number
): FilterUitkomst {
  return filterOutfitsMetOngeldigItem(outfits, (item) => {
    const prijs = item.product?.price;
    return typeof prijs !== 'number' || prijs < budgetMin || prijs > budgetMax;
  });
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
  weggevallenDoorBudget: number,
  herkanstKandidaten: boolean,
  herkanstCache: boolean
): Promise<ComposeResultaat> {
  // Fix 5 (eindreview plan 3): fallbackV2 (runEngineV2, outfitKey/WebCrypto)
  // kan in theorie gooien op onverwachte data. composeVoorProfiel belooft
  // (zie het commentaarblok bovenaan dit bestand) nooit te gooien, altijd een
  // resultaat met `reden` terug te geven; dit is het laatste vangnet vóór die
  // belofte breekt. De oorspronkelijke `reden` (bijvoorbeeld een cache-miss)
  // gaat verloren als de fallback zelf ook faalt, maar dan is er sowieso geen
  // bruikbaar resultaat meer, dus dat weegt niet op tegen een exception.
  try {
    const outfits = await fallbackV2(p, kandidaten, hash);
    return {
      profile_hash: hash,
      bron: 'v2-fallback',
      latency_ms: null,
      reden,
      weggevallenDoorNietWil,
      weggevallenDoorBudget,
      herkanstKandidaten,
      herkanstCache,
      kandidaten,
      outfits,
      engineOutfits: outfits.map((o) => outfitVanVerrijkt(o, 'v2-fallback')),
    };
  } catch (err) {
    const foutmelding = err instanceof Error ? err.message : String(err);
    return legeResultaat(
      hash,
      `v2-fallback faalde onverwacht: ${foutmelding} (oorspronkelijke reden: ${reden})`,
      herkanstKandidaten
    );
  }
}

/**
 * Geen kandidaten om iets op te bouwen: geen v2-fallback ook (die heeft
 * kandidaten nodig), gewoon een lege set met een reden. Fixronde 1
 * (coordinator): dit is een verwachte toestand (een dun getagde band), geen
 * storing, en composeVoorProfiel mag hier niet op gooien. De stylist-route
 * staat achter de lokale vlag ff_keten_stylist juist zodat een resultaat als
 * dit de resultatenpagina niet breekt: useOutfits.ts leest `reden` en (sinds
 * fix 6, eindreview plan 3) valt bij lege outfits terug op de bestaande route.
 */
function legeResultaat(hash: string, reden: string, herkanstKandidaten: boolean): ComposeResultaat {
  return {
    profile_hash: hash,
    bron: 'v2-fallback',
    latency_ms: null,
    reden,
    weggevallenDoorNietWil: 0,
    weggevallenDoorBudget: 0,
    herkanstKandidaten,
    herkanstCache: false,
    kandidaten: [],
    outfits: [],
    engineOutfits: [],
  };
}

export async function composeVoorProfiel(cfg: KetenConfig, p: TasteProfileInput): Promise<ComposeResultaat> {
  // Fix 5 (eindreview plan 3): profileHash gebruikt WebCrypto (sha256Hex) en
  // kan in theorie gooien (bijvoorbeeld crypto.subtle die ontbreekt). Zonder
  // hash is er niets te lezen, te schrijven of terug te vallen: dit is dus de
  // enige plek die met een placeholder-hash ('onbekend') een leeg resultaat
  // teruggeeft in plaats van de belofte "composeVoorProfiel gooit nooit" te
  // breken. Een echte programmeerfout verderop in deze functie mag nog gooien;
  // dit vangt alleen de eerste, onvermijdelijke stap af.
  let hash: string;
  try {
    hash = await profileHash(p);
  } catch (err) {
    const foutmelding = err instanceof Error ? err.message : String(err);
    return legeResultaat('onbekend', `profileHash faalde onverwacht: ${foutmelding}`, false);
  }

  const { kandidaten, herkanst: herkanstKandidaten, fout: kandidatenFout } = await haalKandidaten(cfg, p);

  if (kandidatenFout) {
    return legeResultaat(hash, kandidatenFout, herkanstKandidaten);
  }
  if (kandidaten.length === 0) {
    return legeResultaat(
      hash,
      'get_kandidaten gaf nul kandidaten voor dit profiel: te weinig getagde producten in deze combinatie van gender, gelegenheid en prijsband',
      herkanstKandidaten
    );
  }

  const { rij, herkanst: herkanstCache, fout } = await leesGecachetSet(cfg, hash);

  if (!rij) {
    return naarV2FallbackResultaat(
      p,
      kandidaten,
      hash,
      fout ?? 'geen gecachete set voor dit profiel (cache-miss)',
      0,
      0,
      herkanstKandidaten,
      herkanstCache
    );
  }

  // Fix 1 (eindreview plan 3): het vulscript valideert een gecachete set
  // tegen het bandbereik, niet tegen het smallere profielbudget (fix 1a), dus
  // de set kan een item bevatten dat voor DEZE bezoeker te goedkoop of te
  // duur is. Zelfde mechanisme en dezelfde grens als het niet-wil-filter:
  // eerst de niet-wil-lijst, dan het budget op wat daarvan overblijft.
  const nietWilIds = new Set<string>([...p.nogo_product_ids, ...p.disliked_product_ids]);
  const nietWilFilter = filterNietWilProducten(rij.outfits, nietWilIds);
  const budgetFilter = filterBuitenBudgetProducten(nietWilFilter.overgebleven, p.budget_min, p.budget_max);
  const overgebleven = budgetFilter.overgebleven;
  const weggevallenDoorNietWil = nietWilFilter.weggevallen;
  const weggevallenDoorBudget = budgetFilter.weggevallen;

  if (overgebleven.length < MIN_OUTFITS_NA_NIET_WIL_FILTER) {
    const reden =
      `gecachete set had na het niet-wil- en budgetfilter nog maar ${overgebleven.length} van de ${rij.outfits.length} ` +
      `outfits over (grens ${MIN_OUTFITS_NA_NIET_WIL_FILTER}), ${weggevallenDoorNietWil} weggevallen door een niet-wil-product, ` +
      `${weggevallenDoorBudget} weggevallen buiten budget`;
    return naarV2FallbackResultaat(
      p,
      kandidaten,
      hash,
      reden,
      weggevallenDoorNietWil,
      weggevallenDoorBudget,
      herkanstKandidaten,
      herkanstCache
    );
  }

  return {
    profile_hash: hash,
    bron: 'cache',
    latency_ms: rij.latency_ms,
    reden: null,
    weggevallenDoorNietWil,
    weggevallenDoorBudget,
    herkanstKandidaten,
    herkanstCache,
    kandidaten,
    outfits: overgebleven,
    engineOutfits: overgebleven.map((o) => outfitVanVerrijkt(o, 'cache')),
  };
}
