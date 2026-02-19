'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    let keyboardOpen = false;
    let initialViewportHeight = window.innerHeight;

    const handleFocusIn = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        keyboardOpen = true;
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      keyboardOpen = false;
      // Small delay to ensure keyboard has started closing
      setTimeout(() => {
        setIsKeyboardOpen(false);
      }, 100);
    };

    const handleViewportChange = () => {
      const currentHeight = window.innerHeight;
      // If height decreased significantly, keyboard is open
      if (Math.abs(initialViewportHeight - currentHeight) > 150) {
        keyboardOpen = true;
        setIsKeyboardOpen(true);
      } else {
        keyboardOpen = false;
        setIsKeyboardOpen(false);
      }
    };

    // Listen for keyboard events
    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('focusout', handleFocusOut, true);

    // Listen for viewport changes (keyboard open/close)
    if ('visualViewport' in window) {
      window.visualViewport!.addEventListener('resize', handleViewportChange);
    }
    window.addEventListener('resize', handleViewportChange);

    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('focusout', handleFocusOut, true);
      if ('visualViewport' in window) {
        window.visualViewport!.removeEventListener('resize', handleViewportChange);
      }
      window.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  const navItems = [
    { href: '/feed', icon: HomeIcon, solidIcon: HomeIconSolid, label: 'Feed' },
    { href: '/search', icon: MagnifyingGlassIcon, solidIcon: MagnifyingGlassIconSolid, label: 'Search' },
    { href: '/log', icon: PlusIcon, solidIcon: PlusIcon, label: 'Log', special: true },
    { href: '/friends', icon: UserGroupIcon, solidIcon: UserGroupIconSolid, label: 'Friends' },
    { href: '/profile', icon: UserIcon, solidIcon: UserIconSolid, label: 'Profile' },
  ];

  // Hide nav when keyboard is open (Twitter/Instagram approach)
  if (isKeyboardOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 safe-bottom">
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
    </div>
  );
}
