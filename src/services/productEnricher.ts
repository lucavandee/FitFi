import { isValidImageUrl } from '../utils/imageUtils';
import { BoltProduct } from '../types/BoltProduct';

/**
 * Raw Zalando product type
 */
type RawZalandoProduct = {
  title?: string;
  name?: string;
  brand?: string;
  price?: number;
  image?: string;
  imageUrl?: string;
  gender?: string;
  color?: string;
  url?: string;
  affiliateUrl?: string;
  description?: string;
  category?: string;
  [key: string]: any;
};

/**
 * Color to hex mapping
 */
const COLOR_HEX_MAP: Record<string, string> = {
  'beige': '#F5F5DC',
  'black': '#000000',
  'blue': '#0000FF',
  'brown': '#A52A2A',
  'burgundy': '#800020',
  'cream': '#FFFDD0',
  'gold': '#FFD700',
  'gray': '#808080',
  'green': '#008000',
  'khaki': '#C3B091',
  'navy': '#000080',
  'olive': '#808000',
  'orange': '#FFA500',
  'pink': '#FFC0CB',
  'purple': '#800080',
  'red': '#FF0000',
  'silver': '#C0C0C0',
  'tan': '#D2B48C',
  'teal': '#008080',
  'white': '#FFFFFF',
  'yellow': '#FFFF00',
  'zwart': '#000000',
  'wit': '#FFFFFF',
  'blauw': '#0000FF',
  'bruin': '#A52A2A',
  'groen': '#008000',
  'grijs': '#808080',
  'rood': '#FF0000',
  'roze': '#FFC0CB',
  'paars': '#800080',
  'geel': '#FFFF00'
};

/**
 * Material estimation based on product type and brand
 */
const MATERIAL_ESTIMATIONS: Record<string, Record<string, string>> = {
  'blazer': {
    'Hugo Boss': 'Wol en polyester blend',
    'Zara': 'Polyester en viscose blend',
    'H&M': 'Polyester',
    'default': 'Polyester blend'
  },
  'sneaker': {
    'Nike': 'Leer en mesh',
    'Adidas': 'Synthetisch materiaal en mesh',
    'Puma': 'Suède en mesh',
    'default': 'Synthetisch materiaal'
  },
  'trui': {
    'COS': 'Merino wol',
    'Uniqlo': 'Katoen en polyester blend',
    'default': 'Katoen blend'
  },
  'broek': {
    'Levi\'s': 'Denim katoen',
    'G-Star': 'Denim met stretch',
    'default': 'Katoen'
  },
  'jas': {
    'The North Face': 'Waterafstotend polyester',
    'Patagonia': 'Gerecycled polyester',
    'Canada Goose': 'Dons en polyester',
    'default': 'Polyester'
  },
  'jeans': {
    'Levi\'s': 'Denim katoen',
    'G-Star': 'Denim met stretch',
    'default': 'Denim katoen'
  },
  'shirt': {
    'Tommy Hilfiger': 'Katoen',
    'Ralph Lauren': 'Katoen',
    'default': 'Katoen'
  },
  'blouse': {
    'Zara': 'Viscose',
    'H&M': 'Polyester',
    'default': 'Viscose blend'
  },
  'rok': {
    'default': 'Polyester blend'
  },
  'jurk': {
    'default': 'Viscose blend'
  },
  'schoenen': {
    'default': 'Leer'
  },
  'tas': {
    'default': 'Polyurethaan'
  },
  'default': {
    'default': 'Gemengde materialen'
  }
};

/**
 * Season estimation based on product type and keywords
 */
const SEASON_KEYWORDS: Record<string, string[]> = {
  'spring': ['lente', 'spring', 'licht', 'light', 'regen', 'rain', 'transitie', 'transition'],
  'summer': ['zomer', 'summer', 'licht', 'light', 'linnen', 'linen', 'katoen', 'cotton', 'korte', 'short'],
  'fall': ['herfst', 'fall', 'autumn', 'transitie', 'transition', 'mid-season'],
  'winter': ['winter', 'warm', 'wol', 'wool', 'dons', 'down', 'gevoerd', 'lined', 'thermo']
};

/**
 * Type to season mapping
 */
