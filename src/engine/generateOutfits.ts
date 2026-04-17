import { Product, Outfit, Season, ProductCategory, OutfitGenerationOptions, Weather, CategoryRatio, VariationLevel } from './types';
import { generateOutfitTitle, generateOutfitDescription } from './generateOutfitDescriptions';
import { generateOutfitExplanation } from './explainOutfit';
import { filterProductsByColorSeason } from './colorSeasonFiltering';
import { calculateOutfitColorHarmony } from './colorHarmony';
import { calculateProductFormality, OCCASION_RULES } from './occasionMatching';
import { fusionScore, normalizeWeights, scoreProductAgainstArchetype } from './archetypeFusion';
import { type ArchetypeKey, ARCHETYPES } from '@/config/archetypes';
import type { ArchetypeWeights, ProductLike } from '@/types/style';
import type { ColorProfile } from '@/lib/quiz/types';
import { enrichProduct, deriveAthleticIntent, type EnrichedSignals } from './productEnricher';
import {
  getCurrentSeason,
  getProductCategory,
  isProductSuitableForWeather,
  getTypicalWeatherForSeason
} from './helpers';
import { classifyProduct } from './productClassifier';

// Maps all archetype string variants (from quiz, from profile-mapping, from archetypeDetector)
// to the canonical ARCHETYPES config keys
const ARCHETYPE_KEY_MAP: Record<string, ArchetypeKey> = {
  // From archetypeDetector.ts output
  MINIMALIST: 'MINIMALIST',
  CLASSIC: 'CLASSIC',
  SMART_CASUAL: 'SMART_CASUAL',
  STREETWEAR: 'STREETWEAR',
  ATHLETIC: 'ATHLETIC',
  AVANT_GARDE: 'AVANT_GARDE',
  BUSINESS: 'BUSINESS',
  // From old profile-mapping / generateOutfits internal keys (legacy)
  minimalist: 'MINIMALIST',
  klassiek: 'CLASSIC',
  classic: 'CLASSIC',
  smart_casual: 'SMART_CASUAL',
  'smart-casual': 'SMART_CASUAL',
  casual_chic: 'SMART_CASUAL',
  urban: 'STREETWEAR',
  streetstyle: 'STREETWEAR',
  streetwear: 'STREETWEAR',
  athletic: 'ATHLETIC',
  sporty: 'ATHLETIC',
  avant_garde: 'AVANT_GARDE',
  avantgarde: 'AVANT_GARDE',
  retro: 'AVANT_GARDE',
  bohemian: 'AVANT_GARDE',
  luxury: 'CLASSIC',
  business: 'BUSINESS',
  zakelijk: 'BUSINESS',
  formal: 'BUSINESS',
  tailored: 'BUSINESS',
};

function resolveArchetypeKey(raw: string): ArchetypeKey {
  return ARCHETYPE_KEY_MAP[raw] ?? ARCHETYPE_KEY_MAP[raw.toLowerCase()] ?? 'SMART_CASUAL';
}

function toProductLike(p: Product): ProductLike {
  const enriched = enrichProduct(p);
  const s = enriched._signals;

  return {
    id: p.id,
    title: p.name,
    brand: p.brand,
    category: p.category,
    colorTags: s.colorTags,
    materialTags: s.materialTags,
    silhouetteTags: s.silhouetteTags,
    formality: enriched.formality,
    price: p.price,
    style: (p as any).style,
  };
}

const OCCASION_KEY_MAP: Record<string, string> = {
  office: 'Werk',
  smartcasual: 'Smart Casual',
  leisure: 'Weekend',
  werk: 'Werk',
  casual: 'Dagelijks',
  weekend: 'Weekend',
  avond: 'Avond uit',
  sport: 'Actief',
  date: 'Date',
  relaxed: 'Relaxed',
  smart: 'Smart Casual',
};

/**
 * Essential categories that every outfit should have
 */
const REQUIRED_CATEGORIES = [
  ProductCategory.TOP,
  ProductCategory.BOTTOM,
  ProductCategory.FOOTWEAR
];

/**
 * Optional categories that enhance an outfit
 */
const OPTIONAL_CATEGORIES = [
  ProductCategory.ACCESSORY,
  ProductCategory.OUTERWEAR
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
  [ProductCategory.OTHER]: []
};

/**
 * Outfit structure blueprints for each archetype
 */
const BASE_STRUCTURE = {
  requiredCategories: [ProductCategory.TOP, ProductCategory.BOTTOM, ProductCategory.FOOTWEAR],
  optionalCategories: [ProductCategory.OUTERWEAR, ProductCategory.ACCESSORY],
  minItems: 3,
  maxItems: 5,
};

const archetypeOutfitStructures: Record<string, {
  requiredCategories: ProductCategory[];
  optionalCategories: ProductCategory[];
  minItems: number;
  maxItems: number;
  description: string;
}> = {
  'klassiek': { ...BASE_STRUCTURE, description: 'Tijdloze elegantie met verfijnde stukken' },
  'CLASSIC': { ...BASE_STRUCTURE, description: 'Tijdloze elegantie met verfijnde stukken' },
  'casual_chic': { ...BASE_STRUCTURE, optionalCategories: [ProductCategory.ACCESSORY, ProductCategory.OUTERWEAR], description: 'Moeiteloze elegantie met een relaxte twist' },
  'SMART_CASUAL': { ...BASE_STRUCTURE, optionalCategories: [ProductCategory.ACCESSORY, ProductCategory.OUTERWEAR], description: 'Moeiteloze elegantie met een relaxte twist' },
  'minimalist': { ...BASE_STRUCTURE, description: 'Clean en tijdloos met essentiële items' },
  'MINIMALIST': { ...BASE_STRUCTURE, description: 'Clean en tijdloos met essentiële items' },
  'urban': { ...BASE_STRUCTURE, description: 'Functionele stadslook met praktische details' },
  'streetstyle': { ...BASE_STRUCTURE, optionalCategories: [ProductCategory.ACCESSORY, ProductCategory.OUTERWEAR], description: 'Expressieve streetwear met attitude' },
  'STREETWEAR': { ...BASE_STRUCTURE, optionalCategories: [ProductCategory.ACCESSORY, ProductCategory.OUTERWEAR], description: 'Expressieve streetwear met attitude' },
  'athletic': { ...BASE_STRUCTURE, description: 'Functionele sport-geïnspireerde look' },
  'ATHLETIC': { ...BASE_STRUCTURE, description: 'Functionele sport-geïnspireerde look' },
  'retro': { ...BASE_STRUCTURE, optionalCategories: [ProductCategory.ACCESSORY, ProductCategory.OUTERWEAR], description: 'Vintage-geïnspireerde look met nostalgische elementen' },
  'avant_garde': { ...BASE_STRUCTURE, description: 'Conceptuele look met statement pieces' },
  'AVANT_GARDE': { ...BASE_STRUCTURE, description: 'Conceptuele look met statement pieces' },
  'luxury': { ...BASE_STRUCTURE, requiredCategories: [ProductCategory.TOP, ProductCategory.BOTTOM, ProductCategory.FOOTWEAR, ProductCategory.ACCESSORY], minItems: 4, maxItems: 6, description: 'Exclusieve stukken van topkwaliteit' },
  'BUSINESS': { ...BASE_STRUCTURE, requiredCategories: [ProductCategory.TOP, ProductCategory.BOTTOM, ProductCategory.FOOTWEAR], optionalCategories: [ProductCategory.ACCESSORY, ProductCategory.OUTERWEAR], description: 'Getailleerde stukken voor kantoor en formele momenten' },
  'business': { ...BASE_STRUCTURE, requiredCategories: [ProductCategory.TOP, ProductCategory.BOTTOM, ProductCategory.FOOTWEAR], optionalCategories: [ProductCategory.ACCESSORY, ProductCategory.OUTERWEAR], description: 'Getailleerde stukken voor kantoor en formele momenten' },
};

