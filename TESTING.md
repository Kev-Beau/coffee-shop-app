# Testing Guide - CoffeeConnect App

Quick guide for running automated tests with Playwright.

## Prerequisites

Make sure you have Node.js 20+ installed and dependencies installed:

```bash
npm install --cache /tmp/npm-cache
```

## Quick Start

### 1. Run All Tests

```bash
npm test
```

This will run all E2E tests across all configured browsers and devices.

### 2. Run Bottom Navigation Tests (Our Current Focus)

```bash
npm run test:bottom-nav
```

This tests the critical keyboard interaction behavior on mobile devices.

### 3. Run Tests on Specific Devices

**iPhone Safari:**
```bash
npm run test:bottom-nav:iphone
```

**Android Chrome:**
```bash
npm run test:bottom-nav:android
```

**All Mobile Devices:**
```bash
npm run test:mobile
```

### 4. Interactive Testing (See the Browser)

```bash
npm run test:headed
```

### 5. Debug Mode (Step Through Tests)

```bash
npm run test:debug
```

## Understanding the Bottom Navigation Tests

The bottom navigation tests verify critical mobile UX behavior:

### What's Being Tested

1. **Initial State**
   - Bottom nav is visible when page loads
   - All 5 navigation items are present (Feed, Search, Log, Friends, Profile)
   - Proper z-index and positioning

2. **Keyboard Interaction**
   - When user taps search input → keyboard appears → nav hides
   - When user dismisses keyboard → nav shows again
   - Smooth transitions without glitches

3. **Navigation Functionality**
   - All nav links navigate correctly
   - Active state highlighting works
   - Special styling for the Log button

4. **Mobile-Specific Behavior**
   - Proper touch targets
   - Fixed positioning at bottom
   - Full width layout

5. **iOS Safari Quirks**
   - Handles viewport resizing when keyboard shows
   - Doesn't interfere with native browser gestures

### Why This Matters

On mobile (especially iOS Safari), the virtual keyboard can cover interactive elements. The bottom navigation needs to:
- Hide when keyboard appears to avoid being covered
- Reappear when keyboard is dismissed
- Not interfere with typing or other interactions

## Test Results

### View HTML Report

After tests run, view the detailed report:

```bash
npx playwright show-report
```

This opens an interactive HTML report showing:
- Which tests passed/failed
- Screenshots of failures
- Timing information
- Browser/device info

### Screenshots & Videos

Failed tests automatically capture:
- Screenshots at the point of failure
- Video of the entire test run
- Trace files for debugging

Find these in the `test-results/` directory.

## Troubleshooting

### Tests Won't Run

**Problem:** Tests fail to start or timeout

**Solutions:**
1. Make sure dev server isn't already running on port 3000
2. Check that all dependencies are installed
3. Try running: `npx playwright install`

### "Element Not Found" Errors

**Problem:** Tests can't find elements

**Solutions:**
1. Run in headed mode to see what's happening: `npm run test:headed`
2. Check if Supabase is configured (some features need it)
3. Verify the app builds and runs locally first

### Tests Pass But App Has Issues

**Problem:** Tests pass but you're seeing issues in manual testing

**Solutions:**
1. Tests run against localhost - check if issue only occurs in production
2. Try testing on a real device (emulators have limitations)
3. The virtual keyboard simulation isn't perfect - test on real hardware

### Slow Tests

**Problem:** Tests take too long

**Solutions:**
1. Run only the test suite you need: `npm run test:bottom-nav`
2. Run on a single device: `npm run test:bottom-nav:iphone`
3. Use `--workers=1` if parallel tests are causing issues

## Writing New Tests

### Basic Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/my-page');
    await page.waitForLoadState('networkidle');
  });

  test('should do something', async ({ page }) => {
    const element = page.locator('.my-selector');
    await expect(element).toBeVisible();
  });
});
```

### Using Test Utilities

Import helper functions from `e2e/test-utils.ts`:

```typescript
import {
  waitForBottomNav,
  focusInputAndWait,
  navigateToPage
} from '../test-utils';

test('keyboard hides nav', async ({ page }) => {
  await navigateToPage(page, '/search');
  await focusInputAndWait(page, 'input[type="search"]');

  const nav = getBottomNav(page);
  await expect(nav).not.toBeVisible();
});
```

## CI/CD Integration

Tests automatically run on GitHub Actions when:
- Code is pushed to main or develop branches
- Pull requests are created
- Daily schedule (2 AM UTC)

View results in the Actions tab on GitHub.

## Best Practices

1. **Run locally first** before pushing
2. **Use focused test runs** during development
3. **Check test reports** even when tests pass
4. **Update tests** when changing UI components
5. **Test on real devices** periodically
6. **Keep tests independent** - they should work in any order

## Resources

- **Full Test Documentation**: `e2e/README.md`
- **Playwright Docs**: https://playwright.dev
- **Test Configuration**: `playwright.config.ts`
- **Test Scripts**: Check `package.json` scripts section

## Need Help?

1. Check the test output in terminal
2. View the HTML report: `npx playwright show-report`
3. Run in debug mode: `npm run test:debug`
4. Review the Playwright documentation

## Current Test Focus

We're currently focused on the bottom navigation keyboard interaction issue. To run just those tests:

```bash
npm run test:bottom-nav
```

Or for specific devices:
```bash
npm run test:bottom-nav:iphone    # iOS Safari
npm run test:bottom-nav:android   # Android Chrome
```
