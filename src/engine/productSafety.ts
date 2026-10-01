/**
 * Vangnet tegen producten die nooit in een outfit horen.
 *
 * Achtergrond (2026-08-06). Op productie kregen gebruikers een gele
 * bijzettafel, Hello Kitty-peuterschoenen en een sport-bh in hun outfit. De
 * oorzaak ligt in de data, niet in de smaak van het algoritme:
 *
 * 1. Een oude feed-importer eindigde zijn categorie-bepaling met
 *    `return "top"`. Alles zonder trefwoordmatch (meubels, vazen, plaids)
 *    kreeg daardoor category='top'. Die rijen zijn nooit herclassificeerd.
 * 2. De kolom `is_kids` is in de praktijk onbruikbaar: de import zette hem
 *    alleen op basis van EU kinder-KLEDINGmaten (50-176) en keek niet naar
 *    kinder-SCHOENmaten. Een peuterschoen met maat 24 glipt er dus door.
 * 3. De ondergoed-filter in adaptiveOutfitGenerator gebruikte /^bh\b/, met
 *    een anker op het BEGIN van de string. Die matcht nooit een productnaam
 *    die met een merk begint, en kent het woord "beha" niet.
 *
 * Dit bestand is bewust een LAATSTE verdedigingslinie op productniveau: het
 * corrigeert de databron niet, het houdt alleen tegen wat er evident niet in
 * hoort. De echte oplossing is een backfill van de classificatie plus een
 * import die niet raadt. Zolang die er niet is, hoort elke outfit-generator
 * hier doorheen te filteren.
 *
 * Ontwerpregel: liever een twijfelgeval doorlaten dan een legitiem product
 * weggooien. Elke regel hieronder is daarom eng geformuleerd en getoetst
 * tegen echte productnamen uit de catalogus.
 */

/** Woon-, keuken- en decoratieartikelen die als kleding geregistreerd staan. */
const NIET_KLEDING = new RegExp(
  [
    'bijzettafel', 'salontafel', '\\btafel\\b', '\\bkruk\\b', '\\bstoel\\b',
    '\\bvaas\\b', 'keramiek', '\\bkaars\\b', 'candle', '\\blamp\\b',
    'vloerkleed', 'tapijt', '\\bplaid\\b', 'kussenhoes', '\\bdekbed\\b',
    'handdoek', 'baddoek', 'gordijn', '\\blaken\\b', 'bedsprei',
    '\\bspiegel\\b', '\\bmok\\b', '\\bbord\\b', '\\bschaal\\b', 'beslagkom',
    'poster', 'knuffel', 'speelgoed', 'puzzel', 'sleutelhanger',
    'telefoonhoesje', 'opbergdoos', 'wasmand',
  ].join('|'),
  'i'
);

/** Ondergoed en lingerie. Let op: geen anker aan het begin van de string. */
const ONDERGOED = new RegExp(
  [
    // Samenstellingen meenemen: "trainingsbeha" en "sportbh" hebben geen
    // woordgrens voor het kernwoord, net als bij de productclassifier.
    '\\b[a-z]*bh\\b', '\\b[a-z]*beha\\b', '\\bbra\\b', 'bralette',
    'lingerie', 'ondergoed', 'onderbroek', 'boxershort',
    // "slip" is geen bruikbaar los woord. Het zit in slip-on, slip-in en
    // slip-over, en dat zijn schoenen en truien. Op de live catalogus raakte
    // \bslip\b 88 legitieme producten tegen 32 echte slips, en het sprak
    // productClassifier tegen, dat /\bslip-on(s)?\b/ juist als FOOTWEAR kent.
    '\\bslipjes?\\b',
    '\\bslips?\\b(?!\\s*-?\\s*(on|in|over|dress))',
    '\\bstring\\b(?!er)', '\\bthong\\b',
  ].join('|'),
  'i'
);

/**
 * Kleding voor een doelgroep waar de gebruiker niet om vroeg: zwangerschaps-
 * en voedingskleding.
 *
 * Gemeten op de live catalogus (2026-09-28): 2.033 producten dragen "MAMA" als
 * lijnprefix van H&M, en alle 2.033 zijn zwangerschaps- of voedingskleding.
 * Nul valse positieven: er is geen enkel product waar het woord buiten die
 * lijn voorkomt. De 207 treffers op "voedings" zitten volledig binnen dezelfde
 * groep, dus die regel is een riem naast de bretels.
 *
 * Waarom dit hier hoort en niet in de tagger: van de catalogus is 94,3 procent
 * nooit door de LLM getagd, en van het deel dat dat wel is krijgt een
 * MAMA-jurk gewoon category 'dress' met occasions {casual,work} en zekerheid
 * 0,9. De tagger is er zeker van, en heeft ook geen veld om het in te zetten:
 * het schema in scripts/keten/tagging.ts kent geen doelgroep. Tot dat veld er
 * is, houdt dit vangnet ze tegen.
 *
 * Gevonden doordat het persona-harnas GROEN gaf terwijl "vrouw minimalistisch"
 * een MAMA-overhemdjurk in een werkoutfit kreeg en "vrouw romantisch" een
 * MAMA-mousseline blouse. Het harnas controleert categorie, gender, budget en
 * gelegenheid, en op al die velden klopten die items.
 *
 * maternity, nursing en positiekleding staan er nu op nul, maar zijn de juiste
 * woorden zodra een andere aanbieder binnenkomt.
 */
