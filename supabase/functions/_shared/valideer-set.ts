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
 * bij taak 4). Deze functie sluit dat gat.
 *
 * FIX 3 (eindreview plan 3, 27 sept 2026): regel 3 hieronder stond eerder
 * strenger dan promptregel 5: elk product mocht maar in een outfit van de set
 * voorkomen, niet alleen dezelfde top of dezelfde dress. Promptregel 5 zegt
 * letterlijk "Geen twee outfits met dezelfde top of dezelfde dress" -- dezelfde
 * schoen, broek, jas of tas in twee outfits is normale styling, geen fout. Die
 * eigen, strengere keuze had geen onderbouwing in de spec en heeft in de
 * praktijk al een herkansing gekost (een geldig antwoord afgekeurd op een
 * regel die de prompt zelf niet stelde). Regel 3 is daarom teruggebracht tot
 * precies wat de prompt zegt: geen enkel product twee keer in de rol top of
 * dress; elke andere rol (bottom, footwear, outerwear, accessory) mag
 * herhalen. toetsKandidatenpool hieronder is in dezelfde beweging meeveranderd:
 * die eiste eerder zes verschillende kandidaten per rol die aan de
 * compleetheid bijdraagt (footwear, en top+bottom versus dress); dat hoeft nu
 * alleen nog voor top en dress, de twee rollen met een uniciteitseis.
 *
 * FIX 4 en FIX 5 (herreview van de eindreview van plan 3, twee geparkeerde
 * bevindingen, 28 sept 2026, vóór de eerste echte vulronde):
 * - FIX 4: toetsKandidatenpool kende geen shoe_type en geen gevraagde
 *   gelegenheden. controleerSamenhang (valideer-outfits.ts) keurt elke
 *   footwear met shoe_type 'sandaal' af bij occasion work of formal, en
 *   isCompleet eist footwear in elke outfit. Een pool met uitsluitend
 *   sandalen als footwear haalde de pooltoets dus terwijl elke outfit met
 *   work of formal daarna gegarandeerd werd afgekeurd: geen modelfout, een
 *   onmogelijke opdracht. toetsKandidatenpool krijgt nu de gevraagde
 *   gelegenheden mee en eist bij work of formal minstens een footwear-
 *   kandidaat die geen sandaal is.
 * - FIX 5: de versoepeling van FIX 3 (elke rol behalve top/dress mag
 *   onbeperkt herhalen) botst met de budgetregel in valideer-outfits.ts: een
 *   item buiten het budget van de lezende bezoeker laat de HELE outfit
 *   vallen, niet alleen het item. Gebruikt het model dezelfde schoen in alle
 *   zes outfits en valt de prijs van die schoen buiten het smallere budget
 *   van een bezoeker, dan verdwijnen alle zes outfits in plaats van een
 *   enkele. Elke rol behalve top/dress mag daarom nog herhalen, maar niet
 *   vaker dan MAX_HERHALINGEN_PER_PRODUCT (de helft van de zes outfits).
 *   toetsKandidatenpool is in dezelfde beweging meeveranderd: footwear (in
 *   elke outfit verplicht) en bottom (voor een top+bottom-outfit) hebben nu
 *   allebei genoeg unieke kandidaten nodig om dat plafond te halen, niet
 *   meer voldoende met een enkele kandidaat die vrij herhaalt.
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
 * Rollen met een uniciteitseis over de hele set (promptregel 5, letterlijk):
 * top en dress. Alle andere rollen (bottom, footwear, outerwear, accessory)
 * mogen sinds fix 3 herhalen.
 */
const ROLLEN_MET_UNIEKHEIDSEIS: readonly Categorie[] = ['top', 'dress'];

/**
 * FIX 5 (herreview plan 3, bevinding 2): plafond voor elke rol ZONDER
 * uniciteitseis (bottom, footwear, outerwear, accessory). Zonder plafond kan
 * het model bijvoorbeeld dezelfde schoen in alle zes outfits zetten; valt de
 * prijs van dat ene item buiten het budget van de lezende bezoeker, dan
 * verwerpt valideerOutfits (budgetregel, per item) niet een outfit maar alle
 * zes, want ze delen allemaal hetzelfde item. "Niet meer dan de helft van de
 * outfits" bij zes outfits is drie.
 */
