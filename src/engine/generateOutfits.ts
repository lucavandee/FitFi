import {
  Product,
  Outfit,
  Season,
  ProductCategory,
  OutfitGenerationOptions,
  Weather,
  CategoryRatio,
  VariationLevel,
} from "./types";
import {
  generateOutfitTitle,
  generateOutfitDescription,
} from "./generateOutfitDescriptions";
import { generateOutfitExplanation } from "./explainOutfit";
import {
  getCurrentSeason,
  getProductCategory,
  isProductSuitableForWeather,
  getTypicalWeatherForSeason,
} from "./helpers";

/**
 * Essential categories that every outfit should have
 */
const REQUIRED_CATEGORIES = [
  ProductCategory.TOP,
  ProductCategory.BOTTOM,
  ProductCategory.FOOTWEAR,
];

/**
 * Optional categories that enhance an outfit
 */
const OPTIONAL_CATEGORIES = [
  ProductCategory.ACCESSORY,
  ProductCategory.OUTERWEAR,
];

/**
 * Categories that can substitute for multiple required categories
 */
const SUBSTITUTE_CATEGORIES: Record<ProductCategory, ProductCategory[]> = {
  [ProductCategory.DRESS]: [ProductCategory.TOP, ProductCategory.BOTTOM],
  [ProductCategory.JUMPSUIT]: [ProductCategory.TOP, ProductCategory.BOTTOM],
  [ProductCategory.TOP]: [],
  [ProductCategory.BOTTOM]: [],
  [ProductCategory.FOOTWEAR]: [],
  [ProductCategory.ACCESSORY]: [],
  [ProductCategory.OUTERWEAR]: [],
  [ProductCategory.OTHER]: [],
};

/**
 * Outfit structure blueprints for each archetype
 */
const archetypeOutfitStructures: Record<
  string,
  {
    requiredCategories: ProductCategory[];
    optionalCategories: ProductCategory[];
    minItems: number;
    maxItems: number;
    description: string;
  }
> = {
  klassiek: {
    requiredCategories: [
      ProductCategory.TOP,
      ProductCategory.BOTTOM,
      ProductCategory.FOOTWEAR,
    ],
    optionalCategories: [ProductCategory.OUTERWEAR, ProductCategory.ACCESSORY],
    minItems: 3,
    maxItems: 5,
    description: "Tijdloze elegantie met verfijnde stukken",
  },
  casual_chic: {
    requiredCategories: [
      ProductCategory.TOP,
      ProductCategory.BOTTOM,
      ProductCategory.FOOTWEAR,
    ],
    optionalCategories: [ProductCategory.ACCESSORY, ProductCategory.OUTERWEAR],
    minItems: 3,
    maxItems: 5,
    description: "Moeiteloze elegantie met een relaxte twist",
  },
  urban: {
    requiredCategories: [
      ProductCategory.TOP,
      ProductCategory.BOTTOM,
      ProductCategory.FOOTWEAR,
    ],
    optionalCategories: [ProductCategory.OUTERWEAR, ProductCategory.ACCESSORY],
    minItems: 3,
    maxItems: 5,
    description: "Functionele stadslook met praktische details",
  },
  streetstyle: {
    requiredCategories: [
      ProductCategory.TOP,
      ProductCategory.BOTTOM,
      ProductCategory.FOOTWEAR,
    ],
    optionalCategories: [ProductCategory.ACCESSORY, ProductCategory.OUTERWEAR],
    minItems: 3,
    maxItems: 5,
    description: "Expressieve streetwear met attitude",
  },
  retro: {
    requiredCategories: [
      ProductCategory.TOP,
      ProductCategory.BOTTOM,
      ProductCategory.FOOTWEAR,
    ],
    optionalCategories: [ProductCategory.ACCESSORY, ProductCategory.OUTERWEAR],
    minItems: 3,
    maxItems: 5,
    description: "Vintage-geïnspireerde look met nostalgische elementen",
  },
  luxury: {
    requiredCategories: [
      ProductCategory.TOP,
      ProductCategory.BOTTOM,
      ProductCategory.FOOTWEAR,
      ProductCategory.ACCESSORY,
    ],
    optionalCategories: [ProductCategory.OUTERWEAR],
    minItems: 4,
    maxItems: 6,
    description: "Exclusieve stukken van topkwaliteit",
  },
};

