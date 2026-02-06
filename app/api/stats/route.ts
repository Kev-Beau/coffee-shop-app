import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// GET /api/stats - Fetch user statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user counts
    const { data: counts } = await supabase.rpc('get_user_counts', {
      user_uuid: user.id,
    });

    // Get most visited shops
    const { data: shops } = await supabase.rpc('get_most_visited_shops', {
      user_uuid: user.id,
      limit_count: 5,
    });

    // Get favorite drinks
    const { data: drinks } = await supabase.rpc('get_favorite_drinks', {
      user_uuid: user.id,
      limit_count: 5,
    });

    // Get posting frequency (last 30 days)
    const { data: frequency } = await supabase.rpc('get_posting_frequency', {
      user_uuid: user.id,
      days_count: 30,
    });

    // Get coffee preferences
    const { data: preferences } = await supabase.rpc('get_coffee_preferences_summary', {
      user_uuid: user.id,
    });

    const stats = {
      total_posts: counts?.[0]?.total_posts || 0,
      total_visits: counts?.[0]?.total_visits || 0,
      total_favorites: counts?.[0]?.total_favorites || 0,
      avg_rating: counts?.[0]?.avg_rating || 0,
      most_visited_shops: shops || [],
      favorite_drinks: drinks || [],
      posting_frequency: frequency || [],
      coffee_preferences: preferences?.[0] || {
        temperature: 'both',
        sweetness: 'both',
        strength: 'both',
        milk: 'both',
        favorite_drinks: [],
        preferred_roast: null,
        brewing_method: null,
        coffee_strength: null,
      },
    };

    return NextResponse.json({ data: stats });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
