# Visual Regression Testing for Beany

## What is Visual Regression Testing?

Visual regression testing automatically takes screenshots of your web application and compares them against baseline images. This helps catch visual bugs, layout issues, and unintended design changes that traditional testing might miss.

## Why Use It?

- **Catch layout bugs** - Like the bottom navigation overlapping content on mobile
- **Ensure responsive design** - Test across mobile, tablet, and desktop viewports
- **Prevent regressions** - Catch unintended visual changes before deployment
- **Cross-browser testing** - Verify consistency across Chrome, Firefox, and Safari
- **Easy validation** - Quick visual confirmation that changes look correct

## Quick Start

### Installation (Already Done ✅)

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

### Run Tests

```bash
# Run all visual tests
npm run test:visual

# Run only mobile viewport tests
npm run test:visual:mobile

# Run only desktop viewport tests
npm run test:visual:desktop
```

### View Results

```bash
# Open the HTML report with side-by-side comparisons
npm run test:visual:report
```

### Update Baselines

When you make intentional visual changes:

```bash
# Review the changes in the HTML report first
npm run test:visual:report

# Then update the baselines
npm run test:visual:update
```

## What's Tested

### Pages (7 total)
- Landing page (`/`)
- Sign in page (`/auth/signin`)
- Sign up page (`/auth/signup`)
- Feed page (`/feed`)
- Shops page (`/shops`)
- Profile page (`/profile`)
- Search page (`/search`)

### Components
- Bottom navigation (tested on all routes) ⭐
- Hero sections
- Authentication forms
- Feed cards
- Shop cards

### Viewports (6 configurations)
- **iPhone 13:** 390x844 (Mobile Safari)
- **Pixel 5:** 393x851 (Mobile Chrome)
- **iPad:** 810x1080 (Tablet)
- **Desktop:** 1280x720 (Chrome, Firefox, Safari)

### Baseline Screenshots
- **102 images** created
- Stored in `visual-tests/visual-regression.spec.ts-snapshots/`
- Named by test + device + platform

## File Structure

```
visual-tests/
├── README.md                              # This file
├── visual-regression.spec.ts              # Main test file
├── helpers.ts                             # Helper functions
└── visual-regression.spec.ts-snapshots/   # Baseline images (102 files)
```

## Documentation

- **Quick Reference:** `VISUAL_TESTING_QUICKSTART.md` - Fast lookup for commands
- **Full Guide:** `VISUAL_TESTING.md` - Complete documentation
- **Examples:** `VISUAL_TESTING_EXAMPLES.md` - Real-world workflows
- **Summary:** `VISUAL_TESTING_SUMMARY.md` - Setup overview

## Common Workflows

### 1. Before Making Changes

```bash
npm run test:visual
```

Ensure all tests pass before starting work.

### 2. After Making Visual Changes

```bash
# Tests will fail (expected)
npm run test:visual

# Review the diffs
npm run test:visual:report

# Update baselines if changes are intentional
npm run test:visual:update
```

### 3. Fixing Mobile Layout Issues

```bash
# Run mobile-only tests
npm run test:visual:mobile

# View report to see the exact issue
npm run test:visual:report

# Fix the CSS/layout

# Update baselines
npm run test:visual:update
```

### 4. Pre-Deployment Checks

```bash
# Run all tests
npm run test:visual

# If any fail, review the report
npm run test:visual:report

# Only deploy if all tests pass or you've updated baselines
```

## Understanding Test Results

### Passing Tests

```
✓ Bottom Navigation Visual Tests (4/4)
  ✓ bottom navigation on /feed - mobile
  ✓ bottom navigation on /search - mobile
  ✓ bottom navigation on /friends - mobile
  ✓ bottom navigation on /profile - mobile
```

### Failing Tests

```
✗ Landing Page Visual Tests (1/3)
  ✗ should match baseline on desktop

    Error: Screenshot comparison failed:

    Baseline: visual-tests/.../landing-desktop.png
    Current:  test-results/.../landing-desktop-actual.png
    Diff:     test-results/.../landing-desktop-diff.png
```

**What to do:**
1. Open HTML report: `npm run test:visual:report`
2. Review the side-by-side comparison
3. Check the diff image (red highlights show differences)
4. Decide:
   - **Intentional change?** → `npm run test:visual:update`
   - **Bug?** → Fix the issue and retest

## Tips & Best Practices

1. **Review diffs before updating** - Don't hide bugs by blindly updating baselines
2. **Commit baselines to git** - Ensures team consistency
3. **Test on mobile viewports** - Catches most layout issues
4. **Use HTML report** - Much easier than CLI output
5. **Run in CI** - Catch issues before deployment

## Troubleshooting

### Tests fail but nothing looks different

- Check for animations (add longer wait time)
- Check for dynamic content (dates, counters)
- Check font loading across browsers

### Baselines don't match across machines

- Commit baselines to version control
- Use CI for consistent environment
- Update baselines on CI if needed

### Too many false positives

- Adjust comparison threshold in tests
- Use masking for dynamic content
- Focus on component-level tests

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

## Support

For detailed information:
- **Quick start:** `VISUAL_TESTING_QUICKSTART.md`
- **Full docs:** `VISUAL_TESTING.md`
- **Examples:** `VISUAL_TESTING_EXAMPLES.md`
- **Playwright:** https://playwright.dev/docs/screenshots

## Status

✅ **Setup Complete**
- Playwright installed
- Tests configured
- Baselines created (102 images)
- Documentation written
- Ready to use!

**Next step:** Run `npm run test:visual` to verify everything works!
