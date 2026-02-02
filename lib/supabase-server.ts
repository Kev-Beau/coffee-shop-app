import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireAuth() {
  const user = await getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function getCurrentUserProfile() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return getProfile(user.id);
}

export async function hasCompletedOnboarding(userId: string) {
  const profile = await getProfile(userId);

  if (!profile) {
    return false;
  }

  // Check if user has drink preferences (part of onboarding)
  const supabase = await createClient();
  const { data: preferences } = await supabase
    .from('drink_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return !!preferences;
}