// Default structure for any archetype not explicitly defined
const defaultOutfitStructure = {
  requiredCategories: [
    ProductCategory.TOP,
    ProductCategory.BOTTOM,
    ProductCategory.FOOTWEAR,
  ],
  optionalCategories: [ProductCategory.ACCESSORY, ProductCategory.OUTERWEAR],
  minItems: 3,
  maxItems: 5,
  description: "Gebalanceerde outfit met essentiële items",
};

// Season-specific outfit adjustments
const seasonalOutfitAdjustments: Record<
  Season,
  {
    requiredCategories?: ProductCategory[];
    optionalCategories?: ProductCategory[];
    priorityCategories?: ProductCategory[];
    description: string;
  }
> = {
  spring: {
    optionalCategories: [ProductCategory.OUTERWEAR],
    description: "Lichte laagjes voor veranderlijk lenteweer",
  },
  summer: {
    // No outerwear required in summer
    priorityCategories: [ProductCategory.TOP, ProductCategory.BOTTOM],
    description: "Luchtige items voor warme zomerdagen",
  },
  autumn: {
    requiredCategories: [ProductCategory.OUTERWEAR],
    description: "Warme laagjes voor koele herfstdagen",
  },
  winter: {
    requiredCategories: [ProductCategory.OUTERWEAR],
    priorityCategories: [ProductCategory.OUTERWEAR],
    description: "Warme, isolerende items voor koude winterdagen",
  },
};

/**
 * Variation settings for different levels
 */
const variationSettings: Record<
  VariationLevel,
  {
    optionalCategoryProbability: number;
    categoryWeightVariation: number;
    allowSubstitutes: boolean;
  }
> = {
  low: {
    optionalCategoryProbability: 0.3,
    categoryWeightVariation: 0.1,
    allowSubstitutes: false,
  },
  medium: {
    optionalCategoryProbability: 0.5,
    categoryWeightVariation: 0.2,
    allowSubstitutes: true,
  },
  high: {
    optionalCategoryProbability: 0.7,
    categoryWeightVariation: 0.3,
    allowSubstitutes: true,
  },
};

/**
 * Generates complete outfits based on archetypes and available products
 *
 * @param primaryArchetype - The primary style archetype to generate outfits for
 * @param products - Array of available products
 * @param count - Number of outfits to generate (default: 3)
 * @param secondaryArchetype - Optional secondary archetype for hybrid matching
 * @param mixFactor - How much influence the secondary archetype has (0-1)
 * @param options - Additional options for outfit generation
 * @returns Array of generated outfits
 */
