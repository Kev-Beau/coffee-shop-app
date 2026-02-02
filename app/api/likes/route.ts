import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST /api/likes - Like a post
export async function POST(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if already liked
    const existingLike = await db.checkUserLike(postId, user.id);

    if (existingLike) {
      return NextResponse.json(
        { error: 'Post already liked' },
        { status: 400 }
      );
    }

    // Like the post
    await db.likePost(postId, user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to like post' },
      { status: 500 }
    );
  }
}

// DELETE /api/likes - Unlike a post
export async function DELETE(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Unlike the post
    await db.unlikePost(postId, user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error unliking post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unlike post' },
      { status: 500 }
    );
  }
}
