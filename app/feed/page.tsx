'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import FeedCard from '../components/FeedCard';
import TabNavigation from '../components/TabNavigation';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { Users, Globe, AlertTriangle } from 'lucide-react';

type FeedType = 'friends' | 'explore';

export default function FeedPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [feedType, setFeedType] = useState<FeedType>('explore');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Show setup message if Supabase not configured
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-lighter to-primary-light flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Setup Required</h1>
          <p className="text-gray-600 mb-6">
            Social features require Supabase configuration. See <code className="bg-gray-100 px-2 py-1 rounded">SOCIAL_SETUP.md</code> for instructions.
          </p>
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
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
      console.log('Feed: Checking authentication...');
      console.log('Feed: supabase exists?', !!supabase);

      if (!supabase) {
        console.log('Feed: No supabase client');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

      console.log('Feed: session exists?', !!session);

      if (!session) {
        console.log('Feed: No session, redirecting to signin');
        // Redirect to signin if not authenticated
        window.location.href = '/auth/signin';
        return;
      }

      console.log('Feed: User authenticated:', session.user.id);
      setUser(session.user);

      // Load posts
      console.log('Feed: Calling fetchPosts');
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
    if (!supabase) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching posts for', feedType, 'feed...');

      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('No active session. Please sign in again.');
        return;
      }

      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      console.log('Fetching from /api/posts?feedType=', feedType);

      const response = await fetch(
        `/api/posts?feedType=${feedType}&limit=20`,
        { headers }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('Response data:', data);

      if (data.error) {
        setError(data.error);
        console.error('Error fetching posts:', data.error);
        return;
      }

      setPosts(data.data || []);
      console.log(`Loaded ${data.data?.length || 0} posts for ${feedType}`);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      console.error('Error details:', error.message);
      setError(error.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!supabase) return;

    // Capture original post state before optimistic update
    const originalPost = posts.find((p) => p.id === postId);

    // Optimistic update - update UI immediately
    setPosts(posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            user_has_liked: true,
            like_count: (post.like_count || 0) + 1,
          }
        : post
    ));

    try {
      // Get session for auth token
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/likes', {
        method: 'POST',
        headers,
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Like API error:', response.status, errorData);

        // If it's "already liked", that's fine - keep the optimistic update
        if (response.status === 400 && errorData.error?.includes('already liked')) {
          console.log('Post already liked, keeping optimistic update');
          return;
        }

        throw new Error(errorData.error || 'Failed to like post');
      }

      console.log('Like successful');
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert optimistic update on error - use the original post state
      if (originalPost) {
        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === postId ? originalPost : post
          )
        );
      }
    }
  };

  const handleUnlike = async (postId: string) => {
    if (!supabase) return;

    // Capture original post state before optimistic update
    const originalPost = posts.find((p) => p.id === postId);

    // Optimistic update - update UI immediately
    setPosts(posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            user_has_liked: false,
            like_count: Math.max((post.like_count || 0) - 1, 0),
          }
        : post
    ));

    try {
      // Get session for auth token
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/likes?postId=${postId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to unlike post');
      }

      console.log('Unlike successful');
    } catch (error) {
      console.error('Error unliking post:', error);
      // Revert optimistic update on error - use the original post state
      if (originalPost) {
        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === postId ? originalPost : post
          )
        );
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const { containerRef, pullDistance, refreshing: pullRefreshing } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-lighter to-primary-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-lighter to-primary-light flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Feed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-lighter to-primary-light pb-20">
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
        {/* Tab Navigation */}
        <div className="max-w-2xl mx-auto px-4 py-6">
        <TabNavigation
          tabs={[
            { id: 'friends', label: 'Friends', icon: <Users className="w-5 h-5" /> },
            { id: 'explore', label: 'Explore', icon: <Globe className="w-5 h-5" /> },
          ]}
          activeTab={feedType}
          onChange={(tabId) => setFeedType(tabId as FeedType)}
        />
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pb-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-primary-light rounded-full">
              {feedType === 'friends' ? <Users className="w-10 h-10 text-primary" /> : <Globe className="w-10 h-10 text-primary" />}
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
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
              >
                Find Friends
              </a>
            ) : (
              <a
                href="/shops"
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
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
                className="text-sm text-primary hover:text-primary-dark font-medium disabled:opacity-50"
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
                  commentCount={post.comment_count}
                />
              ))}
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
