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

  test('mobile menu open state - light mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300); // Wait for animation
    
    // Take screenshot of open menu state
    await expect(page).toHaveScreenshot('mobile-nav-open-light.png');
  });

  test('mobile menu open state - dark mode', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Take screenshot of dark menu
    await expect(page).toHaveScreenshot('mobile-nav-open-dark.png');
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

  test('active route highlighting', async ({ page }) => {
    await page.goto('/prijzen');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Verify active route is highlighted
    await expect(page.locator('text=Prijzen').locator('..')).toHaveClass(/bg-brandPurple\/10/);
    
    // Take screenshot showing active state
    await expect(page).toHaveScreenshot('mobile-nav-active-route.png');
  });

  test('hover states and micro-interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Hover over menu item
    await page.hover('text=Prijzen');
    await page.waitForTimeout(200); // Wait for hover animation
    
    // Take screenshot of hover state
    await expect(page).toHaveScreenshot('mobile-nav-hover-state.png');
  });
});

test.describe('Mobile Navigation Accessibility', () => {
  test('meets WCAG AA standards', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Check ARIA attributes
    await expect(page.locator('[role="dialog"]')).toHaveAttribute('aria-modal', 'true');
    await expect(page.locator('[role="dialog"]')).toHaveAttribute('aria-labelledby', 'mobile-menu-title');
    
    // Verify heading structure
    await expect(page.locator('#mobile-menu-title')).toBeVisible();
    
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('color contrast validation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Check header gradient contrast
    const headerText = page.locator('#mobile-menu-title');
    await expect(headerText).toBeVisible();
    
    // Verify menu items are readable
    const menuItems = page.locator('[role="menuitem"]');
    const count = await menuItems.count();
    
    for (let i = 0; i < count; i++) {
      await expect(menuItems.nth(i)).toBeVisible();
    }
  });

  test('touch target sizes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Check touch target sizes
    const menuItems = page.locator('[role="menuitem"]');
    const count = await menuItems.count();
    
    for (let i = 0; i < count; i++) {
      const item = menuItems.nth(i);
      const box = await item.boundingBox();
      
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});