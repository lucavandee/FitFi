// Shared product classification module — works in Deno (Supabase functions)
// and is mirrored by src/engine/productClassifier.ts for client-side use.

export type RawCategory =
  | 'top'
  | 'bottom'
  | 'footwear'
  | 'outerwear'
  | 'dress'
  | 'jumpsuit'
  | 'accessory'
  | 'underwear'
  | 'other';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface RawClassificationResult {
  category: RawCategory;
  subcategory: string | undefined;
  confidence: ConfidenceLevel;
  signals: string[];
}

interface PatternEntry {
  regex: RegExp;
  subcategory: string;
  weight: 1 | 2 | 3; // 1=weak, 2=strong, 3=definitive
}

function buildText(...parts: string[]): string {
  return parts.filter(Boolean).join(' ').toLowerCase();
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
// Usually filtered upstream, but tracked for logging
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
  { regex: /\bblazer\b/i, subcategory: 'blazer', weight: 2 },
  { regex: /\bcolbert\b/i, subcategory: 'colbert', weight: 2 },
  { regex: /\bponcho\b|\bcape\b/i, subcategory: 'cape', weight: 2 },
  { regex: /\bjas\b/i, subcategory: 'jas', weight: 2 },
  { regex: /\bjack\b/i, subcategory: 'jack', weight: 2 },
  { regex: /\bcoat\b/i, subcategory: 'coat', weight: 2 },
  { regex: /\btrench\b/i, subcategory: 'trench', weight: 2 },
];

// ─── BOTTOM ───────────────────────────────────────────────────────────────
// CRITICAL: \bshorts\b only — never \bshort\b which would match "short sleeve"
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
// jersey, prematch, training shirt, short sleeve → all TOP, not bottom
const TOP_RULES: PatternEntry[] = [
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
  // Sports tops — jersey and prematch are always shirts, not bottoms
  { regex: /\bjersey\b/i, subcategory: 'jersey', weight: 3 },
  { regex: /\bprematch\b|\bpre[\s-]?match\b/i, subcategory: 'prematch shirt', weight: 3 },
  { regex: /\btraining[\s-]?(top|shirt|jersey)\b/i, subcategory: 'training shirt', weight: 3 },
  { regex: /\bgame[\s-]?shirt\b|\bmatch[\s-]?shirt\b/i, subcategory: 'match shirt', weight: 3 },
  // "Short sleeve" signals a TOP — it's sleeve length, not shorts
  { regex: /\bshort[\s-]?sleeve\b|\bkorte[\s-]?mouw\b/i, subcategory: 'short sleeve top', weight: 2 },
  // Generic "shirt" comes after specific compound patterns
  { regex: /\bshirt\b/i, subcategory: 'shirt', weight: 2 },
  { regex: /\bvest\b/i, subcategory: 'vest', weight: 1 },
  { regex: /\btee\b/i, subcategory: 't-shirt', weight: 2 },
];

// ─── CATEGORY RULES MAP (ordered by priority) ─────────────────────────────
const ORDERED_RULES: Array<[RawCategory, PatternEntry[]]> = [
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
  category: RawCategory;
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
 * Classify a product using name, description, category path, and brand.
 * Returns category, subcategory, confidence level, and matched signals.
 */
export function classifyProductRaw(
  name: string,
  description: string,
  categoryPath: string,
  _brand: string = '',
): RawClassificationResult {
  const nameText = (name || '').toLowerCase();
  const descText = (description || '').toLowerCase();
  const catText = (categoryPath || '').toLowerCase();
  const fullText = buildText(nameText, descText, catText);

  const nameMatches: MatchResult[] = [];
  const fullMatches: MatchResult[] = [];

  for (const [category, rules] of ORDERED_RULES) {
    const nameScore = scoreText(nameText, rules);
    if (nameScore) {
      nameMatches.push({ category, ...nameScore });
    }
    const fullScore = scoreText(fullText, rules);
    if (fullScore) {
      fullMatches.push({ category, ...fullScore });
    }
  }

  // Prefer name matches (more reliable) over full-text matches
  if (nameMatches.length > 0) {
    // Pick the match with the highest total weight from the name
    const best = nameMatches.reduce((a, b) => (b.totalWeight > a.totalWeight ? b : a));
    return {
      category: best.category,
      subcategory: best.subcategory,
      confidence: determineConfidence(best.totalWeight, best.matchCount, true),
      signals: best.signals,
    };
  }

  if (fullMatches.length > 0) {
    const best = fullMatches.reduce((a, b) => (b.totalWeight > a.totalWeight ? b : a));
    return {
      category: best.category,
      subcategory: best.subcategory,
      confidence: 'low',
      signals: best.signals,
    };
  }

  return {
    category: 'other',
    subcategory: undefined,
    confidence: 'low',
    signals: [],
  };
}
