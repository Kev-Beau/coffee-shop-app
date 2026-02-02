'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  addVisit,
  getVisitCount,
  hasVisited,
  toggleFavorite,
  isFavorite,
} from "../../lib/storage";

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  time: number;
}

interface ShopDetails {
  place_id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  location: { lat: number; lng: number };
  rating: number;
  review_count: number;
  price_level: string;
  photos: string[];
  opening_hours: {
    open_now: boolean;
    weekday_text: string[];
  } | null;
  reviews: GoogleReview[];
}

interface ShopPageProps {
  params: Promise<{ id: string }>;
}

export default function ShopPage({ params }: ShopPageProps) {
  const [shop, setShop] = useState<ShopDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitCount, setVisitCount] = useState(0);
  const [visited, setVisited] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [showVisitMessage, setShowVisitMessage] = useState(false);

  useEffect(() => {
    const loadShop = async () => {
      const { id } = await params;

      // Load visit/favorite state
      setVisited(hasVisited(id));
      setVisitCount(getVisitCount(id));
      setFavorite(isFavorite(id));

      try {
        const response = await fetch(`/api/places/${id}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setShop(data.shop);
        }
      } catch (err) {
        setError("Failed to load shop details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadShop();
  }, [params]);

  const handleVisit = () => {
    if (!shop) return;

    addVisit(shop.place_id, shop.name, shop.address);
    const newCount = getVisitCount(shop.place_id);
    setVisitCount(newCount);
    setVisited(true);

    // Show success message
    setShowVisitMessage(true);
    setTimeout(() => setShowVisitMessage(false), 3000);
  };

  const handleFavorite = () => {
    if (!shop) return;

    const newState = toggleFavorite(shop.place_id, shop.name, shop.address);
    setFavorite(newState);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl md:text-6xl mb-3 md:mb-4">☕</div>
          <p className="text-gray-600 text-sm md:text-base">Loading shop details...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
            {error || "Shop Not Found"}
          </h1>
          <Link href="/shops" className="text-amber-700 hover:underline text-sm md:text-base">
            Back to Shops
          </Link>
        </div>
      </div>
    );
  }

  const getPhotoUrl = (photoReference: string, maxWidth: number = 400) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Navigation - Sticky */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 md:px-6 md:py-6 bg-white shadow-md">
        <Link href="/" className="text-lg md:text-2xl font-bold text-amber-800">
          ☕ CoffeeConnect
        </Link>
        <div className="flex gap-3 md:gap-6 text-sm md:text-base">
          <Link href="/shops" className="text-gray-700 hover:text-amber-700 transition">
            Find Shops
          </Link>
          <Link href="/profile" className="text-gray-700 hover:text-amber-700 transition">
            Profile
          </Link>
        </div>
      </nav>

      {/* Back Button */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <Link
          href="/shops"
          className="inline-flex items-center text-amber-700 hover:underline mb-6"
        >
          ← Back to Shops
        </Link>

        {/* Visit Success Message */}
        {showVisitMessage && (
          <div className="mb-3 md:mb-4 p-3 md:p-4 bg-green-100 border border-green-300 rounded-lg md:rounded-xl text-green-800 animate-pulse text-sm md:text-base">
            🎉 Visit logged! You've been here {visitCount} {visitCount === 1 ? 'time' : 'times'}!
          </div>
        )}

        {/* Shop Header */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-8 mb-6 md:mb-8">
          <div className="flex items-start justify-between mb-4 md:mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 truncate">{shop.name}</h1>
                <button
                  onClick={handleFavorite}
                  className="text-2xl md:text-3xl hover:scale-110 transition flex-shrink-0"
                  title={favorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {favorite ? "❤️" : "🤍"}
                </button>
              </div>
              <p className="text-sm md:text-base text-gray-600 mb-1 md:mb-2">{shop.address}</p>
              {shop.phone && (
                <p className="text-sm md:text-base text-gray-600 mb-1 md:mb-2">📞 {shop.phone}</p>
              )}
              {shop.website && (
                <a
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 hover:underline text-xs md:text-sm"
                >
                  🌐 Visit Website
                </a>
              )}
            </div>
          </div>

          {/* Photos */}
          {shop.photos.length > 0 && (
            <div className="mb-4 md:mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0">
                {shop.photos.slice(0, 5).map((photo, index) => (
                  <img
                    key={index}
                    src={getPhotoUrl(photo)}
                    alt={`${shop.name} photo ${index + 1}`}
                    className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-lg flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rating & Reviews */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6">
            <div className="flex items-center gap-1 md:gap-2">
              <span className="text-lg md:text-2xl font-bold text-amber-600">
                ⭐ {shop.rating}
              </span>
              <span className="text-xs md:text-base text-gray-500">({shop.review_count} reviews)</span>
            </div>
            <span className="text-lg md:text-2xl">{shop.price_level}</span>
            {shop.opening_hours && (
              <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                shop.opening_hours.open_now
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {shop.opening_hours.open_now ? '🟢 Open Now' : '🔴 Closed'}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-4 md:mb-6">
            <button
              onClick={handleVisit}
              className="flex-1 py-2.5 md:py-3 bg-amber-700 text-white rounded-lg md:rounded-xl font-semibold hover:bg-amber-800 transition text-sm md:text-base"
            >
              📍 I'm Here! Log Visit
            </button>
            {visited && visitCount > 0 && (
              <div className="px-4 md:px-6 py-2.5 md:py-3 bg-amber-100 text-amber-800 rounded-lg md:rounded-xl font-semibold text-sm md:text-base text-center">
                Visited {visitCount}x
              </div>
            )}
          </div>

          {/* Opening Hours */}
          {shop.opening_hours && shop.opening_hours.weekday_text && (
            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">🕐 Opening Hours</h3>
              <div className="space-y-1 text-xs md:text-sm text-gray-600">
                {shop.opening_hours.weekday_text.map((day, index) => (
                  <div key={index}>{day}</div>
                ))}
              </div>
            </div>
          )}

          {/* Map Link */}
          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.name + ' ' + shop.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-semibold text-sm md:text-base"
            >
              🗺️ Open in Google Maps
            </a>
          </div>
        </div>

        {/* Google Reviews Section */}
        {shop.reviews && shop.reviews.length > 0 && (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Google Reviews</h2>

            <div className="space-y-4 md:space-y-6">
              {shop.reviews.slice(0, 5).map((review, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 md:pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold text-xs md:text-sm flex-shrink-0">
                        {review.author_name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 text-sm md:text-base truncate">{review.author_name}</div>
                        <div className="text-xs md:text-sm text-gray-500">{review.relative_time_description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 font-bold text-sm md:text-base flex-shrink-0">
                      ⭐ {review.rating}
                    </div>
                  </div>
                  {review.text && <p className="text-gray-700 text-sm md:text-base">{review.text}</p>}
                </div>
              ))}
            </div>
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
