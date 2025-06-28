export interface OutfitCombination {
  id: string;
  name: string;
  description: string;
  style: string;
  occasion: string[];
  mockupImageUrl: string;
  items: {
    category: 'top' | 'bottom' | 'accessoire' | 'schoenen';
    productId: string;
    name: string;
    brand: string;
    price: number;
    imageUrl: string;
    retailer: string;
    affiliateLink: string;
  }[];
  totalPrice: number;
  matchPercentage: number;
  tags: string[];
  seasonality: 'lente' | 'zomer' | 'herfst' | 'winter' | 'alle_seizoenen';
  // New psychological trigger fields
  psychologicalTrigger: string;
  urgencyMessage: string;
  personalizedMessage: string;
  popularityIndicator?: string;
  exclusiveOffer?: string;
}

// Generate complete outfit affiliate link
const generateCompleteOutfitLink = (outfitId: string, items: any[]): string => {
  const itemIds = items.map(item => item.productId).join(',');
  return `https://fitfi.nl/complete-outfit/${outfitId}?items=${itemIds}&ref=fitfi_complete_001&utm_source=fitfi&utm_medium=affiliate&utm_campaign=complete_outfit`;
};

export const outfitCombinations: OutfitCombination[] = [
  {
    id: 'outfit_001',
    name: 'Casual Urban',
    description: 'Denim Jacket + Slim Fit Jeans + Leren Rugtas. Perfect voor een dag in de stad.',
    style: 'casual_urban',
    occasion: ['casual', 'weekend', 'stad', 'vrienden'],
    mockupImageUrl: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2',
    items: [
      {
        category: 'top',
        productId: 'jas_002',
        name: 'Oversized Denim Jacket',
        brand: 'H&M',
        price: 39.99,
        imageUrl: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        retailer: 'H&M NL',
        affiliateLink: 'https://www2.hm.com/nl_nl/product/jas_002?ref=fitfi_hm_001&utm_source=fitfi&utm_medium=affiliate'
      },
      {
        category: 'bottom',
        productId: 'broek_001',
        name: 'High-Waist Mom Jeans',
        brand: 'Weekday',
        price: 69.99,
        imageUrl: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        retailer: 'ASOS NL',
        affiliateLink: 'https://www.asos.com/nl/product/broek_001?ref=fitfi_asos_001&utm_source=fitfi&utm_medium=affiliate'
      },
      {
        category: 'accessoire',
        productId: 'acc_001',
        name: 'Leren Crossbody Tas',
        brand: 'Liebeskind Berlin',
        price: 149.95,
        imageUrl: 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        retailer: 'De Bijenkorf',
        affiliateLink: 'https://www.debijenkorf.nl/product/acc_001?ref=fitfi_bij_001&utm_source=fitfi&utm_medium=affiliate'
      },
      {
        category: 'schoenen',
        productId: 'shoe_001',
        name: 'White Canvas Sneakers',
        brand: 'Vans',
        price: 64.99,
        imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        retailer: 'Zalando',
        affiliateLink: 'https://www.zalando.nl/product/shoe_001?ref=fitfi_zal_001&utm_source=fitfi&utm_medium=affiliate'
      }
    ],
    totalPrice: 324.92,
    matchPercentage: 92,
    tags: ['casual', 'urban', 'denim', 'streetwear', 'comfortabel'],
    seasonality: 'alle_seizoenen',
    psychologicalTrigger: 'Populaire keuze onder stedelijke professionals - 87% draagt dit wekelijks',
    urgencyMessage: 'Op = op - laatste complete sets beschikbaar voor het weekend',
    personalizedMessage: 'Jij verdient een look die net zo dynamisch is als jij! Deze combinatie past perfect bij jouw actieve lifestyle.',
    popularityIndicator: 'Elke 12 minuten besteld',
    exclusiveOffer: 'Gratis styling advies bij aankoop complete look'
  },
  {
    id: 'outfit_002',
    name: 'Minimalist Professional',
    description: 'Trench Coat + Tailored Palazzo Pants + Leren Tas. Elegant en tijdloos voor kantoor.',
    style: 'minimalist_professional',
    occasion: ['werk', 'kantoor', 'meeting', 'professional'],
    mockupImageUrl: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2',
    items: [
      {
        category: 'top',
        productId: 'jas_003',
        name: 'Minimalist Trench Coat',
        brand: 'COS',
        price: 195.00,
        imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        retailer: 'De Bijenkorf',
        affiliateLink: 'https://www.debijenkorf.nl/product/jas_003?ref=fitfi_bij_001&utm_source=fitfi&utm_medium=affiliate'
      },
      {
        category: 'bottom',
        productId: 'broek_002',
        name: 'Tailored Palazzo Pants',
        brand: 'Massimo Dutti',
        price: 89.95,
        imageUrl: 'https://images.pexels.com/photos/2529157/pexels-photo-2529157.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        retailer: 'Zalando',
        affiliateLink: 'https://www.zalando.nl/product/broek_002?ref=fitfi_zal_001&utm_source=fitfi&utm_medium=affiliate'
      },
      {
        category: 'accessoire',
        productId: 'acc_004',
        name: 'Structured Leather Handbag',
        brand: 'Michael Kors',
        price: 189.99,
        imageUrl: 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        retailer: 'Zalando',
        affiliateLink: 'https://www.zalando.nl/product/acc_004?ref=fitfi_zal_001&utm_source=fitfi&utm_medium=affiliate'
      },
      {
        category: 'schoenen',
        productId: 'shoe_002',
        name: 'Pointed Toe Pumps',
        brand: 'Zara',
        price: 79.95,
        imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        retailer: 'Zalando',
        affiliateLink: 'https://www.zalando.nl/product/shoe_002?ref=fitfi_zal_001&utm_source=fitfi&utm_medium=affiliate'
      }
    ],
    totalPrice: 554.89,
    matchPercentage: 96,
    tags: ['professional', 'minimalist', 'elegant', 'tijdloos', 'kantoor'],
    seasonality: 'alle_seizoenen',
    psychologicalTrigger: 'Favoriete keuze van C-level executives - verhoogt zelfvertrouwen met 94%',
    urgencyMessage: 'Bestel vandaag voor levering binnen 24 uur in Nederland',
    personalizedMessage: 'Jouw professionele uitstraling verdient deze tijdloze investering! Elke dag een statement maken.',
    popularityIndicator: 'Bestseller in business wear',
    exclusiveOffer: 'Gratis personal shopping sessie bij De Bijenkorf'
  },
  {
    id: 'outfit_003',
    name: 'Cozy Weekend',
    description: 'Wollen Mantel + Cargo Joggers + Bucket Hat. Comfortabel en stijlvol voor relaxte dagen.',
    style: 'cozy_casual',
    occasion: ['weekend', 'casual', 'comfort', 'thuis'],
    mockupImageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2',
    items: [
      {
        category: 'top',
        productId: 'jas_001',
        name: 'Klassieke Wollen Mantel',
        brand: 'Mango',
        price: 129.99,
        imageUrl: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        retailer: 'Zalando',
        affiliateLink: 'https://www.zalando.nl/product/jas_001?ref=fitfi_zal_001&utm_source=fitfi&utm_medium=affiliate'
      },
      {
        category: 'bottom',
        productId: 'broek_003',
        name: 'Cargo Joggers',
        brand: 'Nike',
        price: 79.99,
        imageUrl: 'https://images.pexels.com/photos/4066293/pexels-photo-4066293.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        retailer: 'Bol.com',
        affiliateLink: 'https://www.bol.com/product/broek_003?ref=fitfi_bol_001&utm_source=fitfi&utm_medium=affiliate'
      },
      {
        category: 'accessoire',
        productId: 'acc_003',
        name: 'Wollen Bucket Hat',
        brand: 'Arket',
        price: 29.99,
        imageUrl: 'https://images.pexels.com/photos/6764034/pexels-photo-6764034.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        retailer: 'H&M NL',
        affiliateLink: 'https://www2.hm.com/nl_nl/product/acc_003?ref=fitfi_hm_001&utm_source=fitfi&utm_medium=affiliate'
      },
      {
        category: 'schoenen',
        productId: 'shoe_003',
        name: 'Chunky Sneakers',
        brand: 'Balenciaga',
        price: 595.00,
        imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        retailer: 'De Bijenkorf',
        affiliateLink: 'https://www.debijenkorf.nl/product/shoe_003?ref=fitfi_bij_001&utm_source=fitfi&utm_medium=affiliate'
      }
    ],
    totalPrice: 834.97,
    matchPercentage: 88,
    tags: ['cozy', 'weekend', 'comfort', 'casual', 'warm'],
    seasonality: 'herfst',
    psychologicalTrigger: 'Trending op social media - 25.000+ posts met #CozyWeekendVibes',
    urgencyMessage: 'Bekijk snel - winter collectie verdwijnt over 3 dagen',
    personalizedMessage: 'Jij weet dat comfort en stijl hand in hand gaan! Deze look is jouw perfecte weekend uniform.',
    popularityIndicator: 'Viral op Instagram',
    exclusiveOffer: 'Gratis styling tips voor seizoenstransitie'
  },
  {
    id: 'outfit_004',
    name: 'Bohemian Chic',
    description: 'Flowing Cardigan + Wide Leg Pants + Layered Jewelry. Vrije geest met artistieke flair.',
    style: 'bohemian_chic',
    occasion: ['casual', 'creatief', 'festival', 'artistiek'],
    mockupImageUrl: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2',
    items: [
      {
        category: 'top',
        productId: 'top_001',
        name: 'Flowing Knit Cardigan',
        brand: 'Free People',
        price: 119.95,
        imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        retailer: 'ASOS NL',
        affiliateLink: 'https://www.asos.com/nl/product/top_001?ref=fitfi_asos_001&utm_source=fitfi&utm_medium=affiliate'
      },
      {
        category: 'bottom',
        productId: 'broek_004',
        name: 'Bohemian Wide Leg Pants',
        brand: 'Zara',
        price: 49.95,
        imageUrl: 'https://images.pexels.com/photos/2529157/pexels-photo-2529157.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        retailer: 'Zalando',
        affiliateLink: 'https://www.zalando.nl/product/broek_004?ref=fitfi_zal_001&utm_source=fitfi&utm_medium=affiliate'
      },
      {
        category: 'accessoire',
        productId: 'acc_002',
        name: 'Gouden Layering Kettingen Set',
        brand: 'Pilgrim',
        price: 34.95,
        imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        retailer: 'Wehkamp',
        affiliateLink: 'https://www.wehkamp.nl/product/acc_002?ref=fitfi_weh_001&utm_source=fitfi&utm_medium=affiliate'
      },
      {
        category: 'schoenen',
        productId: 'shoe_004',
        name: 'Suede Ankle Boots',
        brand: 'UGG',
        price: 189.99,
        imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        retailer: 'De Bijenkorf',
        affiliateLink: 'https://www.debijenkorf.nl/product/shoe_004?ref=fitfi_bij_001&utm_source=fitfi&utm_medium=affiliate'
      }
    ],
    totalPrice: 394.84,
    matchPercentage: 91,
    tags: ['bohemian', 'artistiek', 'vrij', 'creatief', 'flowing'],
    seasonality: 'lente',
    psychologicalTrigger: 'Favoriete keuze van creatieve professionals - 92% voelt zich authentieker',
    urgencyMessage: 'Op = op - lente collectie bijna uitverkocht',
    personalizedMessage: 'Jij durft jezelf authentiek uit te drukken! Deze look viert jouw unieke creativiteit.',
    popularityIndicator: 'Trending bij kunstenaars',
    exclusiveOffer: 'Gratis accessoire styling workshop'
  }
];

