import { Page, Locator } from '@playwright/test';

/**
 * Test Helper Functions
 *
 * Reusable utilities for common test operations
 */

export class AuthHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to sign up page
   */
  async gotoSignUp() {
    await this.page.goto('/');
    await this.page.click('text=Sign Up');
    await this.page.waitForURL('**/auth/signup');
  }

  /**
   * Navigate to sign in page
   */
  async gotoSignIn() {
    await this.page.goto('/');
    await this.page.click('text=Log In');
    await this.page.waitForURL('**/auth/signin');
  }

  /**
   * Fill and submit sign up form
   */
  async signUp(email: string, username: string, password: string, confirmPassword: string) {
    await this.page.fill('#email', email);
    await this.page.fill('#username', username);
    await this.page.fill('#password', password);
    await this.page.fill('#confirmPassword', confirmPassword);
    await this.page.click('button[type="submit"]');
  }

  /**
   * Fill and submit sign in form
   */
  async signIn(email: string, password: string) {
    await this.page.fill('#email', email);
    await this.page.fill('#password', password);
    await this.page.click('button[type="submit"]');
  }

  /**
   * Wait for successful authentication redirect
   */
  async waitForAuthRedirect() {
    await this.page.waitForURL('**/feed', { timeout: 10000 });
  }
}

export class NavigationHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate using bottom navigation
   */
  async navigateTo(tab: 'feed' | 'search' | 'log' | 'friends' | 'profile') {
    const tabMap = {
      feed: 'Feed',
      search: 'Search',
      log: 'Log',
      friends: 'Friends',
      profile: 'Profile',
    };

    await this.page.click(`nav:has-text("${tabMap[tab]}")`);
    await this.page.waitForURL(`**/${tab === 'log' ? 'log' : tab}`);
  }

  /**
   * Verify bottom navigation is visible
   */
  async verifyBottomNavVisible() {
    const nav = this.page.locator('nav.fixed.bottom-0');
    await nav.waitFor({ state: 'visible' });
    return nav;
  }

  /**
   * Verify active tab
   */
  async verifyActiveTab(tab: 'feed' | 'search' | 'log' | 'friends' | 'profile') {
    const tabMap = {
      feed: 'Feed',
      search: 'Search',
      log: 'Log',
      friends: 'Friends',
      profile: 'Profile',
    };

    const activeTab = this.page.locator(`nav:has-text("${tabMap[tab]}")`);
    return await activeTab.isVisible();
  }
}

export class SearchHelpers {
  constructor(private page: Page) {}

  /**
   * Perform a search
   */
  async search(query: string) {
    await this.page.fill('input[placeholder*="Search"]', query);
    await this.page.waitForTimeout(500); // Wait for debounced search
  }

  /**
   * Clear search
   */
  async clearSearch() {
    const clearButton = this.page.locator('button:has([data-testid="clear-search"])').first();
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }
  }

  /**
   * Switch search tab
   */
  async switchTab(tab: 'users' | 'posts' | 'shops') {
    await this.page.click(`button:has-text("${tab === 'users' ? 'Friends' : tab === 'posts' ? 'Explore' : 'Shops'}")`);
    await this.page.waitForTimeout(300);
  }
}

export class FeedHelpers {
  constructor(private page: Page) {}

  /**
   * Switch between Friends and Explore tabs
   */
  async switchTab(tab: 'friends' | 'explore') {
    await this.page.click(`button:has-text("${tab === 'friends' ? 'Friends' : 'Explore'}")`);
    await this.page.waitForTimeout(300);
  }

  /**
   * Like a post
   */
  async likePost(postIndex: number = 0) {
    const likeButtons = this.page.locator('button[aria-label*="like"], button:has([data-testid="like-icon"])');
    await likeButtons.nth(postIndex).click();
  }

  /**
   * Pull to refresh
   */
  async pullToRefresh() {
    const feedContainer = this.page.locator('div.min-h-screen').first();
    await feedContainer.evaluate((el) => {
      el.scrollTo(0, 0);
    });

    const box = await feedContainer.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + 10);
      await this.page.mouse.down();
      await this.page.mouse.move(box.x + box.width / 2, box.y + 200, { steps: 10 });
      await this.page.mouse.up();
    }

    await this.page.waitForTimeout(1000);
  }
}

export class ProfileHelpers {
  constructor(private page: Page) {}

  /**
   * Switch profile tab
   */
  async switchTab(tab: 'posts' | 'visits' | 'favorites') {
    await this.page.click(`button:has-text("${tab.charAt(0).toUpperCase() + tab.slice(1)}")`);
    await this.page.waitForTimeout(300);
  }

  /**
   * Navigate to settings
   */
  async goToSettings() {
    await this.page.click('button:has([data-testid="edit-profile"])');
    await this.page.waitForURL('**/settings');
  }
}

/**
 * Wait for element to be stable (not moving/animating)
 */
export async function waitForStable(page: Page, locator: string, timeout = 5000) {
  const element = page.locator(locator);
  await element.waitFor({ state: 'visible', timeout });

  const box1 = await element.boundingBox();
  await page.waitForTimeout(100);
  const box2 = await element.boundingBox();

  if (!box1 || !box2) return;

  let stable = false;
  let attempts = 0;
  const maxAttempts = timeout / 100;

  while (!stable && attempts < maxAttempts) {
    const b1 = await element.boundingBox();
    await page.waitForTimeout(100);
    const b2 = await element.boundingBox();

    if (b1 && b2) {
      stable = Math.abs(b1.x - b2.x) < 1 && Math.abs(b1.y - b2.y) < 1;
    }
    attempts++;
  }
}

/**
 * Take screenshot on failure with descriptive name
 */
export async function captureFailure(page: Page, testName: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/failures/${testName}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Check if element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector).first();
  const box = await element.boundingBox();
  if (!box) return false;

  const viewportSize = page.viewportSize();
  if (!viewportSize) return false;

  return (
    box.y >= 0 &&
    box.x >= 0 &&
    box.y + box.height <= viewportSize.height &&
    box.x + box.width <= viewportSize.width
  );
}
