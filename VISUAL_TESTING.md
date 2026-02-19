# Visual Regression Testing Guide

This document explains how to use visual regression testing for the Beany app to catch layout issues and visual bugs across different devices and screen sizes.

## Overview

Visual regression testing automatically takes screenshots of your app and compares them against baseline images. This helps catch:
- Layout issues (like the bottom navigation problem)
- Responsive design breakage
- Unintended visual changes
- Cross-browser inconsistencies

## Setup

The testing setup uses:
- **Playwright** - Browser automation framework
- **Built-in screenshot comparison** - No additional service needed
- **Multiple viewports** - Mobile (390x844), Tablet (810x1080), Desktop (1280x720)

## Quick Start

### 1. Run Visual Tests

```bash
# Run all visual tests
npm run test:visual

# Run only mobile viewport tests
npm run test:visual:mobile

# Run only desktop viewport tests
npm run test:visual:desktop
```

### 2. Create Baseline Screenshots

When you run tests for the first time, Playwright will create baseline screenshots:

```bash
npm run test:visual
```

This creates baseline images in `visual-tests/` directory that future tests will compare against.

### 3. Update Baselines After Intentional Changes

When you make intentional visual changes (e.g., redesign, new features), update the baselines:

```bash
npm run test:visual:update
```

**Important:** Review the changes before committing to ensure they match your intent!

### 4. View Test Report

After running tests, view the detailed report:

```bash
npm run test:visual:report
```

This opens an HTML report showing:
- All screenshots taken
- Side-by-side comparisons
- Differences highlighted
- Test results

## Test Files

### Main Test Suite: `visual-tests/visual-regression.spec.ts`

Tests cover:
- **Landing page** - Hero section, full page
- **Authentication** - Sign in, sign up pages
- **Feed** - Main feed layout
- **Shops** - Shop listing page
- **Profile** - User profile page
- **Search** - Search page
- **Bottom navigation** - Tested across all routes (crucial for mobile)
- **Layout tests** - Horizontal overflow detection

### Helper Functions: `visual-tests/helpers.ts`

Reusable utilities for:
- Waiting for page stabilization
- Handling animations
- Mock data setup
- Auth session management (to be implemented)

## Understanding Test Results

### Passing Tests

```
✓ Landing Page Visual Tests (3/3)
  ✓ should match baseline on desktop
  ✓ should match baseline on mobile
  ✓ should match hero section on desktop
```

### Failing Tests

```
✗ Bottom Navigation Visual Tests (2/4)
  ✗ bottom navigation on /feed - mobile

    Error: Screenshot comparison failed:

    Baseline: /visual-tests/bottom-nav--feed-mobile.png
    Current:  /test-results/bottom-nav--feed-mobile-actual.png
    Diff:     /test-results/bottom-nav--feed-mobile-diff.png
```

### What to Do When Tests Fail

1. **View the diff image** - Shows exactly what changed (red = differences)
2. **Open the HTML report** - See side-by-side comparison
3. **Determine if the change is intentional:**
   - **Yes:** Run `npm run test:visual:update` to update baselines
   - **No:** Fix the issue and run tests again

## Common Issues & Solutions

### Issue: Tests fail due to animations

**Problem:** Animations cause inconsistent screenshots

**Solution:** Tests use `animations: 'allowed'` and wait periods. If still failing:

```typescript
await page.waitForTimeout(1000); // Increase wait time
```

### Issue: Tests fail on different machines

**Problem:** Font rendering varies across OS

**Solution:** Playwright uses browser snapshots which are consistent, but consider:

1. Commit baseline screenshots to the repo
2. Use CI for consistent testing environment
3. Configure Playwright to use specific fonts

### Issue: Bottom navigation tests fail intermittently

**Problem:** Navigation hides when inputs are focused

**Solution:** Tests account for this behavior. If failing, check:
- Input field focus state
- Keyboard visibility on mobile
- Timing of screenshot capture

## Writing New Visual Tests

### Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Page Name Visual Tests', () => {
  test('should match baseline on mobile', async ({ page }) => {
    await page.goto('/your-page');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Wait for animations

    await expect(page).toHaveScreenshot('your-page-mobile.png', {
      fullPage: true,
      animations: 'allowed',
    });
  });

  test('should match baseline on desktop', async ({ page }) => {
    await page.goto('/your-page');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('your-page-desktop.png', {
      fullPage: true,
      animations: 'allowed',
    });
  });
});
```

### Best Practices

1. **Wait for stability:** Always wait for network idle and animations
2. **Test multiple viewports:** Mobile, tablet, desktop
3. **Use descriptive names:** Screenshot names should clearly identify the page/viewport
4. **Test interactive states:** Consider testing hover, focus, active states
5. **Test error states:** Empty states, error messages, loading states

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Visual Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:visual
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

## Advanced Usage

### Testing Specific Components

```typescript
test('component screenshot', async ({ page }) => {
  await page.goto('/page-with-component');
  const component = page.locator('.my-component');
  await expect(component).toHaveScreenshot('component.png');
});
```

### Testing Interactive States

```typescript
test('hover state', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('button');
  await button.hover();
  await expect(button).toHaveScreenshot('button-hover.png');
});
```

### Testing Different Themes

```typescript
['light', 'dark'].forEach(theme => {
  test(`should match baseline in ${theme} mode`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate(theme => {
      document.documentElement.setAttribute('data-theme', theme);
    }, theme);
    await expect(page).toHaveScreenshot(`page-${theme}.png`);
  });
});
```

## Troubleshooting

### Screenshots don't match after refactoring

If you've made legitimate visual changes:
1. Review the diff images in `test-results/`
2. Verify changes are intentional
3. Update baselines: `npm run test:visual:update`
4. Commit the new baseline screenshots

### Tests pass locally but fail in CI

Common causes:
- Font differences
- Environment variables
- Database state (mock data differs)
- Viewport variations

**Solution:** Use Docker or consistent CI environment, or update baselines in CI.

### Too many false positives

If tests are too sensitive:
1. Adjust screenshot comparison threshold in `playwright.config.ts`
2. Use masking to ignore dynamic content (dates, counters)
3. Focus on component-level tests instead of full-page

```typescript
await expect(page).toHaveScreenshot('page.png', {
  threshold: 0.2, // Allow more differences (default 0.2)
  maxDiffPixels: 100, // Allow up to 100 different pixels
});
```

## Maintenance

### Regular Tasks

1. **Review test results** after each run
2. **Update baselines** when making intentional visual changes
3. **Add new tests** for new features/pages
4. **Remove obsolete tests** for removed features
5. **Review and commit** baseline screenshots with code changes

### When to Update Baselines

Update baselines when:
- Redesigning a page
- Adding new UI elements
- Changing layouts intentionally
- Updating brand colors/styles
- Fixing visual bugs

**Do NOT** update baselines to silence failing tests without understanding the change!

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Screenshots](https://playwright.dev/docs/screenshots)
- [Visual Regression Testing Best Practices](https://playwright.dev/docs/screenshots#visual-regression)

## Support

For issues or questions about visual testing:
1. Check the HTML report for detailed diff information
2. Review test logs in `playwright-report/`
3. Consult this guide
4. Check Playwright documentation

---

**Remember:** Visual tests are a complement to, not a replacement for, functional tests and manual testing!
