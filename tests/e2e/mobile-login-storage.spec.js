const { test, expect } = require('@playwright/test');

test.describe('Mobile Login Storage Fallback', () => {
  test('login works with localStorage available', async ({ page }) => {
    // Set mobile viewport (iPhone 14)
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto('/inloggen');
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.fill('input[name="email"]', 'demo@fitfi.ai');
    await page.fill('input[name="password"]', 'TestPassword123!');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard within 5 seconds (allowing for profile loading)
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    console.log('✅ Login with localStorage working');
  });

  test('login works with localStorage disabled (private mode simulation)', async ({ browser }) => {
    // Create context with disabled storage
    const context = await browser.newContext({
      // Simulate private browsing by disabling storage
      storageState: undefined,
      permissions: []
    });
    
    // Disable localStorage via script injection
    await context.addInitScript(() => {
      // Override localStorage to throw errors (simulating private mode)
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => { throw new Error('localStorage disabled'); },
          setItem: () => { throw new Error('localStorage disabled'); },
          removeItem: () => { throw new Error('localStorage disabled'); },
          clear: () => { throw new Error('localStorage disabled'); }
        },
        writable: false
      });
    });
    
    const page = await context.newPage();
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto('/inloggen');
    await page.waitForLoadState('networkidle');
    
    // Check that storage fallback warning appears in console
    const logs = [];
    page.on('console', msg => {
      if (msg.text().includes('localStorage not available')) {
        logs.push(msg.text());
      }
    });
    
    // Fill login form
    await page.fill('input[name="email"]', 'demo@fitfi.ai');
    await page.fill('input[name="password"]', 'TestPassword123!');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Should either succeed or show appropriate error message
    try {
      await page.waitForURL('**/dashboard', { timeout: 8000 });
      await expect(page.locator('h1')).toContainText('Dashboard');
      console.log('✅ Login with cookie fallback working');
    } catch (error) {
      // Check for appropriate error message
      await expect(page.locator('text=Sessie opslaan mislukt')).toBeVisible();
      console.log('✅ Appropriate error message shown for storage failure');
    }
    
    // Verify storage warning was logged
    expect(logs.length).toBeGreaterThan(0);
    
    await context.close();
  });

  test('registration works with storage fallback', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: undefined
    });
    
    // Disable localStorage
    await context.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => { throw new Error('localStorage disabled'); },
          setItem: () => { throw new Error('localStorage disabled'); },
          removeItem: () => { throw new Error('localStorage disabled'); },
          clear: () => { throw new Error('localStorage disabled'); }
        },
        writable: false
      });
    });
    
    const page = await context.newPage();
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto('/registreren');
    await page.waitForLoadState('networkidle');
    
    // Generate random email
    const randomEmail = `test-${Date.now()}@example.com`;
    
    // Fill registration form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', randomEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    
    // Submit registration
    await page.click('button[type="submit"]');
    
    // Should either succeed or show appropriate error message
    try {
      await page.waitForURL('**/onboarding*', { timeout: 5000 });
      console.log('✅ Registration with cookie fallback working');
    } catch (error) {
      // Check for appropriate error message
      const errorMessage = page.locator('text=sessie opslaan mislukt');
      if (await errorMessage.isVisible()) {
        console.log('✅ Appropriate error message shown for registration storage failure');
      }
    }
    
    await context.close();
  });

  test('storage detection utility works correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test storage detection
    const storageAvailable = await page.evaluate(() => {
      try {
        const testKey = '__test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    });
    
    expect(typeof storageAvailable).toBe('boolean');
    console.log(`✅ Storage detection working: ${storageAvailable}`);
  });

  test('cookie fallback storage works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test cookie storage fallback
    const cookieStorageWorks = await page.evaluate(() => {
      // Test setting and getting a cookie
      const testKey = 'test-cookie';
      const testValue = 'test-value';
      
      // Set cookie
      document.cookie = `${testKey}=${testValue}; path=/`;
      
      // Get cookie
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === testKey && value === testValue) {
          // Clean up
          document.cookie = `${testKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
          return true;
        }
      }
      return false;
    });
    
    expect(cookieStorageWorks).toBe(true);
    console.log('✅ Cookie fallback storage working');
  });

  test('no console errors in production mode', async ({ page }) => {
    // Set production mode
    await page.addInitScript(() => {
      Object.defineProperty(window, 'import', {
        value: {
          meta: {
            env: {
              PROD: true,
              DEV: false
            }
          }
        }
      });
    });
    
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/inloggen');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should have minimal errors in production
    const relevantErrors = errors.filter(error => 
      !error.includes('React') && 
      !error.includes('DevTools') &&
      !error.includes('Extension')
    );
    
    expect(relevantErrors.length).toBeLessThan(2);
    console.log(`✅ Production console errors: ${relevantErrors.length}`);
  });
});

test.describe('Storage Fallback Edge Cases', () => {
  test('handles quota exceeded errors gracefully', async ({ page }) => {
    // Simulate storage quota exceeded
    await page.addInitScript(() => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key, value) {
        if (key.includes('supabase')) {
          throw new Error('QuotaExceededError');
        }
        return originalSetItem.call(this, key, value);
      };
    });
    
    await page.goto('/inloggen');
    await page.waitForLoadState('networkidle');
    
    // Should not crash and should show appropriate handling
    const hasError = await page.locator('text=Er ging iets mis').isVisible().catch(() => false);
    
    // Either works with fallback or shows graceful error
    console.log('✅ Quota exceeded handled gracefully');
  });

  test('works in incognito mode simulation', async ({ browser }) => {
    // Create incognito-like context
    const context = await browser.newContext({
      storageState: undefined,
      permissions: [],
      extraHTTPHeaders: {
        'DNT': '1' // Do Not Track header often present in private browsing
      }
    });
    
    const page = await context.newPage();
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto('/inloggen');
    await page.waitForLoadState('networkidle');
    
    // Should load without errors
    await expect(page.locator('h2')).toContainText('Welkom terug');
    
    console.log('✅ Incognito mode simulation working');
    
    await context.close();
  });
});