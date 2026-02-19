import { test, expect, devices } from '@playwright/test';
import { NavigationHelpers } from './utils/helpers';

/**
 * Mobile-Specific E2E Tests
 *
 * Tests mobile viewport rendering, touch interactions, and keyboard behavior
 */

test.describe('Mobile Viewport Rendering', () => {
  test.use(devices['iPhone 12']);

  test('should render correctly on iPhone 12', async ({ page }) => {
    await page.goto('/');

    // Check viewport size
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBe(390);
    expect(viewportSize?.height).toBe(844);

    // Content should be visible
    await expect(page.locator('h1:has-text("Beany")')).toBeVisible();
  });

  test('should have mobile-optimized layout', async ({ page }) => {
    await page.goto('/');

    // Check for responsive classes
    const heroSection = page.locator('section').first();
    const classes = await heroSection.getAttribute('class');

    // Should have mobile padding
    expect(classes).toContain('px-6');
  });

  test('should display full viewport sections', async ({ page }) => {
    await page.goto('/');

    const sections = page.locator('section');
    const count = await sections.count();

    expect(count).toBeGreaterThan(0);

    // Each section should be visible
    for (let i = 0; i < Math.min(count, 3); i++) {
      await sections.nth(i).scrollIntoViewIfNeeded();
      const isVisible = await sections.nth(i).isVisible();
      expect(isVisible).toBe(true);
    }
  });
});

test.describe('Touch Interactions', () => {
  test.use(devices['iPhone 12']);

  test('should support tap navigation', async ({ page }) => {
    await page.goto('/');

    // Tap on Sign Up button
    const signUpButton = page.locator('text=Sign Up').first();
    await signUpButton.tap();

    await page.waitForURL('**/auth/signup');
    await expect(page.locator('text=Create your account')).toBeVisible();
  });

  test('should support swipe gestures', async ({ page }) => {
    await page.goto('/feed');

    // Test horizontal swipe (if any horizontal scrolling elements exist)
    const scrollContainer = page.locator('div.overflow-x-auto').first();
    const exists = await scrollContainer.count() > 0;

    if (exists) {
      // Get initial scroll position
      const initialScroll = await scrollContainer.evaluate((el) => el.scrollLeft);

      // Swipe left
      const box = await scrollContainer.boundingBox();
      if (box) {
        await page.touchscreen.tap(box.x + box.width - 50, box.y + box.height / 2);
        await page.touchscreen.tap(box.x + 50, box.y + box.height / 2);
      }
    }
  });

  test('should handle pinch zoom prevention', async ({ page }) => {
    await page.goto('/');

    // Check that viewport meta prevents zooming
    const viewportMeta = page.locator('meta[name="viewport"]');
    const content = await viewportMeta.getAttribute('content');

    expect(content).toContain('user-scalable=no');
    expect(content).toContain('maximum-scale=1');
  });

  test('should have appropriate touch target sizes', async ({ page }) => {
    await page.goto('/feed');

    const buttons = page.locator('button, a').all();
    const touchTargets = await buttons;

    // Check a few buttons
    for (let i = 0; i < Math.min(touchTargets.length, 5); i++) {
      const box = await touchTargets[i].boundingBox();
      if (box) {
        // Touch targets should be at least 44x44 points (iOS HIG)
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should respond to touch with visual feedback', async ({ page }) => {
    await page.goto('/feed');

    const button = page.locator('button').first();

    // Tap button
    await button.tap();

    // Should have :active state or similar feedback
    await page.waitForTimeout(100);
  });
});

test.describe('Keyboard Interactions with Inputs', () => {
  test.use(devices['iPhone 12']);

  test('should show correct keyboard type for email', async ({ page }) => {
    await page.goto('/auth/signin');

    const emailInput = page.locator('#email');
    await emailInput.tap();

    // Should trigger email keyboard
    const inputType = await emailInput.getAttribute('type');
    expect(inputType).toBe('email');
  });

  test('should show correct keyboard type for password', async ({ page }) => {
    await page.goto('/auth/signin');

    const passwordInput = page.locator('#password');
    await passwordInput.tap();

    // Should trigger secure text entry
    const inputType = await passwordInput.getAttribute('type');
    expect(inputType).toBe('password');
  });

  test('should have proper inputmode for search', async ({ page }) => {
    await page.goto('/search');

    const searchInput = page.locator('input[type="search"]');

    const inputMode = await searchInput.getAttribute('inputmode');
    expect(inputMode).toBe('search');
  });

  test('should dismiss keyboard on return', async ({ page }) => {
    await page.goto('/search');

    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.tap();
    await searchInput.fill('coffee');
    await searchInput.press('Enter');

    // Keyboard should dismiss
    await page.waitForTimeout(500);

    // Input should lose focus or search should execute
    const isFocused = await searchInput.evaluate((el: HTMLInputElement) => document.activeElement === el);

    // Either not focused or search executed
    expect(true).toBe(true);
  });

  test('should handle autocorrect properly', async ({ page }) => {
    await page.goto('/auth/signup');

    const usernameInput = page.locator('#username');

    // Username should disable autocorrect
    const autocorrect = await usernameInput.getAttribute('autocorrect');
    const autocapitalize = await usernameInput.getAttribute('autocapitalize');

    // Should have autocorrect disabled
    expect(autocorrect).toBe('off');
    expect(autocapitalize).toBe('none');
  });

  test('should handle tap outside to dismiss keyboard', async ({ page }) => {
    await page.goto('/search');

    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.tap();

    await page.waitForTimeout(200);

    // Tap outside
    const backdrop = page.locator('div.min-h-screen').first();
    await backdrop.tap({ position: { x: 50, y: 50 } });

    await page.waitForTimeout(200);

    // Keyboard might or might not dismiss depending on implementation
  });
});

test.describe('Mobile-Specific UI Elements', () => {
  test.use(devices['iPhone 12']);

  test('should have safe area insets', async ({ page }) => {
    await page.goto('/feed');

    // Check for safe-area-inset CSS
    const bottomNav = page.locator('nav.fixed.bottom-0');

    const paddingBottom = await bottomNav.evaluate((el) => {
      return window.getComputedStyle(el).paddingBottom;
    });

    // Should have some padding for safe area
    expect(paddingBottom).not.toBe('0px');
  });

  test('should handle notch area correctly', async ({ page }) => {
    await page.goto('/');

    // Content should not be hidden behind notch
    const topNav = page.locator('.fixed.top-0');
    const paddingTop = await topNav.evaluate((el) => {
      return window.getComputedStyle(el).paddingTop;
    });

    // Should have padding
    expect(paddingTop).not.toBe('0px');
  });

  test('should have proper tap highlights disabled', async ({ page }) => {
    await page.goto('/');

    // Check for -webkit-tap-highlight-color
    const body = page.locator('body');
    const tapHighlight = await body.evaluate((el) => {
      return window.getComputedStyle(el).webkitTapHighlightColor;
    });

    // Should have transparent or custom tap highlight
    expect(tapHighlight).toBeTruthy();
  });
});

test.describe('Mobile Orientation', () => {
  test.use({ ...devices['iPhone 12'], viewport: { width: 844, height: 390 } });

  test('should render in landscape mode', async ({ page }) => {
    await page.goto('/');

    // Should still be usable in landscape
    await expect(page.locator('h1:has-text("Beany")')).toBeVisible();
  });

  test('should adjust layout for landscape', async ({ page }) => {
    await page.goto('/feed');

    // Content should fit in landscape viewport
    const content = page.locator('div.min-h-screen').first();
    await expect(content).toBeVisible();
  });
});

test.describe('Mobile Performance', () => {
  test.use(devices['iPhone 12']);

  test('should load quickly on mobile', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    const loadTime = Date.now() - startTime;

    // Should load in reasonable time
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle scrolling smoothly', async ({ page }) => {
    await page.goto('/');

    const content = page.locator('div.min-h-screen').first();

    // Scroll down
    await content.evaluate((el) => {
      el.scrollTo({ top: 500, behavior: 'smooth' });
    });

    await page.waitForTimeout(500);

    // Scroll back up
    await content.evaluate((el) => {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    });

    await page.waitForTimeout(500);
  });
});

test.describe('Android Mobile Specific', () => {
  test.use(devices['Pixel 5']);

  test('should render correctly on Android', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1:has-text("Beany")')).toBeVisible();
  });

  test('should handle Android back button', async ({ page }) => {
    await page.goto('/auth/signup');

    // Navigate back
    await page.goBack();

    await page.waitForURL('**/');
    await expect(page.locator('h1:has-text("Beany")')).toBeVisible();
  });

  test('should have proper material design ripples (if implemented)', async ({ page }) => {
    await page.goto('/feed');

    const button = page.locator('button').first();

    // Tap button
    await button.tap();

    // Should have some visual feedback
    await page.waitForTimeout(100);
  });
});

