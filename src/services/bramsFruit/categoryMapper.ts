import { BramsFruitProduct } from './types';
import { Product } from '@/engine/types';

export interface CategoryMapping {
  fitfiType: string;
  fitfiCategory: string;
  styleTags: string[];
  season: string[];
}

const CATEGORY_MAPPINGS: Record<string, CategoryMapping> = {
  'Outerwear': {
    fitfiType: 'outerwear',
    fitfiCategory: 'outerwear',
    styleTags: ['outerwear', 'jacket', 'casual', 'smart'],
    season: ['autumn', 'winter', 'spring']
  },
  'Shirting': {
    fitfiType: 'tops',
    fitfiCategory: 'top',
    styleTags: ['shirt', 'overshirt', 'casual', 'smart-casual'],
    season: ['spring', 'summer', 'autumn']
  },
  'Knitwear': {
    fitfiType: 'tops',
    fitfiCategory: 'top',
    styleTags: ['knitwear', 'sweater', 'casual', 'warm'],
    season: ['autumn', 'winter', 'spring']
  },
  'Sweatshirts': {
    fitfiType: 'tops',
    fitfiCategory: 'top',
    styleTags: ['sweatshirt', 'hoodie', 'casual', 'sporty'],
    season: ['spring', 'autumn', 'winter']
  },
  "Polo's & T-shirts": {
    fitfiType: 'tops',
    fitfiCategory: 'top',
    styleTags: ['tshirt', 'polo', 'casual', 'summer'],
    season: ['spring', 'summer', 'autumn']
  },
  'Trousers': {
    fitfiType: 'bottoms',
    fitfiCategory: 'bottom',
    styleTags: ['trousers', 'pants', 'casual', 'smart-casual'],
    season: ['spring', 'summer', 'autumn', 'winter']
  },
  'Accessories': {
    fitfiType: 'accessories',
    fitfiCategory: 'accessory',
    styleTags: ['accessory', 'cap', 'bag', 'casual'],
    season: ['spring', 'summer', 'autumn', 'winter']
  }
};

const SUB_CATEGORY_MAPPINGS: Record<string, Partial<CategoryMapping>> = {
  'Jackets': {
    styleTags: ['jacket', 'outerwear', 'casual', 'smart'],
  },
  'Bodywarmers': {
    styleTags: ['bodywarmer', 'vest', 'casual', 'sporty'],
  },
  'Overshirt': {
    styleTags: ['overshirt', 'shirt-jacket', 'casual', 'layering'],
  },
  'Hoodies': {
    styleTags: ['hoodie', 'casual', 'sporty', 'streetwear'],
  },
  'Crewnecks': {
    styleTags: ['crewneck', 'sweatshirt', 'casual', 'minimalist'],
  },
  'Longsleeves': {
    styleTags: ['longsleeve', 'casual', 'basic'],
  },
  'T-Shirts': {
    styleTags: ['tshirt', 'basic', 'casual', 'summer'],
  },
  'Polo': {
    styleTags: ['polo', 'smart-casual', 'preppy'],
  },
  'Caps': {
    styleTags: ['cap', 'hat', 'casual', 'streetwear'],
  },
  'Bags': {
    styleTags: ['bag', 'accessory', 'practical'],
  },
  'Beanies': {
    styleTags: ['beanie', 'winter', 'casual'],
    season: ['autumn', 'winter']
  },
  'Scarves': {
    styleTags: ['scarf', 'winter', 'accessory'],
    season: ['autumn', 'winter']
  }
};

function getCategoryFallbackImage(category: string): string {
  const fallbackMap: Record<string, string> = {
    'Outerwear': '/images/fallbacks/top.jpg',
    'Shirting': '/images/fallbacks/top.jpg',
    'Trousers': '/images/fallbacks/bottom.jpg',
    'Accessories': '/images/fallbacks/accessory.jpg',
    'Knitwear': '/images/fallbacks/top.jpg',
    'Sweatshirts': '/images/fallbacks/top.jpg',
    "Polo's & T-shirts": '/images/fallbacks/top.jpg',
  };

  return fallbackMap[category] || '/images/fallbacks/default.jpg';
}

export function mapBramsFruitToFitFiProduct(bramsFruit: BramsFruitProduct): Product {
  const categoryMapping = CATEGORY_MAPPINGS[bramsFruit.category] || {
    fitfiType: 'other',
    fitfiCategory: 'other',
    styleTags: ['casual'],
    season: ['spring', 'summer', 'autumn', 'winter']
  };

  const subCategoryMapping = SUB_CATEGORY_MAPPINGS[bramsFruit.sub_category] || {};

  const styleTags = [
    ...(categoryMapping.styleTags || []),
    ...(subCategoryMapping.styleTags || []),
    'brams-fruit',
    'premium',
    'menswear'
  ];

  const season = subCategoryMapping.season || categoryMapping.season;

  const imageUrl = bramsFruit.image_url || getCategoryFallbackImage(bramsFruit.category);

  return {
    id: `bf-${bramsFruit.sku}`,
    name: bramsFruit.product_name,
    imageUrl,
    type: categoryMapping.fitfiType,
    category: categoryMapping.fitfiCategory,
    styleTags: Array.from(new Set(styleTags)),
    description: `${bramsFruit.product_name} - ${bramsFruit.color}${bramsFruit.material_composition ? ` (${bramsFruit.material_composition})` : ''}`,
    price: bramsFruit.retail_price,
    brand: 'Brams Fruit',
    affiliateUrl: bramsFruit.affiliate_link || undefined,
    season: season as any[],
    matchScore: 0
  };
}

export function getBramsFruitCategoryInfo(category: string, subCategory: string): CategoryMapping {
  const categoryMapping = CATEGORY_MAPPINGS[category] || {
    fitfiType: 'other',
    fitfiCategory: 'other',
    styleTags: ['casual'],
    season: ['spring', 'summer', 'autumn', 'winter']
  };

  const subCategoryMapping = SUB_CATEGORY_MAPPINGS[subCategory] || {};

  return {
    ...categoryMapping,
    styleTags: [
      ...(categoryMapping.styleTags || []),
      ...(subCategoryMapping.styleTags || [])
    ],
    season: subCategoryMapping.season || categoryMapping.season
  };
}
