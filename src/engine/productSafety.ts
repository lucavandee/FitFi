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
    'lingerie', 'ondergoed', 'onderbroek', 'boxershort', '\\bslip\\b',
    '\\bstring\\b(?!er)', '\\bthong\\b',
  ].join('|'),
  'i'
);

/** Expliciete kindmarkeringen in de productnaam. */
const KIND_IN_NAAM = new RegExp(
  [
    'hello kitty', 'minicats', '\\bpeuter', '\\bbaby\\b', '\\bbabies\\b',
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
 * Kinderschoenen op maat. Bewust tot en met 34: EU 35 en 36 zijn gewone
 * damesmaten (in de catalogus staan Acne Studios-ballerina's en A. Bocca-
 * pumps in maat 35). Een filter tot 35 zou die onterecht weggooien.
 */
const MAX_KINDERSCHOENMAAT = 34;

export interface SafetyInput {
  name?: string | null;
  category?: string | null;
  sizes?: Array<string | number> | null;
}

export interface SafetyVerdict {
  ok: boolean;
  reden?: 'niet-kleding' | 'ondergoed' | 'kind-in-naam' | 'kinderschoenmaat';
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
  if (KIND_IN_NAAM.test(naam)) return { ok: false, reden: 'kind-in-naam' };

  if (String(p.category ?? '').toLowerCase() === 'footwear') {
    const maten = numeriekeMaten(p.sizes);
    // Alleen weigeren als ALLE numerieke maten kindermaten zijn; een schoen
    // die zowel 24 als 42 voert is een maatreeks, geen peuterschoen.
    if (maten.length > 0 && maten.every((m) => m <= MAX_KINDERSCHOENMAAT)) {
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
