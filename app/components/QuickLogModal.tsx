'use client';

import { useEffect, useState } from 'react';
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

export default function QuickLogModal({ isOpen, onClose }: QuickLogModalProps) {
  const [recentShops, setRecentShops] = useState<RecentShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<{ id: string; name: string } | null>(null);
  const [showDrinkModal, setShowDrinkModal] = useState(false);

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

  const handleShopSelect = (shop: RecentShop) => {
    setSelectedShop({ id: shop.place_id, name: shop.place_name });
    setShowDrinkModal(true);
  };

  const handleDrinkModalClose = () => {
    setShowDrinkModal(false);
    setSelectedShop(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Quick Log</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <XMarkIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 80px)' }}>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Loading recent shops...</p>
              </div>
            ) : recentShops.length > 0 ? (
              <>
                <p className="text-sm text-gray-600 mb-3">Tap a shop to log a drink:</p>
                <div className="space-y-2 mb-4">
                  {recentShops.map((shop) => (
                    <button
                      key={shop.place_id}
                      onClick={() => handleShopSelect(shop)}
                      className="w-full bg-amber-50 hover:bg-amber-100 rounded-xl p-3 text-left transition"
                    >
                      <p className="font-semibold text-gray-900">{shop.place_name}</p>
                      <p className="text-sm text-gray-600 truncate">{shop.address}</p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">📍</div>
                <p className="text-gray-600 mb-4">No recent visits yet</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <a
                href="/shops"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                <span>Browse all coffee shops</span>
              </a>
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
