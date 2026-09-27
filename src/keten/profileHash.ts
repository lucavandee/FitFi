import { sha256Hex } from '@/utils/hash';
import type { AsNaam, Assen, TasteProfileInput } from './types';

/**
 * DIT IS DE ENIGE PLEK waar de cache-sleutel van de stylist wordt
 * samengesteld. Het vulscript (dat de cache vooraf vult met `claude -p` op
 * het Claude Code-abonnement), de RPC-aanroep die de cache leest, en het
 * testharnas moeten stuk voor stuk deze functie aanroepen. Wie de sleutel
 * ergens anders opnieuw uitrekent, mist elke cache-hit zodra deze functie
 * ooit verandert.
 *
 * Normalisatie volgens het amendement van 27 september 2026 op spec 5.2.1
 * (docs/superpowers/specs/2026-09-14-keten-herbouw-design.md). De
 * oorspronkelijke sleutel (taak 2) hashte gender, gesorteerde occasions,
 * budget_min, budget_max als losse getallen, de gesorteerde
 * nogo_product_ids en de gesorteerde ruwe choices. Drie van die velden
 * maakten vrijwel elke bezoeker uniek en de vooraf-gevulde cache dus
 * nutteloos: het vulscript kan onmogelijk elke euro-budgetcombinatie en elke
 * keuzevolgorde vooraf componeren. Vandaar dit bucketen:
 *
 * 1. gender: ongewijzigd.
 * 2. occasions: gesorteerd, ongewijzigd.
 * 3. Eén prijsband in plaats van budget_min/budget_max: de band waarin het
 *    MIDDEN van [budget_min, budget_max] valt. Grenzen letterlijk
 *    overgenomen uit supabase/migrations/20260916100500_keten_cron.sql
 *    (tot50 < 50, 50tot100 < 100, 100tot200 < 200, boven200 daarboven) zodat
 *    sleutel en RPC niet uit elkaar lopen. Bewust het MIDDEN en niet de
 *    buitenkant: afronden naar buiten (bijvoorbeeld altijd de bovengrens
 *    pakken) zou een bezoeker een item boven zijn eigen maximum kunnen
 *    tonen, en die fout is erger dan een iets grovere cache-bucket.
 * 4. nogo_product_ids zitten NIET meer in de sleutel. Eén weggeveegd product
 *    mag de hele gecachete set niet onbereikbaar maken. Het filteren van
 *    niet-wil-producten hoort op het GELEZEN resultaat, niet op de sleutel:
 *    dat is werk voor de client (taak 7) na de cache-hit of -miss, niet voor
 *    deze functie.
 * 5. De afgeleide axes in plaats van de ruwe choices: per as de naam, de
 *    waarde en de confidence afgerond op stappen van 0,25 (assen zonder
 *    waarde vallen weg; sortering op asnaam voor een vaste volgorde,
 *    onafhankelijk van hoe het axes-object is opgebouwd). Grover dan 0,25
 *    verliest het onderscheid tussen "zeker" en "onzeker" dat spec 5.2.1 al
 *    op 0,5 legt (de knip die de adaptieve paarselectie in 7.3 stuurt);
 *    fijner dan 0,25 maakt de ruimte weer net zo continu als de ruwe
 *    confidence, en dan raakt de vooraf-gevulde cache weer bijna nooit.
 *
 * Niet te verwarren met hashProfile in
 * src/services/ratings/outfitRatings.ts: dat hasht de bestaande
 * quiz-antwoorden (LS_KEYS.QUIZ_ANSWERS via naarOutfitBepalendeVelden) voor
 * de huidige resultatenpagina en outfit_ratings. profileHash hier hasht de
 * genormaliseerde smaak-invoer van de stylist-route (TasteProfileInput,
 * spec 5.2). Twee functies, twee betekenissen, twee tabellen; niet
 * samenvoegen.
 */

const CONFIDENCE_STAP = 0.25;

/**
 * Geëxporteerd (taak 6b) zodat het vulscript (scripts/keten/stylist-vul-cache.ts)
 * dezelfde bandgrenzen gebruikt om het budgetbereik voor get_kandidaten te
 * bepalen, in plaats van de tot50/50tot100/100tot200/boven200-grenzen ergens
 * anders opnieuw op te schrijven. De sleutel zelf (normaliseerProfiel,
 * profileHash) blijft de enige plek waar de cache-sleutel wordt samengesteld;
 * dit exporteert alleen de bandindeling die daar al in zit.
 */
export function prijsbandVanMidden(budgetMin: number, budgetMax: number): string {
  const midden = (budgetMin + budgetMax) / 2;
  if (midden < 50) return 'tot50';
  if (midden < 100) return '50tot100';
  if (midden < 200) return '100tot200';
  return 'boven200';
}

function rondConfidenceAf(confidence: number): number {
  return Math.round(confidence / CONFIDENCE_STAP) * CONFIDENCE_STAP;
}

function serialiseerAssen(assen: Assen): string {
  return (Object.keys(assen) as AsNaam[])
    .sort()
    .filter((naam) => assen[naam].value !== null)
    .map((naam) => `${naam}:${assen[naam].value}:${rondConfidenceAf(assen[naam].confidence)}`)
    .join(',');
}

export function normaliseerProfiel(p: TasteProfileInput): string {
  const occasions = [...p.occasions].sort();
  const prijsband = prijsbandVanMidden(p.budget_min, p.budget_max);
  const assen = serialiseerAssen(p.axes);
  return [p.gender, occasions.join(','), prijsband, assen].join('|');
}

export async function profileHash(p: TasteProfileInput): Promise<string> {
  return sha256Hex(normaliseerProfiel(p));
}
