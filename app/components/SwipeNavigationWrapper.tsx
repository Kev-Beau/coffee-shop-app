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
  const isLogPage = pathname === '/log';

  // Don't show swipe navigation on landing page or log page (log page has modal that needs scrolling)
  if (isHomePage || isLogPage) {
    return <>{children}</>;
  }

  return <SwipeNavigation>{children}</SwipeNavigation>;
}