// Default structure for any archetype not explicitly defined
const defaultOutfitStructure = {
  requiredCategories: [
    ProductCategory.TOP,
    ProductCategory.BOTTOM,
    ProductCategory.FOOTWEAR
  ],
  optionalCategories: [
    ProductCategory.ACCESSORY,
    ProductCategory.OUTERWEAR
  ],
  minItems: 3,
  maxItems: 5,
  description: 'Gebalanceerde outfit met essentiële items'
};

// Season-specific outfit adjustments
const seasonalOutfitAdjustments: Record<Season, {
  requiredCategories?: ProductCategory[];
  optionalCategories?: ProductCategory[];
  priorityCategories?: ProductCategory[];
  description: string;
}> = {
  'spring': {
    optionalCategories: [ProductCategory.OUTERWEAR],
    description: 'Lichte laagjes voor veranderlijk lenteweer'
  },
  'summer': {
    // No outerwear required in summer
    priorityCategories: [ProductCategory.TOP, ProductCategory.BOTTOM],
    description: 'Luchtige items voor warme zomerdagen'
  },
  'autumn': {
    requiredCategories: [ProductCategory.OUTERWEAR],
    description: 'Warme laagjes voor koele herfstdagen'
  },
  'winter': {
    requiredCategories: [ProductCategory.OUTERWEAR],
    priorityCategories: [ProductCategory.OUTERWEAR],
    description: 'Warme, isolerende items voor koude winterdagen'
  }
};

/**
 * Variation settings for different levels
 */
const variationSettings: Record<VariationLevel, {
  optionalCategoryProbability: number;
  categoryWeightVariation: number;
  allowSubstitutes: boolean;
}> = {
  'low': {
    optionalCategoryProbability: 0.3,
    categoryWeightVariation: 0.1,
    allowSubstitutes: false
  },
  'medium': {
    optionalCategoryProbability: 0.5,
    categoryWeightVariation: 0.2,
    allowSubstitutes: true
  },
  'high': {
    optionalCategoryProbability: 0.7,
    categoryWeightVariation: 0.3,
    allowSubstitutes: true
  }
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
  options?: OutfitGenerationOptions
): Outfit[] {
  if (!products || !Array.isArray(products) || products.length < 4) {
    console.warn('Not enough products to generate outfits');
    return [];
  }

  const excludeIds = options?.excludeIds || [];
  const rawOccasions = options?.preferredOccasions || [];
  const preferredOccasions = rawOccasions.map(o => OCCASION_KEY_MAP[o.toLowerCase()] ?? o);
  const preferredSeasons = options?.preferredSeasons || [];
  const weather = options?.weather;
  const maxAttempts = options?.maxAttempts || 10;
  const variationLevel = options?.variationLevel || 'medium';
  const enforceCompletion = options?.enforceCompletion !== undefined ? options.enforceCompletion : true;
  const minCompleteness = options?.minCompleteness || 80;
  const fitPreference = options?.fit;
  const printsPreference = options?.prints;
  const goalsPreference = options?.goals || [];
  const comfortPreference = options?.comfort;
  const materialsPreference: string[] = options?.materials || [];
  const colorProfile = options?.colorProfile;
  const budgetPref = options?.budget;
  
  // Log archetype information
  console.log("Generating outfits with archetypes:", 
    secondaryArchetype 
      ? `${primaryArchetype} (${Math.round((1-mixFactor)*100)}%) + ${secondaryArchetype} (${Math.round(mixFactor*100)}%)`
      : primaryArchetype
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
  const currentSeason: Season = (preferredSeasons && preferredSeasons.length > 0 
    ? preferredSeasons[0] 
    : getCurrentSeason()) as Season;
  
  console.log("Active season:", currentSeason);
  
  // Determine weather if not specified
  const activeWeather = weather ?? getTypicalWeatherForSeason(currentSeason);
  console.log("Active weather:", activeWeather);
  
  // Filter products by season
  const seasonalProducts = products.filter(product => 
    !product.season || product.season.includes(currentSeason)
  );
  console.log("Products suitable for season:", seasonalProducts.length);
  
  // Further filter by weather if specified
  let weatherFilteredProducts = seasonalProducts;
  if (weather) {
    weatherFilteredProducts = seasonalProducts.filter(product => 
      isProductSuitableForWeather(product, weather)
    );
    console.log("Products suitable for weather:", weatherFilteredProducts.length);
  }
  
  const basePoolBeforeColor = weatherFilteredProducts.length >= 4
    ? weatherFilteredProducts
    : seasonalProducts.length >= 4
      ? seasonalProducts
      : products;

  if (weatherFilteredProducts.length < 4 && seasonalProducts.length >= 4) {
    console.warn(`Not enough products for ${activeWeather} weather, falling back to seasonal products`);
  } else if (seasonalProducts.length < 4) {
    console.warn(`Not enough products for season ${currentSeason}, falling back to all products`);
  }

  let colorFilteredProducts = basePoolBeforeColor;
  if (colorProfile) {
    const colorFiltered = filterProductsByColorSeason(basePoolBeforeColor, colorProfile, false);
    if (colorFiltered.length >= 4) {
      colorFilteredProducts = colorFiltered;
      console.log(`[colorSeason] Filtered to ${colorFiltered.length} color-compatible products`);
    } else {
      console.warn(`[colorSeason] Too few color-compatible products (${colorFiltered.length}), using full pool`);
    }
  }

  let productsToUse = colorFilteredProducts;

  // Prints: hard filter — remove printed items when user prefers plain
  if (printsPreference === 'effen' || printsPreference === 'geen') {
    const PRINT_KEYWORDS = ['printed', 'pattern', 'graphic', 'floral', 'stripe', 'stripes', 'checked', 'plaid', 'animal print'];
    const effeFiltered = productsToUse.filter(p => {
      const searchable = [
        ...(p.styleTags || []),
        p.type || '',
        p.description || '',
        p.name || '',
      ].join(' ').toLowerCase();
      return !PRINT_KEYWORDS.some(kw => searchable.includes(kw));
    });
    if (effeFiltered.length >= 4) {
      productsToUse = effeFiltered;
      console.log(`[prints] Hard-filtered to ${effeFiltered.length} plain products`);
    }
  } else if (printsPreference === 'statement') {
    // For statement preference, give printed products priority by moving them to the front
    const printedFirst = [...productsToUse].sort((a, b) => {
      const PRINT_KW = ['printed', 'pattern', 'graphic', 'floral', 'stripe', 'bold'];
      const aHasPrint = PRINT_KW.some(kw => (a.styleTags || []).join(' ').toLowerCase().includes(kw));
      const bHasPrint = PRINT_KW.some(kw => (b.styleTags || []).join(' ').toLowerCase().includes(kw));
      return (bHasPrint ? 1 : 0) - (aHasPrint ? 1 : 0);
    });
    productsToUse = printedFirst;
    console.log(`[prints] Prioritised statement prints`);
  }

  // Materials: soft boost — sort preferred materials to the top of each category pool
  // This works as a preference signal even when products lack explicit materialTags
  if (materialsPreference.length > 0) {
    const normPrefs = materialsPreference.map(m => m.toLowerCase());
    productsToUse = [...productsToUse].sort((a, b) => {
      const getMatScore = (p: Product) => {
        const pl = toProductLike(p);
        const mtags = pl.materialTags || [];
        return normPrefs.some(m => mtags.includes(m)) ? 1 : 0;
      };
      return getMatScore(b) - getMatScore(a);
    });
    console.log(`[materials] Re-sorted pool to prefer: ${normPrefs.join(', ')}`);
  }

  // Define occasions based on archetype and preferred occasions
  let occasions = getOccasionsForArchetype(primaryArchetype);
  
  // If preferred occasions are specified and valid, prioritize them
  if (preferredOccasions && preferredOccasions.length > 0) {
    // Filter to only valid occasions
    const validPreferredOccasions = preferredOccasions.filter(occ => 
      occasions.includes(occ)
    );
    
    if (validPreferredOccasions.length > 0) {
      // Use preferred occasions first, then add others to reach the count
      occasions = [
        ...validPreferredOccasions,
        ...occasions.filter(occ => !validPreferredOccasions.includes(occ))
      ];
      
      console.log("Using preferred occasions:", validPreferredOccasions);
    }
  }
  
  const outfits: Outfit[] = [];
  const attemptsPerOccasion: Record<string, number> = {};
  const usedProductIds = new Set<string>();
  const usedBrandsGlobal = new Set<string>();

  while (occasions.length < count) {
    occasions.push(...getOccasionsForArchetype(primaryArchetype));
  }

  for (let i = 0; i < count; i++) {
    const occ = occasions[i % occasions.length] ?? 'Casual';
    attemptsPerOccasion[occ] = attemptsPerOccasion[occ] ?? 0;

    let outfit: Outfit | null = null;
    let attempts = 0;

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
        fitPreference,
        goalsPreference,
        comfortPreference,
        usedProductIds,
        usedBrandsGlobal,
        materialsPreference,
        printsPreference,
        colorProfile,
        budgetPref,
      );

      if (generatedOutfit && !excludeIds.includes(generatedOutfit.id)) {
        outfit = generatedOutfit;
      }
    }

    if (outfit) {
      outfit.products.forEach(p => {
        usedProductIds.add(p.id);
        if (p.brand) usedBrandsGlobal.add(p.brand.toLowerCase());
      });
      outfits.push(outfit);
    } else {
      console.warn(`Failed to generate unique outfit for occasion ${occ} after ${attempts} attempts`);
    }
  }

  // Log generation attempts
  console.log("Outfit generation attempts:", attemptsPerOccasion);
  console.log("Generated outfits:", outfits.length);

  return outfits;
}