const TYPE_TO_SEASON: Record<string, string> = {
  'jas': 'fall',
  'trui': 'fall',
  'vest': 'fall',
  'hoodie': 'fall',
  'sweater': 'fall',
  'colbert': 'all_season',
  'blazer': 'all_season',
  'shirt': 'all_season',
  'blouse': 'all_season',
  'top': 'summer',
  'rok': 'summer',
  'jurk': 'summer',
  'short': 'summer',
  'bermuda': 'summer',
  'zwemkleding': 'summer',
  'broek': 'all_season',
  'jeans': 'all_season',
  'legging': 'all_season',
  'joggingbroek': 'all_season',
  'sneaker': 'all_season',
  'schoenen': 'all_season',
  'tas': 'all_season',
  'accessoire': 'all_season'
};

/**
 * Style tags based on product type, brand, and keywords
 */
const STYLE_TAGS_MAPPING: Record<string, string[]> = {
  // Brands
  'Hugo Boss': ['smart', 'clean', 'italian', 'formal'],
  'Zara': ['trendy', 'modern', 'minimal'],
  'H&M': ['casual', 'affordable', 'minimal'],
  'Nike': ['sporty', 'athletic', 'street'],
  'Adidas': ['sporty', 'athletic', 'street'],
  'Levi\'s': ['casual', 'denim', 'american'],
  'COS': ['minimal', 'clean', 'scandinavian'],
  'Uniqlo': ['minimal', 'clean', 'japanese'],
  'The North Face': ['outdoor', 'functional', 'sporty'],
  'G-Star': ['denim', 'urban', 'street'],
  'Tommy Hilfiger': ['preppy', 'american', 'casual'],
  'Ralph Lauren': ['preppy', 'american', 'classic'],
  'Calvin Klein': ['minimal', 'clean', 'modern'],
  'Gucci': ['luxury', 'italian', 'statement'],
  'Prada': ['luxury', 'italian', 'minimal'],
  'Balenciaga': ['luxury', 'statement', 'street'],
  'Mango': ['casual', 'affordable', 'mediterranean'],
  'Weekday': ['scandinavian', 'minimal', 'street'],
  'Arket': ['scandinavian', 'minimal', 'quality'],
  'Massimo Dutti': ['mediterranean', 'quality', 'smart'],
  
  // Types
  'blazer': ['formal', 'smart', 'business'],
  'colbert': ['formal', 'smart', 'business'],
  'kostuum': ['formal', 'smart', 'business'],
  'sneaker': ['casual', 'sporty', 'street'],
  'trui': ['casual', 'cozy', 'layering'],
  'sweater': ['casual', 'cozy', 'layering'],
  'hoodie': ['casual', 'street', 'sporty'],
  'broek': ['versatile', 'essential'],
  'jeans': ['casual', 'denim', 'versatile'],
  'jas': ['outerwear', 'essential', 'layering'],
  'shirt': ['casual', 'essential', 'versatile'],
  'blouse': ['smart', 'feminine', 'versatile'],
  'rok': ['feminine', 'versatile'],
  'jurk': ['feminine', 'statement'],
  'tas': ['accessory', 'functional'],
  'vest': ['layering', 'casual', 'versatile'],
  'top': ['casual', 'essential', 'versatile'],
  'overhemd': ['smart', 'formal', 'business'],
  'short': ['casual', 'summer', 'sporty'],
  'bermuda': ['casual', 'summer'],
  'joggingbroek': ['casual', 'sporty', 'comfortable'],
  'legging': ['sporty', 'casual', 'comfortable'],
  'jumpsuit': ['statement', 'versatile'],
  'cardigan': ['layering', 'cozy', 'versatile'],
  
  // Colors
  'beige': ['neutral', 'minimal', 'versatile'],
  'black': ['minimal', 'versatile', 'timeless'],
  'white': ['clean', 'minimal', 'versatile'],
  'navy': ['smart', 'timeless', 'versatile'],
  'gray': ['minimal', 'versatile', 'neutral'],
  'zwart': ['minimal', 'versatile', 'timeless'],
  'wit': ['clean', 'minimal', 'versatile'],
  'blauw': ['versatile', 'timeless'],
  'grijs': ['minimal', 'versatile', 'neutral'],
  
  // Keywords
  'slim': ['fitted', 'modern', 'clean'],
  'oversized': ['street', 'trendy', 'relaxed'],
  'vintage': ['retro', 'unique', 'statement'],
  'classic': ['timeless', 'smart', 'versatile'],
  'premium': ['luxury', 'quality', 'statement'],
  'casual': ['relaxed', 'everyday', 'comfortable'],
  'elegant': ['formal', 'smart', 'sophisticated'],
  'sportief': ['sporty', 'athletic', 'casual'],
  'zakelijk': ['business', 'formal', 'smart'],
  'stijlvol': ['stylish', 'smart', 'elegant']
};

