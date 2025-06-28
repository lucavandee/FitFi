// Cross-sell product data for follow-up recommendations
export interface CrossSellProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  retailer: 'Zalando' | 'Wehkamp' | 'H&M NL' | 'ASOS NL' | 'Bol.com' | 'De Bijenkorf';
  affiliateLink: string;
  category: 'Schoenen' | 'Horloges' | 'Sjaals' | 'Riemen' | 'Tassen' | 'Sieraden';
  description: string;
  tags: string[];
  // Psychological triggers
  psychologicalTrigger: string;
  urgencyMessage: string;
  personalizedMessage: string;
  popularityIndicator?: string;
  limitedEdition?: boolean;
  freeShipping?: boolean;
  fastDelivery?: boolean;
}

// Generate affiliate link for cross-sell products
const generateCrossSellAffiliateLink = (retailer: string, productId: string): string => {
  const affiliateIds = {
    'Zalando': 'fitfi_zal_cross_001',
    'Wehkamp': 'fitfi_weh_cross_001', 
    'H&M NL': 'fitfi_hm_cross_001',
    'ASOS NL': 'fitfi_asos_cross_001',
    'Bol.com': 'fitfi_bol_cross_001',
    'De Bijenkorf': 'fitfi_bij_cross_001'
  };
  
  const baseUrls = {
    'Zalando': 'https://www.zalando.nl',
    'Wehkamp': 'https://www.wehkamp.nl',
    'H&M NL': 'https://www2.hm.com/nl_nl',
    'ASOS NL': 'https://www.asos.com/nl',
    'Bol.com': 'https://www.bol.com',
    'De Bijenkorf': 'https://www.debijenkorf.nl'
  };
  
  return `${baseUrls[retailer]}/product/${productId}?ref=${affiliateIds[retailer]}&utm_source=fitfi&utm_medium=cross_sell&utm_campaign=follow_up_recommendations`;
};

