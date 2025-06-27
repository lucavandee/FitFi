import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { BoltProduct } from '../types/BoltProduct';
import { isValidImageUrl } from '../utils/imageUtils';

/**
 * Script to validate BoltProducts
 * 
 * Usage:
 * - Run this script with: npm run validate-products
 * - The script will validate all BoltProducts in src/data/boltProducts.json
 */

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    console.log('🔍 Starting BoltProduct validation...');
    
    // Read BoltProducts from file
    const boltProductsPath = path.join(__dirname, '..', 'data', 'boltProducts.json');
    console.log(`📂 Reading BoltProducts from ${boltProductsPath}`);
    
    const boltProductsData = await fs.readFile(boltProductsPath, 'utf-8');
    const boltProducts: BoltProduct[] = JSON.parse(boltProductsData);
    
    console.log(`📊 Found ${boltProducts.length} BoltProducts to validate`);
    
    // Validate BoltProducts
    const validationResults = await validateBoltProducts(boltProducts);
    
    // Write validation results to file
    const validationResultsPath = path.join(__dirname, '..', 'data', 'validationResults.json');
    await fs.writeFile(validationResultsPath, JSON.stringify(validationResults, null, 2));
    
    console.log(`💾 Saved validation results to ${validationResultsPath}`);
    
    // Write valid BoltProducts to file
    const validBoltProductsPath = path.join(__dirname, '..', 'data', 'validBoltProducts.json');
    await fs.writeFile(validBoltProductsPath, JSON.stringify(validationResults.validProducts, null, 2));
    
    console.log(`💾 Saved ${validationResults.validProducts.length} valid BoltProducts to ${validBoltProductsPath}`);
    
  } catch (error) {
    console.error('❌ Error validating products:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Validate BoltProducts
 * @param products - Array of BoltProducts to validate
 * @returns Validation results
 */
async function validateBoltProducts(products: BoltProduct[]): Promise<{
  totalProducts: number;
  validProducts: BoltProduct[];
  invalidProducts: Array<{
    product: BoltProduct;
    errors: string[];
  }>;
  validationSummary: {
    validCount: number;
    invalidCount: number;
    errorTypes: Record<string, number>;
  };
}> {
  const validProducts: BoltProduct[] = [];
  const invalidProducts: Array<{
    product: BoltProduct;
    errors: string[];
  }> = [];
  
  const errorTypes: Record<string, number> = {};
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const errors: string[] = [];
    
    // Validate required fields
    if (!product.id) errors.push('Missing id');
    if (!product.title) errors.push('Missing title');
    if (!product.brand) errors.push('Missing brand');
    if (!product.type) errors.push('Missing type');
    if (!product.gender) errors.push('Missing gender');
    if (!product.color) errors.push('Missing color');
    if (!product.dominantColorHex) errors.push('Missing dominantColorHex');
    if (!product.styleTags || product.styleTags.length === 0) errors.push('Missing styleTags');
    if (!product.season) errors.push('Missing season');
    if (!product.archetypeMatch || Object.keys(product.archetypeMatch).length === 0) errors.push('Missing archetypeMatch');
    if (!product.material) errors.push('Missing material');
    if (product.price === undefined) errors.push('Missing price');
    if (!product.imageUrl) errors.push('Missing imageUrl');
    if (!product.affiliateUrl) errors.push('Missing affiliateUrl');
    if (!product.source) errors.push('Missing source');
    
    // Validate image URL
    if (product.imageUrl) {
      const isValidImage = isValidImageUrl(product.imageUrl);
      if (!isValidImage) {
        errors.push('Invalid imageUrl');
      }
    }
    
    // Validate gender
    if (product.gender && !['male', 'female'].includes(product.gender)) {
      errors.push(`Invalid gender: ${product.gender}`);
    }
    
    // Validate season
    if (product.season && !['spring', 'summer', 'fall', 'winter', 'all_season'].includes(product.season)) {
      errors.push(`Invalid season: ${product.season}`);
    }
    
    // Validate source
    if (product.source !== 'zalando') {
      errors.push(`Invalid source: ${product.source}`);
    }
    
    // Validate price
    if (typeof product.price !== 'number' || isNaN(product.price) || product.price < 0) {
      errors.push(`Invalid price: ${product.price}`);
    }
    
    // Validate archetype match scores
    if (product.archetypeMatch) {
      for (const [archetype, score] of Object.entries(product.archetypeMatch)) {
        if (typeof score !== 'number' || isNaN(score) || score < 0 || score > 1) {
          errors.push(`Invalid archetype match score for ${archetype}: ${score}`);
        }
      }
    }
    
    // Track error types
    errors.forEach(error => {
      errorTypes[error] = (errorTypes[error] || 0) + 1;
    });
    
    // Add to valid or invalid products
    if (errors.length === 0) {
      validProducts.push(product);
    } else {
      invalidProducts.push({
        product,
        errors
      });
    }
    
    // Log progress
    if ((i + 1) % 10 === 0 || i === products.length - 1) {
      console.log(`Progress: ${i + 1}/${products.length} products validated`);
    }
  }
  
  // Create validation summary
  const validationSummary = {
    validCount: validProducts.length,
    invalidCount: invalidProducts.length,
    errorTypes
  };
  
  console.log(`\n✅ Validation complete:`);
  console.log(`- Total products: ${products.length}`);
  console.log(`- Valid products: ${validProducts.length}`);
  console.log(`- Invalid products: ${invalidProducts.length}`);
  
  if (invalidProducts.length > 0) {
    console.log('\n❌ Error types:');
    for (const [error, count] of Object.entries(errorTypes)) {
      console.log(`- ${error}: ${count}`);
    }
  }
  
  return {
    totalProducts: products.length,
    validProducts,
    invalidProducts,
    validationSummary
  };
}

// Run the script
main();