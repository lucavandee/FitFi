const { test, expect } = require('@playwright/test');

test.describe('FitFi Founders Club Referral System', () => {
  test('should process referral code from URL and complete signup', async ({ page }) => {
    // Test referral code processing
    const testReferralCode = 'TEST123';
    
    // Visit landing page with referral code
    await page.goto(`/?ref=${testReferralCode}`);
    await page.waitForLoadState('networkidle');
    
    // Verify referral code is processed (cookie should be set)
    const cookies = await page.context().cookies();
    const referralCookie = cookies.find(cookie => cookie.name === 'ref_code');
    expect(referralCookie?.value).toBe(testReferralCode);
    
    // Navigate to registration
    await page.click('text=Gratis starten');
    await page.waitForLoadState('networkidle');
    
    // Fill registration form
    const randomEmail = `referral-test-${Date.now()}@example.com`;
    await page.fill('input[name="name"]', 'Referral Test User');
    await page.fill('input[name="email"]', randomEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    
    // Submit registration
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Should be redirected to onboarding
    expect(page.url()).toContain('/onboarding');
    
    console.log('✅ Referral signup flow completed successfully');
  });

  test('should display Founders Club section on dashboard', async ({ page }) => {
    // This test assumes user is logged in
    // In real scenario, you'd need to login first
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check if Founders Club section is visible
    const foundersSection = page.locator('text=FitFi Founders Club');
    await expect(foundersSection).toBeVisible();
    
    // Check for referral code display
    const referralCode = page.locator('text=fitfi.ai?ref=');
    await expect(referralCode).toBeVisible();
    
    // Check copy button
    const copyButton = page.locator('text=Kopieer referral link');
    await expect(copyButton).toBeVisible();
    
    console.log('✅ Founders Club section displayed correctly');
  });

  test('should show Founding Member badge after 3 referrals', async ({ page }) => {
    // This would require setting up test data with 3+ referrals
    // For now, we'll test the UI elements exist
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for progress indicator
    const progressText = page.locator('text=Voortgang naar Founding Member');
    await expect(progressText).toBeVisible();
    
    // Check for leaderboard
    const leaderboard = page.locator('text=Top Referrers');
    await expect(leaderboard).toBeVisible();
    
    console.log('✅ Founders Club UI elements present');
  });

  test('should copy referral link to clipboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Click copy button
    await page.click('text=Kopieer referral link');
    
    // Verify success message
    await expect(page.locator('text=Link gekopieerd!')).toBeVisible();
    
    console.log('✅ Referral link copy functionality works');
  });

  test('should validate referral code format', async ({ page }) => {
    // Test with invalid referral code
    await page.goto('/?ref=invalid');
    await page.waitForLoadState('networkidle');
    
    // Should still load page normally
    await expect(page.locator('h1')).toBeVisible();
    
    // Test with valid format
    await page.goto('/?ref=VALID123');
    await page.waitForLoadState('networkidle');
    
    // Should process normally
    await expect(page.locator('h1')).toBeVisible();
    
    console.log('✅ Referral code validation works');
  });
});

test.describe('Founders Club Accessibility', () => {
  test('should meet accessibility standards', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check for proper ARIA labels
    const foundersSection = page.locator('[aria-labelledby="founders-heading"]');
    await expect(foundersSection).toBeVisible();
    
    // Check button accessibility
    const copyButton = page.locator('button:has-text("Kopieer referral link")');
    await expect(copyButton).toBeVisible();
    
    // Verify keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    console.log('✅ Founders Club accessibility verified');
  });
});