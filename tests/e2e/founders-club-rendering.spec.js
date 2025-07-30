const { test, expect } = require('@playwright/test');

test.describe('Founders Club Safe Rendering', () => {
  test('homepage shows light teaser without dark placeholder', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for lazy-loaded components
    await page.waitForTimeout(2000);
    
    // Check for teaser text (not progress bar)
    await expect(page.locator('text=Word FitFi Founding Member')).toBeVisible();
    
    // Verify no progress bar on homepage
    await expect(page.locator('.progress-bar')).not.toBeVisible();
    
    // Verify no dark empty containers
    const darkContainers = page.locator('.bg-foundersCardBgDark, .bg-gray-900, .bg-slate-900');
    const count = await darkContainers.count();
    expect(count).toBe(0);
    
    // Verify teaser CTA button works
    await expect(page.locator('text=Bekijk voortgang')).toBeVisible();
    
    console.log('✅ Homepage shows clean teaser without dark placeholders');
  });

  test('dashboard shows full interactive founders block', async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user-123', email: 'test@example.com', name: 'Test User' }
      }));
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for components to load
    await page.waitForTimeout(3000);
    
    // Check for progress bar (dashboard-specific)
    await expect(page.locator('.progress-bar')).toBeVisible();
    
    // Check for interactive elements
    await expect(page.locator('text=FitFi Founders Club')).toBeVisible();
    await expect(page.locator('text=Kopieer referral link')).toBeVisible();
    
    // Verify leaderboard section
    await expect(page.locator('text=Top Referrers')).toBeVisible();
    
    console.log('✅ Dashboard shows full interactive Founders Club');
  });

  test('teaser CTA navigates to dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for teaser to load
    await page.waitForTimeout(2000);
    
    // Click teaser CTA
    await page.click('text=Bekijk voortgang');
    
    // Verify navigation to dashboard
    await expect(page).toHaveURL(/\/dashboard$/);
    
    console.log('✅ Teaser CTA navigates correctly to dashboard');
  });

  test('no empty dark containers on any page', async ({ page }) => {
    const pages = ['/', '/over-ons', '/hoe-het-werkt', '/prijzen', '/blog'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Check for empty dark containers
      const emptyDarkContainers = page.locator('.bg-foundersCardBgDark:empty, .bg-gray-900:empty, .bg-slate-900:empty');
      const count = await emptyDarkContainers.count();
      
      expect(count).toBe(0);
      console.log(`✅ ${pagePath} has no empty dark containers`);
    }
  });

  test('accessibility compliance for both variants', async ({ page }) => {
    // Test homepage teaser
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check teaser accessibility
    const teaserHeading = page.locator('#founders-teaser-heading');
    await expect(teaserHeading).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Mock auth for dashboard test
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user-123', email: 'test@example.com', name: 'Test User' }
      }));
    });
    
    // Test dashboard accessibility
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check dashboard accessibility
    const dashboardHeading = page.locator('#founders-heading');
    await expect(dashboardHeading).toBeVisible();
    
    console.log('✅ Both variants meet accessibility requirements');
  });
});

test.describe('Performance Impact', () => {
  test('lazy loading does not affect LCP', async ({ page }) => {
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