import { test, expect } from '@playwright/test';

test.describe('CTA contrast', () => {
  ['/', '/hoe-het-werkt', '/prijzen', '/blog'].forEach((path) => {
    test(`CTA zichtbaar op ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      const cta = page.getByRole('button', { name: /gratis|ontvang|probeer|start/i });
      await expect(cta).toBeVisible();
      
      // Screenshot diff om regressie op kleur/contrast te detecteren
      expect(await cta.screenshot()).toMatchSnapshot(`cta-${path.replace('/', 'home')}.png`);
    });
  });

  test('CTA hover states', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const cta = page.getByRole('button', { name: /gratis|ontvang/i });
    await expect(cta).toBeVisible();
    
    // Test hover state
    await cta.hover();
    await page.waitForTimeout(300); // Wait for transition
    
    expect(await cta.screenshot()).toMatchSnapshot('cta-hover-state.png');
  });

  test('CTA accessibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const cta = page.getByRole('button', { name: /gratis|ontvang/i });
    
    // Check aria-label exists
    const ariaLabel = await cta.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    
    // Check focus state
    await cta.focus();
    await expect(cta).toBeFocused();
    
    // Check keyboard navigation
    await page.keyboard.press('Enter');
    // Should navigate or trigger action
  });
});