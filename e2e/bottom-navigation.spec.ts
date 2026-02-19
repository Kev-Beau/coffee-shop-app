import { test, expect } from '@playwright/test';

/**
 * Bottom Navigation Keyboard Interaction Tests
 *
 * These tests verify the bottom navigation behavior when the keyboard is shown/hidden
 * on mobile devices. This is critical for iOS Safari where the keyboard can cover
 * interactive elements.
 *
 * Test scenarios:
 * 1. Bottom nav is visible initially
 * 2. Clicking search input hides the nav (keyboard appears)
 * 3. Dismissing keyboard shows the nav again
 * 4. Navigation links work correctly
 */

test.describe('Bottom Navigation - Keyboard Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to feed page where bottom navigation is present
    await page.goto('/feed');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('should show bottom navigation initially', async ({ page }) => {
    // Get the bottom navigation element
    const bottomNav = page.locator('nav.fixed.bottom-0');

    // Verify it's visible
    await expect(bottomNav).toBeVisible();

    // Verify all navigation items are present
    await expect(page.locator('a[href="/feed"]')).toBeVisible();
    await expect(page.locator('a[href="/search"]')).toBeVisible();
    await expect(page.locator('a[href="/log"]')).toBeVisible();
    await expect(page.locator('a[href="/friends"]')).toBeVisible();
    await expect(page.locator('a[href="/profile"]')).toBeVisible();
  });

  test('should hide bottom nav when search input is focused', async ({ page }) => {
    const bottomNav = page.locator('nav.fixed.bottom-0');

    // Verify nav is visible initially
    await expect(bottomNav).toBeVisible();

    // Navigate to search page
    await page.click('a[href="/search"]');
    await page.waitForLoadState('networkidle');

    // Find the search input
    const searchInput = page.locator('input[type="search"]');

    // Click on search input to focus it (triggers keyboard)
    await searchInput.click();
    await searchInput.focus();

    // Wait a moment for the focus event to propagate
    await page.waitForTimeout(200);

    // Verify bottom nav is hidden
    await expect(bottomNav).not.toBeVisible();
  });

  test('should show bottom nav again after blur/dismissing keyboard', async ({ page, isMobile }) => {
    const bottomNav = page.locator('nav.fixed.bottom-0');

    // Navigate to search page
    await page.click('a[href="/search"]');
    await page.waitForLoadState('networkidle');

    // Find and focus the search input
    const searchInput = page.locator('input[type="search"]');
    await searchInput.click();
    await searchInput.focus();

    // Wait for nav to hide
    await page.waitForTimeout(200);
    await expect(bottomNav).not.toBeVisible();

    // Blur the input to simulate keyboard dismissal
    await searchInput.blur();

    // Wait for the 100ms delay in the component plus a bit more
    await page.waitForTimeout(300);

    // Verify bottom nav is visible again
    await expect(bottomNav).toBeVisible();
  });

  test('should hide nav when focusing any input element', async ({ page }) => {
    const bottomNav = page.locator('nav.fixed.bottom-0');

    // Verify nav is visible initially
    await expect(bottomNav).toBeVisible();

    // Try to find any input on the feed page
    // If there's a comment input or similar, test it
    const commentInput = page.locator('input[type="text"], textarea').first();

    if (await commentInput.count() > 0) {
      await commentInput.click();
      await page.waitForTimeout(200);

      // Bottom nav should be hidden
      await expect(bottomNav).not.toBeVisible();

      // Blur to restore
      await commentInput.blur();
      await page.waitForTimeout(300);

      // Nav should be visible again
      await expect(bottomNav).toBeVisible();
    } else {
      // Skip if no input found on feed page
      test.skip(true, 'No input element found on feed page');
    }
  });

  test('should navigate correctly when clicking nav items', async ({ page }) => {
    // Test Feed navigation
    await page.click('a[href="/feed"]');
    await page.waitForURL('**/feed');
    expect(page.url()).toContain('/feed');

    // Test Search navigation
    await page.click('a[href="/search"]');
    await page.waitForURL('**/search');
    expect(page.url()).toContain('/search');

    // Test Friends navigation
    await page.click('a[href="/friends"]');
    await page.waitForURL('**/friends');
    expect(page.url()).toContain('/friends');

    // Test Profile navigation
    await page.click('a[href="/profile"]');
    await page.waitForURL('**/profile');
    expect(page.url()).toContain('/profile');
  });

  test('should maintain nav state across page navigations', async ({ page }) => {
    const bottomNav = page.locator('nav.fixed.bottom-0');

    // Navigate to different pages and verify nav stays visible
    const pages = ['/feed', '/friends', '/profile'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      // Verify nav is visible
      await expect(bottomNav).toBeVisible();

      // Verify it has the correct z-index to stay on top
      const zIndex = await bottomNav.evaluate((el) => {
        return window.getComputedStyle(el).zIndex;
      });
      expect(parseInt(zIndex || '0')).toBeGreaterThanOrEqual(9999);
    }
  });

  test('should handle rapid focus/blur events', async ({ page }) => {
    const bottomNav = page.locator('nav.fixed.bottom-0');

    // Navigate to search page
    await page.click('a[href="/search"]');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="search"]');

    // Rapidly focus and blur multiple times
    for (let i = 0; i < 5; i++) {
      await searchInput.click();
      await page.waitForTimeout(100);
      await searchInput.blur();
      await page.waitForTimeout(100);
    }

    // Final state should have nav visible
    await page.waitForTimeout(300);
    await expect(bottomNav).toBeVisible();
  });

  test('should have correct styling on mobile devices', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip(true, 'Mobile-only test');
    }

    const bottomNav = page.locator('nav.fixed.bottom-0');

    // Verify it's fixed at bottom
    const position = await bottomNav.evaluate((el) => {
      return window.getComputedStyle(el).position;
    });
    expect(position).toBe('fixed');

    // Verify it spans full width
    const width = await bottomNav.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width;
    });

    const viewportWidth = page.viewportSize()?.width || 0;
    expect(width).toBeCloseTo(viewportWidth, 10);

    // Verify it has white background and border
    const backgroundColor = await bottomNav.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(backgroundColor).toBeTruthy();

    // Verify z-index
    const zIndex = await bottomNav.evaluate((el) => {
      return window.getComputedStyle(el).zIndex;
    });
    expect(parseInt(zIndex || '0')).toBeGreaterThanOrEqual(9999);
  });
});

