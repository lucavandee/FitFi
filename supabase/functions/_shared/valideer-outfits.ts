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
