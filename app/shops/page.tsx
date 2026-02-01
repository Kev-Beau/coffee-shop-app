'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

interface GoogleShop {
  place_id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating: number;
  review_count: number;
  price_level: string;
  vicinity: string;
  open_now: boolean | null;
}

export default function ShopsPage() {
  const [shops, setShops] = useState<GoogleShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Get user's location on page load
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const loc = `${latitude},${longitude}`;
          setLocation(loc);
          fetchShops(loc);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Unable to get your location. Please use the search box below.");
          setLoading(false);

          // Default to Phoenix, AZ if geolocation fails
          const defaultLoc = "33.4484,-112.0740";
          setLocation(defaultLoc);
          fetchShops(defaultLoc);
        }
      );
    } else {
      setError("Geolocation not supported by your browser.");
      setLoading(false);

      // Default to Phoenix, AZ
      const defaultLoc = "33.4484,-112.0740";
      setLocation(defaultLoc);
      fetchShops(defaultLoc);
    }
  }, []);

  const fetchShops = async (loc: string, query: string = "coffee shop") => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/places?location=${loc}&query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setShops([]);
      } else {
        setShops(data.shops || []);
      }
    } catch (err) {
      setError("Failed to load coffee shops. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Search for city + coffee shops
      fetchShops("", `${searchQuery} coffee shops`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-white shadow-sm">
        <Link href="/" className="text-2xl font-bold text-amber-800">
          ☕ CoffeeConnect
        </Link>
        <div className="flex gap-6">
          <Link href="/shops" className="text-amber-700 font-semibold">
            Find Shops
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-amber-700 transition">
            About
          </Link>
        </div>
      </nav>

      {/* Page Header */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Real Coffee Shops ☕
          </h1>
          <p className="text-lg text-gray-600">
            Discover actual coffee shops near you (powered by Google)
          </p>
        </div>

        {/* Search Box for Manual Location Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any city (e.g., 'Austin, TX')"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-amber-700 text-white rounded-xl font-semibold hover:bg-amber-800 transition"
            >
              Search
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-amber-100 border border-amber-300 rounded-xl text-amber-800">
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">☕</div>
            <p className="text-gray-600">Finding coffee shops near you...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && shops.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600">No coffee shops found. Try searching for a different city.</p>
          </div>
        )}

        {/* Shop Grid */}
        {!loading && shops.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Found {shops.length} coffee shops
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <Link
                  key={shop.place_id}
                  href={`/shops/${shop.place_id}`}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 group"
                >
                  {/* Shop Icon */}
                  <div className="text-6xl mb-4 group-hover:scale-110 transition">
                    ☕
                  </div>

                  {/* Shop Name */}
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {shop.name}
                  </h2>

                  {/* Rating */}
                  {shop.rating > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-amber-600 font-bold">⭐ {shop.rating}</span>
                      <span className="text-gray-500 text-sm">
                        ({shop.review_count} reviews)
                      </span>
                    </div>
                  )}

                  {/* Open Now */}
                  {shop.open_now !== null && (
                    <div className="mb-3">
                      {shop.open_now ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          🟢 Open Now
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          🔴 Closed
                        </span>
                      )}
                    </div>
                  )}

                  {/* Address */}
                  <div className="text-sm text-gray-600 mb-3">
                    📍 {shop.vicinity || shop.address}
                  </div>

                  {/* Price Level */}
                  {shop.price_level !== 'Not available' && (
                    <div className="text-sm text-gray-700 font-medium">
                      {shop.price_level}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm mt-12">
        <p>Built with Next.js, TypeScript, and Google Places API</p>
      </footer>
    </div>
  );
}
