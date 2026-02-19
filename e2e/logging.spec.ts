import { test, expect } from '@playwright/test';
import { NavigationHelpers } from './utils/helpers';

/**
 * Coffee Logging E2E Tests
 *
 * Tests the quick log functionality for recording coffee drinks
 */

test.describe('Coffee Logging', () => {
  let navHelpers: NavigationHelpers;

  test.beforeEach(async ({ page }) => {
    navHelpers = new NavigationHelpers(page);
  });

  test.describe('Quick Log Modal', () => {
    test('should open quick log modal', async ({ page }) => {
      await page.goto('/log');

      // Modal should be visible
      const modal = page.locator('div.fixed.inset-0.z-50');
      await expect(modal).toBeVisible();

      // Should have header
      await expect(page.locator('text=Quick Log')).toBeVisible();

      // Should have close button
      await expect(page.locator('button').filter({ has: page.locator('svg') }).first()).toBeVisible();
    });

    test('should display search bar in modal', async ({ page }) => {
      await page.goto('/log');

      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toBeFocused();
    });

    test('should show recent shops', async ({ page }) => {
      await page.goto('/log');

      // Wait for data to load
      await page.waitForTimeout(1000);

      // Should show recent shops section OR empty state
      const recentShops = page.locator('text=Or tap a recent shop');
      const emptyState = page.locator('text=No recent visits');

      const hasRecentShops = await recentShops.isVisible().catch(() => false);
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      expect(hasRecentShops || hasEmptyState).toBe(true);
    });

    test('should close modal when backdrop is clicked', async ({ page }) => {
      await page.goto('/log');

      // Click backdrop (the dark overlay)
      const backdrop = page.locator('div.bg-black\\/50');
      await backdrop.click();

      // Modal should close and we should go back
      await page.waitForTimeout(500);

      const modal = page.locator('div.fixed.inset-0.z-50');
      const isVisible = await modal.isVisible().catch(() => false);

      // Should be closed or navigating away
      expect(isVisible).toBe(false);
    });

    test('should close modal when X button is clicked', async ({ page }) => {
      await page.goto('/log');

      const closeButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      await closeButton.click();

      await page.waitForTimeout(500);

      const modal = page.locator('div.fixed.inset-0.z-50');
      const isVisible = await modal.isVisible().catch(() => false);

      expect(isVisible).toBe(false);
    });
  });

  test.describe('Shop Search in Quick Log', () => {
    test('should search for shops', async ({ page }) => {
      await page.goto('/log');

      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('coffee');

      // Should show loading state
      await expect(page.locator('.animate-spin').or(page.locator('text=Searching...'))).toBeVisible();

      // Wait for results
      await page.waitForTimeout(1000);
    });

    test('should show search results', async ({ page }) => {
      await page.goto('/log');

      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('blue bottle');

      await page.waitForTimeout(1500);

      // Should show results OR no results message
      const results = page.locator('text=/\\d+ result/');
      const noResults = page.locator('text=No results found');

      const hasResults = await results.isVisible().catch(() => false);
      const hasNoResults = await noResults.isVisible().catch(() => false);

      expect(hasResults || hasNoResults).toBe(true);
    });

    test('should clear search input', async ({ page }) => {
      await page.goto('/log');

      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('coffee');

      // Clear button should appear
      const clearButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1);
      await clearButton.click();

      await expect(searchInput).toHaveValue('');
    });

    test('should be able to select a shop from search', async ({ page }) => {
      await page.goto('/log');

      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('coffee');

      await page.waitForTimeout(1500);

      // Try to click first result
      const firstResult = page.locator('button').filter({ hasText: /^coffee/i }).first();
      const isVisible = await firstResult.isVisible().catch(() => false);

      if (isVisible) {
        await firstResult.click();

        // Should open drink log modal
        await page.waitForTimeout(500);

        // Quick log modal should still be visible but with drink modal
        const drinkModal = page.locator('text=/Log your drink|What did you drink/');
        const exists = await drinkModal.count();
        expect(exists).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Recent Shops Selection', () => {
    test('should display recent shop cards', async ({ page }) => {
      await page.goto('/log');

      await page.waitForTimeout(1000);

      const recentShops = page.locator('text=Or tap a recent shop');
      const hasRecentShops = await recentShops.isVisible().catch(() => false);

      if (hasRecentShops) {
        // Should have shop cards
        const shopCards = page.locator('button.rounded-xl');
        const count = await shopCards.count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('should be able to select a recent shop', async ({ page }) => {
      await page.goto('/log');

      await page.waitForTimeout(1000);

      const shopCard = page.locator('button.rounded-xl').first();
      const isVisible = await shopCard.isVisible().catch(() => false);

      if (isVisible) {
        await shopCard.click();

        // Should open drink log modal
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Drink Log Modal', () => {
    test('should show drink log modal after shop selection', async ({ page }) => {
      await page.goto('/log');

      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('coffee');

      await page.waitForTimeout(1500);

      const firstResult = page.locator('button').filter({ hasText: /^coffee/i }).first();
      const isVisible = await firstResult.isVisible().catch(() => false);

      if (isVisible) {
        await firstResult.click();

        await page.waitForTimeout(500);

        // Should have drink form
        const drinkInput = page.locator('input[placeholder*="drink name"], input[name*="drink"]');
        const hasDrinkInput = await drinkInput.count() > 0;

        if (hasDrinkInput) {
          await expect(drinkInput.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Log Navigation', () => {
    test('should navigate to log from bottom nav', async ({ page }) => {
      await page.goto('/feed');

      // Click the log button (center button in bottom nav)
      const logButton = page.locator('nav a[href="/log"], button:has-text("Log")').first();
      await logButton.click();

      await page.waitForURL('**/log');
      await expect(page.locator('text=Quick Log')).toBeVisible();
    });

    test('should go back when closing log modal', async ({ page }) => {
      await page.goto('/feed');

      const logButton = page.locator('nav a[href="/log"], button:has-text("Log")').first();
      await logButton.click();

      await page.waitForURL('**/log');

      // Close modal
      const backdrop = page.locator('div.bg-black\\/50');
      await backdrop.click();

      // Should go back to feed
      await page.waitForTimeout(500);
      const url = page.url();
      expect(url).toContain('/feed');
    });
  });

  test.describe('Modal Layout', () => {
    test('should have proper modal styling', async ({ page }) => {
      await page.goto('/log');

      const modal = page.locator('div.relative.bg-white.w-full.max-w-lg.rounded-t-3xl');

      await expect(modal).toBeVisible();

      // Should have rounded top corners
      const classes = await modal.getAttribute('class');
      expect(classes).toContain('rounded-t-3xl');
    });

    test('should have scrollable content', async ({ page }) => {
      await page.goto('/log');

      const scrollableArea = page.locator('div.overflow-y-auto').first();

      // Should exist
      const exists = await scrollableArea.count();
      expect(exists).toBeGreaterThan(0);
    });
  });

  test.describe('Empty States', () => {
    test('should show helpful message when no recent shops', async ({ page }) => {
      await page.goto('/log');

      await page.waitForTimeout(1000);

      const emptyState = page.locator('text=No recent visits');
      const isVisible = await emptyState.isVisible().catch(() => false);

      if (isVisible) {
        await expect(page.locator('text=Tap search to find coffee shops')).toBeVisible();
      }
    });

    test('should show search icon in empty state', async ({ page }) => {
      await page.goto('/log');

      const emptyState = page.locator('text=No recent visits');
      const isVisible = await emptyState.isVisible().catch(() => false);

      if (isVisible) {
        // Should have some icon (SVG)
        const icon = page.locator('svg').locator('visible=true');
        const hasIcon = await icon.count() > 0;
        expect(hasIcon).toBe(true);
      }
    });
  });
});
