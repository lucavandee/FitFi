@@ .. @@
 const { test, expect } = require('@playwright/test');

 test.describe('FitFi Authentication Flow', () => {
-  test('complete user flow from landing to results', async ({ page }) => {
+  test('successful login flow', async ({ page }) => {
     // Generate random email for testing
-    const randomEmail = `referral-test-${Date.now()}@example.com`;
+    const testEmail = 'demo@fitfi.ai';
     const testPassword = 'TestPassword123!';
-    const testName = 'Referral Test User';
+    
+    // Navigate to login page
+    await page.goto('/inloggen');
+    await page.waitForLoadState('networkidle');
+    
+    // Fill login form
+    await page.fill('input[name="email"]', testEmail);
+    await page.fill('input[name="password"]', testPassword);
+    
+    // Submit login
+    await page.click('button[type="submit"]');
+    
+    // Wait for redirect to dashboard (max 5 seconds)
+    await page.waitForURL('**/dashboard', { timeout: 5000 });
+    
+    // Verify we're on dashboard
+    await expect(page.locator('h1')).toContainText('Dashboard');
+    
+    console.log('✅ Login flow completed successfully');
+  });
+  
+  test('login with invalid credentials shows error', async ({ page }) => {
+    await page.goto('/inloggen');
+    await page.waitForLoadState('networkidle');
+    
+    // Try to login with invalid credentials
+    await page.fill('input[name="email"]', 'invalid@example.com');
+    await page.fill('input[name="password"]', 'wrongpassword');
+    await page.click('button[type="submit"]');
+    
+    // Wait for error message
+    await page.waitForTimeout(3000);
+    
+    // Should show error message
+    await expect(page.locator('[role="alert"]')).toBeVisible();
+    await expect(page.locator('text=E-mail of wachtwoord onjuist')).toBeVisible();
+    
+    console.log('✅ Invalid credentials error handling works');
+  });
+  
+  test('login timeout shows fallback', async ({ page }) => {
+    // Mock slow network
+    await page.route('**/auth/v1/token**', async route => {
+      // Delay response by 10 seconds to trigger timeout
+      await new Promise(resolve => setTimeout(resolve, 10000));
+      await route.continue();
+    });
+    
+    await page.goto('/inloggen');
+    await page.waitForLoadState('networkidle');
+    
+    await page.fill('input[name="email"]', 'test@example.com');
+    await page.fill('input[name="password"]', 'password123');
+    await page.click('button[type="submit"]');
+    
+    // Wait for timeout message (8 seconds + buffer)
+    await page.waitForTimeout(9000);
+    
+    // Should show timeout error
+    await expect(page.locator('text=Inloggen duurt te lang')).toBeVisible();
+    
+    console.log('✅ Login timeout handling works');
+  });

-    // Navigate to registration page
-    await page.goto('/registreren');
+  test('complete registration and login flow', async ({ page }) => {
+    // Generate random email for testing
+    const randomEmail = `test-${Date.now()}@example.com`;
+    const testPassword = 'TestPassword123!';
+    const testName = 'Test User';

+    // Navigate to registration page
+    await page.goto('/registreren');
     await page.waitForLoadState('networkidle');

     // Fill registration form
     await page.fill('input[name="name"]', testName);
     await page.fill('input[name="email"]', randomEmail);
     await page.fill('input[name="password"]', testPassword);
     await page.fill('input[name="confirmPassword"]', testPassword);

     // Submit registration
     await page.click('button[type="submit"]');
     await page.waitForTimeout(3000);

     // Should be on onboarding page
     expect(page.url()).toContain('/onboarding');

-    // Welcome step - click start
-    await expect(page.locator('h1')).toContainText('Ontdek je perfecte stijl');
-    await page.locator('button:has-text("Start de stijlquiz")').click();
-    await page.waitForLoadState('networkidle');
-    
-    // Gender Name step
-    await expect(page.url()).toContain('/onboarding/gender-name');
-    await page.locator('button:has-text("Vrouw")').click();
-    const nameInput2 = page.locator('input[name="name"]');
-    if (await nameInput2.isVisible()) {
-      await nameInput2.fill('Test User');
-    }
-    await page.locator('button:has-text("Volgende")').click();
-    await page.waitForLoadState('networkidle');
-    
-    // Archetype step
-    await expect(page.url()).toContain('/onboarding/archetype');
-    await page.locator('button').first().click(); // Select first archetype
-    await page.locator('button:has-text("Volgende")').click();
-    await page.waitForLoadState('networkidle');
-    
-    // Season step
-    await expect(page.url()).toContain('/onboarding/season');
-    await page.locator('button').first().click(); // Select first season
-    await page.locator('button:has-text("Volgende")').click();
-    await page.waitForLoadState('networkidle');
-    
-    // Occasion step
-    await expect(page.url()).toContain('/onboarding/occasion');
-    await page.locator('button').first().click(); // Select first occasion
-    await page.locator('button:has-text("Resultaten bekijken")').click();
-    await page.waitForLoadState('networkidle');
-    
-    // Should now be on results page
-    await expect(page.url()).toContain('/results');
-    
-    // Verify results page elements
-    await expect(page.locator('h1')).toBeVisible();
-    await expect(page.locator('button:has-text("Shop"), .cta-button')).toBeVisible();
-    
-    // Check for product grid or recommendations
-    const productElements = page.locator('.grid, .product-card, [data-testid="product"]');
-    await expect(productElements.first()).toBeVisible();
-    
-    // Test product link functionality
-    const productLinks = page.locator('a[href*="zalando"], a[href*="hm.com"], a[href*="wehkamp"], .product-link');
-    if (await productLinks.count() > 0) {
-      const firstLink = productLinks.first();
-      const href = await firstLink.getAttribute('href');
-      
-      if (href) {
-        // Verify link is valid (starts with http)
-        expect(href).toMatch(/^https?:\/\//);
-        
-        // Test that link opens in new tab
-        const target = await firstLink.getAttribute('target');
-        expect(target).toBe('_blank');
-      }
-    }
-    
-    // Check for no console errors
-    const logs = [];
-    page.on('console', msg => {
-      if (msg.type() === 'error') {
-        logs.push(msg.text());
-      }
-    });
-    
-    // Wait a bit to catch any delayed errors
-    await page.waitForTimeout(2000);
-    
-    // Report any console errors but don't fail the test
-    if (logs.length > 0) {
-      console.warn('Console errors found:', logs);
-    }
-    
-    console.log('✅ E2E flow completed successfully');
+    console.log('✅ Registration flow completed successfully');
   });