function generateOutfits(
  primaryArchetype: string,
  products: Product[],
  count: number = 3,
  secondaryArchetype?: string,
  mixFactor: number = 0.3,
  options?: OutfitGenerationOptions,
): Outfit[] {
  if (!products || !Array.isArray(products) || products.length < 4) {
    console.warn("Not enough products to generate outfits");
    return [];
  }

  // Extract options
  const excludeIds = options?.excludeIds || [];
  const preferredOccasions = options?.preferredOccasions || [];
  const preferredSeasons = options?.preferredSeasons || [];
  const weather = options?.weather;
  const maxAttempts = options?.maxAttempts || 10;
  const variationLevel = options?.variationLevel || "medium";
  const enforceCompletion =
    options?.enforceCompletion !== undefined ? options.enforceCompletion : true;
  const minCompleteness = options?.minCompleteness || 80; // Default to 80% completeness

  // Log archetype information
  console.log(
    "Generating outfits with archetypes:",
    secondaryArchetype
      ? `${primaryArchetype} (${Math.round((1 - mixFactor) * 100)}%) + ${secondaryArchetype} (${Math.round(mixFactor * 100)}%)`
      : primaryArchetype,
  );
  console.log("Variation level:", variationLevel);
  console.log("Enforce completion:", enforceCompletion);
  console.log("Min completeness:", minCompleteness);

  // If secondary archetype is the same as primary or undefined, ignore it
  if (!secondaryArchetype || secondaryArchetype === primaryArchetype) {
    secondaryArchetype = undefined;
    mixFactor = 0;
    console.log("Using 100% primary archetype:", primaryArchetype);
  }

  // Get current season or use preferred season if specified
  const currentSeason: Season = (
    preferredSeasons && preferredSeasons.length > 0
      ? preferredSeasons[0]
      : getCurrentSeason()
  ) as Season;

  console.log("Active season:", currentSeason);

  // Determine weather if not specified
  const activeWeather = weather ?? getTypicalWeatherForSeason(currentSeason);
  console.log("Active weather:", activeWeather);

  // Filter products by season
  const seasonalProducts = products.filter(
    (product) => !product.season || product.season.includes(currentSeason),
  );
  console.log("Products suitable for season:", seasonalProducts.length);

  // Further filter by weather if specified
  let weatherFilteredProducts = seasonalProducts;
  if (weather) {
    weatherFilteredProducts = seasonalProducts.filter((product) =>
      isProductSuitableForWeather(product, weather),
    );
    console.log(
      "Products suitable for weather:",
      weatherFilteredProducts.length,
    );
  }

  // If we don't have enough seasonal/weather products, fall back to seasonal only or all products
  const productsToUse =
    weatherFilteredProducts.length >= 4
      ? weatherFilteredProducts
      : seasonalProducts.length >= 4
        ? seasonalProducts
        : products;

  if (weatherFilteredProducts.length < 4 && seasonalProducts.length >= 4) {
    console.warn(
      `Not enough products for ${activeWeather} weather, falling back to seasonal products`,
    );
  } else if (seasonalProducts.length < 4) {
    console.warn(
      `Not enough products for season ${currentSeason}, falling back to all products`,
    );
  }

  // Define occasions based on archetype and preferred occasions
  let occasions = getOccasionsForArchetype(primaryArchetype);

  // If preferred occasions are specified and valid, prioritize them
  if (preferredOccasions && preferredOccasions.length > 0) {
    // Filter to only valid occasions
    const validPreferredOccasions = preferredOccasions.filter((occ) =>
      occasions.includes(occ),
    );

    if (validPreferredOccasions.length > 0) {
      // Use preferred occasions first, then add others to reach the count
      occasions = [
        ...validPreferredOccasions,
        ...occasions.filter((occ) => !validPreferredOccasions.includes(occ)),
      ];

      console.log("Using preferred occasions:", validPreferredOccasions);
    }
  }

  // Generate one outfit per occasion, up to the requested count
  const outfits: Outfit[] = [];
  const attemptsPerOccasion: Record<string, number> = {};

  for (let i = 0; i < Math.min(count, occasions.length); i++) {
    const occ = occasions[i] ?? "casual";
    attemptsPerOccasion[occ] = attemptsPerOccasion[occ] ?? 0;

    let outfit: Outfit | null = null;
    let attempts = 0;

    // Try to generate a unique outfit for this occasion
    while (!outfit && attempts < maxAttempts) {
      attempts++;
      attemptsPerOccasion[occ]++;

      const generatedOutfit = generateOutfitForOccasion(
        primaryArchetype,
        productsToUse,
        occ,
        currentSeason,
        activeWeather,
        secondaryArchetype,
        mixFactor,
        variationLevel,
        enforceCompletion,
        minCompleteness,
      );

      // Check if the outfit is unique (not in excludeIds)
      if (generatedOutfit && !excludeIds.includes(generatedOutfit.id)) {
        outfit = generatedOutfit;
      } else if (generatedOutfit) {
        console.log(
          `Outfit already shown, trying again (attempt ${attempts}/${maxAttempts})`,
        );
      }
    }

    if (outfit) {
      outfits.push(outfit);
    } else {
      console.warn(
        `Failed to generate unique outfit for occasion ${occ} after ${attempts} attempts`,
      );
    }
  }

  // Log generation attempts
  console.log("Outfit generation attempts:", attemptsPerOccasion);
  console.log("Generated outfits:", outfits.length);

  return outfits;
}