function getOccasionsForArchetype(archetype: string): string[] {
  const occasionMap: Record<string, string[]> = {
    'klassiek': ['Werk', 'Smart Casual', 'Avond uit', 'Date', 'Weekend', 'Dagelijks'],
    'CLASSIC': ['Werk', 'Smart Casual', 'Avond uit', 'Date', 'Weekend', 'Dagelijks'],
    'casual_chic': ['Dagelijks', 'Weekend', 'Date', 'Werk', 'Avond uit', 'Relaxed'],
    'SMART_CASUAL': ['Dagelijks', 'Weekend', 'Date', 'Werk', 'Avond uit', 'Relaxed'],
    'minimalist': ['Dagelijks', 'Werk', 'Weekend', 'Smart Casual', 'Date', 'Relaxed'],
    'MINIMALIST': ['Dagelijks', 'Werk', 'Weekend', 'Smart Casual', 'Date', 'Relaxed'],
    'urban': ['Weekend', 'Dagelijks', 'Avond uit', 'Date', 'Relaxed'],
    'streetstyle': ['Weekend', 'Avond uit', 'Dagelijks', 'Date', 'Relaxed'],
    'STREETWEAR': ['Weekend', 'Avond uit', 'Dagelijks', 'Date', 'Relaxed'],
    'athletic': ['Actief', 'Dagelijks', 'Weekend', 'Relaxed'],
    'ATHLETIC': ['Actief', 'Dagelijks', 'Weekend', 'Relaxed'],
    'retro': ['Dagelijks', 'Weekend', 'Avond uit', 'Date', 'Relaxed'],
    'avant_garde': ['Avond uit', 'Date', 'Weekend', 'Dagelijks', 'Smart Casual'],
    'AVANT_GARDE': ['Avond uit', 'Date', 'Weekend', 'Dagelijks', 'Smart Casual'],
    'luxury': ['Avond uit', 'Smart Casual', 'Date', 'Werk', 'Weekend'],
    'BUSINESS': ['Werk', 'Formeel', 'Smart Casual', 'Date', 'Dagelijks'],
    'business': ['Werk', 'Formeel', 'Smart Casual', 'Date', 'Dagelijks'],
  };

  return occasionMap[archetype] || ['Dagelijks', 'Werk', 'Weekend', 'Date', 'Relaxed'];
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
  variationLevel: VariationLevel = 'medium',
  enforceCompletion: boolean = true,
  minCompleteness: number = 80,
  fitPreference?: string,
  goalsPreference: string[] = [],
  comfortPreference?: string,
  usedProductIds?: Set<string>,
  usedBrandsGlobal?: Set<string>,
  materialsPreference: string[] = [],
  printsPreference?: string,
  colorProfile?: ColorProfile,
  budgetPref?: { min: number; max: number },
): Outfit | null {
  // Log outfit generation
  console.log("Outfit op basis van:", primaryArchetype, secondaryArchetype ? "+" : "", secondaryArchetype || "");
  console.log("Season:", season, "Weather:", weather);
  console.log("Variation level:", variationLevel);

  // Get variation settings
  const variation = variationSettings[variationLevel];

  // Group products by category
  const productsByCategory = groupProductsByCategory(products);
  
  // Log available categories and counts
  console.log("Beschikbare productcategorieën:", 
    Object.entries(productsByCategory)
      .map(([category, prods]) => `${category}: ${prods.length}`)
      .join(', ')
  );
  
  // Get the outfit structure for the primary archetype
  const baseOutfitStructure = archetypeOutfitStructures[primaryArchetype] || defaultOutfitStructure;
  
  // Apply seasonal adjustments to the structure
  const seasonalAdjustment = seasonalOutfitAdjustments[season] || { description: 'Seizoensgeschikte items' };
  
  // Create a copy of the base structure to modify
  const outfitStructure = {
    ...baseOutfitStructure,
    requiredCategories: [...baseOutfitStructure.requiredCategories],
    optionalCategories: [...baseOutfitStructure.optionalCategories]
  };
  
  // Add seasonal required categories if not already included
  if (seasonalAdjustment.requiredCategories) {
    seasonalAdjustment.requiredCategories.forEach(category => {
      if (!outfitStructure.requiredCategories.includes(category) && 
          !outfitStructure.optionalCategories.includes(category)) {
        outfitStructure.requiredCategories.push(category);
      } else if (outfitStructure.optionalCategories.includes(category)) {
        // Move from optional to required
        outfitStructure.optionalCategories = outfitStructure.optionalCategories.filter(c => c !== category);
        if (!outfitStructure.requiredCategories.includes(category)) {
          outfitStructure.requiredCategories.push(category);
        }
      }
    });
  }
  
  console.log(`Using outfit structure for ${primaryArchetype} in ${season}:`, 
    `Required: [${outfitStructure.requiredCategories.join(', ')}], ` +
    `Optional: [${outfitStructure.optionalCategories.join(', ')}]`
  );
  
  const outfitProducts: Product[] = [];
  const selectedCategories: ProductCategory[] = [];
  const fallbackProducts: Product[] = [];
  const outfitBrands = new Set<string>(usedBrandsGlobal || []);

  for (const category of outfitStructure.requiredCategories) {
    if (selectedCategories.includes(category)) continue;

    const selectedProduct = selectProductForCategory(
      productsByCategory,
      category,
      primaryArchetype,
      occasion,
      season,
      weather,
      secondaryArchetype,
      mixFactor,
      fitPreference,
      goalsPreference,
      comfortPreference,
      usedProductIds,
      outfitBrands,
      budgetPref,
      materialsPreference,
      printsPreference,
    );

    if (selectedProduct) {
      outfitProducts.push(selectedProduct);
      selectedCategories.push(category);
      if (selectedProduct.brand) outfitBrands.add(selectedProduct.brand.toLowerCase());
    } else {
      console.warn(`Geen product gevonden voor vereiste categorie ${category}`);

      // For tops and bottoms, check if we have a dress or jumpsuit as a substitute
      if ((category === ProductCategory.TOP || category === ProductCategory.BOTTOM) &&
          !selectedCategories.includes(ProductCategory.DRESS) &&
          !selectedCategories.includes(ProductCategory.JUMPSUIT) &&
          variation.allowSubstitutes) {

        const substituteCategories = [ProductCategory.DRESS, ProductCategory.JUMPSUIT];

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
            fitPreference,
            goalsPreference,
            comfortPreference,
            usedProductIds,
            outfitBrands,
            undefined,
            materialsPreference,
            printsPreference,
          );

          if (substituteProduct) {
            outfitProducts.push(substituteProduct);
            selectedCategories.push(substituteCategory);

            const replacedCategories = SUBSTITUTE_CATEGORIES[substituteCategory] || [];
            replacedCategories.forEach(replacedCategory => {
              if (!selectedCategories.includes(replacedCategory)) {
                selectedCategories.push(replacedCategory);
              }
            });

            console.log(`Used ${substituteCategory} as substitute for ${category}`);
            break;
          }
        }
      }

      if (!selectedCategories.includes(category)) {
        const fallbackProduct = products.find(p => getProductCategory(p) === category);
        if (fallbackProduct) fallbackProducts.push(fallbackProduct);
      }
    }
  }

  // Then add optional categories
  let optionalCategories = [...outfitStructure.optionalCategories];

  if (seasonalAdjustment.priorityCategories) {
    optionalCategories = [
      ...seasonalAdjustment.priorityCategories.filter(c => optionalCategories.includes(c)),
      ...optionalCategories.filter(c => !seasonalAdjustment.priorityCategories?.includes(c))
    ];
  }

  optionalCategories = optionalCategories.filter(() =>
    Math.random() < variation.optionalCategoryProbability
  );

  for (const category of optionalCategories) {
    if (selectedCategories.includes(category) || outfitProducts.length >= outfitStructure.maxItems) continue;

    const selectedProduct = selectProductForCategory(
      productsByCategory,
      category,
      primaryArchetype,
      occasion,
      season,
      weather,
      secondaryArchetype,
      mixFactor,
      fitPreference,
      goalsPreference,
      comfortPreference,
      usedProductIds,
      outfitBrands,
      budgetPref,
      materialsPreference,
      printsPreference,
    );

    if (selectedProduct) {
      outfitProducts.push(selectedProduct);
      selectedCategories.push(category);
      if (selectedProduct.brand) outfitBrands.add(selectedProduct.brand.toLowerCase());
    }
  }

  // Calculate completeness score
  const requiredCategoriesCount = outfitStructure.requiredCategories.length;
  const fulfilledRequiredCategories = outfitStructure.requiredCategories.filter(
    category => selectedCategories.includes(category)
  ).length;

  const completeness = Math.round((fulfilledRequiredCategories / requiredCategoriesCount) * 100);

  // Check if we have enough products for a valid outfit
  if (outfitProducts.length < outfitStructure.minItems ||
      (enforceCompletion && completeness < minCompleteness)) {
    console.warn(`Niet genoeg producten voor een complete ${primaryArchetype} outfit: ${outfitProducts.length}/${outfitStructure.minItems} items, completeness: ${completeness}%`);

    // If we have fallback products and we're not enforcing completion, add them
    // NOTE: fallback products are only added if they are valid wearable items
    if (fallbackProducts.length > 0 && !enforceCompletion) {
      console.log(`Adding ${fallbackProducts.length} fallback products to complete the outfit`);

      for (const fallbackProduct of fallbackProducts) {
        if (outfitProducts.length >= outfitStructure.minItems) break;
        const fallbackCat = getProductCategory(fallbackProduct);
        // Never use OTHER products as fallbacks
        if (fallbackCat === ProductCategory.OTHER) continue;
        outfitProducts.push(fallbackProduct);
        if (!selectedCategories.includes(fallbackCat)) {
          selectedCategories.push(fallbackCat);
        }
      }

      // Recalculate completeness
      const newFulfilledRequired = outfitStructure.requiredCategories.filter(
        category => selectedCategories.includes(category)
      ).length;

      const newCompleteness = Math.round((newFulfilledRequired / requiredCategoriesCount) * 100);

      if (outfitProducts.length < outfitStructure.minItems || newCompleteness < minCompleteness) {
        console.warn(`Still not enough products after adding fallbacks: ${outfitProducts.length}/${outfitStructure.minItems} items, completeness: ${newCompleteness}%`);
        return null;
      }
    } else {
      return null;
    }
  }

  // Final structural sanity check: every outfit MUST have at least something to wear
  // on the upper body (top / dress / jumpsuit) AND footwear. Without this the outfit
  // makes no sense regardless of completeness score.
  const hasUpperBody = selectedCategories.some(c =>
    c === ProductCategory.TOP ||
    c === ProductCategory.DRESS ||
    c === ProductCategory.JUMPSUIT
  );
  const hasFootwear = selectedCategories.includes(ProductCategory.FOOTWEAR);

  if (!hasUpperBody || !hasFootwear) {
    console.warn(`Outfit afgewezen: ontbrekende bovenkleding (${hasUpperBody}) of schoeisel (${hasFootwear})`);
    return null;
  }

  const productColorArrays = outfitProducts.map(p => {
    const dbColors: string[] = [];
    if (Array.isArray(p.colors)) dbColors.push(...p.colors);
    else if (p.color) dbColors.push(p.color);
    if (dbColors.length > 0) return dbColors;
    return enrichProduct(p)._signals.colorTags;
  });
  const colorHarmonyScore = calculateOutfitColorHarmony(productColorArrays);
  const MIN_COLOR_HARMONY = 0.5;
  if (colorHarmonyScore < MIN_COLOR_HARMONY) {
    console.warn(`Outfit afgewezen wegens kleurconflict (harmony score: ${colorHarmonyScore.toFixed(2)})`);
    return null;
  }

  const canonicalOccasion = (() => {
    const o = occasion.toLowerCase();
    if (o.includes('werk') || o.includes('kantoor') || o.includes('office')) return 'work';
    if (o.includes('formeel') || o.includes('gala') || o.includes('formal')) return 'formal';
    if (o.includes('sport') || o.includes('actief')) return 'sports';
    if (o.includes('date') || o.includes('diner')) return 'date';
    if (o.includes('feest') || o.includes('uitgaan') || o.includes('party')) return 'party';
    if (o.includes('reis') || o.includes('travel')) return 'travel';
    return 'casual';
  })() as keyof typeof OCCASION_RULES;

  const occasionRule = OCCASION_RULES[canonicalOccasion];
  if (occasionRule) {
    const avgFormality =
      outfitProducts.reduce((sum, p) => sum + enrichProduct(p).formality, 0) / outfitProducts.length;

    const formalityGap = occasionRule.requiredFormality - avgFormality;
    if (formalityGap > 0.2) {
      console.warn(`Outfit afgewezen: te informeel voor ${canonicalOccasion} (formality ${avgFormality.toFixed(2)} vs required ${occasionRule.requiredFormality})`);
      return null;
    }

    const overFormal = avgFormality - occasionRule.requiredFormality;
    if (overFormal > 0.35) {
      console.warn(`Outfit afgewezen: te formeel voor ${canonicalOccasion} (formality ${avgFormality.toFixed(2)} vs required ${occasionRule.requiredFormality})`);
      return null;
    }

    if (occasionRule.avoidStyles) {
      const outfitTagString = outfitProducts.flatMap(p => p.styleTags || []).join(' ').toLowerCase();
      const hasAvoidedStyle = occasionRule.avoidStyles.some(style =>
        outfitTagString.includes(style.toLowerCase())
      );
      if (hasAvoidedStyle) {
        console.warn(`Outfit afgewezen: bevat verboden stijl voor ${canonicalOccasion}`);
        return null;
      }
    }
  }

  const formalities = outfitProducts.map(p => enrichProduct(p).formality);
  const maxF = Math.max(...formalities);
  const minF = Math.min(...formalities);
  if (maxF - minF > 0.3) {
    console.warn(`Outfit afgewezen: inconsistente formaliteit (spread ${(maxF - minF).toFixed(2)})`);
    return null;
  }
  
  // Calculate category ratio
  const categoryRatio = calculateCategoryRatio(outfitProducts);
  
  // Log the final outfit composition
  console.log("Outfit samengesteld met types:", outfitProducts.map(p => p.type || p.category));
  console.log("Outfit structure categories:", selectedCategories);
  console.log("Outfit completeness:", completeness + "%");
  console.log("Outfit category ratio:", categoryRatio);
  
  const primaryKey = resolveArchetypeKey(primaryArchetype);
  const outfitMix: ArchetypeWeights = { [primaryKey]: 1 - (mixFactor ?? 0) };
  if (secondaryArchetype) {
    const secKey = resolveArchetypeKey(secondaryArchetype);
    outfitMix[secKey] = (outfitMix[secKey] ?? 0) + (mixFactor ?? 0);
  }
  const fusionScores = outfitProducts.map(p => {
    const pl = toProductLike(p);
    return fusionScore(pl, outfitMix).totalScore;
  });
  const avgFusion = fusionScores.reduce((a, b) => a + b, 0) / fusionScores.length;

  // Style coherence check: penalize outfits with clashing archetypes
  const ALL_ARCHETYPE_KEYS: ArchetypeKey[] = Object.keys(ARCHETYPES) as ArchetypeKey[];
  const itemPrimaryArchetypes = outfitProducts.map(p => {
    const pl = toProductLike(p);
    let bestKey: ArchetypeKey = 'SMART_CASUAL';
    let bestScore = -1;
    for (const k of ALL_ARCHETYPE_KEYS) {
      const { score } = scoreProductAgainstArchetype(pl, k);
      if (score > bestScore) { bestScore = score; bestKey = k; }
    }
    return bestKey;
  });

  // Find dominant archetype (most common among items)
  const archetypeCounts = new Map<ArchetypeKey, number>();
  for (const arch of itemPrimaryArchetypes) {
    archetypeCounts.set(arch, (archetypeCounts.get(arch) ?? 0) + 1);
  }
  let dominantArchetype: ArchetypeKey = 'SMART_CASUAL';
  let dominantCount = 0;
  for (const [arch, count] of archetypeCounts) {
    if (count > dominantCount) { dominantCount = count; dominantArchetype = arch; }
  }

  // Count items with a completely different primary archetype
  const mismatchCount = itemPrimaryArchetypes.filter(a => a !== dominantArchetype).length;

  // Calculate coherence multiplier
  let coherenceMultiplier = 1.0;
  const hasAthletic = itemPrimaryArchetypes.includes('ATHLETIC');
  const hasClassic = itemPrimaryArchetypes.includes('CLASSIC');
  if (hasAthletic && hasClassic) {
    // Hard mismatch: athletic + classic → 50% penalty
    coherenceMultiplier = 0.5;
    console.warn(`Outfit score penalty: ATHLETIC + CLASSIC mismatch (-50%)`);
  } else if (mismatchCount > 1) {
    // More than 1 item has a different primary archetype → 30% penalty
    coherenceMultiplier = 0.7;
    console.warn(`Outfit score penalty: ${mismatchCount} items differ from dominant ${dominantArchetype} (-30%)`);
  } else if (mismatchCount === 0) {
    // All items share the same primary archetype → 10% bonus
    coherenceMultiplier = 1.1;
  }

  const outfitFormalityTarget = getOccasionFormalityTarget(occasion);
  const formalityAlignment = 1 - (formalities.reduce((sum, f) => sum + Math.abs(f - outfitFormalityTarget), 0) / formalities.length);
  const rawMatch = (avgFusion * 0.55 + colorHarmonyScore * 0.25 + formalityAlignment * 0.20) * coherenceMultiplier;
  const matchPercentage = Math.min(Math.round(rawMatch * 100), 98);
  
  // Generate tags based on archetypes and occasion
  const tags = generateTags(primaryArchetype, occasion, season, secondaryArchetype, mixFactor);
  
  // Generate a unique ID
  const outfitId = `outfit-${primaryArchetype}-${occasion}-${Date.now().toString(36)}`;
  
  // Generate outfit title
  const title = generateOutfitTitle(primaryArchetype, occasion, outfitProducts, secondaryArchetype, mixFactor);
  
  // Generate outfit description
  const description = generateOutfitDescription(primaryArchetype, occasion, outfitProducts, secondaryArchetype, mixFactor);
  
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
      explanation: '', // This will be filled by the function
      season,
      structure: selectedCategories, // Add the structure to the outfit
      weather, // Add weather to the outfit
      categoryRatio, // Add category ratio
      completeness // Add completeness score
    },
    primaryArchetype,
    occasion,
    {
      fit: fitPreference,
      prints: printsPreference,
      goals: goalsPreference,
      neutrals: colorProfile?.temperature,
      lightness: colorProfile?.value,
      contrast: colorProfile?.contrast,
      budgetMax: budgetPref?.max,
      materials: materialsPreference.length > 0 ? materialsPreference : undefined,
    }
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
    completeness // Add completeness score
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
    other: 0
  };
  
  // Count products in each category
  products.forEach(product => {
    const category = getProductCategory(product);
    ratio[category] += 1;
  });
  
  // Convert counts to percentages
  const total = products.length;
  Object.keys(ratio).forEach(key => {
    ratio[key as keyof CategoryRatio] = Math.round((ratio[key as keyof CategoryRatio] / total) * 100);
  });
  
  return ratio;
}

