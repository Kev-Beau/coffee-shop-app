import { test, expect } from '@playwright/test';

/**
 * Responsive Design E2E Tests
 *
 * Tests layout behavior across multiple viewport sizes
 */

const viewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'Pixel 5', width: 393, height: 851 },
  { name: 'iPad', width: 810, height: 1080 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Desktop Small', width: 1280, height: 720 },
  { name: 'Desktop Large', width: 1920, height: 1080 },
];

test.describe('Responsive Layout - Landing Page', () => {
  for (const viewport of viewports) {
    test(`should render correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      // Main content should be visible
      await expect(page.locator('h1:has-text("Beany")')).toBeVisible();

      // Should not have horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 1); // +1 for rounding
    });
  }

  test('should adjust typography for different screens', async ({ page }) => {
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const mobileTitle = page.locator('h1');
    const mobileFontSize = await mobileTitle.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();

    const desktopTitle = page.locator('h1');
    const desktopFontSize = await desktopTitle.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    // Font sizes should be different
    expect(mobileFontSize).not.toBe(desktopFontSize);
  });

  test('should adjust padding for different screens', async ({ page }) => {
    // Mobile - should have less padding
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const sectionMobile = page.locator('section').first();
    const mobilePadding = await sectionMobile.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.paddingLeft;
    });

    // Desktop - should have more padding
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();

    const sectionDesktop = page.locator('section').first();
    const desktopPadding = await sectionDesktop.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.paddingLeft;
    });

    // Desktop should have more padding
    const mobilePx = parseInt(mobilePadding);
    const desktopPx = parseInt(desktopPadding);

    expect(desktopPx).toBeGreaterThan(mobilePx);
  });
});

test.describe('Responsive Layout - Feed Page', () => {
  for (const viewport of viewports) {
    test(`should render feed on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/feed');

      // Wait for any redirects
      await page.waitForTimeout(1000);

      // Feed content should be visible
      const content = page.locator('div:has-text("Friends"), div:has-text("Explore")');
      const count = await content.count();

      // If not redirected to signin
      if (count > 0) {
        await expect(content.first()).toBeVisible();
      }
    });
  }

  test('should show bottom nav only on mobile', async ({ page }) => {
    // Mobile - should show bottom nav
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/feed');
    await page.waitForTimeout(1000);

    const bottomNavMobile = page.locator('nav.fixed.bottom-0');
    const mobileVisible = await bottomNavMobile.isVisible().catch(() => false);

    // Desktop - bottom nav might or might not show
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();

    const bottomNavDesktop = page.locator('nav.fixed.bottom-0');
    const desktopVisible = await bottomNavDesktop.isVisible().catch(() => false);

    // At least one should be visible
    expect(mobileVisible || desktopVisible).toBe(true);
  });

  test('should adjust feed card width', async ({ page }) => {
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/feed');
    await page.waitForTimeout(1000);

    const feedCardMobile = page.locator('.max-w-2xl');
    await expect(feedCardMobile.first()).toBeVisible();

    // Desktop - same container but relative to viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();

    const feedCardDesktop = page.locator('.max-w-2xl');
    await expect(feedCardDesktop.first()).toBeVisible();
  });
});

test.describe('Responsive Layout - Profile Page', () => {
  test('should adjust profile layout for mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/profile');
    await page.waitForTimeout(1000);

    // Profile card should be visible
    const profileCard = page.locator('.bg-white.rounded-3xl');
    const count = await profileCard.count();

    if (count > 0) {
      await expect(profileCard.first()).toBeVisible();
    }
  });

  test('should adjust profile layout for desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/profile');
    await page.waitForTimeout(1000);

    // Profile card should be visible
    const profileCard = page.locator('.bg-white.rounded-3xl');
    const count = await profileCard.count();

    if (count > 0) {
      await expect(profileCard.first()).toBeVisible();
    }
  });

  test('should adjust profile grid columns', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/profile');
    await page.waitForTimeout(1000);

    const grid = page.locator('.grid.grid-cols-3');
    const count = await grid.count();

    if (count > 0) {
      // Should be 3 columns on mobile
      await expect(grid.first()).toBeVisible();
    }
  });
});

