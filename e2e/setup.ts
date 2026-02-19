import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...');
  console.log(`📝 Base URL: ${config.projects?.[0].use?.baseURL || 'http://localhost:3000'}`);

  // You can add global setup here, such as:
  // - Setting up test databases
  // - Creating test users
  // - Generating test data
  // - Starting external services

  console.log('✅ E2E test setup complete');
}

export default globalSetup;