const DOELGROEP = new RegExp(
  [
    '\\bmama\\b', 'zwangerschap', 'voedings', '\\bmaternity\\b',
    '\\bnursing\\b', 'positiekleding',
  ].join('|'),
  'i'
);

/**
 * Kledingstukken die als accessoire getagd staan.
 *
 * Een broek in de accessoire-sleuf levert een outfit op met een jurk en een
 * pantalon "erbij". Gemeten op 2026-09-28: 28 producten, allemaal
 * "H & M - Pantalon met riem" of "Broek met riem". De naam noemt de riem,
 * en daar is de classificatie op afgegaan.
 *
 * Bewust alleen pantalon en broek, en uitdrukkelijk NIET jeans, jurk, rok of
 * schoen. Een bredere regel liep vol met merknamen: "Hat MOSCHINO JEANS",
 * "Sunglasses CALVIN KLEIN JEANS" en "Neck Scarf VERSACE JEANS COUTURE" zijn
 * terecht accessoires. Op die bredere variant waren 142 van de 170 treffers
 * vals. Met pantalon en broek alleen: 28 treffers, nul vals.
 *
 * \bbroek\b raakt "broekriem" niet, want daar ontbreekt de woordgrens. Dat is
 * precies de bedoeling: een broekriem is wel een accessoire.
 *
 * Weigeren en niet herstellen: als de categorie accessory is, kan het item ook
 * niet als bottom dienen. Er gaat dus niets bruikbaars verloren.
 */
const KLEDING_ALS_ACCESSOIRE = /\bpantalon\b|\bbroek\b/i;

/** Expliciete kindmarkeringen in de productnaam. */
const KIND_IN_NAAM = new RegExp(
  [
    // \bpeuter zonder afsluiting raakt het jassenmerk Peuterey (91 modellen
    // in de catalogus, waaronder 31 jassen). De lookahead houdt peuterschoen
    // en peuters wel, Peuterey niet.
    'hello kitty', 'minicats', '\\bpeuter(?!ey)', '\\bbaby\\b', '\\bbabies\\b',
    '\\bkinder', '\\bkids?\\b', '\\bjunior\\b', '\\btoddler\\b',
    '\\bnewborn\\b', '\\binfant\\b', '\\bmeisjes\\b', '\\bjongens\\b',
    '\\bgirls\\b', '\\bboys\\b',
    // Maataanduidingen als "Maat 2-3Y", "3-4 jaar", "Maat 92"
    'maat\\s*\\d{1,2}\\s*-\\s*\\d{1,2}\\s*(y\\b|jaar)',
    '\\b\\d{1,2}\\s*-\\s*\\d{1,2}\\s*(y|m)\\b',
    'maat\\s*(5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9]|1[0-6][0-9]|17[0-6])\\b',
  ].join('|'),
  'i'
);

/**
 * Kinderschoenen op maat, uitsluitend in EU-notatie.
 *
 * Bovengrens 34: EU 35 en 36 zijn gewone damesmaten (in de catalogus staan
 * Acne Studios-ballerina's en A. Bocca-pumps in maat 35).
 *
 * Ondergrens 16 is het belangrijkste getal hier, en het ontbrak. Een groot
 * deel van de schoenenfeed (Italist: TOD'S, Church's, Santoni, Nike, UGG,
 * Salomon) levert maten in UK/US-notatie: ["7","11","9½","10","6","12","5"].
 * Zonder ondergrens vielen die allemaal onder 34 en werden ze als
 * peuterschoen geweigerd. Gemeten op de live catalogus kostte dat ongeveer
 * 16% van de herenschoenenpool, en het gedrag was bovendien willekeurig:
 * een model dat alleen halve maten voert ("9½") ontsnapte, want die matchen
 * /^\d{1,3}$/ niet.
 *
 * De reeks moet dus HELEMAAL binnen de EU-kinderband vallen. Valt er iets
 * buiten, dan is het ofwel een volwassen EU-maat ofwel een andere notatie,
 * en in beide gevallen laten we het door. Dat is de ontwerpregel bovenaan
 * dit bestand: een UK-kindermaat 10 glipt er zo doorheen, maar die wordt
 * door is_kids en de naamregels opgevangen, en een gemiste peuterschoen is
 * minder erg dan een halve catalogus die verdwijnt.
 */
