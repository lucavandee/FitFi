import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('mobile menu closed state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of closed menu state
    await expect(page).toHaveScreenshot('mobile-nav-closed.png');
  });

  test('mobile menu open state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300); // Wait for animation
    
    // Take screenshot of open menu state
    await expect(page).toHaveScreenshot('mobile-nav-open.png');
  });

  test('mobile menu tablet view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Take screenshot of tablet menu
    await expect(page).toHaveScreenshot('mobile-nav-tablet.png');
  });

  test('menu animation states', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Capture opening animation
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(100); // Mid-animation
    await expect(page).toHaveScreenshot('mobile-nav-opening.png');
    
    await page.waitForTimeout(200); // Animation complete
    await expect(page).toHaveScreenshot('mobile-nav-fully-open.png');
  });
});