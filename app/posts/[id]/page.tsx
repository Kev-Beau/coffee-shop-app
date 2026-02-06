'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Coffee, ArrowLeftIcon } from 'lucide-react';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { ArrowLeftIcon as ArrowLeftHero } from '@heroicons/react/24/outline';
import StarRating from '@/app/components/StarRating';
import CommentList from '@/app/components/CommentList';
import CommentInput from '@/app/components/CommentInput';
import type { Comment } from '@/lib/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyTo, setReplyTo] = useState<Comment['profiles'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadPost();
      loadComments();
    }
  }, [user, postId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    setUser(session.user);
  };

  const loadPost = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Get the post by ID
      const postResponse = await fetch(`/api/posts/${postId}`, { headers });
      const postData = await postResponse.json();

      if (!postData.data) {
        router.push('/feed');
        return;
      }

      setPost(postData.data);
    } catch (error) {
      console.error('Error loading post:', error);
      router.push('/feed');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/comments?postId=${postId}`, { headers });
      const data = await response.json();

      setComments(data.data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleLike = async () => {
    if (!user || liking) return;

    setLiking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      if (post.user_has_liked) {
        // Unlike (delete)
        await fetch(`/api/likes?postId=${postId}`, {
          method: 'DELETE',
          headers,
        });
        setPost({
          ...post,
          like_count: post.like_count - 1,
          user_has_liked: false,
        });
      } else {
        // Like (post)
        await fetch('/api/likes', {
          method: 'POST',
          headers,
          body: JSON.stringify({ post_id: postId }),
        });
        setPost({
          ...post,
          like_count: post.like_count + 1,
          user_has_liked: true,
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLiking(false);
    }
  };

  const handlePostComment = async (content: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const body: any = {
        post_id: postId,
        content,
      };

      if (replyTo) {
        body.parent_id = replyTo.id;
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      setReplyTo(null);
      await loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      throw error;
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/comments', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ comment_id: commentId, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit comment');
      }

      await loadComments();
    } catch (error) {
      console.error('Error editing comment:', error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/comments?commentId=${commentId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  const handleReply = (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId);
    if (comment) {
      setReplyTo(comment.profiles || null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-lighter via-primary-light to-primary-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-900 font-medium">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lighter via-primary-light to-primary-light pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary font-medium mb-4 hover:text-amber-900 transition"
        >
          <ArrowLeftHero className="w-5 h-5" />
          Back
        </button>

        {/* Post Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-4">
          {/* Header */}
          <div className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center overflow-hidden">
              {post.profiles?.avatar_url ? (
                <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Coffee className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {post.profiles?.display_name || post.profiles?.username}
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(post.created_at)} • {post.shop_name}
              </p>
            </div>
          </div>

          {/* Photo */}
          {post.photo_url && (
            <div className="aspect-square">
              <img
                src={post.photo_url}
                alt={`Photo of ${post.drink_name} at ${post.shop_name}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            {/* Drink Info */}
            <h3 className="font-bold text-xl text-gray-900 mb-2">{post.drink_name}</h3>

            <div className="flex items-center gap-4 mb-4">
              <StarRating rating={post.rating} readonly size="md" />
            </div>

            {/* Notes */}
            {post.location_notes && (
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.location_notes}</p>
            )}

            {/* Tags */}
            {post.shop_tags && post.shop_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.shop_tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm capitalize"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Coffee Notes */}
            {post.coffee_notes && post.coffee_notes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.coffee_notes.map((note: string) => (
                  <span
                    key={note}
                    className="px-3 py-1.5 bg-primary-light text-primary-dark rounded-full text-sm capitalize"
                  >
                    {note}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleLike}
                disabled={!user || liking}
                className={`flex items-center gap-2 ${
                  post.user_has_liked ? 'text-red-500' : 'text-gray-700'
                } hover:text-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {post.user_has_liked ? (
                  <HeartIconSolid className="w-6 h-6" />
                ) : (
                  <HeartIcon className="w-6 h-6" />
                )}
                <span className="text-sm font-medium">{post.like_count || 0} likes</span>
              </button>

              <div className="flex items-center gap-2 text-gray-700">
                <ChatBubbleLeftIcon className="w-6 h-6" />
                <span className="text-sm font-medium">{comments.length} comments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Comments</h2>

          {/* Comment Input */}
          <CommentInput
            onSubmit={handlePostComment}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
          />

          {/* Comments List */}
          <CommentList
            comments={comments}
            currentUserId={user?.id}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
            onReply={handleReply}
          />
        </div>
      </div>
    </div>
  );
}
