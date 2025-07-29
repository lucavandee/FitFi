const { test, expect } = require('@playwright/test');

test.describe('Mobile Navigation Level-100', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport (iPhone 14)
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('mobile menu displays all navigation items correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify hamburger button is visible on mobile
    const menuButton = page.locator('button[aria-label="Open menu"]');
    await expect(menuButton).toBeVisible();
    
    // Open mobile menu
    await menuButton.click();
    
    // Verify drawer opens with proper animation
    await page.waitForTimeout(300); // Wait for animation
    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).toBeVisible();
    
    // Verify menu title
    await expect(page.locator('text=Menu')).toBeVisible();
    
    // Verify all navigation items are visible
    const expectedItems = [
      'Home',
      'Waarom FitFi', 
      'Hoe het werkt',
      'Prijzen',
      'Aanbevelingen',
      'Outfits',
      'Blog',
      'Inloggen'
    ];
    
    for (const item of expectedItems) {
      await expect(page.locator(`text=${item}`)).toBeVisible();
    }
    
    console.log('✅ All navigation items visible in mobile drawer');
  });

  test('navigation links work correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Click Prijzen link
    await page.click('text=Prijzen');
    
    // Verify navigation occurred
    await expect(page).toHaveURL(/\/prijzen$/);
    
    // Verify drawer is closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // Verify page scrolled to top
    const scrollPosition = await page.evaluate(() => window.pageYOffset);
    expect(scrollPosition).toBe(0);
    
    console.log('✅ Navigation and scroll-to-top working correctly');
  });

  test('drawer closes with ESC key', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Press ESC
    await page.keyboard.press('Escape');
    
    // Verify drawer closes
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    console.log('✅ ESC key closes drawer correctly');
  });

  test('backdrop click closes drawer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Click backdrop
    await page.click('.bg-navy\\/80');
    
    // Verify drawer closes
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    console.log('✅ Backdrop click closes drawer correctly');
  });

  test('touch targets meet accessibility requirements', async ({ page }) => {
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

  test('dark mode styling works correctly', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Verify dark mode classes are applied
    const drawer = page.locator('[role="dialog"] > div');
    await expect(drawer).toHaveClass(/dark:bg-navy/);
    
    // Verify text is visible in dark mode
    await expect(page.locator('text=Menu')).toBeVisible();
    await expect(page.locator('text=Home')).toBeVisible();
    
    console.log('✅ Dark mode styling working correctly');
  });

  test('focus management and accessibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);
    
    // Verify ARIA attributes
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby', 'mobile-menu-title');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    console.log('✅ Focus management and ARIA attributes working correctly');
  });

  test('responsive behavior - desktop hides hamburger', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify hamburger button is hidden on desktop
    const menuButton = page.locator('button[aria-label="Open menu"]');
    await expect(menuButton).not.toBeVisible();
    
    // Verify desktop navigation is visible
    await expect(page.locator('text=Prijzen')).toBeVisible();
    
    console.log('✅ Responsive behavior working - desktop shows nav, hides hamburger');
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