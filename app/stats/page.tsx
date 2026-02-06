'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Coffee,
  MapPin,
  Heart,
  Star,
  TrendingUp,
  ArrowLeftIcon,
} from 'lucide-react';
import { ArrowLeftIcon as ArrowLeftHero } from '@heroicons/react/24/outline';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ShopStats {
  shop_id: string;
  shop_name: string;
  visit_count: number;
}

interface DrinkStats {
  drink_name: string;
  post_count: number;
  avg_rating: number;
}

interface PostingFrequency {
  date: string;
  post_count: number;
}

interface UserStats {
  total_posts: number;
  total_visits: number;
  total_favorites: number;
  avg_rating: number;
  most_visited_shops: ShopStats[];
  favorite_drinks: DrinkStats[];
  posting_frequency: PostingFrequency[];
  coffee_preferences: {
    temperature: string;
    sweetness: string;
    strength: string;
    milk: string;
    favorite_drinks: string[];
    preferred_roast: string;
    brewing_method: string;
    coffee_strength: string;
  };
}

export default function StatsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    loadStats();
  };

  const loadStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/stats', { headers });
      const data = await response.json();

      setStats(data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getMaxPostCount = () => {
    if (!stats?.posting_frequency.length) return 1;
    return Math.max(...stats.posting_frequency.map((f) => f.post_count));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-lighter via-primary-light to-primary-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-900 font-medium">Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lighter via-primary-light to-primary-light pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white rounded-xl text-primary shadow-sm hover:shadow-md transition"
          >
            <ArrowLeftHero className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Coffee Stats</h1>
            <p className="text-sm text-gray-600">Your coffee journey insights</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-white rounded-xl text-primary shadow-sm hover:shadow-md transition disabled:opacity-50"
          >
            <TrendingUp className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={Squares2X2Icon}
            label="Posts"
            value={stats?.total_posts || 0}
            color="amber"
          />
          <StatCard
            icon={MapPin}
            label="Shops Visited"
            value={stats?.total_visits || 0}
            color="orange"
          />
          <StatCard
            icon={Heart}
            label="Favorites"
            value={stats?.total_favorites || 0}
            color="red"
          />
          <StatCard
            icon={Star}
            label="Avg Rating"
            value={stats?.avg_rating?.toFixed(1) || '0.0'}
            color="yellow"
            isRating
          />
        </div>

        {/* Most Visited Shops */}
        <div className="bg-white rounded-3xl shadow-lg p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Most Visited Shops</h2>
              <p className="text-xs text-gray-500">Your favorite coffee spots</p>
            </div>
          </div>

          {stats?.most_visited_shops.length ? (
            <div className="space-y-3">
              {stats.most_visited_shops.map((shop, index) => (
                <div
                  key={shop.shop_id}
                  className="flex items-center gap-3 bg-gradient-to-r from-primary-lighter to-primary-light rounded-xl p-3"
                >
                  <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{shop.shop_name}</p>
                    <p className="text-xs text-gray-600">{shop.visit_count} visit{shop.visit_count > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No shop visits yet. Start exploring!" icon={MapPin} />
          )}
        </div>

        {/* Favorite Drinks */}
        <div className="bg-white rounded-3xl shadow-lg p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
              <Coffee className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Favorite Drinks</h2>
              <p className="text-xs text-gray-500">Your go-to coffee orders</p>
            </div>
          </div>

          {stats?.favorite_drinks.length ? (
            <div className="space-y-3">
              {stats.favorite_drinks.map((drink, index) => (
                <div
                  key={drink.drink_name}
                  className="flex items-center gap-3 bg-gradient-to-r from-primary-lighter to-primary-light rounded-xl p-3"
                >
                  <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{drink.drink_name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-600">{drink.post_count} post{drink.post_count > 1 ? 's' : ''}</p>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <p className="text-xs text-gray-600">{drink.avg_rating.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No drink posts yet. Log your first coffee!" icon={Coffee} />
          )}
        </div>

        {/* Coffee Preferences */}
        <div className="bg-gradient-to-br from-amber-800 to-amber-900 rounded-3xl shadow-lg p-5 mb-4 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Coffee Preferences</h2>
              <p className="text-xs text-amber-200">Your taste profile</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <PreferenceCard
              label="Temperature"
              value={stats?.coffee_preferences.temperature || 'Not set'}
            />
            <PreferenceCard
              label="Sweetness"
              value={stats?.coffee_preferences.sweetness || 'Not set'}
            />
            <PreferenceCard
              label="Strength"
              value={stats?.coffee_preferences.strength || 'Not set'}
            />
            <PreferenceCard
              label="Milk"
              value={stats?.coffee_preferences.milk || 'Not set'}
            />
          </div>

          {(stats?.coffee_preferences.favorite_drinks.length ||
            stats?.coffee_preferences.preferred_roast ||
            stats?.coffee_preferences.brewing_method ||
            stats?.coffee_preferences.coffee_strength) && (
            <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3">
              {stats.coffee_preferences.favorite_drinks.length > 0 && (
                <div>
                  <p className="text-xs text-amber-200 mb-1">Favorite Drinks</p>
                  <p className="text-sm font-semibold leading-tight">
                    {stats.coffee_preferences.favorite_drinks.join(', ')}
                  </p>
                </div>
              )}
              {stats.coffee_preferences.preferred_roast && (
                <div>
                  <p className="text-xs text-amber-200 mb-1">Roast</p>
                  <p className="text-sm font-semibold leading-tight">
                    {stats.coffee_preferences.preferred_roast}
                  </p>
                </div>
              )}
              {stats.coffee_preferences.brewing_method && (
                <div>
                  <p className="text-xs text-amber-200 mb-1">Brewing</p>
                  <p className="text-sm font-semibold leading-tight">
                    {stats.coffee_preferences.brewing_method}
                  </p>
                </div>
              )}
              {stats.coffee_preferences.coffee_strength && (
                <div>
                  <p className="text-xs text-amber-200 mb-1">Strength</p>
                  <p className="text-sm font-semibold leading-tight">
                    {stats.coffee_preferences.coffee_strength}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Posting Frequency */}
        <div className="bg-white rounded-3xl shadow-lg p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Posting Frequency</h2>
              <p className="text-xs text-gray-500">Last 30 days activity</p>
            </div>
          </div>

          {stats?.posting_frequency.length ? (
            <div className="space-y-2">
              {stats.posting_frequency.slice(0, 14).map((freq) => {
                const maxCount = getMaxPostCount();
                const percentage = (freq.post_count / maxCount) * 100;

                return (
                  <div key={freq.date} className="flex items-center gap-3">
                    <p className="text-xs text-gray-600 w-16 flex-shrink-0">
                      {formatDate(freq.date)}
                    </p>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-lighter0 to-primary-light0 rounded-full flex items-center justify-end px-2 transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      >
                        {freq.post_count > 0 && (
                          <span className="text-xs font-bold text-white">{freq.post_count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState message="No posts in the last 30 days. Start sharing!" icon={TrendingUp} />
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  isRating = false,
}: {
  icon: any;
  label: string;
  value: number | string;
  color: 'amber' | 'orange' | 'red' | 'yellow';
  isRating?: boolean;
}) {
  const colorClasses = {
    amber: 'text-primary bg-primary-light',
    orange: 'text-orange-700 bg-orange-100',
    red: 'text-red-700 bg-red-100',
    yellow: 'text-yellow-700 bg-yellow-100',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
      <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[0]} mb-2`} />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

function PreferenceCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-3">
      <p className="text-xs text-amber-200 mb-1">{label}</p>
      <p className="font-semibold text-sm leading-tight capitalize">{value}</p>
    </div>
  );
}

function EmptyState({ message, icon: Icon }: { message: string; icon: any }) {
  return (
    <div className="text-center py-6">
      <Icon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p className="text-gray-500">{message}</p>
    </div>
  );
}

// Import the icon we're using
import { Squares2X2Icon } from '@heroicons/react/24/outline';