export const crossSellProductDatabase: CrossSellProduct[] = [
  // SCHOENEN
  {
    id: 'cross_shoe_001',
    name: 'Leren Chelsea Boots',
    brand: 'Dr. Martens',
    price: 189.99,
    originalPrice: 219.99,
    imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'Zalando',
    affiliateLink: generateCrossSellAffiliateLink('Zalando', 'cross_shoe_001'),
    category: 'Schoenen',
    description: 'Iconische Chelsea boots die bij elke outfit passen. Duurzaam leer en comfort voor de hele dag.',
    tags: ['leer', 'chelsea', 'versatile', 'duurzaam', 'comfort'],
    psychologicalTrigger: 'Iconische keuze van fashion insiders - 96% draagt dit 3+ keer per week',
    urgencyMessage: 'Op = op - laatste paren in populaire maten, bestel snel!',
    personalizedMessage: 'Jij weet dat goede schoenen de basis zijn van elke outfit - deze boots maken alles compleet!',
    popularityIndicator: 'Bestseller sinds 1960',
    limitedEdition: false,
    freeShipping: true,
    fastDelivery: true
  },
  {
    id: 'cross_shoe_002',
    name: 'Minimalist White Sneakers',
    brand: 'Common Projects',
    price: 349.99,
    imageUrl: 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'De Bijenkorf',
    affiliateLink: generateCrossSellAffiliateLink('De Bijenkorf', 'cross_shoe_002'),
    category: 'Schoenen',
    description: 'De perfecte minimalistische sneaker. Tijdloos design dat bij elke stijl past.',
    tags: ['minimalist', 'white', 'luxury', 'tijdloos', 'premium'],
    psychologicalTrigger: 'Favoriete keuze van minimalisten wereldwijd - verhoogt outfit-waardering met 89%',
    urgencyMessage: 'Exclusief bij De Bijenkorf - gratis premium gift wrapping',
    personalizedMessage: 'Jouw verfijnde smaak verdient deze investering in tijdloze elegantie!',
    popularityIndicator: 'Cult favorite',
    limitedEdition: true,
    freeShipping: true,
    fastDelivery: false
  },
  {
    id: 'cross_shoe_003',
    name: 'Chunky Platform Sneakers',
    brand: 'Buffalo',
    price: 129.95,
    imageUrl: 'https://images.pexels.com/photos/2529157/pexels-photo-2529157.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'ASOS NL',
    affiliateLink: generateCrossSellAffiliateLink('ASOS NL', 'cross_shoe_003'),
    category: 'Schoenen',
    description: 'Statement platform sneakers voor de moedige fashionista. Comfort en stijl in één.',
    tags: ['platform', 'chunky', 'statement', 'trendy', 'bold'],
    psychologicalTrigger: 'Trending op TikTok - 2M+ views met #ChunkyPlatformVibes',
    urgencyMessage: 'Viral hit - elke 8 minuten verkocht, bekijk snel!',
    personalizedMessage: 'Jij durft op te vallen en dat is precies wat deze sneakers doen - pure confidence!',
    popularityIndicator: 'Viral op social media',
    limitedEdition: false,
    freeShipping: true,
    fastDelivery: true
  },

  // HORLOGES
  {
    id: 'cross_watch_001',
    name: 'Minimalist Gold Watch',
    brand: 'Daniel Wellington',
    price: 179.00,
    originalPrice: 199.00,
    imageUrl: 'https://images.pexels.com/photos/6764034/pexels-photo-6764034.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'Bol.com',
    affiliateLink: generateCrossSellAffiliateLink('Bol.com', 'cross_watch_001'),
    category: 'Horloges',
    description: 'Elegant minimalistisch horloge dat bij elke gelegenheid past. Tijdloze stijl en Zweedse kwaliteit.',
    tags: ['minimalist', 'gold', 'elegant', 'tijdloos', 'zweedse'],
    psychologicalTrigger: 'Populaire keuze onder young professionals - 94% krijgt complimenten',
    urgencyMessage: 'Gratis gravering bij Bol.com - maak het persoonlijk!',
    personalizedMessage: 'Jij weet dat details het verschil maken - dit horloge is jouw signature piece!',
    popularityIndicator: 'Elke 15 minuten besteld',
    limitedEdition: false,
    freeShipping: true,
    fastDelivery: true
  },
  {
    id: 'cross_watch_002',
    name: 'Smart Fitness Watch',
    brand: 'Apple',
    price: 429.00,
    imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'Wehkamp',
    affiliateLink: generateCrossSellAffiliateLink('Wehkamp', 'cross_watch_002'),
    category: 'Horloges',
    description: 'De perfecte combinatie van stijl en functionaliteit. Track je fitness en blijf connected.',
    tags: ['smart', 'fitness', 'tech', 'modern', 'multifunctioneel'],
    psychologicalTrigger: 'Favoriete keuze van actieve professionals - verhoogt productiviteit met 73%',
    urgencyMessage: 'Gratis sportbandje ter waarde van €49 bij aankoop!',
    personalizedMessage: 'Jij combineert stijl met functionaliteit - dit horloge past perfect bij jouw actieve lifestyle!',
    popularityIndicator: '#1 smartwatch in Nederland',
    limitedEdition: false,
    freeShipping: true,
    fastDelivery: true
  },
  {
    id: 'cross_watch_003',
    name: 'Vintage Leather Watch',
    brand: 'Fossil',
    price: 149.95,
    originalPrice: 179.95,
    imageUrl: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'Zalando',
    affiliateLink: generateCrossSellAffiliateLink('Zalando', 'cross_watch_003'),
    category: 'Horloges',
    description: 'Vintage-geïnspireerd horloge met leren band. Klassieke elegantie voor de moderne man/vrouw.',
    tags: ['vintage', 'leer', 'klassiek', 'elegant', 'retro'],
    psychologicalTrigger: 'Retro revival trend - 87% van vintage lovers koopt dit opnieuw',
    urgencyMessage: 'Sale eindigt morgen - bespaar €30 op deze vintage classic!',
    personalizedMessage: 'Jouw liefde voor vintage stijl verdient dit authentieke timepiece!',
    popularityIndicator: 'Vintage revival hit',
    limitedEdition: false,
    freeShipping: true,
    fastDelivery: true
  },

  // SJAALS
  {
    id: 'cross_scarf_001',
    name: 'Cashmere Sjaal',
    brand: 'Acne Studios',
    price: 289.00,
    imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'De Bijenkorf',
    affiliateLink: generateCrossSellAffiliateLink('De Bijenkorf', 'cross_scarf_001'),
    category: 'Sjaals',
    description: 'Luxe cashmere sjaal in tijdloze kleuren. De perfecte finishing touch voor elke outfit.',
    tags: ['cashmere', 'luxury', 'soft', 'warm', 'tijdloos'],
    psychologicalTrigger: 'Luxe investering - 98% ervaart dit als upgrade van hun hele garderobe',
    urgencyMessage: 'Limited winter collectie - laatste stuks in premium cashmere',
    personalizedMessage: 'Jij verdient de zachtheid en luxe van echte cashmere - pure verwennerij!',
    popularityIndicator: 'Luxury bestseller',
    limitedEdition: true,
    freeShipping: true,
    fastDelivery: false
  },
  {
    id: 'cross_scarf_002',
    name: 'Silk Print Sjaal',
    brand: 'Hermès',
    price: 395.00,
    imageUrl: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'De Bijenkorf',
    affiliateLink: generateCrossSellAffiliateLink('De Bijenkorf', 'cross_scarf_002'),
    category: 'Sjaals',
    description: 'Iconische zijden sjaal met artistieke print. Een statement piece dat generaties meegaat.',
    tags: ['silk', 'print', 'artistic', 'iconic', 'heritage'],
    psychologicalTrigger: 'Iconische investering - wordt doorgegeven van generatie op generatie',
    urgencyMessage: 'Exclusieve collectie - slechts 25 stuks beschikbaar in Nederland',
    personalizedMessage: 'Jij begrijpt dat echte stijl tijdloos is - dit is jouw signature piece!',
    popularityIndicator: 'Collector\'s item',
    limitedEdition: true,
    freeShipping: true,
    fastDelivery: false
  },
  {
    id: 'cross_scarf_003',
    name: 'Oversized Knit Sjaal',
    brand: 'Ganni',
    price: 89.95,
    imageUrl: 'https://images.pexels.com/photos/4066293/pexels-photo-4066293.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'H&M NL',
    affiliateLink: generateCrossSellAffiliateLink('H&M NL', 'cross_scarf_003'),
    category: 'Sjaals',
    description: 'Trendy oversized gebreide sjaal voor een cozy maar stijlvolle look. Perfect voor de Nederlandse winter.',
    tags: ['oversized', 'knit', 'cozy', 'trendy', 'warm'],
    psychologicalTrigger: 'Trending bij Scandinavische influencers - 91% draagt dit dagelijks in winter',
    urgencyMessage: 'Populaire winter must-have - bestel voor uitverkocht!',
    personalizedMessage: 'Jij weet hoe je cozy en chic combineert - deze sjaal is jouw winter essential!',
    popularityIndicator: 'Winter bestseller',
    limitedEdition: false,
    freeShipping: true,
    fastDelivery: true
  }
];

