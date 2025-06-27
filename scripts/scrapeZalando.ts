import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { convertToBoltProduct } from '../services/productEnricher';
import { BoltProduct } from '../types/BoltProduct';

// Load environment variables
dotenv.config();

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Configuration
const MAX_PRODUCTS_PER_CATEGORY = process.env.SCRAPER_MAX_PRODUCTS_PER_CATEGORY 
  ? parseInt(process.env.SCRAPER_MAX_PRODUCTS_PER_CATEGORY) 
  : 15;
const MAX_TOTAL_PRODUCTS = process.env.SCRAPER_MAX_TOTAL_PRODUCTS 
  ? parseInt(process.env.SCRAPER_MAX_TOTAL_PRODUCTS) 
  : 200;
const DELAY_BETWEEN_REQUESTS = process.env.SCRAPER_DELAY_BETWEEN_REQUESTS 
  ? parseInt(process.env.SCRAPER_DELAY_BETWEEN_REQUESTS) 
  : 500;

/**
 * Validates if an image URL is accessible and returns a valid image
 * @param url - The image URL to validate
 * @returns Whether the image is valid
 */
async function validateImageUrl(url: string, retries = 0): Promise<boolean> {
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
    
    console.error(`Error validating image URL ${url}:`, error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Main scraping function
 */
async function scrapeZalando(): Promise<void> {
  console.log('Starting Zalando scraper...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const allProducts: any[] = [];
    const boltProducts: BoltProduct[] = [];
    
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
        console.log('No cookie dialog or error handling it:', error instanceof Error ? error.message : error);
      }
      
      // Scroll down to load more products
      console.log('Scrolling to load more products...');
      await autoScroll(page);
      
      // Extract product data
      console.log('Extracting product data...');
      const products = await page.evaluate((categoryInfo) => {
        const items: any[] = [];
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
              const name = nameElement.textContent?.trim() || '';
              const brand = brandElement ? brandElement.textContent?.trim() || '' : '';
              const price = priceElement.textContent?.trim().replace('€', '').replace(',', '.').trim() || '';
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
      const productsToProcess = products.slice(0, MAX_PRODUCTS_PER_CATEGORY);
      
      for (let i = 0; i < productsToProcess.length; i++) {
        const product = productsToProcess[i];
        console.log(`Processing product ${i+1}/${productsToProcess.length}: ${product.name}`);
        
        // Validate image URL
        const isValidImage = await validateImageUrl(product.imageUrl);
        
        if (!isValidImage) {
          console.log(`❌ Invalid image: ${product.imageUrl} (${product.name})`);
          continue; // Skip this product
        }
        
        // Convert to BoltProduct
        try {
          const boltProduct = convertToBoltProduct({
            title: product.name,
            brand: product.brand,
            price: parseFloat(product.price),
            imageUrl: product.imageUrl,
            gender: product.gender,
            url: product.productUrl,
            category: product.category,
            description: product.description
          });
          
          boltProducts.push(boltProduct);
        } catch (error) {
          console.error(`Error converting product to BoltProduct: ${product.name}`, error);
        }
        
        // Add to all products array
        allProducts.push(product);
        
        // Wait between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
        
        // Check if we've reached the maximum total products
        if (allProducts.length >= MAX_TOTAL_PRODUCTS) {
          console.log(`Reached maximum total products (${MAX_TOTAL_PRODUCTS}), stopping scraping`);
          break;
        }
      }
      
      await page.close();
      
      // Check if we've reached the maximum total products
      if (allProducts.length >= MAX_TOTAL_PRODUCTS) {
        break;
      }
      
      // Wait between categories to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Create the data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Write the products to JSON files
    const zalandoOutputPath = path.join(dataDir, 'zalandoProducts.json');
    const boltOutputPath = path.join(dataDir, 'boltProducts.json');
    
    await fs.writeFile(zalandoOutputPath, JSON.stringify(allProducts, null, 2));
    await fs.writeFile(boltOutputPath, JSON.stringify(boltProducts, null, 2));
    
    console.log(`Successfully scraped ${allProducts.length} products and saved to:`);
    console.log(`- ${zalandoOutputPath}`);
    console.log(`Successfully converted ${boltProducts.length} products to BoltProduct format and saved to:`);
    console.log(`- ${boltOutputPath}`);
    
  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    await browser.close();
  }
}

/**
 * Helper function to scroll down the page to load more products
 */
async function autoScroll(page: puppeteer.Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
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

// Run the scraper
scrapeZalando()
  .then(() => console.log('Scraping completed'))
  .catch(error => console.error('Scraping failed:', error));