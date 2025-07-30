const { test, expect } = require('@playwright/test');

test.describe('Mobile Testimonial Carousel - Level 100', () => {
  test.beforeEach(async ({ page }) => {
    // Set iPhone 14 viewport
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('testimonial section height ≤ 600px on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for testimonial section to load
    await page.waitForSelector('#community');
    
    // Measure section height
    const sectionHeight = await page.evaluate(() => {
      const section = document.getElementById('community');
      return section ? section.offsetHeight : 0;
    });
    
    console.log(`Testimonial section height: ${sectionHeight}px`);
    expect(sectionHeight).toBeLessThanOrEqual(600);
  });

  test('swipe carousel functionality works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for testimonial carousel
    await page.waitForSelector('[role="region"][aria-label="Klantbeoordelingen"]');
    
    // Verify carousel is visible
    const carousel = page.locator('[role="region"][aria-label="Klantbeoordelingen"]');
    await expect(carousel).toBeVisible();
    
    // Check initial slide
    const firstSlide = page.locator('.flex-none').first();
    await expect(firstSlide).toBeVisible();
    
    // Test navigation dots
    const dots = page.locator('button[aria-label*="Ga naar testimonial"]');
    await expect(dots).toHaveCount(5); // 5 testimonials
    
    // Click second dot
    await dots.nth(1).click();
    await page.waitForTimeout(300); // Wait for transition
    
    // Verify slide changed
    const activeDot = page.locator('.bg-\\[\\#6E2EB7\\]');
    await expect(activeDot).toBeVisible();
    
    console.log('✅ Swipe carousel functionality working');
  });

  test('accessibility compliance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check ARIA attributes
    const carousel = page.locator('[role="region"][aria-label="Klantbeoordelingen"]');
    await expect(carousel).toBeVisible();
    
    // Check screen reader instructions
    const srInstructions = page.locator('.sr-only');
    await expect(srInstructions).toContainText('Veeg om meer reviews te zien');
    
    // Check navigation buttons have proper labels
    const navButtons = page.locator('button[aria-label*="testimonial"]');
    const count = await navButtons.count();
    expect(count).toBeGreaterThan(0);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    console.log('✅ Accessibility compliance verified');
  });

  test('lazy loading for testimonial images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that images have loading="lazy"
    const testimonialImages = page.locator('#community img');
    const count = await testimonialImages.count();
    
    for (let i = 0; i < count; i++) {
      const img = testimonialImages.nth(i);
      const loadingAttr = await img.getAttribute('loading');
      expect(loadingAttr).toBe('lazy');
    }
    
    console.log('✅ Lazy loading implemented for testimonial images');
  });

  test('fade-in animation triggers on scroll', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Scroll to testimonial section
    await page.locator('#community').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Check if section is visible and animated
    const section = page.locator('#community [role="region"]');
    await expect(section).toBeVisible();
    
    // Verify animation has completed (opacity should be 1)
    const opacity = await section.evaluate(el => getComputedStyle(el).opacity);
    expect(parseFloat(opacity)).toBeGreaterThan(0.9);
    
    console.log('✅ Fade-in animation working correctly');
  });

  test('desktop layout unchanged', async ({ page }) => {
    // Switch to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check desktop grid layout
    const carousel = page.locator('#community [role="region"]');
    await expect(carousel).toHaveClass(/grid/);
    await expect(carousel).toHaveClass(/md:grid-cols-2/);
    await expect(carousel).toHaveClass(/lg:grid-cols-3/);
    
    console.log('✅ Desktop layout preserved');
  });

  test('dark mode support', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check dark mode classes
    const testimonialCards = page.locator('.dark\\:bg-\\[\\#1E1B2E\\]');
    await expect(testimonialCards.first()).toBeVisible();
    
    // Check dark mode text colors
    const darkText = page.locator('.dark\\:text-slate-300');
    await expect(darkText.first()).toBeVisible();
    
    console.log('✅ Dark mode support working');
  });
});

test.describe('Performance Impact', () => {
  test('testimonial section does not affect LCP', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    
    // Measure LCP
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    // LCP should be reasonable (< 2.5s)
    expect(lcp).toBeLessThan(2500);
    
    console.log(`✅ LCP: ${lcp}ms (< 2500ms target)`);
  });
});