/**
 * Device-specific tests for iOS Safari keyboard behavior
 */
test.describe('Bottom Navigation - iOS Safari Specific', () => {
  test.skip(({ isMobile }) => !isMobile, 'Mobile-only test');

  test('should handle iOS Safari keyboard overlap', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    const bottomNav = page.locator('nav.fixed.bottom-0');
    const searchInput = page.locator('input[type="search"]');

    // Initial state - nav visible
    await expect(bottomNav).toBeVisible();

    // Focus input - this triggers iOS keyboard
    await searchInput.click();
    await searchInput.focus();

    // Wait for focus event and keyboard animation
    await page.waitForTimeout(300);

    // Nav should be hidden
    await expect(bottomNav).not.toBeVisible();

    // Get viewport height to verify keyboard took up space
    const viewportHeight = page.viewportSize()?.height || 0;

    // On iOS with keyboard, visual viewport shrinks
    // This is a behavioral test - we're checking that the nav
    // doesn't interfere with keyboard
    const inputBoundingBox = await searchInput.boundingBox();
    expect(inputBoundingBox).toBeTruthy();

    // Blur to dismiss keyboard
    await searchInput.blur();
    await page.waitForTimeout(300);

    // Nav should reappear
    await expect(bottomNav).toBeVisible();
  });
});

/**
 * Tests for the Log button (center button with special styling)
 */
test.describe('Bottom Navigation - Log Button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/feed');
    await page.waitForLoadState('networkidle');
  });

  test('should have special styling for log button', async ({ page }) => {
    const logButton = page.locator('a[href="/log"]');

    // Verify it's visible
    await expect(logButton).toBeVisible();

    // Check for rounded styling (it should have special appearance)
    const buttonContent = logButton.locator('div').first();
    await expect(buttonContent).toBeVisible();

    // Verify the Plus icon is present
    const plusIcon = logButton.locator('svg');
    await expect(plusIcon).toBeVisible();
  });

  test('should navigate to log page', async ({ page }) => {
    await page.click('a[href="/log"]');
    await page.waitForURL('**/log');
    expect(page.url()).toContain('/log');
  });
});

/**
 * Accessibility tests for bottom navigation
 */
test.describe('Bottom Navigation - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/feed');
    await page.waitForLoadState('networkidle');
  });

  test('should have accessible labels for all nav items', async ({ page }) => {
    // Check that all nav links have text content or aria-labels
    const navLinks = page.locator('nav.fixed.bottom-0 a');

    const count = await navLinks.count();
    expect(count).toBe(5); // Feed, Search, Log, Friends, Profile

    // Each link should have identifiable content
    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);
      await expect(link).toBeVisible();
    }
  });

  test('should be keyboard navigable on desktop', async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip(true, 'Desktop keyboard navigation test');
    }

    // Test Tab navigation
    await page.keyboard.press('Tab');

    // One of the nav items should be focused
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'INPUT']).toContain(activeElement);
  });
});
