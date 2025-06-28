import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check if running in daily mode
const isDaily = process.argv.includes('--daily');

// Categories to scrape
const CATEGORIES = [
  {
    url: 'https://www.zalando.nl/herenkleding-t-shirts/',
    category: 'top',
    name: 'T-shirts',
    gender: 'male'
  },
  {
    url: 'https://www.zalando.nl/herenkleding-jeans/',
    category: 'bottom',
    name: 'Jeans',
    gender: 'male'
  },
  {
    url: 'https://www.zalando.nl/herenschoenen-sneakers/',
    category: 'footwear',
    name: 'Sneakers',
    gender: 'male'
  },
  {
    url: 'https://www.zalando.nl/heren-accessoires-tassen/',
    category: 'accessory',
    name: 'Tassen',
    gender: 'male'
  },
  {
    url: 'https://www.zalando.nl/dameskleding-tops/',
    category: 'top',
    name: 'Tops',
    gender: 'female'
  },
  {
    url: 'https://www.zalando.nl/dameskleding-jeans/',
    category: 'bottom',
    name: 'Jeans',
    gender: 'female'
  },
  {
    url: 'https://www.zalando.nl/damesschoenen-sneakers/',
    category: 'footwear',
    name: 'Sneakers',
    gender: 'female'
  },
  {
    url: 'https://www.zalando.nl/dames-accessoires-tassen/',
    category: 'accessory',
    name: 'Tassen',
    gender: 'female'
  }
];

// Style tags mapping based on keywords in product names/descriptions
const STYLE_TAG_MAPPING = {
  'slim': 'minimalist',
  'basic': 'minimalist',
  'regular': 'casual',
  'casual': 'casual',
  'vintage': 'vintage',
  'retro': 'vintage',
  'classic': 'klassiek',
  'sport': 'sporty',
  'urban': 'urban',
  'street': 'streetstyle',
  'premium': 'luxury',
  'luxe': 'luxury',
  'zwart': 'minimalist',
  'wit': 'minimalist',
  'blauw': 'casual',
  'denim': 'casual',
  'leer': 'luxury',
  'katoen': 'casual',
  'oversized': 'streetstyle',
  'logo': 'streetstyle'
};

// Season mapping based on keywords
const SEASON_MAPPING = {
  'winter': ['winter'],
  'herfst': ['autumn'],
  'zomer': ['summer'],
  'lente': ['spring'],
  'warm': ['summer'],
  'koud': ['winter'],
  'licht': ['spring', 'summer'],
  'zwaar': ['autumn', 'winter'],
  'wol': ['autumn', 'winter'],
  'fleece': ['autumn', 'winter'],
  'linnen': ['spring', 'summer'],
  'katoen': ['spring', 'summer', 'autumn'],
  'denim': ['spring', 'summer', 'autumn', 'winter'],
  'jas': ['autumn', 'winter'],
  'vest': ['autumn', 'winter'],
  'trui': ['autumn', 'winter'],
  't-shirt': ['spring', 'summer'],
  'short': ['summer'],
  'sandaal': ['summer'],
  'laars': ['autumn', 'winter']
};

// Function to extract style tags from product name and description
function extractTags(text) {
  if (!text) return ['casual']; // Default tag
  
  text = text.toLowerCase();
  const tags = new Set();
  
  // Check for keywords in the text
  Object.entries(STYLE_TAG_MAPPING).forEach(([keyword, tag]) => {
    if (text.includes(keyword.toLowerCase())) {
      tags.add(tag);
    }
  });
  
  // Add at least one tag if none were found
  if (tags.size === 0) {
    tags.add('casual');
  }
  
  return Array.from(tags);
}

