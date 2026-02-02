-- Add coffee preferences to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS favorite_drinks TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_roast TEXT,
  ADD COLUMN IF NOT EXISTS brewing_method TEXT,
  ADD COLUMN IF NOT EXISTS coffee_strength TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.favorite_drinks IS 'Array of favorite coffee drinks (e.g., Espresso, Latte, Cold Brew)';
COMMENT ON COLUMN public.profiles.preferred_roast IS 'Preferred roast level (Light, Medium, Dark)';
COMMENT ON COLUMN public.profiles.brewing_method IS 'Preferred brewing method (Espresso, Pour Over, French Press, etc.)';
COMMENT ON COLUMN public.profiles.coffee_strength IS 'Preferred coffee strength (Mild, Medium, Strong)';
