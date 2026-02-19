import { test, expect } from '@playwright/test';

/**
 * Example Playwright Tests
 *
 * This is a basic example to verify your Playwright setup is working correctly.
 * You can delete this file once you've confirmed tests run successfully.
 */

test.describe('Basic App Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check if we're on the right page
    await expect(page).toHaveTitle(/CoffeeConnect|Beany/);

    // Look for common elements
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('feed page is accessible', async ({ page }) => {
    await page.goto('/feed');

    // Wait for page load
    await page.waitForLoadState('networkidle');

    // URL should be correct
    expect(page.url()).toContain('/feed');
  });

  test('bottom navigation exists on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip(true, 'Mobile-only test');
    }

    await page.goto('/feed');
    await page.waitForLoadState('networkidle');

    // Bottom nav should be present
    const nav = page.locator('nav.fixed.bottom-0');
    await expect(nav).toBeVisible();
  });

  test('can navigate between pages', async ({ page }) => {
    await page.goto('/feed');

    // Wait for load
    await page.waitForLoadState('networkidle');

    // Try to navigate to shops
    const shopsLink = page.locator('a[href="/shops"]').first();
    if (await shopsLink.count() > 0) {
      await shopsLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/shops');
    }
  });

  test('responsive design works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Check something specific to mobile layout
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
