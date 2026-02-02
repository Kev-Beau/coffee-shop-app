'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { MagnifyingGlassIcon, UserPlusIcon, UserMinusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function FriendsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'friends' | 'requests' | 'search'>('friends');

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/signin');
        return;
      }

      setUser(session.user);
      loadData();
    };

    checkAuth();
  }, []);

  const loadData = async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        fetch('/api/friends/list'),
        fetch('/api/friends/list'),
      ]);

      const friendsData = await friendsRes.json();
      const requestsData = await requestsRes.json();

      if (friendsData.data) {
        setFriends(friendsData.data.friends || []);
        setIncomingRequests(friendsData.data.incomingRequests || []);
        setOutgoingRequests(friendsData.data.outgoingRequests || []);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) return;

    try {
      const response = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.data) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleSendRequest = async (receiverId: string) => {
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId }),
      });

      if (response.ok) {
        // Remove from search results and add to outgoing
        const requestedUser = searchResults.find((u: any) => u.id === receiverId);
        if (requestedUser) {
          setSearchResults(searchResults.filter((u: any) => u.id !== receiverId));
          setOutgoingRequests([...outgoingRequests, {
            id: Date.now(),
            status: 'pending',
            friend_profile: requestedUser,
          }]);
        }
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId }),
      });

      if (response.ok) {
        // Move from incoming to friends
        const request = incomingRequests.find((r: any) => r.id === friendshipId);
        setIncomingRequests(incomingRequests.filter((r: any) => r.id !== friendshipId));
        if (request) {
          setFriends([...friends, { ...request, status: 'accepted' }]);
        }
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      const response = await fetch(`/api/friends/remove?friendshipId=${friendshipId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFriends(friends.filter((f: any) => f.id !== friendshipId));
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Friends</h1>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setTab('friends')}
              className={`pb-3 px-2 font-medium ${
                tab === 'friends'
                  ? 'text-amber-700 border-b-2 border-amber-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Friends {friends.length > 0 && `(${friends.length})`}
            </button>
            <button
              onClick={() => setTab('requests')}
              className={`pb-3 px-2 font-medium ${
                tab === 'requests'
                  ? 'text-amber-700 border-b-2 border-amber-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Requests {incomingRequests.length > 0 && `(${incomingRequests.length})`}
            </button>
            <button
              onClick={() => setTab('search')}
              className={`pb-3 px-2 font-medium ${
                tab === 'search'
                  ? 'text-amber-700 border-b-2 border-amber-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Find Friends
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {tab === 'friends' && (
          <div className="space-y-4">
            {friends.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👥</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Friends Yet</h2>
                <p className="text-gray-600 mb-6">Find people to connect with!</p>
                <button
                  onClick={() => setTab('search')}
                  className="bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-800 transition"
                >
                  Find Friends
                </button>
              </div>
            ) : (
              friends.map((friendship: any) => {
                const profile = friendship.friend_profile;
                return (
                  <div
                    key={friendship.id}
                    className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">☕</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {profile?.display_name || profile?.username}
                        </p>
                        <p className="text-sm text-gray-500">@{profile?.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(friendship.id)}
                      className="text-gray-400 hover:text-red-500 transition"
                      title="Remove friend"
                    >
                      <UserMinusIcon className="w-6 h-6" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'requests' && (
          <div className="space-y-4">
            {incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📬</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Pending Requests</h2>
                <p className="text-gray-600">
                  {friends.length === 0
                    ? "Find people to connect with!"
                    : "You're all caught up!"}
                </p>
              </div>
            ) : (
              <>
                {incomingRequests.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Incoming Requests</h3>
                    <div className="space-y-3">
                      {incomingRequests.map((request: any) => {
                        const profile = request.friend_profile;
                        return (
                          <div
                            key={request.id}
                            className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden">
                                {profile?.avatar_url ? (
                                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xl">☕</span>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {profile?.display_name || profile?.username}
                                </p>
                                <p className="text-sm text-gray-500">@{profile?.username}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptRequest(request.id)}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                title="Accept"
                              >
                                <CheckIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleRemoveFriend(request.id)}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                title="Decline"
                              >
                                <XMarkIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {outgoingRequests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Sent Requests</h3>
                    <div className="space-y-3">
                      {outgoingRequests.map((request: any) => {
                        const profile = request.friend_profile;
                        return (
                          <div
                            key={request.id}
                            className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between opacity-60"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden">
                                {profile?.avatar_url ? (
                                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xl">☕</span>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {profile?.display_name || profile?.username}
                                </p>
                                <p className="text-sm text-gray-500">Pending...</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === 'search' && (
          <div>
            {/* Search Box */}
            <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by username..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500">Results</h3>
                {searchResults.map((user: any) => {
                  const isFriend = friends.some((f: any) => f.friend_profile?.id === user.id);
                  const hasPendingRequest = outgoingRequests.some((r: any) => r.friend_profile?.id === user.id);

                  return (
                    <div
                      key={user.id}
                      className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">☕</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.display_name || user.username}
                          </p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                      {isFriend ? (
                        <span className="text-sm text-gray-500">Already friends</span>
                      ) : hasPendingRequest ? (
                        <span className="text-sm text-amber-700">Request sent</span>
                      ) : user.friendshipStatus === 'incoming' ? (
                        <button
                          onClick={() => {
                            const request = incomingRequests.find((r: any) => r.friend_profile?.id === user.id);
                            if (request) handleAcceptRequest(request.id);
                          }}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
                        >
                          Accept Request
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(user.id)}
                          className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition text-sm font-medium"
                        >
                          <UserPlusIcon className="w-4 h-4 inline mr-1" />
                          Add Friend
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
