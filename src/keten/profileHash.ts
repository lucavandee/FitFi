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
 * (docs/superpowers/specs/2026-09-14-keten-herbouw-design.md), op punt 5
 * herzien op 1 oktober 2026. De oorspronkelijke sleutel (taak 2) hashte
 * gender, gesorteerde occasions, budget_min, budget_max als losse getallen,
 * de gesorteerde nogo_product_ids en de gesorteerde ruwe choices. Drie van
 * die velden maakten vrijwel elke bezoeker uniek en de vooraf-gevulde cache
 * dus nutteloos: het vulscript kan onmogelijk elke euro-budgetcombinatie en
 * elke keuzevolgorde vooraf componeren. Vandaar dit bucketen:
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
 * 5. De afgeleide axes in plaats van de ruwe choices: per as alleen de naam
 *    en de waarde (assen zonder waarde vallen weg; sortering op asnaam voor
 *    een vaste volgorde, onafhankelijk van hoe het axes-object is
 *    opgebouwd). DE ZEKERHEID ZIT ER BEWUST NIET IN. Het amendement van 27
 *    september rondde ze nog af op stappen van 0,25, en dat was een van twee
 *    oorzaken van een cache die voor een echte bezoeker nooit raakte.
 *    Gemeten op 1 oktober 2026, bij gelijke gender (female), gelijke
 *    gelegenheden (work en date) en gelijke prijsband (25 tot 100):
 *
 *      bezoeker (quiz)  bf2a5dd4  color_temp:neutraal:1,pattern:effen:1,
 *                                 silhouette:slim:1
 *      vulscript        5c6681c8  color_temp:neutraal:0.75,formality:3:0.75,
 *                                 lightness:medium:0.5,pattern:effen:1,
 *                                 shoe_type:net:0.5,silhouette:slim:0.75
 *      in de cache      5c6681c8
 *
 *    Dezelfde voorkeur gaf dus een andere sleutel, afhankelijk van waar het
 *    profiel vandaan kwam. De quiz (vanQuiz.ts) zet de zekerheid op 1; het
 *    vulscript nam die uit een persona-tabel (STYLE_ASSEN) van 0,5 tot 0,9,
 *    en op het raster van 0,25 is dat een andere stap dan 1.
 *
 *    De zekerheid is invoer voor de compositie, geen onderdeel van de
 *    identiteit van een profiel. Ze blijft in het profiel staan en gaat naar
 *    de stylist: bouwGebruikersPrompt (supabase/functions/_shared/
 *    stylist-prompt.ts) rendert haar per as, en get_kandidaten weegt de
 *    as-match ermee (supabase/migrations/20260925090000_keten_get_kandidaten_
 *    attrs_expliciet.sql). Twee bezoekers die beide slim willen, horen
 *    dezelfde set te delen; hoe zeker ze daarover zijn verandert de weging,
 *    niet wie ze zijn.
 *
 *    De andere oorzaak: het vulscript sleutelde op assen die een bezoeker
 *    nooit opgeeft (formality, lightness, shoe_type komen uit de
 *    persona-tabel, niet uit een antwoord). Een set die onder aannames is
 *    samengesteld die de bezoeker nooit heeft gedaan, staat onder een
 *    sleutel die hij niet kan bereiken. De standaardprofielen van het
 *    vulscript gaan daarom door dezelfde vertaling als de quiz
 *    (scripts/keten/stylist-profielen.ts, via vanQuiz.ts).
 *
 * Niet te verwarren met hashProfile in
 * src/services/ratings/outfitRatings.ts: dat hasht de bestaande
 * quiz-antwoorden (LS_KEYS.QUIZ_ANSWERS via naarOutfitBepalendeVelden) voor
 * de huidige resultatenpagina en outfit_ratings. profileHash hier hasht de
 * genormaliseerde smaak-invoer van de stylist-route (TasteProfileInput,
 * spec 5.2). Twee functies, twee betekenissen, twee tabellen; niet
 * samenvoegen.
 */

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

function serialiseerAssen(assen: Assen): string {
  return (Object.keys(assen) as AsNaam[])
    .sort()
    .filter((naam) => assen[naam].value !== null)
    .map((naam) => `${naam}:${assen[naam].value}`)
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
