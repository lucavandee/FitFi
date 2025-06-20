// Dutch market product data with real retailers and affiliate structure
export interface DutchProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  retailer: 'Zalando' | 'Wehkamp' | 'H&M NL' | 'ASOS NL' | 'Bol.com' | 'De Bijenkorf';
  affiliateLink: string;
  category: 'Jassen' | 'Broeken' | 'Accessoires' | 'Schoenen' | 'Tops' | 'Jurken';
  description: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  // New psychological trigger fields
  psychologicalTrigger: string;
  urgencyMessage: string;
  personalizedMessage: string;
  popularityIndicator?: string;
  limitedEdition?: boolean;
  freeShipping?: boolean;
  fastDelivery?: boolean;
}

// Mock affiliate tracking function
const generateAffiliateLink = (retailer: string, productId: string): string => {
  const affiliateIds = {
    'Zalando': 'fitfi_zal_001',
    'Wehkamp': 'fitfi_weh_001', 
    'H&M NL': 'fitfi_hm_001',
    'ASOS NL': 'fitfi_asos_001',
    'Bol.com': 'fitfi_bol_001',
    'De Bijenkorf': 'fitfi_bij_001'
  };
  
  const baseUrls = {
    'Zalando': 'https://www.zalando.nl',
    'Wehkamp': 'https://www.wehkamp.nl',
    'H&M NL': 'https://www2.hm.com/nl_nl',
    'ASOS NL': 'https://www.asos.com/nl',
    'Bol.com': 'https://www.bol.com',
    'De Bijenkorf': 'https://www.debijenkorf.nl'
  };
  
  return `${baseUrls[retailer]}/product/${productId}?ref=${affiliateIds[retailer]}&utm_source=fitfi&utm_medium=affiliate&utm_campaign=style_recommendations`;
};

