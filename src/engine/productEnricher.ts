import type { Product } from './types';

export interface EnrichedSignals {
  materialTags: string[];
  silhouetteTags: string[];
  colorTags: string[];
  formality: number;
  priceSegment: 'budget' | 'mid' | 'premium' | 'luxury';
}

const MATERIAL_PATTERNS: Record<string, string[]> = {
  katoen: ['katoen', 'cotton', 'katoenen', 'jersey', 'piqué', 'pique'],
  wol: ['wol', 'wool', 'woolen', 'wollen', 'merino'],
  merino: ['merino'],
  denim: ['denim', 'spijker', 'jeans'],
  leer: ['leer', 'leather', 'lederen', 'suède', 'suede', 'nubuck'],
  linnen: ['linnen', 'linen'],
  fleece: ['fleece', 'teddy', 'sherpa'],
  tech: ['tech', 'nylon', 'polyester', 'performance', 'gore-tex', 'softshell', 'hardshell', 'stormmove'],
  stretch: ['stretch', 'elastaan', 'elastisch', 'spandex', 'lycra'],
  mesh: ['mesh'],
  canvas: ['canvas'],
  coated: ['coated', 'gewaxed', 'waxed', 'gecoat'],
  zijde: ['zijde', 'silk', 'satijn', 'satin'],
  kasjmier: ['kasjmier', 'cashmere'],
  viscose: ['viscose', 'rayon', 'modal'],
  ribstof: ['rib', 'corduroy', 'ribfluweel', 'ribstof'],
};

const SILHOUETTE_PATTERNS: Record<string, string[]> = {
  slim: ['slim', 'skinny', 'fitted', 'nauwsluitend', 'aansluitend', 'slim fit', 'narrow'],
  straight: ['straight', 'regular', 'regular fit', 'recht', 'classic fit'],
  relaxed: ['relaxed', 'loose', 'comfortable', 'loose fit', 'relaxed fit', 'ruim', 'easy fit'],
  oversized: ['oversized', 'oversize', 'wide', 'boxy', 'wide leg', 'baggy', 'wide-leg'],
  tailored: ['tailored', 'blazer', 'suit', 'pak', 'colbert', 'double-breasted', 'single-breasted', 'pantalon'],
  clean: ['clean', 'minimal', 'effen', 'basic', 'monochroom', 'simpel', 'strak'],
  draped: ['asymm', 'drape', 'wrap', 'wikkel'],
  cropped: ['cropped', 'crop', 'kort model'],
  longline: ['longline', 'lang model', 'maxi', 'extra lang'],
};

const COLOR_MAP: Record<string, string[]> = {
  zwart: ['zwart', 'black'],
  wit: ['wit', 'white', 'cream', 'off-white', 'ecru', 'crème'],
  grijs: ['grijs', 'grey', 'gray', 'antraciet', 'charcoal'],
  navy: ['navy', 'donkerblauw', 'dark blue', 'marineblauw'],
  camel: ['camel', 'tan', 'sand', 'nude', 'beige', 'taupe', 'cognac'],
  denim: ['denim', 'jeans', 'indigo'],
  contrast: ['graphic', 'print', 'contrast', 'bold', 'multicolor', 'kleurrijk'],
  aardetinten: ['aardetint', 'earth', 'terracotta', 'rust', 'olive', 'khaki', 'mosgroen', 'roest'],
  charcoal: ['charcoal', 'antraciet', 'donkergrijs'],
  monochrome: ['monochroom', 'monochrome', 'tonal', 'ton-sur-ton'],
  blauw: ['blauw', 'blue', 'kobalt', 'cobalt', 'azuur'],
  rood: ['rood', 'red', 'burgundy', 'bordeaux', 'wijn'],
  groen: ['groen', 'green', 'forest', 'sage', 'moss', 'olijf'],
  bruin: ['bruin', 'brown', 'chocolade', 'chocolate'],
  roze: ['roze', 'pink', 'blush', 'rose', 'fuchsia'],
  geel: ['geel', 'yellow', 'mustard', 'mosterd'],
  oranje: ['oranje', 'orange', 'coral', 'koraal'],
};

