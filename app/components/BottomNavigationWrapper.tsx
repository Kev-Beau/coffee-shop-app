'use client';

import { usePathname } from 'next/navigation';
import BottomNavigation from './BottomNavigation';

export default function BottomNavigationWrapper() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Don't show bottom navigation on the landing page
  if (isHomePage) {
    return null;
  }

  return <BottomNavigation />;
}
