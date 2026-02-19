import { test, expect, Page } from '@playwright/test';
import { AuthHelpers } from './utils/helpers';
import { generateTestUser } from './utils/test-data';

/**
 * Authentication E2E Tests
 *
 * Tests user signup, login, and logout flows
 */

test.describe('Authentication Flows', () => {
  let authHelpers: AuthHelpers;
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    testUser = generateTestUser();
  });

  test.describe('User Signup', () => {
    test('should display sign up page correctly', async ({ page }) => {
      await authHelpers.gotoSignUp();

      // Check page elements
      await expect(page.locator('h1:has-text("Beany")')).toBeVisible();
      await expect(page.locator('text=Create your account')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#username')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('#confirmPassword')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show validation errors for invalid input', async ({ page }) => {
      await authHelpers.gotoSignUp();

      // Submit empty form
      await page.click('button[type="submit"]');

      // Check for required field validation
      await expect(page.locator('#email')).toBeFocused();

      // Test invalid email format
      await page.fill('#email', 'invalid-email');
      await page.fill('#username', 'ab');
      await page.fill('#password', '123');
      await page.fill('#confirmPassword', '456');

      // The browser should prevent invalid submission
      const emailInput = page.locator('#email');
      const isEmailValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isEmailValid).toBe(false);
    });

    test('should show error when passwords do not match', async ({ page }) => {
      await authHelpers.gotoSignUp();

      await page.fill('#email', testUser.email);
      await page.fill('#username', testUser.username);
      await page.fill('#password', testUser.password);
      await page.fill('#confirmPassword', 'different');

      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('text=Passwords do not match')).toBeVisible({ timeout: 5000 });
    });

    test('should show error for short password', async ({ page }) => {
      await authHelpers.gotoSignUp();

      await page.fill('#email', testUser.email);
      await page.fill('#username', testUser.username);
      await page.fill('#password', '12345');
      await page.fill('#confirmPassword', '12345');

      await page.click('button[type="submit"]');

      // Should show error about password length
      await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible({ timeout: 5000 });
    });

    test('should show error for short username', async ({ page }) => {
      await authHelpers.gotoSignUp();

      await page.fill('#email', testUser.email);
      await page.fill('#username', 'ab');
      await page.fill('#password', testUser.password);
      await page.fill('#confirmPassword', testUser.confirmPassword);

      await page.click('button[type="submit"]');

      // Should show error about username length
      await expect(page.locator('text=Username must be at least 3 characters')).toBeVisible({ timeout: 5000 });
    });

    test('should sanitize username input correctly', async ({ page }) => {
      await authHelpers.gotoSignUp();

      const usernameInput = page.locator('#username');

      // Type uppercase and special characters
      await usernameInput.fill('TestUser123!@#');

      // Should convert to lowercase and remove special chars
      const value = await usernameInput.inputValue();
      expect(value).toBe('testuser123');
      expect(value).not.toMatch(/[A-Z!@#]/);
    });

    test('should navigate to sign in from sign up', async ({ page }) => {
      await authHelpers.gotoSignUp();

      await page.click('text=Sign in');

      await page.waitForURL('**/auth/signin');
      await expect(page.locator('text=Sign in to your account')).toBeVisible();
    });

    test('should navigate back to home from sign up', async ({ page }) => {
      await authHelpers.gotoSignUp();

      await page.click('text=Back to home');

      await page.waitForURL('/');
      await expect(page.locator('h1:has-text("Beany")')).toBeVisible();
    });

    test('should handle signup submit button loading state', async ({ page }) => {
      await authHelpers.gotoSignUp();

      await page.fill('#email', testUser.email);
      await page.fill('#username', testUser.username);
      await page.fill('#password', testUser.password);
      await page.fill('#confirmPassword', testUser.confirmPassword);

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Button should show loading state
      await expect(submitButton).toHaveText(/Creating account\.\.\./);
    });
  });

  test.describe('User Login', () => {
    test('should display sign in page correctly', async ({ page }) => {
      await authHelpers.gotoSignIn();

      // Check page elements
      await expect(page.locator('h1:has-text("Beany")')).toBeVisible();
      await expect(page.locator('text=Sign in to your account')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show validation for empty fields', async ({ page }) => {
      await authHelpers.gotoSignIn();

      // Try to submit empty form
      await page.click('button[type="submit"]');

      // Email should be required
      const emailInput = page.locator('#email');
      await expect(emailInput).toBeFocused();
    });

    test('should show error for invalid email format', async ({ page }) => {
      await authHelpers.gotoSignIn();

      await page.fill('#email', 'not-an-email');
      await page.fill('#password', 'password123');

      // Browser validation
      const emailInput = page.locator('#email');
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(false);
    });

    test('should navigate to sign up from sign in', async ({ page }) => {
      await authHelpers.gotoSignIn();

      await page.click('text=Sign up');

      await page.waitForURL('**/auth/signup');
      await expect(page.locator('text=Create your account')).toBeVisible();
    });

    test('should navigate to forgot password', async ({ page }) => {
      await authHelpers.gotoSignIn();

      await page.click('text=Forgot password?');

      await page.waitForURL('**/auth/reset-password');
      await expect(page.locator('text=Reset Password')).toBeVisible();
    });

    test('should navigate back to home from sign in', async ({ page }) => {
      await authHelpers.gotoSignIn();

      await page.click('text=Back to home');

      await page.waitForURL('/');
      await expect(page.locator('h1:has-text("Beany")')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await authHelpers.gotoSignIn();

      await page.fill('#email', 'nonexistent@example.com');
      await page.fill('#password', 'wrongpassword');

      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('text=/Failed to sign in|Invalid login credentials/')).toBeVisible({ timeout: 10000 });
    });

    test('should handle login button loading state', async ({ page }) => {
      await authHelpers.gotoSignIn();

      await page.fill('#email', 'test@example.com');
      await page.fill('#password', 'password123');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Button should show loading state
      await expect(submitButton).toHaveText(/Signing in\.\.\./);
    });

    test('should redirect authenticated user to feed', async ({ page }) => {
      // Note: This test assumes a user exists. In real testing, you'd create one first
      await authHelpers.gotoSignIn();

      await page.fill('#email', 'test@example.com');
      await page.fill('#password', 'Test123456');

      await page.click('button[type="submit"]');

      // After successful login, should redirect to feed or onboarding
      await page.waitForURL('**/feed', { timeout: 10000 }).catch(() => {
        // Might go to onboarding instead
        return page.waitForURL('**/onboarding', { timeout: 5000 });
      });
    });
  });

  test.describe('Authentication Navigation', () => {
    test('should redirect to home when not authenticated', async ({ page }) => {
      // Try to access protected route
      await page.goto('/feed');

      // Should redirect to signin
      await page.waitForURL('**/auth/signin', { timeout: 10000 });
    });

    test('should show login/signup buttons on landing page', async ({ page }) => {
      await page.goto('/');

      // Top navigation should have both buttons
      await expect(page.locator('text=Log In')).toBeVisible();
      await expect(page.locator('text=Sign Up')).toBeVisible();

      // CTA section should also have buttons
      await expect(page.locator('a[href="/auth/signup"]').filter({ hasText: 'Sign Up Free' })).toBeVisible();
      await expect(page.locator('a[href="/auth/signin"]').filter({ hasText: 'Log In' })).toBeVisible();
    });
  });

  test.describe('Password Recovery', () => {
    test('should display reset password page', async ({ page }) => {
      await page.goto('/auth/reset-password');

      await expect(page.locator('text=Reset Password')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });

    test('should validate email input on reset password', async ({ page }) => {
      await page.goto('/auth/reset-password');

      const emailInput = page.locator('input[type="email"]');
      await emailInput.fill('invalid-email');

      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(false);
    });
  });

  test.describe('Email Confirmation', () => {
    test('should display confirmation page', async ({ page }) => {
      await page.goto('/auth/confirm-email?email=test%40example.com');

      await expect(page.locator('text=Check your email')).toBeVisible();
    });
  });
});
