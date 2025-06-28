const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const TIMEOUT = 15000;
const MAX_RETRIES = 2;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Retailer API configurations
const RETAILER_APIS = {
  'Zalando': {
    searchUrl: (query) => `https://www.zalando.nl/api/catalog/articles?q=${encodeURIComponent(query)}&limit=5`,
    extractProduct: (data) => {
      if (data.articles && data.articles.length > 0) {
        const article = data.articles[0];
        return {
          url: `https://www.zalando.nl${article.url_key}`,
          imageUrl: article.media?.images?.[0]?.large_url || article.media?.images?.[0]?.medium_url
        };
      }
      return null;
    }
  },
  'H&M NL': {
    searchUrl: (query) => `https://www2.hm.com/nl_nl/search-results.html?q=${encodeURIComponent(query)}`,
    extractProduct: (html) => {
      // Parse HTML to extract first product
      const productMatch = html.match(/href="([^"]*product[^"]*)"[^>]*>.*?<img[^>]*src="([^"]*)"[^>]*>/i);
      if (productMatch) {
        return {
          url: `https://www2.hm.com${productMatch[1]}`,
          imageUrl: productMatch[2].startsWith('http') ? productMatch[2] : `https:${productMatch[2]}`
        };
      }
      return null;
    }
  },
  'Wehkamp': {
    searchUrl: (query) => `https://www.wehkamp.nl/api/v2/catalog/products?searchTerm=${encodeURIComponent(query)}&limit=5`,
    extractProduct: (data) => {
      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        return {
          url: `https://www.wehkamp.nl${product.url}`,
          imageUrl: product.images?.[0]?.url
        };
      }
      return null;
    }
  },
  'ASOS NL': {
    searchUrl: (query) => `https://www.asos.com/api/product/search/v2/?q=${encodeURIComponent(query)}&store=NL&lang=nl-NL&limit=5`,
    extractProduct: (data) => {
      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        return {
          url: `https://www.asos.com/nl/prd/${product.id}`,
          imageUrl: product.imageUrl
        };
      }
      return null;
    }
  },
  'About You NL': {
    searchUrl: (query) => `https://api.aboutyou.de/v1/products?query=${encodeURIComponent(query)}&limit=5`,
    extractProduct: (data) => {
      if (data.entities && data.entities.length > 0) {
        const product = data.entities[0];
        return {
          url: `https://www.aboutyou.nl/p/${product.slug}`,
          imageUrl: product.images?.[0]?.url
        };
      }
      return null;
    }
  },
  'Net-A-Porter': {
    searchUrl: (query) => `https://www.net-a-porter.com/api/products?query=${encodeURIComponent(query)}&limit=5`,
    extractProduct: (data) => {
      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        return {
          url: `https://www.net-a-porter.com/nl/shop/product/${product.id}`,
          imageUrl: product.images?.[0]?.url
        };
      }
      return null;
    }
  },
  'De Bijenkorf': {
    searchUrl: (query) => `https://www.debijenkorf.nl/api/search?q=${encodeURIComponent(query)}&limit=5`,
    extractProduct: (data) => {
      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        return {
          url: `https://www.debijenkorf.nl${product.url}`,
          imageUrl: product.images?.[0]?.url
        };
      }
      return null;
    }
  },
  'Bol.com': {
    searchUrl: (query) => `https://api.bol.com/catalog/v4/search?q=${encodeURIComponent(query)}&limit=5`,
    extractProduct: (data) => {
      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        return {
          url: `https://www.bol.com/nl/p/${product.id}`,
          imageUrl: product.images?.[0]?.url
        };
      }
      return null;
    }
  }
};

