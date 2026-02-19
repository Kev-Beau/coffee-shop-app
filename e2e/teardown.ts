import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up after E2E tests...');

  // You can add cleanup here, such as:
  // - Dropping test databases
  // - Deleting test users
  // - Stopping external services
  // - Clearing caches

  console.log('✅ E2E test cleanup complete');
}

export default globalTeardown;