// Function to get cross-sell products by user profile
export const getCrossSellByProfile = (profileType: string): CrossSellProduct[] => {
  const profileMappings = {
    'mindful_minimalist': ['cross_shoe_002', 'cross_watch_001', 'cross_scarf_001'],
    'refined_minimalist': ['cross_shoe_002', 'cross_watch_001', 'cross_scarf_001'],
    'professional_classic': ['cross_shoe_001', 'cross_watch_001', 'cross_scarf_002'],
    'timeless_elegance': ['cross_shoe_001', 'cross_watch_003', 'cross_scarf_002'],
    'urban_trendsetter': ['cross_shoe_003', 'cross_watch_002', 'cross_scarf_003'],
    'creative_individualist': ['cross_shoe_003', 'cross_watch_003', 'cross_scarf_003'],
    'free_spirit': ['cross_shoe_001', 'cross_watch_003', 'cross_scarf_003'],
    'comfort_conscious': ['cross_shoe_001', 'cross_watch_002', 'cross_scarf_003'],
    'sophisticated_modern': ['cross_shoe_002', 'cross_watch_001', 'cross_scarf_001'],
    'balanced_explorer': ['cross_shoe_001', 'cross_watch_001', 'cross_scarf_001']
  };

  const productIds = profileMappings[profileType] || profileMappings['balanced_explorer'];
  
  return crossSellProductDatabase.filter(product => 
    productIds.includes(product.id)
  );
};

// Function to get cross-sell products by category
export const getCrossSellByCategory = (categories: string[] = ['Schoenen', 'Horloges', 'Sjaals']): Record<string, CrossSellProduct[]> => {
  const result: Record<string, CrossSellProduct[]> = {};
  
  categories.forEach(category => {
    result[category] = crossSellProductDatabase.filter(product => 
      product.category === category
    ).slice(0, 1); // One product per category for cross-sell
  });
  
  return result;
};

// Function to track cross-sell click
export const trackCrossSellClick = (product: CrossSellProduct, source: string = 'cross_sell_section') => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'cross_sell_click', {
      event_category: 'ecommerce',
      event_label: `${product.retailer}_${product.id}`,
      item_id: product.id,
      item_name: product.name,
      item_brand: product.brand,
      item_category: product.category,
      price: product.price,
      currency: 'EUR',
      custom_parameter_1: 'cross_sell_conversion',
      custom_parameter_2: product.retailer.toLowerCase(),
      custom_parameter_3: source
    });
  }
  
  console.log(`📊 Cross-sell click tracked: ${product.name} at ${product.retailer} - GA4 event sent`);
};