/**
 * Archetype match estimation based on style tags
 */
const ARCHETYPE_STYLE_MAPPING: Record<string, string[]> = {
  'klassiek': ['formal', 'smart', 'business', 'clean', 'timeless', 'italian', 'luxury', 'quality', 'classic', 'elegant', 'sophisticated'],
  'casual_chic': ['casual', 'minimal', 'clean', 'versatile', 'essential', 'neutral', 'scandinavian', 'everyday', 'comfortable', 'relaxed'],
  'urban': ['functional', 'practical', 'versatile', 'essential', 'modern', 'minimal', 'city', 'smart'],
  'streetstyle': ['street', 'sporty', 'trendy', 'statement', 'athletic', 'relaxed', 'oversized', 'urban', 'denim'],
  'retro': ['vintage', 'retro', 'unique', 'statement', 'american', 'classic'],
  'luxury': ['luxury', 'quality', 'formal', 'smart', 'statement', 'italian', 'sophisticated', 'premium']
};

/**
 * Generate a slug from a string
 * @param str - String to convert to slug
 * @returns Slug version of the string
 */
function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50); // Limit length to avoid excessively long slugs
}

/**
 * Determine product type from title
 * @param title - Product title
 * @param category - Optional product category
 * @returns Product type
 */
function determineProductType(title: string, category?: string): string {
  // If category is provided and matches a known type, use it
  if (category) {
    const lowerCategory = category.toLowerCase();
    
    // Direct category mappings
    const categoryMappings: Record<string, string> = {
      'top': 'top',
      'bottom': 'broek',
      'footwear': 'schoenen',
      'accessory': 'accessoire',
      'outerwear': 'jas',
      'dress': 'jurk',
      'jumpsuit': 'jumpsuit'
    };
    
    if (Object.keys(categoryMappings).includes(lowerCategory)) {
      return categoryMappings[lowerCategory];
    }
  }
  
  const titleLower = title.toLowerCase();
  
  // Check for specific product types in the title
  const typeKeywords = [
    'blazer', 'sneaker', 'trui', 'broek', 'jurk', 'jas', 'shirt', 'blouse', 'rok', 
    'accessoire', 'schoenen', 'tas', 'vest', 'top', 'jeans', 'sweater', 'hoodie', 
    'overhemd', 'kostuum', 'zwemkleding', 'ondergoed', 'pyjama', 'sokken', 'legging', 
    'jumpsuit', 'cardigan', 'colbert', 'bermuda', 'short', 'joggingbroek'
  ];
  
  for (const type of typeKeywords) {
    if (titleLower.includes(type)) {
      return type;
    }
  }
  
  // English to Dutch mappings for common clothing types
  const englishToDutch: Record<string, string> = {
    't-shirt': 'shirt',
    'tshirt': 'shirt',
    't shirt': 'shirt',
    'jacket': 'jas',
    'coat': 'jas',
    'jeans': 'jeans',
    'denim': 'jeans',
    'shoe': 'schoenen',
    'shoes': 'schoenen',
    'trousers': 'broek',
    'pants': 'broek',
    'dress': 'jurk',
    'skirt': 'rok',
    'sweater': 'trui',
    'sweatshirt': 'trui',
    'hoodie': 'hoodie',
    'shirt': 'shirt',
    'blouse': 'blouse',
    'top': 'top',
    'shorts': 'short',
    'bag': 'tas',
    'handbag': 'tas',
    'accessory': 'accessoire',
    'accessories': 'accessoire',
    'suit': 'kostuum',
    'socks': 'sokken',
    'underwear': 'ondergoed',
    'swimwear': 'zwemkleding',
    'leggings': 'legging',
    'jumpsuit': 'jumpsuit',
    'cardigan': 'cardigan',
    'blazer': 'blazer'
  };
  
  // Check for English terms
  for (const [english, dutch] of Object.entries(englishToDutch)) {
    if (titleLower.includes(english)) {
      return dutch;
    }
  }
  
  // If category is provided but didn't match a known type, use it as a fallback
  if (category) {
    return category.toLowerCase();
  }
  
  // Default to 'other' if no type can be determined
  return 'other';
}

