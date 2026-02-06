'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { db } from '@/lib/supabase';
import { Coffee, Users, Globe, Lock, Palette } from 'lucide-react';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'friends_only' | 'private'>('public');
  const [favoriteDrinks, setFavoriteDrinks] = useState<string[]>([]);
  const [preferredRoast, setPreferredRoast] = useState('');
  const [brewingMethod, setBrewingMethod] = useState('');
  const [coffeeStrength, setCoffeeStrength] = useState('');

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/signin');
        return;
      }

      setUser(session.user);
      loadProfile(session.user.id);
    };

    checkAuth();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const data = await db.getProfile(userId);
      setProfile(data);

      // Set form values
      setUsername(data?.username || '');
      setDisplayName(data?.display_name || '');
      setBio(data?.bio || '');
      setPrivacyLevel(data?.privacy_level || 'public');
      setFavoriteDrinks(data?.favorite_drinks || []);
      setPreferredRoast(data?.preferred_roast || '');
      setBrewingMethod(data?.brewing_method || '');
      setCoffeeStrength(data?.coffee_strength || '');
    } catch (error) {
      console.error('Error loading profile:', error);
      showMessage('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      // Validate username
      if (username.length < 3) {
        showMessage('error', 'Username must be at least 3 characters');
        setSaving(false);
        return;
      }

      // Check if username changed
      if (username !== profile?.username) {
        // Check if new username is already taken
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .neq('id', user.id)  // Exclude current user
          .maybeSingle();

        if (existingUser) {
          showMessage('error', 'This username is already taken');
          setSaving(false);
          return;
        }
      }

      await db.updateProfile(user.id, {
        username,
        display_name: displayName || undefined,
        bio: bio || undefined,
        privacy_level: privacyLevel,
        favorite_drinks: favoriteDrinks,
        preferred_roast: preferredRoast,
        brewing_method: brewingMethod,
        coffee_strength: coffeeStrength,
      });

      showMessage('success', 'Profile updated successfully!');

      // Reload profile
      await loadProfile(user.id);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      showMessage('error', `Failed to update profile: ${error?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      return;
    }

    if (!confirm('This will permanently delete all your data including posts, friends, and settings. Continue?')) {
      return;
    }

    try {
      // Delete user account (this will cascade delete all data due to RLS policies)
      const { error } = await supabase.auth.admin.deleteUser(user.id);

      if (error) throw error;

      // Sign out
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      showMessage('error', 'Failed to delete account. Please contact support.');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const toggleFavoriteDrink = (drink: string) => {
    setFavoriteDrinks(prev =>
      prev.includes(drink)
        ? prev.filter(d => d !== drink)
        : [...prev, drink]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-lighter to-primary-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-lighter to-primary-light pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Settings */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Settings</h2>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="coffee-lover"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              />
              <p className="mt-1 text-sm text-gray-500">
                Your unique username (3+ characters, lowercase letters, numbers, hyphens)
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Coffee Lover"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={3}
                maxLength={300}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
              />
              <p className="mt-1 text-sm text-gray-500">{bio.length}/300</p>
            </div>

            {/* Coffee Preferences */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-primary" />
                Coffee Preferences
              </h3>

              {/* Favorite Drinks - Multi-select chips */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Drinks</label>
                <div className="flex flex-wrap gap-2">
                  {['Espresso', 'Latte', 'Cappuccino', 'Americano', 'Cold Brew', 'Pour Over'].map(drink => (
                    <button
                      key={drink}
                      type="button"
                      onClick={() => toggleFavoriteDrink(drink)}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition ${
                        favoriteDrinks.includes(drink)
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 text-gray-700 hover:border-primary'
                      }`}
                    >
                      {drink}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roast Level - Buttons */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Roast Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Light', 'Medium', 'Dark'].map(roast => (
                    <button
                      key={roast}
                      type="button"
                      onClick={() => setPreferredRoast(roast)}
                      className={`py-3 rounded-lg border-2 font-medium transition ${
                        preferredRoast === roast
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 text-gray-700 hover:border-primary'
                      }`}
                    >
                      {roast}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brewing Method - Buttons */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Brewing Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Espresso', 'Pour Over', 'French Press', 'Cold Brew', 'Drip', 'Aeropress'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setBrewingMethod(method)}
                      className={`py-3 rounded-lg border-2 font-medium transition ${
                        brewingMethod === method
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 text-gray-700 hover:border-primary'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strength - Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Strength Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Mild', 'Medium', 'Strong'].map(strength => (
                    <button
                      key={strength}
                      type="button"
                      onClick={() => setCoffeeStrength(strength)}
                      className={`py-3 rounded-lg border-2 font-medium transition ${
                        coffeeStrength === strength
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 text-gray-700 hover:border-primary'
                      }`}
                    >
                      {strength}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Privacy
              </label>
              <div className="space-y-2">
                {[
                  { value: 'public', label: 'Public', description: 'Anyone can view your profile', icon: <Globe className="w-5 h-5" /> },
                  { value: 'friends_only', label: 'Friends Only', description: 'Only friends can view your profile', icon: <Users className="w-5 h-5" /> },
                  { value: 'private', label: 'Private', description: 'Only you can view your profile', icon: <Lock className="w-5 h-5" /> },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPrivacyLevel(option.value as any)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition ${
                      privacyLevel === option.value
                        ? 'border-primary bg-primary-lighter'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-600">
                          {option.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {option.label}
                          </p>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </div>
                      {privacyLevel === option.value && (
                        <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Account Information</h2>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-600">Email:</span>{' '}
              <span className="text-gray-900">{user?.email}</span>
            </div>
            <div>
              <span className="text-gray-600">Username:</span>{' '}
              <span className="text-gray-900">@{profile?.username}</span>
            </div>
            <div>
              <span className="text-gray-600">Member since:</span>{' '}
              <span className="text-gray-900">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Appearance
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Choose your preferred color theme
            </p>
            <ThemeSwitcher />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <button
            onClick={handleSignOut}
            className="w-full px-6 py-4 text-left text-gray-700 hover:bg-gray-50 transition border-b border-gray-200"
          >
            Sign Out
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full px-6 py-4 text-left text-red-600 hover:bg-red-50 transition flex items-center gap-3"
          >
            <TrashIcon className="w-5 h-5" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
