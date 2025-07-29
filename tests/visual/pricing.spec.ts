import { test, expect } from '@playwright/test';

test.describe('Pricing Page Visual Tests', () => {
  test('pricing page layout and navigation', async ({ page }) => {
    // Set viewport to 1440x900 as specified
    await page.setViewportSize({ width: 1440, height: 900 });
    
    await page.goto('/prijzen');
    await page.waitForLoadState('networkidle');
    
    // Test sticky navigation after scroll
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    
    // Verify nav is still visible after scroll
    await expect(page.locator('nav')).toBeVisible();
    
    // Verify 3 price cards exist
    await expect(page.locator('.flex.flex-col.rounded-3xl')).toHaveCount(3);
    
    // Test responsive behavior
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify mobile scroll behavior
    const pricingScroll = page.locator('.pricing-scroll');
    await expect(pricingScroll).toBeVisible();
    
    // Test card scroll snap
    const firstCard = page.locator('.pricing-scroll > div').first();
    await expect(firstCard).toHaveClass(/min-w-\[88%\]/);
    await expect(firstCard).toHaveClass(/scroll-snap-align-center/);
  });

  test('pricing cards interaction', async ({ page }) => {
    await page.goto('/prijzen');
    await page.waitForLoadState('networkidle');
    
    // Test CTA buttons
    const primaryButtons = page.locator('button, a').filter({ hasText: /Start premium|Kies Pro/ });
    const outlineButton = page.locator('button, a').filter({ hasText: /Gratis starten/ });
    
    // Verify button styles
    await expect(primaryButtons.first()).toHaveClass(/bg-\[#89CFF0\]/);
    await expect(outlineButton.first()).toHaveClass(/border-\[#89CFF0\]/);
    
    // Test hover states
    await primaryButtons.first().hover();
    await expect(primaryButtons.first()).toHaveClass(/hover:bg-\[#89CFF0\]\/90/);
  });
});