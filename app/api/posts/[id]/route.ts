import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/posts/[id] - Get a single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const post = await db.getPostById(params.id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check privacy
    const isOwnPost = user && post.user_id === user.id;
    const isPublicPost = (post as any).profiles?.privacy_level === 'public';

    if (!isOwnPost && !isPublicPost && user) {
      // Check if friends
      const { data: friendship } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(initiator_id.eq.${user.id},receiver_id.eq.${post.user_id}),and(initiator_id.eq.${post.user_id},receiver_id.eq.${user.id})`)
        .eq('status', 'accepted')
        .maybeSingle();

      if (!friendship && (post as any).profiles?.privacy_level === 'private') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (!user && !isPublicPost) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get likes
    const likes = await db.getPostLikes(params.id);

    return NextResponse.json({
      data: {
        ...post,
        likes,
        like_count: likes.length,
        user_has_liked: user ? likes.some((l: any) => l.user_id === user.id) : false,
      },
    });
  } catch (error: any) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - Update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Check ownership
    const { data: existingPost } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (existingPost.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update post
    const { data: post, error } = await supabase
      .from('posts')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: post });
  } catch (error: any) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.deletePost(params.id, user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete post' },
      { status: 500 }
    );
  }
}
