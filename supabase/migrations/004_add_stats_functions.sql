-- CoffeeConnect Stats Functions
-- Migration 004: Add helper functions for user statistics dashboard

-- ============================================================================
-- STATS HELPER FUNCTIONS
-- Functions to calculate user statistics for the dashboard
-- ============================================================================

-- Function to get most visited shops
CREATE OR REPLACE FUNCTION public.get_most_visited_shops(user_uuid UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  shop_id TEXT,
  shop_name TEXT,
  visit_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.shop_id,
    p.shop_name,
    COUNT(*) as visit_count
  FROM public.posts p
  WHERE p.user_id = user_uuid
  GROUP BY p.shop_id, p.shop_name
  ORDER BY visit_count DESC, p.shop_name ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get favorite drinks with average rating
CREATE OR REPLACE FUNCTION public.get_favorite_drinks(user_uuid UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  drink_name TEXT,
  post_count BIGINT,
  avg_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.drink_name,
    COUNT(*) as post_count,
    ROUND(CAST(AVG(p.rating) AS NUMERIC), 2) as avg_rating
  FROM public.posts p
  WHERE p.user_id = user_uuid
  GROUP BY p.drink_name
  ORDER BY post_count DESC, avg_rating DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get posting frequency (posts per day for last 30 days)
CREATE OR REPLACE FUNCTION public.get_posting_frequency(user_uuid UUID, days_count INTEGER DEFAULT 30)
RETURNS TABLE (
  date TEXT,
  post_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(p.created_at, 'YYYY-MM-DD') as date,
    COUNT(*) as post_count
  FROM public.posts p
  WHERE p.user_id = user_uuid
    AND p.created_at >= NOW() - (days_count || ' days')::INTERVAL
  GROUP BY TO_CHAR(p.created_at, 'YYYY-MM-DD')
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's average rating
CREATE OR REPLACE FUNCTION public.get_average_rating(user_uuid UUID)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT ROUND(CAST(AVG(p.rating) AS NUMERIC), 2)
    FROM public.posts p
    WHERE p.user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get total counts for user
CREATE OR REPLACE FUNCTION public.get_user_counts(user_uuid UUID)
RETURNS TABLE (
  total_posts BIGINT,
  total_visits BIGINT,
  total_favorites BIGINT,
  avg_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.posts WHERE user_id = user_uuid) as total_posts,
    (SELECT COUNT(DISTINCT shop_id) FROM public.posts WHERE user_id = user_uuid) as total_visits,
    (SELECT COUNT(*) FROM public.favorites WHERE user_id = user_uuid) as total_favorites,
    public.get_average_rating(user_uuid) as avg_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get coffee preferences summary
CREATE OR REPLACE FUNCTION public.get_coffee_preferences_summary(user_uuid UUID)
RETURNS TABLE (
  temperature TEXT,
  sweetness TEXT,
  strength TEXT,
  milk TEXT,
  favorite_drinks TEXT[],
  preferred_roast TEXT,
  brewing_method TEXT,
  coffee_strength TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dp.temperature,
    dp.sweetness,
    dp.strength,
    dp.milk,
    COALESCE(p.favorite_drinks, ARRAY[]::TEXT[]) as favorite_drinks,
    p.preferred_roast,
    p.brewing_method,
    p.coffee_strength
  FROM public.profiles p
  LEFT JOIN public.drink_preferences dp ON dp.user_id = p.id
  WHERE p.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on all functions
GRANT EXECUTE ON FUNCTION public.get_most_visited_shops TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_favorite_drinks TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_posting_frequency TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_average_rating TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_counts TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_coffee_preferences_summary TO authenticated;
