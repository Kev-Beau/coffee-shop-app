'use client';

import { useState, useEffect, ReactNode, useRef } from 'react';
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
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';

interface Tab {
  id: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  solidIcon: React.ComponentType<{ className?: string }>;
  label: string;
}

const tabs: Tab[] = [
  { id: 'explore', path: '/feed', icon: HomeIcon, solidIcon: HomeIconSolid, label: 'Explore' },
  { id: 'log', path: '/search', icon: PlusIcon, solidIcon: PlusIconSolid, label: 'Log' },
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
  const [showCurrentTab, setShowCurrentTab] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [pageReady, setPageReady] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Find current tab index
  useEffect(() => {
    const index = tabs.findIndex(tab => {
      if (tab.id === 'log') {
        return pathname === '/search' || pathname.startsWith('/search');
      }
      return pathname === tab.path || pathname.startsWith(tab.path);
    });
    if (index !== -1) {
      setCurrentTabIndex(index);
    }
  }, [pathname]);

  // Hide current tab indicator after 2 seconds
  useEffect(() => {
    setShowCurrentTab(true);
    const timer = setTimeout(() => {
      setShowCurrentTab(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Mark page as ready after content loads
  useEffect(() => {
    setPageReady(false);
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname, children]);

  const currentTab = tabs[currentTabIndex];
  const CurrentIcon = currentTab?.solidIcon || currentTab?.icon;

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const swipeThreshold = 65; // Reduced from 100 for easier triggering
    const { offset } = info;

    if (offset.x < -swipeThreshold && currentTabIndex < tabs.length - 1) {
      // Swiped left - go to next tab
      const nextTab = tabs[currentTabIndex + 1];
      setTargetTab(nextTab);
      setIsNavigating(true);

      // Immediate navigation - no delay
      router.push(nextTab.path);

      setTimeout(() => {
        setTargetTab(null);
        setIsNavigating(false);
      }, 150); // Faster fade out
    } else if (offset.x > swipeThreshold && currentTabIndex > 0) {
      // Swiped right - go to previous tab
      const prevTab = tabs[currentTabIndex - 1];
      setTargetTab(prevTab);
      setIsNavigating(true);

      // Immediate navigation - no delay
      router.push(prevTab.path);

      setTimeout(() => {
        setTargetTab(null);
        setIsNavigating(false);
      }, 150); // Faster fade out
    }
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (isNavigating) return;

    const dragThreshold = 35; // Reduced from 50 to show hints earlier

    // Track drag offset and direction
    setDragOffset(info.offset.x);

    // Show target tab during drag
    if (info.offset.x < -dragThreshold && currentTabIndex < tabs.length - 1) {
      setTargetTab(tabs[currentTabIndex + 1]);
      setDragDirection('left');
    } else if (info.offset.x > dragThreshold && currentTabIndex > 0) {
      setTargetTab(tabs[currentTabIndex - 1]);
      setDragDirection('right');
    } else {
      setTargetTab(null);
      setDragDirection(null);
    }
  };

  const handleDragStart = () => {
    if (isNavigating) return;
    setTargetTab(null);
    setDragDirection(null);
    setDragOffset(0);
  };

  const targetIcon = targetTab?.solidIcon || targetTab?.icon;

  return (
    <motion.div
      drag={isNavigating ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className="relative min-h-screen"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Permanent swipe hint indicators */}
      <AnimatePresence>
        <>
          {/* Left side - swiping right to previous tab */}
          {currentTabIndex > 0 && (
            <motion.div
              animate={{
                opacity: targetTab && dragDirection === 'right' ? 1 : 0.3,
                scale: targetTab && dragDirection === 'right' ? 1 : 0.85,
                x: Math.max(-20, dragOffset * 0.3),
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed left-3 top-1/2 -translate-y-1/2 z-40 pointer-events-none"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200/50">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              {targetTab && dragDirection === 'right' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="ml-2 bg-gray-900/95 backdrop-blur-md text-white px-3 py-2 rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap border border-white/10"
                >
                  {(() => {
                    const Icon = targetIcon;
                    return Icon && <Icon className="w-4 h-4" />;
                  })()}
                  <span className="text-xs font-semibold">{targetTab.label}</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Right side - swiping left to next tab */}
          {currentTabIndex < tabs.length - 1 && (
            <motion.div
              animate={{
                opacity: targetTab && dragDirection === 'left' ? 1 : 0.3,
                scale: targetTab && dragDirection === 'left' ? 1 : 0.85,
                x: Math.min(20, dragOffset * 0.3),
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed right-3 top-1/2 -translate-y-1/2 z-40 pointer-events-none"
            >
              {targetTab && dragDirection === 'left' && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="mr-2 bg-gray-900/95 backdrop-blur-md text-white px-3 py-2 rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap border border-white/10"
                >
                  {(() => {
                    const Icon = targetIcon;
                    return Icon && <Icon className="w-4 h-4" />;
                  })()}
                  <span className="text-xs font-semibold">{targetTab.label}</span>
                </motion.div>
              )}
              <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200/50">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          )}
        </>
      </AnimatePresence>

      {/* Current tab indicator (top center) - auto-hides after 2 seconds */}
      <AnimatePresence>
        {currentTab && showCurrentTab && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="bg-gray-900/95 backdrop-blur-md rounded-full px-6 py-3 shadow-2xl flex items-center gap-2.5 border border-white/10">
              {CurrentIcon && <CurrentIcon className="w-5 h-5 text-white" />}
              <span className="text-sm font-semibold text-white tracking-tight">{currentTab.label}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Loading overlay during navigation */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-sm z-30 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-700">Loading...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content with smooth transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          ref={contentRef}
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: pageReady ? 1 : 0, scale: pageReady ? 1 : 0.97, y: pageReady ? 0 : 15 }}
          exit={{ opacity: 0, scale: 1.03, y: -15 }}
          transition={{
            type: 'spring',
            stiffness: 320,
            damping: 28,
            opacity: { duration: 0.25 }
          }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
