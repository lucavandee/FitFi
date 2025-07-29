// Global teardown for Playwright tests
async function globalTeardown() {
  console.log('🧹 Running global teardown for FitFi E2E tests...');
  
  // Clean up any test artifacts
  const fs = require('fs');
  const path = require('path');
  
  // Clean up temporary files if any
  const tempDir = path.join(process.cwd(), 'temp-test-files');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('🗑️ Cleaned up temporary test files');
  }
  
  console.log('✅ Global teardown completed');
}

module.exports = globalTeardown;