/**
 * Harde validatie na het stylist-model (spec 5.4, punt 3).
 *
 * Pure functie zonder Deno- of browser-globals, zodat vitest hem test en de
 * edge function hem ongewijzigd importeert. Elke overtreding verwerpt de hele
 * outfit; de reden gaat bij een herkansing terug in de prompt.
 */
import type { Categorie, Kandidaat, StylistItem, StylistOutfit, TasteProfileInput } from './keten-types.ts';
import { CATEGORIEEN } from './keten-types.ts';

export interface ValidatieFout {
  index: number;
  reden: string;
}

export interface ValidatieResultaat {
  geldig: StylistOutfit[];
  fouten: ValidatieFout[];
}

type BudgetProfiel = Pick<TasteProfileInput, 'budget_min' | 'budget_max' | 'disliked_product_ids'>;

/**
 * Fix 2 (eindreview plan 3, 27 sept 2026): regel 9 (samenhang) en regel 10
 * (copy) uit bouwSysteemPrompt werden door niets gecontroleerd. Alleen het
 * mechanisch toetsbare deel van elke regel staat hieronder; zie de
 * toelichting bij elke functie voor wat bewust NIET gecontroleerd wordt en
 * waarom.
 */

/**
 * Regel 9, het toetsbare deel: geen sandalen bij work of formal. Het tweede
 * deel van regel 9 ("geen zwemkleding bij work of formal") is hier NIET
 * gecontroleerd: de classifier zet zwemkleding op is_fashion=false met
 * category 'geen' (scripts/keten/tagging.ts, regel 121-122), en
 * get_kandidaten filtert zijn basis-CTE op `pa.is_fashion` en
 * `pa.category in ('top','bottom','footwear','outerwear','dress','accessory')`
 * (migratie 20260916100200, regel 165+169). Zwemkleding bereikt de
 * kandidatenlijst dus al niet, en ProductAttrs heeft geen veld om het alsnog
 * te herkennen als het wel zou lukken. Dat maakt dit stuk van regel 9
 * structureel al gedekt vóór deze validator ooit een item ziet, niet
 * ongecontroleerd.
 *
 * De "samenhang op formaliteit, silhouet, kleurtemperatuur en patroon" uit
 * regel 9 is met opzet ook niet hier: dat is een graduele beoordeling zonder
 * vaste drempel (wanneer is een combinatie "genoeg" samenhangend?), en een
 * verzonnen drempel zou willekeuriger zijn dan geen toets.
 */
function controleerSamenhang(occasion: unknown, items: StylistItem[], perId: Map<string, Kandidaat>): string[] {
  if (occasion !== 'work' && occasion !== 'formal') return [];
  const fouten: string[] = [];
  for (const item of items) {
    const k = perId.get(item.product_id);
    if (k?.category === 'footwear' && k.attrs.shoe_type === 'sandaal') {
      fouten.push(`sandaal ${item.product_id} hoort niet bij occasion ${occasion} (regel 9)`);
    }
  }
  return fouten;
}

const EM_DASH = '—';

/**
 * Kleine, expliciete lijst van de AI-buzzwoorden die regel 10 met naam
 * noemt (plus "AI-buzzwoorden" in het algemeen, wat geen vaste lijst is en
 * dus niet mechanisch toetsbaar is). Substring-match met opzet, niet
 * woordgrens: dat vangt ook verbogen vormen ("unieke", "authentieke").
 */
const VERBODEN_WOORDEN = ['authentiek', 'uniek', 'game-changer'];

/**
 * Kleine, expliciete lijst van overduidelijke Nederlandse superlatieven
 * (CLAUDE.md deel 2 punt 11 / feedback_ai_copy_patterns.md). Geen uitputtende
 * NLP-detectie van "superlatieven" in het algemeen (dat vraagt om een
 * taalmodel, niet om een validator), en met woordgrens omdat een aantal van
 * deze woorden ook als substring in onschuldige woorden voorkomt
 * ("bestellen" bevat "beste").
 */
const SUPERLATIEVEN = ['mooiste', 'beste', 'perfecte', 'perfect', 'ultieme'];

const MAX_TITEL_WOORDEN = 6;

/**
 * Regel 10, het mechanisch toetsbare deel: em-dashes, de met naam genoemde
 * buzzwoorden, een kleine superlatievenlijst, en de titel-lengte. NIET
 * gecontroleerd: "altijd Nederlands" (taaldetectie is geen onderdeel van
 * deze validator), "spreek de bezoeker aan met je en jij", "reason: twee
 * zinnen" en "beweringen over de bezoeker die niet uit zijn keuzes volgen"
 * (alle drie vragen om tekstbegrip, niet om een patroonmatch, en een
 * verzonnen heuristiek zou hier meer valse treffers geven dan hij vangt).
 */
