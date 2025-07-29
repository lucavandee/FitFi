const { test, expect } = require('@playwright/test');

test.describe('Mobile Navigation - Static Nav Links', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport (iPhone 12)
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('all navigation links visible and functional', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Debug: Check navigation items count in console
    const logs = [];
    page.on('console', msg => {
      if (msg.text().includes('[NAV DEBUG]') || msg.text().includes('[MOBILE NAV]')) {
        logs.push(msg.text());
      }
    });
    
    // Open mobile menu
    await page.click('button[aria-label="Open menu"]');
    
    // Wait for drawer to be visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Verify all required navigation links are visible
    const requiredLinks = ['Home', 'Waarom FitFi', 'Hoe het werkt', 'Prijzen', 'Outfits', 'Blog', 'Inloggen'];
    
    console.log('Testing visibility of navigation links...');
    for (const linkText of requiredLinks) {
      const link = page.getByRole('link', { name: linkText });
      await expect(link).toBeVisible();
      console.log(`✅ Link visible: ${linkText}`);
    }
    
    // Take screenshot for visual regression
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-drawer-static-nav.png', 
      fullPage: false
    });
    
    // Verify debug logs show correct count
    await page.waitForTimeout(500);
    const navDebugLog = logs.find(log => log.includes('Static nav items loaded:'));
    if (navDebugLog) {
      console.log('Debug log found:', navDebugLog);
      expect(navDebugLog).toContain('7'); // Should have 7 nav items
    }
    
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
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // Verify page content loaded
    await expect(page.locator('h1')).toContainText(/prijzen|kies/i);
    
    console.log('✅ Navigation to Prijzen works correctly and closes drawer');
  });

  test('drawer structure and accessibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const menuButton = page.locator('button[aria-label="Open menu"]');
    
    // Check initial state
    await expect(menuButton).toBeVisible();
    
    // Open menu
    await menuButton.click();
    
    // Check drawer attributes
    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute('aria-modal', 'true');
    await expect(drawer).toHaveAttribute('aria-labelledby', 'mobile-menu-title');
    
    // Verify menu title
    await expect(page.locator('#mobile-menu-title')).toHaveText('Menu');
    
    // Verify minimum touch targets
    const links = page.locator('[role="dialog"] nav ul li a');
    const linkCount = await links.count();
    
    expect(linkCount).toBeGreaterThanOrEqual(7);
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      await expect(link).toHaveClass(/min-h-\[44px\]/);
    }
    
    // Test close button
    await page.click('button[aria-label="Sluit menu"]');
    await expect(drawer).not.toBeVisible();
    
    console.log('✅ Drawer structure and accessibility verified');
  });

  test('body overflow management', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check initial body overflow
    const initialOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(initialOverflow).toBe('');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    
    // Check body overflow when menu is open
    const openOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(openOverflow).toBe('hidden');
    
    // Close menu
    await page.click('button[aria-label="Sluit menu"]');
    
    // Check body overflow when menu is closed
    const closedOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(closedOverflow).toBe('');
    
    console.log('✅ Body overflow management works correctly');
  });

  test('dark mode support', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open menu
    await page.click('button[aria-label="Open menu"]');
    
    // Verify dark mode styling
    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).toHaveClass(/dark:bg-gray-900/);
    
    // Verify dark mode text colors
    const links = page.locator('[role="dialog"] nav ul li a');
    const firstLink = links.first();
    await expect(firstLink).toHaveClass(/dark:text-white/);
    
    // Take dark mode screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-drawer-dark-mode.png', 
      fullPage: false
    });
    
    console.log('✅ Dark mode support verified');
  });
});

test.describe('Mobile Navigation Production Safety', () => {
  test('static nav array prevents empty menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Capture console logs
    const logs = [];
    page.on('console', msg => {
      if (msg.text().includes('[NAV DEBUG]') || msg.text().includes('[MOBILE NAV]')) {
        logs.push(msg.text());
      }
    });
    
    // Open menu to trigger rendering
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(500);
    
    // Verify nav items count in logs
    const navCountLog = logs.find(log => log.includes('Static nav items loaded:'));
    expect(navCountLog).toBeTruthy();
    
    // Extract count from log
    const countMatch = navCountLog?.match(/loaded: (\d+)/);
    const navCount = countMatch ? parseInt(countMatch[1]) : 0;
    
    // Must have at least 7 navigation items
    expect(navCount).toBeGreaterThanOrEqual(7);
    
    // Verify actual links are rendered
    const visibleLinks = page.locator('[role="dialog"] nav ul li a');
    const actualCount = await visibleLinks.count();
    expect(actualCount).toBe(navCount);
    
    console.log(`✅ Production safety verified: ${navCount} nav items rendered`);
  });
});