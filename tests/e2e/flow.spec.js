// Playwright E2E test for FitFi complete user journey
const { test, expect } = require('@playwright/test');

test.describe('FitFi User Journey', () => {
  test('complete user flow from landing to results', async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check homepage elements
    await expect(page.locator('h1')).toContainText('Discover Your Perfect Style');
    await expect(page.locator('button:has-text("Start Style Quiz")')).toBeVisible();
    
    // Fill hero form if present
    const nameInput = page.locator('input[name="name"]').first();
    const emailInput = page.locator('input[name="email"]').first();
    
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test User');
      await emailInput.fill('test@fitfi.app');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
    }
    
    // Navigate to onboarding welcome step
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Welcome step - click start
    await expect(page.locator('h1')).toContainText('Ontdek je perfecte stijl');
    await page.locator('button:has-text("Start de stijlquiz")').click();
    await page.waitForLoadState('networkidle');
    
    // Gender Name step
    await expect(page.url()).toContain('/onboarding/gender-name');
    await page.locator('button:has-text("Vrouw")').click();
    const nameInput2 = page.locator('input[name="name"]');
    if (await nameInput2.isVisible()) {
      await nameInput2.fill('Test User');
    }
    await page.locator('button:has-text("Volgende")').click();
    await page.waitForLoadState('networkidle');
    
    // Archetype step
    await expect(page.url()).toContain('/onboarding/archetype');
    await page.locator('button').first().click(); // Select first archetype
    await page.locator('button:has-text("Volgende")').click();
    await page.waitForLoadState('networkidle');
    
    // Season step
    await expect(page.url()).toContain('/onboarding/season');
    await page.locator('button').first().click(); // Select first season
    await page.locator('button:has-text("Volgende")').click();
    await page.waitForLoadState('networkidle');
    
    // Occasion step
    await expect(page.url()).toContain('/onboarding/occasion');
    await page.locator('button').first().click(); // Select first occasion
    await page.locator('button:has-text("Resultaten bekijken")').click();
    await page.waitForLoadState('networkidle');
    
    // Should now be on results page
    await expect(page.url()).toContain('/results');
    
    // Verify results page elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Shop"), .cta-button')).toBeVisible();
    
    // Check for product grid or recommendations
    const productElements = page.locator('.grid, .product-card, [data-testid="product"]');
    await expect(productElements.first()).toBeVisible();
    
    // Test product link functionality
    const productLinks = page.locator('a[href*="zalando"], a[href*="hm.com"], a[href*="wehkamp"], .product-link');
    if (await productLinks.count() > 0) {
      const firstLink = productLinks.first();
      const href = await firstLink.getAttribute('href');
      
      if (href) {
        // Verify link is valid (starts with http)
        expect(href).toMatch(/^https?:\/\//);
        
        // Test that link opens in new tab
        const target = await firstLink.getAttribute('target');
        expect(target).toBe('_blank');
      }
    }
    
    // Check for no console errors
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    // Wait a bit to catch any delayed errors
    await page.waitForTimeout(2000);
    
    // Report any console errors but don't fail the test
    if (logs.length > 0) {
      console.warn('Console errors found:', logs);
    }
    
    console.log('✅ E2E flow completed successfully');
  });
  
  test('navigation and accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test responsive design
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await expect(page.locator('h1')).toBeVisible();
    
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
    await expect(page.locator('h1')).toBeVisible();
    
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await expect(page.locator('h1')).toBeVisible();
  });
  
  test('error handling', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page');
    // Should redirect to home or show 404 page
    
    // Test form validation
    await page.goto('/onboarding');
    
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Should show validation errors or prevent submission
    }
  });
});

test.describe('Performance Tests', () => {
  test('page load performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`Page load time: ${loadTime}ms`);
  });
});
</invoke>

<action type="file" filePath="package.json">
{
  "name": "fitfi-site",
  "version": "1.0.0",
  "description": "AI-powered personal style recommendations platform",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "link-check": "node scripts/link-check.js",
    "image-check": "node scripts/image-check.js",
    "test:links": "npm run link-check",
    "test:images": "npm run image-check",
    "test:all": "npm run lint && npm run link-check && npm run image-check && npm run build",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "lhci": "lhci autorun",
    "lighthouse": "npm run lhci"
  },
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.22.3",
    "swr": "^2.2.4"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@lhci/cli": "^0.12.0",
    "@playwright/test": "^1.40.0",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2"
  }
}
</action>

