import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { createSupabaseClient } from '../_utils';

// GET /api/friends/list - Get friends and pending requests
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    console.log('[Friends API] Auth header present:', !!authHeader);

    const supabase = createSupabaseClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('[Friends API] Auth error:', authError?.message);
    console.log('[Friends API] User present:', !!user);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', debug: authError?.message }, { status: 401 });
    }

    // Get all friendships
    const friendships = await db.getPendingRequests(user.id);
    const friends = await db.getFriends(user.id);

    // Process friendships
    const incoming = friendships
      .filter((f: any) => f.receiver_id === user.id && f.status === 'pending')
      .map((f: any) => ({
        ...f,
        friend_profile: f.initiator,
      }));

    const outgoing = friendships
      .filter((f: any) => f.initiator_id === user.id && f.status === 'pending')
      .map((f: any) => ({
        ...f,
        friend_profile: f.receiver,
      }));

    // Process friends
    const accepted = friends.map((f: any) => ({
      ...f,
      friend_profile: f.initiator_id === user.id ? f.receiver : f.initiator,
    }));

    return NextResponse.json({
      data: {
        friends: accepted,
        incomingRequests: incoming,
        outgoingRequests: outgoing,
      },
    });
  } catch (error: any) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch friends' },
      { status: 500 }
    );
  }
}
