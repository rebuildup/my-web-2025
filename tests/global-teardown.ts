// Global teardown for Playwright tests
import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  try {
    // Clean up any test data
    // This could include removing test files, clearing databases, etc.
    
    // Log test completion
    console.log('📊 Test run completed');
    
    // If running in CI, you might want to upload artifacts or send notifications
    if (process.env.CI) {
      console.log('🚀 Running in CI environment');
      // Add CI-specific cleanup here
    }
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;