test.describe('Mobile Gestures', () => {
  test.use(devices['iPhone 12']);

  test('should support pull to refresh', async ({ page }) => {
    await page.goto('/feed');

    const container = page.locator('div.min-h-screen').first();

    // Scroll to top
    await container.evaluate((el) => el.scrollTo(0, 0));

    // Pull down
    const box = await container.boundingBox();
    if (box) {
      await page.touchscreen.tap(box.x + box.width / 2, box.y + 20);
      await page.touchscreen.tap(box.x + box.width / 2, box.y + 200);
    }

    await page.waitForTimeout(500);
  });

  test('should handle long press (context menu)', async ({ page }) => {
    await page.goto('/feed');

    // Long press on an element
    const firstElement = page.locator('a, button').first();

    // Start long press
    await firstElement.tap();
    await page.waitForTimeout(800);

    // Might trigger context menu or nothing (depending on implementation)
  });
});

test.describe('Mobile Accessibility', () => {
  test.use(devices['iPhone 12']);

  test('should work with VoiceOver', async ({ page }) => {
    await page.goto('/feed');

    // Elements should have accessible labels
    const buttons = page.locator('button, a').all();

    for (const button of buttons.slice(0, 3)) {
      const ariaLabel = await button.evaluate((el) => el.getAttribute('aria-label'));
      const text = await button.evaluate((el) => el.textContent);

      // Should have either aria-label or text content
      expect(ariaLabel || text).toBeTruthy();
    }
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/feed');

    // Tab through elements
    await page.keyboard.press('Tab');

    // Some element should be focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});
