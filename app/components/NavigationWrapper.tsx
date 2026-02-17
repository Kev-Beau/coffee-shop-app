'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export default function NavigationWrapper() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Don't show top navigation on the landing page
  if (isHomePage) {
    return null;
  }

  return <Navigation />;
}
