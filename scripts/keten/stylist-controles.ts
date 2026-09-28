/**
 * Controles uit spec 5.7 op een outfit-set, als pure functies zodat vitest
 * ze test en stylist-run.ts ze tegen de live database gebruikt.
 *
 * Bewuste keuze (brief taak 8, plan 3): dit is een ONAFHANKELIJKE tweede
 * mening op wat er in outfit_sets staat, geen tweede aanroep van valideerSet
 * (supabase/functions/_shared/valideer-set.ts). Een set kan geschreven zijn
 * onder een oudere versie van die regels; deze controles toetsen zelfstandig
 * wat een echte bezoeker zou zien, los van wat het vulscript op dat moment
 * dacht dat geldig was. isCompleet is de enige functie die wel wordt
 * hergebruikt: die drukt precies uit wat een "complete outfit" betekent
 * (top+bottom+footwear of dress+footwear) en dat opnieuw uittikken zou geen
 * onafhankelijke controle zijn, alleen een kopie die kan gaan afwijken.
 */
import { isCompleet } from '../../supabase/functions/_shared/valideer-outfits.ts';
import type { VerrijkteOutfit } from '../../src/keten/types';

const VERWACHT = 6;

export function controleerOutfitSet(
  outfits: VerrijkteOutfit[],
  budget: { min: number; max: number }
): string[] {
  const fouten: string[] = [];
  if (outfits.length < VERWACHT) {
    fouten.push(`${outfits.length} outfits, verwacht ${VERWACHT}`);
  }

  const gezien = new Map<string, number>();
  outfits.forEach((o, i) => {
    const label = `outfit ${i + 1} (${o.title})`;
    const rollen = o.items.map((it) => it.role);
    if (!isCompleet(rollen)) {
      fouten.push(`${label} niet compleet: rollen ${rollen.join('+') || 'geen'}`);
    }
    for (const it of o.items) {
      const prijs = it.product.price;
      if (typeof prijs !== 'number' || prijs < budget.min || prijs > budget.max) {
        fouten.push(`${label}: ${it.product_id} kost ${prijs}, budget ${budget.min} tot ${budget.max}`);
      }
      if (o.occasion === 'work') {
        if (it.role === 'footwear' && it.attrs.shoe_type === 'sandaal') {
          fouten.push(`${label}: sandaal bij work (${it.product.name})`);
        }
        if (it.role === 'accessory' && /zwem/i.test(it.product.name)) {
          fouten.push(`${label}: zwem-item bij work (${it.product.name})`);
        }
      }
    }
    const itemset = o.items.map((it) => it.product_id).sort().join('|');
    const eerder = gezien.get(itemset);
    if (eerder !== undefined) {
      fouten.push(`${label} heeft dezelfde items als outfit ${eerder + 1}`);
    } else {
      gezien.set(itemset, i);
    }
  });

  return fouten;
}

/** Twee runs zijn gelijk als de outfit_keys in dezelfde volgorde gelijk zijn. */
export function zelfdeOutfits(a: VerrijkteOutfit[], b: VerrijkteOutfit[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((o, i) => o.outfit_key === b[i].outfit_key);
}
