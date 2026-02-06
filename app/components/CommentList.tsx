'use client';

import { useState } from 'react';
import { Coffee } from 'lucide-react';
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Comment } from '@/lib/types';

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
}

export default function CommentList({
  comments,
  currentUserId,
  onEdit,
  onDelete,
  onReply,
}: CommentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (editContent.trim().length < 1 || editContent.trim().length > 1000) {
      alert('Comment must be between 1 and 1000 characters');
      return;
    }

    await onEdit?.(commentId, editContent.trim());
    setEditingId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setDeletingId(commentId);
    await onDelete?.(commentId);
    setDeletingId(null);
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

  const renderComment = (comment: Comment, isReply = false) => {
    const isEditing = editingId === comment.id;
    const isDeleting = deletingId === comment.id;
    const isOwner = currentUserId === comment.user_id;

    return (
      <div
        key={comment.id}
        className={`${isReply ? 'ml-8 mt-3' : 'mb-4'} ${isDeleting ? 'opacity-50' : ''}`}
      >
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center overflow-hidden">
              {comment.profiles?.avatar_url ? (
                <img
                  src={comment.profiles.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Coffee className="w-4 h-4 text-primary" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              {/* Username and time */}
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm text-gray-900">
                  {comment.profiles?.display_name || comment.profiles?.username}
                </p>
                <span className="text-xs text-gray-500">•</span>
                <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                {isEditing && (
                  <span className="text-xs text-primary font-medium">Editing</span>
                )}
              </div>

              {/* Comment content */}
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  maxLength={1000}
                  autoFocus
                />
              ) : (
                <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              )}
            </div>

            {/* Actions */}
            {!isEditing && (
              <div className="flex items-center gap-3 mt-1 ml-2">
                {isOwner && (
                  <>
                    <button
                      onClick={() => handleStartEdit(comment)}
                      className="text-xs text-gray-500 hover:text-primary font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-gray-500 hover:text-red-600 font-medium transition"
                    >
                      Delete
                    </button>
                  </>
                )}
                {!isReply && (
                  <button
                    onClick={() => onReply?.(comment.id)}
                    className="text-xs text-gray-500 hover:text-primary font-medium transition"
                  >
                    Reply
                  </button>
                )}
              </div>
            )}

            {/* Edit actions */}
            {isEditing && (
              <div className="flex items-center gap-2 mt-2 ml-2">
                <button
                  onClick={() => handleSaveEdit(comment.id)}
                  className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-medium hover:bg-primary-dark transition"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <Coffee className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return <div>{comments.map((comment) => renderComment(comment))}</div>;
}
