-- CoffeeConnect Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- Extends Supabase Auth with additional user information
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  privacy_level TEXT CHECK (privacy_level IN ('public', 'friends_only', 'private')) DEFAULT 'public',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on username for fast lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- ============================================================================
-- DRINK PREFERENCES TABLE
-- Stores user's coffee preferences
-- ============================================================================
CREATE TABLE public.drink_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  temperature TEXT CHECK (temperature IN ('hot', 'iced', 'both')) DEFAULT 'both',
  sweetness TEXT CHECK (sweetness IN ('sweet', 'unsweetened', 'both')) DEFAULT 'both',
  strength TEXT CHECK (strength IN ('strong', 'light', 'both')) DEFAULT 'both',
  milk TEXT CHECK (milk IN ('black', 'cream', 'both')) DEFAULT 'both',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- POSTS TABLE
-- Drink logs that users share
-- ============================================================================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_id TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  drink_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  photo_url TEXT,
  location_notes TEXT,
  shop_tags TEXT[] DEFAULT '{}', -- ["study spot", "quiet", "fast wifi"]
  coffee_notes TEXT[] DEFAULT '{}', -- ["bitter", "earthy", "strong"]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_shop_id ON public.posts(shop_id);

-- ============================================================================
-- VISITS TABLE
-- Tracks shops users have visited
-- ============================================================================
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  place_name TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_visits_user_id ON public.visits(user_id);
CREATE INDEX idx_visits_created_at ON public.visits(created_at DESC);

-- ============================================================================
-- FAVORITES TABLE
-- Shops users have favorited
-- ============================================================================
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  place_name TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- Index for performance
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);

-- ============================================================================
-- FRIENDSHIPS TABLE
-- Manages friend connections between users
-- ============================================================================
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(initiator_id, receiver_id),
  CHECK (initiator_id != receiver_id)
);

-- Indexes for performance
CREATE INDEX idx_friendships_initiator ON public.friendships(initiator_id);
CREATE INDEX idx_friendships_receiver ON public.friendships(receiver_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);

-- ============================================================================
-- LIKES TABLE
-- Users can like posts
-- ============================================================================
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Indexes for performance
CREATE INDEX idx_likes_post_id ON public.likes(post_id);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable security on all tables
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drink_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES RLS POLICIES
-- ============================================================================

-- Anyone can read public profiles
CREATE POLICY "Public profiles are visible to everyone"
  ON public.profiles FOR SELECT
  USING (privacy_level = 'public');

-- Authenticated users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (triggered by signup)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- DRINK PREFERENCES RLS POLICIES
-- ============================================================================

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON public.drink_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON public.drink_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON public.drink_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- POSTS RLS POLICIES
-- ============================================================================

-- Public posts are visible to everyone
CREATE POLICY "Public posts are visible to everyone"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = posts.user_id
      AND profiles.privacy_level = 'public'
    )
  );

-- Friends-only posts are visible to friends
CREATE POLICY "Friends-only posts visible to friends"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = posts.user_id
      AND profiles.privacy_level = 'friends_only'
      AND (
        -- User is the post author
        posts.user_id = auth.uid()
        OR EXISTS (
          -- User is friends with the post author
          SELECT 1 FROM public.friendships
          WHERE status = 'accepted'
          AND (
            (initiator_id = auth.uid() AND receiver_id = posts.user_id)
            OR (initiator_id = posts.user_id AND receiver_id = auth.uid())
          )
        )
      )
    )
  );

-- Private posts are only visible to the author
CREATE POLICY "Private posts visible only to author"
  ON public.posts FOR SELECT
  USING (
    posts.user_id = auth.uid()
  );

-- Users can insert their own posts
CREATE POLICY "Users can insert own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- VISITS RLS POLICIES
-- ============================================================================

-- Users can view their own visits
CREATE POLICY "Users can view own visits"
  ON public.visits FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own visits
CREATE POLICY "Users can insert own visits"
  ON public.visits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own visits
CREATE POLICY "Users can delete own visits"
  ON public.visits FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FAVORITES RLS POLICIES
-- ============================================================================

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FRIENDSHIPS RLS POLICIES
-- ============================================================================

-- Users can view friendships involving themselves
CREATE POLICY "Users can view own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = initiator_id OR auth.uid() = receiver_id);

-- Users can initiate friendships
CREATE POLICY "Users can create friendships"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = initiator_id);

-- Users can accept friendships where they are the receiver
CREATE POLICY "Users can accept friendships"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Users can delete friendships involving themselves
CREATE POLICY "Users can delete friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = initiator_id OR auth.uid() = receiver_id);

-- ============================================================================
-- LIKES RLS POLICIES
-- ============================================================================

-- Everyone can view likes
CREATE POLICY "Likes are public"
  ON public.likes FOR SELECT
  USING (true);

-- Users can insert their own likes
CREATE POLICY "Users can insert own likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- STORAGE (for future use with Supabase Storage instead of Cloudinary)
-- ============================================================================

-- Uncomment if using Supabase Storage instead of Cloudinary

-- CREATE TABLE public.storage_buckets (
--   id TEXT PRIMARY KEY,
--   name TEXT UNIQUE NOT NULL,
--   public BOOLEAN DEFAULT false,
--   file_size_limit BIGINT,
--   allowed_mime_types TEXT[]
-- );

-- CREATE TABLE public.storage_objects (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   bucket_id TEXT REFERENCES public.storage_buckets(id) ON DELETE CASCADE,
--   name TEXT NOT NULL,
--   owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   last_accessed_at TIMESTAMP WITH TIME ZONE,
--   metadata JSONB,
--   UNIQUE(bucket_id, name)
-- );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get friends list
CREATE OR REPLACE FUNCTION public.get_friends(user_uuid UUID)
RETURNS TABLE (
  friend_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN f.initiator_id = user_uuid THEN f.receiver_id
      ELSE f.initiator_id
    END as friend_id,
    CASE
      WHEN f.initiator_id = user_uuid THEN r.username
      ELSE i.username
    END as username,
    CASE
      WHEN f.initiator_id = user_uuid THEN r.display_name
      ELSE i.display_name
    END as display_name,
    CASE
      WHEN f.initiator_id = user_uuid THEN r.avatar_url
      ELSE i.avatar_url
    END as avatar_url
  FROM public.friendships f
  LEFT JOIN public.profiles i ON f.initiator_id = i.id
  LEFT JOIN public.profiles r ON f.receiver_id = r.id
  WHERE f.status = 'accepted'
  AND (f.initiator_id = user_uuid OR f.receiver_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if two users are friends
CREATE OR REPLACE FUNCTION public.are_friends(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
    AND (
      (initiator_id = user_a AND receiver_id = user_b)
      OR (initiator_id = user_b AND receiver_id = user_a)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_friends TO authenticated;
GRANT EXECUTE ON FUNCTION public.are_friends TO authenticated;
