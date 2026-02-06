import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/supabase';
import { createSupabaseClient } from '../_utils';

// DELETE /api/friends/remove - Remove a friend
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const friendshipId = searchParams.get('friendshipId');

    if (!friendshipId) {
      return NextResponse.json(
        { error: 'Friendship ID is required' },
        { status: 400 }
      );
    }

    // Remove friend
    await db.removeFriend(friendshipId, user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing friend:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove friend' },
      { status: 500 }
    );
  }
}
