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
      <nav className="flex items-center justify-between p-6 bg-white shadow-sm">
        <Link href="/" className="text-2xl font-bold text-amber-800">
          ☕ CoffeeConnect
        </Link>
        <div className="flex gap-6">
          <Link href="/shops" className="text-gray-700 hover:text-amber-700 transition">
            Find Shops
          </Link>
          <Link href="/profile" className="text-amber-700 font-semibold">
            Profile
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Coffee Journey ☕</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-5xl mb-2">📍</div>
            <div className="text-4xl font-bold text-amber-700 mb-2">{stats.totalVisits}</div>
            <div className="text-gray-600">Total Visits</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-5xl mb-2">☕</div>
            <div className="text-4xl font-bold text-amber-700 mb-2">{stats.uniqueShops}</div>
            <div className="text-gray-600">Unique Shops</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-5xl mb-2">❤️</div>
            <div className="text-4xl font-bold text-amber-700 mb-2">{stats.favoriteCount}</div>
            <div className="text-gray-600">Favorites</div>
          </div>
        </div>

        {/* Favorite Shops */}
        {favorites.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">❤️ Your Favorites</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {favorites.map((fav) => (
                <Link
                  key={fav.placeId}
                  href={`/shops/${fav.placeId}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">☕</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{fav.placeName}</h3>
                      <p className="text-sm text-gray-600">{fav.address}</p>
                    </div>
                    <div className="text-2xl">❤️</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Visits */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📍 Recent Activity</h2>

          {recentVisits.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">☕</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No visits yet!</h3>
              <p className="text-gray-600 mb-6">
                Start exploring coffee shops and log your visits to build your coffee journey.
              </p>
              <Link
                href="/shops"
                className="inline-block px-6 py-3 bg-amber-700 text-white rounded-xl font-semibold hover:bg-amber-800 transition"
              >
                Find Coffee Shops
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentVisits.map((visit, index) => (
                <Link
                  key={index}
                  href={`/shops/${visit.placeId}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4 block"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">☕</div>
                      <div>
                        <h3 className="font-bold text-gray-900">{visit.placeName}</h3>
                        <p className="text-sm text-gray-600">{visit.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{formatDate(visit.timestamp)}</div>
                      <div className="text-amber-700 font-semibold">
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
          <div className="mt-12 text-center">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
                  localStorage.removeItem('coffeeconnect_visits');
                  localStorage.removeItem('coffeeconnect_favorites');
                  window.location.reload();
                }
              }}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Clear All Data
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm mt-12">
        <p>Built with Next.js, TypeScript, and Google Places API</p>
      </footer>
    </div>
  );
}
