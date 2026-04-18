import type { Product, ProductCategory } from './types';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ClassificationResult {
  category: ProductCategory | 'underwear' | 'other';
  subcategory?: string;
  confidence: ConfidenceLevel;
  signals: string[];
  rejected?: boolean;
  rejectReason?: string;
}

interface PatternEntry {
  regex: RegExp;
  subcategory: string;
  weight: 1 | 2 | 3; // 1=weak, 2=strong, 3=definitive
}

// ─── FOOTWEAR ─────────────────────────────────────────────────────────────
// "boot" is FOOTWEAR, not outerwear — checked first to avoid false positives
const FOOTWEAR_RULES: PatternEntry[] = [
  { regex: /\bsneaker(s)?\b/i, subcategory: 'sneakers', weight: 3 },
  { regex: /\btrainer(s)?\b/i, subcategory: 'trainers', weight: 3 },
  { regex: /\bschoen(en)?\b/i, subcategory: 'schoenen', weight: 3 },
  { regex: /\bschoeisel\b/i, subcategory: 'schoeisel', weight: 2 },
  { regex: /\bshoe(s)?\b/i, subcategory: 'shoes', weight: 3 },
  { regex: /\blaars\b|\blaarzen\b/i, subcategory: 'laarzen', weight: 3 },
  { regex: /\bboot(s)?\b/i, subcategory: 'boots', weight: 3 },
  { regex: /\bchelsea\b/i, subcategory: 'chelsea boots', weight: 3 },
  { regex: /\boxford[\s-]?(shoe|schoen|lace[-\s]?up|boot)?\b/i, subcategory: 'oxfords', weight: 1 },
  { regex: /\bderby\b/i, subcategory: 'derbys', weight: 2 },
  { regex: /\bbrogue(s)?\b/i, subcategory: 'brogues', weight: 3 },
  { regex: /\bloafer(s)?\b/i, subcategory: 'loafers', weight: 3 },
  { regex: /\bmocassin(s)?\b|\bmoccasin(s)?\b/i, subcategory: 'mocassins', weight: 3 },
  { regex: /\bpump(s)?\b/i, subcategory: 'pumps', weight: 2 },
  { regex: /\bsandaal\b|\bsandalen\b|\bsandal(s)?\b/i, subcategory: 'sandalen', weight: 3 },
  { regex: /\bespadrille(s)?\b/i, subcategory: 'espadrilles', weight: 3 },
  { regex: /\binstapper(s)?\b/i, subcategory: 'instappers', weight: 3 },
  { regex: /\bslip-on(s)?\b/i, subcategory: 'slip-ons', weight: 3 },
  { regex: /\bveterschoen(en)?\b/i, subcategory: 'veterschoenen', weight: 3 },
  { regex: /\benkellaars\b|\bankle[\s-]?boot(s)?\b/i, subcategory: 'enkellaarzen', weight: 3 },
  { regex: /\bkuitlaars\b|\bknee[\s-]?high[\s-]?boot(s)?\b/i, subcategory: 'kuitlaarzen', weight: 3 },
  { regex: /\bstiletto(s)?\b/i, subcategory: 'stilettos', weight: 3 },
  { regex: /\bwedge(s)?\b/i, subcategory: 'wedges', weight: 2 },
  { regex: /\bmuil(en)?\b|\bmule(s)?\b/i, subcategory: 'mules', weight: 3 },
  { regex: /\bballerina(s)?\b|\bballerina[\s-]?flat(s)?\b/i, subcategory: 'ballerinas', weight: 3 },
  { regex: /\bdesert[\s-]?boot(s)?\b/i, subcategory: 'desert boots', weight: 3 },
  { regex: /\bfootwear\b/i, subcategory: 'footwear', weight: 2 },
];

