// Database Types (Supabase)
export interface Profile {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  privacy_level: 'public' | 'friends_only' | 'private';
  created_at: string;
  updated_at: string;
}

export interface DrinkPreferences {
  id: string;
  user_id: string;
  temperature: 'hot' | 'iced' | 'both';
  sweetness: 'sweet' | 'unsweetened' | 'both';
  strength: 'strong' | 'light' | 'both';
  milk: 'black' | 'cream' | 'both';
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  shop_id: string;
  shop_name: string;
  drink_name: string;
  rating: number;
  photo_url: string | null;
  location_notes: string | null;
  shop_tags: string[];
  coffee_notes: string[];
  created_at: string;
  updated_at: string;
  // Joined fields
  profiles?: Profile;
  likes?: Like[];
  like_count?: number;
  user_has_liked?: boolean;
}

export interface Visit {
  id: string;
  user_id: string;
  place_id: string;
  place_name: string;
  address: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  place_id: string;
  place_name: string;
  address: string;
  created_at: string;
}

export interface Friendship {
  id: string;
  initiator_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
  // Joined fields
  initiator?: Profile;
  receiver?: Profile;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  email_confirmed_at?: string;
  user_metadata?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  display_name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Form Types
export interface DrinkLogFormData {
  photo_url?: string;
  drink_name: string;
  rating: number;
  location_notes?: string;
  shop_tags: string[];
  coffee_notes: string[];
}

export interface OnboardingFormData {
  // Step 2: Drink Preferences
  temperature: 'hot' | 'iced' | 'both';
  sweetness: 'sweet' | 'unsweetened' | 'both';
  strength: 'strong' | 'light' | 'both';
  milk: 'black' | 'cream' | 'both';
  // Step 3: Privacy
  privacy_level: 'public' | 'friends_only' | 'private';
  // Step 4: Profile
  display_name?: string;
  bio?: string;
}

export interface ProfileFormData {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  privacy_level: 'public' | 'friends_only' | 'private';
}

export interface SettingsFormData extends ProfileFormData {
  email?: string;
  current_password?: string;
  new_password?: string;
}

// UI Component Props
export interface FeedCardProps {
  post: Post;
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onUnlike?: (postId: string) => void;
}

export interface FriendCardProps {
  friendship: Friendship & {
    friend_profile: Profile;
  };
  currentUserId: string;
  onAccept?: (friendshipId: string) => void;
  onRemove?: (friendshipId: string) => void;
}

export interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface TagSelectorProps {
  tags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
}

export interface PhotoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  maxSize?: number; // in MB
}

export interface TabNavigationProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: string;
    count?: number;
  }>;
  activeTab: string;
  onChange: (tabId: string) => void;
}

// Shop Tags Options
export const SHOP_TAG_OPTIONS = [
  'study spot',
  'quiet',
  'fast wifi',
  'outlets available',
  'meeting space',
  'pet-friendly',
  'outdoor seating',
  'drive-thru',
  'cozy atmosphere',
  'good for groups',
] as const;

// Coffee Notes Options
export const COFFEE_NOTE_OPTIONS = [
  'bitter',
  'sweet',
  'earthy',
  'fruity',
  'nutty',
  'chocolatey',
  'strong',
  'light',
  'smooth',
  'acidic',
] as const;

export type ShopTag = typeof SHOP_TAG_OPTIONS[number];
export type CoffeeNote = typeof COFFEE_NOTE_OPTIONS[number];

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// Feed Types
export type FeedType = 'friends' | 'explore';

// Error Types
export interface AuthError {
  message: string;
  status?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Onboarding Step
export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

// User Status
export interface UserStatus {
  has_completed_onboarding: boolean;
  profile?: Profile;
  drink_preferences?: DrinkPreferences;
}
