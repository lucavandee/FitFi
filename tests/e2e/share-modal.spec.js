const { test, expect } = require('@playwright/test');

test.describe('ShareModal Close Functionality & A11y', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user-123', email: 'test@example.com', name: 'Test User' }
      }));
    });
  });

  test('modal opens and closes with X button', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for Founders Block to load
    await page.waitForSelector('text=Deel op social media', { timeout: 10000 });
    
    // Open share modal
    await page.click('text=Deel op social media');
    
    // Verify modal is open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('#share-modal-title')).toContainText('Deel je Founders Club link');
    
    // Close with X button
    await page.click('button[aria-label="Sluit share modal"]');
    
    // Verify modal is closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    console.log('✅ X button closes modal correctly');
  });

  test('modal closes with ESC key', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Open share modal
    await page.click('text=Deel op social media');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Press ESC key
    await page.keyboard.press('Escape');
    
    // Verify modal is closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    console.log('✅ ESC key closes modal correctly');
  });

  test('modal closes with backdrop click', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Open share modal
    await page.click('text=Deel op social media');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Click backdrop (outside modal panel)
    await page.click('.fixed.inset-0.bg-black\\/50', { position: { x: 50, y: 50 } });
    
    // Verify modal is closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    console.log('✅ Backdrop click closes modal correctly');
  });

  test('share functionality works correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Open share modal
    await page.click('text=Deel op social media');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Test copy link functionality
    await page.click('text=Kopieer Link');
    
    // Verify success toast appears
    await expect(page.locator('text=Referral link gekopieerd!')).toBeVisible();
    
    // Verify modal closes after action
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    console.log('✅ Share functionality working correctly');
  });

  test('accessibility compliance', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Open share modal
    await page.click('text=Deel op social media');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Check ARIA attributes
    await expect(page.locator('[role="dialog"]')).toHaveAttribute('aria-labelledby', 'share-modal-title');
    await expect(page.locator('[role="dialog"]')).toHaveAttribute('aria-describedby', 'share-modal-description');
    
    // Check dialog title and description
    await expect(page.locator('#share-modal-title')).toBeVisible();
    await expect(page.locator('#share-modal-description')).toBeVisible();
    
    // Check close button accessibility
    const closeButton = page.locator('button[aria-label="Sluit share modal"]');
    await expect(closeButton).toBeVisible();
    await expect(closeButton).toHaveAttribute('aria-label', 'Sluit share modal');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    console.log('✅ Accessibility compliance verified');
  });

  test('mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Open share modal
    await page.click('text=Deel op social media');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Verify modal is properly sized on mobile
    const modal = page.locator('[role="dialog"] > div > div > div');
    const boundingBox = await modal.boundingBox();
    
    if (boundingBox) {
      expect(boundingBox.width).toBeLessThan(375); // Should fit within viewport
      expect(boundingBox.width).toBeGreaterThan(280); // Should be reasonably sized
    }
    
    // Test touch interaction for closing
    await page.click('button[aria-label="Sluit share modal"]');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    console.log('✅ Mobile responsiveness working correctly');
  });

  test('dark mode support', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Open share modal
    await page.click('text=Deel op social media');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Verify dark mode classes are applied
    const modalPanel = page.locator('[role="dialog"] .bg-foundersCardBg');
    await expect(modalPanel).toHaveClass(/dark:bg-foundersCardBgDark/);
    
    // Verify text is visible in dark mode
    await expect(page.locator('#share-modal-title')).toBeVisible();
    
    console.log('✅ Dark mode support working correctly');
  });
});

test.describe('ShareModal Performance', () => {
  test('modal opens and closes smoothly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Measure modal open time
    const startTime = Date.now();
    await page.click('text=Deel op social media');
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    const openTime = Date.now() - startTime;
    
    // Should open quickly (< 500ms)
    expect(openTime).toBeLessThan(500);
    
    // Measure modal close time
    const closeStartTime = Date.now();
    await page.keyboard.press('Escape');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
    const closeTime = Date.now() - closeStartTime;
    
    // Should close quickly (< 300ms)
    expect(closeTime).toBeLessThan(300);
    
    console.log(`✅ Modal performance: Open ${openTime}ms, Close ${closeTime}ms`);
  });
});