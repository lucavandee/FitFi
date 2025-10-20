import { supabase } from '@/lib/supabase';
import { BramsFruitProduct, BramsFruitProductGroup } from './types';
import { mapBramsFruitToFitFiProduct } from './categoryMapper';
import { Product } from '@/engine/types';

export async function getAllBramsFruitProducts(): Promise<BramsFruitProduct[]> {
  const { data, error } = await supabase
    .from('brams_fruit_products')
    .select('*')
    .eq('is_active', true)
    .order('style_code', { ascending: true })
    .order('color', { ascending: true })
    .order('size', { ascending: true });

  if (error) {
    console.error('Error fetching Brams Fruit products:', error);
    return [];
  }

  return data || [];
}

export async function getBramsFruitProductsByCategory(
  category: string
): Promise<BramsFruitProduct[]> {
  const { data, error } = await supabase
    .from('brams_fruit_products')
    .select('*')
    .eq('is_active', true)
    .eq('category', category)
    .order('style_code', { ascending: true });

  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }

  return data || [];
}

export async function getBramsFruitProductsBySubCategory(
  subCategory: string
): Promise<BramsFruitProduct[]> {
  const { data, error } = await supabase
    .from('brams_fruit_products')
    .select('*')
    .eq('is_active', true)
    .eq('sub_category', subCategory)
    .order('style_code', { ascending: true });

  if (error) {
    console.error('Error fetching products by subcategory:', error);
    return [];
  }

  return data || [];
}

export async function getBramsFruitProductGroups(): Promise<BramsFruitProductGroup[]> {
  const products = await getAllBramsFruitProducts();

  const groupMap = new Map<string, BramsFruitProduct[]>();

  products.forEach(product => {
    const existing = groupMap.get(product.style_code) || [];
    groupMap.set(product.style_code, [...existing, product]);
  });

  const groups: BramsFruitProductGroup[] = Array.from(groupMap.entries()).map(
    ([style_code, variants]) => {
      const firstProduct = variants[0];
      const colors = [...new Set(variants.map(v => v.color))];
      const sizes = [...new Set(variants.map(v => v.size))];
      const prices = variants.map(v => v.retail_price);

      return {
        style_code,
        product_name: firstProduct.product_name,
        category: firstProduct.category,
        sub_category: firstProduct.sub_category,
        variants,
        colors,
        sizes,
        price_range: {
          min: Math.min(...prices),
          max: Math.max(...prices),
        },
        image_url: firstProduct.image_url,
      };
    }
  );

  return groups;
}

export async function getBramsFruitProductByStyleCode(
  styleCode: string
): Promise<BramsFruitProduct[]> {
  const { data, error } = await supabase
    .from('brams_fruit_products')
    .select('*')
    .eq('is_active', true)
    .eq('style_code', styleCode)
    .order('color', { ascending: true })
    .order('size', { ascending: true });

  if (error) {
    console.error('Error fetching product by style code:', error);
    return [];
  }

  return data || [];
}

export async function getBramsFruitCategories(): Promise<{
  categories: string[];
  subCategories: Map<string, string[]>;
}> {
  const { data, error } = await supabase
    .from('brams_fruit_products')
    .select('category, sub_category')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching categories:', error);
    return { categories: [], subCategories: new Map() };
  }

  const categorySet = new Set<string>();
  const subCategoryMap = new Map<string, Set<string>>();

  data.forEach(item => {
    categorySet.add(item.category);

    const existing = subCategoryMap.get(item.category) || new Set();
    existing.add(item.sub_category);
    subCategoryMap.set(item.category, existing);
  });

  const categories = Array.from(categorySet).sort();
  const subCategories = new Map(
    Array.from(subCategoryMap.entries()).map(([cat, subs]) => [
      cat,
      Array.from(subs).sort(),
    ])
  );

  return { categories, subCategories };
}

export async function getBramsFruitProductsForOutfitEngine(): Promise<Product[]> {
  try {
    const bramsFruitProducts = await getAllBramsFruitProducts();

    const uniqueProducts = new Map<string, BramsFruitProduct>();

    bramsFruitProducts.forEach(product => {
      if (!uniqueProducts.has(product.style_code) || product.color.toLowerCase() === 'black' || product.color.toLowerCase() === 'navy') {
        uniqueProducts.set(product.style_code, product);
      }
    });

    const fitfiProducts = Array.from(uniqueProducts.values())
      .map(mapBramsFruitToFitFiProduct)
      .filter(product => product.imageUrl && product.imageUrl !== '/images/fallbacks/default.jpg');

    console.log(`[BramsFruit] Loaded ${fitfiProducts.length} products for outfit engine`);

    return fitfiProducts;
  } catch (error) {
    console.error('[BramsFruit] Error loading products for outfit engine:', error);
    return [];
  }
}