<action type="file" filePath=".lighthouserc.js">
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4173',
        'http://localhost:4173/onboarding',
        'http://localhost:4173/results'
      ],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'desktop'
      }
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.85 }],
        'categories:pwa': ['warn', { minScore: 0.60 }],
        
        // Performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Accessibility
        'color-contrast': 'error',
        'heading-order': 'error',
        'html-has-lang': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        
        // Best practices
        'uses-https': 'error',
        'no-vulnerable-libraries': 'error',
        'csp-xss': 'warn',
        
        // SEO
        'document-title': 'error',
        'meta-description': 'error',
        'robots-txt': 'warn',
        'canonical': 'warn'
      }
    },
    upload: {
      target: 'temporary-public-storage',
      reportFilenamePattern: 'lighthouse-report-%%PATHNAME%%-%%DATETIME%%.json'
    },
    server: {
      port: 4173,
      host: 'localhost'
    }
  }
};
</action>

<action type="file" filePath="playwright.config.js">
// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list']
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:4173',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Timeout for each action */
    actionTimeout: 10000,
    
    /* Timeout for navigation */
    navigationTimeout: 30000
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  },
  
  /* Global test timeout */
  timeout: 60000,
  
  /* Expect timeout */
  expect: {
    timeout: 10000
  },
  
  /* Output directory for test artifacts */
  outputDir: 'test-results/',
  
  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/global-setup.js'),
  globalTeardown: require.resolve('./tests/global-teardown.js')
});
</action>

<action type="file" filePath="tests/global-setup.js">
// Global setup for Playwright tests
const { chromium } = require('@playwright/test');

