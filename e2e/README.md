# Beany E2E Test Suite

Comprehensive end-to-end tests for the Beany coffee shop application using Playwright.

## Test Structure

```
e2e/
├── auth.spec.ts           # Authentication flows (signup, login, logout)
├── feed.spec.ts           # Main feed functionality
├── search.spec.ts         # Search functionality
├── logging.spec.ts        # Coffee logging feature
├── profile.spec.ts        # User profile page
├── navigation.spec.ts     # Bottom navigation testing
├── mobile.spec.ts         # Mobile-specific interactions
├── responsive.spec.ts     # Responsive design testing
└── utils/
    ├── test-data.ts       # Test data utilities
    └── helpers.ts         # Reusable test helpers
```

## Running Tests

### Run All Tests

```bash
npm run test:e2e
```

### Run Specific Test Suites

```bash
# Authentication tests
npm run test:e2e:auth

# Feed tests
npm run test:e2e:feed

# Search tests
npm run test:e2e:search

# Logging tests
npm run test:e2e:logging

# Profile tests
npm run test:e2e:profile

# Navigation tests
npm run test:e2e:navigation

# Mobile tests
npm run test:e2e:mobile

# Responsive tests
npm run test:e2e:responsive
```

### Run Tests in Different Modes

```bash
# Run with headed browser (watch the tests run)
npm run test:e2e:headed

# Run with Playwright UI (interactive mode)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug
```

### Run on Specific Browsers/Devices

```bash
# Chromium only
npm run test:chromium

# Firefox only
npm run test:firefox

# Safari (WebKit) only
npm run test:webkit

# Mobile devices (iPhone + Android)
npm run test:mobile

# All browsers and devices
npm run test:all-browsers
```

## Test Coverage

### Authentication Flows (`auth.spec.ts`)
- ✅ User signup with validation
- ✅ User login
- ✅ Password recovery
- ✅ Email confirmation
- ✅ Form validation and error handling
- ✅ Navigation between auth pages

### Core Features
- **Feed (`feed.spec.ts`)**
  - ✅ Friends and Explore tabs
  - ✅ Post display and interactions
  - ✅ Pull to refresh
  - ✅ Empty states
  - ✅ Loading states

- **Search (`search.spec.ts`)**
  - ✅ Search users, posts, and shops
  - ✅ Search debouncing
  - ✅ Tab switching
  - ✅ Clear search
  - ✅ Empty and loading states

- **Logging (`logging.spec.ts`)**
  - ✅ Quick log modal
  - ✅ Shop search
  - ✅ Recent shops
  - ✅ Drink logging
  - ✅ Modal interactions

- **Profile (`profile.spec.ts`)**
  - ✅ Profile display
  - ✅ Stats cards
  - ✅ Posts, Visits, Favorites tabs
  - ✅ Empty states
  - ✅ Coffee preferences

- **Navigation (`navigation.spec.ts`)**
  - ✅ Bottom navigation on all pages
  - ✅ Active tab highlighting
  - ✅ Navigation state preservation
  - ✅ Hide on input focus
  - ✅ Proper z-index and layering

### Mobile-Specific Tests (`mobile.spec.ts`)
- ✅ Viewport rendering (iPhone, Android)
- ✅ Touch interactions (tap, swipe)
- ✅ Keyboard behavior
- ✅ Safe area insets
- ✅ Orientation changes
- ✅ Pull to refresh
- ✅ Accessibility (VoiceOver)
- ✅ Performance

### Responsive Design (`responsive.spec.ts`)
- ✅ Multiple viewport sizes (375px - 2560px)
- ✅ Breakpoint testing
- ✅ Typography scaling
- ✅ Layout adjustments
- ✅ Image scaling
- ✅ Orientation changes
- ✅ Edge cases (ultra-wide, very narrow)

## Test Configuration

Playwright is configured in `playwright.config.ts` with projects for:
- Desktop browsers (Chromium, Firefox, Safari)
- Mobile devices (iPhone, Android)
- Tablets (iPad)

### Viewports Tested

| Device | Width | Height |
|--------|-------|--------|
| iPhone SE | 375 | 667 |
| iPhone 12 | 390 | 844 |
| iPhone 14 Pro Max | 430 | 932 |
| Pixel 5 | 393 | 851 |
| iPad | 810 | 1080 |
| iPad Pro | 1024 | 1366 |
| Desktop Small | 1280 | 720 |
| Desktop Large | 1920 | 1080 |

## Writing New Tests

### Example Test

```typescript
import { test, expect } from '@playwright/test';
import { NavigationHelpers } from './utils/helpers';

test.describe('My New Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/my-page');

    // Arrange
    const button = page.locator('button:has-text("Click me")');

    // Act
    await button.click();

    // Assert
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Using Helpers

```typescript
import { NavigationHelpers } from './utils/helpers';

test.describe('My Feature', () => {
  test('should navigate correctly', async ({ page }) => {
    const navHelpers = new NavigationHelpers(page);

    await page.goto('/feed');
    await navHelpers.navigateTo('profile');

    await page.waitForURL('**/profile');
  });
});
```

## Test Data

Use the test data utilities for consistent test data:

```typescript
import { generateTestUser } from './utils/test-data';

const user = generateTestUser();
// { email: 'test-1234567890@example.com', username: 'testuser1234567890', ... }
```

## Best Practices

1. **Keep tests independent** - Each test should be able to run alone
2. **Use data-testid attributes** - For more stable selectors
3. **Wait for elements** - Use `await expect(locator).toBeVisible()`
4. **Avoid hard-coded delays** - Use `waitForSelector` or `waitForURL` instead
5. **Test user flows** - Focus on what users actually do
6. **Use page objects** - Extract common actions into helper functions
7. **Test responsive layouts** - Verify layouts work on different screen sizes

## Troubleshooting

### Tests Fail Due to Authentication

Many tests require authentication. You may need to:
1. Set up test users in your database
2. Use environment variables for test credentials
3. Mock authentication in tests

### Tests Are Flaky

- Use `waitForSelector` instead of `waitForTimeout`
- Check for race conditions
- Use `waitForLoadState('networkidle')` for API calls
- Increase timeouts in `playwright.config.ts`

### Browser Not Found

```bash
npx playwright install chromium
```

### Viewport Issues

Make sure your Next.js app has proper viewport meta tag:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
