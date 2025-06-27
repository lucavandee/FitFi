import { convertToBoltProducts } from '../services/productEnricher';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Script to convert Zalando products to BoltProducts
 * 
 * Usage:
 * - Place your Zalando products JSON in src/data/zalandoProducts.json
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
    const zalandoProductsData = await fs.readFile(zalandoProductsPath, 'utf-8');
    const zalandoProducts = JSON.parse(zalandoProductsData);
    
    console.log(`📊 Found ${zalandoProducts.length} Zalando products to convert`);
    
    // Convert to BoltProducts
    const boltProducts = convertToBoltProducts(zalandoProducts);
    
    console.log(`✅ Successfully converted ${boltProducts.length} products to BoltProduct format`);
    
    // Write BoltProducts to file
    const boltProductsPath = path.join(__dirname, '..', 'data', 'boltProducts.json');
    await fs.writeFile(boltProductsPath, JSON.stringify(boltProducts, null, 2));
    
    console.log(`💾 Saved BoltProducts to ${boltProductsPath}`);
    
    // Sample output
    console.log('\n📝 Sample BoltProduct:');
    console.log(JSON.stringify(boltProducts[0], null, 2));
    
  } catch (error) {
    console.error('❌ Error converting products:', error);
    process.exit(1);
  }
}

// Run the script
main();