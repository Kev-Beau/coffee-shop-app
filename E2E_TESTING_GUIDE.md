# Beany E2E Testing Quick Start Guide

This guide will help you get started with the comprehensive E2E test suite for the Beany coffee shop app.

## Prerequisites

- Node.js installed
- Beany app dependencies installed (`npm install`)
- Playwright browsers installed

## Initial Setup

### 1. Install Playwright Browsers

```bash
npx playwright install chromium
```

For all browsers:
```bash
npx playwright install
```

### 2. Verify Installation

```bash
npm run test:e2e -- --list
```

This should list all available tests.

## Running Your First Tests

### Quick Test Run

Run a single test file to see everything working:

```bash
npm run test:e2e:auth
```

### Run All Tests

```bash
npm run test:e2e
```

### Watch Tests Run

```bash
npm run test:e2e:headed
```

This opens a browser window so you can watch the tests execute.

## Test Organization

### By Feature

| Test File | What It Tests |
|-----------|---------------|
| `auth.spec.ts` | User signup, login, logout |
| `feed.spec.ts` | Main feed, posts, interactions |
| `search.spec.ts` | Search functionality |
| `logging.spec.ts` | Coffee logging feature |
| `profile.spec.ts` | User profile page |
| `navigation.spec.ts` | Bottom navigation |
| `mobile.spec.ts` | Mobile interactions |
| `responsive.spec.ts` | Responsive design |

### By Device/Viewport

The test suite runs on multiple devices:

- 📱 **Mobile**: iPhone SE, iPhone 12, iPhone 14 Pro Max, Pixel 5
- 📱 **Tablet**: iPad, iPad Pro
- 💻 **Desktop**: Small (1280px), Large (1920px)

## Common Workflows

### Running Tests During Development

1. Start the dev server in one terminal:
   ```bash
   npm run dev
   ```

2. In another terminal, run tests:
   ```bash
   npm run test:e2e:feed --headed
   ```

### Debugging a Failing Test

```bash
npm run test:e2e:debug
```

This opens Playwright's Inspector with step-by-step debugging.

### Running Tests on Specific Device

```bash
# Mobile only
npm run test:mobile

# Desktop only  
npm run test:chromium
```

### Running Single Test

```bash
npx playwright test e2e/auth.spec.ts --grep "should display sign up page correctly"
```

## Writing New Tests

### Basic Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should work correctly', async ({ page }) => {
    // 1. Navigate to page
    await page.goto('/my-page');

    // 2. Interact with elements
    await page.click('button:has-text("Submit")');

    // 3. Assert results
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Using Helpers

```typescript
import { NavigationHelpers } from './utils/helpers';

test('should navigate through app', async ({ page }) => {
  const nav = new NavigationHelpers(page);
  
  await nav.navigateTo('feed');
  await expect(page).toHaveURL(/.*feed/);
});
```

## Test Reports

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

Or open `playwright-report/index.html` in your browser.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      
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

## Environment Variables

Create a `.env.test` file for test-specific configuration:

```bash
# .env.test
NEXT_PUBLIC_SUPABASE_URL=your-test-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
```

## Best Practices

### ✅ Do's

- Keep tests independent
- Use descriptive test names
- Test user flows, not implementation
- Use helpers for common actions
- Wait for elements properly

### ❌ Don'ts

- Don't use hard-coded delays (`waitForTimeout`)
- Don't test third-party libraries
- Don't make tests dependent on each other
- Don't use fragile selectors
- Don't ignore flaky tests

## Troubleshooting

### "Browser not found"

```bash
npx playwright install chromium
```

### Tests timeout

- Increase timeout in `playwright.config.ts`
- Check if server is running
- Verify network requests

### Element not found

- Use Playwright's codegen: `npx playwright codegen`
- Add data-testid attributes to elements
- Wait for element to be visible

### Authentication errors

- Set up test users
- Use environment variables for credentials
- Mock auth in tests if needed

## Resources

- 📚 [Full Documentation](./e2e/README.md)
- 🎭 [Playwright Docs](https://playwright.dev)
- 💬 [Community Discord](https://playwright.dev/discord)
- 🐛 [Issue Tracker](https://github.com/microsoft/playwright/issues)

## Getting Help

1. Check the [E2E README](./e2e/README.md) for detailed documentation
2. Review existing tests for examples
3. Use `npx playwright codegen` to generate test code
4. Run with `--debug` flag to step through tests

Happy testing! ☕
