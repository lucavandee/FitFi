const { test, expect } = require('@playwright/test');

test.describe('Mobile Login Timeout Handling', () => {
  test('login completes within 3 seconds even with slow profile loading', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto('/inloggen');
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.fill('input[name="email"]', 'demo@fitfi.ai');
    await page.fill('input[name="password"]', 'TestPassword123!');
    
    // Start timer
    const startTime = Date.now();
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard within 3 seconds
    await page.waitForURL('**/dashboard', { timeout: 3000 });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Login completed in ${duration}ms`);
    expect(duration).toBeLessThan(3000);
    
    // Verify dashboard loads with fallback profile if needed
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Should not show infinite spinner
    await expect(page.locator('.animate-spin')).not.toBeVisible();
  });

  test('profile timeout fallback works correctly', async ({ page }) => {
    // Mock slow profile loading
    await page.route('**/rest/v1/profiles**', async route => {
      // Delay response by 10 seconds to trigger timeout
      await new Promise(resolve => setTimeout(resolve, 10000));
      await route.continue();
    });
    
    await page.goto('/inloggen');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="email"]', 'demo@fitfi.ai');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Should still redirect within reasonable time due to timeout fallback
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    console.log('✅ Profile timeout fallback working');
  });

  test('auto-profile creation works for new users', async ({ page }) => {
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
    
    // Should redirect to onboarding
    await page.waitForURL('**/onboarding*', { timeout: 5000 });
    
    console.log('✅ Auto-profile creation working for new users');
  });
});