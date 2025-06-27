import supabase from './supabase';
import { Product } from '../types/Product';

/**
 * Fetches products from Supabase database
 * @returns Array of products
 */
export const fetchProductsFromSupabase = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products from Supabase:', error);
      return [];
    }
    
    return data as Product[];
  } catch (error) {
    console.error('Exception when fetching products from Supabase:', error);
    return [];
  }
};

/**
 * Uploads products to Supabase
 * @param products - Array of products to upload
 * @returns Success status
 */
export const uploadProductsToSupabase = async (products: any[]): Promise<boolean> => {
  try {
    // Format products for Supabase schema
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      url: product.affiliateUrl,
      retailer: 'Zalando',
      category: product.category,
      price: parseFloat(product.price),
      brand: product.brand,
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: [],
      in_stock: true,
      tags: product.tags,
      archetype: product.tags[0] || 'casual',
      created_at: product.created_at,
      updated_at: new Date().toISOString()
    }));
    
    // Upload in batches to avoid rate limits
    const BATCH_SIZE = 20;
    let successCount = 0;
    
    for (let i = 0; i < formattedProducts.length; i += BATCH_SIZE) {
      const batch = formattedProducts.slice(i, i + BATCH_SIZE);
      
      const { error } = await supabase
        .from('products')
        .upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error('Error uploading batch to Supabase:', error);
        return false;
      }
      
      successCount += batch.length;
      console.log(`Uploaded ${successCount}/${formattedProducts.length} products to Supabase`);
    }
    
    return true;
  } catch (error) {
    console.error('Error uploading products to Supabase:', error);
    return false;
  }
};

export default {
  fetchProductsFromSupabase,
  uploadProductsToSupabase
};