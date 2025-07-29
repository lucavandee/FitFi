const { test, expect } = require('@playwright/test');

test.describe('Mobile Navigation - Level 100', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('mobile menu opens and closes correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify menu button is visible
    const menuButton = page.locator('button[aria-label="Open menu"]');
    await expect(menuButton).toBeVisible();

    // Open menu
    await menuButton.click();
    
    // Verify menu is open
    await expect(page.locator('#mobile-menu')).toBeVisible();
    await expect(page.locator('button[aria-label="Sluit menu"]')).toBeVisible();
    
    // Verify body scroll is locked
    const body = page.locator('body');
    await expect(body).toHaveCSS('overflow', 'hidden');

    // Close menu with close button
    await page.click('button[aria-label="Sluit menu"]');
    
    // Verify menu is closed
    await expect(page.locator('#mobile-menu')).not.toBeVisible();
    
    // Verify body scroll is restored
    await expect(body).not.toHaveCSS('overflow', 'hidden');
  });

  test('menu closes on backdrop click', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await expect(page.locator('#mobile-menu')).toBeVisible();

    // Click backdrop
    await page.click('.bg-black\\/20');
    
    // Verify menu is closed
    await expect(page.locator('#mobile-menu')).not.toBeVisible();
  });

  test('menu closes on escape key', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await expect(page.locator('#mobile-menu')).toBeVisible();

    // Press escape
    await page.keyboard.press('Escape');
    
    // Verify menu is closed
    await expect(page.locator('#mobile-menu')).not.toBeVisible();
  });

  test('navigation links work correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open menu
    await page.click('button[aria-label="Open menu"]');
    
    // Click Prijzen link
    await page.click('text=Prijzen');
    
    // Verify navigation and menu closure
    await expect(page).toHaveURL(/\/prijzen$/);
    await expect(page.locator('#mobile-menu')).not.toBeVisible();
    
    // Verify page content loaded
    await expect(page.locator('h1')).toContainText(/prijzen|kies/i);
  });

  test('waarom fitfi navigation works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open menu
    await page.click('button[aria-label="Open menu"]');
    
    // Click Waarom FitFi link
    await page.click('text=Waarom FitFi');
    
    // Verify navigation
    await expect(page).toHaveURL(/\/over-ons$/);
    await expect(page.locator('#mobile-menu')).not.toBeVisible();
    
    // Verify page content
    await expect(page.locator('h1')).toContainText(/waarom/i);
  });

  test('blog navigation works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open menu
    await page.click('button[aria-label="Open menu"]');
    
    // Click Blog link
    await page.click('text=Blog');
    
    // Verify navigation
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.locator('#mobile-menu')).not.toBeVisible();
    
    // Verify page content
    await expect(page.locator('h1')).toContainText(/blog/i);
  });

  test('authentication links work when not logged in', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open menu
    await page.click('button[aria-label="Open menu"]');
    
    // Click Inloggen
    await page.click('text=Inloggen');
    
    // Verify navigation
    await expect(page).toHaveURL(/\/inloggen$/);
    await expect(page.locator('#mobile-menu')).not.toBeVisible();
  });

  test('menu has proper accessibility attributes', async ({ page }) => {
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
  });

  test('smooth scrolling works for sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Add a test section to the page
    await page.addScriptTag({
      content: `
        const section = document.createElement('section');
        section.id = 'test-section';
        section.style.height = '100vh';
        section.style.marginTop = '100vh';
        section.innerHTML = '<h2>Test Section</h2>';
        document.body.appendChild(section);
      `
    });

    // Test smooth scroll utility
    await page.evaluate(() => {
      window.scrollTo({ top: 0 });
      const element = document.getElementById('test-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    // Wait for scroll to complete
    await page.waitForTimeout(1000);
    
    // Verify section is visible and properly positioned
    const section = page.locator('#test-section');
    await expect(section).toBeInViewport();
  });

  test('no horizontal scroll or layout shift', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check initial viewport
    const initialViewport = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight
    }));

    // Open menu
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300); // Wait for animation

    // Check viewport after menu open
    const menuOpenViewport = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight
    }));

    // Verify no horizontal scroll introduced
    expect(menuOpenViewport.width).toBeLessThanOrEqual(initialViewport.width + 5); // 5px tolerance

    // Close menu
    await page.click('button[aria-label="Sluit menu"]');
    await page.waitForTimeout(300);

    // Verify layout restored
    const finalViewport = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight
    }));

    expect(finalViewport.width).toBeLessThanOrEqual(initialViewport.width + 5);
  });
});

test.describe('Mobile Navigation Accessibility', () => {
  test('focus management works correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open menu
    await page.click('button[aria-label="Open menu"]');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Verify focus is trapped within menu
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test that focus stays within menu
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const currentFocus = page.locator(':focus');
      const isInMenu = await currentFocus.evaluate(el => {
        const menu = document.getElementById('mobile-menu');
        return menu?.contains(el) || false;
      });
      expect(isInMenu).toBe(true);
    }
  });
});