export const dutchProductDatabase: DutchProduct[] = [
  // JASSEN CATEGORIE
  {
    id: 'jas_001',
    name: 'Klassieke Wollen Mantel',
    brand: 'Mango',
    price: 129.99,
    originalPrice: 159.99,
    imageUrl: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'Zalando',
    affiliateLink: generateAffiliateLink('Zalando', 'jas_001'),
    category: 'Jassen',
    description: 'Elegante wollen mantel perfect voor de Nederlandse winter. Tijdloos design met moderne pasvorm.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Zwart', 'Camel', 'Navy'],
    inStock: true,
    rating: 4.5,
    reviewCount: 127,
    tags: ['winter', 'elegant', 'tijdloos', 'warm'],
    psychologicalTrigger: 'Populaire keuze onder Nederlandse professionals - 89% koopt deze mantel opnieuw',
    urgencyMessage: 'Laatste stuks in jouw maat - bestel vandaag voor levering morgen',
    personalizedMessage: 'Jij verdient een mantel die net zo tijdloos is als jouw stijl!',
    popularityIndicator: '127 mensen kochten dit deze week',
    limitedEdition: false,
    freeShipping: true,
    fastDelivery: true
  },
  {
    id: 'jas_002', 
    name: 'Oversized Denim Jacket',
    brand: 'H&M',
    price: 39.99,
    imageUrl: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'H&M NL',
    affiliateLink: generateAffiliateLink('H&M NL', 'jas_002'),
    category: 'Jassen',
    description: 'Trendy oversized denim jacket voor een casual streetwear look. Perfect voor tussenseizoenen.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Light Blue', 'Dark Blue', 'Black'],
    inStock: true,
    rating: 4.2,
    reviewCount: 89,
    tags: ['casual', 'denim', 'streetwear', 'oversized'],
    psychologicalTrigger: 'Trending nu - #1 bestseller in streetwear bij H&M NL',
    urgencyMessage: 'Op = op - slechts 3 stuks over in jouw favoriete kleur',
    personalizedMessage: 'Perfect voor jouw dynamische lifestyle - casual maar altijd stijlvol!',
    popularityIndicator: 'Elke 4 minuten verkocht',
    limitedEdition: false,
    freeShipping: true,
    fastDelivery: true
  },
  {
    id: 'jas_003',
    name: 'Minimalist Trench Coat',
    brand: 'COS',
    price: 195.00,
    imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'De Bijenkorf',
    affiliateLink: generateAffiliateLink('De Bijenkorf', 'jas_003'),
    category: 'Jassen',
    description: 'Minimalistische trench coat met clean lines. Perfect voor de moderne professional.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Beige', 'Black', 'Olive'],
    inStock: true,
    rating: 4.7,
    reviewCount: 45,
    tags: ['minimalist', 'professional', 'trench', 'clean'],
    psychologicalTrigger: 'Limited edition - exclusief verkrijgbaar bij De Bijenkorf',
    urgencyMessage: 'Bekijk snel - gratis verzending eindigt over 2 dagen',
    personalizedMessage: 'Jouw verfijnde smaak verdient deze tijdloze investering!',
    popularityIndicator: 'Favoriete keuze van stylisten',
    limitedEdition: true,
    freeShipping: true,
    fastDelivery: false
  },

  // BROEKEN CATEGORIE
  {
    id: 'broek_001',
    name: 'High-Waist Mom Jeans',
    brand: 'Weekday',
    price: 69.99,
    imageUrl: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'ASOS NL',
    affiliateLink: generateAffiliateLink('ASOS NL', 'broek_001'),
    category: 'Broeken',
    description: 'Vintage-inspired mom jeans met hoge taille. Comfortabel en stijlvol voor dagelijks gebruik.',
    sizes: ['24', '25', '26', '27', '28', '29', '30', '31', '32'],
    colors: ['Light Blue', 'Dark Blue', 'Black', 'White'],
    inStock: true,
    rating: 4.4,
    reviewCount: 203,
    tags: ['vintage', 'high-waist', 'casual', 'denim'],
    psychologicalTrigger: 'Populaire keuze onder influencers - 94% beveelt aan',
    urgencyMessage: 'Laatste kans - morgen weer op voorraad voor €79.99',
    personalizedMessage: 'Jij weet wat goed is - deze jeans flatteren elke figuur perfect!',
    popularityIndicator: '203 reviews, gemiddeld 4.4 sterren',
    limitedEdition: false,
    freeShipping: true,
    fastDelivery: true
  },
  {
    id: 'broek_002',
    name: 'Tailored Palazzo Pants',
    brand: 'Massimo Dutti',
    price: 89.95,
    imageUrl: 'https://images.pexels.com/photos/2529157/pexels-photo-2529157.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'Zalando',
    affiliateLink: generateAffiliateLink('Zalando', 'broek_002'),
    category: 'Broeken',
    description: 'Elegante palazzo broek met wijde pijpen. Perfect voor kantoor of speciale gelegenheden.',
    sizes: ['34', '36', '38', '40', '42', '44'],
    colors: ['Black', 'Navy', 'Camel', 'Burgundy'],
    inStock: true,
    rating: 4.6,
    reviewCount: 78,
    tags: ['elegant', 'wide-leg', 'professional', 'flowing'],
    psychologicalTrigger: 'Favoriete keuze van zakelijke vrouwen - verhoogt zelfvertrouwen met 73%',
    urgencyMessage: 'Bestel nu voor levering binnen 24 uur in Nederland',
    personalizedMessage: 'Jouw professionele uitstraling verdient deze elegante upgrade!',
    popularityIndicator: 'Bestseller in business wear',
    limitedEdition: false,
    freeShipping: true,
    fastDelivery: true
  },
  {
    id: 'broek_003',
    name: 'Cargo Joggers',
    brand: 'Nike',
    price: 79.99,
    originalPrice: 99.99,
    imageUrl: 'https://images.pexels.com/photos/4066293/pexels-photo-4066293.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'Bol.com',
    affiliateLink: generateAffiliateLink('Bol.com', 'broek_003'),
    category: 'Broeken',
    description: 'Comfortabele cargo joggers voor een sportieve streetwear look. Met praktische zakken.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Olive', 'Grey', 'Navy'],
    inStock: true,
    rating: 4.3,
    reviewCount: 156,
    tags: ['sporty', 'comfortable', 'streetwear', 'cargo'],
    psychologicalTrigger: 'Gratis verzending bij Bol.com - bespaar €6.99 verzendkosten',
    urgencyMessage: 'Sale eindigt vanavond - bespaar €20 op deze populaire joggers',
    personalizedMessage: 'Jij verdient comfort zonder in te leveren op stijl!',
    popularityIndicator: 'Elke 7 minuten besteld',
    limitedEdition: false,
    freeShipping: true,
    fastDelivery: true
  },

  // ACCESSOIRES CATEGORIE
  {
    id: 'acc_001',
    name: 'Leren Crossbody Tas',
    brand: 'Liebeskind Berlin',
    price: 149.95,
    originalPrice: 199.95,
    imageUrl: 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'De Bijenkorf',
    affiliateLink: generateAffiliateLink('De Bijenkorf', 'acc_001'),
    category: 'Accessoires',
    description: 'Luxe leren crossbody tas met verstelbare riem. Perfect voor dagelijks gebruik.',
    sizes: ['One Size'],
    colors: ['Black', 'Cognac', 'Navy', 'Taupe'],
    inStock: true,
    rating: 4.8,
    reviewCount: 92,
    tags: ['leather', 'crossbody', 'luxury', 'versatile'],
    psychologicalTrigger: 'Limited edition - slechts 50 stuks beschikbaar in Nederland',
    urgencyMessage: 'Op = op - laatste exemplaren van deze gelimiteerde editie',
    personalizedMessage: 'Jouw stijl verdient een tas die net zo uniek is als jij!',
    popularityIndicator: 'Wachtlijst van 200+ mensen',
    limitedEdition: true,
    freeShipping: true,
    fastDelivery: false
  },
  {
    id: 'acc_002',
    name: 'Gouden Layering Kettingen Set',
    brand: 'Pilgrim',
    price: 34.95,
    imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'Wehkamp',
    affiliateLink: generateAffiliateLink('Wehkamp', 'acc_002'),
    category: 'Accessoires',
    description: 'Set van 3 gouden kettingen in verschillende lengtes. Perfect voor layering.',
    sizes: ['One Size'],
    colors: ['Gold', 'Silver', 'Rose Gold'],
    inStock: true,
    rating: 4.5,
    reviewCount: 134,
    tags: ['jewelry', 'layering', 'trendy', 'set'],
    psychologicalTrigger: 'Populaire keuze onder fashion bloggers - 96% draagt dit dagelijks',
    urgencyMessage: 'Gratis verzending bij Wehkamp - bestel voor 23:59 voor levering morgen',
    personalizedMessage: 'Jij weet hoe je een outfit compleet maakt - deze set is jouw geheime wapen!',
    popularityIndicator: 'Elke 3 minuten verkocht',
    limitedEdition: false,
    freeShipping: true,
    fastDelivery: true
  },
  {
    id: 'acc_003',
    name: 'Wollen Bucket Hat',
    brand: 'Arket',
    price: 29.99,
    imageUrl: 'https://images.pexels.com/photos/6764034/pexels-photo-6764034.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    retailer: 'H&M NL',
    affiliateLink: generateAffiliateLink('H&M NL', 'acc_003'),
    category: 'Accessoires',
    description: 'Trendy wollen bucket hat voor een casual streetwear look. Warm en stijlvol.',
    sizes: ['S/M', 'L/XL'],
    colors: ['Black', 'Beige', 'Brown', 'Grey'],
    inStock: true,
    rating: 4.1,
    reviewCount: 67,
    tags: ['hat', 'wool', 'streetwear', 'trendy'],
    psychologicalTrigger: 'Trending op social media - 15.000+ posts met #ArketBucketHat',
    urgencyMessage: 'Bekijk snel - gratis verzending bij H&M NL voor bestellingen boven €20',
    personalizedMessage: 'Jij durft op te vallen - deze hat maakt jouw look compleet!',
    popularityIndicator: 'Viral op TikTok',
    limitedEdition: false,
    freeShipping: true,
    fastDelivery: true
  }
];

// Function to get products by category
export const getProductsByCategory = (category: string): DutchProduct[] => {
  return dutchProductDatabase.filter(product => product.category === category);
};

// Function to get featured products for recommendations
export const getFeaturedProducts = (categories: string[] = ['Jassen', 'Broeken', 'Accessoires']): Record<string, DutchProduct[]> => {
  const featured: Record<string, DutchProduct[]> = {};
  
  categories.forEach(category => {
    featured[category] = getProductsByCategory(category).slice(0, 3);
  });
  
  return featured;
};

// Function to track affiliate click
export const trackAffiliateClick = (product: DutchProduct, source: string = 'recommendations') => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'affiliate_click', {
      event_category: 'ecommerce',
      event_label: `${product.retailer}_${product.id}`,
      item_id: product.id,
      item_name: product.name,
      item_brand: product.brand,
      item_category: product.category,
      price: product.price,
      currency: 'EUR',
      custom_parameter_1: 'affiliate_conversion',
      custom_parameter_2: product.retailer.toLowerCase(),
      custom_parameter_3: source
    });
  }
  
  console.log(`📊 Affiliate click tracked: ${product.name} at ${product.retailer} - GA4 event sent`);
};