/**
 * Gets appropriate occasions for a given archetype
 */
function getOccasionsForArchetype(archetype: string): string[] {
  const occasionMap: Record<string, string[]> = {
    klassiek: ["Werk", "Formeel", "Zakelijk diner"],
    casual_chic: ["Casual", "Weekend", "Lunch"],
    urban: ["Stad", "Casual", "Actief"],
    streetstyle: ["Casual", "Uitgaan", "Festival"],
    retro: ["Casual", "Creatief", "Weekend"],
    luxury: ["Formeel", "Gala", "Speciale gelegenheid"],
  };

  return occasionMap[archetype] || ["Casual", "Werk", "Formeel"];
}

/**
 * Generates a single outfit for a specific occasion
 */
function generateOutfitForOccasion(
  primaryArchetype: string,
  products: Product[],
  occasion: string,
  season: Season,
  weather: Weather,
  secondaryArchetype?: string,
  mixFactor: number = 0.3,
  variationLevel: VariationLevel = "medium",
  enforceCompletion: boolean = true,
  minCompleteness: number = 80,
): Outfit | null {
  // Log outfit generation
  console.log(
    "Outfit op basis van:",
    primaryArchetype,
    secondaryArchetype ? "+" : "",
    secondaryArchetype || "",
  );
  console.log("Season:", season, "Weather:", weather);
  console.log("Variation level:", variationLevel);

  // Get variation settings
  const variation = variationSettings[variationLevel];

  // Group products by category
  const productsByCategory = groupProductsByCategory(products);

  // Log available categories and counts
  console.log(
    "Beschikbare productcategorieën:",
    Object.entries(productsByCategory)
      .map(([category, prods]) => `${category}: ${prods.length}`)
      .join(", "),
  );

  // Get the outfit structure for the primary archetype
  const baseOutfitStructure =
    archetypeOutfitStructures[primaryArchetype] || defaultOutfitStructure;

  // Apply seasonal adjustments to the structure
  const seasonalAdjustment = seasonalOutfitAdjustments[season] || {
    description: "Seizoensgeschikte items",
  };

  // Create a copy of the base structure to modify
  const outfitStructure = {
    ...baseOutfitStructure,
    requiredCategories: [...baseOutfitStructure.requiredCategories],
    optionalCategories: [...baseOutfitStructure.optionalCategories],
  };

  // Add seasonal required categories if not already included
  if (seasonalAdjustment.requiredCategories) {
    seasonalAdjustment.requiredCategories.forEach((category) => {
      if (
        !outfitStructure.requiredCategories.includes(category) &&
        !outfitStructure.optionalCategories.includes(category)
      ) {
        outfitStructure.requiredCategories.push(category);
      } else if (outfitStructure.optionalCategories.includes(category)) {
        // Move from optional to required
        outfitStructure.optionalCategories =
          outfitStructure.optionalCategories.filter((c) => c !== category);
        if (!outfitStructure.requiredCategories.includes(category)) {
          outfitStructure.requiredCategories.push(category);
        }
      }
    });
  }

  console.log(
    `Using outfit structure for ${primaryArchetype} in ${season}:`,
    `Required: [${outfitStructure.requiredCategories.join(", ")}], ` +
      `Optional: [${outfitStructure.optionalCategories.join(", ")}]`,
  );

  // Select products for each required category
  const outfitProducts: Product[] = [];
  const selectedCategories: ProductCategory[] = [];
  const fallbackProducts: Product[] = [];

  // First, try to fill all required categories
  for (const category of outfitStructure.requiredCategories) {
    // Skip if we already have this category (to avoid duplicates)
    if (selectedCategories.includes(category)) {
      continue;
    }

    // Try to get a product for this category
    const selectedProduct = selectProductForCategory(
      productsByCategory,
      category,
      primaryArchetype,
      occasion,
      season,
      weather,
      secondaryArchetype,
      mixFactor,
    );

    if (selectedProduct) {
      outfitProducts.push(selectedProduct);
      selectedCategories.push(category);
    } else {
      console.warn(`Geen product gevonden voor vereiste categorie ${category}`);

      // For tops and bottoms, check if we have a dress or jumpsuit as a substitute
      if (
        (category === ProductCategory.TOP ||
          category === ProductCategory.BOTTOM) &&
        !selectedCategories.includes(ProductCategory.DRESS) &&
        !selectedCategories.includes(ProductCategory.JUMPSUIT) &&
        variation.allowSubstitutes
      ) {
        // Try to find a dress or jumpsuit
        const substituteCategories = [
          ProductCategory.DRESS,
          ProductCategory.JUMPSUIT,
        ];

        for (const substituteCategory of substituteCategories) {
          const substituteProduct = selectProductForCategory(
            productsByCategory,
            substituteCategory,
            primaryArchetype,
            occasion,
            season,
            weather,
            secondaryArchetype,
            mixFactor,
          );

          if (substituteProduct) {
            outfitProducts.push(substituteProduct);
            selectedCategories.push(substituteCategory);

            // Add the categories that this substitute replaces
            const replacedCategories =
              SUBSTITUTE_CATEGORIES[substituteCategory] || [];
            replacedCategories.forEach((replacedCategory) => {
              if (!selectedCategories.includes(replacedCategory)) {
                selectedCategories.push(replacedCategory);
              }
            });

            console.log(
              `Used ${substituteCategory} as substitute for ${category}`,
            );
            break;
          }
        }
      }

      // If we still don't have this category, add it to fallback list
      if (!selectedCategories.includes(category)) {
        // Find any product that could work as fallback
        const fallbackProduct = products.find(
          (p) => getProductCategory(p) === category,
        );
        if (fallbackProduct) {
          fallbackProducts.push(fallbackProduct);
        }
      }
    }
  }

  // Then, add optional categories until we reach the max items
  // Prioritize seasonal categories if specified
  let optionalCategories = [...outfitStructure.optionalCategories];

  // Prioritize seasonal categories
  if (seasonalAdjustment.priorityCategories) {
    // Move priority categories to the front
    optionalCategories = [
      ...seasonalAdjustment.priorityCategories.filter((c) =>
        optionalCategories.includes(c),
      ),
      ...optionalCategories.filter(
        (c) => !seasonalAdjustment.priorityCategories?.includes(c),
      ),
    ];
  }

  // Randomize optional categories based on variation level
  optionalCategories = optionalCategories.filter(
    () => Math.random() < variation.optionalCategoryProbability,
  );

  for (const category of optionalCategories) {
    // Skip if we already have this category or if we've reached the max items
    if (
      selectedCategories.includes(category) ||
      outfitProducts.length >= outfitStructure.maxItems
    ) {
      continue;
    }

    // Try to get a product for this category
    const selectedProduct = selectProductForCategory(
      productsByCategory,
      category,
      primaryArchetype,
      occasion,
      season,
      weather,
      secondaryArchetype,
      mixFactor,
    );

    if (selectedProduct) {
      outfitProducts.push(selectedProduct);
      selectedCategories.push(category);
    }
  }

  // Calculate completeness score
  const requiredCategoriesCount = outfitStructure.requiredCategories.length;
  const fulfilledRequiredCategories = outfitStructure.requiredCategories.filter(
    (category) => selectedCategories.includes(category),
  ).length;

  const completeness = Math.round(
    (fulfilledRequiredCategories / requiredCategoriesCount) * 100,
  );

  // Check if we have enough products for a valid outfit
  // We need at least the minimum number of items specified in the structure
  // and meet the minimum completeness requirement
  if (
    outfitProducts.length < outfitStructure.minItems ||
    (enforceCompletion && completeness < minCompleteness)
  ) {
    console.warn(
      `Niet genoeg producten voor een complete ${primaryArchetype} outfit: ${outfitProducts.length}/${outfitStructure.minItems} items, completeness: ${completeness}%`,
    );

    // If we have fallback products and we're not enforcing completion, add them
    if (fallbackProducts.length > 0 && !enforceCompletion) {
      console.log(
        `Adding ${fallbackProducts.length} fallback products to complete the outfit`,
      );

      // Add fallback products until we reach the minimum
      for (const fallbackProduct of fallbackProducts) {
        if (outfitProducts.length >= outfitStructure.minItems) {
          break;
        }

        outfitProducts.push(fallbackProduct);
        const category = getProductCategory(fallbackProduct);
        if (!selectedCategories.includes(category)) {
          selectedCategories.push(category);
        }
      }

      // Recalculate completeness
      const newFulfilledRequired = outfitStructure.requiredCategories.filter(
        (category) => selectedCategories.includes(category),
      ).length;

      const newCompleteness = Math.round(
        (newFulfilledRequired / requiredCategoriesCount) * 100,
      );

      if (
        outfitProducts.length < outfitStructure.minItems ||
        newCompleteness < minCompleteness
      ) {
        console.warn(
          `Still not enough products after adding fallbacks: ${outfitProducts.length}/${outfitStructure.minItems} items, completeness: ${newCompleteness}%`,
        );
        return null;
      }
    } else {
      return null;
    }
  }

  // Calculate category ratio
  const categoryRatio = calculateCategoryRatio(outfitProducts);

  // Log the final outfit composition
  console.log(
    "Outfit samengesteld met types:",
    outfitProducts.map((p) => p.type || p.category),
  );
  console.log("Outfit structure categories:", selectedCategories);
  console.log("Outfit completeness:", completeness + "%");
  console.log("Outfit category ratio:", categoryRatio);

  // Calculate average match score
  const totalScore = outfitProducts.reduce(
    (sum, product) => sum + (product.matchScore || 0),
    0,
  );
  const averageScore = totalScore / outfitProducts.length;
  const matchPercentage = Math.min(Math.round(averageScore * 20), 100); // Convert to percentage, max 100%

  // Generate tags based on archetypes and occasion
  const tags = generateTags(
    primaryArchetype,
    occasion,
    season,
    secondaryArchetype,
    mixFactor,
  );

  // Generate a unique ID
  const outfitId = `outfit-${primaryArchetype}-${occasion}-${Date.now().toString(36)}`;

  // Generate outfit title
  const title = generateOutfitTitle(
    primaryArchetype,
    occasion,
    outfitProducts,
    secondaryArchetype,
    mixFactor,
  );

  // Generate outfit description
  const description = generateOutfitDescription(
    primaryArchetype,
    occasion,
    outfitProducts,
    secondaryArchetype,
    mixFactor,
  );

  // Generate explanation using the explainOutfit module
  const explanation = generateOutfitExplanation(
    {
      id: outfitId,
      title,
      description,
      archetype: primaryArchetype,
      secondaryArchetype,
      mixFactor,
      occasion,
      products: outfitProducts,
      tags,
      matchPercentage,
      explanation: "", // This will be filled by the function
      season,
      structure: selectedCategories, // Add the structure to the outfit
      weather, // Add weather to the outfit
      categoryRatio, // Add category ratio
      completeness, // Add completeness score
    },
    primaryArchetype,
    occasion,
  );

  // Use the first product's image as the outfit image
  const imageUrl = outfitProducts[0]?.imageUrl;

  return {
    id: outfitId,
    title,
    description,
    archetype: primaryArchetype,
    secondaryArchetype,
    mixFactor,
    occasion,
    products: outfitProducts,
    imageUrl,
    tags,
    matchPercentage,
    explanation,
    season,
    structure: selectedCategories, // Add the structure to the outfit
    weather, // Add weather to the outfit
    categoryRatio, // Add category ratio
    completeness, // Add completeness score
  };
}

