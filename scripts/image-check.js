const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const TIMEOUT = 15000; // 15 seconds for images
const MAX_RETRIES = 2;
const CONCURRENT_REQUESTS = 3; // Lower for images
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

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

async function checkImage(url, retries = 0) {
  return new Promise((resolve) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.request(url, {
      method: 'HEAD',
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'FitFi-ImageChecker/1.0',
        'Accept': 'image/*'
      }
    }, (res) => {
      const contentType = res.headers['content-type'] || '';
      const contentLength = parseInt(res.headers['content-length'] || '0');
      
      const isValidType = VALID_IMAGE_TYPES.some(type => contentType.toLowerCase().includes(type));
      const isValidStatus = res.statusCode >= 200 && res.statusCode < 400;
      
      resolve({
        url,
        status: res.statusCode,
        contentType,
        contentLength,
        success: isValidStatus && isValidType,
        isValidType,
        redirected: res.statusCode >= 300 && res.statusCode < 400,
        finalUrl: res.headers.location || url
      });
    });
    
    req.on('error', async (err) => {
      if (retries < MAX_RETRIES) {
        log('yellow', `⚠️ Retrying ${url} (attempt ${retries + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
        const result = await checkImage(url, retries + 1);
        resolve(result);
      } else {
        resolve({
          url,
          status: 0,
          success: false,
          error: err.message
        });
      }
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 0,
        success: false,
        error: 'Request timeout'
      });
    });
    
    req.end();
  });
}

async function checkImagesBatch(urls) {
  const results = [];
  
  for (let i = 0; i < urls.length; i += CONCURRENT_REQUESTS) {
    const batch = urls.slice(i, i + CONCURRENT_REQUESTS);
    const batchResults = await Promise.all(batch.map(url => checkImage(url)));
    results.push(...batchResults);
    
    // Progress indicator
    const progress = Math.min(i + CONCURRENT_REQUESTS, urls.length);
    log('blue', `📊 Progress: ${progress}/${urls.length} images checked`);
    
    // Small delay between batches to be respectful to servers
    if (i + CONCURRENT_REQUESTS < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}

function extractImagesFromConfig(configPath) {
  const images = [];
  
  if (!fs.existsSync(configPath)) {
    log('yellow', `⚠️ Config file not found: ${configPath}`);
    return images;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    if (config.profiles) {
      config.profiles.forEach(profile => {
        // Check items array (curated products)
        if (profile.items) {
          profile.items.forEach(item => {
            if (item.imageUrl) {
              images.push({
                url: item.imageUrl,
                source: `${configPath}:${profile.id}:${item.id}`,
                type: 'product'
              });
            }
          });
        }
        
        // Check saleItems array (products config)
        if (profile.saleItems) {
          profile.saleItems.forEach(item => {
            if (item.imageUrlMale) {
              images.push({
                url: item.imageUrlMale,
                source: `${configPath}:${profile.id}:${item.id}:male`,
                type: 'product-gender'
              });
            }
            if (item.imageUrlFemale) {
              images.push({
                url: item.imageUrlFemale,
                source: `${configPath}:${profile.id}:${item.id}:female`,
                type: 'product-gender'
              });
            }
            if (item.imageUrlNeutral) {
              images.push({
                url: item.imageUrlNeutral,
                source: `${configPath}:${profile.id}:${item.id}:neutral`,
                type: 'product-gender'
              });
            }
            if (item.defaultImage) {
              images.push({
                url: item.defaultImage,
                source: `${configPath}:${profile.id}:${item.id}:default`,
                type: 'product-default'
              });
            }
          });
        }
      });
    }
    
    log('green', `✅ Extracted ${images.length} images from ${configPath}`);
  } catch (error) {
    log('red', `❌ Error parsing ${configPath}: ${error.message}`);
  }
  
  return images;
}

function checkLocalImages() {
  const localImages = [];
  const genderImagesPath = path.join(process.cwd(), 'public', 'images', 'gender');
  
  const genderImages = ['male.png', 'female.png', 'neutral.png'];
  
  genderImages.forEach(filename => {
    const filePath = path.join(genderImagesPath, filename);
    const exists = fs.existsSync(filePath);
    
    localImages.push({
      path: filePath,
      filename,
      exists,
      size: exists ? fs.statSync(filePath).size : 0,
      type: 'gender-local'
    });
  });
  
  return localImages;
}

function generateReport(results, localImages) {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const invalidType = results.filter(r => r.status >= 200 && r.status < 400 && !r.isValidType);
  const redirected = results.filter(r => r.redirected);
  const largeImages = results.filter(r => r.contentLength > 1024 * 1024); // > 1MB
  
  const localFailed = localImages.filter(img => !img.exists);
  const localLarge = localImages.filter(img => img.size > 1024 * 1024); // > 1MB
  
  log('blue', '\n🖼️ IMAGE CHECK REPORT');
  log('blue', '='.repeat(50));
  
  // Remote images
  log('blue', '\n📡 REMOTE IMAGES:');
  log('green', `✅ Successful: ${successful.length}`);
  log('red', `❌ Failed: ${failed.length}`);
  log('yellow', `🔄 Redirected: ${redirected.length}`);
  log('yellow', `⚠️ Invalid type: ${invalidType.length}`);
  log('yellow', `📏 Large files (>1MB): ${largeImages.length}`);
  log('blue', `📊 Total remote: ${results.length}`);
  
  // Local images
  log('blue', '\n💾 LOCAL IMAGES:');
  log('green', `✅ Found: ${localImages.filter(img => img.exists).length}`);
  log('red', `❌ Missing: ${localFailed.length}`);
  log('yellow', `📏 Large files (>1MB): ${localLarge.length}`);
  log('blue', `📊 Total local: ${localImages.length}`);
  
  // Failed remote images
  if (failed.length > 0) {
    log('red', '\n❌ FAILED REMOTE IMAGES:');
    failed.forEach(result => {
      const info = result.error ? ` (${result.error})` : ` (HTTP ${result.status})`;
      log('red', `   ${result.url}${info}`);
    });
  }
  
  // Invalid content types
  if (invalidType.length > 0) {
    log('yellow', '\n⚠️ INVALID CONTENT TYPES:');
    invalidType.forEach(result => {
      log('yellow', `   ${result.url} (${result.contentType})`);
    });
  }
  
  // Missing local images
  if (localFailed.length > 0) {
    log('red', '\n❌ MISSING LOCAL IMAGES:');
    localFailed.forEach(img => {
      log('red', `   ${img.path}`);
    });
  }
  
  // Large images
  if (largeImages.length > 0 || localLarge.length > 0) {
    log('yellow', '\n📏 LARGE IMAGES (>1MB):');
    largeImages.forEach(result => {
      const sizeMB = (result.contentLength / (1024 * 1024)).toFixed(2);
      log('yellow', `   ${result.url} (${sizeMB}MB)`);
    });
    localLarge.forEach(img => {
      const sizeMB = (img.size / (1024 * 1024)).toFixed(2);
      log('yellow', `   ${img.path} (${sizeMB}MB)`);
    });
  }
  
  // Redirected images
  if (redirected.length > 0) {
    log('yellow', '\n🔄 REDIRECTED IMAGES:');
    redirected.forEach(result => {
      log('yellow', `   ${result.url} → ${result.finalUrl} (${result.status})`);
    });
  }
  
  // Generate JSON report for CI
  const report = {
    timestamp: new Date().toISOString(),
    remote: {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      invalidType: invalidType.length,
      redirected: redirected.length,
      largeFiles: largeImages.length
    },
    local: {
      total: localImages.length,
      found: localImages.filter(img => img.exists).length,
      missing: localFailed.length,
      largeFiles: localLarge.length
    },
    failedRemoteImages: failed.map(r => ({
      url: r.url,
      status: r.status,
      error: r.error,
      contentType: r.contentType
    })),
    invalidTypeImages: invalidType.map(r => ({
      url: r.url,
      contentType: r.contentType,
      status: r.status
    })),
    missingLocalImages: localFailed.map(img => ({
      path: img.path,
      filename: img.filename
    })),
    largeRemoteImages: largeImages.map(r => ({
      url: r.url,
      contentLength: r.contentLength,
      sizeMB: (r.contentLength / (1024 * 1024)).toFixed(2)
    })),
    largeLocalImages: localLarge.map(img => ({
      path: img.path,
      size: img.size,
      sizeMB: (img.size / (1024 * 1024)).toFixed(2)
    }))
  };
  
  // Save report to file
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportPath = path.join(reportsDir, 'image-check-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log('blue', `\n📄 Report saved to: ${reportPath}`);
  
  return report;
}

async function main() {
  log('blue', '🖼️ FitFi Image Checker Starting...\n');
  
  // Check local images first
  log('blue', '💾 Checking local gender images...');
  const localImages = checkLocalImages();
  
  localImages.forEach(img => {
    if (img.exists) {
      const sizeMB = (img.size / (1024 * 1024)).toFixed(2);
      log('green', `✅ ${img.filename} (${sizeMB}MB)`);
    } else {
      log('red', `❌ ${img.filename} missing`);
    }
  });
  
  // Extract remote images from config files
  log('blue', '\n📡 Extracting remote images from config files...');
  const imageData = [];
  
  const configFiles = [
    'src/config/curated-products.json',
    'src/config/products-config.json'
  ];
  
  configFiles.forEach(configPath => {
    const extractedImages = extractImagesFromConfig(configPath);
    imageData.push(...extractedImages);
  });
  
  // Remove duplicates
  const uniqueUrls = [...new Set(imageData.map(img => img.url))];
  
  if (uniqueUrls.length === 0) {
    log('yellow', '⚠️ No remote images found to check');
  } else {
    log('blue', `🔍 Checking ${uniqueUrls.length} unique remote images...\n`);
    
    const results = await checkImagesBatch(uniqueUrls);
    
    // Generate and display report
    const report = generateReport(results, localImages);
    
    // Determine if we should exit with error
    const hasErrors = report.remote.failed > 0 || 
                     report.remote.invalidType > 0 || 
                     report.local.missing > 0;
    
    if (hasErrors) {
      log('red', `\n❌ Image check failed:`);
      if (report.remote.failed > 0) {
        log('red', `   - ${report.remote.failed} remote images failed`);
      }
      if (report.remote.invalidType > 0) {
        log('red', `   - ${report.remote.invalidType} remote images have invalid content type`);
      }
      if (report.local.missing > 0) {
        log('red', `   - ${report.local.missing} local images are missing`);
      }
      process.exit(1);
    } else {
      log('green', `\n✅ All images are accessible and valid!`);
      log('green', `   - ${report.remote.successful} remote images OK`);
      log('green', `   - ${report.local.found} local images found`);
      
      // Warnings for large files
      if (report.remote.largeFiles > 0 || report.local.largeFiles > 0) {
        log('yellow', `\n⚠️ Warning: ${report.remote.largeFiles + report.local.largeFiles} large images found (>1MB)`);
        log('yellow', '   Consider optimizing these images for better performance');
      }
      
      process.exit(0);
    }
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log('red', `❌ Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log('red', `❌ Unhandled rejection: ${reason}`);
  process.exit(1);
});

// Run the main function
main().catch(error => {
  log('red', `❌ Image checker failed: ${error.message}`);
  process.exit(1);
});