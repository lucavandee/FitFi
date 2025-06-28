const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;
const CONCURRENT_REQUESTS = 5;

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

async function checkUrl(url, retries = 0) {
  return new Promise((resolve) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.get(url, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'FitFi-LinkChecker/1.0'
      }
    }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 400,
        redirected: res.statusCode >= 300 && res.statusCode < 400,
        finalUrl: res.headers.location || url
      });
    });
    
    req.on('error', async (err) => {
      if (retries < MAX_RETRIES) {
        log('yellow', `⚠️ Retrying ${url} (attempt ${retries + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
        const result = await checkUrl(url, retries + 1);
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
  });
}

async function checkUrlsBatch(urls) {
  const results = [];
  
  for (let i = 0; i < urls.length; i += CONCURRENT_REQUESTS) {
    const batch = urls.slice(i, i + CONCURRENT_REQUESTS);
    const batchResults = await Promise.all(batch.map(url => checkUrl(url)));
    results.push(...batchResults);
    
    // Progress indicator
    const progress = Math.min(i + CONCURRENT_REQUESTS, urls.length);
    log('blue', `📊 Progress: ${progress}/${urls.length} URLs checked`);
  }
  
  return results;
}

function extractUrlsFromConfig(configPath) {
  const urls = [];
  
  if (!fs.existsSync(configPath)) {
    log('yellow', `⚠️ Config file not found: ${configPath}`);
    return urls;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    if (config.profiles) {
      config.profiles.forEach(profile => {
        // Check items array (curated products)
        if (profile.items) {
          profile.items.forEach(item => {
            if (item.url) urls.push(item.url);
            if (item.imageUrl) urls.push(item.imageUrl);
          });
        }
        
        // Check saleItems array (products config)
        if (profile.saleItems) {
          profile.saleItems.forEach(item => {
            if (item.imageUrlMale) urls.push(item.imageUrlMale);
            if (item.imageUrlFemale) urls.push(item.imageUrlFemale);
            if (item.imageUrlNeutral) urls.push(item.imageUrlNeutral);
            if (item.defaultImage) urls.push(item.defaultImage);
          });
        }
      });
    }
    
    log('green', `✅ Extracted ${urls.length} URLs from ${configPath}`);
  } catch (error) {
    log('red', `❌ Error parsing ${configPath}: ${error.message}`);
  }
  
  return urls;
}

function getBaseRetailerUrls() {
  return [
    'https://www.zalando.nl',
    'https://www.wehkamp.nl',
    'https://www2.hm.com/nl_nl',
    'https://www.asos.com/nl',
    'https://www.bol.com',
    'https://www.debijenkorf.nl',
    'https://www.aboutyou.nl',
    'https://www.net-a-porter.com/nl'
  ];
}

function generateReport(results) {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const redirected = results.filter(r => r.redirected);
  
  log('blue', '\n📋 LINK CHECK REPORT');
  log('blue', '='.repeat(50));
  
  log('green', `✅ Successful: ${successful.length}`);
  log('red', `❌ Failed: ${failed.length}`);
  log('yellow', `🔄 Redirected: ${redirected.length}`);
  log('blue', `📊 Total: ${results.length}`);
  
  if (failed.length > 0) {
    log('red', '\n❌ FAILED URLS:');
    failed.forEach(result => {
      const info = result.error ? ` (${result.error})` : ` (HTTP ${result.status})`;
      log('red', `   ${result.url}${info}`);
    });
  }
  
  if (redirected.length > 0) {
    log('yellow', '\n🔄 REDIRECTED URLS:');
    redirected.forEach(result => {
      log('yellow', `   ${result.url} → ${result.finalUrl} (${result.status})`);
    });
  }
  
  // Generate JSON report for CI
  const report = {
    timestamp: new Date().toISOString(),
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    redirected: redirected.length,
    failedUrls: failed.map(r => ({
      url: r.url,
      status: r.status,
      error: r.error
    })),
    redirectedUrls: redirected.map(r => ({
      url: r.url,
      finalUrl: r.finalUrl,
      status: r.status
    }))
  };
  
  // Save report to file
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportPath = path.join(reportsDir, 'link-check-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log('blue', `\n📄 Report saved to: ${reportPath}`);
  
  return report;
}

async function main() {
  log('blue', '🔗 FitFi Link Checker Starting...\n');
  
  const urls = new Set();
  
  // Add base retailer URLs
  getBaseRetailerUrls().forEach(url => urls.add(url));
  
  // Extract URLs from config files
  const configFiles = [
    'src/config/curated-products.json',
    'src/config/products-config.json'
  ];
  
  configFiles.forEach(configPath => {
    const extractedUrls = extractUrlsFromConfig(configPath);
    extractedUrls.forEach(url => urls.add(url));
  });
  
  const uniqueUrls = Array.from(urls);
  
  if (uniqueUrls.length === 0) {
    log('yellow', '⚠️ No URLs found to check');
    return;
  }
  
  log('blue', `🔍 Checking ${uniqueUrls.length} unique URLs...\n`);
  
  const results = await checkUrlsBatch(uniqueUrls);
  
  // Generate and display report
  const report = generateReport(results);
  
  // Exit with error code if any URLs failed
  if (report.failed > 0) {
    log('red', `\n❌ Link check failed: ${report.failed} URLs are not accessible`);
    process.exit(1);
  } else {
    log('green', `\n✅ All ${report.total} URLs are accessible!`);
    process.exit(0);
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
  log('red', `❌ Link checker failed: ${error.message}`);
  process.exit(1);
});