'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export default function Navigation() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase!.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    router.push('/');
    setMobileMenuOpen(false);
  };

  const loggedOutNav: NavItem[] = [
    { label: 'Find Shops', href: '/shops', icon: '🔍' },
    { label: 'About', href: '/about', icon: 'ℹ️' },
  ];

  const loggedInNav: NavItem[] = [
    { label: 'Find Shops', href: '/shops', icon: '🔍' },
    { label: 'Feed', href: '/feed', icon: '📰' },
    { label: 'Friends', href: '/friends', icon: '👥' },
  ];

  const currentNav = user ? loggedInNav : loggedOutNav;

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 flex items-center justify-between p-6 bg-white shadow-md">
        <div className="text-2xl font-bold text-amber-800">☕ CoffeeConnect</div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-amber-800 hover:text-amber-900 transition"
          >
            ☕ CoffeeConnect
          </Link>

          {/* Setup Warning */}
          {!isSupabaseConfigured && (
            <Link
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 transition"
            >
              ⚠️ Setup Required
            </Link>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {currentNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-amber-700 transition flex items-center gap-1"
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-amber-700 transition"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-amber-700 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-amber-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-800 transition"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {currentNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="block px-3 py-2 rounded-lg bg-amber-700 text-white font-medium hover:bg-amber-800 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
