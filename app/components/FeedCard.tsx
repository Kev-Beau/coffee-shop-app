'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  };
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onUnlike?: (postId: string) => void;
}

export default function FeedCard({ post, currentUserId, onLike, onUnlike }: FeedCardProps) {
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) return;
    if (liking) return;

    setLiking(true);

    try {
      if (post.user_has_liked) {
        await onUnlike?.(post.id);
      } else {
        await onLike?.(post.id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLiking(false);
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
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden">
            {post.profiles.avatar_url ? (
              <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg">☕</span>
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
        <Link href={`/posts/${post.id}`} className="block aspect-square">
          <img
            src={post.photo_url}
            alt={`Photo of ${post.drink_name} at ${post.shop_name}`}
            className="w-full h-full object-cover"
          />
        </Link>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Drink Info */}
        <Link href={`/posts/${post.id}`}>
          <h3 className="font-bold text-gray-900 mb-1">{post.drink_name}</h3>
        </Link>

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
                className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs capitalize"
              >
                {note}
              </span>
            ))}
            {post.coffee_notes.length > 3 && (
              <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                +{post.coffee_notes.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLike}
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
            className="flex items-center gap-2 text-gray-700 hover:text-amber-700 transition"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Comments</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