/**
 * Calculates the category ratio for an outfit
 * @param products - Products in the outfit
 * @returns Category ratio object
 */
function calculateCategoryRatio(products: Product[]): CategoryRatio {
  // Initialize ratio with zeros
  const ratio: CategoryRatio = {
    top: 0,
    bottom: 0,
    footwear: 0,
    accessory: 0,
    outerwear: 0,
    dress: 0,
    jumpsuit: 0,
    other: 0,
  };

  // Count products in each category
  products.forEach((product) => {
    const category = getProductCategory(product);
    ratio[category] += 1;
  });

  // Convert counts to percentages
  const total = products.length;
  Object.keys(ratio).forEach((key) => {
    ratio[key as keyof CategoryRatio] = Math.round(
      (ratio[key as keyof CategoryRatio] / total) * 100,
    );
  });

  return ratio;
}

/**
 * Groups products by their category
 */
function groupProductsByCategory(
  products: Product[],
): Record<ProductCategory, Product[]> {
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
    const category = getProductCategory(product);
    result[category].push(product);
  });

  return result;
}

/**
 * Selects the best product from a category based on archetypes, occasion, and season
 * Implements the 70/30 hybrid archetype logic
 */
function selectProductForCategory(
  productsByCategory: Record<ProductCategory, Product[]>,
  category: ProductCategory,
  primaryArchetype: string,
  occasion: string,
  season: Season,
  weather: Weather,
  secondaryArchetype?: string,
  mixFactor: number = 0.3,
): Product | null {
  const products = productsByCategory[category];

  if (!products || products.length === 0) {
    return null;
  }

  // First, prioritize products that match the current season
  const seasonalProducts = products.filter(
    (product) => !product.season || product.season.includes(season),
  );

  // Further filter by weather if applicable
  const weatherFilteredProducts = weather
    ? seasonalProducts.filter((product) =>
        isProductSuitableForWeather(product, weather),
      )
    : seasonalProducts;

  // If we have weather-filtered products, use those; otherwise fall back to seasonal products
  // If we don't have enough seasonal products, fall back to all products
  const productsToUse =
    weatherFilteredProducts.length > 0
      ? weatherFilteredProducts
      : seasonalProducts.length > 0
        ? seasonalProducts
        : products;

  // If we don't have a secondary archetype or it's the same as primary, just sort by match score
  if (
    !secondaryArchetype ||
    secondaryArchetype === primaryArchetype ||
    mixFactor <= 0
  ) {
    // Sort products by match score
    const sortedProducts = [...productsToUse].sort(
      (a, b) => (b.matchScore || 0) - (a.matchScore || 0),
    );

    // Return the best matching product
    return sortedProducts[0] || null;
  }

  // Implement 70/30 hybrid archetype logic
  // We'll score products based on how well they match both archetypes
  const scoredProducts = productsToUse.map((product) => {
    // Get style tags for the product
    const styleTags = product.styleTags || [];

    // Calculate primary and secondary scores based on style tags
    const primaryScore = calculateArchetypeStyleScore(
      styleTags,
      primaryArchetype,
    );
    const secondaryScore = calculateArchetypeStyleScore(
      styleTags,
      secondaryArchetype,
    );

    // Calculate combined score with 70/30 weighting
    const combinedScore =
      primaryScore * (1 - mixFactor) + secondaryScore * mixFactor;

    return {
      product,
      combinedScore,
      primaryScore,
      secondaryScore,
    };
  });

  // Sort by combined score
  scoredProducts.sort((a, b) => b.combinedScore - a.combinedScore);

  // Log the top product's scores
  if (scoredProducts.length > 0) {
    const top = scoredProducts[0];
    if (top) {
      console.log(
        `Selected ${category} product: ${top.product.name} - Primary ${top.primaryScore.toFixed(2)} - Secondary ${top.secondaryScore.toFixed(2)} - Combined ${top.combinedScore.toFixed(2)}`,
      );
    }
  }

  // Return the product with the highest combined score
  return scoredProducts[0]?.product || null;
}