// ─── UNDERWEAR ────────────────────────────────────────────────────────────
const UNDERWEAR_RULES: PatternEntry[] = [
  { regex: /\bondergoed\b|\bunderwear\b/i, subcategory: 'ondergoed', weight: 3 },
  { regex: /\bonderbroek\b/i, subcategory: 'onderbroek', weight: 3 },
  { regex: /\bboxer(s)?\b(?!\s*short)/i, subcategory: 'boxer', weight: 2 },
  { regex: /\bbh\b|\bbra\b|\bbralette\b/i, subcategory: 'bh', weight: 3 },
  { regex: /\blingerie\b/i, subcategory: 'lingerie', weight: 3 },
  { regex: /\bsokken\b|\bsock(s)?\b/i, subcategory: 'sokken', weight: 3 },
  { regex: /\bkousen\b|\bpanty\b|\bstocking(s)?\b/i, subcategory: 'kousen', weight: 3 },
  { regex: /\bthong\b|\bstring\b(?!er)/i, subcategory: 'thong', weight: 3 },
];

// ─── ACCESSORY ────────────────────────────────────────────────────────────
const ACCESSORY_RULES: PatternEntry[] = [
  { regex: /\bhandtas\b|\bhandbag(s)?\b/i, subcategory: 'handtas', weight: 3 },
  { regex: /\btas\b|\btassen\b/i, subcategory: 'tas', weight: 3 },
  { regex: /\bbag(s)?\b/i, subcategory: 'bag', weight: 2 },
  { regex: /\brugzak\b|\bbackpack(s)?\b/i, subcategory: 'rugzak', weight: 3 },
  { regex: /\btote\b/i, subcategory: 'tote', weight: 3 },
  { regex: /\bschoudertas\b/i, subcategory: 'schoudertas', weight: 3 },
  { regex: /\bcross[\s-]?body\b/i, subcategory: 'crossbody', weight: 3 },
  { regex: /\bclutch\b/i, subcategory: 'clutch', weight: 3 },
  { regex: /\briem\b|\bbelt(s)?\b/i, subcategory: 'riem', weight: 3 },
  { regex: /\bsjaal\b|\bscarf\b|\bscarves\b/i, subcategory: 'sjaal', weight: 3 },
  { regex: /\bzonnebril(len)?\b|\bsunglasses\b/i, subcategory: 'zonnebril', weight: 3 },
  { regex: /\bhorloge(s)?\b|\bwatch(es)?\b/i, subcategory: 'horloge', weight: 3 },
  { regex: /\bketting(en)?\b|\bnecklace(s)?\b/i, subcategory: 'ketting', weight: 3 },
  { regex: /\barmband(en)?\b|\bbracelet(s)?\b/i, subcategory: 'armband', weight: 3 },
  { regex: /\boorbel(len)?\b|\bearring(s)?\b/i, subcategory: 'oorbellen', weight: 3 },
  { regex: /\bdas\b|\bstropdas\b|\bvlinderdas\b/i, subcategory: 'stropdas', weight: 3 },
  { regex: /\bmuts\b|\bbeanie\b/i, subcategory: 'muts', weight: 3 },
  { regex: /\bbucket[\s-]?hat\b/i, subcategory: 'bucket hat', weight: 3 },
  { regex: /\bhoed\b|\bhat\b/i, subcategory: 'hoed', weight: 2 },
  { regex: /\bportemonnee\b|\bwallet\b/i, subcategory: 'portemonnee', weight: 3 },
  { regex: /\bmanchetknoop\b|\bcufflink(s)?\b/i, subcategory: 'manchetknopen', weight: 3 },
  { regex: /\bbroche\b|\bbrooch(es)?\b/i, subcategory: 'broche', weight: 3 },
  { regex: /\bhaarband\b|\bheadband\b/i, subcategory: 'haarband', weight: 3 },
  { regex: /\bparaplu\b|\bumbrella\b/i, subcategory: 'paraplu', weight: 3 },
  { regex: /\bsieraden\b|\bjewelry\b|\bjewellery\b/i, subcategory: 'sieraden', weight: 2 },
  { regex: /\baccessoire(s)?\b|\baccessory\b|\baccessories\b/i, subcategory: 'accessoire', weight: 2 },
];

