import { Product } from './types';
import { classifyProduct } from './productClassifier';

/**
 * Complete product filtering pipeline
 * Filters products based on quiz answers with proper validation and logging
 */

export interface FilterCriteria {
  gender?: 'male' | 'female' | 'unisex';
  budget?: {
    min?: number;
    max?: number;
  };
  excludeIds?: string[];
  categories?: string[];
  brands?: string[];
  minRating?: number;
}

export interface FilterResult {
  products: Product[];
  stats: {
    initial: number;
    afterGender: number;
    afterBudget: number;
    afterValidation: number;
    final: number;
  };
  removed: {
    gender: string[];
    budget: string[];
    validation: string[];
  };
}

/**
 * Main filtering function that applies all criteria
 */
export function filterProducts(
  products: Product[],
  criteria: FilterCriteria
): FilterResult {
  const stats = {
    initial: products.length,
    afterGender: 0,
    afterBudget: 0,
    afterValidation: 0,
    final: 0,
  };

  const removed = {
    gender: [] as string[],
    budget: [] as string[],
    validation: [] as string[],
  };

  console.log('[ProductFiltering] Starting filter pipeline with', products.length, 'products');
  console.log('[ProductFiltering] Criteria:', JSON.stringify(criteria, null, 2));

  // Step 1: Gender filtering
  let filtered = filterByGender(products, criteria.gender, removed.gender);
  stats.afterGender = filtered.length;
  console.log(`[ProductFiltering] After gender filter: ${filtered.length} products (removed ${stats.initial - stats.afterGender})`);

  // Step 2: Budget filtering
  filtered = filterByBudget(filtered, criteria.budget, removed.budget);
  stats.afterBudget = filtered.length;
  console.log(`[ProductFiltering] After budget filter: ${filtered.length} products (removed ${stats.afterGender - stats.afterBudget})`);

  // Step 3: Validation (required fields)
  filtered = filterByValidation(filtered, removed.validation);
  stats.afterValidation = filtered.length;
  console.log(`[ProductFiltering] After validation: ${filtered.length} products (removed ${stats.afterBudget - stats.afterValidation})`);

  // Step 4: Exclude specific IDs
  if (criteria.excludeIds && criteria.excludeIds.length > 0) {
    const excludeSet = new Set(criteria.excludeIds);
    filtered = filtered.filter(p => !excludeSet.has(p.id));
    console.log(`[ProductFiltering] After excluding IDs: ${filtered.length} products`);
  }

  // Step 5: Category filtering (optional)
  if (criteria.categories && criteria.categories.length > 0) {
    filtered = filtered.filter(p =>
      criteria.categories!.includes(p.category) ||
      criteria.categories!.includes(p.type)
    );
    console.log(`[ProductFiltering] After category filter: ${filtered.length} products`);
  }

  // Step 6: Brand filtering (optional)
  if (criteria.brands && criteria.brands.length > 0) {
    const brandSet = new Set(criteria.brands.map(b => b.toLowerCase()));
    filtered = filtered.filter(p =>
      p.brand && brandSet.has(p.brand.toLowerCase())
    );
    console.log(`[ProductFiltering] After brand filter: ${filtered.length} products`);
  }

  // Step 7: Rating filtering (optional)
  if (criteria.minRating !== undefined) {
    filtered = filtered.filter(p =>
      p.rating && p.rating >= criteria.minRating!
    );
    console.log(`[ProductFiltering] After rating filter: ${filtered.length} products`);
  }

  stats.final = filtered.length;

  // Log summary
  console.log('[ProductFiltering] Filter summary:', {
    initial: stats.initial,
    final: stats.final,
    removed: {
      gender: removed.gender.length,
      budget: removed.budget.length,
      validation: removed.validation.length,
    },
    retention: `${((stats.final / stats.initial) * 100).toFixed(1)}%`
  });

  return {
    products: filtered,
    stats,
    removed,
  };
}

function filterByGender(
  products: Product[],
  gender?: 'male' | 'female' | 'unisex',
  removed: string[] = []
): Product[] {
  if (!gender || gender === 'unisex') {
    return products;
  }

  return products.filter(product => {
    const pg = (product.gender || '').toLowerCase().trim();

    if (pg === 'unisex') return true;
    if (pg === gender) return true;

    // REJECT: missing gender, empty string, or wrong gender
    removed.push(`${product.id} (${product.name}): gender mismatch - wanted ${gender}, got "${pg || 'none'}"`);
    return false;
  });
}

/**
 * Filter by budget range
 */
function filterByBudget(
  products: Product[],
  budget?: { min?: number; max?: number },
  removed: string[] = []
): Product[] {
  if (!budget || (!budget.min && !budget.max)) {
    return products;
  }

  return products.filter(product => {
    const price = product.price;

    // If no price, include it (will be handled in validation)
    if (typeof price !== 'number' || price <= 0) {
      return true;
    }

    // Check maximum budget
    if (budget.max !== undefined && price > budget.max) {
      removed.push(`${product.id} (${product.name}): €${price} exceeds max budget €${budget.max}`);
      return false;
    }

    // Check minimum budget
    if (budget.min !== undefined && price < budget.min) {
      removed.push(`${product.id} (${product.name}): €${price} below min budget €${budget.min}`);
      return false;
    }

    return true;
  });
}

