'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
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
  const [isVisible, setIsVisible] = useState(true);
  const navRef = useRef<HTMLElement>(null);
  const isKeyboardActive = useRef(false);

  // iOS Safari PWA keyboard handling with scroll fix
  useEffect(() => {
    const handleFocusIn = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        isKeyboardActive.current = true;
        setIsVisible(false);
      }
    };

    const handleFocusOut = () => {
      isKeyboardActive.current = false;
      // Use requestAnimationFrame to ensure this runs after iOS viewport manipulation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
          // Force reflow to reset fixed positioning
          forceReflow();
        });
      });
    };

    // Force reflow to reset iOS Safari's viewport reference
    const forceReflow = () => {
      if (navRef.current) {
        const nav = navRef.current;
        // Force a reflow by reading offsetHeight
        void nav.offsetHeight;
        // Reset position styles to force iOS to recalculate
        nav.style.position = 'fixed';
        nav.style.bottom = '0';
        nav.style.transform = 'translate3d(0, 0, 0)';
      }
    };

    // Ensure nav stays fixed on scroll (iOS PWA fix)
    const handleScroll = () => {
      if (navRef.current && !isKeyboardActive.current && isVisible) {
        const nav = navRef.current;
        const rect = nav.getBoundingClientRect();

        // If nav has moved from bottom, reset it
        if (rect.bottom !== window.innerHeight) {
          requestAnimationFrame(() => {
            nav.style.position = 'fixed';
            nav.style.bottom = '0';
            nav.style.transform = 'translate3d(0, 0, 0)';
          });
        }
      }
    };

    // Visual viewport API for iOS Safari 13+
    const handleViewportResize = () => {
      if (navRef.current && !isKeyboardActive.current) {
        forceReflow();
      }
    };

    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('focusout', handleFocusOut, true);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleViewportResize);

    // Initial reflow
    forceReflow();

    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('focusout', handleFocusOut, true);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleViewportResize);
    };
  }, [isVisible]);

  const navItems = [
    { href: '/feed', icon: HomeIcon, solidIcon: HomeIconSolid, label: 'Feed' },
    { href: '/search', icon: MagnifyingGlassIcon, solidIcon: MagnifyingGlassIconSolid, label: 'Search' },
    { href: '/log', icon: PlusIcon, solidIcon: PlusIcon, label: 'Log', special: true },
    { href: '/friends', icon: UserGroupIcon, solidIcon: UserGroupIconSolid, label: 'Friends' },
    { href: '/profile', icon: UserIcon, solidIcon: UserIconSolid, label: 'Profile' },
  ];

  if (!isVisible) return null;

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[9999] safe-bottom transition-transform duration-200 ease-out"
      style={{
        WebkitTransform: 'translate3d(0, 0, 0)',
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}
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