// ─── DRESS ────────────────────────────────────────────────────────────────
const DRESS_RULES: PatternEntry[] = [
  { regex: /\bjurk\b/i, subcategory: 'jurk', weight: 3 },
  { regex: /\bdress\b/i, subcategory: 'dress', weight: 3 },
  { regex: /\bmaxijurk\b|\bmaxi[\s-]?jurk\b|\bmaxi[\s-]?dress\b/i, subcategory: 'maxijurk', weight: 3 },
  { regex: /\bminijurk\b|\bmini[\s-]?jurk\b|\bmini[\s-]?dress\b/i, subcategory: 'minijurk', weight: 3 },
  { regex: /\bmidijurk\b|\bmidi[\s-]?jurk\b|\bmidi[\s-]?dress\b/i, subcategory: 'midijurk', weight: 3 },
  { regex: /\bavondjurk\b|\bevening[\s-]?dress\b/i, subcategory: 'avondjurk', weight: 3 },
  { regex: /\bcocktailjurk\b|\bcocktail[\s-]?dress\b/i, subcategory: 'cocktailjurk', weight: 3 },
  { regex: /\bzomerjurk\b|\bsummer[\s-]?dress\b/i, subcategory: 'zomerjurk', weight: 3 },
  { regex: /\bshirt[\s-]?dress\b|\bshirtjurk\b|\bhemdjurk\b/i, subcategory: 'shirtjurk', weight: 3 },
  { regex: /\bwrap[\s-]?dress\b|\bwikkeljurk\b/i, subcategory: 'wikkeljurk', weight: 3 },
];

// ─── JUMPSUIT ─────────────────────────────────────────────────────────────
const JUMPSUIT_RULES: PatternEntry[] = [
  { regex: /\bjumpsuit\b/i, subcategory: 'jumpsuit', weight: 3 },
  { regex: /\boverall\b/i, subcategory: 'overall', weight: 3 },
  { regex: /\bplaysuit\b/i, subcategory: 'playsuit', weight: 3 },
  { regex: /\bdungaree(s)?\b/i, subcategory: 'dungarees', weight: 3 },
];

// ─── OUTERWEAR ────────────────────────────────────────────────────────────
const OUTERWEAR_RULES: PatternEntry[] = [
  { regex: /\bjacket\b/i, subcategory: 'jacket', weight: 3 },
  { regex: /\bwinterjas\b|\bdonsjas\b|\bpufferjas\b/i, subcategory: 'winterjas', weight: 3 },
  { regex: /\bregenjas\b|\bregenjack\b/i, subcategory: 'regenjas', weight: 3 },
  { regex: /\bsoftshell\b|\bhardshell\b/i, subcategory: 'shell jacket', weight: 3 },
  { regex: /\bparka\b/i, subcategory: 'parka', weight: 3 },
  { regex: /\banorak\b/i, subcategory: 'anorak', weight: 3 },
  { regex: /\bbomber\b/i, subcategory: 'bomber jacket', weight: 3 },
  { regex: /\bwindbreaker\b|\bwindjas\b/i, subcategory: 'windbreaker', weight: 3 },
  { regex: /\bpuffer\b/i, subcategory: 'puffer jacket', weight: 3 },
  { regex: /\btrenchcoat\b|\btrench[\s-]?coat\b/i, subcategory: 'trenchcoat', weight: 3 },
  { regex: /\bovercoat\b/i, subcategory: 'overcoat', weight: 3 },
  { regex: /\bmantel\b/i, subcategory: 'mantel', weight: 3 },
  { regex: /\bgilet\b/i, subcategory: 'gilet', weight: 3 },
  { regex: /\bbodywarmer\b/i, subcategory: 'bodywarmer', weight: 3 },
  { regex: /\bfleece[\s-]?jack(et)?\b/i, subcategory: 'fleecejacket', weight: 3 },
  { regex: /\bspijkerjack\b|\bdenim[\s-]?jacket\b/i, subcategory: 'spijkerjacket', weight: 3 },
  { regex: /\bpilotenjack\b|\bflight[\s-]?jacket\b|\bma[\s-]?1\b/i, subcategory: 'pilotenjacket', weight: 3 },
  { regex: /\bdufflecoat\b|\bduffle[\s-]?coat\b/i, subcategory: 'dufflecoat', weight: 3 },
  { regex: /\bpeacoat\b|\bpea[\s-]?coat\b/i, subcategory: 'peacoat', weight: 3 },
  { regex: /\bboucl[eé]?[\s-]?jas\b|\bboucle[\s-]?coat\b/i, subcategory: 'boucle jas', weight: 3 },
  { regex: /\bovershirt\b/i, subcategory: 'overshirt', weight: 3 },
  { regex: /\bkostuum\b/i, subcategory: 'kostuum', weight: 3 },
  { regex: /\bblazer\b/i, subcategory: 'blazer', weight: 2 },
  { regex: /\bcolbert\b/i, subcategory: 'colbert', weight: 2 },
  { regex: /\bponcho\b|\bcape\b/i, subcategory: 'cape', weight: 2 },
  { regex: /\bjas\b/i, subcategory: 'jas', weight: 2 },
  { regex: /\bjack\b/i, subcategory: 'jack', weight: 2 },
  { regex: /\bcoat\b/i, subcategory: 'coat', weight: 2 },
  { regex: /\btrench\b/i, subcategory: 'trench', weight: 2 },
];

