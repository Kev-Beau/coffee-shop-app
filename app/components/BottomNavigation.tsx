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
    { href: '/shops', icon: MagnifyingGlassIcon, solidIcon: MagnifyingGlassIconSolid, label: 'Shops' },
    { href: '/log', icon: PlusIcon, solidIcon: PlusIcon, label: 'Log', special: true },
    { href: '/friends', icon: UserGroupIcon, solidIcon: UserGroupIconSolid, label: 'Friends' },
    { href: '/profile', icon: UserIcon, solidIcon: UserIconSolid, label: 'Profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/log' && pathname.startsWith(item.href));
          const Icon = isActive && item.solidIcon ? item.solidIcon : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 ${
                item.special
                  ? 'text-amber-700 hover:text-amber-800'
                  : isActive
                  ? 'text-amber-700'
                  : 'text-gray-500 hover:text-gray-700'
              } transition`}
            >
              <div className={item.special ? 'bg-amber-100 rounded-full p-3 -mt-4 shadow-md' : ''}>
                <Icon className={`${item.special ? 'w-7 h-7' : 'w-6 h-6'}`} />
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
