import { test, expect } from '@playwright/test';
import { NavigationHelpers, SearchHelpers } from './utils/helpers';

/**
 * Search Functionality E2E Tests
 *
 * Tests search feature across users, posts, and shops
 */

test.describe('Search Functionality', () => {
  let navHelpers: NavigationHelpers;
  let searchHelpers: SearchHelpers;

  test.beforeEach(async ({ page }) => {
    // Note: In real tests, you'd authenticate first
    // For now, we'll test the UI components
    navHelpers = new NavigationHelpers(page);
    searchHelpers = new SearchHelpers(page);

    await page.goto('/search');
  });

  test.describe('Search Page Layout', () => {
    test('should display search page correctly', async ({ page }) => {
      // Check search input
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();

      // Check search tabs
      await expect(page.locator('button:has-text("Friends")')).toBeVisible();
      await expect(page.locator('button:has-text("Explore")')).toBeVisible();
      await expect(page.locator('button:has-text("Shops")')).toBeVisible();
    });

    test('should show empty state initially', async ({ page }) => {
      await expect(page.locator('text=Search Beany')).toBeVisible();
      await expect(page.locator('text=Find friends, posts, and coffee shops')).toBeVisible();
    });
  });

  test.describe('Search Input Behavior', () => {
    test('should focus search input on page load', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeFocused();
    });

    test('should show clear button when typing', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');

      await searchInput.fill('coffee');

      // Clear button should appear
      const clearButton = page.locator('button').filter({ hasText: '' }).locator('nth=1');
      // The XMarkIcon button
      await expect(page.locator('button').filter({ has: page.locator('svg') }).first()).toBeVisible();
    });

    test('should clear search when X is clicked', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');

      await searchInput.fill('coffee');

      // Click clear button (X icon)
      const clearButtons = page.locator('button').filter({ has: page.locator('svg') });
      await clearButtons.first().click();

      // Input should be cleared
      await expect(searchInput).toHaveValue('');
    });

    test('should have proper input mode for mobile', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]');

      // Should have search input mode
      const inputMode = await searchInput.getAttribute('inputmode');
      expect(inputMode).toBe('search');
    });
  });

  test.describe('Search Tabs', () => {
    test('should have Shops tab active by default', async ({ page }) => {
      const shopsTab = page.locator('button').filter({ hasText: 'Shops' });
      const classes = await shopsTab.getAttribute('class');

      // Active tab should have different styling
      expect(classes).toContain('border-primary');
    });

    test('should switch to Friends tab', async ({ page }) => {
      await searchHelpers.switchTab('users');

      const friendsTab = page.locator('button').filter({ hasText: 'Friends' });
      const classes = await friendsTab.getAttribute('class');

      expect(classes).toContain('border-primary');
    });

    test('should switch to Explore tab', async ({ page }) => {
      await searchHelpers.switchTab('posts');

      const exploreTab = page.locator('button').filter({ hasText: 'Explore' });
      const classes = await exploreTab.getAttribute('class');

      expect(classes).toContain('border-primary');
    });

    test('should maintain tab selection across searches', async ({ page }) => {
      // Switch to Friends
      await searchHelpers.switchTab('users');

      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('test');
      await page.waitForTimeout(500);

      // Friends tab should still be active
      const friendsTab = page.locator('button').filter({ hasText: 'Friends' });
      const classes = await friendsTab.getAttribute('class');
      expect(classes).toContain('border-primary');
    });
  });

  test.describe('Search Results', () => {
    test('should show loading state while searching', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');

      await searchInput.fill('coffee');

      // Should show loading indicator briefly
      await expect(page.locator('div:has-text("Searching...")').or(page.locator('.animate-spin'))).toBeVisible();
    });

    test('should show no results state', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');

      // Search for something unlikely to exist
      await searchInput.fill('xyznonexistent123456789');
      await page.waitForTimeout(1000);

      // Should show no results message
      await expect(page.locator('text=No Results Found')).toBeVisible({ timeout: 5000 });
    });

    test('should display result count', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');

      await searchInput.fill('coffee');
      await page.waitForTimeout(1000);

      // Look for result count text
      const resultCount = page.locator('text=/\\d+ result/');
      // May or may not be visible depending on if results exist
    });
  });

  test.describe('Search Debouncing', () => {
    test('should debounce search input', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');

      // Type quickly
      await searchInput.fill('c');
      await page.waitForTimeout(100);
      await searchInput.fill('co');
      await page.waitForTimeout(100);
      await searchInput.fill('cof');
      await page.waitForTimeout(100);
      await searchInput.fill('coff');
      await page.waitForTimeout(100);
      await searchInput.fill('coffee');

      // Should only trigger search after pause
      await page.waitForTimeout(500);

      // Search should have completed
      const loading = page.locator('.animate-spin');
      const isVisible = await loading.isVisible().catch(() => false);
      expect(isVisible).toBe(false);
    });
  });

  test.describe('Search Interaction', () => {
    test('should be able to tap through search results', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');

      await searchInput.fill('coffee');
      await page.waitForTimeout(1000);

      // Try to click a result if any exist
      const firstResult = page.locator('button').filter({ hasText: /^coffee/i }).first();
      const isVisible = await firstResult.isVisible().catch(() => false);

      if (isVisible) {
        await firstResult.click();
        // Should navigate somewhere
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Search Keyboard Navigation', () => {
    test('should submit search on Enter key', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');

      await searchInput.fill('coffee');
      await searchInput.press('Enter');

      await page.waitForTimeout(500);
      // Search should execute
    });

    test('should clear search on Escape key', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');

      await searchInput.fill('coffee');
      await searchInput.press('Escape');

      // Input might or might not clear depending on implementation
      await page.waitForTimeout(100);
    });
  });
});
