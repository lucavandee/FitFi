// Global setup for Playwright tests
const { chromium } = require('@playwright/test');

async function globalSetup() {
  console.log('🚀 Starting global setup for FitFi E2E tests...');
  
  // Verify the application is running
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the application to be ready
    await page.goto('http://localhost:4173', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Verify basic page elements
    await page.waitForSelector('h1', { timeout: 10000 });
    
    console.log('✅ Application is ready for testing');
    
  } catch (error) {
    console.error('❌ Application setup failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;