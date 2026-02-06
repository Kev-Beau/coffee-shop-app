-- Fix friendships RLS policies to work with access token authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can accept friendships" ON public.friendships;

-- Create new policy for INSERT that allows any authenticated user to create friendships
-- (server-side validation in API route handles the actual authorization logic)
CREATE POLICY "Users can create friendships"
  ON public.friendships FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create new policy for UPDATE that allows any authenticated user to update friendships
-- (server-side validation in API route handles the actual authorization logic)
CREATE POLICY "Users can accept friendships"
  ON public.friendships FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
