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
 *
 * Sinds 21 oktober 2026 ook luiertassen en luieretuis: ze stonden als
 * accessoire in de kandidatenpool voor dames ("Luiertas van bouclé"). In 3.520
 * productnamen (pool van 21 oktober plus de catalogussnapshot van juni) raakt
 * \bluier alleen die drie.
 */
const DOELGROEP = new RegExp(
  [
    '\\bmama\\b', 'zwangerschap', 'voedings', '\\bmaternity\\b',
    '\\bnursing\\b', 'positiekleding', '\\bluier',
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
 * \w*broek\b raakt "broekriem" niet, want daar ontbreekt de woordgrens na
 * broek. Dat is precies de bedoeling: een broekriem is wel een accessoire.
 *
 * Sinds 21 oktober 2026 ook kleding met een sjaal: de classificatie zag de
 * sjaal en maakte er een accessoire van ("Capribroek met sjaal", "Caprilegging
 * met sjaaldetail", "Overhemdblouse met sjaal", "Jasje van twill met
 * driehoekige sjaal", "Satijnen top met sjaal"). Gemeten op alle 6.585
 * accessoirenamen in de kandidaatkopie: 13 treffers, alle 13 kleding.
 * "Schoudertas met sjaal-look" blijft staan. Geen jeans en geen shirt: die
 * staan in merknamen (TOMMY JEANS, COMME DES GARÇONS SHIRT).
 *
 * Weigeren en niet herstellen: als de categorie accessory is, kan het item ook
 * niet als bottom dienen. Er gaat dus niets bruikbaars verloren.
 */
const KLEDING_ALS_ACCESSOIRE = /\bpantalon\b|\w*broek\b|\w*legging\b|\w*blouse\b|\bjasje\b|\btop met (?:\w+ )?sjaal/i;

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

/**
 * Kindermaten in de maatlijst, los van de naam.
 *
 * Gemeten op 13 oktober 2026: 2.011 producten in de pool van de site hadden
 * een kindermaat, gender male of female en is_kids false. De naam zegt niets
 * ("H & M - Katoenen T-shirt met print - Beige"); alleen de maat verraadt het
 * kind: "122/128 (6-8Y)", "50 (0-1M)", "92 (1½-2Y)", "170 (14Y+)", "5-6Y" of
 * een lengtepaar als "122/140" bij petten en mutsen. De import van maart
 * herkende alleen kale lengtes als "110"; de herkenning in daisyconRows.ts is
 * later beter geworden, maar nooit op bestaande producten toegepast.
 *
 * Een lengtepaar telt alleen als de twee lengtes minstens 6 uit elkaar liggen:
 * kinderreeksen doen dat altijd (92/116, 122/128), een dubbele volwassen maat
 * als 52/54 nooit.
 */
const LEEFTIJD_TUSSEN_HAAKJES = /\(\s*[\d½]+(\s*[-–]\s*[\d½]+)?\s*[YM]\+?\s*\)/i;
const KALE_LEEFTIJD = /^[\d½]{1,3}(\s*[-–]\s*[\d½]{1,3})?\s*[YM]\+?$/i;
const LENGTEPAAR = /^(\d{2,3})\/(\d{2,3})$/;
const MIN_KINDERLENGTE = 50;
const MAX_KINDERLENGTE = 176;
const MIN_LENGTEVERSCHIL = 6;

function isKindermaat(maat: string): boolean {
  if (LEEFTIJD_TUSSEN_HAAKJES.test(maat) || KALE_LEEFTIJD.test(maat)) return true;
  const paar = LENGTEPAAR.exec(maat);
  if (!paar) return false;
  const laag = Number(paar[1]);
  const hoog = Number(paar[2]);
  return (
    laag >= MIN_KINDERLENGTE &&
    hoog <= MAX_KINDERLENGTE &&
    hoog - laag >= MIN_LENGTEVERSCHIL
  );
}

export interface SafetyInput {
  name?: string | null;
  category?: string | null;
  sizes?: Array<string | number> | null;
}

export interface SafetyVerdict {
  ok: boolean;
  reden?: 'niet-kleding' | 'ondergoed' | 'doelgroep' | 'kleding-als-accessoire' | 'kind-in-naam' | 'kindermaat' | 'kinderschoenmaat';
}

/**
 * Alleen numerieke maten; letters (S/M/L) zeggen niets over kindermaat.
 * Een dubbele maat als "20/21" levert beide getallen, "30.5" een halve maat.
 * UK/US-notatie met ½ ("9½") blijft er bewust buiten.
 */
function numeriekeMaten(sizes: SafetyInput['sizes']): number[] {
  if (!Array.isArray(sizes)) return [];
  const uit: number[] = [];
  for (const ruw of sizes) {
    const s = String(ruw).trim();
    if (/^\d{1,3}$/.test(s)) uit.push(Number(s));
    else if (/^\d{1,2}[.,]5$/.test(s)) uit.push(Number(s.replace(',', '.')));
    else {
      const dubbel = /^(\d{1,2})\/(\d{1,2})$/.exec(s);
      if (dubbel) uit.push(Number(dubbel[1]), Number(dubbel[2]));
    }
  }
  return uit;
}

function heeftAlleenKindermaten(sizes: SafetyInput['sizes']): boolean {
  if (!Array.isArray(sizes) || sizes.length === 0) return false;
  return sizes.every((s) => isKindermaat(String(s).trim()));
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
  if (heeftAlleenKindermaten(p.sizes)) return { ok: false, reden: 'kindermaat' };

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
// "sandaal" alleen ving "sandalen", "sandaletten" en het Engelse "Sandal" niet
// (13 okt 2026: leren sandalen en Birkenstocks in oktoberoutfits), en "short"
// alleen ving samenstellingen als "chinoshort" en "sweatshorts" niet (15 okt).
// Bandeau, broderie anglaise en rotan sinds 21 oktober 2026: de stijl-agent
// keurde herfstoutfits af met een bandeaujurk, broderie en een rotan clutch.
const ZOMER = /\b[a-z]*shorts?\b|\bkorte broek\b|bermuda|zwem|bikini|badpak|linnen|\blinen\b|hawaii|strand|sandaal|sandal|espadrille|slipper|teenslipper|flip-?flop|mouwloos|sleeveless|halterneck|\bzomer|strooien|\bstraw\b|raffia|bandeau|broderie|rotan|rattan/i;

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

/**
 * Past dit stuk bij het seizoen van nu? In herfst en winter valt elk
 * uitgesproken zomerstuk af (sandalen, linnen, shorts, mouwloos). In lente en
 * zomer alleen wat echt warm is: gevoerd, gewatteerd, dons, teddy. Wol mag
 * dan wel, een wollen pantalon of colbert draag je het hele jaar.
 *
 * Tot 13 oktober 2026 woog het seizoen 3 procent in de score en sloot het
 * niets uit; in oktober kwamen er sandalen bij een kasjmier coltrui uit.
 */
export type JaarSeizoen = 'spring' | 'summer' | 'autumn' | 'winter';

const ZWAAR_WINTER = /gevoerd|teddy|sherpa|donsjas|\bdons\b|puffer|winterjas|snowboot|bontvoering|gewatteerd|thermo|shearling|lammy|\bparka\b/i;

export function pastInSeizoen(naam: string | null | undefined, seizoen: JaarSeizoen): boolean {
  const n = String(naam ?? '');
  if (seizoen === 'autumn' || seizoen === 'winter') return seizoenVan(n) !== 'zomer';
  return !ZWAAR_WINTER.test(n);
}

/* ------------------------------------------------------------------ */
/* Accessoires die je op een outfitfoto niet ziet                       */
/* ------------------------------------------------------------------ */

/**
 * Een portemonnee, manchetknopen of een brilmontuur maakt een outfit niet af:
 * je ziet ze niet. Op 13 oktober 2026 vulden ze het accessoireslot ("Wallet
 * BOSS", "Cufflinks PAUL SMITH", "Optical Frames RAY-BAN"). Een zonnebril,
 * tas, riem, sjaal of hoed zie je wel. Een make-uptas of toilettas gaat in een
 * tas, niet aan een outfit (21 oktober 2026: "Ovale make-uptas" in de pool).
 */
const ONZICHTBAAR_ACCESSOIRE = /\b(wallets?|portemonnee|pasjeshouder|card[\s-]?holders?|cardholders?|kaarthouder|cufflinks?|manchetknop\w*|optical[\s-]?frames?|eyeglasses|brilmontuur|key[\s-]?rings?|keychains?|sleutelhanger|paraplu|umbrella|sokken|socks|tie[\s-]?clip|dasspeld|money[\s-]?clip|geldclip|make-?up[\s-]?tas(?:je)?|toilettas(?:je)?|cosmetic[\s-]?bags?|beauty[\s-]?case)\b/i;

export function isZichtbaarAccessoire(naam: string | null | undefined): boolean {
  return !ONZICHTBAAR_ACCESSOIRE.test(String(naam ?? ''));
}
