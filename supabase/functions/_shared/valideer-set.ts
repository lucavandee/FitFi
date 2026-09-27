/**
 * Harde validatie van een hele outfit-set (taak 6b), naast valideer-outfits.ts
 * dat elke outfit op zichzelf beoordeelt.
 *
 * bouwSysteemPrompt() (stylist-prompt.ts) legt tien regels op. valideerOutfits
 * dekt regel 1, 3, 6, 7 en 8: die gaan over een outfit op zichzelf, los van de
 * rest van de set. Regel 2 (precies zes outfits), 4 (elke gelegenheid uit het
 * profiel minstens een keer) en 5 (geen twee outfits met dezelfde top of
 * dezelfde dress) gaan over de SET als geheel en werden door niets afgedwongen
 * (zie het commentaar bovenaan valideer-outfits.ts, dat dit gat al benoemde
 * bij taak 4). Deze functie sluit dat gat, en gaat op een punt strenger dan
 * regel 5: geen enkel product mag twee keer voorkomen in de hele set, niet
 * alleen dezelfde top of dezelfde jurk. Het harnas (valideerOutfits) vangt
 * alleen twee outfits met precies dezelfde itemset; een top die in twee
 * verder verschillende outfits terugkomt glipt daar doorheen.
 *
 * Puur, zonder Deno- of browser-globals: vitest, Deno en het vulscript
 * (scripts/keten/stylist-vul-cache.ts) importeren dit bestand ongewijzigd.
 *
 * Volgorde in het vulscript: eerst valideerOutfits (per outfit), dan deze
 * functie op de outfits die daar doorheen kwamen. Een set wordt alleen
 * weggeschreven als BEIDE zonder fouten teruggeven.
 */
import type { Gelegenheid, StylistOutfit, TasteProfileInput } from './keten-types.ts';

export interface ValideerSetResultaat {
  geldig: boolean;
  fouten: string[];
}

/** Regel 2 uit bouwSysteemPrompt: precies zes outfits. */
export const VEREIST_AANTAL_OUTFITS = 6;

/**
 * Regel 4: elke gevraagde gelegenheid komt minstens een keer voor.
 *
 * Twee randgevallen, allebei expliciet omdat de regel anders soms een eis
 * stelt die niet gehaald kan worden:
 * - Het profiel vraagt NUL gelegenheden: de regel vervalt. Er is dan niets om
 *   te dekken, en "elke gevraagde gelegenheid" is triviaal waar over een lege
 *   verzameling. Dit gebeurt in de praktijk niet via de echte onboarding
 *   (spec 6 vraagt minstens een gelegenheid), maar deze functie is puur en
 *   moet ook op ongeldige invoer een zinnig, begrensd antwoord geven in
 *   plaats van een regel die stilzwijgend niets controleert of per ongeluk
 *   altijd faalt.
 * - Het profiel vraagt MEER dan VEREIST_AANTAL_OUTFITS (zes) gelegenheden:
 *   met precies zes outfits en elke outfit een gelegenheid, kunnen er
 *   hoogstens zes verschillende gelegenheden gedekt worden. Volledige dekking
 *   van bijvoorbeeld zeven gevraagde gelegenheden is dan onmogelijk, ongeacht
 *   hoe goed de set is. De eis valt in dat geval terug op "minstens zes
 *   verschillende gelegenheden in de set" (in de praktijk: geen twee outfits
 *   met dezelfde gelegenheid), in plaats van een regel die altijd faalt.
 *   TasteProfileInput.occasions is in de echte onboarding (spec 5.2) beperkt
 *   tot maximaal drie, dus dit pad is vandaag theoretisch; het staat hier
 *   zodat de functie op elke invoer een begrensd antwoord geeft, niet omdat
 *   het een verwacht productiescenario is.
 */
function controleerGelegenheidsdekking(outfits: StylistOutfit[], gevraagd: readonly Gelegenheid[]): string[] {
  const uniekGevraagd = Array.from(new Set(gevraagd));
  if (uniekGevraagd.length === 0) return [];

  const gedekt = new Set(outfits.map((o) => o.occasion));

  if (uniekGevraagd.length > VEREIST_AANTAL_OUTFITS) {
    if (gedekt.size < VEREIST_AANTAL_OUTFITS) {
      return [
        `profiel vraagt ${uniekGevraagd.length} gelegenheden, meer dan de ${VEREIST_AANTAL_OUTFITS} outfits kunnen dekken; ` +
          `verwacht daarom minstens ${VEREIST_AANTAL_OUTFITS} verschillende gelegenheden in de set, kreeg er ${gedekt.size} (${[...gedekt].join(', ') || 'geen'})`,
      ];
    }
    return [];
  }

  const ontbrekend = uniekGevraagd.filter((g) => !gedekt.has(g));
  if (ontbrekend.length === 0) return [];
  return [`gelegenheid(-heden) niet gedekt: ${ontbrekend.join(', ')}`];
}

/**
 * Regel: geen enkel product komt twee keer voor over de hele set. Elke extra
 * keer dat een product_id opduikt is een eigen overtreding met een leesbare
 * reden, zodat een set met bijvoorbeeld dezelfde jas in drie outfits ook drie
 * keer terugkomt in de foutenlijst (nuttig als herkansingsprompt: het model
 * ziet dan alle plekken, niet alleen de eerste).
 */
function controleerGeenDubbeleProducten(outfits: StylistOutfit[]): string[] {
  const fouten: string[] = [];
  const eersteOutfitPerProduct = new Map<string, number>();

  outfits.forEach((outfit, index) => {
    for (const item of outfit.items) {
      const eerder = eersteOutfitPerProduct.get(item.product_id);
      if (eerder === undefined) {
        eersteOutfitPerProduct.set(item.product_id, index);
        continue;
      }
      fouten.push(
        `product ${item.product_id} komt twee keer voor in de set: outfit ${eerder} en outfit ${index}`
      );
    }
  });

  return fouten;
}

/**
 * Beoordeelt een hele set. `outfits` is bedoeld als de uitvoer van
 * valideerOutfits (alleen de outfits die de per-outfit controle al haalden),
 * niet de ruwe modeluitvoer: regel 2 hieronder telt dus impliciet ook mee of
 * er onderweg outfits zijn afgekeurd, want die tellen dan niet meer mee in
 * `outfits.length`.
 */
export function valideerSet(
  outfits: StylistOutfit[],
  profile: Pick<TasteProfileInput, 'occasions'>
): ValideerSetResultaat {
  const fouten: string[] = [];

  if (outfits.length !== VEREIST_AANTAL_OUTFITS) {
    fouten.push(`verwacht precies ${VEREIST_AANTAL_OUTFITS} outfits, kreeg ${outfits.length}`);
  }

  fouten.push(...controleerGelegenheidsdekking(outfits, profile.occasions));
  fouten.push(...controleerGeenDubbeleProducten(outfits));

  return { geldig: fouten.length === 0, fouten };
}
