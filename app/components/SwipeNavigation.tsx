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
  const [showHints, setShowHints] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

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
    setTargetTab(null);
    setDragDirection(null);
    setDragOffset(0);
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
      {/* Swipe hint arrows with navigation indicators */}
      {(showHints || targetTab) && (
        <>
          {/* Left side - swiping right to previous tab */}
          {currentTabIndex > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: targetTab && dragDirection === 'right' ? 1 : 0.3,
                x: Math.max(-20, dragOffset),
              }}
              transition={{ duration: 0.1 }}
              className="fixed left-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center gap-2"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-gray-200">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              {targetTab && dragDirection === 'right' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-primary/95 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap"
                >
                  {(() => {
                    const Icon = targetIcon;
                    return Icon && <Icon className="w-4 h-4" />;
                  })()}
                  <span className="text-sm font-medium">{targetTab.label}</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Right side - swiping left to next tab */}
          {currentTabIndex < tabs.length - 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: targetTab && dragDirection === 'left' ? 1 : 0.3,
                x: Math.min(20, dragOffset),
              }}
              transition={{ duration: 0.1 }}
              className="fixed right-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center gap-2"
            >
              {targetTab && dragDirection === 'left' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-primary/95 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap"
                >
                  {(() => {
                    const Icon = targetIcon;
                    return Icon && <Icon className="w-4 h-4" />;
                  })()}
                  <span className="text-sm font-medium">{targetTab.label}</span>
                </motion.div>
              )}
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
