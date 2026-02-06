import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey &&
  supabaseUrl !== 'your-supabase-project-url' &&
  supabaseAnonKey !== 'your-supabase-anon-key');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not configured. Social features will be disabled.');
  console.warn('📝 See SOCIAL_SETUP.md for setup instructions.');
} else {
  console.log('✅ Supabase configured:', supabaseUrl);
}

export const supabase = isSupabaseConfigured
  ? createClient(
      supabaseUrl!,
      supabaseAnonKey!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    )
  : null;

// Database helper functions
export const db = {
  // Profiles
  async getProfile(userId: string) {
    const { data, error } = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<{
    username: string;
    display_name: string;
    bio: string;
    avatar_url: string;
    privacy_level: 'public' | 'friends_only' | 'private';
    favorite_drinks: string[];
    preferred_roast: string;
    brewing_method: string;
    coffee_strength: string;
  }>) {
    const { data, error } = await supabase!
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Drink Preferences
  async getDrinkPreferences(userId: string) {
    const { data, error } = await supabase!
      .from('drink_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async upsertDrinkPreferences(userId: string, preferences: {
    temperature: 'hot' | 'iced' | 'both';
    sweetness: 'sweet' | 'unsweetened' | 'both';
    strength: 'strong' | 'light' | 'both';
    milk: 'black' | 'cream' | 'both';
  }) {
    const { data, error } = await supabase!
      .from('drink_preferences')
      .upsert({ user_id: userId, ...preferences })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Posts
  async createPost(post: {
    user_id: string;
    shop_id: string;
    shop_name: string;
    drink_name: string;
    rating: number;
    photo_url?: string;
    location_notes?: string;
    shop_tags?: string[];
    coffee_notes?: string[];
  }) {
    const { data, error } = await supabase!
      .from('posts')
      .insert(post)
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async getPosts(options?: {
    userId?: string;
    feedType?: 'friends' | 'explore';
    limit?: number;
    offset?: number;
  }) {
    let query = supabase!
      .from('posts')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          privacy_level
        )
      `)
      .order('created_at', { ascending: false })
      .limit(options?.limit || 20)
      .range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 20) - 1);

    // Filter by user
    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getPostById(postId: string) {
    const { data, error } = await supabase!
      .from('posts')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          privacy_level
        )
      `)
      .eq('id', postId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deletePost(postId: string, userId: string) {
    const { data, error } = await supabase!
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    return data;
  },

  // Visits
  async createVisit(visit: {
    user_id: string;
    place_id: string;
    place_name: string;
    address: string;
  }) {
    const { data, error } = await supabase!
      .from('visits')
      .insert(visit)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getVisits(userId: string, limit = 50) {
    const { data, error } = await supabase!
      .from('visits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Favorites
  async addFavorite(favorite: {
    user_id: string;
    place_id: string;
    place_name: string;
    address: string;
  }) {
    const { data, error } = await supabase!
      .from('favorites')
      .insert(favorite)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeFavorite(userId: string, placeId: string) {
    const { data, error } = await supabase!
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('place_id', placeId)
      .select();

    if (error) throw error;
    return data;
  },

  async getFavorites(userId: string) {
    const { data, error } = await supabase!
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async isFavorite(userId: string, placeId: string) {
    const { data, error } = await supabase!
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('place_id', placeId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  // Friendships
  async sendFriendRequest(initiatorId: string, receiverId: string) {
    const { data, error } = await supabase!
      .from('friendships')
      .insert({
        initiator_id: initiatorId,
        receiver_id: receiverId,
        status: 'pending',
      })
      .select(`
        *,
        initiator:profiles!friendships_initiator_id_fkey (*),
        receiver:profiles!friendships_receiver_id_fkey (*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async acceptFriendRequest(friendshipId: string, receiverId: string) {
    const { data, error } = await supabase!
      .from('friendships')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', friendshipId)
      .eq('receiver_id', receiverId)
      .select(`
        *,
        initiator:profiles!friendships_initiator_id_fkey (*),
        receiver:profiles!friendships_receiver_id_fkey (*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async removeFriend(friendshipId: string, userId: string) {
    const { data, error } = await supabase!
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
      .or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`)
      .select();

    if (error) throw error;
    return data;
  },

  async getFriends(userId: string) {
    const { data, error } = await supabase!
      .from('friendships')
      .select(`
        *,
        initiator:profiles!friendships_initiator_id_fkey (*),
        receiver:profiles!friendships_receiver_id_fkey (*)
      `)
      .or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) throw error;
    return data;
  },

  async getFriendsCount(userId: string) {
    const { count, error } = await supabase!
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) throw error;
    return count || 0;
  },

  async getPendingRequests(userId: string) {
    const { data, error } = await supabase!
      .from('friendships')
      .select(`
        *,
        initiator:profiles!friendships_initiator_id_fkey (*),
        receiver:profiles!friendships_receiver_id_fkey (*)
      `)
      .or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'pending');

    if (error) throw error;
    return data;
  },

  async searchUsers(query: string, currentUserId: string) {
    const { data, error } = await supabase!
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .neq('id', currentUserId)
      .limit(20);

    if (error) throw error;
    return data;
  },

  // Likes
  async likePost(postId: string, userId: string) {
    const { data, error } = await supabase!
      .from('likes')
      .insert({ post_id: postId, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async unlikePost(postId: string, userId: string) {
    const { data, error } = await supabase!
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    return data;
  },

  async getPostLikes(postId: string) {
    const { data, error } = await supabase!
      .from('likes')
      .select('*, profiles(id, username, display_name, avatar_url)')
      .eq('post_id', postId);

    if (error) throw error;
    return data;
  },

  async checkUserLike(postId: string, userId: string) {
    const { data, error } = await supabase!
      .from('likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Comments
  async createComment(comment: {
    user_id: string;
    post_id: string;
    content: string;
    parent_id?: string;
  }) {
    const { data, error } = await supabase!
      .from('comments')
      .insert(comment)
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async getComments(postId: string, parentId?: string) {
    let query = supabase!
      .from('comments')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      (data || []).map(async (comment) => {
        const { data: replies } = await supabase!
          .from('comments')
          .select(`
            *,
            profiles (
              id,
              username,
              display_name,
              avatar_url
            )
          `)
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true });

        return {
          ...comment,
          replies: replies || [],
        };
      })
    );

    return commentsWithReplies;
  },

  async updateComment(commentId: string, userId: string, updates: { content: string }) {
    const { data, error } = await supabase!
      .from('comments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteComment(commentId: string, userId: string) {
    const { data, error } = await supabase!
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    return data;
  },

  async getCommentCount(postId: string) {
    const { count, error } = await supabase!
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;
    return count || 0;
  },

  // Real-time subscriptions
  subscribeToPosts(userId: string, callback: (payload: any) => void) {
    return supabase!
      .channel('posts-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        callback
      )
      .subscribe();
  },

  subscribeToFriendships(userId: string, callback: (payload: any) => void) {
    return supabase!
      .channel('friendships-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `initiator_id=eq.${userId}`,
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `receiver_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Notifications
  async createNotification(
    userId: string,
    type: 'friend_request' | 'friend_accepted' | 'comment' | 'like',
    title: string,
    message: string,
    actorId?: string,
    postId?: string,
    friendshipId?: string
  ) {
    const { data, error } = await supabase!
      .rpc('create_notification', {
        p_user_id: userId,
        p_type: type,
        p_title: title,
        p_message: message,
        p_actor_id: actorId || null,
        p_post_id: postId || null,
        p_friendship_id: friendshipId || null,
      });

    if (error) throw error;
    return data;
  },

  async getNotifications(userId: string, unreadOnly = false, limit = 20) {
    let query = supabase!
      .from('notifications')
      .select(`
        *,
        actor:actor_id(id, username, display_name, avatar_url),
        post:post_id(id, drink_name, photo_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async markNotificationAsRead(notificationId: string) {
    const { data, error } = await supabase!
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return data;
  },

  async markAllNotificationsAsRead(userId: string) {
    const { data, error } = await supabase!
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return data;
  },

  async getUnreadCount(userId: string) {
    const { data, error } = await supabase!
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return data || 0;
  },
};

export default supabase;
