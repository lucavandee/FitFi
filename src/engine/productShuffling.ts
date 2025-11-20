import { Product } from './types';

/**
 * Shuffle an array using Fisher-Yates algorithm
 * Returns a new shuffled array without modifying the original
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Shuffle products by category for better variety
 * Ensures different products are selected each time
 */
export function shuffleProductsByCategory(products: Product[]): Product[] {
  // Group products by category
  const byCategory = products.reduce((acc, product) => {
    const category = product.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Shuffle each category independently
  const shuffled: Product[] = [];
  Object.keys(byCategory).forEach(category => {
    const categoryProducts = shuffleArray(byCategory[category]);
    shuffled.push(...categoryProducts);
  });

  console.log('[ProductShuffling] Shuffled products by category:', Object.keys(byCategory));

  return shuffled;
}

/**
 * Calculate diversity score between two products
 * Higher score = more diverse (different colors, brands, styles)
 */
export function calculateDiversityScore(product1: Product, product2: Product): number {
  let score = 0;

  // Different brands = more diversity
  if (product1.brand !== product2.brand) {
    score += 0.3;
  }

  // Different retailers = more diversity
  if (product1.retailer !== product2.retailer) {
    score += 0.2;
  }

  // Different colors = more diversity
  if (product1.colors && product2.colors) {
    const colors1 = new Set(product1.colors);
    const colors2 = new Set(product2.colors);
    const commonColors = [...colors1].filter(c => colors2.has(c));

    if (commonColors.length === 0) {
      score += 0.3; // Completely different colors
    } else if (commonColors.length < Math.min(colors1.size, colors2.size)) {
      score += 0.15; // Some overlap
    }
  }

  // Different price ranges = more diversity
  if (product1.price && product2.price) {
    const priceDiff = Math.abs(product1.price - product2.price);
    const avgPrice = (product1.price + product2.price) / 2;
    const relDiff = priceDiff / avgPrice;

    if (relDiff > 0.5) {
      score += 0.2; // Significant price difference
    } else if (relDiff > 0.2) {
      score += 0.1; // Moderate price difference
    }
  }

  return score;
}

/**
 * Select diverse products from a list
 * Ensures variety in brands, colors, and styles
 */
export function selectDiverseProducts(
  products: Product[],
  count: number,
  selectedProducts: Product[] = []
): Product[] {
  if (products.length === 0 || count === 0) {
    return [];
  }

  const selected: Product[] = [];
  const remaining = [...products];

  // If we have previous selections, start with those for diversity calculation
  const allSelected = [...selectedProducts];

  for (let i = 0; i < count && remaining.length > 0; i++) {
    let bestProduct: Product | null = null;
    let bestScore = -1;
    let bestIndex = -1;

    // Find product with highest diversity score
    remaining.forEach((product, index) => {
      if (allSelected.length === 0) {
        // First product: just pick randomly
        if (Math.random() > 0.5 && bestProduct === null) {
          bestProduct = product;
          bestIndex = index;
          bestScore = 1;
        }
      } else {
        // Calculate average diversity from already selected products
        const avgDiversity =
          allSelected.reduce((sum, selected) => sum + calculateDiversityScore(product, selected), 0) /
          allSelected.length;

        if (avgDiversity > bestScore) {
          bestProduct = product;
          bestScore = avgDiversity;
          bestIndex = index;
        }
      }
    });

    if (bestProduct) {
      selected.push(bestProduct);
      allSelected.push(bestProduct);
      remaining.splice(bestIndex, 1);
    }
  }

  console.log(`[ProductShuffling] Selected ${selected.length} diverse products from ${products.length}`);

  return selected;
}

/**
 * Add controlled randomness to product scores for variation
 * Slightly randomizes scores to prevent same results every time
 */
export function addScoreVariation(
  products: Array<Product & { matchScore?: number }>,
  variationFactor: number = 0.1
): Array<Product & { matchScore: number }> {
  return products.map(product => ({
    ...product,
    matchScore: (product.matchScore || 0.5) * (1 + (Math.random() - 0.5) * variationFactor)
  }));
}