const MIN_EU_KINDERSCHOENMAAT = 16;
const MAX_EU_KINDERSCHOENMAAT = 34;

export interface SafetyInput {
  name?: string | null;
  category?: string | null;
  sizes?: Array<string | number> | null;
}

export interface SafetyVerdict {
  ok: boolean;
  reden?: 'niet-kleding' | 'ondergoed' | 'doelgroep' | 'kleding-als-accessoire' | 'kind-in-naam' | 'kinderschoenmaat';
}

/** Alleen numerieke maten; letters (S/M/L) zeggen niets over kindermaat. */
function numeriekeMaten(sizes: SafetyInput['sizes']): number[] {
  if (!Array.isArray(sizes)) return [];
  return sizes
    .map((s) => String(s).trim())
    .filter((s) => /^\d{1,3}$/.test(s))
    .map(Number);
}

export function beoordeelProduct(p: SafetyInput): SafetyVerdict {
  const naam = String(p.name ?? '');
  if (!naam) return { ok: true };

  if (NIET_KLEDING.test(naam)) return { ok: false, reden: 'niet-kleding' };
  if (ONDERGOED.test(naam)) return { ok: false, reden: 'ondergoed' };
  if (DOELGROEP.test(naam)) return { ok: false, reden: 'doelgroep' };

  if (
    String(p.category ?? '').toLowerCase() === 'accessory' &&
    KLEDING_ALS_ACCESSOIRE.test(naam)
  ) {
    return { ok: false, reden: 'kleding-als-accessoire' };
  }
  if (KIND_IN_NAAM.test(naam)) return { ok: false, reden: 'kind-in-naam' };

  if (String(p.category ?? '').toLowerCase() === 'footwear') {
    const maten = numeriekeMaten(p.sizes);
    // Alleen weigeren als de HELE reeks binnen de EU-kinderband valt. Een
    // schoen die zowel 24 als 42 voert is een maatreeks, geen peuterschoen,
    // en een reeks die op 5 begint is UK/US en zegt niets over leeftijd.
    const heelDeReeksIsEuKind =
      maten.length > 0 &&
      maten.every(
        (m) => m >= MIN_EU_KINDERSCHOENMAAT && m <= MAX_EU_KINDERSCHOENMAAT
      );
    if (heelDeReeksIsEuKind) {
      return { ok: false, reden: 'kinderschoenmaat' };
    }
  }

  return { ok: true };
}

/** Filtert een productlijst en rapporteert wat er is weggehaald. */
export function filterVeiligeProducten<T extends SafetyInput>(
  producten: T[]
): { veilig: T[]; geweigerd: Array<{ product: T; reden: string }> } {
  const veilig: T[] = [];
  const geweigerd: Array<{ product: T; reden: string }> = [];
  for (const p of producten) {
    const v = beoordeelProduct(p);
    if (v.ok) veilig.push(p);
    else geweigerd.push({ product: p, reden: v.reden ?? 'onbekend' });
  }
  return { veilig, geweigerd };
}

/* ------------------------------------------------------------------ */
/* Seizoenssamenhang                                                    */
/* ------------------------------------------------------------------ */

/**
 * Seizoenslabel uit de productnaam. Bewust grof: alleen de uitgesproken
 * gevallen krijgen een label, de rest is 'allseason' en mag met alles.
 *
 * Reden: seizoen werd alleen als SCORE meegewogen (applySeasonalBoost verhoogt
 * de kleurscore met hooguit 10%) en sloot niets uit. Daardoor kon een gevoerde
 * winterlaars in dezelfde outfit belanden als een zomershort met bloemenprint.
 */
export type Seizoen = 'winter' | 'zomer' | 'allseason';

const WINTER = /gevoerd|teddy|sherpa|wollen|\bwol\b|thermo|fleece|donsjas|puffer|winterjas|snowboot|bontvoering|gewatteerd/i;
const ZOMER = /\bshorts?\b|\bkorte broek\b|zwem|bikini|badpak|linnen|hawaii|strand|sandaal|slipper|teenslipper|mouwloos|halterneck/i;

export function seizoenVan(naam?: string | null): Seizoen {
  const n = String(naam ?? '');
  const w = WINTER.test(n);
  const z = ZOMER.test(n);
  if (w && !z) return 'winter';
  if (z && !w) return 'zomer';
  return 'allseason';
}

/**
 * Mogen deze producten samen in één outfit? Alleen de harde botsing
 * winter tegen zomer wordt geweigerd; al het overige mag.
 */
export function seizoenenBotsen(namen: Array<string | null | undefined>): boolean {
  const labels = namen.map(seizoenVan);
  return labels.includes('winter') && labels.includes('zomer');
}
