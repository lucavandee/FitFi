import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wojexzgjyhijuxzperhq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Error: VITE_SUPABASE_ANON_KEY environment variable is required');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to upload products to Supabase
async function uploadProducts() {
  try {
    // Read the JSON file
    const filePath = path.join(__dirname, '..', 'src', 'data', 'zalandoProducts.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const products = JSON.parse(fileContent);
    
    console.log(`Found ${products.length} products to upload`);
    
    // Upload products in batches to avoid rate limits
    const BATCH_SIZE = 20;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      console.log(`Uploading batch ${i / BATCH_SIZE + 1} of ${Math.ceil(products.length / BATCH_SIZE)}`);
      
      // Format products for Supabase schema
      const formattedBatch = batch.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        image_url: product.imageUrl,
        affiliate_url: product.affiliateUrl,
        gender: 'male', // Default to male since we're scraping men's clothing
        type: product.category,
        brand: product.brand,
        price: product.price,
        sizes: product.sizes || ['S', 'M', 'L', 'XL'],
        tags: product.tags || ['casual'],
        created_at: product.created_at || new Date().toISOString()
      }));
      
      // Upload to Supabase
      const { data, error } = await supabase
        .from('products')
        .upsert(formattedBatch, { onConflict: 'id' });
      
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
    console.error('Error uploading products:', error);
  }
}

// Run the upload function
uploadProducts()
  .then(() => console.log('Upload process completed'))
  .catch(error => console.error('Upload process failed:', error));