/**
 * LocalStorage Cleanup Utility
 * Clears all old localStorage data from the single-user version of CoffeeConnect
 */

const MIGRATION_KEY = 'coffeeconnect_migration_complete';
const CLEARED_KEY = 'coffeeconnect_localstorage_cleared';

const LOCAL_STORAGE_KEYS_TO_CLEAR = [
  'visits',
  'favorites',
  'coffeeShops',
  'userPreferences',
  'coffeeConnectState',
  // Add any other keys used in the old version
];

export function clearOldLocalStorage() {
  // Only clear once
  if (typeof window !== 'undefined' && localStorage.getItem(CLEARED_KEY)) {
    return;
  }

  if (typeof window === 'undefined') return;

  try {
    // Clear all known keys
    LOCAL_STORAGE_KEYS_TO_CLEAR.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Optionally, clear all localStorage (commented out for safety)
    // localStorage.clear();

    // Mark as cleared
    localStorage.setItem(CLEARED_KEY, new Date().toISOString());

    console.log('✅ Old localStorage data cleared');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

export function hasMigrated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CLEARED_KEY) !== null;
}

// This can be called from the root layout or a client component on app load
export function initializeLocalStorageCleanup() {
  if (typeof window === 'undefined') return;

  // Auto-clear on first load after migration
  if (!hasMigrated()) {
    clearOldLocalStorage();

    // Show a one-time notification (optional)
    const notificationShown = sessionStorage.getItem('migration_notification_shown');
    if (!notificationShown) {
      console.log('🎉 CoffeeConnect has been upgraded! All your data is now stored securely in the cloud.');
      sessionStorage.setItem('migration_notification_shown', 'true');
    }
  }
}
