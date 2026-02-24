'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  PlusIcon as PlusIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

interface Tab {
  id: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  solidIcon: React.ComponentType<{ className?: string }>;
  label: string;
}

const tabs: Tab[] = [
  { id: 'feed', path: '/feed', icon: HomeIcon, solidIcon: HomeIconSolid, label: 'Feed' },
  { id: 'searchlog', path: '/search', icon: MagnifyingGlassIcon, solidIcon: MagnifyingGlassIconSolid, label: 'Search & Log' },
  { id: 'friends', path: '/friends', icon: UserGroupIcon, solidIcon: UserGroupIconSolid, label: 'Friends' },
  { id: 'profile', path: '/profile', icon: UserIcon, solidIcon: UserIconSolid, label: 'Profile' },
];

interface SwipeNavigationProps {
  children: ReactNode;
}

export default function SwipeNavigation({ children }: SwipeNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [targetTab, setTargetTab] = useState<Tab | null>(null);
  const [showHints, setShowHints] = useState(true);

  // Find current tab index
  useEffect(() => {
    const index = tabs.findIndex(tab => {
      if (tab.id === 'searchlog') {
        return pathname === '/search' || pathname === '/log' || pathname.startsWith('/search') || pathname.startsWith('/log');
      }
      return pathname === tab.path || pathname.startsWith(tab.path);
    });
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

  const currentTab = tabs[currentTabIndex];
  const CurrentIcon = currentTab?.solidIcon || currentTab?.icon;

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 100;
    const { offset } = info;

    if (offset.x < -swipeThreshold && currentTabIndex < tabs.length - 1) {
      // Swiped left - go to next tab
      setTargetTab(tabs[currentTabIndex + 1]);
      setTimeout(() => {
        router.push(tabs[currentTabIndex + 1].path);
        setTargetTab(null);
      }, 200);
    } else if (offset.x > swipeThreshold && currentTabIndex > 0) {
      // Swiped right - go to previous tab
      setTargetTab(tabs[currentTabIndex - 1]);
      setTimeout(() => {
        router.push(tabs[currentTabIndex - 1].path);
        setTargetTab(null);
      }, 200);
    }
  };

  const handleDrag = (event: any, info: PanInfo) => {
    const dragThreshold = 50;

    // Show target tab during drag
    if (info.offset.x < -dragThreshold && currentTabIndex < tabs.length - 1) {
      setTargetTab(tabs[currentTabIndex + 1]);
    } else if (info.offset.x > dragThreshold && currentTabIndex > 0) {
      setTargetTab(tabs[currentTabIndex - 1]);
    } else {
      setTargetTab(null);
    }
  };

  const handleDragStart = () => {
    setTargetTab(null);
  };

  const targetIcon = targetTab?.solidIcon || targetTab?.icon;

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className="relative min-h-screen"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Navigating indicator - shows during swipe */}
      {targetTab && targetIcon && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-primary/95 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
            {(() => {
              const Icon = targetIcon;
              return <Icon className="w-5 h-5" />;
            })()}
            <span className="font-medium">Navigating to {targetTab.label}</span>
          </div>
        </motion.div>
      )}

      {/* Swipe hint arrows - show during swipe */}
      {(showHints || targetTab) && (
        <>
          {/* Left arrow - can swipe right */}
          {currentTabIndex > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: targetTab ? 1 : 0.3,
                x: targetTab ? 0 : -20,
              }}
              transition={{ duration: 0.2 }}
              className="fixed left-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-gray-200">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </motion.div>
          )}

          {/* Right arrow - can swipe left */}
          {currentTabIndex < tabs.length - 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: targetTab ? 1 : 0.3,
                x: targetTab ? 0 : 20,
              }}
              transition={{ duration: 0.2 }}
              className="fixed right-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-gray-200">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Current tab indicator (top center) */}
      {currentTab && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-gray-200 flex items-center gap-2">
            {CurrentIcon && <CurrentIcon className="w-5 h-5 text-primary" />}
            <span className="text-sm font-medium text-gray-700">{currentTab.label}</span>
          </div>
        </motion.div>
      )}

      {/* Initial hints dismiss button */}
      {showHints && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={() => setShowHints(false)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-primary/95 text-white px-6 py-3 rounded-full text-sm shadow-lg hover:bg-primary transition"
        >
          Got it, thanks! ✨
        </motion.button>
      )}

      {/* Main content with smooth transitions */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
