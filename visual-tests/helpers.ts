import { Page, expect } from '@playwright/test';

/**
 * Helper functions for visual regression testing
 */

/**
 * Wait for all animations to complete
 */
export async function waitForAnimations(page: Page): Promise<void> {
  await page.waitForTimeout(500);
}

/**
 * Wait for images to load
 */
export async function waitForImages(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.every(img => img.complete);
  });
}

/**
 * Wait for fonts to load
 */
export async function waitForFonts(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
}

/**
 * Wait for page to fully stabilize (animations, images, fonts)
 */
export async function waitForPageStable(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await waitForAnimations(page);
  await waitForImages(page);
  await waitForFonts(page);
}

/**
 * Set up authenticated session for testing
 * Note: This is a placeholder - you'll need to implement actual auth
 */
export async function setupAuth(page: Page): Promise<void> {
  // TODO: Implement actual authentication setup
  // This might involve:
  // 1. Creating a test user in Supabase
  // 2. Storing session tokens
  // 3. Setting cookies/localStorage

  // For now, we'll just visit the signin page
  await page.goto('/auth/signin');
  await waitForPageStable(page);
}

/**
 * Take a screenshot with consistent settings
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  options: {
    fullPage?: boolean;
    clip?: { x: number; y: number; width: number; height: number };
  } = {}
): Promise<void> {
  await expect(page).toHaveScreenshot(name, {
    fullPage: options.fullPage ?? false,
    clip: options.clip,
    animations: 'allowed',
  });
}

/**
 * Mock data helpers for consistent testing
 */
export const mockData = {
  user: {
    email: 'test@example.com',
    username: 'testuser',
    password: 'testpass123',
  },

  coffeeShop: {
    name: 'Test Coffee Shop',
    description: 'A great place to test',
    address: '123 Test St',
  },
};

/**
 * Check if page has horizontal overflow
 */
export async function checkHorizontalOverflow(page: Page): Promise<boolean> {
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = page.viewportSize()?.width || 0;
  return bodyWidth > viewportWidth;
}

/**
 * Get safe area insets for iOS devices
 */
export async function getSafeAreaInsets(page: Page): Promise<{ top: number; bottom: number }> {
  return await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    const top = parseInt(style.getPropertyValue('safe-area-inset-top') || '0');
    const bottom = parseInt(style.getPropertyValue('safe-area-inset-bottom') || '0');
    return { top, bottom };
  });
}