async function makeRequest(url, isJson = true) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.get(url, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': isJson ? 'application/json' : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          try {
            const result = isJson ? JSON.parse(data) : data;
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function validateUrl(url) {
  try {
    const client = url.startsWith('https:') ? https : http;
    
    return new Promise((resolve) => {
      const req = client.request(url, { method: 'HEAD', timeout: 10000 }, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      });
      
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    return false;
  }
}

async function searchRetailerProduct(retailer, productName) {
  const config = RETAILER_APIS[retailer];
  if (!config) {
    log('yellow', `⚠️ No API configuration for retailer: ${retailer}`);
    return null;
  }
  
  try {
    log('blue',`🔍 Searching for "${productName}" on ${retailer}...`);
    
    const searchUrl = config.searchUrl(productName);
    const isJson = !searchUrl.includes('hm.com'); // H&M uses HTML, others use JSON
    
    const data = await makeRequest(searchUrl, isJson);
    const product = config.extractProduct(data);
    
    if (product) {
      log('green', `✅ Found product on ${retailer}: ${product.url}`);
      
      // Validate URLs
      const isValidUrl = await validateUrl(product.url);
      const isValidImage = await validateUrl(product.imageUrl);
      
      if (!isValidUrl) {
        log('yellow', `⚠️ Invalid product URL: ${product.url}`);
        product.url = null;
      }
      
      if (!isValidImage) {
        log('yellow', `⚠️ Invalid image URL: ${product.imageUrl}`);
        product.imageUrl = null;
      }
      
      return product;
    } else {
      log('yellow', `⚠️ No products found for "${productName}" on ${retailer}`);
      return null;
    }
  } catch (error) {
    log('red', `❌ Error searching ${retailer} for "${productName}": ${error.message}`);
    return null;
  }
}

async function updateCuratedProducts() {
  const configPath = path.join(process.cwd(), 'src', 'config', 'curated-products.json');
  
  if (!fs.existsSync(configPath)) {
    log('red', `❌ Config file not found: ${configPath}`);
    return;
  }
  
  try {
    log('blue', '📂 Reading curated-products.json...');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Create a backup
    const backupPath = `${configPath}.backup`;
    fs.writeFileSync(backupPath, JSON.stringify(config, null, 2));
    log('green', `✅ Backup created at ${backupPath}`);
    
    // Process each profile and item
    for (const profile of config.profiles) {
      log('blue', `\n🔍 Processing profile: ${profile.displayName} (${profile.id})`);
      
      for (const item of profile.items) {
        log('blue', `\n📦 Processing item: ${item.name} (${item.id})`);
        
        // Skip if already has valid URLs
        if (item.url && item.imageUrl && 
            await validateUrl(item.url) && 
            await validateUrl(item.imageUrl)) {
          log('green', `✅ Item already has valid URLs, skipping`);
          continue;
        }
        
        // Search for product
        const product = await searchRetailerProduct(item.retailer, item.name);
        
        if (product) {
          // Update URLs if valid
          if (product.url) {
            item.url = product.url;
          }
          
          if (product.imageUrl) {
            item.imageUrl = product.imageUrl;
          }
          
          log('green', `✅ Updated item "${item.name}" with real data`);
        } else {
          log('yellow', `⚠️ Could not find product data for "${item.name}" at ${item.retailer}`);
          
          // Use fallback image if needed
          if (!item.imageUrl || !(await validateUrl(item.imageUrl))) {
            item.imageUrl = `https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2`;
            log('yellow', `⚠️ Using fallback image for "${item.name}"`);
          }
          
          // Use fallback URL if needed
          if (!item.url || !(await validateUrl(item.url))) {
            item.url = `https://www.${item.retailer.toLowerCase().replace(/\s+/g, '')}.nl/search?q=${encodeURIComponent(item.name)}`;
            log('yellow', `⚠️ Using fallback URL for "${item.name}"`);
          }
        }
      }
    }
    
    // Write updated config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    log('green', `\n✅ Updated curated-products.json with real retailer data`);
    
  } catch (error) {
    log('red', `❌ Error updating curated products: ${error.message}`);
    process.exit(1);
  }
}

// Run the update
updateCuratedProducts().catch(error => {
  log('red', `❌ Unhandled error: ${error.message}`);
  process.exit(1);
});