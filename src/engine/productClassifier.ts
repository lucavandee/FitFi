import type { Product, ProductCategory } from './types';

const FOOTWEAR_PATTERNS = [
  'sneaker', 'schoen', 'shoe', 'laars', 'boot', 'chelsea', 'loafer',
  'mocassin', 'moccasin', 'pump', 'sandaal', 'sandal', 'espadrille',
  'instapper', 'slip-on', 'oxford', 'derby', 'brogue', 'veterschoen',
  'hiker', 'trail', 'running shoe', 'hardloopschoen', 'wandelschoen',
  'enkellaars', 'kuitlaars', 'desert boot', 'laarzen', 'boots',
  'sneakers', 'schoenen', 'trainer', 'trainers',
];

const BOTTOM_PATTERNS = [
  'broek', 'jeans', 'chino', 'pantalon', 'jogger', 'joggingbroek',
  'short', 'shorts', 'cargo', 'legging', 'tregging', 'sweatpant',
  'track pant', 'trainingsbroek', 'sportbroek', 'werkbroek',
  'denim', 'slim fit broek', 'regular fit broek', 'tapered',
  'straight leg', 'wide leg broek', 'palazzo', 'culottes',
  'bermuda', 'korte broek',
];

const OUTERWEAR_PATTERNS = [
  'jas', 'jack', 'jacket', 'coat', 'blazer', 'parka', 'bomber',
  'puffer', 'pufferjack', 'donsjas', 'winterjas', 'regenjas',
  'trenchcoat', 'trench', 'overcoat', 'mantel', 'gilet', 'bodywarmer',
  'windbreaker', 'softshell', 'hardshell', 'fleecejack', 'gewatteerd',
  'tussenjas', 'zomerjas', 'regenjack', 'ski-jas', 'denim jacket',
  'spijkerjack', 'leren jas', 'leather jacket', 'suede jacket',
  'overshirt',
];

const ACCESSORY_PATTERNS = [
  'tas', 'bag', 'rugzak', 'backpack', 'riem', 'belt', 'sjaal', 'scarf',
  'handschoen', 'glove', 'muts', 'beanie', 'cap', 'pet', 'hoed', 'hat',
  'zonnebril', 'sunglasses', 'horloge', 'watch', 'sieraad', 'jewelry',
  'ketting', 'necklace', 'armband', 'bracelet', 'ring', 'oorbel',
  'earring', 'portemonnee', 'wallet', 'das', 'tie', 'vlinderdas',
  'pochette', 'stropdas', 'manchetknop', 'broche',
];

const DRESS_PATTERNS = [
  'jurk', 'dress', 'maxijurk', 'minijurk', 'midijurk',
  'avondjurk', 'cocktailjurk', 'zomerjurk',
];

const JUMPSUIT_PATTERNS = [
  'jumpsuit', 'overall', 'playsuit', 'onesie',
];

const NON_CLOTHING_PATTERNS = [
  'pyjama', 'nachthem', 'slaap', 'ochtendjas', 'badjas', 'nightwear',
  'sok', 'sokken', 'sock', 'socks', 'panty', 'kousen', 'kous',
  'onderbroek', 'boxer', 'bh', 'bralette', 'string', 'thong',
  'ondergoed', 'lingerie', 'hipster', 'trunk', 'trunks', 'brief',
  'bikini', 'badpak', 'zwembroek', 'zwemshort', 'zwemtop', 'boardshort', 'zwemset',
  'gordijn', 'curtain', 'kussen', 'cushion', 'kaars', 'candle',
  'handdoek', 'towel', 'laken', 'dekbed', 'overtrek', 'plaid',
  'vloerkleed', 'tapijt', 'vaas', 'vase', 'mok', 'bord',
  'spiegel', 'mirror', 'lamp', 'tafellamp', 'kaarshouder',
  'knuffeldier', 'knuffel', 'speelgoed', 'puzzel', 'sticker', 'poster',
  'kunstnagel', 'press-on', 'parfum', 'make-up', 'mascara', 'lipstick',
  'foundation', 'concealer', 'serum', 'crème', 'shampoo', 'kwast', 'bronzer',
  'romper', 'kruippak', 'slab', 'boxpak', 'babypak',
  'telefoonhoesje', 'phone case', 'sleutelhanger', 'keychain',
  'slipper', 'badslip', 'teenslipper', 'flip-flop', 'slippers',
  'voetbalset', 'voetbalshirt', 'keepershandschoen',
  'matras', 'deken', 'beddengoed', 'kussensloop',
  'douchegel', 'bodylotion', 'aftershave', 'deodorant',
  'luier', 'fopspeen', 'flesje', 'aankleedkussen',
  'hemden', 'hemd',
];

