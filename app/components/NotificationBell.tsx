'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Bell, User } from 'lucide-react';
import { Coffee } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  if (diffMins < 43200) return `${Math.floor(diffMins / 1440)}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        // Get unread count
        const countResponse = await fetch('/api/notifications?unreadOnly=true', { headers });
        const countData = await countResponse.json();
        if (countData.data) {
          setUnreadCount(countData.data.length);
        }

        // Get recent notifications
        const notifsResponse = await fetch('/api/notifications?limit=10', { headers });
        const notifsData = await notifsResponse.json();
        if (notifsData.data) {
          setNotifications(notifsData.data);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();

    // Poll every 30 seconds for new notifications
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      await fetch('/api/notifications', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ markAllAsRead: true }),
      });

      setUnreadCount(0);
      setNotifications(notifications.map((n: any) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Navigate based on notification type
    if (notification.type === 'friend_request') {
      // Navigate to requests tab
      window.location.href = '/friends?tab=requests';
    } else if (notification.type === 'friend_accepted') {
      // Navigate to friends page
      window.location.href = '/friends?tab=friends';
    } else if (notification.type === 'comment' && notification.post_id) {
      // Navigate to post
      window.location.href = `/posts/${notification.post_id}`;
    } else if (notification.type === 'like' && notification.post_id) {
      // Navigate to post
      window.location.href = `/posts/${notification.post_id}`;
    }
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-full transition"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAsRead}
                  className="text-sm text-primary hover:text-primary-dark font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition ${
                      !notification.read ? 'bg-primary-lighter' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Actor avatar */}
                      {notification.actor ? (
                        <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center overflow-hidden flex-shrink-0">
                          {notification.actor.avatar_url ? (
                            <img
                              src={notification.actor.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-primary font-semibold text-sm">
                              {notification.actor.username?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.type === 'friend_request' || notification.type === 'friend_accepted'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-primary-light text-primary'
                        }`}>
                          <Bell className="w-4 h-4" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 leading-tight">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>

                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-amber-600 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