// Function to extract seasons from product name and description
function extractSeasons(text) {
  if (!text) return ['spring', 'summer', 'autumn', 'winter']; // Default all seasons
  
  text = text.toLowerCase();
  const seasons = new Set();
  
  // Check for keywords in the text
  Object.entries(SEASON_MAPPING).forEach(([keyword, seasonArray]) => {
    if (text.includes(keyword.toLowerCase())) {
      seasonArray.forEach(season => seasons.add(season));
    }
  });
  
  // Add all seasons if none were found
  if (seasons.size === 0) {
    return ['spring', 'summer', 'autumn', 'winter'];
  }
  
  return Array.from(seasons);
}

// Function to generate a unique ID
function generateId(name, index) {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 20);
  
  return `zalando_${cleanName}_${index}`;
}

// Function to extract sizes from a product page
async function extractSizes(page, productUrl) {
  try {
    await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for the size selector to appear
    await page.waitForSelector('[data-testid="pdp-size-picker"]', { timeout: 5000 });
    
    // Extract sizes
    const sizes = await page.evaluate(() => {
      const sizeElements = document.querySelectorAll('[data-testid="pdp-size-picker"] button');
      return Array.from(sizeElements).map(el => el.textContent.trim());
    });
    
    return sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL']; // Default sizes if none found
  } catch (error) {
    console.log(`Error extracting sizes for ${productUrl}: ${error.message}`);
    return ['S', 'M', 'L', 'XL']; // Default sizes on error
  }
}

/**
 * Validates if an image URL is accessible and returns a valid image
 * @param {string} url - The image URL to validate
 * @returns {Promise<boolean>} - Whether the image is valid
 */
