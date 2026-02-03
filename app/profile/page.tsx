'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { PencilIcon, Squares2X2Icon, BookmarkIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { db } from '@/lib/supabase';
import Navigation from '../components/Navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type TabType = 'posts' | 'visits' | 'favorites';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/signin');
        return;
      }

      setUser(session.user);
      loadProfileData(session.user.id);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadTabData(activeTab);
    }
  }, [activeTab, user]);

  const loadProfileData = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      setProfile(profileData);

      const count = await db.getFriendsCount(userId);
      setFriendsCount(count);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (tab: TabType) => {
    if (!user) return;

    try {
      if (tab === 'posts') {
        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();

        const headers: HeadersInit = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const response = await fetch(`/api/posts?userId=${user.id}`, { headers });
        const data = await response.json();
        setPosts(data.data || []);
      } else if (tab === 'visits') {
        const { data } = await supabase
          .from('visits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
        setVisits(data || []);
      } else if (tab === 'favorites') {
        const { data } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setFavorites(data || []);
      }
    } catch (error) {
      console.error(`Error loading ${tab}:`, error);
    }
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

  const StatCard = ({ icon: Icon, label, value, onClick }: { icon: any, label: string, value: number | string, onClick?: () => void }) => (
    <button
      onClick={onClick}
      className="flex-1 bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-amber-100 hover:shadow-md transition group"
    >
      <Icon className="w-5 h-5 md:w-6 md:h-6 text-amber-700 mb-1 md:mb-2 mx-auto" />
      <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs md:text-sm text-gray-600">{label}</p>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-900 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 pb-20">
      {/* Navigation */}
      <Navigation />

      {/* Page Header */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{profile?.username}</h1>
          <button
            onClick={() => router.push('/settings')}
            className="p-2.5 bg-amber-100 rounded-xl text-amber-900 hover:bg-amber-200 transition"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:py-6 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Cover & Profile */}
          <div className="relative">
            {/* Cover gradient */}
            <div className="h-24 md:h-32 bg-gradient-to-r from-amber-800 via-amber-700 to-orange-800" />

            {/* Profile Picture */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl bg-gradient-to-br from-amber-200 to-amber-300 p-1 shadow-xl">
                <div className="w-full h-full rounded-xl md:rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl md:text-5xl">☕</span>
                  )}
                </div>
              </div>
            </div>

            {/* Edit button on mobile (absolute) */}
            <button
              onClick={() => router.push('/settings')}
              className="md:hidden absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-xl text-amber-900 shadow"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="pt-16 md:pt-4 md:pl-40 px-4 md:px-6 pb-6">
            <div className="md:text-left text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {profile?.display_name || profile?.username}
              </h2>
              <p className="text-gray-500 mb-4">@{profile?.username}</p>

              {profile?.bio && (
                <p className="text-gray-700 mb-4 leading-relaxed">{profile.bio}</p>
              )}

              {/* Stats Grid */}
              <div className="flex gap-3 mb-4">
                <StatCard icon={Squares2X2Icon} label="Posts" value={posts.length} />
                <StatCard icon={MapPinIcon} label="Visits" value={visits.length} />
                <StatCard
                  icon={UserGroupIcon}
                  label="Friends"
                  value={friendsCount}
                  onClick={() => router.push('/friends')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coffee Preferences Card */}
        {profile && (
          <div className="bg-gradient-to-br from-amber-800 to-amber-900 rounded-3xl shadow-lg p-5 md:p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">☕</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold">Coffee Preferences</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <p className="text-xs text-amber-200 mb-1">Drinks</p>
                <p className="font-semibold text-sm leading-tight">
                  {profile.favorite_drinks?.length ? profile.favorite_drinks.join(', ') : 'Not set'}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <p className="text-xs text-amber-200 mb-1">Roast</p>
                <p className="font-semibold text-sm leading-tight">
                  {profile.preferred_roast || 'Not set'}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <p className="text-xs text-amber-200 mb-1">Brewing</p>
                <p className="font-semibold text-sm leading-tight">
                  {profile.brewing_method || 'Not set'}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <p className="text-xs text-amber-200 mb-1">Strength</p>
                <p className="font-semibold text-sm leading-tight">
                  {profile.coffee_strength || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2">
          <div className="flex gap-2">
            {[
              { id: 'posts' as TabType, icon: Squares2X2Icon, label: 'Posts' },
              { id: 'visits' as TabType, icon: MapPinIcon, label: 'Visits' },
              { id: 'favorites' as TabType, icon: BookmarkIcon, label: 'Favorites' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'bg-amber-700 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-2">
          {activeTab === 'posts' && (
            <>
              {posts.length === 0 ? (
                <div className="col-span-3 bg-white rounded-3xl shadow-lg p-8 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">No Posts Yet</h2>
                  <p className="text-gray-600 mb-6">Start logging your coffee adventures!</p>
                  <a
                    href="/shops"
                    className="inline-block bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-800 transition"
                  >
                    Find Coffee Shops
                  </a>
                </div>
              ) : (
                posts.map((post: any) => (
                  <div
                    key={post.id}
                    className="aspect-square bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer group"
                    onClick={() => router.push(`/posts/${post.id}`)}
                  >
                    {post.photo_url ? (
                      <img
                        src={post.photo_url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-2">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 text-xs line-clamp-2 mb-1">{post.drink_name}</p>
                          <p className="text-xs text-amber-700">{post.shop_name}</p>
                          <div className="flex justify-center mt-1 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-xs ${i < post.rating ? 'text-amber-500' : 'text-gray-300'}`}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'visits' && (
            <>
              {visits.length === 0 ? (
                <div className="col-span-3 bg-white rounded-3xl shadow-lg p-8 text-center">
                  <div className="text-6xl mb-4">📍</div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">No Visits Yet</h2>
                  <p className="text-gray-600">Start exploring coffee shops!</p>
                </div>
              ) : (
                visits.map((visit: any) => (
                  <div
                    key={visit.id}
                    className="aspect-square bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-3 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 text-xs line-clamp-2 mb-1">{visit.place_name}</p>
                      <p className="text-xs text-amber-700">{formatDate(visit.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'favorites' && (
            <>
              {favorites.length === 0 ? (
                <div className="col-span-3 bg-white rounded-3xl shadow-lg p-8 text-center">
                  <div className="text-6xl mb-4">❤️</div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">No Favorites Yet</h2>
                  <p className="text-gray-600">Save coffee shops you love!</p>
                </div>
              ) : (
                favorites.map((fav: any) => (
                  <div
                    key={fav.id}
                    className="aspect-square bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-3 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 text-xs line-clamp-2 mb-1">{fav.place_name}</p>
                      <p className="text-xs text-red-600">{formatDate(fav.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
