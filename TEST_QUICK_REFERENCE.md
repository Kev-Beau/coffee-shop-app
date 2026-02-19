# Playwright Test Quick Reference

## Essential Commands

```bash
# Verify setup
npm run verify:tests

# Run bottom nav tests (our focus)
npm run test:bottom-nav

# Run all tests
npm test

# Run with visible browser
npm run test:headed

# Debug mode
npm run test:debug

# View test report
npx playwright show-report
```

## Device-Specific Commands

```bash
# iPhone Safari
npm run test:bottom-nav:iphone

# Android Chrome
npm run test:bottom-nav:android

# All mobile devices
npm run test:mobile

# All browsers and devices
npm run test:all-browsers
```

## What Tests Cover

✅ Bottom nav visible initially
✅ Nav hides when input focused (keyboard appears)
✅ Nav shows when input blurred (keyboard dismissed)
✅ All navigation links work
✅ Proper mobile styling and positioning
✅ iOS Safari specific behavior
✅ Accessibility features

## File Locations

```
e2e/
├── bottom-navigation.spec.ts    # Main tests
├── test-utils.ts                # Helper functions
└── README.md                    # Full documentation

playwright.config.ts             # Configuration
TESTING.md                       # Quick start guide
PLAYWRIGHT_SETUP_SUMMARY.md      # Complete setup details
```

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Tests timeout | Run with `npm run test:headed` to see what's happening |
| Element not found | Check selectors; use `npx playwright codegen` |
| Slow tests | Run specific suite: `npm run test:bottom-nav:iphone` |
| Flaky tests | Increase wait times; check for race conditions |

## Test Workflow

1. Make changes to code
2. Run relevant tests: `npm run test:bottom-nav`
3. Check results
4. Fix any failures
5. Push code (CI runs automatically)

## CI/CD

Tests run automatically on:
- Push to main/develop
- Pull requests
- Daily at 2 AM UTC

## Getting Help

- Read: `e2e/README.md` (detailed guide)
- Read: `TESTING.md` (quick start)
- Run: `npm run verify:tests` (check setup)
- Visit: https://playwright.dev (official docs)