// ─── BOTTOM ───────────────────────────────────────────────────────────────
// CRITICAL: \bshorts\b only — \bshort\b would incorrectly match "short sleeve"
const BOTTOM_RULES: PatternEntry[] = [
  { regex: /\bbroek\b/i, subcategory: 'broek', weight: 3 },
  { regex: /\btrousers?\b/i, subcategory: 'broek', weight: 3 },
  { regex: /\bpantalon\b/i, subcategory: 'pantalon', weight: 3 },
  { regex: /\bjeans?\b/i, subcategory: 'jeans', weight: 3 },
  { regex: /\bchinos?\b/i, subcategory: 'chino', weight: 3 },
  { regex: /\bcargo[\s-]?(pant|broek|trouser|short)?\b/i, subcategory: 'cargo', weight: 2 },
  { regex: /\bshorts\b|\bkorte[\s-]?broek\b/i, subcategory: 'shorts', weight: 3 },
  { regex: /\bbermuda\b/i, subcategory: 'bermuda', weight: 3 },
  { regex: /\bleggings?\b/i, subcategory: 'legging', weight: 3 },
  { regex: /\btreggings?\b/i, subcategory: 'tregging', weight: 3 },
  { regex: /\bjoggers?\b/i, subcategory: 'joggers', weight: 3 },
  { regex: /\bjoggingbroek\b/i, subcategory: 'joggingbroek', weight: 3 },
  { regex: /\bsweatpants?\b/i, subcategory: 'sweatpants', weight: 3 },
  { regex: /\btrainingsbroek\b|\btraining[\s-]?pants?\b/i, subcategory: 'trainingsbroek', weight: 3 },
  { regex: /\bpalazzo\b/i, subcategory: 'palazzo', weight: 3 },
  { regex: /\bculottes?\b/i, subcategory: 'culottes', weight: 3 },
  { regex: /\brok\b/i, subcategory: 'rok', weight: 3 },
  { regex: /\bskirt\b/i, subcategory: 'skirt', weight: 3 },
  { regex: /\bminirok\b|\bmini[\s-]?rok\b/i, subcategory: 'minirok', weight: 3 },
  { regex: /\bmidirok\b|\bmidi[\s-]?rok\b/i, subcategory: 'midirok', weight: 3 },
  { regex: /\bmaxirok\b|\bmaxi[\s-]?rok\b/i, subcategory: 'maxirok', weight: 3 },
  { regex: /\bkokerrok\b|\bpencil[\s-]?skirt\b/i, subcategory: 'kokerrok', weight: 3 },
  { regex: /\bplooirok\b|\bpleated[\s-]?skirt\b/i, subcategory: 'plooirok', weight: 3 },
  { regex: /\bpants?\b/i, subcategory: 'broek', weight: 2 },
];

