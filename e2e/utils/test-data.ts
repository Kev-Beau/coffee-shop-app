/**
 * Test Data Utilities
 *
 * Provides test user credentials and data for E2E tests
 */

export const testUsers = {
  valid: {
    email: `test-${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    password: 'Test123456',
    displayName: 'Test User',
  },
  invalid: {
    email: 'invalid-email',
    shortPassword: '12345',
    shortUsername: 'ab',
  },
};

export const testShop = {
  name: 'Blue Bottle Coffee',
  address: '123 Main St, San Francisco, CA',
};

export const testDrink = {
  name: 'Cappuccino',
  rating: 5,
  notes: 'Excellent coffee with perfect foam',
};

export const searchQueries = {
  valid: 'coffee',
  short: 'a',
  long: 'a'.repeat(100),
};

/**
 * Generate a unique test user with timestamp to avoid conflicts
 */
export function generateTestUser() {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@example.com`,
    username: `testuser${timestamp}`,
    password: 'Test123456',
    confirmPassword: 'Test123456',
    displayName: `Test User ${timestamp}`,
  };
}

/**
 * Generate a unique test drink
 */
export function generateTestDrink() {
  const timestamp = Date.now();
  return {
    name: `Test Drink ${timestamp}`,
    rating: Math.floor(Math.random() * 5) + 1,
    notes: `Test notes ${timestamp}`,
  };
}
