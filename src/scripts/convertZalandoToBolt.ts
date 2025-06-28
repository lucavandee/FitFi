import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertToBoltProducts } from '../services/productEnricher';
import { BoltProduct } from '../types/BoltProduct';

/**
 * Script to convert existing Zalando products to BoltProducts
 * 
 * Usage:
 * - Run this script with: npm run convert-products
 * - The converted products will be saved to src/data/boltProducts.json
 */

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    console.log('🔄 Starting Zalando to BoltProduct conversion...');
    
    // Read Zalando products from file
    const zalandoProductsPath = path.join(__dirname, '..', 'data', 'zalandoProducts.json');
    console.log(`📂 Reading Zalando products from ${zalandoProductsPath}`);
    
    const zalandoProductsData = await fs.readFile(zalandoProductsPath, 'utf-8');
    const zalandoProducts = JSON.parse(zalandoProductsData);
    
    console.log(`📊 Found ${zalandoProducts.length} Zalando products to convert`);
    
    // Convert to BoltProducts
    const boltProducts: BoltProduct[] = convertToBoltProducts(zalandoProducts);
    
    console.log(`✅ Successfully converted ${boltProducts.length} products to BoltProduct format`);
    
    // Write BoltProducts to file
    const boltProductsPath = path.join(__dirname, '..', 'data', 'boltProducts.json');
    await fs.writeFile(boltProductsPath, JSON.stringify(boltProducts, null, 2));
    
    console.log(`💾 Saved BoltProducts to ${boltProductsPath}`);
    
    // Sample output
    if (boltProducts.length > 0) {
      console.log('\n📝 Sample BoltProduct:');
      console.log(JSON.stringify(boltProducts[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error converting products:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the script
main();