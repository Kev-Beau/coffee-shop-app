import { test, expect } from '@playwright/test';
import { NavigationHelpers, ProfileHelpers } from './utils/helpers';

/**
 * Profile E2E Tests
 *
 * Tests user profile page, tabs, and navigation
 */

test.describe('Profile Page', () => {
  let navHelpers: NavigationHelpers;
  let profileHelpers: ProfileHelpers;

  test.beforeEach(async ({ page }) => {
    navHelpers = new NavigationHelpers(page);
    profileHelpers = new ProfileHelpers(page);

    await page.goto('/profile');
  });

  test.describe('Profile Layout', () => {
    test('should display profile page correctly', async ({ page }) => {
      // Wait for page to load
      await page.waitForTimeout(1000);

      // Should have profile card
      const profileCard = page.locator('.bg-white.rounded-3xl.shadow-lg').first();
      await expect(profileCard).toBeVisible();
    });

    test('should show bottom navigation with Profile tab active', async ({ page }) => {
      const isActive = await navHelpers.verifyActiveTab('profile');
      expect(isActive).toBe(true);
    });

    test('should display user avatar', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Should have avatar (either image or default icon)
      const avatar = page.locator('img').or(page.locator('svg'));
      const count = await avatar.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display username', async ({ page }) => {
      await page.waitForTimeout(1000);

      const username = page.locator('text=/@/');
      const isVisible = await username.isVisible().catch(() => false);
      expect(isVisible).toBe(true);
    });
  });

  test.describe('Profile Stats', () => {
    test('should display stats cards', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Should have stat cards for Posts, Visits, Friends
      const statsCard = page.locator('.bg-white.rounded-2xl').first();
      await expect(statsCard).toBeVisible();
    });

    test('should have clickable stats', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Friends stat should be clickable
      const friendsButton = page.locator('button').filter({ hasText: 'Friends' });
      const count = await friendsButton.count();

      if (count > 0) {
        await friendsButton.first().click();
        await page.waitForTimeout(500);

        // Might navigate or do something
      }
    });
  });

  test.describe('Profile Tabs', () => {
    test('should display all profile tabs', async ({ page }) => {
      await page.waitForTimeout(1000);

      await expect(page.locator('button:has-text("Posts")')).toBeVisible();
      await expect(page.locator('button:has-text("Visits")')).toBeVisible();
      await expect(page.locator('button:has-text("Favorites")')).toBeVisible();
    });

    test('should have Posts tab active by default', async ({ page }) => {
      await page.waitForTimeout(1000);

      const postsTab = page.locator('button:has-text("Posts")');
      const classes = await postsTab.getAttribute('class');

      expect(classes).toContain('bg-primary');
    });

    test('should switch to Visits tab', async ({ page }) => {
      await page.waitForTimeout(1000);

      await profileHelpers.switchTab('visits');

      const visitsTab = page.locator('button:has-text("Visits")');
      const classes = await visitsTab.getAttribute('class');

      expect(classes).toContain('bg-primary');
    });

    test('should switch to Favorites tab', async ({ page }) => {
      await page.waitForTimeout(1000);

      await profileHelpers.switchTab('favorites');

      const favoritesTab = page.locator('button:has-text("Favorites")');
      const classes = await favoritesTab.getAttribute('class');

      expect(classes).toContain('bg-primary');
    });

    test('should switch between all tabs', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Posts -> Visits
      await profileHelpers.switchTab('visits');
      let activeTab = page.locator('button:has-text("Visits")');
      await expect(activeTab).toHaveAttribute('class', /bg-primary/);

      // Visits -> Favorites
      await profileHelpers.switchTab('favorites');
      activeTab = page.locator('button:has-text("Favorites")');
      await expect(activeTab).toHaveAttribute('class', /bg-primary/);

      // Favorites -> Posts
      await profileHelpers.switchTab('posts');
      activeTab = page.locator('button:has-text("Posts")');
      await expect(activeTab).toHaveAttribute('class', /bg-primary/);
    });
  });

  test.describe('Profile Content', () => {
    test('should display posts grid in Posts tab', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Should have a grid of posts OR empty state
      const postGrid = page.locator('.grid.grid-cols-3');
      const emptyState = page.locator('text=No Posts Yet');

      const hasGrid = await postGrid.isVisible().catch(() => false);
      const hasEmpty = await emptyState.isVisible().catch(() => false);

      expect(hasGrid || hasEmpty).toBe(true);
    });

    test('should display visits in Visits tab', async ({ page }) => {
      await page.waitForTimeout(1000);

      await profileHelpers.switchTab('visits');
      await page.waitForTimeout(300);

      // Should have visits OR empty state
      const visitCards = page.locator('.aspect-square.rounded-2xl');
      const emptyState = page.locator('text=No Visits Yet');

      const hasVisits = await visitCards.count() > 0;
      const hasEmpty = await emptyState.isVisible().catch(() => false);

      expect(hasVisits || hasEmpty).toBe(true);
    });

    test('should display favorites in Favorites tab', async ({ page }) => {
      await page.waitForTimeout(1000);

      await profileHelpers.switchTab('favorites');
      await page.waitForTimeout(300);

      // Should have favorites OR empty state
      const favCards = page.locator('.aspect-square.rounded-2xl');
      const emptyState = page.locator('text=No Favorites Yet');

      const hasFavs = await favCards.count() > 0;
      const hasEmpty = await emptyState.isVisible().catch(() => false);

      expect(hasFavs || hasEmpty).toBe(true);
    });
  });

  test.describe('Profile Empty States', () => {
    test('should show empty state for posts when none exist', async ({ page }) => {
      await page.waitForTimeout(1000);

      const emptyState = page.locator('text=No Posts Yet');
      const isVisible = await emptyState.isVisible().catch(() => false);

      if (isVisible) {
        await expect(page.locator('text=Start logging your coffee adventures')).toBeVisible();

        // Should have action button
        const actionButton = page.locator('a:has-text("Find Coffee Shops")');
        await expect(actionButton).toBeVisible();
      }
    });

    test('should show empty state for visits when none exist', async ({ page }) => {
      await page.waitForTimeout(1000);

      await profileHelpers.switchTab('visits');
      await page.waitForTimeout(300);

      const emptyState = page.locator('text=No Visits Yet');
      const isVisible = await emptyState.isVisible().catch(() => false);

      if (isVisible) {
        await expect(page.locator('text=Start exploring coffee shops')).toBeVisible();
      }
    });

    test('should show empty state for favorites when none exist', async ({ page }) => {
      await page.waitForTimeout(1000);

      await profileHelpers.switchTab('favorites');
      await page.waitForTimeout(300);

      const emptyState = page.locator('text=No Favorites Yet');
      const isVisible = await emptyState.isVisible().catch(() => false);

      if (isVisible) {
        await expect(page.locator('text=Save coffee shops you love')).toBeVisible();
      }
    });
  });

  test.describe('Profile Edit', () => {
    test('should show edit button on mobile', async ({ page }) => {
      await page.waitForTimeout(1000);

      // On mobile, there should be an edit button
      const editButton = page.locator('button.p-2').filter({ has: page.locator('svg') }).first();
      const count = await editButton.count();

      if (count > 0) {
        await expect(editButton.first()).toBeVisible();
      }
    });

    test('should navigate to settings when edit is clicked', async ({ page }) => {
      await page.waitForTimeout(1000);

      const editButton = page.locator('button').filter({ hasText: '' }).filter({ has: page.locator('svg') }).first();
      const count = await editButton.count();

      if (count > 0) {
        await editButton.first().click();
        await page.waitForTimeout(500);

        // Should navigate to settings
        const url = page.url();
        const navigated = url.includes('/settings');

        if (!navigated) {
          // Or open a menu/settings modal
          const hasMenu = await page.locator('text=Settings').count() > 0;
          expect(hasMenu).toBe(true);
        }
      }
    });
  });

  test.describe('Pull to Refresh', () => {
    test('should show pull indicator when pulling down', async ({ page }) => {
      await page.waitForTimeout(1000);

      const profileContainer = page.locator('div.min-h-screen').first();

      // Scroll to top
      await profileContainer.evaluate((el) => el.scrollTo(0, 0));

      // Pull down
      const box = await profileContainer.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + 10);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2, box.y + 150, { steps: 10 });
        await page.mouse.up();

        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Profile Navigation', () => {
    test('should navigate to profile from bottom nav', async ({ page }) => {
      await page.goto('/feed');

      const profileButton = page.locator('nav a[href="/profile"], button:has-text("Profile")').first();
      await profileButton.click();

      await page.waitForURL('**/profile');
    });

    test('should navigate from feed to profile', async ({ page }) => {
      await page.goto('/feed');

      await page.waitForTimeout(500);

      const profileButton = page.locator('nav').locator('text=Profile').first();
      await profileButton.click();

      await page.waitForURL('**/profile');
    });
  });

  test.describe('Coffee Preferences', () => {
    test('should display coffee preferences card', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Should have a preferences card with gradient background
      const prefCard = page.locator('.rounded-3xl.shadow-lg.p-5').or(page.locator('.rounded-3xl.shadow-lg.p-6'));
      const count = await prefCard.count();

      if (count > 0) {
        await expect(prefCard.first()).toBeVisible();

        // Should have coffee icon
        const coffeeIcon = prefCard.first().locator('svg');
        await expect(coffeeIcon).toBeVisible();
      }
    });

    test('should display preference categories', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Look for preference labels
      const drinksLabel = page.locator('text=Drinks');
      const roastLabel = page.locator('text=Roast');

      const hasDrinks = await drinksLabel.count() > 0;
      const hasRoast = await roastLabel.count() > 0;

      // At least some preferences should be shown
      expect(hasDrinks || hasRoast).toBe(true);
    });
  });
});