/**
 * Groups products by their category.
 * Products that map to OTHER are silently dropped — they are not wearable clothing.
 */
function groupProductsByCategory(products: Product[]): Record<ProductCategory, Product[]> {
  const result: Record<ProductCategory, Product[]> = {} as Record<ProductCategory, Product[]>;

  // Initialize empty arrays for each category
  Object.values(ProductCategory).forEach(category => {
    result[category] = [];
  });

  products.forEach(product => {
    const category = getProductCategory(product);
    if (category === ProductCategory.OTHER) return;
    if (!isFashionAppropriate(product)) return;
    result[category].push(product);
  });

  return result;
}

/**
 * Selects the best product from a category based on archetypes, occasion, and season
 * Implements the 70/30 hybrid archetype logic
 */
const FIT_TAG_MAP: Record<string, string[]> = {
  slim: ['slim', 'fitted', 'tailored', 'skinny', 'narrow'],
  regular: ['regular', 'straight', 'classic', 'standard'],
  relaxed: ['relaxed', 'loose', 'comfortable', 'easy'],
  oversized: ['oversized', 'boxy', 'wide', 'roomy', 'slouchy'],
  straight: ['straight', 'regular', 'classic'],
  oversizedTop_slimBottom: ['oversized', 'wide', 'slim', 'fitted'],
};