/**
 * Determine color from product title or color field
 * @param title - Product title
 * @param color - Product color field
 * @returns Color name
 */
function determineColor(title: string, color?: string): string {
  if (color) {
    return color.toLowerCase();
  }
  
  const titleLower = title.toLowerCase();
  const colorKeywords = Object.keys(COLOR_HEX_MAP);
  
  for (const colorKey of colorKeywords) {
    if (titleLower.includes(colorKey)) {
      return colorKey;
    }
  }
  
  // Default to a neutral color if none is found
  return 'beige';
}

/**
 * Get dominant color hex code
 * @param color - Color name
 * @returns Hex code for the color
 */
function getDominantColorHex(color: string): string {
  return COLOR_HEX_MAP[color.toLowerCase()] || '#CCCCCC';
}

/**
 * Determine season from product type and title
 * @param type - Product type
 * @param title - Product title
 * @returns Season
 */
function determineSeason(type: string, title: string): 'spring' | 'summer' | 'fall' | 'winter' | 'all_season' {
  const titleLower = title.toLowerCase();
  
  // Check for season keywords in the title
  for (const [season, keywords] of Object.entries(SEASON_KEYWORDS)) {
    for (const keyword of keywords) {
      if (titleLower.includes(keyword)) {
        return season as 'spring' | 'summer' | 'fall' | 'winter' | 'all_season';
      }
    }
  }
  
  // If no keywords found, use type-based mapping
  return (TYPE_TO_SEASON[type] || 'all_season') as 'spring' | 'summer' | 'fall' | 'winter' | 'all_season';
}

/**
 * Extract style tags from product information
 * @param title - Product title
 * @param brand - Product brand
 * @param type - Product type
 * @param color - Product color
 * @returns Array of style tags
 */
function extractStyleTags(title: string, brand: string, type: string, color: string): string[] {
  const titleLower = title.toLowerCase();
  const potentialTags: string[] = [];
  
  // Add tags based on brand
  if (brand && STYLE_TAGS_MAPPING[brand]) {
    potentialTags.push(...STYLE_TAGS_MAPPING[brand]);
  }
  
  // Add tags based on type
  if (STYLE_TAGS_MAPPING[type]) {
    potentialTags.push(...STYLE_TAGS_MAPPING[type]);
  }
  
  // Add tags based on color
  if (STYLE_TAGS_MAPPING[color]) {
    potentialTags.push(...STYLE_TAGS_MAPPING[color]);
  }
  
  // Add tags based on keywords in title
  for (const [keyword, tags] of Object.entries(STYLE_TAGS_MAPPING)) {
    if (titleLower.includes(keyword.toLowerCase())) {
      potentialTags.push(...tags);
    }
  }
  
  // Deduplicate tags
  const uniqueTags = Array.from(new Set(potentialTags));
  
  // Return max 3 tags
  return uniqueTags.slice(0, 3);
}

/**
 * Calculate archetype match scores based on style tags
 * @param styleTags - Array of style tags
 * @returns Object with archetype IDs as keys and match scores as values
 */
function calculateArchetypeMatches(styleTags: string[]): Record<string, number> {
  const matches: Record<string, number> = {};
  
  // Calculate match score for each archetype
  for (const [archetype, archetypeTags] of Object.entries(ARCHETYPE_STYLE_MAPPING)) {
    // Count how many style tags match this archetype
    const matchingTags = styleTags.filter(tag => archetypeTags.includes(tag));
    
    if (matchingTags.length > 0) {
      // Calculate score based on percentage of matching tags
      const score = matchingTags.length / styleTags.length;
      matches[archetype] = parseFloat(score.toFixed(2));
    }
  }
  
  // If no matches found, add a default match
  if (Object.keys(matches).length === 0) {
    matches['casual_chic'] = 0.5;
  }
  
  // Sort matches by score (descending)
  const sortedMatches = Object.entries(matches)
    .sort(([, a], [, b]) => b - a)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {} as Record<string, number>);
  
  // Return top 2 matches
  return Object.fromEntries(Object.entries(sortedMatches).slice(0, 2));
}

