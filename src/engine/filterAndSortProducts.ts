import {
  Product,
  UserProfile,
  StylePreferences,
  ProductCategory,
} from "./types";
import { calculateMatchScore } from "./calculateMatchScore";
import { getProductCategory } from "./helpers";

/**
 * Filters and sorts products based on user preferences with enhanced validation
 *
 * @param products - Array of products to filter and sort
 * @param user - User profile with style preferences
 * @returns Filtered and sorted array of products
 */
export function filterAndSortProducts(
  products: Product[],
  user: UserProfile,
): Product[] {
  // Enhanced input validation
  if (!products || !Array.isArray(products) || products.length === 0) {
    console.warn("[FilterAndSort] No products provided or empty array");
    return [];
  }

  if (!user || !user.stylePreferences) {
    console.warn(
      "[FilterAndSort] No user or style preferences provided, returning all products",
    );
    return products;
  }

  console.log(
    `[FilterAndSort] Processing ${products.length} products for user ${user.name || user.id}`,
  );

  // Validate and filter products with proper data
  const validProducts = products.filter((product) => {
    // Basic validation
    if (!product || typeof product !== "object") {
      console.warn("[FilterAndSort] Invalid product object:", product);
      return false;
    }

    // Required fields validation
    if (!product.id || !product.name) {
      console.warn(
        "[FilterAndSort] Product missing required fields (id, name):",
        product,
      );
      return false;
    }

    // Image validation (optional but recommended)
    if (!product.imageUrl) {
      console.warn("[FilterAndSort] Product missing image URL:", product.id);
      // Don't filter out, but log warning
    }

    return true;
  });

  console.log(
    `[FilterAndSort] ${validProducts.length}/${products.length} products passed validation`,
  );

  // Calculate match score for each valid product
  const productsWithScores = validProducts.map((product) => {
    const matchScore = calculateMatchScore(product, user.stylePreferences);
    return {
      ...product,
      matchScore,
    };
  });

  // Filter by gender if user has gender preference
  let genderFilteredProducts = productsWithScores;
  if (user.gender) {
    genderFilteredProducts = productsWithScores.filter((product) => {
      // Include unisex items for all genders
      if (product.gender === "unisex") return true;

      // Match user's gender
      if (user.gender === "male" && product.gender === "male") return true;
      if (user.gender === "female" && product.gender === "female") return true;

      // If product has no gender specified, include it
      if (!product.gender) return true;

      return false;
    });

    console.log(
      `[FilterAndSort] Gender filter (${user.gender}): ${genderFilteredProducts.length}/${productsWithScores.length} products`,
    );
  }

  // Filter out products with very low match scores (below threshold)
  const MATCH_THRESHOLD = 0.1; // Minimum match score to include
  const matchFilteredProducts = genderFilteredProducts.filter(
    (product) => (product.matchScore || 0) >= MATCH_THRESHOLD,
  );

  console.log(
    `[FilterAndSort] Match filter (>=${MATCH_THRESHOLD}): ${matchFilteredProducts.length}/${genderFilteredProducts.length} products`,
  );

  // Sort by match score (highest first), with secondary sort by price for ties
  const sortedProducts = matchFilteredProducts.sort((a, b) => {
    const scoreA = a.matchScore || 0;
    const scoreB = b.matchScore || 0;

    // Primary sort: match score (descending)
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }

    // Secondary sort: price (ascending) for products with same match score
    const priceA = a.price || 0;
    const priceB = b.price || 0;
    return priceA - priceB;
  });

  console.log(
    `[FilterAndSort] Final result: ${sortedProducts.length} products sorted by match score`,
  );

  // Log top matches for debugging
  if (sortedProducts.length > 0) {
    const topMatches = sortedProducts.slice(0, 3).map((p) => ({
      name: p.name,
      score: p.matchScore,
      price: p.price,
      tags: p.styleTags,
    }));
    console.log("[FilterAndSort] Top matches:", topMatches);
  }

  return sortedProducts;
}

/**
 * Groups products by type (category) with enhanced validation
 *
 * @param products - Array of products to group
 * @returns Object with product types as keys and arrays of products as values
 */
export function groupProductsByType(
  products: Product[],
): Record<string, Product[]> {
  if (!products || !Array.isArray(products)) {
    console.warn("[GroupByType] Invalid products array provided");
    return {};
  }

  const groupedProducts: Record<string, Product[]> = {};

  products.forEach((product) => {
    if (!product || typeof product !== "object") {
      console.warn("[GroupByType] Invalid product in array:", product);
      return;
    }

    const type = product.type || product.category || "Other";

    if (!groupedProducts[type]) {
      groupedProducts[type] = [];
    }

    groupedProducts[type].push(product);
  });

  // Log grouping results
  const groupSummary = Object.entries(groupedProducts)
    .map(([type, prods]) => `${type}: ${prods.length}`)
    .join(", ");
  console.log(`[GroupByType] Grouped into: ${groupSummary}`);

  return groupedProducts;
}

