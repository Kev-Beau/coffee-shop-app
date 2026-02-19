import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for Beany App
 *
 * These tests capture screenshots of key pages and compare them against baselines.
 * Run tests: npx playwright test
 * Update baselines: npx playwright test --update-snapshots
 * View report: npx playwright show-report
 *
 * Testing Strategy:
 * - Desktop: 1280x720 (standard desktop)
 * - Mobile: 390x844 (iPhone 13)
 * - Tablet: 810x1080 (iPad)
 */

test.describe('Landing Page Visual Tests', () => {
  test('should match baseline on desktop', async ({ page }) => {
    await page.goto('/');

    // Wait for animations to complete
    await page.waitForTimeout(1000);

    // Take full page screenshot
    await expect(page).toHaveScreenshot('landing-desktop.png', {
      fullPage: true,
      animations: 'allowed',
    });
  });

  test('should match baseline on mobile', async ({ page }) => {
    // Mobile viewport is set in playwright.config.ts
    await page.goto('/');

    // Wait for animations to complete
    await page.waitForTimeout(1000);

    // Take full page screenshot
    await expect(page).toHaveScreenshot('landing-mobile.png', {
      fullPage: true,
      animations: 'allowed',
    });
  });

  test('should match hero section on desktop', async ({ page }) => {
    await page.goto('/');

    // Wait for page load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Screenshot just the hero section
    const hero = page.locator('section').first();
    await expect(hero).toHaveScreenshot('landing-hero-desktop.png');
  });
});

test.describe('Feed Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to feed page (will redirect to signin if not authenticated)
    await page.goto('/feed');
    // Wait for page to load or redirect
    await page.waitForTimeout(1000);
  });

  test('should match baseline or show signin on mobile', async ({ page }) => {
    // Mobile viewport
    await page.waitForLoadState('networkidle');

    // Either shows feed or redirects to signin
    await expect(page).toHaveScreenshot('feed-or-signin-mobile.png', {
      fullPage: true,
    });
  });

  test('should match baseline or show signin on desktop', async ({ page }) => {
    // Desktop viewport
    await page.waitForLoadState('networkidle');

    // Either shows feed or redirects to signin
    await expect(page).toHaveScreenshot('feed-or-signin-desktop.png', {
      fullPage: true,
    });
  });
});

test.describe('Authentication Pages Visual Tests', () => {
  test('signin page should match baseline on mobile', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('signin-mobile.png', {
      fullPage: true,
    });
  });

  test('signin page should match baseline on desktop', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('signin-desktop.png', {
      fullPage: true,
    });
  });

  test('signup page should match baseline on mobile', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('signup-mobile.png', {
      fullPage: true,
    });
  });

  test('signup page should match baseline on desktop', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('signup-desktop.png', {
      fullPage: true,
    });
  });
});

test.describe('Shops Page Visual Tests', () => {
  test('shops listing should match baseline on mobile', async ({ page }) => {
    await page.goto('/shops');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('shops-mobile.png', {
      fullPage: true,
    });
  });

  test('shops listing should match baseline on desktop', async ({ page }) => {
    await page.goto('/shops');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('shops-desktop.png', {
      fullPage: true,
    });
  });
});

test.describe('Profile Page Visual Tests', () => {
  test('profile page should match baseline or redirect on mobile', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('profile-or-redirect-mobile.png', {
      fullPage: true,
    });
  });

  test('profile page should match baseline or redirect on desktop', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('profile-or-redirect-desktop.png', {
      fullPage: true,
    });
  });
});

test.describe('Search Page Visual Tests', () => {
  test('search page should match baseline on mobile', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('search-mobile.png', {
      fullPage: true,
    });
  });

  test('search page should match baseline on desktop', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('search-desktop.png', {
      fullPage: true,
    });
  });
});

test.describe('Bottom Navigation Visual Tests', () => {
  const paths = ['/feed', '/search', '/friends', '/profile'];

  paths.forEach((path) => {
    test(`bottom navigation on ${path} - mobile`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Focus on the bottom navigation component
      const bottomNav = page.locator('nav.fixed.bottom-0');
      await expect(bottomNav).toBeVisible();

      // Screenshot the bottom navigation
      await expect(bottomNav).toHaveScreenshot(`bottom-nav-${path.replace('/', '-')}-mobile.png`);
    });
  });
});

test.describe('Layout Tests', () => {
  test('should not have horizontal overflow on mobile', async ({ page }) => {
    await page.goto('/');

    // Get page dimensions
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width || 0;

    // Body should not be wider than viewport
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('should not have horizontal overflow on desktop', async ({ page }) => {
    await page.goto('/shops');

    // Get page dimensions
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width || 0;

    // Body should not be wider than viewport
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });
});
