import supabase from './supabase';
import { Product } from '../types/Product';
import { isValidImageUrl } from '../utils/imageUtils';

/**
 * Fetches products from Supabase database and filters out products with invalid images
 * @returns Array of products with valid images
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
    
    if (!data || data.length === 0) {
      console.warn('No products found in Supabase');
      return [];
    }
    
    console.log(`[Supabase] Fetched ${data.length} products, validating images...`);
    
    // Filter out products with invalid image URLs
    const validProducts = data.filter(product => {
      const imageUrl = product.image_url || product.imageUrl;
      const isValid = imageUrl && isValidImageUrl(imageUrl);
      
      if (!isValid) {
        console.warn(`⚠️ Broken image gefilterd: ${imageUrl} (${product.name})`);
      }
      
      return isValid;
    });
    
    console.log(`[Supabase] Filtered out ${data.length - validProducts.length} products with invalid images`);
    console.log(`[Supabase] Returning ${validProducts.length} valid products`);
    
    return validProducts as Product[];
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
    // Filter out products with invalid image URLs before uploading
    const validProducts = products.filter(product => {
      const isValid = product.imageUrl && isValidImageUrl(product.imageUrl);
      
      if (!isValid) {
        console.warn(`⚠️ Skipping upload of product with broken image: ${product.imageUrl} (${product.name})`);
      }
      
      return isValid;
    });
    
    console.log(`[Supabase] Uploading ${validProducts.length} products (filtered out ${products.length - validProducts.length} with invalid images)`);
    
    // Format products for Supabase schema
    const formattedProducts = validProducts.map(product => ({
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