import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST /api/friends/request - Send a friend request
export async function POST(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId } = body;

    if (!receiverId) {
      return NextResponse.json(
        { error: 'Receiver ID is required' },
        { status: 400 }
      );
    }

    if (receiverId === user.id) {
      return NextResponse.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 }
      );
    }

    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(initiator_id.eq.${user.id},receiver_id.eq.${receiverId}),and(initiator_id.eq.${receiverId},receiver_id.eq.${user.id})`)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'accepted') {
        return NextResponse.json(
          { error: 'Already friends' },
          { status: 400 }
        );
      } else if (existing.status === 'pending') {
        return NextResponse.json(
          { error: 'Friend request already pending' },
          { status: 400 }
        );
      } else if (existing.status === 'blocked') {
        return NextResponse.json(
          { error: 'Cannot send friend request' },
          { status: 403 }
        );
      }
    }

    // Send friend request
    const friendship = await db.sendFriendRequest(user.id, receiverId);

    return NextResponse.json({ data: friendship }, { status: 201 });
  } catch (error: any) {
    console.error('Error sending friend request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send friend request' },
      { status: 500 }
    );
  }
}