// Function to get outfits by style preference
export const getOutfitsByStyle = (stylePreference: string): OutfitCombination[] => {
  return outfitCombinations.filter(outfit => 
    outfit.style.includes(stylePreference) || 
    outfit.tags.includes(stylePreference)
  );
};

// Function to get outfits by occasion
export const getOutfitsByOccasion = (occasions: string[]): OutfitCombination[] => {
  return outfitCombinations.filter(outfit =>
    outfit.occasion.some(occ => occasions.includes(occ))
  );
};

// Function to track complete outfit click
export const trackCompleteOutfitClick = (outfit: OutfitCombination, source: string = 'recommendations') => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'complete_outfit_click', {
      event_category: 'ecommerce',
      event_label: `complete_outfit_${outfit.id}`,
      item_id: outfit.id,
      item_name: outfit.name,
      value: outfit.totalPrice,
      currency: 'EUR',
      items: outfit.items.map(item => ({
        item_id: item.productId,
        item_name: item.name,
        item_brand: item.brand,
        item_category: item.category,
        price: item.price,
        quantity: 1
      })),
      custom_parameter_1: 'complete_outfit_conversion',
      custom_parameter_2: outfit.style,
      custom_parameter_3: source
    });
  }
  
  console.log(`📊 Complete outfit click tracked: ${outfit.name} (€${outfit.totalPrice}) - GA4 event sent`);
};

// Generate complete outfit affiliate link
export const generateCompleteOutfitAffiliateLink = (outfit: OutfitCombination): string => {
  return generateCompleteOutfitLink(outfit.id, outfit.items);
};