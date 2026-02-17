'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  PlusIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, MagnifyingGlassIcon as MagnifyingGlassIconSolid, UserGroupIcon as UserGroupIconSolid, UserIcon as UserIconSolid } from '@heroicons/react/24/solid';

export default function BottomNavigation() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  const navItems = [
    { href: '/feed', icon: HomeIcon, solidIcon: HomeIconSolid, label: 'Feed' },
    { href: '/search', icon: MagnifyingGlassIcon, solidIcon: MagnifyingGlassIconSolid, label: 'Search' },
    { href: '/log', icon: PlusIcon, solidIcon: PlusIcon, label: 'Log', special: true },
    { href: '/friends', icon: UserGroupIcon, solidIcon: UserGroupIconSolid, label: 'Friends' },
    { href: '/profile', icon: UserIcon, solidIcon: UserIconSolid, label: 'Profile' },
  ];

  // Fix iOS Safari viewport bug by re-applying position when viewport changes
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    let originalHeight = window.innerHeight;
    let keyboardOpen = false;

    const fixNavPosition = () => {
      if (!nav) return;

      // Always ensure these styles are applied
      nav.style.position = 'fixed';
      nav.style.bottom = '0';
      nav.style.left = '0';
      nav.style.right = '0';
      nav.style.zIndex = '9999';

      // Force hardware acceleration
      nav.style.transform = 'translateZ(0)';
      nav.style.webkitTransform = 'translateZ(0)';

      // Also ensure body/document are proper size
      if (!keyboardOpen) {
        document.body.style.height = '';
        document.documentElement.style.height = '';
      }
    };

    const handleViewportChange = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = Math.abs(originalHeight - currentHeight);

      // Detect keyboard state
      if (heightDiff > 100) {
        const wasClosed = !keyboardOpen;
        keyboardOpen = currentHeight < originalHeight;

        if (wasClosed && keyboardOpen) {
          console.log('Keyboard opened');
        } else if (!wasClosed && !keyboardOpen) {
          console.log('Keyboard closed - fixing nav position');
          // When keyboard closes, force a more aggressive fix
          setTimeout(() => {
            fixNavPosition();
            // Also scroll to trigger layout recalculation
            const scrollY = window.scrollY;
            window.scrollTo(0, 0);
            window.scrollTo(0, scrollY);
          }, 100);
        }
      }

      // Always run fix on any viewport change
      fixNavPosition();
    };

    const handleFocusIn = () => {
      // Store original height before keyboard opens
      if (!keyboardOpen) {
        originalHeight = window.innerHeight;
      }
    };

    // Listen for visual viewport API
    if ('visualViewport' in window) {
      window.visualViewport!.addEventListener('resize', handleViewportChange);
    }

    window.addEventListener('resize', handleViewportChange);
    document.addEventListener('focusin', handleFocusIn, true);

    // Initial fix
    fixNavPosition();

    // Periodic check to ensure nav stays fixed (every 2 seconds)
    const intervalId = setInterval(() => {
      if (nav && !keyboardOpen) {
        const computedPosition = window.getComputedStyle(nav).position;
        if (computedPosition !== 'fixed') {
          console.log('Nav lost fixed positioning - reapplying');
          fixNavPosition();
        }
      }
    }, 2000);

    return () => {
      clearInterval(intervalId);
      if ('visualViewport' in window) {
        window.visualViewport!.removeEventListener('resize', handleViewportChange);
      }
      window.removeEventListener('resize', handleViewportChange);
      document.removeEventListener('focusin', handleFocusIn, true);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[9999] safe-bottom touch-none will-change-transform"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/log' && pathname.startsWith(item.href));
          const Icon = isActive && item.solidIcon ? item.solidIcon : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 ${
                item.special
                  ? 'text-primary hover:text-primary-dark'
                  : isActive
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              } transition`}
            >
              <div className={item.special ? 'bg-primary text-white rounded-full p-4 -mt-6 shadow-lg' : ''}>
                <Icon className={`${item.special ? 'w-8 h-8' : 'w-6 h-6'}`} />
              </div>
              {!item.special && (
                <span className="text-xs mt-1">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
