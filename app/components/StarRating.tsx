'use client';

import { StarIcon, StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          aria-label={`Rate ${star} stars`}
        >
          {star <= rating ? (
            <StarIconSolid className={`${sizes[size]} text-amber-500 fill-current`} />
          ) : (
            <StarIconOutline className={`${sizes[size]} text-gray-300`} />
          )}
        </button>
      ))}
    </div>
  );
}
