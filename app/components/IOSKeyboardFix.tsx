'use client';

import { useEffect } from 'react';

export default function IOSKeyboardFix() {
  useEffect(() => {
    // Store original body styles
    const originalBodyStyle = document.body.style.cssText;
    const originalHtmlStyle = document.documentElement.style.cssText;

    // Prevent iOS from modifying body when keyboard opens
    const handleFocusIn = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        // Force body to maintain its styles
        document.body.style.position = '';
        document.body.style.height = '';
        document.body.style.overflow = '';
        document.documentElement.style.height = '';
        document.documentElement.style.overflow = '';
      }
    };

    const handleFocusOut = () => {
      // Ensure body styles are restored when keyboard closes
      document.body.style.cssText = originalBodyStyle;
      document.documentElement.style.cssText = originalHtmlStyle;
    };

    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('focusout', handleFocusOut, true);

    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('focusout', handleFocusOut, true);
    };
  }, []);

  return null;
}
