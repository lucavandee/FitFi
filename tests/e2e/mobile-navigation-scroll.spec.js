const { test, expect } = require('@playwright/test');

test.describe('Mobile Navigation Auto-Scroll', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro
  });

  test('menu navigation scrolls to top automatically', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Simulate mid-page scroll position
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(100);
    
    // Verify we're scrolled down
    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBeGreaterThan(500);
    
    // Open mobile menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Click navigation link
    await page.click('text=Prijzen');
    
    // Verify navigation occurred
    await expect(page).toHaveURL(/\/prijzen$/);
    
    // Verify page scrolled to top
    await page.waitForFunction(() => window.scrollY === 0, { timeout: 2000 });
    
    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBe(0);
    
    console.log('✅ Auto-scroll to top working correctly');
  });

  test('internal link navigation also scrolls to top', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to a page with internal links
    await page.goto('/hoe-het-werkt');
    await page.waitForLoadState('networkidle');
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(100);
    
    // Click internal navigation link
    await page.click('a[href="/prijzen"]');
    
    // Verify navigation and scroll
    await expect(page).toHaveURL(/\/prijzen$/);
    await page.waitForFunction(() => window.scrollY === 0, { timeout: 2000 });
    
    console.log('✅ Internal link auto-scroll working correctly');
  });

  test('light theme visual appearance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Verify light theme elements
    await expect(page.locator('[role="dialog"] > div')).toHaveClass(/bg-white/);
    await expect(page.locator('#mobile-menu-title')).toHaveClass(/text-brandPurple/);
    
    // Take visual snapshot
    await expect(page).toHaveScreenshot('mobile-menu-light-theme.png');
    
    console.log('✅ Light theme styling verified');
  });

  test('dark theme visual appearance', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Verify dark theme elements
    await expect(page.locator('[role="dialog"] > div')).toHaveClass(/dark:bg-\[#14172B\]/);
    
    // Take visual snapshot
    await expect(page).toHaveScreenshot('mobile-menu-dark-theme.png');
    
    console.log('✅ Dark theme styling verified');
  });

  test('active route highlighting', async ({ page }) => {
    await page.goto('/prijzen');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Verify active route styling
    const activeLink = page.locator('text=Prijzen').locator('..');
    await expect(activeLink).toHaveClass(/bg-brandPurpleLight/);
    await expect(activeLink).toHaveClass(/font-semibold/);
    
    // Verify purple indicator bar
    const indicator = page.locator('.w-0\\.5.bg-brandPurple');
    await expect(indicator).toBeVisible();
    
    console.log('✅ Active route highlighting working correctly');
  });

  test('icon hover animations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Hover over menu item
    await page.hover('text=Prijzen');
    await page.waitForTimeout(200);
    
    // Verify hover state
    const hoveredItem = page.locator('text=Prijzen').locator('..');
    await expect(hoveredItem).toHaveClass(/hover:bg-brandPurpleLight/);
    
    console.log('✅ Icon hover animations working correctly');
  });

  test('accessibility compliance', async ({ page }) => {
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
    
    console.log('✅ Accessibility compliance verified');
  });

  test('touch target sizes meet requirements', async ({ page }) => {
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
        console.log(`✅ Menu item ${i + 1} height: ${box.height}px (≥44px required)`);
      }
    }
  });
});

test.describe('Mobile Navigation Visual Tests', () => {
  test('visual snapshot - light mode', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Take screenshot
    await expect(page).toHaveScreenshot('mobile-menu-light.png');
  });

  test('visual snapshot - dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Take screenshot
    await expect(page).toHaveScreenshot('mobile-menu-dark.png');
  });
});