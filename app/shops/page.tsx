'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { isFavorite, toggleFavorite } from "../lib/storage";

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

type FilterType = 'all' | 'favorites' | 'open' | 'high-rated';

export default function ShopsPage() {
  const [shops, setShops] = useState<GoogleShop[]>([]);
  const [filteredShops, setFilteredShops] = useState<GoogleShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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

  // Load favorites from localStorage
  useEffect(() => {
    const favs = new Set<string>();
    shops.forEach(shop => {
      if (isFavorite(shop.place_id)) {
        favs.add(shop.place_id);
      }
    });
    setFavorites(favs);
  }, [shops]);

  const fetchShops = async (loc: string, query: string = "coffee shop") => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/places?location=${loc}&query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setShops([]);
        setFilteredShops([]);
      } else {
        setShops(data.shops || []);
        setFilteredShops(data.shops || []);
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
      fetchShops("", `${searchQuery} coffee shops`);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent, placeId: string, placeName: string, address: string) => {
    e.preventDefault();
    e.stopPropagation();

    const newState = toggleFavorite(placeId, placeName, address);
    const newFavorites = new Set(favorites);

    if (newState) {
      newFavorites.add(placeId);
    } else {
      newFavorites.delete(placeId);
    }

    setFavorites(newFavorites);
    applyFilter(activeFilter, shops, newFavorites);
  };

  const applyFilter = (filter: FilterType, shopList: GoogleShop[], favs: Set<string>) => {
    let filtered = shopList;

    switch (filter) {
      case 'favorites':
        filtered = shopList.filter(shop => favs.has(shop.place_id));
        break;
      case 'open':
        filtered = shopList.filter(shop => shop.open_now === true);
        break;
      case 'high-rated':
        filtered = shopList.filter(shop => shop.rating >= 4.5);
        break;
      default:
        filtered = shopList;
    }

    setFilteredShops(filtered);
  };

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
    applyFilter(filter, shops, favorites);
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
          <Link href="/profile" className="text-gray-700 hover:text-amber-700 transition">
            Profile
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
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-amber-700 text-white rounded-xl font-semibold hover:bg-amber-800 transition"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => handleFilterClick('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeFilter === 'all'
                ? 'bg-amber-700 text-white'
                : 'bg-white text-gray-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            All Shops ({shops.length})
          </button>
          <button
            onClick={() => handleFilterClick('favorites')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeFilter === 'favorites'
                ? 'bg-amber-700 text-white'
                : 'bg-white text-gray-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            ❤️ Favorites ({favorites.size})
          </button>
          <button
            onClick={() => handleFilterClick('open')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeFilter === 'open'
                ? 'bg-amber-700 text-white'
                : 'bg-white text-gray-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            🟢 Open Now
          </button>
          <button
            onClick={() => handleFilterClick('high-rated')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeFilter === 'high-rated'
                ? 'bg-amber-700 text-white'
                : 'bg-white text-gray-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            ⭐ 4.5+ Stars
          </button>
        </div>

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
        {!loading && filteredShops.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {activeFilter === 'favorites' && favorites.size === 0
                ? "No favorites yet. Heart some shops to see them here!"
                : "No coffee shops found matching this filter."}
            </p>
          </div>
        )}

        {/* Shop Grid */}
        {!loading && filteredShops.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredShops.length} {activeFilter !== 'all' ? `(${activeFilter}) ` : ''}coffee shops
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShops.map((shop) => (
                <Link
                  key={shop.place_id}
                  href={`/shops/${shop.place_id}`}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 group relative"
                >
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => handleFavoriteToggle(e, shop.place_id, shop.name, shop.address)}
                    className="absolute top-4 right-4 text-2xl hover:scale-110 transition z-10"
                  >
                    {favorites.has(shop.place_id) ? "❤️" : "🤍"}
                  </button>

                  {/* Shop Icon */}
                  <div className="text-6xl mb-4 group-hover:scale-110 transition">
                    ☕
                  </div>

                  {/* Shop Name */}
                  <h2 className="text-xl font-bold text-gray-900 mb-2 pr-8">
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
