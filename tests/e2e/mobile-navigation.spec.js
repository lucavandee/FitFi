const { test, expect } = require('@playwright/test');

test.describe('Mobile Navigation - Complete Link Visibility', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('all navigation links visible and functional', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Debug: Check navigation items count
    const navCount = await page.evaluate(() => {
      return window.NAV_LINKS ? window.NAV_LINKS.length : 0;
    });
    console.log('Navigation items count:', navCount);

    // Open mobile menu
    await page.click('button[aria-label="Open menu"]');
    
    // Wait for menu to be visible
    await expect(page.locator('#mobile-menu')).toBeVisible();
    
    // Verify all required navigation links are visible
    const requiredLinks = ['Home', 'Waarom FitFi', 'Hoe het werkt', 'Prijzen', 'Outfits', 'Blog'];
    
    for (const linkText of requiredLinks) {
      const link = page.getByRole('link', { name: linkText });
      await expect(link).toBeVisible();
      console.log(`✅ Link visible: ${linkText}`);
    }
    
    // Take screenshot for visual regression
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-drawer-open.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 375, height: 667 }
    });
    
    console.log('✅ All navigation links are visible in mobile drawer');
  });

  test('navigation links work correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open menu
    await page.click('button[aria-label="Open menu"]');
    
    // Test Prijzen navigation
    await page.click('text=Prijzen');
    
    // Verify navigation and menu closure
    await expect(page).toHaveURL(/\/prijzen$/);
    await expect(page.locator('#mobile-menu')).not.toBeVisible();
    
    // Verify page content loaded
    await expect(page.locator('h1')).toContainText(/prijzen|kies/i);
    
    console.log('✅ Navigation to Prijzen works correctly');
  });

  test('menu structure and styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open menu
    await page.click('button[aria-label="Open menu"]');
    
    // Verify menu structure
    await expect(page.locator('#mobile-menu')).toHaveClass(/bg-white/);
    await expect(page.locator('#mobile-menu')).toHaveClass(/z-50/);
    
    // Verify navigation list
    const navList = page.locator('#mobile-menu nav ul');
    await expect(navList).toBeVisible();
    
    // Verify minimum touch targets
    const links = page.locator('#mobile-menu nav ul li a');
    const linkCount = await links.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      await expect(link).toHaveClass(/min-h-\[44px\]/);
    }
    
    console.log('✅ Menu structure and styling correct');
  });

  test('accessibility compliance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const menuButton = page.locator('button[aria-label="Open menu"]');
    
    // Check initial state
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
    
    // Open menu
    await menuButton.click();
    
    // Check open state
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    
    // Check menu attributes
    const menu = page.locator('#mobile-menu');
    await expect(menu).toHaveAttribute('role', 'dialog');
    await expect(menu).toHaveAttribute('aria-modal', 'true');
    await expect(menu).toHaveAttribute('aria-labelledby', 'mobile-menu-title');
    
    // Test escape key
    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
    
    console.log('✅ Accessibility compliance verified');
  });

  test('console debug verification', async ({ page }) => {
    // Capture console logs
    const logs = [];
    page.on('console', msg => {
      if (msg.text().includes('[Mobile Nav Debug]')) {
        logs.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for debug logs
    await page.waitForTimeout(1000);
    
    // Verify navigation count is logged
    const countLog = logs.find(log => log.includes('NAV_LINKS count:'));
    expect(countLog).toBeTruthy();
    
    // Extract count from log
    const countMatch = countLog?.match(/count: (\d+)/);
    const navCount = countMatch ? parseInt(countMatch[1]) : 0;
    
    // Verify we have at least 6 navigation items
    expect(navCount).toBeGreaterThanOrEqual(6);
    
    console.log(`✅ Navigation count verified: ${navCount} items`);
  });

  test('dark mode support', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open menu
    await page.click('button[aria-label="Open menu"]');
    
    // Verify dark mode styling
    const menu = page.locator('#mobile-menu');
    await expect(menu).toHaveClass(/dark:bg-gray-900/);
    
    // Verify dark mode text colors
    const links = page.locator('#mobile-menu nav ul li a');
    const firstLink = links.first();
    await expect(firstLink).toHaveClass(/dark:text-white/);
    
    console.log('✅ Dark mode support verified');
  });
});

test.describe('Mobile Navigation Visual Regression', () => {
  test('mobile drawer screenshot baseline', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300); // Wait for animation

    // Take full screenshot for baseline
    await expect(page).toHaveScreenshot('mobile-drawer-baseline.png');
    
    console.log('✅ Visual regression baseline captured');
  });
});