function getFitScore(product: Product, fitPreference?: string): number {
  if (!fitPreference) return 0;
  const fitTags = FIT_TAG_MAP[fitPreference] || [];
  const enriched = enrichProduct(product);
  const silhouettes = enriched._signals.silhouetteTags;
  if (silhouettes.some(s => fitTags.includes(s))) return 0.2;
  const tags = (product.styleTags || []).join(' ').toLowerCase();
  return fitTags.some(t => tags.includes(t)) ? 0.15 : 0;
}

const GOAL_PRODUCT_TAGS: Record<string, string[]> = {
  timeless: ['klassiek', 'classic', 'basic', 'clean', 'neutral', 'timeless', 'minimal'],
  trendy: ['trendy', 'urban', 'statement', 'bold', 'streetstyle', 'graphic'],
  minimal: ['minimalist', 'clean', 'simple', 'effen', 'basic', 'neutral'],
  express: ['expressive', 'statement', 'creative', 'avant-garde', 'retro', 'vintage'],
  professional: ['klassiek', 'formal', 'tailored', 'structured', 'elegant', 'sophisticated'],
  comfort: ['relaxed', 'casual', 'soft', 'comfortable', 'cozy'],
};

const COMFORT_FIT_TAGS: Record<string, string[]> = {
  structured: ['tailored', 'fitted', 'structured', 'slim', 'sharp'],
  balanced: ['regular', 'straight', 'classic', 'comfortable'],
  relaxed: ['relaxed', 'loose', 'oversized', 'wide', 'comfortable', 'easy', 'casual'],
};