/**
 * Groups products by category with enhanced validation
 *
 * @param products - Array of products to group
 * @returns Object with product categories as keys and arrays of products as values
 */
export function groupProductsByCategory(
  products: Product[],
): Record<ProductCategory, Product[]> {
  if (!products || !Array.isArray(products)) {
    console.warn("[GroupByCategory] Invalid products array provided");
    return {} as Record<ProductCategory, Product[]>;
  }

  const result: Record<ProductCategory, Product[]> = {} as Record<
    ProductCategory,
    Product[]
  >;

  // Initialize empty arrays for each category
  Object.values(ProductCategory).forEach((category) => {
    result[category] = [];
  });

  // Group products by category
  products.forEach((product) => {
    if (!product || typeof product !== "object") {
      console.warn("[GroupByCategory] Invalid product in array:", product);
      return;
    }

    try {
      const category = getProductCategory(product);
      result[category].push(product);
    } catch (error) {
      console.warn(
        "[GroupByCategory] Error categorizing product:",
        product.id,
        error,
      );
      // Fallback to OTHER category
      result[ProductCategory.OTHER].push(product);
    }
  });

  // Log categorization results
  const categorySummary = Object.entries(result)
    .filter(([, prods]) => prods.length > 0)
    .map(([category, prods]) => `${category}: ${prods.length}`)
    .join(", ");
  console.log(`[GroupByCategory] Categorized into: ${categorySummary}`);

  return result;
}

/**
 * Gets top N products for each product type with enhanced filtering
 *
 * @param products - Array of products to process
 * @param count - Number of products to get per type
 * @returns Array of top products from each type
 */
export function getTopProductsByType(
  products: Product[],
  count: number = 2,
): Product[] {
  if (!products || !Array.isArray(products) || products.length === 0) {
    console.warn("[TopByType] No valid products provided");
    return [];
  }

  if (count <= 0) {
    console.warn("[TopByType] Invalid count provided:", count);
    return [];
  }

  const groupedProducts = groupProductsByType(products);
  const result: Product[] = [];

  // Get top products from each type
  Object.entries(groupedProducts).forEach(([type, typeProducts]) => {
    if (!typeProducts || typeProducts.length === 0) return;

    // Sort by match score within this type
    const sorted = [...typeProducts].sort(
      (a, b) => (b.matchScore || 0) - (a.matchScore || 0),
    );

    // Take top N
    const topProducts = sorted.slice(0, count);
    result.push(...topProducts);

    console.log(
      `[TopByType] ${type}: selected ${topProducts.length}/${typeProducts.length} products`,
    );
  });

  console.log(
    `[TopByType] Final result: ${result.length} products from ${Object.keys(groupedProducts).length} types`,
  );
  return result;
}

/**
 * Gets top N products for each product category with enhanced filtering
 *
 * @param products - Array of products to process
 * @param count - Number of products to get per category
 * @returns Array of top products from each category
 */
export function getTopProductsByCategory(
  products: Product[],
  count: number = 2,
): Product[] {
  if (!products || !Array.isArray(products) || products.length === 0) {
    console.warn("[TopByCategory] No valid products provided");
    return [];
  }

  if (count <= 0) {
    console.warn("[TopByCategory] Invalid count provided:", count);
    return [];
  }

  const groupedProducts = groupProductsByCategory(products);
  const result: Product[] = [];

  // Get top products from each category
  Object.entries(groupedProducts).forEach(([category, categoryProducts]) => {
    if (!categoryProducts || categoryProducts.length === 0) return;

    // Sort by match score within this category
    const sorted = [...categoryProducts].sort(
      (a, b) => (b.matchScore || 0) - (a.matchScore || 0),
    );

    // Take top N
    const topProducts = sorted.slice(0, count);
    result.push(...topProducts);

    console.log(
      `[TopByCategory] ${category}: selected ${topProducts.length}/${categoryProducts.length} products`,
    );
  });

  console.log(
    `[TopByCategory] Final result: ${result.length} products from ${Object.keys(groupedProducts).filter((k) => groupedProducts[k as ProductCategory].length > 0).length} categories`,
  );
  return result;
}

/**
 * Filters products by archetype with soft matching
 *
 * @param products - Array of products to filter
 * @param archetype - Target archetype to match
 * @param threshold - Minimum match threshold (0-1)
 * @returns Filtered products that match the archetype
 */
