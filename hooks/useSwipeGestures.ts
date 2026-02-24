'use client';

import { useEffect, RefObject } from 'react';

interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeOptions {
  threshold?: number; // Minimum distance for swipe (default: 50)
  restraint?: number; // Maximum deviation allowed (default: 100)
  allowedTime?: number; // Maximum time allowed (default: 300)
}

export function useSwipeGestures(
  ref: RefObject<HTMLElement | null>,
  callbacks: SwipeCallbacks,
  options: SwipeOptions = {}
) {
  const { threshold = 50, restraint = 100, allowedTime = 300 } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const elapsedTime = Date.now() - touchStartTime;

      if (elapsedTime <= allowedTime) {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        if (Math.abs(deltaX) >= threshold && Math.abs(deltaY) <= restraint) {
          // Horizontal swipe
          if (deltaX > 0) {
            callbacks.onSwipeRight?.();
          } else {
            callbacks.onSwipeLeft?.();
          }
        } else if (Math.abs(deltaY) >= threshold && Math.abs(deltaX) <= restraint) {
          // Vertical swipe
          if (deltaY > 0) {
            callbacks.onSwipeDown?.();
          } else {
            callbacks.onSwipeUp?.();
          }
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, callbacks, threshold, restraint, allowedTime]);
}
