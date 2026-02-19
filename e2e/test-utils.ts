/**
 * Test utilities and helper functions for Playwright tests
 */

import { Page, Locator } from '@playwright/test';

/**
 * Wait for the bottom navigation to be visible
 */
export async function waitForBottomNav(page: Page): Promise<Locator> {
  const nav = page.locator('nav.fixed.bottom-0');
  await nav.waitFor({ state: 'visible' });
  return nav;
}

/**
 * Wait for the bottom navigation to be hidden
 */
export async function waitForBottomNavHidden(page: Page): Promise<void> {
  const nav = page.locator('nav.fixed.bottom-0');
  await nav.waitFor({ state: 'hidden' });
}

/**
 * Get the bottom navigation element
 */
export function getBottomNav(page: Page): Locator {
  return page.locator('nav.fixed.bottom-0');
}

/**
 * Check if bottom navigation is currently visible
 */
export async function isBottomNavVisible(page: Page): Promise<boolean> {
  const nav = getBottomNav(page);
  const count = await nav.count();
  if (count === 0) return false;

  return await nav.isVisible().catch(() => false);
}

/**
 * Focus an input and wait for keyboard to appear (simulated)
 */
export async function focusInputAndWait(page: Page, selector: string): Promise<void> {
  const input = page.locator(selector);
  await input.click();
  await input.focus();

  // Wait for focus event to propagate and nav to hide
  await page.waitForTimeout(300);
}

/**
 * Blur an input and wait for keyboard to dismiss (simulated)
 */
export async function blurInputAndWait(page: Page, selector: string): Promise<void> {
  const input = page.locator(selector);
  await input.blur();

  // Wait for blur event to propagate and nav to show
  await page.waitForTimeout(400); // Component has 100ms delay
}

/**
 * Navigate to a page and wait for it to load
 */
export async function navigateToPage(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

/**
 * Get viewport information
 */
export async function getViewportInfo(page: Page): Promise<{
  width: number;
  height: number;
  isMobile: boolean;
}> {
  const viewportSize = page.viewportSize();
  const isMobile = page.context().browser()?.contexts()?.[0]?.page?.()?.toString().includes('Mobile') ||
                   (viewportSize ? viewportSize.width < 768 : false);

  return {
    width: viewportSize?.width || 0,
    height: viewportSize?.height || 0,
    isMobile: !!isMobile,
  };
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `screenshots/${name}.png`,
    fullPage: false,
  });
}

/**
 * Test helper to verify all navigation items are present
 */
export async function verifyNavItemsPresent(page: Page): Promise<void> {
  const navItems = [
    { href: '/feed', label: 'Feed' },
    { href: '/search', label: 'Search' },
    { href: '/log', label: 'Log' },
    { href: '/friends', label: 'Friends' },
    { href: '/profile', label: 'Profile' },
  ];

  for (const item of navItems) {
    const link = page.locator(`a[href="${item.href}"]`);
    await expect(async () => {
      const isVisible = await link.isVisible().catch(() => false);
      if (!isVisible) {
        throw new Error(`Navigation item ${item.label} (${item.href}) is not visible`);
      }
    }).toPass({
      timeout: 5000,
    });
  }
}

/**
 * Test helper to simulate mobile keyboard behavior
 */
export async function simulateMobileKeyboard(
  page: Page,
  action: 'show' | 'hide'
): Promise<void> {
  const viewportHeight = page.viewportSize()?.height || 0;

  if (action === 'show') {
    // Simulate keyboard appearing by resizing viewport
    await page.setViewportSize({
      width: page.viewportSize()?.width || 390,
      height: Math.max(viewportHeight - 300, 400), // Reserve space for keyboard
    });
  } else {
    // Simulate keyboard hiding by restoring viewport
    await page.setViewportSize({
      width: page.viewportSize()?.width || 390,
      height: viewportHeight + 300, // Restore original height
    });
  }

  await page.waitForTimeout(100);
}

/**
 * Get the z-index of an element
 */
export async function getZIndex(page: Page, selector: string): Promise<number> {
  const element = page.locator(selector).first();
  const zIndex = await element.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return parseInt(computed.zIndex || '0');
  });
  return zIndex;
}

/**
 * Check if element is within viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector).first();
  return await element.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });
}