const FORMALITY_SIGNALS: { pattern: string[]; value: number }[] = [
  { pattern: ['colbert', 'blazer', 'double-breasted', 'single-breasted'], value: 0.85 },
  { pattern: ['pak', 'suit', 'tuxedo', 'smoking', 'mantelpak', 'mantelpakje'], value: 0.95 },
  { pattern: ['overhemd', 'dress shirt', 'button-down'], value: 0.70 },
  { pattern: ['pantalon', 'trousers', 'nette broek'], value: 0.70 },
  { pattern: ['kokerrok', 'pencil skirt', 'pencil-skirt', 'nette rok', 'blazerjurk', 'shirtdress'], value: 0.70 },
  { pattern: ['pumps', 'naaldhak', 'stiletto'], value: 0.75 },
  { pattern: ['oxford', 'derby', 'brogue', 'loafer', 'nette schoen'], value: 0.75 },
  { pattern: ['chino', 'chinopant'], value: 0.55 },
  { pattern: ['polo', 'poloshirt'], value: 0.55 },
  { pattern: ['trui', 'sweater', 'pullover', 'knit', 'gebreid'], value: 0.45 },
  { pattern: ['vest', 'cardigan'], value: 0.50 },
  { pattern: ['blouse'], value: 0.65 },
  { pattern: ['t-shirt', 'tee', 'tshirt'], value: 0.25 },
  { pattern: ['hoodie', 'hooded', 'capuchon'], value: 0.15 },
  { pattern: ['jogging', 'sweatpant', 'jogger', 'joggingbroek'], value: 0.10 },
  { pattern: ['sneaker', 'trainer'], value: 0.20 },
  { pattern: ['chelsea', 'enkellaars', 'laars'], value: 0.60 },
  { pattern: ['jeans', 'spijkerbroek'], value: 0.35 },
  { pattern: ['short', 'shorts', 'korte broek'], value: 0.20 },
  { pattern: ['bomber', 'puffer'], value: 0.25 },
  { pattern: ['trenchcoat', 'trench', 'mantel'], value: 0.70 },
  { pattern: ['jas', 'jacket', 'jack'], value: 0.40 },
  { pattern: ['parka', 'regenjas'], value: 0.30 },
  { pattern: ['cargo'], value: 0.15 },
  { pattern: ['overshirt'], value: 0.35 },
  { pattern: ['crewneck', 'sweatshirt'], value: 0.20 },
];

const STREETWEAR_BRANDS = new Set([
  'stussy', 'stüssy', 'carhartt', 'carhartt wip', 'dickies', 'vans',
  'converse', 'the new originals', 'daily paper', 'filling pieces',
  'off-white', 'supreme', 'palace', 'obey', 'huf', 'new era',
  'jordan', 'champion',
]);

const ATHLETIC_BRANDS = new Set([
  'nike', 'adidas', 'puma', 'new balance', 'reebok', 'asics',
  'fila', 'ellesse', 'kappa', 'umbro', 'diadora', 'under armour',
]);

const BUSINESS_BRANDS = new Set([
  'hugo boss', 'boss', 'massimo dutti', 'suitsupply', 'ermenegildo zegna', 'zegna',
  'brooks brothers', 'canali', 'corneliani', 'paul smith', 'hackett',
  'charles tyrwhitt', 'thomas pink', 't.m.lewin', 'olymp', 'van laack',
  'max mara', 'reiss', 'the kooples', 'claudie pierlot', 'sandro',
]);

const CLASSIC_BRANDS = new Set([
  'ralph lauren', 'polo ralph lauren', 'tommy hilfiger',
  'lacoste', 'gant', "marc o'polo", 'scotch & soda', 'ted baker',
  'calvin klein', 'michael kors', 'j.crew',
  'barbour', 'burberry',
]);