// ─── TOP ──────────────────────────────────────────────────────────────────
// jersey, prematch, short sleeve → always TOP, never bottom
// "oxford" in a shirt-context (cotton/shirt/button/overhemd/blouse) is an
// oxford shirt, not an oxford shoe — matched in either word order.
const TOP_RULES: PatternEntry[] = [
  {
    regex:
      /\b(?:shirt|cotton|button|overhemd|blouse)\b[\s\S]*\boxford\b|\boxford\b[\s\S]*\b(?:shirt|cotton|button|overhemd|blouse)\b/i,
    subcategory: 'oxford shirt',
    weight: 3,
  },
  { regex: /\bt-shirt\b|\btshirt\b/i, subcategory: 't-shirt', weight: 3 },
  { regex: /\boverhemd\b/i, subcategory: 'overhemd', weight: 3 },
  { regex: /\bblouse\b/i, subcategory: 'blouse', weight: 3 },
  { regex: /\bpoloshirt\b|\bpolo[\s-]?shirt\b/i, subcategory: 'polo', weight: 3 },
  { regex: /\bpolo\b/i, subcategory: 'polo', weight: 2 },
  { regex: /\bhoodie\b|\bhooded\b/i, subcategory: 'hoodie', weight: 3 },
  { regex: /\bsweatshirt\b/i, subcategory: 'sweatshirt', weight: 3 },
  { regex: /\bcrewneck\b|\bcrew[\s-]?neck\b/i, subcategory: 'crewneck', weight: 3 },
  { regex: /\bsweater\b/i, subcategory: 'sweater', weight: 3 },
  { regex: /\bpullover\b/i, subcategory: 'pullover', weight: 3 },
  { regex: /\bcardigan\b/i, subcategory: 'cardigan', weight: 3 },
  { regex: /\bcoltrui\b|\bturtleneck\b|\bmock[\s-]?neck\b/i, subcategory: 'coltrui', weight: 3 },
  { regex: /\blongsleeve\b|\blong[\s-]?sleeve\b|\blange[\s-]?mouw\b/i, subcategory: 'longsleeve', weight: 3 },
  { regex: /\btanktop\b|\btank[\s-]?top\b/i, subcategory: 'tanktop', weight: 3 },
  { regex: /\bknit\b|\bgebreid\b/i, subcategory: 'gebreid', weight: 2 },
  { regex: /\btrui\b/i, subcategory: 'trui', weight: 3 },
  { regex: /\bbodysuit\b/i, subcategory: 'bodysuit', weight: 3 },
  { regex: /\bcrop[\s-]?top\b/i, subcategory: 'crop top', weight: 3 },
  { regex: /\btopje\b/i, subcategory: 'topje', weight: 3 },
  { regex: /\bjersey\b/i, subcategory: 'jersey', weight: 3 },
  { regex: /\bprematch\b|\bpre[\s-]?match\b/i, subcategory: 'prematch shirt', weight: 3 },
  { regex: /\btraining[\s-]?(top|shirt|jersey)\b/i, subcategory: 'training shirt', weight: 3 },
  { regex: /\bgame[\s-]?shirt\b|\bmatch[\s-]?shirt\b/i, subcategory: 'match shirt', weight: 3 },
  // "short sleeve" = sleeve length, not shorts
  { regex: /\bshort[\s-]?sleeve\b|\bkorte[\s-]?mouw\b/i, subcategory: 'short sleeve top', weight: 2 },
  { regex: /\bshirt\b/i, subcategory: 'shirt', weight: 2 },
  { regex: /\bvest\b/i, subcategory: 'vest', weight: 1 },
  { regex: /\btee\b/i, subcategory: 't-shirt', weight: 2 },
];

// ─── REJECT PATTERNS ──────────────────────────────────────────────────────
const REJECT_REGEX = /\b(pyjama|nachthem|slaappak|ochtendjas|badjas|nightwear|bikini|badpak|zwembroek|zwemshort|zwemtop|boardshort|zwemset|pantoffel|sloffen|slippers?|flip[\s-]?flop|badslip|teenslipper|romper|kruippak|slab|boxpak|babypak|kaars|candle|lamp|vaas|decor|kussen|plaid|handdoek|baddoek|gordijn|laken|dekbed|overtrek|matras|deken|vloerkleed|tapijt|mok|bord|spiegel|knuffeldier|knuffel|speelgoed|puzzel|telefoonhoesje|sleutelhanger|poster|parfum|make-up|mascara|lipstick|foundation|concealer|serum|shampoo|douchegel|bodylotion|aftershave|deodorant|luier|fopspeen|aankleedkussen|multipack|hemd|tafelkleed|tafelloper|bedsprei|meegroeipakje|wanten|kunstnagel|press-on|kwast|bronzer|voetbalshirt|voetbaltenue|voetbalbroek|voetbalsok|thuisshirt|uitshirt|thuistenue|uittenue|thuisbroek|uitbroek|prematch|pre[\s-]?match|(?:football|soccer|voetbal|rugby|hockey|match|game)[\s-]?(?:jersey|shirt|kit|tenue|jacket|pant|broek))\b/i;

