'use client';

/**
 * Detect if the app is running in iOS PWA mode (added to home screen)
 */
export function isIOSPWA(): boolean {
  if (typeof window === 'undefined') return false;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isInStandaloneMode =
    ('standalone' in window.navigator && (window.navigator as any).standalone) ||
    window.matchMedia('(display-mode: standalone)').matches;

  return isIOS && isInStandaloneMode;
}

/**
 * Detect if device is iOS (any browser)
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}
