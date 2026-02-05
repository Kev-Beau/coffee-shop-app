'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Coffee, SearchX } from 'lucide-react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { UserIcon, DocumentTextIcon, MapPinIcon } from '@heroicons/react/24/outline';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type SearchTab = 'users' | 'posts' | 'shops';

export default function SearchPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('shops');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
    }
  };

  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => performSearch(), 300);
      return () => clearTimeout(timer);
    } else if (query.length === 0) {
      setResults([]);
      setSearched(false);
    }
  }, [query, activeTab]);

  const performSearch = async () => {
    if (query.length < 2) return;

    setLoading(true);
    setSearched(true);

    try {
      if (activeTab === 'users') {
        await searchUsers();
      } else if (activeTab === 'posts') {
        await searchPosts();
      } else if (activeTab === 'shops') {
        await searchShops();
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .neq('id', user?.id || '')
      .limit(20);

    setResults(data || []);
  };

  const searchPosts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: HeadersInit = {};
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`/api/posts?search=${query}`, { headers });
    const data = await response.json();
    setResults(data.data || []);
  };

  const searchShops = async () => {
    // Search using Google Places API via shops page
    try {
      const response = await fetch(`/api/shops/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.data || []);
    } catch (error) {
      console.error('Error searching shops:', error);
      setResults([]);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users, posts, or shops..."
              className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 placeholder-gray-400"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { id: 'users' as SearchTab, icon: UserIcon, label: 'Friends' },
              { id: 'posts' as SearchTab, icon: DocumentTextIcon, label: 'Posts' },
              { id: 'shops' as SearchTab, icon: MapPinIcon, label: 'Shops' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'bg-amber-700 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Searching...</p>
          </div>
        ) : !searched ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-amber-100 rounded-full">
              <MagnifyingGlassIcon className="w-10 h-10 text-amber-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Search CoffeeConnect</h2>
            <p className="text-gray-600">Find friends, posts, and coffee shops</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <SearchX className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h2>
            <p className="text-gray-600">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">{results.length} result{results.length !== 1 ? 's' : ''}</p>

            {activeTab === 'users' && results.map((result: any) => (
              <button
                key={result.id}
                onClick={() => router.push(`/profile?userId=${result.id}`)}
                className="w-full bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center overflow-hidden">
                    {result.avatar_url ? (
                      <img src={result.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Coffee className="w-5 h-5 text-amber-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{result.display_name || result.username}</h3>
                    <p className="text-sm text-gray-600">@{result.username}</p>
                    {result.bio && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{result.bio}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {activeTab === 'posts' && results.map((result: any) => (
              <button
                key={result.id}
                onClick={() => router.push(`/posts/${result.id}`)}
                className="w-full bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center overflow-hidden">
                    {result.profiles?.avatar_url ? (
                      <img src={result.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Coffee className="w-5 h-5 text-amber-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{result.drink_name}</h3>
                    <p className="text-sm text-gray-600">{result.shop_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-xs ${i < result.rating ? 'text-amber-500' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {activeTab === 'shops' && results.map((result: any, index: number) => (
              <button
                key={`${result.place_id}-${index}`}
                onClick={() => router.push(`/shops/${result.place_id}`)}
                className="w-full bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{result.name}</h3>
                    <p className="text-sm text-gray-600">{result.address}</p>
                  </div>
                  {result.rating && (
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-amber-700">★</span>
                      <span className="text-sm text-gray-700">{result.rating}</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