/**
 * Calculates how well a product's style tags match an archetype
 */
function calculateArchetypeStyleScore(
  styleTags: string[],
  archetype: string,
): number {
  // Define style tags that match each archetype
  const archetypeStyleTags: Record<string, string[]> = {
    klassiek: [
      "elegant",
      "tijdloos",
      "verfijnd",
      "klassiek",
      "sophisticated",
      "formal",
      "minimalist",
    ],
    casual_chic: [
      "relaxed",
      "comfortable",
      "effortless",
      "modern",
      "versatile",
      "casual",
      "minimalist",
    ],
    urban: [
      "functional",
      "practical",
      "edgy",
      "modern",
      "city",
      "sporty",
      "casual",
    ],
    streetstyle: [
      "trendy",
      "bold",
      "authentic",
      "creative",
      "expressive",
      "sporty",
      "casual",
    ],
    retro: ["vintage", "nostalgic", "unique", "timeless", "classic", "vintage"],
    luxury: [
      "premium",
      "exclusive",
      "sophisticated",
      "quality",
      "refined",
      "formal",
      "minimalist",
    ],
  };

  // Get the style tags for this archetype
  const archetypeTags = archetypeStyleTags[archetype] || [];

  // Count how many of the product's style tags match the archetype
  const matchingTags = styleTags.filter((tag) => archetypeTags.includes(tag));

  // Calculate score based on percentage of matching tags
  return styleTags.length > 0 ? matchingTags.length / styleTags.length : 0;
}