export function controleerCopyRegels(title: string, reason: string): string[] {
  const fouten: string[] = [];
  const tekst = `${title} ${reason}`;
  const tekstLower = tekst.toLowerCase();

  if (tekst.includes(EM_DASH)) {
    fouten.push('bevat een em-dash (liggend streepje), regel 10 verbiedt dat');
  }

  for (const woord of VERBODEN_WOORDEN) {
    if (tekstLower.includes(woord)) {
      fouten.push(`bevat het verboden woord "${woord}" (regel 10)`);
    }
  }

  for (const woord of SUPERLATIEVEN) {
    if (new RegExp(`\\b${woord}\\b`, 'i').test(tekst)) {
      fouten.push(`bevat een superlatief ("${woord}"), regel 10 verbiedt superlatieven`);
    }
  }

  const titelWoorden = title.trim().split(/\s+/).filter(Boolean);
  if (titelWoorden.length > MAX_TITEL_WOORDEN) {
    fouten.push(`title heeft ${titelWoorden.length} woorden, regel 10 staat maximaal ${MAX_TITEL_WOORDEN} toe`);
  }

  return fouten;
}

/**
 * top + bottom + footwear zonder dress, of dress + footwear zonder top en
 * bottom. outerwear en accessory zijn optioneel. Geen rol twee keer.
 */
export function isCompleet(rollen: Categorie[]): boolean {
  if (rollen.length === 0) return false;
  const gezien = new Set<Categorie>();
  for (const rol of rollen) {
    if (!CATEGORIEEN.includes(rol)) return false;
    if (gezien.has(rol)) return false;
    gezien.add(rol);
  }
  if (!gezien.has('footwear')) return false;
  if (gezien.has('dress')) {
    return !gezien.has('top') && !gezien.has('bottom');
  }
  return gezien.has('top') && gezien.has('bottom');
}

function isItem(x: unknown): x is StylistItem {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as StylistItem).product_id === 'string' &&
    typeof (x as StylistItem).role === 'string'
  );
}

function isOutfitVorm(x: unknown): x is StylistOutfit {
  return typeof x === 'object' && x !== null && Array.isArray((x as StylistOutfit).items);
}

export function valideerOutfits(
  outfits: unknown,
  kandidaten: Kandidaat[],
  profile: BudgetProfiel
): ValidatieResultaat {
  if (!Array.isArray(outfits)) return { geldig: [], fouten: [] };

  const perId = new Map<string, Kandidaat>();
  for (const k of kandidaten) perId.set(k.product_id, k);
  const afgewezen = new Set(profile.disliked_product_ids ?? []);
  const gezienItemsets = new Set<string>();

  const geldig: StylistOutfit[] = [];
  const fouten: ValidatieFout[] = [];

  outfits.forEach((ruw, index) => {
    const redenen: string[] = [];

    if (!isOutfitVorm(ruw) || ruw.items.length === 0 || !ruw.items.every(isItem)) {
      fouten.push({ index, reden: 'geen items' });
      return;
    }

    const rollen: Categorie[] = [];
    for (const item of ruw.items) {
      const k = perId.get(item.product_id);
      if (!k) {
        redenen.push(`onbekend id ${item.product_id}`);
        continue;
      }
      if (k.category !== item.role) {
        redenen.push(`rol ${item.role} klopt niet met categorie ${k.category} van ${item.product_id}`);
      }
      rollen.push(item.role as Categorie);
      if (afgewezen.has(item.product_id)) {
        redenen.push(`afgewezen item ${item.product_id}`);
      }
      const prijs = k.product?.price;
      if (typeof prijs !== 'number' || prijs < profile.budget_min || prijs > profile.budget_max) {
        redenen.push(`buiten budget: ${item.product_id} kost ${prijs}`);
      }
    }

    if (!isCompleet(rollen)) {
      redenen.push(`niet compleet: rollen ${rollen.join('+') || 'geen'}`);
    }

    // Regel 9 (fix 2, eindreview plan 3): het toetsbare deel, zie
    // controleerSamenhang hierboven voor wat bewust buiten deze validator valt.
    redenen.push(...controleerSamenhang(ruw.occasion, ruw.items, perId));

    // Regel 10 (fix 2, eindreview plan 3): title en reason zijn copy die een
    // bezoeker leest. isOutfitVorm hierboven toetst alleen dat `items` een
    // array is, dus title/reason zijn hier nog ongevalideerd; een outfit
    // zonder tekst-velden is sowieso geen geldige outfit.
    if (typeof ruw.title !== 'string' || typeof ruw.reason !== 'string') {
      redenen.push('title of reason ontbreekt of is geen tekst');
    } else {
      redenen.push(...controleerCopyRegels(ruw.title, ruw.reason));
    }

    const itemset = ruw.items.map((i) => i.product_id).sort().join('|');
    if (gezienItemsets.has(itemset)) {
      redenen.push('zelfde itemset als een eerdere outfit');
    }

    if (redenen.length > 0) {
      fouten.push({ index, reden: redenen.join('; ') });
      return;
    }

    gezienItemsets.add(itemset);
    geldig.push(ruw);
  });

  return { geldig, fouten };
}