export const MAX_HERHALINGEN_PER_PRODUCT = Math.floor(VEREIST_AANTAL_OUTFITS / 2);

/**
 * Regel 3 (promptregel 5): geen enkel product komt twee keer voor als top of
 * dress over de hele set. Elke andere rol mag herhalen (fix 3, eindreview
 * plan 3: dit stond eerder op ELK product, strenger dan de prompt zelf). Elke
 * extra keer dat een top- of dress-product_id opduikt is een eigen
 * overtreding met een leesbare reden, zodat een set met bijvoorbeeld dezelfde
 * jurk in drie outfits ook drie keer terugkomt in de foutenlijst (nuttig als
 * herkansingsprompt: het model ziet dan alle plekken, niet alleen de eerste).
 */
function controleerGeenDubbeleProducten(outfits: StylistOutfit[]): string[] {
  const fouten: string[] = [];
  const eersteOutfitPerProduct = new Map<string, number>();

  outfits.forEach((outfit, index) => {
    for (const item of outfit.items) {
      if (!ROLLEN_MET_UNIEKHEIDSEIS.includes(item.role)) continue;
      const eerder = eersteOutfitPerProduct.get(item.product_id);
      if (eerder === undefined) {
        eersteOutfitPerProduct.set(item.product_id, index);
        continue;
      }
      fouten.push(
        `product ${item.product_id} (rol ${item.role}) komt twee keer voor in de set als top of dress: outfit ${eerder} en outfit ${index}`
      );
    }
  });

  return fouten;
}

/**
 * FIX 5 (herreview plan 3, bevinding 2): plafond op herhaling voor elke rol
 * ZONDER uniciteitseis (bottom, footwear, outerwear, accessory; top en dress
 * hebben hun eigen, strengere regel hierboven en worden hier overgeslagen).
 * Net als controleerGeenDubbeleProducten hierboven: een eigen, leesbare
 * overtreding per product dat over het plafond gaat, met de betrokken
 * outfit-indices, zodat de foutenlijst precies aanwijst welk product te vaak
 * gedeeld wordt.
 */
