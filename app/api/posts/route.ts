import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/posts - Fetch posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const feedType = searchParams.get('feedType') || 'explore';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');

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
      .range(offset, offset + limit - 1);

    // If getting specific user's posts
    if (userId) {
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

    // Add like information to posts
    const postsWithLikes = filteredPosts?.map((post: any) => {
      const postLikes = likes?.filter((l: any) => l.post_id === post.id) || [];
      return {
        ...post,
        like_count: postLikes.length,
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

    // Create post
    const { data: post, error } = await db.createPost({
      user_id: user.id,
      shop_id,
      shop_name,
      drink_name,
      rating,
      photo_url: photo_url || null,
      location_notes: location_notes || null,
      shop_tags: shop_tags || [],
      coffee_notes: coffee_notes || [],
    });

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
