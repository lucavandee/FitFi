import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home page is WCAG-AA compliant', async ({ page }) => {
  await page.goto('/');
  
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  
  // Log violations for debugging
  if (results.violations.length > 0) {
    console.log('WCAG violations found:', results.violations.map(v => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.length
    })));
  }
  
  // Fail the test if there are WCAG-AA violations
  expect(results.violations, 'WCAG-AA violations found').toEqual([]);
});

test('landing page is WCAG-AA compliant', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  
  expect(results.violations, 'Landing page WCAG-AA violations').toEqual([]);
});

test('FAQ page is WCAG-AA compliant', async ({ page }) => {
  await page.goto('/veelgestelde-vragen');
  await page.waitForLoadState('networkidle');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  
  expect(results.violations, 'FAQ page WCAG-AA violations').toEqual([]);
});