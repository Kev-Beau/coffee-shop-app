'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import DrinkLogModal from './DrinkLogModal';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RecentShop {
  place_id: string;
  place_name: string;
  address: string;
  last_visited: string;
}

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  place_id: string;
  name: string;
  address: string;
  rating?: number;
}

export default function QuickLogModal({ isOpen, onClose }: QuickLogModalProps) {
  const router = useRouter();
  const [recentShops, setRecentShops] = useState<RecentShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<{ id: string; name: string } | null>(null);
  const [showDrinkModal, setShowDrinkModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRecentShops();
    }
  }, [isOpen]);

  const loadRecentShops = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('visits')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        const shopMap = new Map<string, RecentShop>();
        data.forEach((visit: any) => {
          if (!shopMap.has(visit.place_id)) {
            shopMap.set(visit.place_id, {
              place_id: visit.place_id,
              place_name: visit.place_name,
              address: visit.address,
              last_visited: visit.created_at,
            });
          }
        });
        setRecentShops(Array.from(shopMap.values()).slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading recent shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShopSelect = (shop: RecentShop | SearchResult) => {
    const name = 'place_name' in shop ? shop.place_name : shop.name;
    setSelectedShop({ id: shop.place_id, name });
    setShowDrinkModal(true);
    onClose();
  };

  const handleSearchShops = async () => {
    if (searchQuery.trim().length < 2) return;

    setSearchLoading(true);
    try {
      const response = await fetch(`/api/shops/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data.data || []);
    } catch (error) {
      console.error('Error searching shops:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Auto-search when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearchShops();
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDrinkModalClose = () => {
    setShowDrinkModal(false);
    setSelectedShop(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Scrollable container */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="flex min-h-full items-end justify-center">
          <div className="relative bg-white w-full max-w-lg rounded-t-3xl shadow-xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Quick Log</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content Area - scrollable */}
            <div className="overflow-y-auto flex-1" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
              {/* Search Bar */}
              <div className="p-4 pb-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for any coffee shop..."
                  className="w-full pl-12 pr-10 py-4 text-base bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="p-4 pt-2">
                {searchLoading ? (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-3">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
                    <div className="space-y-3 pb-4">
                      {searchResults.map((shop) => (
                        <button
                          key={shop.place_id}
                          onClick={() => handleShopSelect(shop)}
                          className="w-full bg-amber-50 hover:bg-amber-100 rounded-xl p-4 text-left transition overflow-hidden"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-base">{shop.name}</p>
                              <p className="text-sm text-gray-600 truncate">{shop.address}</p>
                            </div>
                            {shop.rating && (
                              <div className="flex items-center gap-1 ml-2">
                                <span className="text-amber-700">★</span>
                                <span className="text-sm text-gray-700">{shop.rating}</span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-3">😕</div>
                    <p className="text-gray-600 text-sm">No results found</p>
                    <p className="text-xs text-gray-500 mt-2">Try a different search term</p>
                  </div>
                )}
              </div>
            )}

            {/* Recent Shops */}
            {!searchQuery && (
              <div className="p-4 pt-2">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">Loading recent shops...</p>
                  </div>
                ) : recentShops.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-3">Or tap a recent shop:</p>
                    <div className="space-y-3 pb-4">
                      {recentShops.map((shop) => (
                        <button
                          key={shop.place_id}
                          onClick={() => handleShopSelect(shop)}
                          className="w-full bg-amber-50 hover:bg-amber-100 rounded-xl p-4 text-left transition"
                        >
                          <p className="font-semibold text-gray-900 text-base">{shop.place_name}</p>
                          <p className="text-sm text-gray-600 truncate">{shop.address}</p>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-3">📍</div>
                    <p className="text-gray-600 text-sm">No recent visits</p>
                    <p className="text-xs text-gray-500 mt-2">Tap search to find coffee shops</p>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Drink Log Modal */}
      {selectedShop && (
        <DrinkLogModal
          isOpen={showDrinkModal}
          onClose={handleDrinkModalClose}
          shopId={selectedShop.id}
          shopName={selectedShop.name}
        />
      )}
    </>
  );
}
