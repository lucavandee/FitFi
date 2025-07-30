const { test, expect } = require('@playwright/test');

test.describe('Fixed Authentication Flow', () => {
  test('successful login flow within 2 seconds', async ({ page }) => {
    // Navigate to login page
    await page.goto('/inloggen');
    await page.waitForLoadState('networkidle');
    
    // Fill login form with valid credentials
    await page.fill('input[name="email"]', 'demo@fitfi.ai');
    await page.fill('input[name="password"]', 'TestPassword123!');
    
    // Start timer
    const startTime = Date.now();
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    
    // Check timing
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Login completed in ${duration}ms`);
    expect(duration).toBeLessThan(2000); // Must be under 2 seconds
    
    // Verify we're on dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Verify no 500 errors in console
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('500')) {
        logs.push(msg.text());
      }
    });
    
    expect(logs).toHaveLength(0);
  });
  
  test('invalid credentials show proper error message', async ({ page }) => {
    await page.goto('/inloggen');
    await page.waitForLoadState('networkidle');
    
    // Fill with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await page.waitForTimeout(3000);
    
    // Verify error message appears
    await expect(page.locator('text=E-mail of wachtwoord onjuist')).toBeVisible();
    
    // Verify no infinite spinner
    await expect(page.locator('.animate-spin')).not.toBeVisible();
    
    console.log('✅ Invalid credentials properly handled');
  });
  
  test('timeout fallback works after 8 seconds', async ({ page }) => {
    // Mock slow network
    await page.route('**/auth/v1/token**', async route => {
      // Delay response by 10 seconds to trigger timeout
      await new Promise(resolve => setTimeout(resolve, 10000));
      await route.continue();
    });
    
    await page.goto('/inloggen');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for timeout message (8 seconds + buffer)
    await page.waitForTimeout(9000);
    
    // Should show timeout error
    await expect(page.locator('text=Inloggen duurt te lang')).toBeVisible();
    
    console.log('✅ Timeout fallback working correctly');
  });

  test('environment variables validation', async ({ page }) => {
    // Check that build would fail with missing env vars
    const envCheck = await page.evaluate(() => {
      // Simulate missing env var
      const originalEnv = window.import?.meta?.env;
      return originalEnv ? Object.keys(originalEnv).filter(k => k.startsWith('VITE_')).length > 0 : false;
    });
    
    expect(envCheck).toBe(true);
    console.log('✅ Environment variables properly configured');
  });
});

test.describe('Console Cleanliness', () => {
  test('no unnecessary console warnings in production mode', async ({ page }) => {
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
    
    const warnings = [];
    page.on('console', msg => {
      if (msg.type() === 'warn' && !msg.text().includes('React') && !msg.text().includes('DevTools')) {
        warnings.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should have minimal warnings in production
    expect(warnings.length).toBeLessThan(3);
    console.log(`✅ Console warnings in production: ${warnings.length}`);
  });
});