import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/friends/search - Search for users
export async function GET(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Search users
    const users = await db.searchUsers(query, user.id);

    // Check which users are already friends or have pending requests
    const userIds = users.map((u) => u.id);
    const { data: friendships } = await supabase
      .from('friendships')
      .select('*')
      .or(`initiator_id.in.(${userIds.join(',')}),receiver_id.in.(${userIds.join(',')})`)
      .eq('initiator_id', user.id);

    // Add friendship status to each user
    const usersWithStatus = users.map((u) => {
      const friendship = friendships?.find((f) =>
        f.initiator_id === u.id || f.receiver_id === u.id
      );

      let status = 'none';
      if (friendship) {
        status = friendship.status;
        if (friendship.receiver_id === user.id && friendship.status === 'pending') {
          status = 'incoming';
        } else if (friendship.initiator_id === user.id && friendship.status === 'pending') {
          status = 'outgoing';
        }
      }

      return {
        ...u,
        friendshipStatus: status,
      };
    });

    return NextResponse.json({ data: usersWithStatus });
  } catch (error: any) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search users' },
      { status: 500 }
    );
  }
}
