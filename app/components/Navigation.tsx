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
    { label: 'About', href: '/about', icon: 'ℹ️' },
  ];

  const loggedInNav: NavItem[] = [
    // Empty - main nav is in bottom bar on mobile
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
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-amber-800 hover:text-amber-900 transition"
          >
            ☕ CoffeeConnect
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {currentNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-amber-700 transition font-medium flex items-center gap-1"
              >
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-amber-700 transition font-medium"
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="text-gray-600 hover:text-amber-700 transition font-medium"
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-amber-700 transition font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-amber-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-800 transition text-sm"
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
        <div className="md:hidden absolute top-14 right-0 left-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1 text-right">
            {currentNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2 justify-end">
                  <span>{item.label}</span>
                  {item.icon && <span>{item.icon}</span>}
                </span>
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/settings"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-right px-3 py-2 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="inline-block px-3 py-2 rounded-lg bg-amber-700 text-white font-medium hover:bg-amber-800 transition"
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