const SPORT_FOOTWEAR_REGEX = /\b(fg|ag|sg|mg|tf|ic|in)\s*[/\\]\s*(fg|ag|sg|mg|tf|ic|in)\b/i;

const KIDS_REGEX = /\b(baby|babies|peuter|kleuter|newborn|infant|kinder|kinderen|junior|kids?|dreumes|toddler|jongens|meisjes|boys|girls|child|children)\b/i;

const MULTIPACK_REGEX = /\b(\d+)[- ]?(pack|stuks)\b/i;
const SET_REGEX = /\bset\s+van\s+\d/i;

// ─── CATEGORY RULES (ordered by priority) ─────────────────────────────────
type ExtendedCategory = ProductCategory | 'underwear' | 'other';

const ORDERED_RULES: Array<[string, PatternEntry[]]> = [
  ['footwear', FOOTWEAR_RULES],
  ['underwear', UNDERWEAR_RULES],
  ['accessory', ACCESSORY_RULES],
  ['dress', DRESS_RULES],
  ['jumpsuit', JUMPSUIT_RULES],
  ['outerwear', OUTERWEAR_RULES],
  ['bottom', BOTTOM_RULES],
  ['top', TOP_RULES],
];

interface MatchResult {
  category: string;
  subcategory: string;
  totalWeight: number;
  matchCount: number;
  signals: string[];
}

function scoreText(text: string, rules: PatternEntry[]): { subcategory: string; totalWeight: number; matchCount: number; signals: string[] } | null {
  let totalWeight = 0;
  let matchCount = 0;
  let topSubcategory = '';
  let topWeight = 0;
  const signals: string[] = [];

  for (const rule of rules) {
    if (rule.regex.test(text)) {
      totalWeight += rule.weight;
      matchCount++;
      signals.push(rule.subcategory);
      if (rule.weight > topWeight) {
        topWeight = rule.weight;
        topSubcategory = rule.subcategory;
      }
    }
  }

  if (matchCount === 0) return null;
  return { subcategory: topSubcategory, totalWeight, matchCount, signals };
}

function determineConfidence(totalWeight: number, matchCount: number, fromName: boolean): ConfidenceLevel {
  if (fromName && (totalWeight >= 5 || matchCount >= 2)) return 'high';
  if (fromName && totalWeight >= 2) return 'medium';
  return 'low';
}

/**
 * Classify a product by raw text fields. Returns category, subcategory,
 * confidence level, and matched signals for debugging.
 */
