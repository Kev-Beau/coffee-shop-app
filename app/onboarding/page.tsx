'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, db } from '@/lib/supabase';
import type { OnboardingStep } from '@/lib/types';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Step 2: Drink Preferences
    temperature: 'both' as 'hot' | 'iced' | 'both',
    sweetness: 'both' as 'sweet' | 'unsweetened' | 'both',
    strength: 'both' as 'strong' | 'light' | 'both',
    milk: 'both' as 'black' | 'cream' | 'both',
    // Step 3: Privacy
    privacy_level: 'public' as 'public' | 'friends_only' | 'private',
    // Step 4: Profile
    display_name: '',
    bio: '',
  });

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/signin');
        return;
      }

      setUserId(session.user.id);

      // Check if already onboarded
      const { data: preferences } = await db.getDrinkPreferences(session.user.id);
      if (preferences) {
        router.push('/');
        return;
      }

      // Load existing profile data
      const profile = await db.getProfile(session.user.id);
      if (profile) {
        setFormData(prev => ({
          ...prev,
          privacy_level: profile.privacy_level,
          display_name: profile.display_name || '',
          bio: profile.bio || '',
        }));
      }
    };

    checkAuth();
  }, [router]);

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      // Save drink preferences
      await db.upsertDrinkPreferences(userId, {
        temperature: formData.temperature,
        sweetness: formData.sweetness,
        strength: formData.strength,
        milk: formData.milk,
      });

      // Update profile
      await db.updateProfile(userId, {
        privacy_level: formData.privacy_level,
        display_name: formData.display_name || null,
        bio: formData.bio || null,
      });

      router.push('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Progress Bar */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">
              Step {step} of {totalSteps}
            </div>
            <div className="text-sm text-gray-500">
              {totalSteps - step} {totalSteps - step === 1 ? 'step' : 'steps'} remaining
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-amber-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {step === 1 && (
          <Step1 onNext={handleNext} />
        )}

        {step === 2 && (
          <Step2
            data={formData}
            onChange={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 3 && (
          <Step3
            data={formData}
            onChange={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 4 && (
          <Step4
            data={formData}
            onChange={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 5 && (
          <Step5
            onComplete={handleComplete}
            onBack={handleBack}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

// Step 1: Welcome
function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-6">☕</div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to CoffeeConnect!
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Let's set up your account in just a few steps
      </p>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-left">
        <h2 className="text-xl font-bold text-gray-900 mb-4">You'll be able to:</h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="text-2xl mr-3">📍</span>
            <span className="text-gray-700">Discover and save local coffee shops</span>
          </li>
          <li className="flex items-start">
            <span className="text-2xl mr-3">📸</span>
            <span className="text-gray-700">Share photos and reviews of your drinks</span>
          </li>
          <li className="flex items-start">
            <span className="text-2xl mr-3">👥</span>
            <span className="text-gray-700">Connect with friends and see their recommendations</span>
          </li>
          <li className="flex items-start">
            <span className="text-2xl mr-3">🔍</span>
            <span className="text-gray-700">Find your perfect cup based on your preferences</span>
          </li>
        </ul>
      </div>

      <button
        onClick={onNext}
        className="bg-amber-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-amber-800 transition shadow-lg"
      >
        Let's Get Started →
      </button>
    </div>
  );
}

// Step 2: Drink Preferences
function Step2({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Coffee Preferences</h1>
      <p className="text-gray-600 mb-8">Help us recommend the perfect drinks for you</p>

      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
        {/* Temperature */}
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            Temperature Preference
          </label>
          <div className="grid grid-cols-3 gap-4">
            {(['hot', 'iced', 'both'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onChange({ ...data, temperature: option })}
                className={`p-4 rounded-xl border-2 transition capitalize ${
                  data.temperature === option
                    ? 'border-amber-700 bg-amber-50 text-amber-700'
                    : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                <div className="text-2xl mb-1">
                  {option === 'hot' ? '🔥' : option === 'iced' ? '❄️' : '🌡️'}
                </div>
                <div className="font-medium">{option}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sweetness */}
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            Sweetness Preference
          </label>
          <div className="grid grid-cols-3 gap-4">
            {(['sweet', 'unsweetened', 'both'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onChange({ ...data, sweetness: option })}
                className={`p-4 rounded-xl border-2 transition capitalize ${
                  data.sweetness === option
                    ? 'border-amber-700 bg-amber-50 text-amber-700'
                    : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                <div className="text-2xl mb-1">
                  {option === 'sweet' ? '🍬' : option === 'unsweetened' ? '🚫' : '🔄'}
                </div>
                <div className="font-medium">{option}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Strength */}
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            Strength Preference
          </label>
          <div className="grid grid-cols-3 gap-4">
            {(['strong', 'light', 'both'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onChange({ ...data, strength: option })}
                className={`p-4 rounded-xl border-2 transition capitalize ${
                  data.strength === option
                    ? 'border-amber-700 bg-amber-50 text-amber-700'
                    : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                <div className="text-2xl mb-1">
                  {option === 'strong' ? '💪' : option === 'light' ? '☁️' : '⚖️'}
                </div>
                <div className="font-medium">{option}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Milk */}
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            Milk Preference
          </label>
          <div className="grid grid-cols-3 gap-4">
            {(['black', 'cream', 'both'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onChange({ ...data, milk: option })}
                className={`p-4 rounded-xl border-2 transition capitalize ${
                  data.milk === option
                    ? 'border-amber-700 bg-amber-50 text-amber-700'
                    : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                <div className="text-2xl mb-1">
                  {option === 'black' ? '☕' : option === 'cream' ? '🥛' : '🔄'}
                </div>
                <div className="font-medium">{option}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="bg-amber-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-amber-800 transition"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// Step 3: Privacy Settings
function Step3({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Settings</h1>
      <p className="text-gray-600 mb-8">Choose who can see your posts and profile</p>

      <div className="space-y-4">
        {([
          { value: 'public', label: 'Public', icon: '🌍', description: 'Anyone can see your posts and profile' },
          { value: 'friends_only', label: 'Friends Only', icon: '👥', description: 'Only friends can see your posts and profile' },
          { value: 'private', label: 'Private', icon: '🔒', description: 'Only you can see your posts and profile' },
        ] as const).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange({ ...data, privacy_level: option.value })}
            className={`w-full bg-white rounded-2xl shadow-md p-6 text-left transition ${
              data.privacy_level === option.value ? 'ring-2 ring-amber-700' : ''
            }`}
          >
            <div className="flex items-start">
              <div className="text-3xl mr-4">{option.icon}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{option.label}</h3>
                <p className="text-gray-600">{option.description}</p>
              </div>
              {data.privacy_level === option.value && (
                <div className="text-amber-700">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="bg-amber-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-amber-800 transition"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// Step 4: Profile Setup
function Step4({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up Your Profile</h1>
      <p className="text-gray-600 mb-8">Tell others a bit about yourself (optional)</p>

      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={data.display_name}
            onChange={(e) => onChange({ ...data, display_name: e.target.value })}
            placeholder="Coffee Lover"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
          />
          <p className="mt-1 text-sm text-gray-500">
            This is how others will see you on CoffeeConnect
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={data.bio}
            onChange={(e) => onChange({ ...data, bio: e.target.value })}
            placeholder="I love exploring new coffee shops and trying different roasts..."
            rows={4}
            maxLength={300}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition resize-none"
          />
          <p className="mt-1 text-sm text-gray-500">
            {data.bio.length}/300 characters
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            💡 You can always update your profile later and add a profile picture in Settings
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="bg-amber-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-amber-800 transition"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// Step 5: App Tour Overview
function Step5({
  onComplete,
  onBack,
  loading,
}: {
  onComplete: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        You're All Set!
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Here's what you can do next
      </p>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-left space-y-6">
        <div className="flex items-start">
          <div className="bg-amber-100 rounded-full p-3 mr-4">
            <span className="text-2xl">🏠</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Explore Coffee Shops</h3>
            <p className="text-gray-600">Browse and discover local coffee shops in your area</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="bg-amber-100 rounded-full p-3 mr-4">
            <span className="text-2xl">📝</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Log Your Drinks</h3>
            <p className="text-gray-600">Share photos, ratings, and notes about your coffee experiences</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="bg-amber-100 rounded-full p-3 mr-4">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Find Friends</h3>
            <p className="text-gray-600">Connect with friends and see what they're drinking</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="bg-amber-100 rounded-full p-3 mr-4">
            <span className="text-2xl">⚙️</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Customize Settings</h3>
            <p className="text-gray-600">Update your preferences and privacy settings anytime</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          onClick={onComplete}
          disabled={loading}
          className="bg-amber-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-amber-800 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Setting up...' : 'Start Exploring →'}
        </button>
      </div>
    </div>
  );
}
