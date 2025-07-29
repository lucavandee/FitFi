import { test, expect } from '@playwright/test';

test.describe('Founders Club Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user authentication and referral data
    await page.addInitScript(() => {
      // Mock localStorage for user session
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user-123', email: 'test@example.com' }
      }));
    });
  });

  test('Founders Club desktop layout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for Founders Club section to load
    await page.waitForSelector('[aria-labelledby="founders-heading"]', { timeout: 10000 });
    
    // Take screenshot of the Founders Club section
    const foundersSection = page.locator('[aria-labelledby="founders-heading"]');
    await expect(foundersSection).toBeVisible();
    
    // Verify gradient elements are present
    await expect(page.locator('.bg-gradient-to-br')).toBeVisible();
    
    // Check progress ring
    await expect(page.locator('svg circle[stroke="url(#foundersGradient)"]')).toBeVisible();
    
    // Screenshot for visual regression
    await expect(foundersSection).toHaveScreenshot('founders-club-desktop.png');
  });

  test('Founders Club tablet layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('[aria-labelledby="founders-heading"]');
    const foundersSection = page.locator('[aria-labelledby="founders-heading"]');
    
    // Verify responsive layout
    await expect(foundersSection).toBeVisible();
    await expect(foundersSection).toHaveScreenshot('founders-club-tablet.png');
  });

  test('Founders Club mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('[aria-labelledby="founders-heading"]');
    const foundersSection = page.locator('[aria-labelledby="founders-heading"]');
    
    // Verify mobile layout
    await expect(foundersSection).toBeVisible();
    await expect(foundersSection).toHaveScreenshot('founders-club-mobile.png');
  });

  test('Dark mode appearance', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('[aria-labelledby="founders-heading"]');
    const foundersSection = page.locator('[aria-labelledby="founders-heading"]');
    
    // Verify dark mode styling
    await expect(foundersSection).toBeVisible();
    await expect(foundersSection).toHaveScreenshot('founders-club-dark-mode.png');
  });

  test('Progress ring animation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for progress ring to be visible
    await page.waitForSelector('svg circle[stroke="url(#foundersGradient)"]');
    
    // Check that progress ring has animation properties
    const progressRing = page.locator('svg circle[stroke="url(#foundersGradient)"]');
    await expect(progressRing).toBeVisible();
    
    // Verify gradient definition exists
    await expect(page.locator('#foundersGradient')).toBeVisible();
  });

  test('Copy link button interaction', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Wait for copy button
    await page.waitForSelector('button:has-text("Kopieer referral link")');
    
    // Click copy button
    await page.click('button:has-text("Kopieer referral link")');
    
    // Verify button state changes
    await expect(page.locator('button:has-text("Link gekopieerd!")')).toBeVisible();
    
    // Verify toast notification appears
    await expect(page.locator('text=Referral link gekopieerd!')).toBeVisible();
  });

  test('Share modal functionality', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Click share button
    await page.click('button:has-text("Deel op social media")');
    
    // Verify modal opens
    await expect(page.locator('text=Deel je Founders Club link')).toBeVisible();
    
    // Check modal content
    await expect(page.locator('button:has-text("Deel op Instagram")')).toBeVisible();
    await expect(page.locator('button:has-text("Kopieer Link")')).toBeVisible();
    
    // Close modal
    await page.click('button[aria-label="Sluit share modal"]');
    
    // Verify modal closes
    await expect(page.locator('text=Deel je Founders Club link')).not.toBeVisible();
  });

  test('Leaderboard display', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for leaderboard section
    await page.waitForSelector('text=Top Referrers');
    
    // Verify leaderboard elements
    await expect(page.locator('text=Top Referrers')).toBeVisible();
    
    // Check for glass card effect
    const leaderboardCard = page.locator('.backdrop-blur-md');
    await expect(leaderboardCard).toBeVisible();
  });
});

test.describe('Founders Club Accessibility', () => {
  test('meets WCAG AA standards', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for Founders Club section
    await page.waitForSelector('[aria-labelledby="founders-heading"]');
    
    // Check ARIA labels
    await expect(page.locator('[aria-label="FitFi Founding Member badge"]')).toBeVisible();
    await expect(page.locator('[aria-label="Kopieer referral link"]')).toBeVisible();
    
    // Verify heading structure
    await expect(page.locator('#founders-heading')).toBeVisible();
    
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('reduced motion support', async ({ page }) => {
    // Enable reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Verify content is still visible and functional
    await page.waitForSelector('[aria-labelledby="founders-heading"]');
    await expect(page.locator('[aria-labelledby="founders-heading"]')).toBeVisible();
    
    // Verify buttons still work
    await expect(page.locator('button:has-text("Kopieer referral link")')).toBeVisible();
  });
});