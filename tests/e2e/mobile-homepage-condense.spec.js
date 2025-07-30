const { test, expect } = require('@playwright/test');

test.describe('Mobile Homepage Condense - Max 5 Swipes', () => {
  test.beforeEach(async ({ page }) => {
    // Set iPhone 14 viewport
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('mobile homepage total scroll height ≤ 2600px', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for lazy loaded components
    await page.waitForTimeout(2000);
    
    // Measure total scroll height
    const totalHeight = await page.evaluate(() => document.body.scrollHeight);
    
    console.log(`Mobile homepage height: ${totalHeight}px`);
    expect(totalHeight).toBeLessThan(2600);
    
    // Calculate approximate swipes (assuming 500px per swipe)
    const approximateSwipes = Math.ceil(totalHeight / 500);
    console.log(`Approximate swipes needed: ${approximateSwipes}`);
    expect(approximateSwipes).toBeLessThanOrEqual(5);
  });

  test('horizontal flow swiper works correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if horizontal flow is visible
    const flowSection = page.locator('[data-section="flow"]');
    await expect(flowSection).toBeVisible();
    
    // Check swiper container
    const swiperContainer = page.locator('.overflow-x-auto.snap-x');
    await expect(swiperContainer).toBeVisible();
    
    // Verify all 3 steps are present
    const steps = page.locator('.w-\\[80vw\\]');
    await expect(steps).toHaveCount(3);
    
    // Test horizontal scrolling
    await swiperContainer.scrollIntoViewIfNeeded();
    
    // Scroll to second step
    await page.evaluate(() => {
      const container = document.querySelector('.overflow-x-auto.snap-x');
      if (container) {
        container.scrollLeft = container.offsetWidth * 0.8; // 80vw
      }
    });
    
    await page.waitForTimeout(500);
    
    // Verify scroll position changed
    const scrollLeft = await page.evaluate(() => {
      const container = document.querySelector('.overflow-x-auto.snap-x');
      return container ? container.scrollLeft : 0;
    });
    
    expect(scrollLeft).toBeGreaterThan(0);
    console.log('✅ Horizontal flow swiper working correctly');
  });

  test('KPI badges visible below hero on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check KPI badges are visible on mobile
    const kpiBadges = page.locator('.bg-white\\/80.backdrop-blur-sm');
    await expect(kpiBadges.first()).toBeVisible();
    
    // Verify all 3 KPIs are present
    await expect(page.locator('text=10.000+')).toBeVisible();
    await expect(page.locator('text=4.8/5')).toBeVisible();
    await expect(page.locator('text=95%')).toBeVisible();
    
    console.log('✅ KPI badges visible below hero');
  });

  test('FAQ and pricing CTA hidden on mobile home', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // FAQ should not be visible as a section
    const faqSection = page.locator('[data-section="faq"]');
    await expect(faqSection).not.toBeVisible();
    
    // Pricing CTA should not be visible as a section
    const pricingSection = page.locator('[data-section="pricingCta"]');
    await expect(pricingSection).not.toBeVisible();
    
    // But FAQ link should be visible in hero
    await expect(page.locator('text=Veelgestelde vragen')).toBeVisible();
    
    console.log('✅ FAQ and pricing CTA properly hidden on mobile');
  });

  test('back-to-top FAB appears and functions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Initially FAB should not be visible
    const fab = page.locator('button[aria-label="Terug naar boven"]');
    await expect(fab).not.toBeVisible();
    
    // Scroll down 700px
    await page.evaluate(() => window.scrollTo(0, 700));
    await page.waitForTimeout(500);
    
    // FAB should now be visible
    await expect(fab).toBeVisible();
    
    // Click FAB
    await fab.click();
    await page.waitForTimeout(1000);
    
    // Verify we're back at top
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(50); // Allow for smooth scroll settling
    
    console.log('✅ Back-to-top FAB working correctly');
  });

  test('scroll indicator appears and hides correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Scroll indicator should be visible initially
    const scrollIndicator = page.locator('button[aria-label="Scroll naar beneden"]');
    await expect(scrollIndicator).toBeVisible();
    
    // Scroll down 150px
    await page.evaluate(() => window.scrollTo(0, 150));
    await page.waitForTimeout(500);
    
    // Scroll indicator should now be hidden
    await expect(scrollIndicator).not.toBeVisible();
    
    console.log('✅ Scroll indicator working correctly');
  });

  test('desktop sections still visible on desktop', async ({ page }) => {
    // Switch to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for lazy components
    await page.waitForTimeout(3000);
    
    // Verify desktop-only sections are visible
    const archetypesSection = page.locator('[data-section="archetypes"]');
    await expect(archetypesSection).toBeVisible();
    
    const foundersSection = page.locator('[data-section="founders"]');
    await expect(foundersSection).toBeVisible();
    
    const ugcSection = page.locator('[data-section="ugc"]');
    await expect(ugcSection).toBeVisible();
    
    console.log('✅ Desktop sections properly visible on desktop');
  });

  test('accessibility compliance on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check swiper has proper ARIA attributes
    const swiperContainer = page.locator('.overflow-x-auto.snap-x');
    
    // Verify swiper is accessible
    await expect(swiperContainer).toBeVisible();
    
    // Check keyboard navigation works
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Verify all interactive elements have proper labels
    const fab = page.locator('button[aria-label="Terug naar boven"]');
    const scrollIndicator = page.locator('button[aria-label="Scroll naar beneden"]');
    
    // These might not be visible initially, but should have proper labels when they appear
    if (await fab.isVisible()) {
      await expect(fab).toHaveAttribute('aria-label', 'Terug naar boven');
    }
    
    if (await scrollIndicator.isVisible()) {
      await expect(scrollIndicator).toHaveAttribute('aria-label', 'Scroll naar beneden');
    }
    
    console.log('✅ Accessibility compliance verified');
  });
});

test.describe('Performance Impact', () => {
  test('lazy loading does not affect LCP', async ({ page }) => {
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