/**
 * Estimate material based on product type and brand
 * @param type - Product type
 * @param brand - Product brand
 * @returns Estimated material
 */
function estimateMaterial(type: string, brand: string): string {
  // Check if we have a specific estimation for this type and brand
  if (MATERIAL_ESTIMATIONS[type] && MATERIAL_ESTIMATIONS[type][brand]) {
    return MATERIAL_ESTIMATIONS[type][brand];
  }
  
  // Check if we have a default estimation for this type
  if (MATERIAL_ESTIMATIONS[type] && MATERIAL_ESTIMATIONS[type]['default']) {
    return MATERIAL_ESTIMATIONS[type]['default'];
  }
  
  // Return the global default
  return MATERIAL_ESTIMATIONS?.default?.default ?? 'Mixed materials';
}

/**
 * Validate and normalize image URL
 * @param imageUrl - The image URL to validate
 * @returns Valid image URL or fallback
 */
function validateAndNormalizeImageUrl(imageUrl: string): string {
  // Check if URL is valid
  if (!imageUrl || !isValidImageUrl(imageUrl)) {
    console.warn(`Invalid image URL detected: ${imageUrl}, using fallback`);
    return '/placeholder.png';
  }
  
  // Check for problematic domains
  const problematicDomains = [
    'debijenkorf.nl',
    'massimo-dutti',
    'bijenkorf',
    'cdn.debijenkorf',
    'media.s-bol.com'
  ];
  
  if (problematicDomains.some(domain => imageUrl.includes(domain))) {
    console.warn(`Problematic domain detected in image URL: ${imageUrl}, using fallback`);
    return '/placeholder.png';
  }
  
  return imageUrl;
}

/**
 * Convert a raw Zalando product to a BoltProduct
 * @param product - Raw Zalando product
 * @returns BoltProduct
 */
function convertToBoltProduct(product: RawZalandoProduct): BoltProduct {
  // Extract basic information
  const title = product.title || product.name || 'Onbekend product';
  const brand = product.brand || 'Onbekend merk';
  const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price || '0'));
  const image = product.image || product.imageUrl || '';
  const gender = product.gender || 'female';
  const rawColor = product.color || '';
  const url = product.url || product.affiliateUrl || '#';
  const category = product.category || '';
  
  // Generate a unique ID
  const id = `bolt-${generateSlug(`${brand}-${title}`)}`;
  
  // Determine product type
  const type = determineProductType(title, category);
  
  // Determine color
  const color = determineColor(title, rawColor);
  
  // Get dominant color hex
  const dominantColorHex = getDominantColorHex(color);
  
  // Extract style tags
  const styleTags = extractStyleTags(title, brand, type, color);
  
  // Determine season
  const season = determineSeason(type, title);
  
  // Calculate archetype matches
  const archetypeMatch = calculateArchetypeMatches(styleTags);
  
  // Estimate material
  const material = estimateMaterial(type, brand);
  
  // Validate and normalize image URL
  const imageUrl = validateAndNormalizeImageUrl(image);
  
  // Create and return the BoltProduct
  return {
    id,
    title,
    brand,
    type: type as any,
    gender: gender === 'men' || gender === 'male' ? 'male' : 'female',
    color,
    dominantColorHex,
    styleTags,
    season,
    archetypeMatch,
    material,
    price,
    imageUrl,
    affiliateUrl: url,
    source: 'zalando'
  };
}

/**
 * Convert an array of raw Zalando products to BoltProducts
 * @param products - Array of raw Zalando products
 * @returns Array of BoltProducts
 */
function convertToBoltProducts(products: RawZalandoProduct[]): BoltProduct[] {
  return products.map(convertToBoltProduct);
}

/**
 * Enrich a Zalando product with additional data
 * @param product - Raw Zalando product
 * @returns Enriched BoltProduct
 */
function enrichZalandoProduct(product: any): BoltProduct {
  return convertToBoltProduct(product);
}

/**
 * Enrich an array of Zalando products with additional data
 * @param products - Array of raw Zalando products
 * @returns Array of enriched BoltProducts
 */
export function enrichZalandoProducts(products: any[]): BoltProduct[] {
  return products.map(enrichZalandoProduct);
}