export function filterProductsByArchetype(
  products: Product[],
  archetype: string,
  threshold: number = 0.3,
): Product[] {
  if (!products || !Array.isArray(products) || products.length === 0) {
    console.warn("[ArchetypeFilter] No valid products provided");
    return [];
  }

  if (!archetype) {
    console.warn("[ArchetypeFilter] No archetype provided");
    return products;
  }

  // Define archetype style mappings for soft matching
  const archetypeStyleMap: Record<string, string[]> = {
    klassiek: ["classic", "elegant", "formal", "timeless", "sophisticated"],
    casual_chic: ["casual", "comfortable", "versatile", "modern", "relaxed"],
    urban: ["streetwear", "urban", "functional", "edgy", "contemporary"],
    streetstyle: ["streetwear", "trendy", "bold", "graphic", "statement"],
    retro: ["vintage", "retro", "nostalgic", "classic", "throwback"],
    luxury: ["luxury", "premium", "high-end", "designer", "investment"],
  };

  const targetStyles = archetypeStyleMap[archetype] || [];

  if (targetStyles.length === 0) {
    console.warn("[ArchetypeFilter] Unknown archetype:", archetype);
    return products;
  }

  const filteredProducts = products.filter((product) => {
    if (!product.styleTags || !Array.isArray(product.styleTags)) {
      return false; // No style tags means no archetype match
    }

    // Calculate match ratio
    const matchingTags = product.styleTags.filter((tag) =>
      targetStyles.some(
        (style) =>
          tag.toLowerCase().includes(style.toLowerCase()) ||
          style.toLowerCase().includes(tag.toLowerCase()),
      ),
    );

    const matchRatio = matchingTags.length / product.styleTags.length;
    return matchRatio >= threshold;
  });

  console.log(
    `[ArchetypeFilter] ${archetype}: ${filteredProducts.length}/${products.length} products match (threshold: ${threshold})`,
  );

  return filteredProducts;
}

/**
 * Validates product data structure
 *
 * @param product - Product to validate
 * @returns Validation result with errors
 */
export function validateProduct(product: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!product) {
    errors.push("Product is null or undefined");
    return { isValid: false, errors, warnings };
  }

  if (!product.id) errors.push("Missing required field: id");
  if (!product.title && !product.name)
    errors.push("Missing required field: title or name");
  if (!product.category && !product.type)
    warnings.push("Missing category and type fields");

  // Optional but recommended fields
  if (!product.imageUrl) warnings.push("Missing imageUrl - will use fallback");
  if (!product.price) warnings.push("Missing price information");
  if (!product.brand) warnings.push("Missing brand information");
  if (!product.styleTags || !Array.isArray(product.styleTags)) {
    warnings.push("Missing or invalid styleTags - affects matching accuracy");
  }

  // Data type validation
  if (
    product.price &&
    (typeof product.price !== "number" || product.price < 0)
  ) {
    errors.push("Invalid price: must be a positive number");
  }

  if (
    product.gender &&
    !["male", "female", "unisex"].includes(product.gender)
  ) {
    warnings.push(`Invalid gender value: ${product.gender}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Batch validates an array of products
 *
 * @param products - Array of products to validate
 * @returns Validation summary
 */
export function validateProductBatch(products: any[]): {
  validCount: number;
  invalidCount: number;
  totalErrors: number;
  totalWarnings: number;
  validProducts: Product[];
} {
  if (!Array.isArray(products)) {
    return {
      validCount: 0,
      invalidCount: 0,
      totalErrors: 1,
      totalWarnings: 0,
      validProducts: [],
    };
  }

  let validCount = 0;
  let invalidCount = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  const validProducts: Product[] = [];

  products.forEach((product, index) => {
    const validation = validateProduct(product);

    totalErrors += validation.errors.length;
    totalWarnings += validation.warnings.length;

    if (validation.isValid) {
      validCount++;
      validProducts.push(product as Product);
    } else {
      invalidCount++;
      console.warn(
        `[BatchValidation] Product ${index} invalid:`,
        validation.errors,
      );
    }

    if (validation.warnings.length > 0) {
      console.warn(
        `[BatchValidation] Product ${index} warnings:`,
        validation.warnings,
      );
    }
  });

  console.log(
    `[BatchValidation] Summary: ${validCount} valid, ${invalidCount} invalid, ${totalErrors} errors, ${totalWarnings} warnings`,
  );

  return {
    validCount,
    invalidCount,
    totalErrors,
    totalWarnings,
    validProducts,
  };
}
