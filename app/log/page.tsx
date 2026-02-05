'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ClockIcon } from '@heroicons/react/24/outline';
import DrinkLogModal from '../components/DrinkLogModal';

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

export default function LogPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [recentShops, setRecentShops] = useState<RecentShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<{ id: string; name: string } | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setUser(session.user);
    loadRecentShops(session.user.id);
  };

  const loadRecentShops = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('visits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        // Group by place and get most recent visit
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

  const handleShopSelect = (shop: RecentShop) => {
    setSelectedShop({ id: shop.place_id, name: shop.place_name });
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Quick Log</h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          {recentShops.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="w-5 h-5 text-amber-700" />
                <h2 className="text-lg font-semibold text-gray-900">Recently Visited</h2>
              </div>

              <div className="space-y-3">
                {recentShops.map((shop) => (
                  <button
                    key={shop.place_id}
                    onClick={() => handleShopSelect(shop)}
                    className="w-full bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{shop.place_name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">{shop.address}</p>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">{formatDate(shop.last_visited)}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => router.push('/shops')}
                  className="text-amber-700 hover:text-amber-800 font-medium"
                >
                  Browse all coffee shops →
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📍</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Recent Visits</h2>
              <p className="text-gray-600 mb-6">Start exploring coffee shops to build your history!</p>
              <button
                onClick={() => router.push('/shops')}
                className="inline-block bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-800 transition"
              >
                Find Coffee Shops
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Drink Log Modal */}
      {selectedShop && (
        <DrinkLogModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedShop(null);
          }}
          shopId={selectedShop.id}
          shopName={selectedShop.name}
        />
      )}
    </>
  );
}
