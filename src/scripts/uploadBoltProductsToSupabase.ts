import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { BoltProduct } from '../types/BoltProduct';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload BoltProducts to Supabase
 */
async function uploadBoltProductsToSupabase() {
  try {
    // Read BoltProducts from file
    const boltProductsPath = path.join(__dirname, '..', 'data', 'boltProducts.json');
    console.log(`📂 Reading BoltProducts from ${boltProductsPath}`);
    
    const boltProductsData = await fs.readFile(boltProductsPath, 'utf-8');
    const boltProducts: BoltProduct[] = JSON.parse(boltProductsData);
    
    console.log(`📊 Found ${boltProducts.length} BoltProducts to upload`);
    
    // Format products for Supabase schema
    const formattedProducts = boltProducts.map(product => ({
      id: product.id,
      name: product.title,
      brand: product.brand,
      type: product.type,
      gender: product.gender,
      color: product.color,
      dominant_color_hex: product.dominantColorHex,
      style_tags: product.styleTags,
      season: product.season,
      archetype_match: product.archetypeMatch,
      material: product.material,
      price: product.price,
      image_url: product.imageUrl,
      affiliate_url: product.affiliateUrl,
      source: product.source,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // Upload products in batches to avoid rate limits
    const BATCH_SIZE = 20;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < formattedProducts.length; i += BATCH_SIZE) {
      const batch = formattedProducts.slice(i, i + BATCH_SIZE);
      console.log(`Uploading batch ${i / BATCH_SIZE + 1} of ${Math.ceil(formattedProducts.length / BATCH_SIZE)}`);
      
      const { data, error } = await supabase
        .from('products')
        .upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error('Error uploading batch:', error);
        errorCount += batch.length;
      } else {
        console.log(`Successfully uploaded batch ${i / BATCH_SIZE + 1}`);
        successCount += batch.length;
      }
      
      // Wait a bit between batches to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Upload complete: ${successCount} products uploaded successfully, ${errorCount} failed`);
    
  } catch (error) {
    console.error('Error uploading products to Supabase:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the upload function
uploadBoltProductsToSupabase()
  .then(() => console.log('Upload process completed'))
  .catch(error => console.error('Upload process failed:', error));