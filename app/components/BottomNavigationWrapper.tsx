'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import BottomNavigation from './BottomNavigation';
import { isIOSPWA } from '@/lib/detect-ios-pwa';

export default function BottomNavigationWrapper() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isIOSPWAMode, setIsIOSPWAMode] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only run on client to detect PWA mode
    setIsClient(true);
    setIsIOSPWAMode(isIOSPWA());
  }, []);

  // Don't show bottom navigation on the landing page or iOS PWA mode
  if (isHomePage || (isClient && isIOSPWAMode)) {
    return null;
  }

  return <BottomNavigation />;
}