const MINIMALIST_BRANDS = new Set([
  'cos', 'arket', 'uniqlo', 'muji', 'everlane', 'filippa k', 'theory',
  'jil sander', 'a.p.c.', 'apc', 'acne studios', 'our legacy', 'norse projects',
  'margaret howell', 'lemaire',
]);

function getBrandStyleHint(brand: string): { formality: number; silhouette: string; archetype?: string } | null {
  const b = (brand || '').toLowerCase();
  if (STREETWEAR_BRANDS.has(b)) return { formality: 0.15, silhouette: 'relaxed', archetype: 'streetwear' };
  if (ATHLETIC_BRANDS.has(b)) return { formality: 0.10, silhouette: 'slim', archetype: 'athletic' };
  if (BUSINESS_BRANDS.has(b)) return { formality: 0.85, silhouette: 'tailored', archetype: 'business' };
  if (CLASSIC_BRANDS.has(b)) return { formality: 0.65, silhouette: 'tailored' };
  if (MINIMALIST_BRANDS.has(b)) return { formality: 0.55, silhouette: 'clean' };
  return null;
}

function textContains(text: string, patterns: string[]): boolean {
  for (const p of patterns) {
    if (p.includes(' ')) {
      if (text.includes(p)) return true;
    } else {
      const re = new RegExp(`\\b${p}\\b`, 'i');
      if (re.test(text)) return true;
    }
  }
  return false;
}

