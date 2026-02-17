'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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

  // Hide bottom nav when any input is focused (reliable iOS Safari fix)
  useEffect(() => {
    const handleFocusIn = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        setIsVisible(false);
      }
    };

    const handleFocusOut = () => {
      // Small delay to ensure keyboard has started closing
      setTimeout(() => setIsVisible(true), 100);
    };

    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('focusout', handleFocusOut, true);

    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('focusout', handleFocusOut, true);
    };
  }, []);

  const navItems = [
    { href: '/feed', icon: HomeIcon, solidIcon: HomeIconSolid, label: 'Feed' },
    { href: '/search', icon: MagnifyingGlassIcon, solidIcon: MagnifyingGlassIconSolid, label: 'Search' },
    { href: '/log', icon: PlusIcon, solidIcon: PlusIcon, label: 'Log', special: true },
    { href: '/friends', icon: UserGroupIcon, solidIcon: UserGroupIconSolid, label: 'Friends' },
    { href: '/profile', icon: UserIcon, solidIcon: UserIconSolid, label: 'Profile' },
  ];

  if (!isVisible) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[9999] safe-bottom transition-transform duration-200 ease-out">
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