function getGoalsScore(product: Product, goals: string[]): number {
  if (!goals || goals.length === 0) return 0;
  const enriched = enrichProduct(product);
  const signals = enriched._signals;
  const allTags = [
    ...(product.styleTags || []),
    ...signals.silhouetteTags,
    ...signals.materialTags,
    ...signals.colorTags,
  ].join(' ').toLowerCase();
  const dbStyle = ((product as any).style || '').toLowerCase();
  let hits = 0;
  for (const goal of goals) {
    const goalTags = GOAL_PRODUCT_TAGS[goal] || [];
    if (goalTags.some(t => allTags.includes(t))) { hits++; continue; }
    if (goal === 'professional' && signals.formality >= 0.6) { hits++; continue; }
    if (goal === 'comfort' && signals.formality <= 0.3) { hits++; continue; }
    if (goal === 'trendy' && (dbStyle === 'streetwear' || dbStyle === 'casual-urban')) { hits++; continue; }
    if (goal === 'minimal' && dbStyle === 'minimalist') { hits++; continue; }
    if (goal === 'timeless' && (dbStyle === 'smart-casual' || dbStyle === 'luxury')) { hits++; continue; }
  }
  return (hits / goals.length) * 0.25;
}

function getComfortScore(product: Product, comfort?: string): number {
  if (!comfort) return 0;
  const comfortTags = COMFORT_FIT_TAGS[comfort] || [];
  const enriched = enrichProduct(product);
  const silhouettes = enriched._signals.silhouetteTags;
  if (silhouettes.some(s => comfortTags.includes(s))) return 0.15;
  const tags = (product.styleTags || []).join(' ').toLowerCase();
  return comfortTags.some(t => tags.includes(t)) ? 0.1 : 0;
}

const PRINT_KEYWORDS = ['printed', 'pattern', 'graphic', 'floral', 'stripe', 'stripes', 'checked', 'plaid', 'animal print', 'print', 'patroon', 'geruit', 'bloemen', 'stip', 'dots'];