export function enrichProduct(product: Product): Product & { _signals: EnrichedSignals } {
  const name = (product.name || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const combined = `${name} ${desc}`;
  const existingColors = (Array.isArray(product.colors) ? product.colors : product.color ? [product.color] : [])
    .map(c => c.toLowerCase());
  const existingTags = (product.styleTags || product.tags || []).map(t => t.toLowerCase());
  const allText = `${combined} ${existingColors.join(' ')} ${existingTags.join(' ')}`;

  const materialTags: string[] = [];
  for (const [tag, patterns] of Object.entries(MATERIAL_PATTERNS)) {
    if (textContains(allText, patterns)) materialTags.push(tag);
  }

  const silhouetteTags: string[] = [];
  for (const [tag, patterns] of Object.entries(SILHOUETTE_PATTERNS)) {
    if (textContains(allText, patterns)) silhouetteTags.push(tag);
  }

  const colorTags: string[] = [];
  for (const [tag, patterns] of Object.entries(COLOR_MAP)) {
    if (textContains(allText, patterns)) colorTags.push(tag);
  }

  let formality = 0.4;
  let formalityMatched = false;
  for (const signal of FORMALITY_SIGNALS) {
    if (textContains(combined, signal.pattern)) {
      formality = signal.value;
      formalityMatched = true;
      break;
    }
  }

  const brandHint = getBrandStyleHint(product.brand || '');

  if (!formalityMatched) {
    if (existingTags.some(t => t.includes('formal') || t.includes('elegant'))) formality = 0.70;
    else if (existingTags.some(t => t.includes('casual') || t.includes('relaxed'))) formality = 0.30;
    else if (existingTags.some(t => t.includes('athletic') || t.includes('sport'))) formality = 0.10;
    else if (brandHint) formality = brandHint.formality;
  }

  if (brandHint && !formalityMatched) {
    formality = formality * 0.4 + brandHint.formality * 0.6;
  }

  if (brandHint && !silhouetteTags.includes(brandHint.silhouette)) {
    silhouetteTags.push(brandHint.silhouette);
  }

  const dbStyle = ((product as any).style || '').toLowerCase();
  if (dbStyle === 'streetwear' || dbStyle === 'casual-urban') {
    if (!silhouetteTags.includes('relaxed') && !silhouetteTags.includes('oversized')) {
      silhouetteTags.push('relaxed');
    }
    if (!formalityMatched && !brandHint) formality = Math.min(formality, 0.25);
  } else if (dbStyle === 'casual') {
    if (!silhouetteTags.length) silhouetteTags.push('straight');
    if (!formalityMatched && !brandHint) formality = Math.min(formality, 0.35);
  } else if (dbStyle === 'smart-casual') {
    if (!silhouetteTags.includes('tailored')) silhouetteTags.push('tailored');
    if (!formalityMatched && !brandHint) formality = Math.max(formality, 0.55);
  } else if (dbStyle === 'minimalist') {
    if (!silhouetteTags.includes('clean')) silhouetteTags.push('clean');
  } else if (dbStyle === 'luxury') {
    if (!silhouetteTags.includes('tailored')) silhouetteTags.push('tailored');
    if (!formalityMatched && !brandHint) formality = Math.max(formality, 0.65);
  }

  const price = product.price || 0;
  const priceSegment: EnrichedSignals['priceSegment'] =
    price >= 200 ? 'luxury' :
    price >= 80 ? 'premium' :
    price >= 30 ? 'mid' :
    'budget';

  const signals: EnrichedSignals = {
    materialTags,
    silhouetteTags,
    colorTags,
    formality,
    priceSegment,
  };

  return {
    ...product,
    formality,
    _signals: signals,
  };
}

export function enrichProducts(products: Product[]): (Product & { _signals: EnrichedSignals })[] {
  return products.map(enrichProduct);
}

const PERF_BRAND_RE = /^(Nike|Adidas|Puma|Reebok|Asics|Under Armour|New Balance|Fila|Ellesse|Kappa|Umbro|Diadora)$/i;
const LIFESTYLE_LINE_RE = /\bOriginals\b|\bSportswear\b|\bLifestyle\b|\bClassics\b|\bRetro\b|\bHeritage\b/i;
const PERF_NAME_RE = /\b(training|trainings|running|run\b|hardloop|performance|dri-?fit|cloudspun|dryelite|aeroready|climalite|climacool|techfit|compression|basislaag|baselayer|pro\s+tight|track\s*pant|track\s*jacket|sport\s*tight|gym|workout|hiit|hyrox)\b/i;
const LIFESTYLE_NAME_RE = /\b(essentials?\b|graphic|print|logo|street|glam|wardrobe|fashion|jeans|oversized|relaxed\s+shirt|lifestyle|originals|classics|retro|vintage|heritage)\b/i;
const TEAM_SPORT_RE = /\b(Marseille|Arsenal|Milan|Borussia|Barcelona|Bayern|Liverpool|Chelsea|Manchester|Dortmund|Ferrari|McLaren|Red\s*Bull|Racing|Motorsport|voetbal|football|soccer|rugby|hockey|thuisshirt|uitshirt|thuistenue|uittenue)\b/i;

/**
 * Returns a 0-1 score indicating how strongly a product signals athletic/performance use.
 * 0   = no athletic signal (lifestyle brand or non-performance brand)
 * 0.1 = lifestyle variant of a performance brand
 * 0.3 = unclassified performance brand product (e.g. accessories)
 * 0.4 = footwear from a performance brand (likely training/running shoe)
 * 0.6 = mixed performance+lifestyle signals
 * 1.0 = clear performance product (running, training, gym)
 *
 * Non-performance brands always return 0.
 * Team-sport kits always return 0 (jersey, football kit — not lifestyle relevant).
 */
export function deriveAthleticIntent(brand: string, name: string, description: string, category: string): number {
  if (!PERF_BRAND_RE.test(brand)) return 0;

  const text = `${name} ${description}`;

  if (TEAM_SPORT_RE.test(text) || TEAM_SPORT_RE.test(brand)) return 0;

  const isLifestyleLine = LIFESTYLE_LINE_RE.test(brand);
  const hasPerformanceSignal = PERF_NAME_RE.test(text);
  const hasLifestyleSignal = LIFESTYLE_NAME_RE.test(text);

  if (isLifestyleLine && !hasPerformanceSignal) return 0.15;
  if (hasPerformanceSignal && !hasLifestyleSignal) return 1.0;
  if (hasPerformanceSignal && hasLifestyleSignal) return 0.6;
  if (!hasPerformanceSignal && hasLifestyleSignal) return 0.1;

  if (category === 'footwear') return 0.4;
  return 0.3;
}
