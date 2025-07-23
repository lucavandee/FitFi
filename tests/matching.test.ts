import { describe, it, expect, beforeEach } from 'vitest';
import {
  filterProductsByGender,
  filterProductsForUser,
  analyzeGenderDistribution,
  validateGenderRepresentation,
  isValidGender,
  hasValidGenderTags,
  getGenderTagForUser,
  type SupportedGender,
  type ProductGenderTag
} from '../src/lib/matching';
import { Product } from '../src/engine/types';
import { UserProfile } from '../src/context/UserContext';

// Mock product data for testing
const createMockProduct = (id: string, name: string, styleTags: string[], price: number = 50): Product => ({
  id,
  name,
  imageUrl: `https://example.com/${id}.jpg`,
  type: 'shirt',
  category: 'top',
  styleTags,
  description: `Mock product ${name}`,
  price,
  brand: 'Test Brand',
  affiliateUrl: `https://example.com/product/${id}`,
  season: ['spring', 'summer']
});

// Test product arrays
const mockProducts: Product[] = [
  createMockProduct('men-1', 'Men\'s T-Shirt', ['men', 'casual']),
  createMockProduct('men-2', 'Men\'s Jeans', ['men', 'denim']),
  createMockProduct('men-3', 'Men\'s Sneakers', ['men', 'sporty']),
  createMockProduct('women-1', 'Women\'s Blouse', ['women', 'elegant']),
  createMockProduct('women-2', 'Women\'s Dress', ['women', 'formal']),
  createMockProduct('women-3', 'Women\'s Heels', ['women', 'formal']),
  createMockProduct('unisex-1', 'Unisex Hoodie', ['unisex', 'casual']),
  createMockProduct('unisex-2', 'Unisex Backpack', ['unisex', 'accessory']),
  createMockProduct('unisex-3', 'Unisex Watch', ['unisex', 'luxury']),
  createMockProduct('no-gender-1', 'Generic Item', ['casual']), // No gender tag
  createMockProduct('no-gender-2', 'Another Item', ['formal']) // No gender tag
];

const mockUser: UserProfile = {
  id: 'test-user',
  name: 'Test User',
  email: 'test@example.com',
  gender: 'female',
  stylePreferences: {
    casual: 4,
    formal: 3,
    sporty: 2,
    vintage: 3,
    minimalist: 4
  },
  isPremium: false,
  savedRecommendations: []
};

describe('Gender Mapping - Core Functionality', () => {
  describe('filterProductsByGender', () => {
    it('should return only men products for male gender', () => {
      const result = filterProductsByGender(mockProducts, 'male');
      
      expect(result).toHaveLength(3);
      expect(result.every(p => p.styleTags?.includes('men'))).toBe(true);
      expect(result.map(p => p.id)).toEqual(['men-1', 'men-2', 'men-3']);
    });

    it('should return only women products for female gender', () => {
      const result = filterProductsByGender(mockProducts, 'female');
      
      expect(result).toHaveLength(3);
      expect(result.every(p => p.styleTags?.includes('women'))).toBe(true);
      expect(result.map(p => p.id)).toEqual(['women-1', 'women-2', 'women-3']);
    });

    it('should return only unisex products for neutral gender', () => {
      const result = filterProductsByGender(mockProducts, 'neutral');
      
      expect(result).toHaveLength(3);
      expect(result.every(p => p.styleTags?.includes('unisex'))).toBe(true);
      expect(result.map(p => p.id)).toEqual(['unisex-1', 'unisex-2', 'unisex-3']);
    });

    it('should fallback to unisex products when no gender-specific products found', () => {
      const limitedProducts = [
        createMockProduct('unisex-only', 'Unisex Item', ['unisex', 'casual'])
      ];
      
      const result = filterProductsByGender(limitedProducts, 'male');
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('unisex-only');
      expect(result[0].styleTags).toContain('unisex');
    });

    it('should fallback to all products when no gender-specific or unisex products found', () => {
      const noGenderProducts = [
        createMockProduct('no-gender', 'Generic Item', ['casual'])
      ];
      
      const result = filterProductsByGender(noGenderProducts, 'male');
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('no-gender');
    });
  });

  describe('Error Handling & Validation', () => {
    it('should throw error for invalid gender in strict mode', () => {
      expect(() => {
        filterProductsByGender(mockProducts, 'invalid' as any, { strictMode: true });
      }).toThrow('Invalid user gender: invalid');
    });

    it('should handle invalid gender gracefully in non-strict mode', () => {
      const result = filterProductsByGender(mockProducts, 'invalid' as any, { 
        strictMode: false,
        logWarnings: false 
      });
      
      // Should default to neutral and return unisex products
      expect(result).toHaveLength(3);
      expect(result.every(p => p.styleTags?.includes('unisex'))).toBe(true);
    });

    it('should handle empty products array', () => {
      const result = filterProductsByGender([], 'male');
      expect(result).toEqual([]);
    });

    it('should handle null/undefined products gracefully', () => {
      expect(() => {
        filterProductsByGender(null as any, 'male', { strictMode: true });
      }).toThrow('Products must be an array');
      
      const result = filterProductsByGender(null as any, 'male', { strictMode: false });
      expect(result).toEqual([]);
    });

    it('should handle products without styleTags', () => {
      const invalidProducts = [
        { id: 'invalid', name: 'Invalid Product' } as Product
      ];
      
      const result = filterProductsByGender(invalidProducts, 'male', { logWarnings: false });
      expect(result).toEqual([]);
    });
  });

  describe('Configuration Options', () => {
    it('should respect strictMode configuration', () => {
      expect(() => {
        filterProductsByGender(mockProducts, 'invalid' as any, { strictMode: true });
      }).toThrow();
      
      const result = filterProductsByGender(mockProducts, 'invalid' as any, { strictMode: false });
      expect(Array.isArray(result)).toBe(true);
    });

    it('should respect fallbackToUnisex configuration', () => {
      const menOnlyProducts = [
        createMockProduct('men-only', 'Men Only', ['men'])
      ];
      
      // With fallback enabled (default)
      const withFallback = filterProductsByGender(menOnlyProducts, 'female');
      expect(withFallback).toEqual(menOnlyProducts); // Falls back to all products
      
      // With fallback disabled
      const withoutFallback = filterProductsByGender(menOnlyProducts, 'female', { 
        fallbackToUnisex: false 
      });
      expect(withoutFallback).toEqual([]);
    });
  });
});