async function validateImageUrl(url, retries = 0) {
  try {
    // Set up timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
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
    if (retries < 2) {
      console.log(`Retrying validation for ${url} (${retries + 1}/2)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      return validateImageUrl(url, retries + 1);
    }
    
    console.error(`Error validating image URL ${url}:`, error.message);
    return false;
  }
}

// Main scraping function
async function scrapeZalando() {
  console.log('Starting Zalando scraper...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const allProducts = [];
    
    for (const category of CATEGORIES) {
      console.log(`Scraping category: ${category.name} (${category.category}) for ${category.gender}`);
      
      const page = await browser.newPage();
      
      // Set user agent to avoid bot detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Set viewport to desktop size
      await page.setViewport({ width: 1280, height: 800 });
      
      // Navigate to the category page
      await page.goto(category.url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Accept cookies if the dialog appears
      try {
        const cookieButton = await page.$('button[data-testid="uc-accept-all-button"]');
        if (cookieButton) {
          await cookieButton.click();
          await page.waitForTimeout(1000);
        }
      } catch (error) {
        console.log('No cookie dialog or error handling it:', error.message);
      }
      
      // Scroll down to load more products
      console.log('Scrolling to load more products...');
      await autoScroll(page);
      
      // Extract product data
      console.log('Extracting product data...');
      const products = await page.evaluate((categoryInfo) => {
        const items = [];
        const productCards = document.querySelectorAll('article[data-testid="grid-item"]');
        
        productCards.forEach((card) => {
          try {
            // Extract product details
            const nameElement = card.querySelector('h3');
            const brandElement = card.querySelector('h4');
            const priceElement = card.querySelector('span[data-testid="price"]');
            const imageElement = card.querySelector('img');
            const linkElement = card.querySelector('a');
            
            if (nameElement && priceElement && imageElement && linkElement) {
              const name = nameElement.textContent.trim();
              const brand = brandElement ? brandElement.textContent.trim() : '';
              const price = priceElement.textContent.trim().replace('€', '').replace(',', '.').trim();
              const imageUrl = imageElement.src;
              const productUrl = linkElement.href;
              
              // Create product object
              items.push({
                name: brand ? `${brand} ${name}` : name,
                brand: brand || 'Zalando',
                price: price,
                imageUrl: imageUrl,
                productUrl: productUrl,
                description: `${name} van ${brand || 'Zalando'} - ${categoryInfo.name}`,
                category: categoryInfo.category,
                gender: categoryInfo.gender
              });
            }
          } catch (error) {
            console.error('Error extracting product data:', error);
          }
        });
        
        return items;
      }, category);
      
      console.log(`Found ${products.length} products in category ${category.name}`);
      
      // Process and add products to the main array
      const detailsPage = await browser.newPage();
      
      // Set a reasonable limit per category to avoid overloading
      const productsToProcess = products.slice(0, 15);
      
      for (let i = 0; i < productsToProcess.length; i++) {
        const product = productsToProcess[i];
        console.log(`Processing product ${i+1}/${productsToProcess.length}: ${product.name}`);
        
        // Validate image URL
        const isValidImage = await validateImageUrl(product.imageUrl);
        
        if (!isValidImage) {
          console.log(`❌ Invalid image: ${product.imageUrl} (${product.name})`);
          continue; // Skip this product
        }
        
        // Extract sizes from product page (with rate limiting)
        const sizes = await extractSizes(detailsPage, product.productUrl);
        await page.waitForTimeout(500); // Wait between requests to avoid rate limiting
        
        // Generate tags based on product name and description
        const tags = extractTags(`${product.name} ${product.description}`);
        
        // Extract seasons based on product name, description, and tags
        const seasons = extractSeasons(`${product.name} ${product.description} ${tags.join(' ')}`);
        
        // Generate a unique ID
        const id = generateId(product.name, i);
        
        // Create the final product object
        allProducts.push({
          id,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          price: product.price,
          affiliateUrl: product.productUrl,
          category: category.category,
          gender: product.gender,
          tags,
          seasons,
          brand: product.brand,
          sizes,
          created_at: new Date().toISOString()
        });
      }
      
      await detailsPage.close();
      await page.close();
      
      // Limit to 25 products per category to avoid overloading
      if (allProducts.length >= 200) {
        console.log('Reached 200 products, stopping scraping');
        break;
      }
      
      // Wait between categories to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Create the data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'src', 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Create the public data directory if it doesn't exist
    const publicDataDir = path.join(__dirname, '..', 'public', 'data');
    await fs.mkdir(publicDataDir, { recursive: true });
    
    // Write the products to JSON files
    const srcOutputPath = path.join(dataDir, 'zalandoProducts.json');
    const publicOutputPath = path.join(publicDataDir, 'zalandoProducts.json');
    
    await fs.writeFile(srcOutputPath, JSON.stringify(allProducts, null, 2));
    await fs.writeFile(publicOutputPath, JSON.stringify(allProducts, null, 2));
    
    console.log(`Successfully scraped ${allProducts.length} products and saved to:`);
    console.log(`- ${srcOutputPath}`);
    console.log(`- ${publicOutputPath}`);
    
    // If running in daily mode, automatically upload to Supabase
    if (isDaily) {
      console.log('Running in daily mode, uploading to Supabase...');
      await uploadToSupabase(allProducts);
    }
    
  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    await browser.close();
  }
}

// Helper function to scroll down the page to load more products
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

// Function to upload products to Supabase
async function uploadToSupabase(products) {
  try {
    // Import Supabase client dynamically
    const { createClient } = await import('@supabase/supabase-js');
    
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not found in environment variables');
      return;
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`Uploading ${products.length} products to Supabase...`);
    
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
        imageUrl: product.imageUrl,
        url: product.affiliateUrl,
        retailer: 'Zalando',
        category: product.category,
        price: parseFloat(product.price),
        brand: product.brand,
        sizes: product.sizes,
        colors: [],
        in_stock: true,
        tags: product.tags,
        archetype: product.tags[0] || 'casual',
        created_at: product.created_at,
        updated_at: new Date().toISOString()
      }));
      
      // Upload to Supabase
      const { error } = await supabase
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
    console.error('Error uploading products to Supabase:', error);
  }
}

// Run the scraper
scrapeZalando()
  .then(() => console.log('Scraping completed'))
  .catch(error => console.error('Scraping failed:', error));