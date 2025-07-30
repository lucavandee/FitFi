const { test, expect } = require('@playwright/test');

test.describe('Quiz Restart Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user-123', email: 'test@example.com', name: 'Test User' }
      }));
    });
  });

  test('quiz restart from dashboard works correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Click "Quiz opnieuw doen" button
    const restartButton = page.locator('text=Quiz opnieuw doen');
    await expect(restartButton).toBeVisible();
    
    // Check button is not disabled initially
    await expect(restartButton).not.toBeDisabled();
    
    // Click the button
    await restartButton.click();
    
    // Should navigate to quiz page
    await page.waitForURL('**/quiz', { timeout: 5000 });
    
    // Verify we're on the quiz page
    await expect(page.locator('h1')).toContainText('Stijlquiz');
    await expect(page.locator('text=Vraag 1')).toBeVisible();
    
    console.log('✅ Quiz restart from dashboard working correctly');
  });

  test('quiz restart from results page works correctly', async ({ page }) => {
    // First complete a quiz to get to results
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    // Mock quiz completion by going directly to results
    await page.goto('/results');
    await page.waitForLoadState('networkidle');
    
    // Click "Quiz Opnieuw Doen" button
    const restartButton = page.locator('text=Quiz Opnieuw Doen');
    await expect(restartButton).toBeVisible();
    
    // Click the button
    await restartButton.click();
    
    // Should navigate to quiz page
    await page.waitForURL('**/quiz', { timeout: 5000 });
    
    // Verify we're on the quiz page
    await expect(page.locator('h1')).toContainText('Stijlquiz');
    await expect(page.locator('text=Vraag 1')).toBeVisible();
    
    console.log('✅ Quiz restart from results working correctly');
  });

  test('button shows loading state during reset', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Mock slow API response
    await page.route('**/functions/v1/reset-quiz', async route => {
      // Delay response by 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    const restartButton = page.locator('text=Quiz opnieuw doen');
    await restartButton.click();
    
    // Should show loading state
    await expect(page.locator('text=Quiz resetten...')).toBeVisible();
    await expect(page.locator('.animate-spin')).toBeVisible();
    
    // Button should be disabled during loading
    await expect(restartButton).toBeDisabled();
    
    console.log('✅ Loading state working correctly');
  });

  test('handles API errors gracefully', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Mock API error
    await page.route('**/functions/v1/reset-quiz', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    const restartButton = page.locator('text=Quiz opnieuw doen');
    await restartButton.click();
    
    // Should show error toast
    await expect(page.locator('text=Kan quiz niet resetten')).toBeVisible();
    
    // Should remain on dashboard
    await expect(page).toHaveURL('**/dashboard');
    
    console.log('✅ Error handling working correctly');
  });

  test('repeated clicks are handled correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const restartButton = page.locator('text=Quiz opnieuw doen');
    
    // Click multiple times rapidly
    await restartButton.click();
    await restartButton.click();
    await restartButton.click();
    
    // Should only navigate once
    await page.waitForURL('**/quiz', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Stijlquiz');
    
    console.log('✅ Repeated clicks handled correctly');
  });

  test('accessibility compliance', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const restartButton = page.locator('text=Quiz opnieuw doen');
    
    // Check ARIA attributes
    await expect(restartButton).toHaveAttribute('aria-busy', 'false');
    
    // Click and check loading state
    await restartButton.click();
    
    // During loading, aria-busy should be true
    await expect(page.locator('[aria-busy="true"]')).toBeVisible();
    
    console.log('✅ Accessibility compliance verified');
  });
});

test.describe('Quiz State Management', () => {
  test('quiz state is properly reset', async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user-123', email: 'test@example.com', name: 'Test User' }
      }));
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Restart quiz
    await page.click('text=Quiz opnieuw doen');
    await page.waitForURL('**/quiz');
    
    // Verify quiz starts from beginning
    await expect(page.locator('text=Vraag 1 van')).toBeVisible();
    
    // Verify progress bar is at 0%
    const progressBar = page.locator('[role="progressbar"]');
    const progressValue = await progressBar.getAttribute('aria-valuenow');
    expect(parseInt(progressValue || '0')).toBeLessThan(25); // Should be close to 0%
    
    console.log('✅ Quiz state properly reset');
  });
});