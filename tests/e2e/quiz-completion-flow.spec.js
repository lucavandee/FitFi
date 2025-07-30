const { test, expect } = require('@playwright/test');

test.describe('Quiz Completion Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user-123', email: 'test@example.com', name: 'Test User' }
      }));
    });
  });

  test('quiz completion redirects to results page', async ({ page }) => {
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    // Complete all quiz steps
    await completeFullQuiz(page);
    
    // Submit quiz
    await page.click('text=Verstuur Quiz');
    
    // Should show celebration
    await expect(page.locator('text=Quiz Voltooid!')).toBeVisible();
    
    // Wait for automatic redirect to results
    await page.waitForURL('**/results', { timeout: 10000 });
    
    // Verify we're on results page
    await expect(page.locator('h1')).toContainText('AI-Stijlanalyse');
    
    console.log('✅ Quiz completion redirects to results correctly');
  });

  test('quiz completion within 2 seconds', async ({ page }) => {
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    // Complete quiz quickly
    await completeFullQuiz(page);
    
    const startTime = Date.now();
    
    // Submit quiz
    await page.click('text=Verstuur Quiz');
    
    // Wait for redirect
    await page.waitForURL('**/results', { timeout: 5000 });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`Quiz completion took ${duration}ms`);
    expect(duration).toBeLessThan(2000);
    
    console.log('✅ Quiz completion within 2 seconds');
  });

  test('no redirect loop back to quiz', async ({ page }) => {
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    // Complete and submit quiz
    await completeFullQuiz(page);
    await page.click('text=Verstuur Quiz');
    
    // Wait for results page
    await page.waitForURL('**/results');
    
    // Wait a bit to ensure no redirect happens
    await page.waitForTimeout(3000);
    
    // Should still be on results page
    expect(page.url()).toContain('/results');
    await expect(page.locator('h1')).toContainText('AI-Stijlanalyse');
    
    console.log('✅ No redirect loop back to quiz');
  });

  test('handles submission errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/rest/v1/quiz_answers', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    // Complete quiz
    await completeFullQuiz(page);
    
    // Submit quiz
    await page.click('text=Verstuur Quiz');
    
    // Should show error message
    await expect(page.locator('text=Er ging iets mis')).toBeVisible();
    
    // Should remain on quiz page
    expect(page.url()).toContain('/quiz');
    
    console.log('✅ Submission errors handled gracefully');
  });

  test('achievements flow works correctly', async ({ page }) => {
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    // Complete quiz quickly to trigger speed achievement
    await completeFullQuizQuickly(page);
    
    // Submit quiz
    await page.click('text=Verstuur Quiz');
    
    // Check for achievement notification
    const achievementModal = page.locator('text=Achievement Unlocked');
    if (await achievementModal.isVisible()) {
      console.log('Achievement notification appeared');
      await page.click('text=Geweldig!');
    }
    
    // Should eventually reach results
    await page.waitForURL('**/results', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('AI-Stijlanalyse');
    
    console.log('✅ Achievements flow works correctly');
  });
});

// Helper function to complete all quiz steps
async function completeFullQuiz(page) {
  // Step 1: Style preferences
  await page.check('input[value="minimalist"]');
  await page.click('text=Volgende');
  await page.waitForTimeout(500);

  // Step 2: Base colors
  await page.check('input[value="neutral"]');
  await page.click('text=Volgende');
  await page.waitForTimeout(500);

  // Step 3: Body type
  await page.selectOption('select', 'hourglass');
  await page.click('text=Volgende');
  await page.waitForTimeout(500);

  // Step 4: Occasions
  await page.check('input[value="work"]');
  await page.check('input[value="casual"]');
  await page.click('text=Volgende');
  await page.waitForTimeout(500);

  // Step 5: Budget
  await page.locator('input[type="range"]').fill('150');
}

// Helper function to complete quiz quickly (for speed achievements)
async function completeFullQuizQuickly(page) {
  // Complete all steps rapidly
  await page.check('input[value="minimalist"]');
  await page.click('text=Volgende');
  
  await page.check('input[value="neutral"]');
  await page.click('text=Volgende');
  
  await page.selectOption('select', 'hourglass');
  await page.click('text=Volgende');
  
  await page.check('input[value="work"]');
  await page.click('text=Volgende');
  
  await page.locator('input[type="range"]').fill('150');
}