function getMaterialPrintScore(product: Product, materials: string[], prints?: string): number {
  if (materials.length === 0 && !prints) return 0;

  const enriched = enrichProduct(product);
  const mtags = enriched._signals.materialTags;
  const text = [product.name || '', product.description || ''].join(' ').toLowerCase();
  const allTags = (product.styleTags || []).join(' ').toLowerCase();
  const searchable = `${text} ${allTags}`;

  let score = 0;

  if (materials.length > 0) {
    const normPrefs = materials.map(m => m.toLowerCase());
    const matched = normPrefs.some(m => mtags.includes(m));
    if (matched) {
      score += 0.20;
    } else {
      const textMatch = normPrefs.some(m => {
        const patterns = MATERIAL_PATTERNS_LOOKUP[m];
        if (!patterns) return searchable.includes(m);
        return patterns.some(p => searchable.includes(p));
      });
      if (textMatch) score += 0.12;
    }
  }

  if (prints) {
    const hasPrintSignal = PRINT_KEYWORDS.some(kw => searchable.includes(kw));
    if (prints === 'statement') {
      score += hasPrintSignal ? 0.15 : 0;
    } else if (prints === 'subtiel' || prints === 'subtle') {
      const hasSubtle = /stripe|streep|dots|stip|geruit|check|subtle/i.test(searchable);
      score += hasSubtle ? 0.12 : 0;
    } else if (prints === 'effen' || prints === 'geen') {
      if (hasPrintSignal) score -= 0.10;
      else if (/effen|uni|solid|plain/i.test(searchable)) score += 0.08;
    }
  }

  return score;
}

const MATERIAL_PATTERNS_LOOKUP: Record<string, string[]> = {
  katoen: ['katoen', 'cotton', 'jersey', 'piqué', 'pique'],
  wol: ['wol', 'wool', 'woolen', 'wollen', 'merino'],
  denim: ['denim', 'spijker', 'jeans'],
  leer: ['leer', 'leather', 'lederen', 'suède', 'suede', 'nubuck'],
  linnen: ['linnen', 'linen'],
  fleece: ['fleece', 'teddy', 'sherpa'],
  tech: ['tech', 'nylon', 'polyester', 'performance', 'gore-tex', 'softshell', 'hardshell'],
  stretch: ['stretch', 'elastaan', 'elastisch', 'spandex', 'lycra'],
  mesh: ['mesh'],
  canvas: ['canvas'],
  coated: ['coated', 'gewaxed', 'waxed', 'gecoat'],
  zijde: ['zijde', 'silk', 'satijn', 'satin'],
  kasjmier: ['kasjmier', 'cashmere'],
  ribstof: ['rib', 'corduroy', 'ribfluweel', 'ribstof'],
};

function getOccasionFormalityTarget(occasion: string): number {
  const o = occasion.toLowerCase();
  if (o.includes('werk') || o.includes('kantoor') || o.includes('office') || o.includes('zakelijk')) return 0.7;
  if (o.includes('formeel') || o.includes('gala') || o.includes('formal')) return 0.9;
  if (o.includes('date') || o.includes('diner')) return 0.6;
  if (o.includes('feest') || o.includes('uitgaan') || o.includes('party')) return 0.5;
  if (o.includes('sport') || o.includes('actief')) return 0.1;
  if (o.includes('reis') || o.includes('travel')) return 0.4;
  return 0.3;
}

function weightedRandomPick<T extends { combined: number }>(items: T[], topN: number = 6): T | null {
  if (items.length === 0) return null;
  const candidates = items.slice(0, Math.min(topN, items.length));
  const maxScore = candidates[0]?.combined ?? 0;
  const minViable = maxScore * 0.5;
  const viable = candidates.filter(c => c.combined >= minViable);
  const pool = viable.length >= 3 ? viable : candidates.slice(0, 3);
  const weights = pool.map(c => Math.max(c.combined, 0.01) ** 2);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[0];
}

function isFashionAppropriate(product: Product): boolean {
  const result = classifyProduct(product);
  if (result.rejected) return false;

  const text = [product.name, product.description].filter(Boolean).join(' ').toLowerCase();

  const sportSignals = /\b(fg|ag|sg|mg|tf|ic)\b|\b(voetbal|football|soccer|rugby|hockey|basketbal|fitness|crossfit|spinning|yoga|pilates|marathon|triathlon|cycling|wielren|hardloop|running\s+shoe|trail\s+run|cleat|crampon|keepershandschoen|scheenbeschermer|shin\s+guard)\b/i;
  if (sportSignals.test(text)) return false;

  const kidsSignals = /\b(baby|peuter|kleuter|newborn|infant|kinder|junior|kids)\b/i;
  if (kidsSignals.test(text)) return false;

  if (/\bset\s+van\s+\d/i.test(text) || /\b\d+[- ]?(pack|stuks)\b/i.test(text)) return false;

  return true;
}

