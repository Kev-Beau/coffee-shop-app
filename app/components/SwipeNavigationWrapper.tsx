'use client';

import { usePathname } from 'next/navigation';
import SwipeNavigation from './SwipeNavigation';

export default function SwipeNavigationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Don't show swipe navigation on the landing page
  if (isHomePage) {
    return <>{children}</>;
  }

  return <SwipeNavigation>{children}</SwipeNavigation>;
}
