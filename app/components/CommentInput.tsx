'use client';

import { useState, useRef, useEffect } from 'react';
import { Coffee } from 'lucide-react';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CommentInputProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  disabled?: boolean;
  replyTo?: {
    id: string;
    username: string;
    display_name: string | null;
  } | null;
  onCancelReply?: () => void;
}

export default function CommentInput({
  onSubmit,
  placeholder = 'Write a comment...',
  minLength = 1,
  maxLength = 1000,
  disabled = false,
  replyTo = null,
  onCancelReply,
}: CommentInputProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus textarea when component mounts
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    // Clear previous error
    setError('');

    // Validation
    const trimmedContent = content.trim();

    if (trimmedContent.length < minLength) {
      setError(`Comment must be at least ${minLength} character${minLength > 1 ? 's' : ''}`);
      return;
    }

    if (trimmedContent.length > maxLength) {
      setError(`Comment must be less than ${maxLength} characters`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(trimmedContent);
      setContent('');
    } catch (err) {
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const characterCount = content.trim().length;
  const isNearLimit = characterCount > maxLength * 0.9;
  const isAtLimit = characterCount >= maxLength;

  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center justify-between mb-3 bg-primary-light rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-amber-900">
              Replying to {replyTo.display_name || replyTo.username}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="text-primary hover:text-amber-900 transition"
            aria-label="Cancel reply"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
              <Coffee className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Input */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isSubmitting}
              className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              rows={3}
              maxLength={maxLength}
              aria-label="Comment input"
              aria-invalid={!!error}
              aria-describedby={error ? 'comment-error' : undefined}
            />

            {/* Error message */}
            {error && (
              <p id="comment-error" className="text-xs text-red-600 mt-2" role="alert">
                {error}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-2">
              {/* Character count */}
              <p
                className={`text-xs ${
                  isAtLimit
                    ? 'text-red-600 font-semibold'
                    : isNearLimit
                    ? 'text-accent'
                    : 'text-gray-500'
                }`}
              >
                {characterCount}/{maxLength}
              </p>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={disabled || isSubmitting || content.trim().length === 0}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    Post
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-500 mt-3 text-center">
        Press Ctrl+Enter or Cmd+Enter to submit
      </p>
    </div>
  );
}
