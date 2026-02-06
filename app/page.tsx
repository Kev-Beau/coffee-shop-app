'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MapPin, Star, Users } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and redirect to feed
    const checkSession = async () => {
      if (!isSupabaseConfigured || !supabase) return;

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.replace('/feed');
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-lighter to-primary-light">
      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Discover Your Next
            <span className="block text-primary">Favorite Coffee Spot</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Join friends in exploring the best local coffee shops. Share drinks,
            find hidden gems, and connect over your love of great coffee.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/feed"
              className="px-8 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition shadow-lg"
            >
              View Feed
            </Link>
            <Link
              href="/shops"
              className="px-8 py-4 bg-white text-primary rounded-full font-semibold hover:bg-primary-lighter transition shadow-lg border border-amber-200"
            >
              Find Shops
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition">
            <div className="w-12 h-12 mb-4 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Discover Local</h3>
            <p className="text-gray-600">
              Find coffee shops near you with detailed maps and directions
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition">
            <div className="w-12 h-12 mb-4 flex items-center justify-center">
              <Star className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Share Reviews</h3>
            <p className="text-gray-600">
              Rate and review shops to help friends find the best spots
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition">
            <div className="w-12 h-12 mb-4 flex items-center justify-center">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Connect</h3>
            <p className="text-gray-600">
              See where your friends are going and plan coffee meetups
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
      </footer>
    </div>
  );
}
