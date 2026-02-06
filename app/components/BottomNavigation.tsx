'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  const navItems = [
    { href: '/feed', icon: HomeIcon, solidIcon: HomeIconSolid, label: 'Feed' },
    { href: '/search', icon: MagnifyingGlassIcon, solidIcon: MagnifyingGlassIconSolid, label: 'Search' },
    { href: '/log', icon: PlusIcon, solidIcon: PlusIcon, label: 'Log', special: true },
    { href: '/friends', icon: UserGroupIcon, solidIcon: UserGroupIconSolid, label: 'Friends' },
    { href: '/profile', icon: UserIcon, solidIcon: UserIconSolid, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
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
