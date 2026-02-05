'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { isFavorite, toggleFavorite } from "../lib/storage";
import { Home, MapPin, Coffee, Star, Heart, MessageCircle, Ban, AlertTriangle } from 'lucide-react';

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
type SortType = 'rating-desc' | 'rating-asc' | 'reviews-desc' | 'price-asc' | 'price-desc';

export default function ShopsPage() {
  const [shops, setShops] = useState<GoogleShop[]>([]);
  const [filteredShops, setFilteredShops] = useState<GoogleShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('rating-desc');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [priceFilters, setPriceFilters] = useState<Set<string>>(new Set());
  const [locationRetried, setLocationRetried] = useState(false);

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
          let errorMsg = "Unable to get your location. ";

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMsg += "Location permission was denied. Please enable location in your browser settings or use the search box below.";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMsg += "Location information unavailable. Please use the search box below.";
              break;
            case err.TIMEOUT:
              errorMsg += "Location request timed out. Please use the search box below.";
              break;
            default:
              errorMsg += "Please use the search box below to find coffee shops.";
          }

          // Add HTTPS note for mobile
          if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            errorMsg += " (Note: Mobile browsers require HTTPS for location access)";
          }

          setError(errorMsg);
          setLoading(false);

          const defaultLoc = "33.4484,-112.0740";
          setLocation(defaultLoc);
          fetchShops(defaultLoc);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    } else {
      setError("Geolocation not supported by your browser. Please use the search box.");
      setLoading(false);

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

  // Auto-update filtered shops when shops or filters change
  useEffect(() => {
    if (shops.length > 0) {
      applyFilterAndSort(activeFilter, sortBy, shops, favorites, priceFilters);
    }
  }, [shops, favorites]);

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
    applyFilterAndSort(activeFilter, sortBy, shops, newFavorites, priceFilters);
  };

  const handlePriceFilter = (priceLevel: string) => {
    const newPriceFilters = new Set(priceFilters);

    if (newPriceFilters.has(priceLevel)) {
      newPriceFilters.delete(priceLevel);
    } else {
      newPriceFilters.add(priceLevel);
    }

    setPriceFilters(newPriceFilters);
    applyFilterAndSort(activeFilter, sortBy, shops, favorites, newPriceFilters);
  };

  const applyFilterAndSort = (
    filter: FilterType,
    sort: SortType,
    shopList: GoogleShop[],
    favs: Set<string>,
    priceFilterSet: Set<string>
  ) => {
    let filtered = [...shopList];

    // Apply main filter
    switch (filter) {
      case 'favorites':
        filtered = filtered.filter(shop => favs.has(shop.place_id));
        break;
      case 'open':
        filtered = filtered.filter(shop => shop.open_now === true);
        break;
      case 'high-rated':
        filtered = filtered.filter(shop => shop.rating >= 4.5);
        break;
      default:
        // 'all' - no filter
        break;
    }

    // Apply price filters
    if (priceFilterSet.size > 0) {
      filtered = filtered.filter(shop => priceFilterSet.has(shop.price_level));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case 'rating-desc':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        case 'reviews-desc':
          return b.review_count - a.review_count;
        case 'price-asc':
          const priceOrder: Record<string, number> = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4, 'Not available': 999 };
          return (priceOrder[a.price_level] || 999) - (priceOrder[b.price_level] || 999);
        case 'price-desc':
          const priceOrderDesc: Record<string, number> = { '$': 4, '$$': 3, '$$$': 2, '$$$$': 1, 'Not available': 0 };
          return (priceOrderDesc[a.price_level] || 0) - (priceOrderDesc[b.price_level] || 0);
        default:
          return 0;
      }
    });

    setFilteredShops(filtered);
  };

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
    applyFilterAndSort(filter, sortBy, shops, favorites, priceFilters);
  };

  const handleSortChange = (sort: SortType) => {
    setSortBy(sort);
    applyFilterAndSort(activeFilter, sort, shops, favorites, priceFilters);
  };

  const getActivePriceCount = (price: string) => {
    return shops.filter(s => s.price_level === price).length;
  };

  const hasActiveFilters = activeFilter !== 'all' || priceFilters.size > 0;

  const retryLocation = () => {
    setLocationRetried(true);
    setError(null);
    setLoading(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const loc = `${latitude},${longitude}`;
          setLocation(loc);
          fetchShops(loc);
        },
        (err) => {
          console.error("Geolocation retry error:", err);
          setError("Still unable to get your location. Please use the search box above to find coffee shops.");
          setLoading(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-20">
      {/* Search & Controls */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
          {/* Row 1: Search, Sort, Results */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-3 md:mb-4">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city or zipcode..."
                className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 placeholder-gray-400 text-sm md:text-base"
              />
            </form>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortType)}
              className="px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 bg-white whitespace-nowrap text-sm md:text-base"
            >
              <option value="rating-desc">Top Rated</option>
              <option value="rating-asc">Lowest Rated</option>
              <option value="reviews-desc">Most Reviewed</option>
              <option value="price-asc">Price: $ → $$$$</option>
              <option value="price-desc">Price: $$$$ → $</option>
            </select>

            {/* Results Count */}
            {!loading && (
              <div className="text-xs md:text-sm text-gray-600 whitespace-nowrap px-1 md:px-2">
                {filteredShops.length} found
              </div>
            )}
          </div>

          {/* Row 2: Filters */}
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            <span className="text-xs md:text-sm text-gray-500 mr-1 md:mr-2">Filter:</span>

            {['All', 'Favorites', 'Open Now', '4.5+ Stars'].map((filter) => {
              const filterKey = filter.toLowerCase().replace(/[^a-z]/g, '');
              const isActive = activeFilter === filterKey || (filterKey === 'all' && activeFilter === 'all');

              return (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filterKey as FilterType)}
                  className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition flex items-center gap-1 ${
                    isActive
                      ? 'bg-amber-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterKey === 'all' && <Home className="w-4 h-4" />}
                  {filterKey === 'favorites' && <Heart className="w-4 h-4" />}
                  {filterKey === 'open' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                  {filterKey === '45stars' && <Star className="w-4 h-4" />}
                  {filter}
                </button>
              );
            })}

            <div className="w-px h-3 md:h-4 bg-gray-200 mx-1 md:mx-2" />

            {/* Price Filters */}
            {['$', '$$', '$$$', '$$$$'].map((price) => (
              <button
                key={price}
                onClick={() => handlePriceFilter(price)}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition ${
                  priceFilters.has(price)
                    ? 'bg-amber-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {price} ({getActivePriceCount(price)})
              </button>
            ))}

            {priceFilters.size > 0 && (
              <button
                onClick={() => {
                  setPriceFilters(new Set());
                  applyFilterAndSort(activeFilter, sortBy, shops, favorites, new Set());
                }}
                className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm text-amber-700 hover:text-amber-800 underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-amber-100 border border-amber-300 rounded-lg md:rounded-xl text-amber-800 text-sm md:text-base">
            <p className="mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> <span>{error}</span></p>
            {!locationRetried && (
              <button
                onClick={retryLocation}
                className="bg-amber-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-800 transition flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Try Location Again
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 md:py-12">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
              <Coffee className="w-12 h-12 md:w-16 md:h-16 text-amber-700" />
            </div>
            <p className="text-gray-600 text-sm md:text-base">Finding coffee shops near you...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredShops.length === 0 && !error && (
          <div className="text-center py-8 md:py-12">
            <p className="text-gray-600 text-sm md:text-base">
              {activeFilter === 'favorites' && favorites.size === 0
                ? "No favorites yet. Heart some shops to see them here!"
                : priceFilters.size > 0 && activeFilter === 'all'
                ? "No shops match your price filters. Try clearing them."
                : "No coffee shops found matching your criteria."}
            </p>
          </div>
        )}

        {/* Shop Grid */}
        {!loading && filteredShops.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {hasActiveFilters && (
                <span>
                  Filtered results • {filteredShops.length} of {shops.length} shops shown
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredShops.map((shop) => (
                <Link
                  key={shop.place_id}
                  href={`/shops/${shop.place_id}`}
                  className="bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition p-4 md:p-6 group relative"
                >
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => handleFavoriteToggle(e, shop.place_id, shop.name, shop.address)}
                    className="absolute top-3 md:top-4 right-3 md:right-4 hover:scale-110 transition z-10"
                  >
                    <Heart className={`w-5 h-5 md:w-6 md:h-6 ${favorites.has(shop.place_id) ? 'fill-current text-red-500' : 'text-gray-300'}`} />
                  </button>

                  {/* Shop Icon */}
                  <div className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 group-hover:scale-110 transition flex items-center justify-center">
                    <Coffee className="w-12 h-12 md:w-16 md:h-16 text-amber-700" />
                  </div>

                  {/* Shop Name */}
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 pr-8">
                    {shop.name}
                  </h2>

                  {/* Rating */}
                  {shop.rating > 0 && (
                    <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                      <Star className="w-4 h-4 md:w-5 md:h-5 text-amber-500 fill-current" />
                      <span className="text-amber-600 font-bold text-sm md:text-base">{shop.rating}</span>
                      <span className="text-gray-500 text-xs md:text-sm">
                        ({shop.review_count} reviews)
                      </span>
                    </div>
                  )}

                  {/* Open Now */}
                  {shop.open_now !== null && (
                    <div className="mb-2 md:mb-3">
                      {shop.open_now ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full inline-flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Open Now
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full inline-flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          Closed
                        </span>
                      )}
                    </div>
                  )}

                  {/* Address */}
                  <div className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 flex items-center gap-1">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                    <span>{shop.vicinity || shop.address}</span>
                  </div>

                  {/* Price Level */}
                  {shop.price_level !== 'Not available' && (
                    <div className="text-xs md:text-sm text-gray-700 font-medium">
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
      <footer className="text-center py-6 md:py-8 text-gray-500 text-xs md:text-sm mt-6 md:mt-12">
        <p>Built with Next.js, TypeScript, and Google Places API</p>
      </footer>
    </div>
  );
}