describe('Enhanced User Filtering', () => {
  describe('filterProductsForUser', () => {
    it('should combine gender filtering with additional filters', () => {
      const result = filterProductsForUser(mockProducts, mockUser, {
        categories: ['top'],
        priceRange: { min: 40, max: 60 }
      });
      
      // Should only return women products in the top category within price range
      expect(result.every(p => p.styleTags?.includes('women'))).toBe(true);
      expect(result.every(p => p.category === 'top' || p.type === 'top')).toBe(true);
      expect(result.every(p => p.price >= 40 && p.price <= 60)).toBe(true);
    });

    it('should filter by brands when specified', () => {
      const productsWithBrands = [
        createMockProduct('brand-1', 'Nike Shoes', ['women'], 80),
        createMockProduct('brand-2', 'Adidas Shirt', ['women'], 60)
      ];
      productsWithBrands[0].brand = 'Nike';
      productsWithBrands[1].brand = 'Adidas';
      
      const result = filterProductsForUser(productsWithBrands, mockUser, {
        brands: ['Nike']
      });
      
      expect(result).toHaveLength(1);
      expect(result[0].brand).toBe('Nike');
    });

    it('should filter by seasons when specified', () => {
      const seasonalProducts = [
        createMockProduct('summer-1', 'Summer Dress', ['women']),
        createMockProduct('winter-1', 'Winter Coat', ['women'])
      ];
      seasonalProducts[0].season = ['summer'];
      seasonalProducts[1].season = ['winter'];
      
      const result = filterProductsForUser(seasonalProducts, mockUser, {
        seasons: ['summer']
      });
      
      expect(result).toHaveLength(1);
      expect(result[0].season).toContain('summer');
    });
  });
});

describe('Data Analysis Functions', () => {
  describe('analyzeGenderDistribution', () => {
    it('should correctly analyze gender distribution', () => {
      const analysis = analyzeGenderDistribution(mockProducts);
      
      expect(analysis.total).toBe(11);
      expect(analysis.men).toBe(3);
      expect(analysis.women).toBe(3);
      expect(analysis.unisex).toBe(3);
      expect(analysis.noGenderTags).toBe(2);
      expect(analysis.distribution.men).toBe(3);
      expect(analysis.distribution.women).toBe(3);
      expect(analysis.distribution.unisex).toBe(3);
    });

    it('should handle empty product array', () => {
      const analysis = analyzeGenderDistribution([]);
      
      expect(analysis.total).toBe(0);
      expect(analysis.men).toBe(0);
      expect(analysis.women).toBe(0);
      expect(analysis.unisex).toBe(0);
      expect(analysis.noGenderTags).toBe(0);
    });
  });

  describe('validateGenderRepresentation', () => {
    it('should validate adequate gender representation', () => {
      const validation = validateGenderRepresentation(mockProducts, 20);
      
      expect(validation.isValid).toBe(true);
      expect(validation.recommendations).toHaveLength(0);
    });

    it('should identify inadequate gender representation', () => {
      const imbalancedProducts = [
        ...mockProducts.filter(p => p.styleTags?.includes('men')), // Only men products
        createMockProduct('men-4', 'Extra Men Item', ['men'])
      ];
      
      const validation = validateGenderRepresentation(imbalancedProducts, 20);
      
      expect(validation.isValid).toBe(false);
      expect(validation.recommendations.length).toBeGreaterThan(0);
      expect(validation.recommendations.some(r => r.includes('women'))).toBe(true);
      expect(validation.recommendations.some(r => r.includes('unisex'))).toBe(true);
    });

    it('should recommend adding gender tags for untagged products', () => {
      const untaggedProducts = [
        createMockProduct('no-tags-1', 'Item 1', []),
        createMockProduct('no-tags-2', 'Item 2', ['casual'])
      ];
      
      const validation = validateGenderRepresentation(untaggedProducts, 20);
      
      expect(validation.isValid).toBe(false);
      expect(validation.recommendations.some(r => r.includes('no gender tags'))).toBe(true);
    });
  });
});

