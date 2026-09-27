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
import type { Categorie, Gelegenheid, Kandidaat, StylistOutfit, TasteProfileInput } from './keten-types.ts';

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

/**
 * Product-ids die in meer dan een outfit van de set voorkomen (fixronde 1,
 * taak 6b, eis 2). Losse export naast controleerGeenDubbeleProducten hierboven:
 * die laatste bouwt een leesbare foutmelding MET outfit-indices ("outfit 2 en
 * outfit 4"), bedoeld voor een mens die de hele set ziet. Het vulscript
 * (stylist-vul-cache.ts) heeft voor zijn herkansingsprompt alleen de kale
 * lijst product-ids nodig: elke `claude -p`-poging is een verse, geheugenloze
 * sessie die zijn eigen vorige antwoord niet terugziet, dus een verwijzing
 * naar "outfit 2" is daar zinloos. Wat wel werkt: expliciet zeggen welke
 * product-ids niet twee keer gebruikt mogen worden, als extra harde eis.
 * Gemeten op de echte run van 27 september: de volledige foutmelding
 * ("product X komt twee keer voor in de set: outfit 2 en outfit 4") als
 * enige herkansingsfout meegeven leverde een compleet leeg antwoord op (zes
 * outfits zonder items). Deze functie maakt de kortere, gerichte variant uit
 * dat rapport mogelijk.
 */
export function vindDubbeleProductIds(outfits: StylistOutfit[]): string[] {
  const gezien = new Set<string>();
  const dubbel = new Set<string>();
  for (const outfit of outfits) {
    for (const item of outfit.items) {
      if (gezien.has(item.product_id)) dubbel.add(item.product_id);
      gezien.add(item.product_id);
    }
  }
  return [...dubbel];
}

export interface PoolToetsResultaat {
  voldoende: boolean;
  /** Waarom de pool onvoldoende is. Afwezig als voldoende true is. */
  reden?: string;
}

/**
 * Toetst OF een kandidatenpool wiskundig genoeg heeft om zes outfits te
 * vormen zonder dat een product tweemaal wordt gebruikt (de regel hierboven),
 * VOORDAT er een `claude -p`-aanroep gedaan wordt (fixronde 1, taak 6b, eis
 * 1). Puur en gratis: als deze toets al faalt, kan geen enkele modeluitvoer
 * regel 3 halen, ongeacht hoe goed het model is. Aanleiding: de echte run van
 * 27 september werd tegen het profiel "man klassiek" aangehouden voordat hij
 * gedraaid werd, juist omdat een handmatige telling al liet zien dat de pool
 * (2 footwear-kandidaten) dit nooit kon halen; deze functie maakt die telling
 * onderdeel van het script zelf in plaats van een handmatige stap vooraf.
 *
 * Afleiding uit isCompleet (valideer-outfits.ts), met de hand gesynchroniseerd
 * en niet mechanisch geïmporteerd (isCompleet neemt een platte rollenlijst,
 * geen kandidatenpool, dus er is geen manier om deze toets rechtstreeks op
 * isCompleet te bouwen zonder alle mogelijke roltoewijzingen te enumereren).
 * isCompleet keurt een outfit goed als:
 *   (a) hij footwear bevat, EN
 *   (b) hij OFWEL een dress bevat (zonder top en zonder bottom), OFWEL zowel
 *       een top als een bottom bevat (zonder dress).
 * outerwear en accessory zijn in isCompleet nooit verplicht, dus hun aantal
 * in de pool telt hier niet mee.
 *
 * Gevolg voor zes outfits zonder hergebruik van een product:
 * - footwear zit in ELKE outfit (voorwaarde a is onvoorwaardelijk), dus er
 *   moeten minstens VEREIST_AANTAL_OUTFITS verschillende footwear-kandidaten
 *   zijn.
 * - top+bottom versus dress is een keuze PER outfit (voorwaarde b): van de
 *   zes outfits kunnen er x op een dress gebaseerd zijn en 6-x op een
 *   top+bottom-combinatie, voor elke x waarvoor x <= aantal dresses en
 *   (6-x) <= min(aantal tops, aantal bottoms). Zo'n verdeling bestaat precies
 *   dan als (aantal dresses) + min(aantal tops, aantal bottoms) >=
 *   VEREIST_AANTAL_OUTFITS: kies x = min(aantal dresses, VEREIST_AANTAL_OUTFITS),
 *   dan is 6-x vanzelf <= min(tops, bottoms) zodra die som groot genoeg is.
 *
 * Verandert isCompleet ooit welke rollen verplicht zijn of de dress/top+
 * bottom-tweedeling, dan moet deze functie in dezelfde beweging mee: dit is
 * een bewust met de hand gesynchroniseerde afleiding, geen garantie die de
 * compiler afdwingt.
 */
export function toetsKandidatenpool(kandidaten: Kandidaat[]): PoolToetsResultaat {
  const uniekePerCategorie = new Map<Categorie, Set<string>>();
  for (const k of kandidaten) {
    const set = uniekePerCategorie.get(k.category) ?? new Set<string>();
    set.add(k.product_id);
    uniekePerCategorie.set(k.category, set);
  }
  const aantal = (categorie: Categorie): number => uniekePerCategorie.get(categorie)?.size ?? 0;

  const footwear = aantal('footwear');
  if (footwear < VEREIST_AANTAL_OUTFITS) {
    return {
      voldoende: false,
      reden:
        `te weinig footwear-kandidaten voor ${VEREIST_AANTAL_OUTFITS} outfits zonder hergebruik van een product: ` +
        `${footwear} beschikbaar (elke outfit heeft footwear nodig, isCompleet)`,
    };
  }

  const dress = aantal('dress');
  const top = aantal('top');
  const bottom = aantal('bottom');
  const maxTopBottomOutfits = Math.min(top, bottom);
  if (dress + maxTopBottomOutfits < VEREIST_AANTAL_OUTFITS) {
    return {
      voldoende: false,
      reden:
        `te weinig top/bottom/dress-kandidaten voor ${VEREIST_AANTAL_OUTFITS} outfits zonder hergebruik van een product: ` +
        `${dress} dress + min(${top} top, ${bottom} bottom) = ${dress + maxTopBottomOutfits}, nodig ${VEREIST_AANTAL_OUTFITS}`,
    };
  }

  return { voldoende: true };
}
