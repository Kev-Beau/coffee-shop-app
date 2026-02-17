'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Coffee } from 'lucide-react';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import StarRating from './StarRating';
import type { Post } from '@/lib/types';

interface FeedCardProps {
  post: Post & {
    profiles: {
      id: string;
      username: string;
      display_name: string | null;
      avatar_url: string | null;
    };
    comments_preview?: Array<{
      id: string;
      content: string;
      created_at: string;
      profiles: {
        id: string;
        username: string;
        display_name: string | null;
        avatar_url: string | null;
      };
    }>;
  };
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onUnlike?: (postId: string) => void;
  commentCount?: number;
}

export default function FeedCard({ post, currentUserId, onLike, onUnlike, commentCount = 0 }: FeedCardProps) {
  const [liking, setLiking] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const lastTapRef = useRef(0);
  const heartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLike = async () => {
    if (!currentUserId) return;
    if (liking) return;

    setLiking(true);

    try {
      if (post.user_has_liked) {
        // Don't await - let parent's optimistic update handle UI immediately
        onUnlike?.(post.id);
      } else {
        // Don't await - let parent's optimistic update handle UI immediately
        onLike?.(post.id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLiking(false);
    }
  };

  const handlePhotoDoubleTap = () => {
    if (!currentUserId) return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    // Check if this is a double tap (within 300ms)
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // It's a double tap!
      lastTapRef.current = 0;

      // Show heart animation
      setShowHeartAnimation(true);

      // Clear any existing timeout
      if (heartTimeoutRef.current) {
        clearTimeout(heartTimeoutRef.current);
      }

      // Hide animation after 1000ms
      heartTimeoutRef.current = setTimeout(() => {
        setShowHeartAnimation(false);
      }, 1000);

      // Only like if not already liked
      if (!post.user_has_liked) {
        handleLike();
      }
    } else {
      // First tap - record the time
      lastTapRef.current = now;

      // Reset after 300ms if no second tap
      setTimeout(() => {
        if (lastTapRef.current === now) {
          lastTapRef.current = 0;
        }
      }, 300);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (heartTimeoutRef.current) {
        clearTimeout(heartTimeoutRef.current);
      }
    };
  }, []);

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

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link
          href={`/profile/${post.profiles.username}`}
          className="flex items-center gap-3 flex-1"
        >
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center overflow-hidden">
            {post.profiles.avatar_url ? (
              <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Coffee className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {post.profiles.display_name || post.profiles.username}
            </p>
            <p className="text-sm text-gray-500">
              {formatDate(post.created_at)} • {post.shop_name}
            </p>
          </div>
        </Link>
      </div>

      {/* Photo */}
      {post.photo_url && (
        <div className="relative aspect-square">
          {/* Heart Animation Overlay */}
          {showHeartAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-bounce-in">
              <HeartIconSolid className="w-24 h-24 text-white drop-shadow-lg" />
            </div>
          )}

          {/* Photo - double tap to like (no link wrapper) */}
          <div className="w-full h-full" onTouchEnd={handlePhotoDoubleTap}>
            <img
              src={post.photo_url}
              alt={`Photo of ${post.drink_name} at ${post.shop_name}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <Link href={`/posts/${post.id}`} className="block p-4">
        {/* Drink Info */}
        <h3 className="font-bold text-gray-900 mb-1">{post.drink_name}</h3>

        <div className="flex items-center gap-4 mb-3">
          <StarRating rating={post.rating} readonly size="sm" />
        </div>

        {/* Notes */}
        {post.location_notes && (
          <p className="text-gray-700 mb-3 line-clamp-3">{post.location_notes}</p>
        )}

        {/* Tags */}
        {post.shop_tags && post.shop_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.shop_tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs capitalize"
              >
                {tag}
              </span>
            ))}
            {post.shop_tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                +{post.shop_tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Coffee Notes */}
        {post.coffee_notes && post.coffee_notes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.coffee_notes.slice(0, 3).map((note) => (
              <span
                key={note}
                className="px-2 py-1 bg-primary-light text-primary-dark rounded-full text-xs capitalize"
              >
                {note}
              </span>
            ))}
            {post.coffee_notes.length > 3 && (
              <span className="px-2 py-1 bg-primary-light text-primary-dark rounded-full text-xs">
                +{post.coffee_notes.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleLike();
            }}
            disabled={!currentUserId || liking}
            className={`flex items-center gap-2 ${
              post.user_has_liked ? 'text-red-500' : 'text-gray-700'
            } hover:text-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {post.user_has_liked ? (
              <HeartIconSolid className="w-5 h-5" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{post.like_count || 0}</span>
          </button>

          <Link
            href={`/posts/${post.id}`}
            className="flex items-center gap-2 text-gray-700 hover:text-primary transition"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{commentCount > 0 ? commentCount : 'Comments'}</span>
          </Link>
        </div>

        {/* Comments Preview */}
        {post.comments_preview && post.comments_preview.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {post.comments_preview.map((comment) => (
              <div key={comment.id} className="flex gap-2 mb-2 last:mb-0">
                <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {comment.profiles?.avatar_url ? (
                    <img src={comment.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Coffee className="w-3 h-3 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">
                    {comment.profiles?.display_name || comment.profiles?.username}
                  </p>
                  <p className="text-xs text-gray-700 line-clamp-2">{comment.content}</p>
                </div>
              </div>
            ))}

            {(post.comment_count || 0) > (post.comments_preview?.length || 0) && (
              <Link
                href={`/posts/${post.id}`}
                className="text-xs text-primary font-medium hover:text-primary-dark transition"
              >
                View all {(post.comment_count || 0)} comments →
              </Link>
            )}
          </div>
        )}
      </Link>
    </div>
  );
}