describe('Utility Functions', () => {
  describe('isValidGender', () => {
    it('should validate supported genders', () => {
      expect(isValidGender('male')).toBe(true);
      expect(isValidGender('female')).toBe(true);
      expect(isValidGender('neutral')).toBe(true);
      expect(isValidGender('invalid')).toBe(false);
      expect(isValidGender(null)).toBe(false);
      expect(isValidGender(undefined)).toBe(false);
    });
  });

  describe('hasValidGenderTags', () => {
    it('should validate products with gender tags', () => {
      const validProduct = createMockProduct('valid', 'Valid Product', ['men', 'casual']);
      const invalidProduct = createMockProduct('invalid', 'Invalid Product', ['casual']);
      const noTagsProduct = { ...createMockProduct('no-tags', 'No Tags', []), styleTags: undefined };
      
      expect(hasValidGenderTags(validProduct)).toBe(true);
      expect(hasValidGenderTags(invalidProduct)).toBe(false);
      expect(hasValidGenderTags(noTagsProduct)).toBe(false);
    });
  });

  describe('getGenderTagForUser', () => {
    it('should map user genders to product tags', () => {
      expect(getGenderTagForUser('male')).toBe('men');
      expect(getGenderTagForUser('female')).toBe('women');
      expect(getGenderTagForUser('neutral')).toBe('unisex');
    });
  });
});

describe('Edge Cases & Performance', () => {
  it('should handle large product arrays efficiently', () => {
    const largeProductArray = Array.from({ length: 1000 }, (_, i) => 
      createMockProduct(`product-${i}`, `Product ${i}`, [i % 3 === 0 ? 'men' : i % 3 === 1 ? 'women' : 'unisex'])
    );
    
    const startTime = Date.now();
    const result = filterProductsByGender(largeProductArray, 'male');
    const endTime = Date.now();
    
    expect(result.length).toBeGreaterThan(0);
    expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
  });

  it('should handle products with multiple gender tags', () => {
    const multiGenderProduct = createMockProduct('multi', 'Multi Gender', ['men', 'women', 'unisex']);
    const products = [multiGenderProduct];
    
    const maleResult = filterProductsByGender(products, 'male');
    const femaleResult = filterProductsByGender(products, 'female');
    const neutralResult = filterProductsByGender(products, 'neutral');
    
    expect(maleResult).toHaveLength(1);
    expect(femaleResult).toHaveLength(1);
    expect(neutralResult).toHaveLength(1);
  });

  it('should maintain product object integrity', () => {
    const originalProducts = [...mockProducts];
    const result = filterProductsByGender(mockProducts, 'male');
    
    // Original array should not be modified
    expect(mockProducts).toEqual(originalProducts);
    
    // Returned products should have all original properties
    result.forEach(product => {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('styleTags');
      expect(product).toHaveProperty('price');
    });
  });
});

describe('Integration with UserProfile', () => {
  it('should work with different user gender values', () => {
    const maleUser = { ...mockUser, gender: 'male' as const };
    const femaleUser = { ...mockUser, gender: 'female' as const };
    const neutralUser = { ...mockUser, gender: 'neutral' as const };
    
    const maleResult = filterProductsForUser(mockProducts, maleUser);
    const femaleResult = filterProductsForUser(mockProducts, femaleUser);
    const neutralResult = filterProductsForUser(mockProducts, neutralUser);
    
    expect(maleResult.every(p => p.styleTags?.includes('men'))).toBe(true);
    expect(femaleResult.every(p => p.styleTags?.includes('women'))).toBe(true);
    expect(neutralResult.every(p => p.styleTags?.includes('unisex'))).toBe(true);
  });

  it('should handle missing gender in user profile', () => {
    const userWithoutGender = { ...mockUser, gender: undefined };
    
    const result = filterProductsForUser(mockProducts, userWithoutGender, {}, { 
      strictMode: false,
      logWarnings: false 
    });
    
    // Should default to neutral and return unisex products
    expect(result.every(p => p.styleTags?.includes('unisex'))).toBe(true);
  });
});