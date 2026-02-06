'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Coffee, MapPin as MapPinLucide, Heart, FileEdit, UserPlus, UserMinus } from 'lucide-react';
import { ArrowLeftIcon as ArrowLeftHero, Squares2X2Icon, BookmarkIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { db } from '@/lib/supabase';
import { themes, ThemeName } from '@/app/theme/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type TabType = 'posts' | 'visits' | 'favorites';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [profileTheme, setProfileTheme] = useState<ThemeName>('coffee');
  const [posts, setPosts] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'accepted' | 'blocked'>('none');
  const [ownProfile, setOwnProfile] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/signin');
        return;
      }
      setCurrentUser(session.user);
      loadProfileData(session.user);
    };

    checkAuth();
  }, [username]);

  useEffect(() => {
    if (profile && currentUser) {
      checkFriendship();
      loadTabData(activeTab);
    }
  }, [profile, currentUser, activeTab]);

  const checkFriendship = async () => {
    if (!currentUser || profile.id === currentUser.id) {
      return;
    }

    try {
      const { data: friendship } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(initiator_id.eq.${currentUser.id},receiver_id.eq.${profile.id}),and(initiator_id.eq.${profile.id},receiver_id.eq.${currentUser.id})`)
        .maybeSingle();

      if (friendship) {
        setFriendshipStatus(friendship.status);
        setIsFriend(friendship.status === 'accepted');
      }
    } catch (error) {
      console.error('Error checking friendship:', error);
    }
  };

  const loadProfileData = async (user: any) => {
    try {
      // Get profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError || !profileData) {
        router.push('/feed');
        return;
      }

      setProfile(profileData);
      setOwnProfile(profileData.id === user.id);

      // Set profile owner's theme preference
      if (profileData.theme_preference && themes[profileData.theme_preference as ThemeName]) {
        setProfileTheme(profileData.theme_preference as ThemeName);
      }

      const count = await db.getFriendsCount(profileData.id);
      setFriendsCount(count);
    } catch (error) {
      console.error('Error loading profile:', error);
      router.push('/feed');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (tab: TabType) => {
    if (!profile) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      if (tab === 'posts') {
        const response = await fetch(`/api/posts?userId=${profile.id}`, { headers });
        const data = await response.json();
        setPosts(data.data || []);
      } else if (tab === 'visits') {
        const { data } = await supabase
          .from('visits')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(50);
        setVisits(data || []);
      } else if (tab === 'favorites') {
        const { data } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });
        setFavorites(data || []);
      }
    } catch (error) {
      console.error(`Error loading ${tab}:`, error);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: profile.id }),
      });
      setFriendshipStatus('pending');
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      await fetch('/api/friends/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_id: profile.id }),
      });
      setIsFriend(false);
      setFriendshipStatus('none');
    } catch (error) {
      console.error('Error removing friend:', error);
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

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${themes[profileTheme].colors.primaryLighter} 0%, ${themes[profileTheme].colors.primaryLight} 50%, ${themes[profileTheme].colors.primaryLight} 100%)`
        }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: themes[profileTheme].colors.primary,
              borderTopColor: 'transparent'
            }}
          />
          <p className="font-medium" style={{ color: themes[profileTheme].colors.primary }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        background: `linear-gradient(135deg, ${themes[profileTheme].colors.primaryLighter} 0%, ${themes[profileTheme].colors.primaryLight} 50%, ${themes[profileTheme].colors.primaryLight} 100%)`
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 font-medium transition"
          style={{
            color: themes[profileTheme].colors.primary
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = themes[profileTheme].colors.primaryDark}
          onMouseLeave={(e) => e.currentTarget.style.color = themes[profileTheme].colors.primary}
        >
          <ArrowLeftHero className="w-5 h-5" />
          Back
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Cover & Profile */}
          <div className="relative">
            {/* Cover gradient - uses profile owner's theme */}
            <div
              className="h-24 md:h-32"
              style={{
                background: `linear-gradient(90deg, ${themes[profileTheme].colors.primaryDark} 0%, ${themes[profileTheme].colors.primary} 50%, ${themes[profileTheme].colors.primaryDark} 100%)`
              }}
            />

            {/* Profile Picture - uses profile owner's theme */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0">
              <div
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl p-1 shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${themes[profileTheme].colors.primaryLight} 0%, ${themes[profileTheme].colors.primary} 100%)`
                }}
              >
                <div className="w-full h-full rounded-xl md:rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Coffee
                      className="w-16 h-16 md:w-20 md:h-20"
                      style={{ color: themes[profileTheme].colors.primary }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Action button on desktop */}
            {!ownProfile && (
              <div className="hidden md:block absolute top-3 right-3">
                {isFriend ? (
                  <button
                    onClick={handleRemoveFriend}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition flex items-center gap-2"
                  >
                    <UserMinus className="w-4 h-4" />
                    Unfriend
                  </button>
                ) : friendshipStatus === 'pending' ? (
                  <button
                    disabled
                    className="px-4 py-2 text-primary rounded-xl font-medium flex items-center gap-2"
                    style={{ backgroundColor: themes[profileTheme].colors.primaryLight }}
                  >
                    <span
                      className="w-2 h-2 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: themes[profileTheme].colors.primary }}
                    />
                    Pending
                  </button>
                ) : (
                  <button
                    onClick={handleSendFriendRequest}
                    className="px-4 py-2 text-white rounded-xl font-medium transition flex items-center gap-2"
                    style={{
                      backgroundColor: themes[profileTheme].colors.primary,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themes[profileTheme].colors.primaryDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themes[profileTheme].colors.primary}
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Friend
                  </button>
                )}
              </div>
            )}
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
                <StatCard icon={Squares2X2Icon} label="Posts" value={posts.length} color={themes[profileTheme].colors.primary} />
                <StatCard icon={MapPinIcon} label="Visits" value={visits.length} color={themes[profileTheme].colors.primary} />
                <StatCard icon={UserGroupIcon} label="Friends" value={friendsCount} color={themes[profileTheme].colors.primary} />
              </div>

              {/* Mobile action button */}
              {!ownProfile && (
                <div className="md:hidden mt-4">
                  {isFriend ? (
                    <button
                      onClick={handleRemoveFriend}
                      className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                    >
                      <UserMinus className="w-5 h-5" />
                      Unfriend
                    </button>
                  ) : friendshipStatus === 'pending' ? (
                    <button
                      disabled
                      className="w-full px-4 py-3 text-primary rounded-xl font-medium flex items-center justify-center gap-2"
                      style={{ backgroundColor: themes[profileTheme].colors.primaryLight }}
                    >
                      <span
                        className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: themes[profileTheme].colors.primary }}
                      />
                      Friend Request Pending
                    </button>
                  ) : (
                    <button
                      onClick={handleSendFriendRequest}
                      className="w-full px-4 py-3 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: themes[profileTheme].colors.primary,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themes[profileTheme].colors.primaryDark}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themes[profileTheme].colors.primary}
                    >
                      <UserPlus className="w-5 h-5" />
                      Add Friend
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs - use profile owner's theme */}
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
                    ? 'text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={
                  activeTab === tab.id
                    ? { backgroundColor: themes[profileTheme].colors.primary }
                    : {}
                }
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
                  <p className="text-gray-600">{ownProfile ? 'Start logging your coffee adventures!' : `${profile.display_name || profile.username} hasn\'t posted yet.`}</p>
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
                      <div
                        className="w-full h-full flex items-center justify-center p-2"
                        style={{
                          background: `linear-gradient(135deg, ${themes[profileTheme].colors.primaryLighter} 0%, ${themes[profileTheme].colors.primaryLight} 100%)`
                        }}
                      >
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 text-xs line-clamp-2 mb-1">{post.drink_name}</p>
                          <p className="text-xs" style={{ color: themes[profileTheme].colors.primary }}>{post.shop_name}</p>
                          <div className="flex justify-center mt-1 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className="text-xs"
                                style={{ color: i < post.rating ? themes[profileTheme].colors.primary : '#d1d5db' }}
                              >
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
                  <p className="text-gray-600">No coffee shop visits yet.</p>
                </div>
              ) : (
                visits.map((visit: any) => (
                  <div
                    key={visit.id}
                    className="aspect-square rounded-2xl p-3 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${themes[profileTheme].colors.primaryLighter} 0%, ${themes[profileTheme].colors.primaryLight} 100%)`
                    }}
                  >
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 text-xs line-clamp-2 mb-1">{visit.place_name}</p>
                      <p className="text-xs" style={{ color: themes[profileTheme].colors.primary }}>{formatDate(visit.created_at)}</p>
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
                  <p className="text-gray-600">No favorite coffee shops yet.</p>
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

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: number | string, color: string }) {
  return (
    <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
      <Icon
        className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2 mx-auto"
        style={{ color }}
      />
      <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs md:text-sm text-gray-600">{label}</p>
    </div>
  );
}
