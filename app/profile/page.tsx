'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Coffee, MapPin as MapPinLucide, Heart, Star, FileEdit, Globe, Users, Lock, Palette, X, Trophy, Medal, Badge } from 'lucide-react';
import { PencilIcon, Squares2X2Icon, BookmarkIcon, MapPinIcon, UserGroupIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { db } from '@/lib/supabase';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useTheme } from '@/app/theme/config';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import DrinkIcon from '@/app/components/DrinkIcon';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const coffeeTheme = {
  colors: {
    primary: '#6F4E37',
    primaryDark: '#4A3728',
    primaryLight: '#C4A484',
    primaryLighter: '#F2E8D5',
  },
};

type TabType = 'posts' | 'visits' | 'favorites';

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

interface DrinkCategory {
  category: string;
  count: number;
  examples: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [currentTheme, setCurrentTheme] = useState(coffeeTheme);

  // Load theme on mount
  useEffect(() => {
    // Try to get theme from context, fall back to default
    try {
      const { useTheme: tryUseTheme } = require('@/app/theme/config');
      const themeData = tryUseTheme();
      if (themeData?.currentTheme) {
        setCurrentTheme(themeData.currentTheme);
      }
    } catch {
      // Use default theme
    }
  }, []);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [loading, setLoading] = useState(true);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [mostVisitedShops, setMostVisitedShops] = useState<ShopStats[]>([]);
  const [favoriteDrinks, setFavoriteDrinks] = useState<DrinkStats[]>([]);
  const [drinkCategories, setDrinkCategories] = useState<DrinkCategory[]>([]);
  const [drinksSortBy, setDrinksSortBy] = useState<'posts' | 'rating'>('posts');
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    username: '',
    privacy_level: 'public' as 'public' | 'friends_only' | 'private',
    favorite_drinks: [] as string[],
    preferred_roast: '',
    brewing_method: '',
    coffee_strength: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

      // Load stats
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const statsResponse = await fetch('/api/stats', { headers });
      const statsData = await statsResponse.json();

      if (statsData.data) {
        setMostVisitedShops(statsData.data.most_visited_shops?.slice(0, 3) || []);
        const drinks = statsData.data.favorite_drinks || [];
        sortFavoriteDrinks(drinks);

        // Categorize drinks
        const categories = categorizeDrinks(drinks);
        setDrinkCategories(categories);
      }

