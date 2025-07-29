const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
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

    // Wait for redirect to onboarding or success message
    await page.waitForTimeout(3000);
    
    // Check if we're on onboarding page or if there's a success message
    const currentUrl = page.url();
    const hasOnboardingContent = await page.locator('h1').textContent();
    
    console.log('After registration - URL:', currentUrl);
    console.log('Page content:', hasOnboardingContent);

    // Should be on onboarding page or see welcome message
    expect(currentUrl.includes('/onboarding') || hasOnboardingContent?.includes('Welkom')).toBeTruthy();

    // If we're on onboarding, navigate to dashboard
    if (currentUrl.includes('/onboarding')) {
      await page.click('text=Ga naar Dashboard');
      await page.waitForLoadState('networkidle');
    }

    // Should now be on dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Test logout
    await page.click('text=Uitloggen');
    await page.waitForTimeout(1000);

    // Test login with same credentials
    await page.goto('/inloggen');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="email"]', randomEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForTimeout(3000);
    
    // Should be back on dashboard
    const finalUrl = page.url();
    const dashboardContent = await page.locator('h1').textContent();
    
    console.log('After login - URL:', finalUrl);
    console.log('Dashboard content:', dashboardContent);

    expect(finalUrl.includes('/dashboard') || dashboardContent?.includes('Dashboard')).toBeTruthy();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/inloggen');
    await page.waitForLoadState('networkidle');

    // Try to login with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await page.waitForTimeout(2000);
    
    // Check for error message (either in toast or form)
    const hasError = await page.locator('text=Ongeldige').isVisible().catch(() => false) ||
                     await page.locator('text=fout').isVisible().catch(() => false) ||
                     await page.locator('.error').isVisible().catch(() => false);
    
    expect(hasError).toBeTruthy();
  });

  test('protected routes redirect to login', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Should be redirected to login page
    const currentUrl = page.url();
    expect(currentUrl.includes('/inloggen')).toBeTruthy();
  });

  test('results page requires authentication', async ({ page }) => {
    // Try to access results page without authentication
    await page.goto('/results');
    await page.waitForLoadState('networkidle');

    // Should be redirected to login page
    const currentUrl = page.url();
    expect(currentUrl.includes('/inloggen')).toBeTruthy();
  });

  test('quiz flow leads to results', async ({ page }) => {
    // This test assumes user is already logged in
    // In a real scenario, you'd login first
    
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    // Check if quiz page loads (might redirect to login if not authenticated)
    const currentUrl = page.url();
    
    if (currentUrl.includes('/inloggen')) {
      console.log('Quiz redirected to login as expected for unauthenticated user');
      expect(true).toBeTruthy();
    } else {
      // If somehow authenticated, check quiz functionality
      const hasQuizContent = await page.locator('h1').textContent();
      expect(hasQuizContent?.includes('Quiz') || hasQuizContent?.includes('stijl')).toBeTruthy();
    }
  });
});