export function classifyProductDetailed(
  name: string,
  description: string = '',
  categoryPath: string = '',
  _brand: string = '',
): ClassificationResult {
  const nameText = (name || '').toLowerCase();
  const descText = (description || '').toLowerCase();
  const catText = (categoryPath || '').toLowerCase();
  const fullText = [nameText, descText, catText].filter(Boolean).join(' ');

  // Reject checks
  if (REJECT_REGEX.test(nameText)) {
    return { category: 'other', confidence: 'high', signals: [], rejected: true, rejectReason: 'non-clothing keyword' };
  }
  if (KIDS_REGEX.test(nameText)) {
    return { category: 'other', confidence: 'high', signals: [], rejected: true, rejectReason: 'kids product' };
  }
  if (SPORT_FOOTWEAR_REGEX.test(nameText)) {
    return { category: 'other', confidence: 'high', signals: [], rejected: true, rejectReason: 'sport footwear studs pattern' };
  }
  if (MULTIPACK_REGEX.test(nameText)) {
    return { category: 'other', confidence: 'high', signals: [], rejected: true, rejectReason: 'multipack' };
  }
  if (SET_REGEX.test(nameText)) {
    return { category: 'other', confidence: 'high', signals: [], rejected: true, rejectReason: 'set product' };
  }

  const nameMatches: MatchResult[] = [];
  const fullMatches: MatchResult[] = [];

  const hasShirtContext = /\b(?:shirt|cotton|button|overhemd|blouse)\b/i.test(
    fullText
  );
  const activeRules: Array<[string, PatternEntry[]]> = ORDERED_RULES.map(
    ([cat, rules]) =>
      cat === 'footwear' && hasShirtContext
        ? [cat, rules.filter((r) => r.subcategory !== 'oxfords')]
        : [cat, rules]
  );

  for (const [category, rules] of activeRules) {
    const nameScore = scoreText(nameText, rules);
    if (nameScore) nameMatches.push({ category, ...nameScore });

    const fullScore = scoreText(fullText, rules);
    if (fullScore) fullMatches.push({ category, ...fullScore });
  }

  if (nameMatches.length > 0) {
    const best = nameMatches.reduce((a, b) => (b.totalWeight > a.totalWeight ? b : a));
    const confidence = determineConfidence(best.totalWeight, best.matchCount, true);
    if (confidence === 'low') {
      console.warn(`[classifier:low-confidence] "${name}" → ${best.category} (signals: ${best.signals.join(', ')})`);
    }
    return {
      category: best.category as ExtendedCategory,
      subcategory: best.subcategory,
      confidence,
      signals: best.signals,
    };
  }

  if (fullMatches.length > 0) {
    const best = fullMatches.reduce((a, b) => (b.totalWeight > a.totalWeight ? b : a));
    console.warn(`[classifier:low-confidence] "${name}" → ${best.category} (from description/category only)`);
    return {
      category: best.category as ExtendedCategory,
      subcategory: best.subcategory,
      confidence: 'low',
      signals: best.signals,
    };
  }

  return { category: 'other', confidence: 'low', signals: [], rejected: true, rejectReason: 'unclassifiable' };
}

/**
 * Classify a Product object. Maintains the existing API used by the engine.
 */
export function classifyProduct(product: Product): { category: ProductCategory; rejected: boolean; reason?: string } {
  const name = product.name || '';
  const desc = product.description || '';
  const dbCategory = (product.category || '').toLowerCase();
  const type = (product.type || '').toLowerCase();

  const result = classifyProductDetailed(name, desc, type || dbCategory);

  if (result.rejected) {
    return { category: 'other' as ProductCategory, rejected: true, reason: result.rejectReason };
  }

  const cat = result.category;
  // "underwear" is not a ProductCategory enum value — treat as rejected
  if (cat === 'underwear' || cat === 'other') {
    return { category: 'other' as ProductCategory, rejected: true, reason: `non-outfit category: ${cat}` };
  }

  return { category: cat as ProductCategory, rejected: false };
}

/**
 * Batch re-classify products. Used for backfill operations.
 */
export function reclassifyProducts(products: Product[]): {
  classified: Product[];
  rejected: Product[];
  stats: Record<string, number>;
} {
  const classified: Product[] = [];
  const rejected: Product[] = [];
  const stats: Record<string, number> = {
    reclassified: 0, rejected: 0, kept: 0,
    footwear_found: 0, bottom_found: 0, outerwear_found: 0,
    top_found: 0, accessory_found: 0, dress_found: 0,
    jumpsuit_found: 0, other_found: 0,
    confidence_high: 0, confidence_medium: 0, confidence_low: 0,
  };

  for (const product of products) {
    const result = classifyProduct(product);

    if (result.rejected) {
      rejected.push(product);
      stats.rejected++;
      stats.other_found++;
      continue;
    }

    const originalCategory = (product.category || '').toLowerCase();
    if (originalCategory !== result.category) stats.reclassified++;
    else stats.kept++;

    const key = `${result.category}_found`;
    if (key in stats) stats[key]++;

    classified.push({ ...product, category: result.category });
  }

  const detailed = products.map(p => classifyProductDetailed(p.name || '', p.description || ''));
  for (const r of detailed) {
    if (r.confidence === 'high') stats.confidence_high++;
    else if (r.confidence === 'medium') stats.confidence_medium++;
    else stats.confidence_low++;
  }

  console.log(`[ProductClassifier] ${products.length} products: ${classified.length} classified, ${rejected.length} rejected, ${stats.reclassified} reclassified`);
  console.log(`[ProductClassifier] Confidence: high=${stats.confidence_high} medium=${stats.confidence_medium} low=${stats.confidence_low}`);

  return { classified, rejected, stats };
}