      // Initialize edit form with all settings
      setEditForm({
        display_name: profileData.display_name || '',
        bio: profileData.bio || '',
        username: profileData.username || '',
        privacy_level: profileData.privacy_level || 'public',
        favorite_drinks: profileData.favorite_drinks || [],
        preferred_roast: profileData.preferred_roast || '',
        brewing_method: profileData.brewing_method || '',
        coffee_strength: profileData.coffee_strength || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    if (!user) return;

    try {
      const { data: friendships } = await supabase
        .from('friendships')
        .select(`
          *,
          profiles!friendships_friend_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .or(`and(user_id.eq.${user.id},status.eq.accepted),and(friend_id.eq.${user.id},status.eq.accepted)`);

      if (friendships) {
        const friendsList = friendships.map((f: any) => {
          return f.user_id === user.id ? f.profiles : { ...f.profiles, is_user_1: true };
        });
        setFriends(friendsList);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const openFriendsModal = async () => {
    setShowFriendsModal(true);
    await loadFriends();
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

  const handleRefresh = async () => {
    if (user) {
      await loadProfileData(user.id);
      await loadTabData(activeTab);
    }
  };

  const handleOpenEditModal = () => {
    // Reset form with current profile data each time modal opens
    setEditForm({
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
      username: profile?.username || '',
      privacy_level: profile?.privacy_level || 'public',
      favorite_drinks: profile?.favorite_drinks || [],
      preferred_roast: profile?.preferred_roast || '',
      brewing_method: profile?.brewing_method || '',
      coffee_strength: profile?.coffee_strength || '',
    });
    setMessage(null);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name,
          bio: editForm.bio,
          privacy_level: editForm.privacy_level,
          favorite_drinks: editForm.favorite_drinks,
          preferred_roast: editForm.preferred_roast,
          brewing_method: editForm.brewing_method,
          coffee_strength: editForm.coffee_strength,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({
        ...profile,
        display_name: editForm.display_name,
        bio: editForm.bio,
        privacy_level: editForm.privacy_level,
        favorite_drinks: editForm.favorite_drinks,
        preferred_roast: editForm.preferred_roast,
        brewing_method: editForm.brewing_method,
        coffee_strength: editForm.coffee_strength,
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        setShowEditModal(false);
        setMessage(null);
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const { containerRef, pullDistance } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  const categorizeDrinks = (drinks: any[]): DrinkCategory[] => {
    const categories: { [key: string]: DrinkCategory } = {};

    drinks.forEach((drink) => {
      const name = drink.drink_name.toLowerCase();
      let category = 'Other';
      const postCount = drink.post_count || 1;

      // Matcha drinks
      if (name.includes('matcha')) {
        category = 'Matcha';
      }
      // Tea/Chai drinks
      else if (name.includes('chai') || name.includes('tea') || name.includes('herbal')) {
        category = 'Tea';
      }
      // Espresso shots
      else if (name.includes('espresso') || name.includes('shot')) {
        category = 'Espresso';
      }
      // Lattes
      else if (name.includes('latte') || name.includes('mocha')) {
        category = 'Lattes';
      }
      // Cappuccino
      else if (name.includes('cappuccino') || name.includes('cap')) {
        category = 'Cappuccinos';
      }
      // Cold brew
      else if (name.includes('cold brew') || name.includes('cold-brew')) {
        category = 'Cold Brew';
      }
      // Pour over / drip
      else if (name.includes('pour over') || name.includes('pour-over') || name.includes('drip')) {
        category = 'Pour Over';
      }
      // Americano
      else if (name.includes('americano')) {
        category = 'Americano';
      }
      // Macchiato
      else if (name.includes('macchiato')) {
        category = 'Macchiato';
      }
      // Flat white
      else if (name.includes('flat white')) {
        category = 'Flat White';
      }
      // Iced drinks
      else if (name.includes('iced') || name.includes('ice')) {
        category = 'Iced Drinks';
      }
      // Smoothies
      else if (name.includes('smoothie') || name.includes('blend')) {
        category = 'Smoothies';
      }
      // Frappe
      else if (name.includes('frappe') || name.includes('frappé')) {
        category = 'Frappés';
      }
      // Affogato
      else if (name.includes('affogato')) {
        category = 'Affogato';
      }
      // General coffee
      else if (name.includes('coffee') || name.includes('brew')) {
        category = 'Coffee';
      }
      // Keep existing category if found
      else if (categories[category]) {
        // Already in "Other"
      }

      if (!categories[category]) {
        categories[category] = {
          category,
          count: 0,
          examples: [],
        };
      }

      categories[category].count += postCount;
      if (!categories[category].examples.includes(drink.drink_name)) {
        categories[category].examples.push(drink.drink_name);
      }
    });

    // Convert to array and sort by count
    return Object.values(categories)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 categories
  };

  const sortFavoriteDrinks = (drinks: any[]) => {
    if (drinksSortBy === 'posts') {
      // Sort by post count descending
      const sorted = [...drinks].sort((a, b) => b.post_count - a.post_count);
      setFavoriteDrinks(sorted.slice(0, 3));
    } else {
      // Sort by rating descending
      const sorted = [...drinks].sort((a, b) => b.avg_rating - a.avg_rating);
      setFavoriteDrinks(sorted.slice(0, 3));
    }
  };

  const handleDrinksSortChange = (sortBy: 'posts' | 'rating') => {
    setDrinksSortBy(sortBy);
  };

  // Re-sort drinks when sort method changes
  useEffect(() => {
    if (profile?.favorite_drinks) {
      // Need to get the full drinks data again
      const loadDrinks = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const statsResponse = await fetch('/api/stats', { headers });
        const statsData = await statsResponse.json();

        if (statsData.data?.favorite_drinks) {
          sortFavoriteDrinks(statsData.data.favorite_drinks);
        }
      };

      loadDrinks();
    }
  }, [drinksSortBy]);

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
      className="flex-1 bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100 hover:shadow-md transition group"
    >
      <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary mb-1 md:mb-2 mx-auto" />
      {value !== "" ? (
        <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
      ) : (
        <div className="h-6 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
        </div>
      )}
      <p className="text-xs md:text-sm text-gray-600">{label}</p>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-lighter via-primary-light to-primary-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-primary font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lighter via-primary-light to-primary-light pb-20">
      {/* Pull to Refresh Indicator */}
      <div className="flex justify-center pt-2" style={{ height: pullDistance > 0 ? pullDistance : 0, overflow: 'hidden' }}>
        {pullDistance > 40 && (
          <div className="flex items-center gap-2 text-primary">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Refreshing...</span>
          </div>
        )}
      </div>

      <div ref={containerRef}>
        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 md:py-6 space-y-4 pt-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Cover & Profile */}
          <div className="relative">
            {/* Cover gradient */}
            <div
              className="h-24 md:h-32"
              style={{
                background: `linear-gradient(90deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, var(--color-primary-dark) 100%)`
              }}
            />

            {/* Profile Picture */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0">
              <div
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl p-1 shadow-xl"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%)`
                }}
              >
                <div className="w-full h-full rounded-xl md:rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Coffee className="w-16 h-16 md:w-20 md:h-20 text-primary" />
                  )}
                </div>
              </div>
            </div>