const VALID_CLOTHING_CATEGORIES = new Set([
  'top', 'bottom', 'footwear', 'outerwear', 'accessory', 'dress', 'jumpsuit',
  'tops', 'bottoms', 'shoes', 'shoe', 'jacket', 'coat', 'bag', 'bags',
  'shirt', 'blouse', 'trui', 'broek', 'rok', 'schoen', 'sneaker', 'laars',
  'jas', 'jack', 'blazer', 'jurk', 'overall', 'tas', 'sjaal', 'riem', 'pet',
  'sweater', 'hoodie', 'vest', 'polo', 't-shirt', 'cardigan', 'overhemd',
  'pantalon', 'chino', 'jeans', 'shorts',
]);

const NON_OUTFIT_NAME_PATTERNS = [
  // Underwear & intimates
  'onderbroek', 'boxer', 'slip', 'bh', 'bralette', 'string', 'thong',
  'ondergoed', 'lingerie', 'hipster', 'trunk', 'trunks', 'brief',
  // Sleepwear
  'pyjama', 'nachthem', 'slaap', 'ochtendjas', 'badjas',
  // Socks & hosiery
  'sok', 'sokken', 'sock', 'socks', 'panty', 'kousen', 'kous',
  // Swimwear
  'bikini', 'badpak', 'zwembroek', 'zwemshort', 'zwemtop', 'boardshort',
  // Home & non-clothing
  'gordijn', 'curtain', 'kussen', 'cushion', 'kaars', 'candle',
  'handdoek', 'towel', 'laken', 'dekbed', 'overtrek', 'plaid',
  'vloerkleed', 'tapijt', 'mat', 'vaas', 'mok', 'bord',
  // Beauty & cosmetics
  'kunstnagel', 'press-on', 'parfum', 'make-up', 'mascara', 'lipstick',
  'foundation', 'concealer', 'serum', 'crème', 'shampoo',
  // Baby & kids specific
  'romper', 'kruippak', 'slab',
  // Accessories that are not outfit pieces
  'telefoonhoesje', 'phone case', 'sleutelhanger', 'keychain',
  'sticker', 'poster', 'puzzel',
  // Flip-flops / slippers (not real shoes for outfits)
  'slipper', 'badslip', 'teenslipper', 'flip-flop',
];

function isNonOutfitProduct(product: Product): boolean {
  const searchable = [
    product.name || '',
    product.description || '',
    product.type || '',
  ].join(' ').toLowerCase();

  return NON_OUTFIT_NAME_PATTERNS.some(pattern => searchable.includes(pattern));
}

function isWearableProduct(product: Product): boolean {
  const cat = (product.category || product.type || '').toLowerCase().trim();
  if (!cat) return false;
  if (VALID_CLOTHING_CATEGORIES.has(cat)) return true;
  for (const valid of VALID_CLOTHING_CATEGORIES) {
    if (cat.includes(valid)) return true;
  }
  return false;
}

/**
 * Filter out products with missing required fields or that are not wearable clothing.
 * Uses the smart classifier to reject non-clothing items.
 */
function filterByValidation(
  products: Product[],
  removed: string[] = []
): Product[] {
  return products.filter(product => {
    if (!product.id) {
      removed.push('Product missing ID');
      return false;
    }

    if (!product.name || product.name.trim() === '') {
      removed.push(`${product.id}: missing name`);
      return false;
    }

    const classification = classifyProduct(product);
    if (classification.rejected) {
      removed.push(`${product.id} (${product.name}): ${classification.reason}`);
      return false;
    }

    if (!product.imageUrl) {
      removed.push(`${product.id} (${product.name}): missing image URL`);
      return false;
    }

    if (typeof product.price !== 'number' || product.price <= 0) {
      removed.push(`${product.id} (${product.name}): missing or invalid price`);
      return false;
    }

    return true;
  });
}

/**
 * Get filtering statistics for debugging
 */
export function getFilteringStats(result: FilterResult): string {
  const lines = [
    '=== Product Filtering Stats ===',
    `Initial products: ${result.stats.initial}`,
    `After gender filter: ${result.stats.afterGender} (${result.removed.gender.length} removed)`,
    `After budget filter: ${result.stats.afterBudget} (${result.removed.budget.length} removed)`,
    `After validation: ${result.stats.afterValidation} (${result.removed.validation.length} removed)`,
    `Final products: ${result.stats.final}`,
    `Retention rate: ${((result.stats.final / result.stats.initial) * 100).toFixed(1)}%`,
  ];

  if (result.removed.gender.length > 0) {
    lines.push('\nRemoved by gender:');
    result.removed.gender.slice(0, 5).forEach(r => lines.push(`  - ${r}`));
    if (result.removed.gender.length > 5) {
      lines.push(`  ... and ${result.removed.gender.length - 5} more`);
    }
  }

  if (result.removed.budget.length > 0) {
    lines.push('\nRemoved by budget:');
    result.removed.budget.slice(0, 5).forEach(r => lines.push(`  - ${r}`));
    if (result.removed.budget.length > 5) {
      lines.push(`  ... and ${result.removed.budget.length - 5} more`);
    }
  }

  return lines.join('\n');
}
