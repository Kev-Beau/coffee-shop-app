# Visual Regression Testing - Quick Reference

## Quick Start Commands

```bash
# Run all visual tests
npm run test:visual

# Run only mobile viewport tests (great for catching bottom nav issues!)
npm run test:visual:mobile

# Run only desktop viewport tests
npm run test:visual:desktop

# Update baselines after making intentional changes
npm run test:visual:update

# View the HTML test report with diffs
npm run test:visual:report
```

## What Gets Tested

✅ **102 baseline screenshots** across 6 device/browser configurations:
- **Mobile (390x844)** - iPhone 13, Pixel 5
- **Tablet (810x1080)** - iPad
- **Desktop (1280x720)** - Chrome, Firefox, Safari

✅ **Key pages tested:**
- Landing page (hero, full page)
- Authentication (signin, signup)
- Feed page
- Shops listing
- Profile page
- Search page
- Bottom navigation (all routes) ⭐ **Crucial for mobile!**

## Daily Workflow

### 1. Before making changes
```bash
npm run test:visual
```
Ensure all tests pass before starting work.

### 2. After making visual changes
```bash
# Tests will fail - this is expected!
npm run test:visual

# Review the diffs in the HTML report
npm run test:visual:report

# If changes are intentional, update baselines
npm run test:visual:update
```

### 3. Checking specific issues
```bash
# Test only mobile (great for bottom nav issues)
npm run test:visual:mobile

# Test only desktop
npm run test:visual:desktop
```

## Understanding Test Results

### ✅ Passing Tests
```
✓ Bottom Navigation Visual Tests (4/4)
  ✓ bottom navigation on /feed - mobile
  ✓ bottom navigation on /search - mobile
  ✓ bottom navigation on /friends - mobile
  ✓ bottom navigation on /profile - mobile
```

### ❌ Failing Tests
```
✗ Bottom Navigation Visual Tests (1/4)
  ✗ bottom navigation on /feed - mobile

    Error: Screenshot comparison failed:
    A screenshot is required.
```

**What to do:**
1. Open HTML report: `npm run test:visual:report`
2. Review the side-by-side comparison
3. Check the diff image (red = differences)
4. Decide:
   - **Intentional change?** → `npm run test:visual:update`
   - **Bug?** → Fix and retest

## Common Scenarios

### Scenario 1: Bottom Navigation Issues on Mobile

**Problem:** Bottom nav overlaps content on some pages

**Solution:**
```bash
# Run mobile-only tests
npm run test:visual:mobile

# Check which pages fail
# View report to see the exact issue
# Fix the CSS/layout
# Update baselines
npm run test:visual:update
```

### Scenario 2: Redesigning a Page

**Problem:** You're making major visual changes

**Solution:**
```bash
# Make your changes
# Run tests - they will fail
npm run test:visual

# Review ALL the diffs in the HTML report
# If everything looks good:
npm run test:visual:update

# Commit the new baselines with your code
git add visual-tests/
git commit -m "redesign: update homepage baselines"
```

### Scenario 3: Layout Breaks on Tablet

**Problem:** Works on mobile/desktop, breaks on tablet

**Solution:**
```bash
# The visual tests will catch this!
npm run test:visual

# Look for chromium-tablet failures
# Fix the responsive CSS
# Update baselines
npm run test:visual:update
```

## Test Files Location

```
coffee-shop-app/
├── visual-tests/
│   ├── visual-regression.spec.ts      # Main test file
│   ├── helpers.ts                      # Helper functions
│   └── visual-regression.spec.ts-snapshots/  # Baseline images (102 files)
├── playwright.config.ts                # Playwright configuration
└── playwright-report/                  # HTML test reports
```

## Baseline Screenshots

**Location:** `visual-tests/visual-regression.spec.ts-snapshots/`

**Count:** 102 baseline images

**Naming convention:** `test-name-project-platform.png`

Examples:
- `landing-mobile-iphone-safari-darwin.png`
- `bottom-nav--feed-mobile-chromium-desktop-darwin.png`
- `signin-desktop-webkit-desktop-darwin.png`

## Pro Tips

1. **Commit baselines to git** - Team consistency
2. **Review diffs before updating** - Don't hide bugs
3. **Test on mobile viewports** - Catches most layout issues
4. **Use HTML report** - Much easier than CLI output
5. **Run in CI** - Catch issues before deployment

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run Visual Tests
  run: npm run test:visual

- name: Upload Test Results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Tests fail but nothing looks different

- Check animations (wait longer)
- Check fonts (browser differences)
- Check dynamic content (dates, counters)

### Baselines don't match across machines

- Use CI for consistent environment
- Commit baselines to repo
- Use same browser versions

### Too many false positives

Adjust tolerance in test:
```typescript
await expect(page).toHaveScreenshot('page.png', {
  threshold: 0.3,  // More lenient
  maxDiffPixels: 100,  // Allow small differences
});
```

## Need Help?

1. Check `VISUAL_TESTING.md` for detailed documentation
2. Review HTML report for detailed diffs
3. Check Playwright docs: https://playwright.dev/docs/screenshots

## Summary

- **102 baseline screenshots** protect your UI
- **6 device configurations** ensure cross-device consistency
- **One command** to run all tests
- **Easy baseline updates** for intentional changes
- **HTML reports** for easy review

**Visual regression testing catches layout issues that unit tests miss!**