            {/* Edit button on mobile (absolute) */}
            <button
              onClick={handleOpenEditModal}
              className="md:hidden absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur rounded-xl text-primary shadow-md hover:bg-white transition"
            >
              <PencilIcon className="w-4 h-4" />
            </button>

            {/* Edit button on desktop */}
            <button
              onClick={handleOpenEditModal}
              className="hidden md:block absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur rounded-xl text-primary shadow-md hover:bg-white transition"
            >
              <PencilIcon className="w-5 h-5" />
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
                  onClick={openFriendsModal}
                />
              </div>

              {/* Inline Stats - Top 3 Most Visited Shops - Podium Layout */}
              {mostVisitedShops.length > 0 && (
                <div className="mb-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-center mb-5">
                    <h3 className="text-lg font-bold text-gray-900">Top Spots</h3>
                    <p className="text-xs text-gray-500 mt-1">Your most visited coffee shops</p>
                  </div>
                  <div className="flex items-end justify-center gap-3 min-h-[140px]">
                    {mostVisitedShops.map((shop, index) => {
                      const isSecond = index === 1;
                      const isFirst = index === 0;
                      const isThird = index === 2;

                      // Podium heights
                      let heightClass = 'h-20'; // 3rd place base
                      let bgClass = 'bg-amber-700/60'; // bronze
                      let PlaceIcon = Badge;
                      let iconColor = 'text-amber-300';

                      if (isSecond) {
                        heightClass = 'h-28'; // 2nd place medium
                        bgClass = 'bg-gray-400/60'; // silver
                        PlaceIcon = Medal;
                        iconColor = 'text-gray-200';
                      } else if (isFirst) {
                        heightClass = 'h-36'; // 1st place highest
                        bgClass = 'bg-amber-400/60'; // gold
                        PlaceIcon = Trophy;
                        iconColor = 'text-amber-200';
                      }

                      // Order: 2nd, 1st, 3rd for podium layout
                      let displayOrder = 0;
                      if (isSecond) displayOrder = 0;
                      else if (isFirst) displayOrder = 1;
                      else if (isThird) displayOrder = 2;

                      return (
                        <div
                          key={shop.shop_id}
                          className="flex flex-col items-center"
                          style={{ order: displayOrder }}
                        >
                          {/* Place Icon */}
                          <div className="mb-2">
                            <PlaceIcon className={`w-6 h-6 ${iconColor}`} strokeWidth={2} />
                          </div>

                          {/* Shop name */}
                          <div className="mb-3 text-center max-w-[100px]">
                            <p className="text-sm font-black text-gray-900 truncate">
                              {shop.shop_name.length > 15 ? shop.shop_name.substring(0, 15) + '...' : shop.shop_name}
                            </p>
                          </div>

                          {/* Podium block */}
                          <div className={`relative ${heightClass} w-20 ${bgClass} rounded-t-xl flex flex-col items-center justify-center shadow-lg backdrop-blur-sm`}>
                            {/* Visit count inside bar */}
                            <div className="text-white font-bold text-lg text-center">
                              {shop.visit_count}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Inline Stats - Top 3 Favorite Drinks - Coffee Cup Layout */}
              {favoriteDrinks.length > 0 && (
                <div className="mb-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-center mb-3">
                    <h3 className="text-lg font-bold text-gray-900">Favorite Drinks</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {drinksSortBy === 'posts' ? 'Your most ordered beverages' : 'Your highest rated drinks'}
                    </p>
                  </div>

                  {/* Sort Toggle */}
                  <div className="flex justify-center mb-4">
                    <div className="inline-flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => handleDrinksSortChange('posts')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                          drinksSortBy === 'posts'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Most Ordered
                      </button>
                      <button
                        onClick={() => handleDrinksSortChange('rating')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                          drinksSortBy === 'rating'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Highest Rated
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {favoriteDrinks.map((drink, index) => {
                      const isFirst = index === 0;
                      const isSecond = index === 1;
                      const isThird = index === 2;

                      let bgGradient = 'from-amber-100/40 to-amber-50/40';
                      let borderColor = 'border-amber-200/60';
                      let iconBg = 'bg-amber-500';
                      let starColor = 'text-amber-500';

                      if (isSecond) {
                        bgGradient = 'from-gray-100/40 to-gray-50/40';
                        borderColor = 'border-gray-200/60';
                        iconBg = 'bg-gray-400';
                        starColor = 'text-gray-400';
                      } else if (isThird) {
                        bgGradient = 'from-orange-100/40 to-orange-50/40';
                        borderColor = 'border-orange-200/60';
                        iconBg = 'bg-orange-600';
                        starColor = 'text-orange-500';
                      }

                      return (
                        <div
                          key={drink.drink_name}
                          className={`relative bg-gradient-to-r ${bgGradient} rounded-xl p-4 border-2 ${borderColor} shadow-sm`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Drink-specific icon with rank */}
                            <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center shadow-md shrink-0`}>
                              <DrinkIcon drinkName={drink.drink_name} className="text-white" size={24} />
                            </div>

                            {/* Drink info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-bold text-gray-900 truncate">
                                {drink.drink_name}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-gray-600 font-medium">
                                  {drink.post_count} post{drink.post_count > 1 ? 's' : ''}
                                </span>
                                <span className="text-gray-300">•</span>
                                <div className="flex items-center gap-1">
                                  <Star className={`w-4 h-4 ${starColor} fill-current`} />
                                  <span className="text-sm font-semibold text-gray-700">{drink.avg_rating.toFixed(1)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Rank badge */}
                            <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shadow-sm shrink-0`}>
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Drink Categories Stats */}
              {drinkCategories.length > 0 && (
                <div className="mb-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Drink Preferences</h3>
                    <p className="text-xs text-gray-500 mt-1">Your favorite types of drinks</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {drinkCategories.map((cat) => {
                      // Get a representative drink name for icon
                      const exampleDrink = cat.examples[0] || 'Coffee';

                      return (
                        <div
                          key={cat.category}
                          className="bg-gradient-to-br from-primary-lighter to-primary-light rounded-xl p-4 border border-primary/20"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <DrinkIcon drinkName={exampleDrink} className="text-primary" size={20} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{cat.category}</p>
                              <p className="text-xs text-gray-600">{cat.count} logged</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {cat.examples.slice(0, 3).map((example) => (
                              <span
                                key={example}
                                className="text-xs bg-white/60 text-gray-700 px-2 py-0.5 rounded-full truncate max-w-full"
                                title={example}
                              >
                                {example.length > 15 ? example.substring(0, 15) + '...' : example}
                              </span>
                            ))}
                            {cat.examples.length > 3 && (
                              <span className="text-xs text-gray-500">+{cat.examples.length - 3}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coffee Preferences Card - Uses theme color */}
        {profile && (
          <div
            className="rounded-3xl shadow-lg p-5 md:p-6 text-white"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.colors.primaryDark} 0%, ${currentTheme.colors.primary} 100%)`
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold">Coffee Preferences</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <p className="text-xs text-white/70 mb-1">Drinks</p>
                <p className="font-semibold text-sm leading-tight">
                  {profile.favorite_drinks?.length ? profile.favorite_drinks.join(', ') : 'Not set'}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <p className="text-xs text-white/70 mb-1">Roast</p>
                <p className="font-semibold text-sm leading-tight">
                  {profile.preferred_roast || 'Not set'}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <p className="text-xs text-white/70 mb-1">Brewing</p>
                <p className="font-semibold text-sm leading-tight">
                  {profile.brewing_method || 'Not set'}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <p className="text-xs text-white/70 mb-1">Strength</p>
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
                    ? 'bg-primary text-white shadow-md'
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
                  <FileEdit className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h2 className="text-xl font-bold text-gray-900 mb-2">No Posts Yet</h2>
                  <p className="text-gray-600 mb-6">Start logging your coffee adventures!</p>
                  <a
                    href="/shops"
                    className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition"
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
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-lighter to-primary-light p-2">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 text-xs line-clamp-2 mb-1">{post.drink_name}</p>
                          <p className="text-xs text-primary">{post.shop_name}</p>
                          <div className="flex justify-center mt-1 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-xs ${i < post.rating ? 'text-primary' : 'text-gray-300'}`}>
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
                  <MapPinLucide className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-xl font-bold text-gray-900 mb-2">No Visits Yet</h2>
                  <p className="text-gray-600">Start exploring coffee shops!</p>
                </div>
              ) : (
                visits.map((visit: any) => (
                  <div
                    key={visit.id}
                    className="aspect-square bg-gradient-to-br from-primary-lighter to-primary-light rounded-2xl p-3 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 text-xs line-clamp-2 mb-1">{visit.place_name}</p>
                      <p className="text-xs text-primary">{formatDate(visit.created_at)}</p>
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
                  <Heart className="w-16 h-16 mx-auto mb-4 text-red-300" />
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

      {/* Friends Modal */}
      {showFriendsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFriendsModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Friends ({friendsCount})</h3>
              <button
                onClick={() => setShowFriendsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto p-4">
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">No friends yet</p>
                  <p className="text-sm text-gray-500 mt-2">Connect with other coffee enthusiasts!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => {
                        setShowFriendsModal(false);
                        router.push(`/profile/${friend.username}`);
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center overflow-hidden">
                        {friend.avatar_url ? (
                          <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-semibold text-lg">
                            {(friend.display_name || friend.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{friend.display_name || friend.username}</p>
                        <p className="text-sm text-gray-500">@{friend.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile & Settings Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-xl w-full sm:max-w-lg max-h-[90vh] flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">Edit Profile & Settings</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className={`mx-4 mt-4 p-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Basic Info</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={editForm.display_name}
                      onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Your display name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                      maxLength={300}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Tell us about your coffee journey..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{editForm.bio.length}/300 characters</p>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Privacy</h4>
                <div className="space-y-2">
                  {[
                    { value: 'public', label: 'Public', description: 'Anyone can view your profile', icon: <Globe className="w-5 h-5" /> },
                    { value: 'friends_only', label: 'Friends Only', description: 'Only friends can view your profile', icon: <Users className="w-5 h-5" /> },
                    { value: 'private', label: 'Private', description: 'Only you can view your profile', icon: <Lock className="w-5 h-5" /> },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, privacy_level: option.value as any })}
                      className={`w-full p-3 rounded-lg border-2 text-left transition ${
                        editForm.privacy_level === option.value
                          ? 'border-primary bg-primary-lighter'
                          : 'border-gray-200 hover:border-primary'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-gray-600">
                            {option.icon}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {option.label}
                            </p>
                            <p className="text-xs text-gray-600">{option.description}</p>
                          </div>
                        </div>
                        {editForm.privacy_level === option.value && (
                          <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                            <div className="w-3 h-3 rounded-full bg-primary" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Coffee Preferences */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-primary" />
                  Coffee Preferences
                </h4>

                {/* Favorite Drinks */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Drinks</label>
                  <div className="flex flex-wrap gap-2">
                    {['Espresso', 'Latte', 'Cappuccino', 'Americano', 'Cold Brew', 'Pour Over'].map(drink => (
                      <button
                        key={drink}
                        type="button"
                        onClick={() => {
                          const drinks = editForm.favorite_drinks || [];
                          setEditForm({
                            ...editForm,
                            favorite_drinks: drinks.includes(drink)
                              ? drinks.filter(d => d !== drink)
                              : [...drinks, drink]
                          });
                        }}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition ${
                          (editForm.favorite_drinks || []).includes(drink)
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 text-gray-700 hover:border-primary'
                        }`}
                      >
                        {drink}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Roast, Brewing, Strength */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Roast Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Light', 'Medium', 'Dark'].map(roast => (
                        <button
                          key={roast}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, preferred_roast: roast })}
                          className={`py-2 rounded-lg border-2 text-sm font-medium transition ${
                            editForm.preferred_roast === roast
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-300 text-gray-700 hover:border-primary'
                          }`}
                        >
                          {roast}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brewing Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Espresso', 'Pour Over', 'French Press', 'Cold Brew', 'Drip', 'Aeropress'].map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, brewing_method: method })}
                          className={`py-2 rounded-lg border-2 text-sm font-medium transition ${
                            editForm.brewing_method === method
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-300 text-gray-700 hover:border-primary'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Strength Preference</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Mild', 'Medium', 'Strong'].map(strength => (
                        <button
                          key={strength}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, coffee_strength: strength })}
                          className={`py-2 rounded-lg border-2 text-sm font-medium transition ${
                            editForm.coffee_strength === strength
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-300 text-gray-700 hover:border-primary'
                          }`}
                        >
                          {strength}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  Appearance
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <p className="text-xs text-gray-500 mb-3">Choose your preferred color theme</p>
                  <ThemeSwitcher />
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">Danger Zone</h4>
                <div className="space-y-2">
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to sign out?')) {
                        await supabase.auth.signOut();
                        router.push('/');
                      }
                    }}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition rounded-lg border border-gray-200 font-medium"
                  >
                    Sign Out
                  </button>
                  <button
                    onClick={() => {
                      const confirmation1 = confirm('Are you sure you want to delete your account? This action CANNOT be undone.');
                      if (!confirmation1) return;

                      const confirmation2 = confirm('This will PERMANENTLY delete:\n\n• Your profile and settings\n• All your posts and visits\n• All your friends and friend requests\n• All your comments and likes\n\nYour account cannot be recovered.\n\nContinue?');
                      if (!confirmation2) return;

                      const confirmation3 = prompt('Type "DELETE" to confirm account deletion:');
                      if (confirmation3 !== 'DELETE') {
                        alert('Account deletion cancelled.');
                        return;
                      }

                      fetch('/api/delete-account', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id }),
                      }).then(async (response) => {
                        if (!response.ok) {
                          const error = await response.json();
                          throw new Error(error.error || 'Failed to delete account');
                        }
                        return supabase.auth.signOut();
                      }).then(() => {
                        router.push('/');
                      }).catch((error: any) => {
                        setMessage({ type: 'error', text: `Failed to delete account: ${error.message}` });
                      });
                    }}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition rounded-lg border border-red-200 font-medium"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
