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
    // Get user from auth header or cookie
    let user;
    let authError;
    let supabaseClient = supabase;

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      // Use the provided access token and create a client with it for RLS
      const token = authHeader.substring(7);
      const { createClient } = await import('@supabase/supabase-js');
      supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );
      const { data: { user: tokenUser }, error: tokenError } = await supabaseClient.auth.getUser();
      user = tokenUser;
      authError = tokenError;
    } else {
      // Fall back to cookie-based auth
      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser();
      user = cookieUser;
      authError = cookieError;
    }

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

    // Check if already liked using the auth'd client
    const { data: existingLike } = await supabaseClient
      .from('likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingLike) {
      return NextResponse.json(
        { error: 'Post already liked' },
        { status: 400 }
      );
    }

    // Like the post using the auth'd client for RLS
    const { error: insertError } = await supabaseClient
      .from('likes')
      .insert({ post_id: postId, user_id: user.id });

    if (insertError) throw insertError;

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
    // Get user from auth header or cookie
    let user;
    let authError;
    let supabaseClient = supabase;

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      // Use the provided access token and create a client with it for RLS
      const token = authHeader.substring(7);
      const { createClient } = await import('@supabase/supabase-js');
      supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );
      const { data: { user: tokenUser }, error: tokenError } = await supabaseClient.auth.getUser();
      user = tokenUser;
      authError = tokenError;
    } else {
      // Fall back to cookie-based auth
      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser();
      user = cookieUser;
      authError = cookieError;
    }

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

    // Unlike the post using the auth'd client for RLS
    const { error: deleteError } = await supabaseClient
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error unliking post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unlike post' },
      { status: 500 }
    );
  }
}