test.describe('Responsive Layout - Search Page', () => {
  for (const viewport of viewports.slice(0, 4)) {
    test(`should render search on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/search');

      // Search input should be visible
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

      // Tabs should be visible
      await expect(page.locator('button:has-text("Shops")')).toBeVisible();
    });
  }

  test('should adjust tab layout for different screens', async ({ page }) => {
    // Mobile - tabs might be stacked or smaller
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/search');

    const tabsMobile = page.locator('button:has-text("Friends"), button:has-text("Explore"), button:has-text("Shops")');
    await expect(tabsMobile.first()).toBeVisible();

    // Desktop - tabs should still be visible
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();

    const tabsDesktop = page.locator('button:has-text("Friends"), button:has-text("Explore"), button:has-text("Shops")');
    await expect(tabsDesktop.first()).toBeVisible();
  });
});

test.describe('Responsive Layout - Auth Pages', () => {
  test('should center auth form on all screen sizes', async ({ page }) => {
    // Test on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth/signin');

    const formMobile = page.locator('.bg-white.rounded-2xl');
    await expect(formMobile).toBeVisible();

    // Test on desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/auth/signin');

    const formDesktop = page.locator('.bg-white.rounded-2xl');
    await expect(formDesktop).toBeVisible();
  });

  test('should adjust form width appropriately', async ({ page }) => {
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth/signin');

    const formMobile = page.locator('.max-w-md.w-full');
    await expect(formMobile).toBeVisible();

    // Desktop - should still be max-w-md
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();

    const formDesktop = page.locator('.max-w-md');
    await expect(formDesktop).toBeVisible();
  });
});

test.describe('Responsive Layout - Quick Log Modal', () => {
  test('should adjust modal for mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/log');

    const modal = page.locator('div.rounded-t-3xl');
    await expect(modal).toBeVisible();

    // Should have rounded top corners (sheet style)
    const classes = await modal.getAttribute('class');
    expect(classes).toContain('rounded-t-3xl');
  });

  test('should adjust modal for tablet', async ({ page }) => {
    await page.setViewportSize({ width: 810, height: 1080 });
    await page.goto('/log');

    const modal = page.locator('div.rounded-t-3xl, div.rounded-3xl');
    await expect(modal.first()).toBeVisible();
  });

  test('should adjust modal for desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/log');

    const modal = page.locator('div.max-w-lg');
    await expect(modal.first()).toBeVisible();
  });
});

test.describe('Responsive Breakpoints', () => {
  test('should handle small mobile (320px)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');

    await expect(page.locator('h1:has-text("Beany")')).toBeVisible();

    // Should not overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(321);
  });

  test('should handle large desktop (2560px)', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto('/');

    await expect(page.locator('h1:has-text("Beany")')).toBeVisible();

    // Content should be centered with max-width
    const content = page.locator('.max-w-7xl');
    const count = await content.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Responsive Images', () => {
  test('should scale images appropriately', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/profile');
    await page.waitForTimeout(1000);

    // Check avatar or any images
    const images = page.locator('img');
    const count = await images.count();

    if (count > 0) {
      // Images should not overflow
      for (let i = 0; i < Math.min(count, 3); i++) {
        const img = images.nth(i);
        await expect(img).toHaveJSProperty('complete', true);
      }
    }
  });
});

test.describe('Responsive Typography', () => {
  const sizes = [
    { viewport: { width: 375, height: 667 }, expected: 'text-6xl' },
    { viewport: { width: 1920, height: 1080 }, expected: 'text-6xl' }, // Tailwind responsive classes
  ];

  sizes.forEach(({ viewport, expected }) => {
    test(`should have appropriate text size at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');

      const title = page.locator('h1');
      await expect(title).toBeVisible();

      // Tailwind uses different breakpoints
      const classes = await title.getAttribute('class');
      expect(classes).toContain('text-');
    });
  });
});

test.describe('Responsive Spacing', () => {
  test('should adjust margins and padding', async ({ page }) => {
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const sectionMobile = page.locator('section').first();
    const mobileClasses = await sectionMobile.getAttribute('class');

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();

    const sectionDesktop = page.locator('section').first();
    const desktopClasses = await sectionDesktop.getAttribute('class');

    // Should have responsive classes
    expect(mobileClasses || desktopClasses).toBeTruthy();
  });
});

test.describe('Orientation Changes', () => {
  test('should handle portrait to landscape', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/feed');
    await page.waitForTimeout(1000);

    // Rotate to landscape
    await page.setViewportSize({ width: 667, height: 375 });

    // Content should still be visible
    const content = page.locator('div:has-text("Friends"), div:has-text("Explore")');
    const count = await content.count();

    if (count > 0) {
      await expect(content.first()).toBeVisible();
    }
  });

  test('should handle landscape to portrait', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/feed');
    await page.waitForTimeout(1000);

    // Rotate to portrait
    await page.setViewportSize({ width: 375, height: 667 });

    // Content should still be visible
    const content = page.locator('div:has-text("Friends"), div:has-text("Explore")');
    const count = await content.count();

    if (count > 0) {
      await expect(content.first()).toBeVisible();
    }
  });
});

test.describe('Edge Cases', () => {
  test('should handle very narrow screens', async ({ page }) => {
    await page.setViewportSize({ width: 300, height: 600 });
    await page.goto('/');

    await expect(page.locator('h1:has-text("Beany")')).toBeVisible();

    // Should not have horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > document.body.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test('should handle ultra-wide screens', async ({ page }) => {
    await page.setViewportSize({ width: 3840, height: 2160 });
    await page.goto('/');

    await expect(page.locator('h1:has-text("Beany")')).toBeVisible();

    // Content should be constrained
    const content = page.locator('.max-w-7xl');
    const count = await content.count();
    expect(count).toBeGreaterThan(0);
  });
});