/**
 * Generates tags for an outfit based on archetypes, occasion, and season
 */
function generateTags(
  primaryArchetype: string,
  occasion: string,
  season: Season,
  secondaryArchetype?: string,
  mixFactor: number = 0.3,
): string[] {
  const archetypeTags: Record<string, string[]> = {
    klassiek: ["elegant", "tijdloos", "verfijnd", "klassiek"],
    casual_chic: ["relaxed", "comfortable", "effortless", "modern"],
    urban: ["functional", "practical", "edgy", "modern"],
    streetstyle: ["trendy", "bold", "authentic", "creative"],
    retro: ["vintage", "nostalgic", "unique", "timeless"],
    luxury: ["premium", "exclusive", "sophisticated", "quality"],
  };

  const occasionTags: Record<string, string[]> = {
    Werk: ["professional", "office", "business"],
    Formeel: ["formal", "elegant", "sophisticated"],
    Casual: ["everyday", "comfortable", "relaxed"],
    Weekend: ["relaxed", "comfortable", "versatile"],
    Lunch: ["smart-casual", "stylish", "comfortable"],
    Stad: ["urban", "practical", "stylish"],
    Actief: ["functional", "comfortable", "practical"],
    Uitgaan: ["statement", "eye-catching", "trendy"],
    Festival: ["bold", "expressive", "comfortable"],
    Creatief: ["unique", "expressive", "artistic"],
    Gala: ["luxurious", "statement", "elegant"],
    "Speciale gelegenheid": ["special", "memorable", "elegant"],
    "Zakelijk diner": ["smart", "elegant", "professional"],
  };

  const seasonTags: Record<Season, string[]> = {
    spring: ["spring", "lente", "fresh", "light"],
    summer: ["summer", "zomer", "light", "breathable"],
    autumn: ["autumn", "herfst", "layered", "cozy"],
    winter: ["winter", "warm", "cozy", "layered"],
  };

  // Add completeness tag
  const completenessTags = ["complete", "balanced", "well-rounded"];

  // Get primary archetype tags
  const primaryTags = archetypeTags[primaryArchetype] || [];

  // Get secondary archetype tags if applicable
  let secondaryTags: string[] = [];
  if (
    secondaryArchetype &&
    secondaryArchetype !== primaryArchetype &&
    mixFactor > 0
  ) {
    secondaryTags = archetypeTags[secondaryArchetype] || [];
  }

  // Calculate how many tags to take from each archetype
  const totalArchetypeTags = 4; // Target total archetype tags
  const primaryCount = Math.round(totalArchetypeTags * (1 - mixFactor));
  const secondaryCount = totalArchetypeTags - primaryCount;

  // Combine tags from archetypes, occasion, and season
  const rawTags = [
    ...primaryTags.slice(0, primaryCount),
    ...secondaryTags
      .filter((tag) => !primaryTags.includes(tag)) // Ensure uniqueness
      .slice(0, secondaryCount),
    ...(occasionTags[occasion] ?? []),
    ...(seasonTags[season] ?? []),
    completenessTags[Math.floor(Math.random() * completenessTags.length)],
  ];

  // Filter strings and remove duplicates
  const combinedTags = rawTags.filter(
    (t): t is string => typeof t === "string",
  );
  return Array.from(new Set(combinedTags));
}

export default generateOutfits;
