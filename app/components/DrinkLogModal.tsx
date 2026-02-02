'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PhotoUpload from './PhotoUpload';
import StarRating from './StarRating';
import TagSelector from './TagSelector';
import { SHOP_TAG_OPTIONS, COFFEE_NOTE_OPTIONS } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface DrinkLogModalProps {
  shopId: string;
  shopName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DrinkLogModal({
  shopId,
  shopName,
  isOpen,
  onClose,
  onSuccess,
}: DrinkLogModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [drinkName, setDrinkName] = useState('');
  const [rating, setRating] = useState(0);
  const [locationNotes, setLocationNotes] = useState('');
  const [shopTags, setShopTags] = useState<string[]>([]);
  const [coffeeNotes, setCoffeeNotes] = useState<string[]>([]);

  // Reset success state when modal opens
  if (isOpen && success) {
    setSuccess(false);
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!drinkName || rating === 0) {
      alert('Please enter a drink name and select a rating');
      return;
    }

    setLoading(true);

    try {
      // Get current session to include auth token
      const { data: { session } } = await supabase!.auth.getSession();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Include auth token if available
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          shop_id: shopId,
          shop_name: shopName,
          drink_name: drinkName,
          rating,
          photo_url: photoUrl || null,
          location_notes: locationNotes || null,
          shop_tags: shopTags,
          coffee_notes: coffeeNotes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to log drink');
      }

      // Show success message
      setSuccess(true);

      // Reset form after a delay
      setTimeout(() => {
        setPhotoUrl(undefined);
        setDrinkName('');
        setRating(0);
        setLocationNotes('');
        setShopTags([]);
        setCoffeeNotes([]);
        setSuccess(false);
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error logging drink:', error);
      alert(error.message || 'Failed to log drink');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Log Drink</h2>
              <p className="text-sm text-gray-600">{shopName}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mx-6 mt-4 p-4 bg-green-100 border border-green-300 rounded-xl text-green-800 animate-pulse">
              <div className="flex items-center">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <p className="font-semibold">Drink logged successfully!</p>
                  <p className="text-sm">It will appear on your feed shortly.</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Photo Upload */}
            <div>
              <PhotoUpload
                value={photoUrl}
                onChange={setPhotoUrl}
                onRemove={() => setPhotoUrl(undefined)}
              />
              <p className="mt-1 text-sm text-gray-500">Share a photo of your drink (optional)</p>
            </div>

            {/* Drink Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drink Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={drinkName}
                onChange={(e) => setDrinkName(e.target.value)}
                placeholder="e.g., Caramel Macchiato, Cold Brew, Latte..."
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <StarRating rating={rating} onRatingChange={setRating} size="lg" />
              {rating > 0 && (
                <p className="mt-1 text-sm text-gray-600">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Location Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Notes
              </label>
              <textarea
                value={locationNotes}
                onChange={(e) => setLocationNotes(e.target.value)}
                placeholder="Share your thoughts about this shop..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition resize-none text-gray-900 placeholder:text-gray-400"
              />
              <p className="mt-1 text-sm text-gray-500">{locationNotes.length}/500</p>
            </div>

            {/* Shop Tags */}
            <div>
              <TagSelector
                tags={SHOP_TAG_OPTIONS}
                selectedTags={shopTags}
                onChange={setShopTags}
                label="Shop Tags"
                placeholder="Select shop amenities..."
              />
            </div>

            {/* Coffee Notes */}
            <div>
              <TagSelector
                tags={COFFEE_NOTE_OPTIONS}
                selectedTags={coffeeNotes}
                onChange={setCoffeeNotes}
                label="Coffee Notes"
                placeholder="Select flavor notes..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !drinkName || rating === 0}
                className="flex-1 px-4 py-3 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Log Drink'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