function selectProductForCategory(
  productsByCategory: Record<ProductCategory, Product[]>,
  category: ProductCategory,
  primaryArchetype: string,
  occasion: string,
  season: Season,
  weather: Weather,
  secondaryArchetype?: string,
  mixFactor: number = 0.3,
  fitPreference?: string,
  goals: string[] = [],
  comfort?: string,
  usedProductIds?: Set<string>,
  usedBrands?: Set<string>,
  budget?: { min: number; max: number },
  materials: string[] = [],
  prints?: string,
): Product | null {
  const products = productsByCategory[category];
  if (!products || products.length === 0) return null;

  let pool = usedProductIds && usedProductIds.size > 0
    ? products.filter(p => !usedProductIds.has(p.id))
    : products;

  if (pool.length === 0) pool = products;

  const seasonalProducts = pool.filter(p => !p.season || p.season.includes(season));
  const weatherFiltered = weather
    ? seasonalProducts.filter(p => isProductSuitableForWeather(p, weather))
    : seasonalProducts;

  const fashionFiltered = (weatherFiltered.length > 0
    ? weatherFiltered
    : seasonalProducts.length > 0
      ? seasonalProducts
      : pool
  ).filter(isFashionAppropriate);

  let productsToUse = fashionFiltered.length > 0 ? fashionFiltered : pool.filter(isFashionAppropriate);
  if (productsToUse.length === 0) return null;

  if (budget && budget.max > 0) {
    const ceiling = budget.max * 1.35;
    const budgetFiltered = productsToUse.filter(p => !p.price || p.price <= ceiling);
    if (budgetFiltered.length >= 2) {
      productsToUse = budgetFiltered;
    }
  }

  const primaryKey = resolveArchetypeKey(primaryArchetype);
  const mix: ArchetypeWeights = { [primaryKey]: 1 - (mixFactor ?? 0) };
  if (secondaryArchetype && secondaryArchetype !== primaryArchetype && mixFactor && mixFactor > 0) {
    const secondaryKey = resolveArchetypeKey(secondaryArchetype);
    mix[secondaryKey] = (mix[secondaryKey] ?? 0) + mixFactor;
  }

  const formalityTarget = getOccasionFormalityTarget(occasion);

  const scoredProducts = productsToUse.map(product => {
    const enriched = enrichProduct(product);
    const s = enriched._signals;
    const productLike: ProductLike = {
      id: product.id,
      title: product.name,
      brand: product.brand,
      category: product.category,
      colorTags: s.colorTags,
      materialTags: s.materialTags,
      silhouetteTags: s.silhouetteTags,
      formality: enriched.formality,
      price: product.price,
      style: (product as any).style,
    };
    const fusion = fusionScore(productLike, mix);
    const fitBonus = getFitScore(product, fitPreference);
    const goalsBonus = getGoalsScore(product, goals);
    const comfortBonus = getComfortScore(product, comfort);

    const formalityDelta = Math.abs(enriched.formality - formalityTarget);
    const formalityBonus = Math.max(0, 0.25 * (1 - formalityDelta));

    const brandPenalty = usedBrands && product.brand && usedBrands.has(product.brand.toLowerCase()) ? 0.30 : 0;

    let budgetBonus = 0;
    if (budget && budget.max > 0 && product.price) {
      if (product.price <= budget.max) {
        budgetBonus = 0.15;
        const ratio = product.price / budget.max;
        if (ratio >= 0.3 && ratio <= 0.9) budgetBonus += 0.08;
      } else {
        const overshoot = (product.price - budget.max) / budget.max;
        budgetBonus = -(0.20 + overshoot * 0.30);
      }
    }

    const athleticIntent = deriveAthleticIntent(
      product.brand || '',
      product.name || '',
      product.description || '',
      product.category || '',
    );
    const wantsAthletic = primaryKey === 'ATHLETIC';
    const athleticBonus = wantsAthletic && athleticIntent >= 0.8 ? 0.20
      : wantsAthletic && athleticIntent >= 0.4 ? 0.08
      : !wantsAthletic && athleticIntent >= 0.8 ? -0.15
      : 0;

    const fusionInput: typeof productLike = (wantsAthletic && athleticIntent >= 0.8)
      ? { ...productLike, style: 'athletic' }
      : productLike;
    const fusionResult = (fusionInput === productLike) ? fusion : fusionScore(fusionInput, mix);

    const materialPrintBonus = getMaterialPrintScore(product, materials, prints);

    const combined = fusionResult.totalScore * 0.50 + formalityBonus + fitBonus + goalsBonus + comfortBonus + materialPrintBonus - brandPenalty + budgetBonus + athleticBonus;

    return { product, combined, fusionScore: fusionResult.totalScore, signals: fusionResult.matchedSignals };
  });

  scoredProducts.sort((a, b) => b.combined - a.combined);

  const picked = weightedRandomPick(scoredProducts);

  if (picked) {
    console.log(`[Select] ${category} → "${picked.product.name}" score=${picked.combined.toFixed(2)} fusion=${picked.fusionScore.toFixed(2)}`);
  }

  return picked?.product ?? null;
}

/**
 * Calculates how well a product's style tags match an archetype
 */
function calculateArchetypeStyleScore(styleTags: string[], archetype: string): number {
  // Define style tags that match each archetype
  const archetypeStyleTags: Record<string, string[]> = {
    'klassiek': ['elegant', 'tijdloos', 'verfijnd', 'klassiek', 'sophisticated', 'formal', 'minimalist'],
    'casual_chic': ['relaxed', 'comfortable', 'effortless', 'modern', 'versatile', 'casual', 'minimalist'],
    'urban': ['functional', 'practical', 'edgy', 'modern', 'city', 'sporty', 'casual'],
    'streetstyle': ['trendy', 'bold', 'authentic', 'creative', 'expressive', 'sporty', 'casual'],
    'retro': ['vintage', 'nostalgic', 'unique', 'timeless', 'classic', 'vintage'],
    'luxury': ['premium', 'exclusive', 'sophisticated', 'quality', 'refined', 'formal', 'minimalist']
  };
  
  // Get the style tags for this archetype
  const archetypeTags = archetypeStyleTags[archetype] || [];
  
  // Count how many of the product's style tags match the archetype
  const matchingTags = styleTags.filter(tag => archetypeTags.includes(tag));
  
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
  mixFactor: number = 0.3
): string[] {
  const archetypeTags: Record<string, string[]> = {
    'klassiek': ['elegant', 'tijdloos', 'verfijnd', 'klassiek'],
    'casual_chic': ['relaxed', 'comfortable', 'effortless', 'modern'],
    'urban': ['functional', 'practical', 'edgy', 'modern'],
    'streetstyle': ['trendy', 'bold', 'authentic', 'creative'],
    'retro': ['vintage', 'nostalgic', 'unique', 'timeless'],
    'luxury': ['premium', 'exclusive', 'sophisticated', 'quality']
  };
  
  const occasionTags: Record<string, string[]> = {
    'Werk': ['professional', 'office', 'business'],
    'Formeel': ['formal', 'elegant', 'sophisticated'],
    'Casual': ['everyday', 'comfortable', 'relaxed'],
    'Weekend': ['relaxed', 'comfortable', 'versatile'],
    'Lunch': ['smart-casual', 'stylish', 'comfortable'],
    'Stad': ['urban', 'practical', 'stylish'],
    'Actief': ['functional', 'comfortable', 'practical'],
    'Uitgaan': ['statement', 'eye-catching', 'trendy'],
    'Festival': ['bold', 'expressive', 'comfortable'],
    'Creatief': ['unique', 'expressive', 'artistic'],
    'Gala': ['luxurious', 'statement', 'elegant'],
    'Speciale gelegenheid': ['special', 'memorable', 'elegant'],
    'Zakelijk diner': ['smart', 'elegant', 'professional']
  };
  
  const seasonTags: Record<Season, string[]> = {
    'spring': ['spring', 'lente', 'fresh', 'light'],
    'summer': ['summer', 'zomer', 'light', 'breathable'],
    'autumn': ['autumn', 'herfst', 'layered', 'cozy'],
    'winter': ['winter', 'warm', 'cozy', 'layered']
  };
  
  // Add completeness tag
  const completenessTags = ['complete', 'balanced', 'well-rounded'];
  
  // Get primary archetype tags
  const primaryTags = archetypeTags[primaryArchetype] || [];
  
  // Get secondary archetype tags if applicable
  let secondaryTags: string[] = [];
  if (secondaryArchetype && secondaryArchetype !== primaryArchetype && mixFactor > 0) {
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
      .filter(tag => !primaryTags.includes(tag)) // Ensure uniqueness
      .slice(0, secondaryCount),
    ...(occasionTags[occasion] ?? []),
    ...(seasonTags[season] ?? []),
    completenessTags[Math.floor(Math.random() * completenessTags.length)]
  ];
  
  // Filter strings and remove duplicates
  const combinedTags = rawTags.filter((t): t is string => typeof t === 'string');
  return Array.from(new Set(combinedTags));
}

export default generateOutfits;