function controleerMaxHerhalingen(outfits: StylistOutfit[]): string[] {
  const fouten: string[] = [];
  const outfitIndicesPerProduct = new Map<string, number[]>();

  outfits.forEach((outfit, index) => {
    for (const item of outfit.items) {
      if (ROLLEN_MET_UNIEKHEIDSEIS.includes(item.role)) continue;
      const indices = outfitIndicesPerProduct.get(item.product_id) ?? [];
      indices.push(index);
      outfitIndicesPerProduct.set(item.product_id, indices);
    }
  });

  for (const [productId, indices] of outfitIndicesPerProduct) {
    if (indices.length > MAX_HERHALINGEN_PER_PRODUCT) {
      fouten.push(
        `product ${productId} komt in ${indices.length} outfits voor (outfit ${indices.join(', ')}), meer dan het plafond van ${MAX_HERHALINGEN_PER_PRODUCT} (niet meer dan de helft van ${VEREIST_AANTAL_OUTFITS} outfits)`
      );
    }
  }

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
  fouten.push(...controleerMaxHerhalingen(outfits));

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
 *
 * FIX 3 (eindreview plan 3): beperkt tot de rollen top en dress, in dezelfde
 * beweging als controleerGeenDubbeleProducten hierboven. Zonder deze
 * beperking zou de herkansingsprompt het model instrueren een dubbele
 * schoen, broek, jas of tas te vervangen terwijl dat sinds fix 3 geen
 * overtreding meer is: een onterechte, verwarrende extra eis.
 */
export function vindDubbeleProductIds(outfits: StylistOutfit[]): string[] {
  const gezien = new Set<string>();
  const dubbel = new Set<string>();
  for (const outfit of outfits) {
    for (const item of outfit.items) {
      if (!ROLLEN_MET_UNIEKHEIDSEIS.includes(item.role)) continue;
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
 * vormen zonder dat een TOP of DRESS tweemaal wordt gebruikt (de regel
 * hierboven), VOORDAT er een `claude -p`-aanroep gedaan wordt (fixronde 1,
 * taak 6b, eis 1). Puur en gratis: als deze toets al faalt, kan geen enkele
 * modeluitvoer regel 3 halen, ongeacht hoe goed het model is.
 *
 * FIX 3 (eindreview plan 3, 27 sept 2026): eerder eiste deze functie ook zes
 * verschillende footwear-kandidaten en telde bottom mee in min(top, bottom),
 * omdat regel 3 toen ELK product maar eenmaal toestond. Sinds fix 3 geldt de
 * uniciteitseis alleen nog voor top en dress (promptregel 5, letterlijk); een
 * outfit heeft nog altijd footwear nodig (isCompleet blijft ongewijzigd),
 * maar diezelfde footwear-kandidaat mag nu herhalen. De aanleiding van de
 * oorspronkelijke toets (de echte run van 27 september tegen het profiel
 * "man klassiek", 2 footwear-kandidaten) faalt sinds fix 3 niet meer op
 * footwear, maar zou nog altijd kunnen falen op te weinig unieke tops/dresses;
 * zie de tests voor dat onderscheid.
 *
 * FIX 4 en FIX 5 (herreview plan 3, geparkeerde bevindingen, 28 sept 2026; zie
 * het bestandscommentaar bovenaan dit bestand voor de aanleiding):
 * - FIX 4: `gevraagdeGelegenheden` is nieuw. Bevat die work of formal, dan
 *   moet er minstens een footwear-kandidaat zijn die GEEN sandaal is, anders
 *   is elke outfit met die gelegenheid vooraf al kansloos op regel 9
 *   (controleerSamenhang, valideer-outfits.ts).
 * - FIX 5: footwear mag sinds fix 3 herhalen, maar niet vaker dan
 *   MAX_HERHALINGEN_PER_PRODUCT. Omdat footwear in ELKE outfit verplicht is,
 *   zijn er nu minstens twee unieke footwear-kandidaten nodig (een enkele
 *   kandidaat dekt hoogstens MAX_HERHALINGEN_PER_PRODUCT van de zes outfits,
 *   niet alle zes). Hetzelfde plafond geldt voor bottom in een
 *   top+bottom-outfit.
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
 * Gevolg voor zes outfits zonder hergebruik van een TOP of DRESS, en met
 * hoogstens MAX_HERHALINGEN_PER_PRODUCT herhalingen van elk ander product:
 * - footwear zit in ELKE outfit (voorwaarde a is onvoorwaardelijk): er zijn
 *   genoeg footwear-kandidaten als footwear * MAX_HERHALINGEN_PER_PRODUCT
 *   >= VEREIST_AANTAL_OUTFITS (bij het huidige plafond van drie: minstens
 *   twee kandidaten).
 * - top+bottom versus dress is een keuze PER outfit (voorwaarde b): van de
 *   zes outfits kunnen er x op een dress gebaseerd zijn en 6-x op een
 *   top+bottom-combinatie, voor elke x waarvoor x <= aantal dresses en
 *   (6-x) <= aantal tops (top-uniciteit) EN (6-x) <= bottom *
 *   MAX_HERHALINGEN_PER_PRODUCT (bottom-plafond). Zo'n verdeling bestaat
 *   precies dan als (aantal dresses) + min(aantal tops, aantal bottoms *
 *   MAX_HERHALINGEN_PER_PRODUCT) >= VEREIST_AANTAL_OUTFITS.
 *
 * Verandert isCompleet ooit welke rollen verplicht zijn of de dress/top+
 * bottom-tweedeling, of verandert de uniciteitseis van regel 3 of het plafond
 * van FIX 5 ooit weer welke rollen ze raken, dan moet deze functie in
 * dezelfde beweging mee: dit is een bewust met de hand gesynchroniseerde
 * afleiding, geen garantie die de compiler afdwingt.
 */
export function toetsKandidatenpool(
  kandidaten: Kandidaat[],
  gevraagdeGelegenheden: readonly Gelegenheid[]
): PoolToetsResultaat {
  const uniekePerCategorie = new Map<Categorie, Set<string>>();
  for (const k of kandidaten) {
    const set = uniekePerCategorie.get(k.category) ?? new Set<string>();
    set.add(k.product_id);
    uniekePerCategorie.set(k.category, set);
  }
  const aantal = (categorie: Categorie): number => uniekePerCategorie.get(categorie)?.size ?? 0;

  // FIX 5: footwear zit in elke outfit en mag herhalen, maar niet vaker dan
  // MAX_HERHALINGEN_PER_PRODUCT. Dit vervangt de oude "footwear < 1"-toets
  // (fix 3): die volstaat niet meer, want een enkele footwear-kandidaat dekt
  // met het plafond hoogstens MAX_HERHALINGEN_PER_PRODUCT van de zes
  // outfits. footwear = 0 faalt hier ook (0 * plafond = 0), dus de oude
  // "geen enkele kandidaat"-melding is hier niet apart nodig.
  const footwear = aantal('footwear');
  if (footwear * MAX_HERHALINGEN_PER_PRODUCT < VEREIST_AANTAL_OUTFITS) {
    return {
      voldoende: false,
      reden:
        `te weinig unieke footwear-kandidaten: ${footwear} (elke outfit heeft footwear nodig, isCompleet), elk mag hoogstens ` +
        `${MAX_HERHALINGEN_PER_PRODUCT} keer voorkomen (${footwear} x ${MAX_HERHALINGEN_PER_PRODUCT} = ${footwear * MAX_HERHALINGEN_PER_PRODUCT}), nodig ${VEREIST_AANTAL_OUTFITS}`,
    };
  }

  // FIX 4: een pool met uitsluitend sandalen als footwear is voor work/formal
  // net zo kansloos als een pool zonder footwear, ook al haalt hij de toets
  // hierboven. Alleen relevant als work of formal daadwerkelijk gevraagd
  // wordt: bij bijvoorbeeld uitsluitend casual is een sandaal-only pool prima.
  const vraagtFormeelSchoeisel = gevraagdeGelegenheden.some((g) => g === 'work' || g === 'formal');
  if (vraagtFormeelSchoeisel) {
    const heeftNietSandaal = kandidaten.some((k) => k.category === 'footwear' && k.attrs.shoe_type !== 'sandaal');
    if (!heeftNietSandaal) {
      return {
        voldoende: false,
        reden:
          "work of formal gevraagd, maar alle footwear-kandidaten hebben shoe_type 'sandaal'; regel 9 keurt sandaal af bij " +
          'work/formal (controleerSamenhang, valideer-outfits.ts) en elke outfit heeft footwear nodig (isCompleet)',
      };
    }
  }

  const dress = aantal('dress');
  const top = aantal('top');
  const bottom = aantal('bottom');
  // FIX 5: bottom mag sinds fix 3 herhalen, maar heeft nu ook een plafond
  // (MAX_HERHALINGEN_PER_PRODUCT). Het aantal top+bottom-outfits dat de pool
  // aankan is dus begrensd door BEIDE: de top-uniciteitseis (top) EN het
  // bottom-plafond (bottom * MAX_HERHALINGEN_PER_PRODUCT), niet langer
  // "top, mits er een bottom is".
  const maxTopBottomOutfits = Math.min(top, bottom * MAX_HERHALINGEN_PER_PRODUCT);
  if (dress + maxTopBottomOutfits < VEREIST_AANTAL_OUTFITS) {
    return {
      voldoende: false,
      reden:
        `te weinig unieke top/dress-kandidaten voor ${VEREIST_AANTAL_OUTFITS} outfits zonder hergebruik van een top of dress: ` +
        `${dress} dress + ${maxTopBottomOutfits} top (begrensd door top-uniciteit en het bottom-plafond) = ${dress + maxTopBottomOutfits}, nodig ${VEREIST_AANTAL_OUTFITS}`,
    };
  }

  return { voldoende: true };
}
