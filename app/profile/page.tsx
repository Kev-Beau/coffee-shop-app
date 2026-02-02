'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getVisits,
  getRecentVisits,
  getShopStats,
  getFavorites,
  getVisitCount,
} from "../lib/storage";

export default function ProfilePage() {
  const [stats, setStats] = useState({ totalVisits: 0, uniqueShops: 0, favoriteCount: 0 });
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    // Load data from localStorage
    setStats(getShopStats());
    setRecentVisits(getRecentVisits(20));
    setFavorites(getFavorites());
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 py-3 md:px-6 md:py-6 bg-white shadow-sm">
        <Link href="/" className="text-lg md:text-2xl font-bold text-amber-800">
          ☕ CoffeeConnect
        </Link>
        <div className="flex gap-3 md:gap-6 text-sm md:text-base">
          <Link href="/shops" className="text-gray-700 hover:text-amber-700 transition">
            Find Shops
          </Link>
          <Link href="/profile" className="text-amber-700 font-semibold">
            Profile
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8">Your Coffee Journey ☕</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-center">
            <div className="text-3xl md:text-5xl mb-1 md:mb-2">📍</div>
            <div className="text-2xl md:text-4xl font-bold text-amber-700 mb-1 md:mb-2">{stats.totalVisits}</div>
            <div className="text-gray-600 text-sm md:text-base">Total Visits</div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-center">
            <div className="text-3xl md:text-5xl mb-1 md:mb-2">☕</div>
            <div className="text-2xl md:text-4xl font-bold text-amber-700 mb-1 md:mb-2">{stats.uniqueShops}</div>
            <div className="text-gray-600 text-sm md:text-base">Unique Shops</div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-center">
            <div className="text-3xl md:text-5xl mb-1 md:mb-2">❤️</div>
            <div className="text-2xl md:text-4xl font-bold text-amber-700 mb-1 md:mb-2">{stats.favoriteCount}</div>
            <div className="text-gray-600 text-sm md:text-base">Favorites</div>
          </div>
        </div>

        {/* Favorite Shops */}
        {favorites.length > 0 && (
          <div className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">❤️ Your Favorites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {favorites.map((fav) => (
                <Link
                  key={fav.placeId}
                  href={`/shops/${fav.placeId}`}
                  className="bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-xl transition p-3 md:p-4"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="text-2xl md:text-4xl">☕</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">{fav.placeName}</h3>
                      <p className="text-xs md:text-sm text-gray-600 truncate">{fav.address}</p>
                    </div>
                    <div className="text-xl md:text-2xl">❤️</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Visits */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">📍 Recent Activity</h2>

          {recentVisits.length === 0 ? (
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-8 md:p-12 text-center">
              <div className="text-4xl md:text-6xl mb-3 md:mb-4">☕</div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">No visits yet!</h3>
              <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
                Start exploring coffee shops and log your visits to build your coffee journey.
              </p>
              <Link
                href="/shops"
                className="inline-block px-5 md:px-6 py-2.5 md:py-3 bg-amber-700 text-white rounded-lg md:rounded-xl font-semibold hover:bg-amber-800 transition text-sm md:text-base"
              >
                Find Coffee Shops
              </Link>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {recentVisits.map((visit, index) => (
                <Link
                  key={index}
                  href={`/shops/${visit.placeId}`}
                  className="bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-xl transition p-3 md:p-4 block"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className="text-2xl md:text-4xl">☕</div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">{visit.placeName}</h3>
                        <p className="text-xs md:text-sm text-gray-600 truncate">{visit.address}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs md:text-sm text-gray-500">{formatDate(visit.timestamp)}</div>
                      <div className="text-amber-700 font-semibold text-xs md:text-sm">
                        {getVisitCount(visit.placeId)} {getVisitCount(visit.placeId) === 1 ? 'visit' : 'visits'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Clear Data Button */}
        {recentVisits.length > 0 && (
          <div className="mt-8 md:mt-12 text-center">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
                  localStorage.removeItem('coffeeconnect_visits');
                  localStorage.removeItem('coffeeconnect_favorites');
                  window.location.reload();
                }
              }}
              className="text-xs md:text-sm text-red-600 hover:text-red-700 underline"
            >
              Clear All Data
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 md:py-8 text-gray-500 text-xs md:text-sm mt-6 md:mt-12">
        <p>Built with Next.js, TypeScript, and Google Places API</p>
      </footer>
    </div>
  );
}
