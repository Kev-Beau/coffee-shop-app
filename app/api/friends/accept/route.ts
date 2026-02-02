import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST /api/friends/accept - Accept a friend request
export async function POST(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { friendshipId } = body;

    if (!friendshipId) {
      return NextResponse.json(
        { error: 'Friendship ID is required' },
        { status: 400 }
      );
    }

    // Accept friend request
    const friendship = await db.acceptFriendRequest(friendshipId, user.id);

    return NextResponse.json({ data: friendship });
  } catch (error: any) {
    console.error('Error accepting friend request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to accept friend request' },
      { status: 500 }
    );
  }
}
