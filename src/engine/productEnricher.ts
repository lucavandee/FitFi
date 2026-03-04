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
  slim: ['slim', 'skinny', 'fitted', 'nauwsluitend', 'aansluitend', 'slim fit'],
  straight: ['straight', 'regular', 'regular fit', 'recht'],
  relaxed: ['relaxed', 'loose', 'comfortable', 'loose fit', 'relaxed fit', 'ruim'],
  oversized: ['oversized', 'oversize', 'wide', 'boxy', 'wide leg', 'baggy'],
  tailored: ['tailored', 'blazer', 'suit', 'pak', 'colbert', 'double-breasted', 'single-breasted'],
  clean: ['clean', 'minimal', 'effen', 'basic'],
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
  { pattern: ['pak', 'suit', 'tuxedo', 'smoking'], value: 0.95 },
  { pattern: ['overhemd', 'dress shirt', 'button-down'], value: 0.70 },
  { pattern: ['pantalon', 'trousers', 'nette broek'], value: 0.70 },
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
];

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

  if (!formalityMatched) {
    if (existingTags.some(t => t.includes('formal') || t.includes('elegant'))) formality = 0.70;
    else if (existingTags.some(t => t.includes('casual') || t.includes('relaxed'))) formality = 0.30;
    else if (existingTags.some(t => t.includes('athletic') || t.includes('sport'))) formality = 0.10;
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
