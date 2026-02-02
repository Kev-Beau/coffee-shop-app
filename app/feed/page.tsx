'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import FeedCard from '../components/FeedCard';
import TabNavigation from '../components/TabNavigation';

type FeedType = 'friends' | 'explore';

export default function FeedPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [feedType, setFeedType] = useState<FeedType>('explore');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Show setup message if Supabase not configured
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Setup Required</h1>
          <p className="text-gray-600 mb-6">
            Social features require Supabase configuration. See <code className="bg-gray-100 px-2 py-1 rounded">SOCIAL_SETUP.md</code> for instructions.
          </p>
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-800 transition"
          >
            Set Up Supabase
          </a>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      if (!supabase) return;

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to signin if not authenticated
        window.location.href = '/auth/signin';
        return;
      }

      setUser(session.user);

      // Load posts
      fetchPosts();
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [feedType]);

  const fetchPosts = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/posts?feedType=${feedType}&limit=20`
      );
      const data = await response.json();

      if (data.error) {
        console.error('Error fetching posts:', data.error);
        return;
      }

      setPosts(data.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) throw new Error('Failed to like post');

      // Update local state
      setPosts(posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              user_has_liked: true,
              like_count: (post.like_count || 0) + 1,
            }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleUnlike = async (postId: string) => {
    try {
      const response = await fetch(`/api/likes?postId=${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to unlike post');

      // Update local state
      setPosts(posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              user_has_liked: false,
              like_count: Math.max((post.like_count || 0) - 1, 0),
            }
          : post
      ));
    } catch (error) {
      console.error('Error unliking post:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Feed</h1>
          <TabNavigation
            tabs={[
              { id: 'friends', label: 'Friends', icon: '👥' },
              { id: 'explore', label: 'Explore', icon: '🌍' },
            ]}
            activeTab={feedType}
            onChange={(tabId) => setFeedType(tabId as FeedType)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">
              {feedType === 'friends' ? '👥' : '🌍'}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {feedType === 'friends' ? 'No Friends Posts Yet' : 'No Posts Yet'}
            </h2>
            <p className="text-gray-600 mb-6">
              {feedType === 'friends'
                ? 'Connect with friends to see their coffee adventures!'
                : 'Be the first to share a drink!'}
            </p>
            {feedType === 'friends' ? (
              <a
                href="/friends"
                className="inline-block bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-800 transition"
              >
                Find Friends
              </a>
            ) : (
              <a
                href="/shops"
                className="inline-block bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-800 transition"
              >
                Explore Shops
              </a>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </p>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-sm text-amber-700 hover:text-amber-800 font-medium disabled:opacity-50"
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            <div className="space-y-6">
              {posts.map((post) => (
                <FeedCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
