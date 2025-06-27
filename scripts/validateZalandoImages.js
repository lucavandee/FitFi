import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const TIMEOUT = 5000; // 5 seconds timeout for image validation
const CONCURRENT_REQUESTS = 5; // Number of concurrent image validations
const RETRY_COUNT = 2; // Number of retries for failed validations

/**
 * Validates if an image URL is accessible and returns a valid image
 * @param {string} url - The image URL to validate
 * @returns {Promise<boolean>} - Whether the image is valid
 */
async function validateImageUrl(url, retries = 0) {
  try {
    // Set up timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    // Make a HEAD request to check if the image exists
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Check if the response is OK and is an image
    const contentType = response.headers.get('content-type');
    const isImage = contentType && contentType.startsWith('image/');
    
    return response.ok && isImage;
  } catch (error) {
    // If we have retries left, try again
    if (retries < RETRY_COUNT) {
      console.log(`Retrying validation for ${url} (${retries + 1}/${RETRY_COUNT})`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      return validateImageUrl(url, retries + 1);
    }
    
    console.error(`Error validating image URL ${url}:`, error.message);
    return false;
  }
}

/**
 * Processes a batch of products to validate their images
 * @param {Array} products - Array of products to validate
 * @param {number} startIndex - Start index of the batch
 * @param {number} batchSize - Size of the batch
 * @returns {Promise<Array>} - Array of valid products
 */
async function processBatch(products, startIndex, batchSize) {
  const batch = products.slice(startIndex, startIndex + batchSize);
  const validProducts = [];
  
  for (const product of batch) {
    const isValid = await validateImageUrl(product.imageUrl);
    
    if (isValid) {
      validProducts.push(product);
    } else {
      console.log(`❌ Invalid image: ${product.imageUrl} (${product.name})`);
    }
  }
  
  return validProducts;
}

/**
 * Main function to validate all product images
 */
async function validateZalandoImages() {
  try {
    // Read the Zalando products JSON file
    const filePath = path.join(__dirname, '..', 'public', 'data', 'zalandoProducts.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const products = JSON.parse(fileContent);
    
    console.log(`Validating images for ${products.length} Zalando products...`);
    
    // Process products in batches to avoid overwhelming the network
    const validProducts = [];
    const batchSize = CONCURRENT_REQUESTS;
    
    for (let i = 0; i < products.length; i += batchSize) {
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`);
      const batchResults = await processBatch(products, i, batchSize);
      validProducts.push(...batchResults);
      
      // Progress update
      console.log(`Progress: ${Math.min(i + batchSize, products.length)}/${products.length} products processed`);
      console.log(`Valid products so far: ${validProducts.length}`);
    }
    
    console.log(`Validation complete: ${validProducts.length}/${products.length} products have valid images`);
    
    // Write the filtered products back to the file
    await fs.writeFile(filePath, JSON.stringify(validProducts, null, 2));
    
    console.log(`Updated ${filePath} with ${validProducts.length} valid products`);
    
    // Also create a backup of the original file
    const backupPath = path.join(__dirname, '..', 'public', 'data', 'zalandoProducts.backup.json');
    await fs.writeFile(backupPath, fileContent);
    console.log(`Created backup of original data at ${backupPath}`);
    
  } catch (error) {
    console.error('Error validating Zalando images:', error);
  }
}

// Run the validation
validateZalandoImages()
  .then(() => console.log('Image validation completed'))
  .catch(error => console.error('Image validation failed:', error));