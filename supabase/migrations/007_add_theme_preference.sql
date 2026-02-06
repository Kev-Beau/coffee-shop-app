-- Add theme preference to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'coffee'
CHECK (theme_preference IN ('coffee', 'matcha', 'chai', 'black-tea', 'herbal'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_theme_preference ON public.profiles(theme_preference);