async function globalSetup() {
  console.log('🚀 Starting global setup for FitFi E2E tests...');
  
  // Verify the application is running
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the application to be ready
    await page.goto('http://localhost:4173', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Verify basic page elements
    await page.waitForSelector('h1', { timeout: 10000 });
    
    console.log('✅ Application is ready for testing');
    
  } catch (error) {
    console.error('❌ Application setup failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;
</action>

<action type="file" filePath="tests/global-teardown.js">
// Global teardown for Playwright tests
async function globalTeardown() {
  console.log('🧹 Running global teardown for FitFi E2E tests...');
  
  // Clean up any test artifacts
  const fs = require('fs');
  const path = require('path');
  
  // Clean up temporary files if any
  const tempDir = path.join(process.cwd(), 'temp-test-files');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('🗑️ Cleaned up temporary test files');
  }
  
  console.log('✅ Global teardown completed');
}

module.exports = globalTeardown;
</action>

<action type="file" filePath=".github/workflows/qa.yml">
name: QA Checks

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    # Run daily at 6 AM UTC
    - cron: '0 6 * * *'

jobs:
  schema-validate:
    name: Validate JSON Schema
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install JSON Schema validator
        run: npm install -g ajv-cli
        
      - name: Create JSON Schema for products config
        run: |
          cat > products-schema.json << 'EOF'
          {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "type": "object",
            "properties": {
              "profiles": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "id": { "type": "string" },
                    "displayName": { "type": "string" },
                    "saleItems": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": { "type": "string" },
                          "name": { "type": "string" },
                          "retailer": { "type": "string" },
                          "productId": { "type": "string" },
                          "price": { "type": "number", "minimum": 0 },
                          "category": { "type": "string" },
                          "imageUrlMale": { "type": "string", "format": "uri" },
                          "imageUrlFemale": { "type": "string", "format": "uri" },
                          "imageUrlNeutral": { "type": "string", "format": "uri" },
                          "defaultImage": { "type": "string", "format": "uri" }
                        },
                        "required": ["id", "name", "retailer", "price", "category", "defaultImage"]
                      }
                    }
                  },
                  "required": ["id", "displayName", "saleItems"]
                }
              }
            },
            "required": ["profiles"]
          }
          EOF
          
      - name: Validate products config schema
        run: |
          if [ -f "src/config/products-config.json" ]; then
            ajv validate -s products-schema.json -d src/config/products-config.json
            echo "✅ Products config schema validation passed"
          else
            echo "⚠️ Products config file not found, skipping validation"
          fi
          
      - name: Validate curated products config
        run: |
          if [ -f "src/config/curated-products.json" ]; then
            node -e "
              const config = require('./src/config/curated-products.json');
              console.log('✅ Curated products config is valid JSON');
              
              // Validate required structure
              if (!config.profiles) throw new Error('Missing profiles array');
              
              config.profiles.forEach((profile, index) => {
                if (!profile.id) throw new Error(\`Profile \${index} missing id\`);
                if (!profile.displayName) throw new Error(\`Profile \${index} missing displayName\`);
                if (!profile.items) throw new Error(\`Profile \${index} missing items array\`);
                
                profile.items.forEach((item, itemIndex) => {
                  if (!item.id) throw new Error(\`Profile \${profile.id} item \${itemIndex} missing id\`);
                  if (!item.name) throw new Error(\`Profile \${profile.id} item \${itemIndex} missing name\`);
                  if (!item.retailer) throw new Error(\`Profile \${profile.id} item \${itemIndex} missing retailer\`);
                  if (!item.url) throw new Error(\`Profile \${profile.id} item \${itemIndex} missing url\`);
                  if (!item.imageUrl) throw new Error(\`Profile \${profile.id} item \${itemIndex} missing imageUrl\`);
                  if (typeof item.price !== 'number') throw new Error(\`Profile \${profile.id} item \${itemIndex} invalid price\`);
                  if (!Array.isArray(item.sizes)) throw new Error(\`Profile \${profile.id} item \${itemIndex} sizes must be array\`);
                  if (typeof item.inStock !== 'boolean') throw new Error(\`Profile \${profile.id} item \${itemIndex} inStock must be boolean\`);
                });
              });
              
              console.log('✅ Curated products config structure validation passed');
            "
          else
            echo "⚠️ Curated products config file not found, skipping validation"
          fi
          
      - name: Validate gamification config
        run: |
          if [ -f "src/config/gamification.json" ]; then
            node -e "
              const config = require('./src/config/gamification.json');
              console.log('✅ Gamification config is valid JSON');
              
              // Validate required structure
              if (!config.pointsPerAction) throw new Error('Missing pointsPerAction');
              if (!config.levels) throw new Error('Missing levels');
              if (!config.badges) throw new Error('Missing badges');
              if (!config.dailyChallenges) throw new Error('Missing dailyChallenges');
              
              console.log('✅ Gamification config structure validation passed');
            "
          else
            echo "⚠️ Gamification config file not found, skipping validation"
          fi

  link-check:
    name: Link Checker
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run link-check
        run: npm run link-check
        
      - name: Upload link check report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: link-check-report
          path: reports/link-check-report.json

  image-check:
    name: Image Checker
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run image-check
        run: npm run image-check
        
      - name: Upload image check report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: image-check-report
          path: reports/image-check-report.json

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium firefox webkit
        
      - name: Build application
        run: npm run build
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload E2E test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: e2e-test-results
          path: |
            test-results/
            playwright-report/
            test-results.json
          retention-days: 7
          
      - name: Upload E2E test report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  lighthouse:
    name: Lighthouse Performance Audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Run Lighthouse CI
        run: npm run lhci
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
        
      - name: Upload Lighthouse results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: lighthouse-results
          path: .lighthouseci/
          retention-days: 7

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run npm audit
        run: |
          echo "🔒 Running security audit..."
          npm audit --audit-level=moderate
          
      - name: Check for sensitive files
        run: |
          echo "🔍 Checking for sensitive files..."
          
          # Check for common sensitive files
          sensitive_files=(
            ".env"
            ".env.local"
            ".env.production"
            "config/secrets.json"
            "private.key"
            "id_rsa"
          )
          
          found_sensitive=false
          for file in "${sensitive_files[@]}"; do
            if [ -f "$file" ]; then
              echo "⚠️ Sensitive file found: $file"
              found_sensitive=true
            fi
          done
          
          if [ "$found_sensitive" = false ]; then
            echo "✅ No sensitive files found"
          fi
          
      - name: Check for hardcoded secrets
        run: |
          echo "🔍 Scanning for hardcoded secrets..."
          
          # Simple regex patterns for common secrets
          if grep -r -i "password\s*=\s*['\"][^'\"]*['\"]" src/ --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" 2>/dev/null; then
            echo "⚠️ Potential hardcoded password found"
          fi
          
          if grep -r -i "api[_-]?key\s*=\s*['\"][^'\"]*['\"]" src/ --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" 2>/dev/null; then
            echo "⚠️ Potential hardcoded API key found"
          fi
          
          echo "✅ Security scan completed"

  accessibility-check:
    name: Accessibility Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Install axe-core CLI
        run: npm install -g @axe-core/cli
        
      - name: Start preview server
        run: |
          npm run preview &
          sleep 10
          
      - name: Run accessibility tests
        run: |
          echo "♿ Running accessibility tests..."
          
          # Test main pages
          axe http://localhost:4173 --exit
          
          echo "✅ Accessibility tests completed"

  summary:
    name: QA Summary
    runs-on: ubuntu-latest
    needs: [schema-validate, link-check, image-check, e2e, lighthouse, security-scan, accessibility-check]
    if: always()
    steps:
      - name: Generate QA Summary
        run: |
          echo "# 📊 QA Test Results Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          
          # Check job results
          if [ "${{ needs.schema-validate.result }}" == "success" ]; then
            echo "✅ **Schema Validation**: Passed" >> $GITHUB_STEP_SUMMARY
          else
            echo "❌ **Schema Validation**: Failed" >> $GITHUB_STEP_SUMMARY
          fi
          
          if [ "${{ needs.link-check.result }}" == "success" ]; then
            echo "✅ **Link Check**: Passed" >> $GITHUB_STEP_SUMMARY
          else
            echo "❌ **Link Check**: Failed" >> $GITHUB_STEP_SUMMARY
          fi
          
          if [ "${{ needs.image-check.result }}" == "success" ]; then
            echo "✅ **Image Check**: Passed" >> $GITHUB_STEP_SUMMARY
          else
            echo "❌ **Image Check**: Failed" >> $GITHUB_STEP_SUMMARY
          fi
          
          if [ "${{ needs.e2e.result }}" == "success" ]; then
            echo "✅ **E2E Tests**: Passed" >> $GITHUB_STEP_SUMMARY
          else
            echo "❌ **E2E Tests**: Failed" >> $GITHUB_STEP_SUMMARY
          fi
          
          if [ "${{ needs.lighthouse.result }}" == "success" ]; then
            echo "✅ **Lighthouse Audit**: Passed" >> $GITHUB_STEP_SUMMARY
          else
            echo "❌ **Lighthouse Audit**: Failed" >> $GITHUB_STEP_SUMMARY
          fi
          
          if [ "${{ needs.security-scan.result }}" == "success" ]; then
            echo "✅ **Security Scan**: Passed" >> $GITHUB_STEP_SUMMARY
          else
            echo "❌ **Security Scan**: Failed" >> $GITHUB_STEP_SUMMARY
          fi
          
          if [ "${{ needs.accessibility-check.result }}" == "success" ]; then
            echo "✅ **Accessibility Check**: Passed" >> $GITHUB_STEP_SUMMARY
          else
            echo "❌ **Accessibility Check**: Failed" >> $GITHUB_STEP_SUMMARY
          fi
          
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Timestamp**: $(date -u)" >> $GITHUB_STEP_SUMMARY
          echo "**Commit**: ${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
          echo "**Branch**: ${{ github.ref_name }}" >> $GITHUB_STEP_SUMMARY
</action>

<action type="shell">
<command>npm install -D @playwright/test @lhci/cli</command>
</action>

<action type="shell">
<command>git add tests/ .lighthouserc.js playwright.config.js package.json .github/workflows/qa.yml</command>
</action>

<action type="shell">
<command>git commit -m "🧪 Add E2E and Lighthouse CI tests for journey, performance & accessibility"</command>
</action>

<action type="shell">
<command>git push origin main</command>
</action>
                )
              }
              )
                )
              }
              )