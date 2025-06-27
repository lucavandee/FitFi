/**
 * Utility functions for generating mock data
 * Used as fallbacks when Supabase is unavailable
 */

/**
 * Generates a mock user profile
 * @param userId - User ID to use
 * @returns Mock user profile
 */
export const generateMockUser = (userId: string) => {
  return {
    id: userId,
    name: 'Test User',
    email: 'test@example.com',
    gender: 'neutral',
    stylePreferences: {
      casual: 3,
      formal: 3,
      sporty: 3,
      vintage: 3,
      minimalist: 3
    },
    isPremium: false,
    savedRecommendations: []
  };
};

/**
 * Generates mock gamification data
 * @param userId - User ID to use
 * @returns Mock gamification data
 */
export const generateMockGamification = (userId: string) => {
  return {
    id: `mock_gamification_${userId}`,
    user_id: userId,
    points: 0,
    level: 'beginner',
    badges: [],
    streak: 0,
    last_check_in: null,
    completed_challenges: [],
    total_referrals: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

/**
 * Generates mock outfits
 * @param count - Number of outfits to generate
 * @returns Array of mock outfits
 */
export const generateMockOutfits = (count: number = 3) => {
  const baseOutfit = {
    id: 'outfit_001',
    title: 'Casual Urban',
    description: 'Denim Jacket + Slim Fit Jeans + Leren Rugtas. Perfect voor een dag in de stad.',
    match_percentage: 92,
    imageUrl: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2',
    tags: ['casual', 'urban', 'denim', 'streetwear', 'comfortabel'],
    occasions: ['casual', 'weekend', 'stad', 'vrienden'],
    explanation: 'Deze outfit past perfect bij jouw casual urban stijl en is ideaal voor een dag in de stad.',
    items: [
      {
        id: 'item_001',
        outfit_id: 'outfit_001',
        name: 'Oversized Denim Jacket',
        brand: 'H&M',
        price: 39.99,
        imageUrl: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        url: 'https://www2.hm.com/nl_nl/product/jas_002?ref=fitfi_hm_001&utm_source=fitfi&utm_medium=affiliate',
        retailer: 'H&M NL',
        category: 'Jassen'
      },
      {
        id: 'item_002',
        outfit_id: 'outfit_001',
        name: 'High-Waist Mom Jeans',
        brand: 'Weekday',
        price: 69.99,
        imageUrl: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        url: 'https://www.asos.com/nl/product/broek_001?ref=fitfi_asos_001&utm_source=fitfi&utm_medium=affiliate',
        retailer: 'ASOS NL',
        category: 'Broeken'
      }
    ]
  };
  
  // Generate variations
  return Array.from({ length: count }, (_, i) => ({
    ...baseOutfit,
    id: `outfit_00${i + 1}`,
    match_percentage: Math.floor(Math.random() * 15) + 85, // 85-99%
    title: i === 0 ? 'Casual Urban' : i === 1 ? 'Modern Minimalist' : 'Streetwear Chic'
  }));
};

/**
 * Generates mock products
 * @param category - Optional category to filter by
 * @param count - Number of products to generate
 * @returns Array of mock products
 */
export const generateMockProducts = (category?: string, count: number = 10) => {
  const allProducts = [
    {
      id: 'jas_001',
      name: 'Klassieke Wollen Mantel',
      brand: 'Mango',
      price: 129.99,
      original_price: 159.99,
      imageUrl: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
      retailer: 'Zalando',
      url: 'https://www.zalando.nl/product/jas_001?ref=fitfi_zal_001&utm_source=fitfi&utm_medium=affiliate',
      category: 'Jassen',
      description: 'Elegante wollen mantel perfect voor de Nederlandse winter. Tijdloos design met moderne pasvorm.',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Zwart', 'Camel', 'Navy'],
      in_stock: true,
      rating: 4.5,
      review_count: 127,
      tags: ['winter', 'elegant', 'tijdloos', 'warm']
    },
    {
      id: 'broek_001',
      name: 'High-Waist Mom Jeans',
      brand: 'Weekday',
      price: 69.99,
      imageUrl: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
      retailer: 'ASOS NL',
      url: 'https://www.asos.com/nl/product/broek_001?ref=fitfi_asos_001&utm_source=fitfi&utm_medium=affiliate',
      category: 'Broeken',
      description: 'Vintage-inspired mom jeans met hoge taille. Comfortabel en stijlvol voor dagelijks gebruik.',
      sizes: ['24', '25', '26', '27', '28', '29', '30', '31', '32'],
      colors: ['Light Blue', 'Dark Blue', 'Black', 'White'],
      in_stock: true,
      rating: 4.4,
      review_count: 203,
      tags: ['vintage', 'high-waist', 'casual', 'denim']
    },
    {
      id: 'top_001',
      name: 'Oversized T-shirt',
      brand: 'COS',
      price: 29.99,
      imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
      retailer: 'H&M NL',
      url: 'https://www2.hm.com/nl_nl/product/top_001?ref=fitfi_hm_001&utm_source=fitfi&utm_medium=affiliate',
      category: 'Tops',
      description: 'Comfortabel oversized T-shirt van hoogwaardig katoen. Veelzijdig voor casual looks.',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['White', 'Black', 'Grey', 'Navy'],
      in_stock: true,
      rating: 4.2,
      review_count: 156,
      tags: ['basic', 'casual', 'oversized', 'cotton']
    }
  ];

  if (category) {
    return allProducts
      .filter(product => product.category === category)
      .slice(0, count);
  }
  
  return allProducts.slice(0, count);
};

export default {
  generateMockUser,
  generateMockGamification,
  generateMockOutfits,
  generateMockProducts
};