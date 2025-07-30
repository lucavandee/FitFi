const { test, expect } = require('@playwright/test');

test.describe('FitFi Authentication Flow', () => {
  test('successful login flow', async ({ page }) => {
    // Generate random email for testing
    const testEmail = 'demo@fitfi.ai';
    const testPassword = 'TestPassword123!';
    
    // Navigate to login page
    await page.goto('/inloggen');
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard (max 5 seconds)
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    
    // Verify we're on dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    console.log('✅ Login flow completed successfully');
  });
  
  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/inloggen');
    await page.waitForLoadState('networkidle');
    
    // Try to login with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await page.waitForTimeout(3000);
    
    // Should show error message
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('text=E-mail of wachtwoord onjuist')).toBeVisible();
    
    console.log('✅ Invalid credentials error handling works');
  });
  
  test('login timeout shows fallback', async ({ page }) => {
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
    
    console.log('✅ Login timeout handling works');
  });

  test('complete registration and login flow', async ({ page }) => {
    // Generate random email for testing
    const randomEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    const testName = 'Test User';

    // Navigate to registration page
    await page.goto('/registreren');
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

    console.log('✅ Registration flow completed successfully');
  });
});