const TOP_PATTERNS = [
  't-shirt', 'shirt', 'overhemd', 'blouse', 'polo', 'trui', 'sweater',
  'hoodie', 'vest', 'cardigan', 'tanktop', 'hemdje', 'top',
  'longsleeve', 'crewneck', 'sweatshirt', 'turtleneck', 'coltrui',
  'pullover', 'knit', 'gebreid',
];

function matchesAny(text: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (text.includes(pattern)) return true;
  }
  return false;
}

function matchesAnyWord(text: string, patterns: string[]): boolean {
  const words = text.split(/[\s\-_/,()]+/);
  for (const pattern of patterns) {
    if (pattern.includes(' ')) {
      if (text.includes(pattern)) return true;
    } else {
      if (words.includes(pattern)) return true;
    }
  }
  return false;
}

export function classifyProduct(product: Product): { category: ProductCategory; rejected: boolean; reason?: string } {
  const name = (product.name || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const type = (product.type || '').toLowerCase();
  const dbCategory = (product.category || '').toLowerCase();
  const searchText = `${name} ${desc}`;

  if (matchesAny(searchText, NON_CLOTHING_PATTERNS)) {
    return { category: 'other' as ProductCategory, rejected: true, reason: `non-clothing: "${product.name}"` };
  }

  if (type && type !== 'required') {
    const typeResult = classifyByText(type);
    if (typeResult !== 'other') {
      return { category: typeResult as ProductCategory, rejected: false };
    }
  }

  const nameResult = classifyByText(name);
  if (nameResult !== 'other') {
    return { category: nameResult as ProductCategory, rejected: false };
  }

  const descResult = classifyByText(desc);
  if (descResult !== 'other') {
    return { category: descResult as ProductCategory, rejected: false };
  }

  if (dbCategory && dbCategory !== 'top') {
    return { category: dbCategory as ProductCategory, rejected: false };
  }

  if (dbCategory === 'top') {
    return { category: 'top' as ProductCategory, rejected: false };
  }

  return { category: 'other' as ProductCategory, rejected: true, reason: `unclassifiable: "${product.name}"` };
}

function classifyByText(text: string): string {
  if (!text) return 'other';
  const lower = text.toLowerCase();

  if (matchesAnyWord(lower, FOOTWEAR_PATTERNS)) return 'footwear';
  if (matchesAnyWord(lower, BOTTOM_PATTERNS)) return 'bottom';
  if (matchesAnyWord(lower, OUTERWEAR_PATTERNS)) return 'outerwear';
  if (matchesAnyWord(lower, DRESS_PATTERNS)) return 'dress';
  if (matchesAnyWord(lower, JUMPSUIT_PATTERNS)) return 'jumpsuit';
  if (matchesAnyWord(lower, ACCESSORY_PATTERNS)) return 'accessory';
  if (matchesAnyWord(lower, TOP_PATTERNS)) return 'top';

  return 'other';
}

export function reclassifyProducts(products: Product[]): { classified: Product[]; rejected: Product[]; stats: Record<string, number> } {
  const classified: Product[] = [];
  const rejected: Product[] = [];
  const stats: Record<string, number> = {
    reclassified: 0,
    rejected: 0,
    kept: 0,
    footwear_found: 0,
    bottom_found: 0,
    outerwear_found: 0,
    top_found: 0,
    accessory_found: 0,
  };

  for (const product of products) {
    const result = classifyProduct(product);

    if (result.rejected) {
      rejected.push(product);
      stats.rejected++;
      continue;
    }

    const originalCategory = (product.category || '').toLowerCase();
    const newCategory = result.category;

    if (originalCategory !== newCategory) {
      stats.reclassified++;
    } else {
      stats.kept++;
    }

    const key = `${newCategory}_found`;
    if (key in stats) stats[key]++;

    classified.push({
      ...product,
      category: newCategory,
    });
  }

  console.log(`[ProductClassifier] Processed ${products.length} products: ${classified.length} classified, ${rejected.length} rejected, ${stats.reclassified} reclassified`);
  console.log(`[ProductClassifier] Distribution: top=${stats.top_found} bottom=${stats.bottom_found} footwear=${stats.footwear_found} outerwear=${stats.outerwear_found} accessory=${stats.accessory_found}`);

  return { classified, rejected, stats };
}
