-- CoffeeConnect Comments Table
-- Migration 003: Add comments functionality for social interaction on posts

-- ============================================================================
-- COMMENTS TABLE
-- Users can comment on posts and reply to other comments
-- ============================================================================

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

-- Composite index for fetching comments on a post
CREATE INDEX idx_comments_post_created ON public.comments(post_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Comments are visible based on post privacy
CREATE POLICY "Comments on public posts are visible to everyone"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = comments.post_id
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = posts.user_id
        AND profiles.privacy_level = 'public'
      )
    )
  );

CREATE POLICY "Comments on friends-only posts visible to friends"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = comments.post_id
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = p.user_id
        AND profiles.privacy_level = 'friends_only'
        AND (
          -- User is the post author
          p.user_id = auth.uid()
          OR EXISTS (
            -- User is friends with the post author
            SELECT 1 FROM public.friendships
            WHERE status = 'accepted'
            AND (
              (initiator_id = auth.uid() AND receiver_id = p.user_id)
              OR (initiator_id = p.user_id AND receiver_id = auth.uid())
            )
          )
        )
      )
    )
  );

CREATE POLICY "Comments on private posts visible only to author"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = comments.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- Users can insert their own comments
CREATE POLICY "Users can insert own comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for updated_at timestamp
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to count comments on a post
CREATE OR REPLACE FUNCTION public.get_comment_count(post_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.comments
    WHERE post_id = post_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_comment_count TO authenticated;
