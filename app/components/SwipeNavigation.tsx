'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon, HomeIcon, MagnifyingGlassIcon, UserGroupIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, MagnifyingGlassIcon as MagnifyingGlassIconSolid, UserGroupIcon as UserGroupIconSolid, UserIcon as UserIconSolid } from '@heroicons/react/24/solid';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { useRef } from 'react';

interface Tab {
  id: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  solidIcon: React.ComponentType<{ className?: string }>;
  label: string;
}

const tabs: Tab[] = [
  { id: 'feed', path: '/feed', icon: HomeIcon, solidIcon: HomeIconSolid, label: 'Feed' },
  { id: 'search', path: '/search', icon: MagnifyingGlassIcon, solidIcon: MagnifyingGlassIconSolid, label: 'Search' },
  { id: 'log', path: '/log', icon: PlusIcon, solidIcon: PlusIcon, label: 'Log' },
  { id: 'friends', path: '/friends', icon: UserGroupIcon, solidIcon: UserGroupIconSolid, label: 'Friends' },
  { id: 'profile', path: '/profile', icon: UserIcon, solidIcon: UserIconSolid, label: 'Profile' },
];

interface SwipeNavigationProps {
  children: ReactNode;
}

export default function SwipeNavigation({ children }: SwipeNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showHints, setShowHints] = useState(true);

  // Find current tab index
  useEffect(() => {
    const index = tabs.findIndex(tab => pathname === tab.path || (tab.id !== 'log' && pathname.startsWith(tab.path)));
    if (index !== -1) {
      setCurrentTabIndex(index);
    }
  }, [pathname]);

  // Hide hints after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHints(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Handle swipe navigation
  useSwipeGestures(
    containerRef,
    {
      onSwipeLeft: () => navigateToTab(currentTabIndex + 1),
      onSwipeRight: () => navigateToTab(currentTabIndex - 1),
    },
    { threshold: 80, allowedTime: 500 }
  );

  const navigateToTab = (index: number) => {
    if (isTransitioning) return;

    if (index >= 0 && index < tabs.length) {
      setIsTransitioning(true);
      router.push(tabs[index].path);

      // Reset transition state after navigation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  };

  const currentTab = tabs[currentTabIndex];
  const prevTab = currentTabIndex > 0 ? tabs[currentTabIndex - 1] : null;
  const nextTab = currentTabIndex < tabs.length - 1 ? tabs[currentTabIndex + 1] : null;
  const PrevIcon = prevTab?.icon;
  const NextIcon = nextTab?.icon;
  const CurrentIcon = currentTab?.solidIcon || currentTab?.icon;

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Left edge indicator */}
      {prevTab && showHints && (
        <div className="fixed left-2 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200">
            <ChevronLeftIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200">
            {PrevIcon && <PrevIcon className="w-6 h-6 text-gray-600" />}
          </div>
        </div>
      )}

      {/* Right edge indicator */}
      {nextTab && showHints && (
        <div className="fixed right-2 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200">
            {NextIcon && <NextIcon className="w-6 h-6 text-gray-600" />}
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200">
            <ChevronRightIcon className="w-6 h-6 text-primary" />
          </div>
        </div>
      )}

      {/* Current tab indicator (top center) */}
      {currentTab && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-gray-200 flex items-center gap-2">
            {CurrentIcon && <CurrentIcon className="w-5 h-5 text-primary" />}
            <span className="text-sm font-medium text-gray-700">{currentTab.label}</span>
          </div>
        </div>
      )}

      {/* Hints dismiss button */}
      {showHints && (
        <button
          onClick={() => setShowHints(false)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-primary/90 text-white px-4 py-2 rounded-full text-sm shadow-lg hover:bg-primary transition"
        >
          Got it! ✨
        </button>
      )}

      {/* Main content */}
      <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>

      {/* Always show hints toggle button */}
      <button
        onClick={() => setShowHints(!showHints)}
        className="fixed bottom-8 right-4 z-50 bg-white/90 text-gray-600 p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition"
        aria-label="Toggle navigation hints"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {showHints ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          )}
        </svg>
      </button>
    </div>
  );
}
