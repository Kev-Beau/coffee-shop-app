import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/supabase';

function createSupabaseClient(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  // If Authorization header is present, use it
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const accessToken = authHeader.substring(7);
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );
  }

  // Otherwise, fall back to cookies
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = value;
    }
  });

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: (key: string) => cookies[key] || null,
          setItem: () => {},
          removeItem: () => {},
        },
      },
    }
  );
}

// GET /api/posts - Fetch posts
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient(request);
    const { searchParams } = new URL(request.url);
    const feedType = searchParams.get('feedType') || 'explore';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }

    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar_url,
          privacy_level
        )
      `)
      .order('created_at', { ascending: false })
      .limit(search ? 20 : limit);

    // If searching, filter by drink name or shop name
    if (search) {
      query = query.or(`drink_name.ilike.%${search}%,shop_name.ilike.%${search}%,coffee_notes.cs.{${search}}`);
    } else {
      query = query.range(offset, offset + limit - 1);
    }

    // If getting specific user's posts
    if (userId && !search) {
      query = query.eq('user_id', userId);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    // Filter by privacy and friendship
    let filteredPosts = posts;

    if (feedType === 'friends' && user) {
      // Get user's friends
      const { data: friendships } = await supabase
        .from('friendships')
        .select('initiator_id, receiver_id')
        .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted');

      const friendIds = friendships?.flatMap((f) =>
        f.initiator_id === user.id ? [f.receiver_id] : [f.initiator_id]
      ) || [];

      // Filter: only show posts from friends and self
      filteredPosts = posts?.filter((post: any) => {
        const isOwnPost = post.user_id === user.id;
        const isFriendPost = friendIds.includes(post.user_id);
        const isPublicPost = post.profiles?.privacy_level === 'public';
        const isFriendsOnlyPost = post.profiles?.privacy_level === 'friends_only';

        return (
          isOwnPost ||
          (isFriendPost && (isPublicPost || isFriendsOnlyPost)) ||
          isPublicPost
        );
      });
    } else if (feedType === 'explore') {
      // Only show public posts
      filteredPosts = posts?.filter((post: any) => {
        return post.profiles?.privacy_level === 'public';
      });
    }

    // Get like counts and user's likes for each post
    const postIds = filteredPosts?.map((p: any) => p.id) || [];
    const { data: likes } = postIds.length > 0
      ? await supabase
          .from('likes')
          .select('post_id, user_id')
          .in('post_id', postIds)
      : { data: [] };

    // Get comments with user info (top-level only, limit to 3 per post)
    const { data: comments } = postIds.length > 0
      ? await supabase
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
          .in('post_id', postIds)
          .is('parent_id', null)
          .order('created_at', { ascending: false })
      : { data: [] };

    // Group comments by post and limit to 3 per post
    const commentsByPost: Record<string, any[]> = {};
    comments?.forEach((comment: any) => {
      if (!commentsByPost[comment.post_id]) {
        commentsByPost[comment.post_id] = [];
      }
      if (commentsByPost[comment.post_id].length < 3) {
        commentsByPost[comment.post_id].push(comment);
      }
    });

    // Count total comments per post
    const commentCounts: Record<string, number> = {};
    comments?.forEach((c: any) => {
      commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
    });

    // Add like and comment information to posts
    const postsWithLikes = filteredPosts?.map((post: any) => {
      const postLikes = likes?.filter((l: any) => l.post_id === post.id) || [];
      return {
        ...post,
        like_count: postLikes.length,
        comment_count: commentCounts[post.id] || 0,
        comments_preview: commentsByPost[post.id] || [],
        user_has_liked: user ? postLikes.some((l: any) => l.user_id === user.id) : false,
      };
    });

    return NextResponse.json({
      data: postsWithLikes,
      total: postsWithLikes?.length || 0,
    });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { shop_id, shop_name, drink_name, rating, photo_url, location_notes, shop_tags, coffee_notes } = body;

    // Validation
    if (!drink_name || !rating) {
      return NextResponse.json(
        { error: 'Drink name and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Create post using the AUTHENTICATED supabase client (not the global one)
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        shop_id,
        shop_name,
        drink_name,
        rating,
        photo_url: photo_url || null,
        location_notes: location_notes || null,
        shop_tags: shop_tags || [],
        coffee_notes: coffee_notes || [],
      })
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

    return NextResponse.json({ data: post }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}
