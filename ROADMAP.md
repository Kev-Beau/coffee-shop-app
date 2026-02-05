# CoffeeConnect - Feature Roadmap

This document tracks all planned features and improvements for the CoffeeConnect app.

## Completed Features ✅

### Core Navigation & UX
- [x] Mobile bottom navigation bar (Feed, Search, +, Friends, Profile)
- [x] Quick Log modal with recent shops
- [x] Pull-to-refresh on Feed and Profile pages
- [x] Search functionality (Users/Friends, Posts, Shops)
- [x] Friend search on Friends page
- [x] Reorganized navigation (Search button in bottom nav)

---

## Pending Features 📋

### Social Features

#### 1. Comments on Posts
- Add comment section to posts
- Comment input with validation
- Display comments with user info and timestamps
- Notification when someone comments on your post
- API endpoints for creating/fetching comments
- **Database:** Add `comments` table with foreign keys to posts and users

#### 2. Push Notifications
- In-app notifications for:
  - Friend requests
  - Likes on your posts
  - Comments on your posts
  - Friend request accepted
- Notification settings page
- Notification badge on navigation icon
- Mark notifications as read
- **Technology:** Web Push API, Supabase real-time subscriptions

#### 3. Coffee Stats Dashboard
- Personal stats page showing:
  - Most visited coffee shops
  - Favorite drinks (from logged posts)
  - Posting frequency over time
  - Total posts, visits, favorites
  - Coffee consumption trends
- Charts and visualizations
- Link from profile page

---

### Discovery Features

#### 4. Map View for Shops
- Integrate interactive map (Google Maps or similar)
- Show coffee shops as pins on the map
- Filter by rating, price level, distance
- Cluster pins for zoomed-out view
- "Near me" button for current location
- **API:** Google Maps JavaScript API or Mapbox

#### 5. Shop Recommendations
- Algorithm based on user's coffee preferences:
  - Preferred roast level
  - Brewing method
  - Coffee strength
  - Favorite drinks
- Show "Recommended for You" section
- Learn from user's rating patterns
- Display on feed or shops page

#### 6. Trending Shops
- Algorithm to calculate trending shops:
  - Recent visit frequency
  - Recent post count
  - Engagement (likes, comments)
- Time-decayed scoring (recent activity weighted higher)
- "Trending Near You" section
- Display on feed or shops page

---

### Profile & Gamification

#### 7. Dark Mode Toggle
- Toggle switch in Settings or Navigation
- Define dark theme color palette
- Persist user preference in database
- Smooth transition between themes
- System preference detection (optional)

#### 8. Achievements/Badges System
- **Badges to implement:**
  - "First Post" - Created your first post
  - "Caffeinated" - Posted 10 times
  - "Coffee Connoisseur" - Posted 50 times
  - "Explorer" - Visited 10 different shops
  - "Coffee Aficionado" - Visited 25 different shops
  - "Social Butterfly" - Made 10 friends
  - "Reviewer" - Rated 20 drinks
  - "Early Adopter" - Joined in first month
  - Seasonal badges (spring, summer, fall, winter)
- Badge display on profile
- Notification when earned
- **Database:** Add `badges` and `user_badges` tables

#### 9. Coffee Passport
- Visual stamp collection of shops visited
- Show on profile page as grid or booklet view
- Each stamp shows:
  - Shop name/logo
  - Date of first visit
  - Number of visits
- Interactive - tap stamps to see visit history
- Shareable passport image
- **Database:** Use existing `visits` table, add UI for passport display

---

## Design Improvements 🎨

### Immediate Visual Upgrades

#### 10. Replace Emojis with Icons
- Install `lucide-react` (professional SVG icons)
- Replace all emoji icons:
  - Navigation icons
  - Button icons
  - Status icons
  - Feature icons
- Icons scale perfectly and look crisp at all sizes

#### 11. Implement Design System
- **Color Palette:**
  - Define primary colors (amber/brown for coffee theme)
  - Secondary colors
  - Success/error/warning states
  - Background colors
- **Typography:**
  - Font families
  - Size scale (h1, h2, h3, body, small, caption)
  - Font weights
- **Spacing:**
  - Consistent spacing scale (4px, 8px, 16px, 24px, 32px, etc.)
- **Border Radius:**
  - Small (4px), Medium (8px), Large (12px), XL (16px)
- **Shadows:**
  - Elevation levels for depth
- **Documentation:** Create `DESIGN_SYSTEM.md` with all tokens

#### 12. shadcn/ui Components
- Install and configure shadcn/ui
- Replace basic HTML elements:
  - Button (already using custom, can migrate)
  - Card
  - Dialog/Modal
  - Form inputs
  - Dropdown menus
  - Tabs
  - Toasts/Notifications
  - Tooltips
- Fully customizable with Tailwind

#### 13. Smooth Animations
- Install Framer Motion
- Add animations to:
  - Page transitions
  - Modal open/close
  - List item appearance
  - Button hover/press states
  - Pull-to-refresh indicator
  - Bottom tab switching
  - Achievement unlock animations

#### 14. Better Form Handling
- Install React Hook Form
- Install Zod for validation
- Update all forms:
  - Settings page
  - Drink log modal
  - Search forms
  - Comment input
- Real-time validation
- Better error messages
- Loading states during submission

---

## Technical Debt & Improvements 🔧

### Performance
- [ ] Add image optimization
- [ ] Implement code splitting
- [ ] Add loading skeletons
- [ ] Optimize bundle size

### Testing
- [ ] Add unit tests for API routes
- [ ] Add component tests
- [ ] E2E testing for critical flows
- [ ] Accessibility audit

### Documentation
- [ ] API documentation
- [ ] Component documentation
- [ ] Setup guide for new developers

---

## Feature Priority Matrix

### High Priority (User Impact)
1. Comments on Posts - Core social feature
2. Coffee Stats Dashboard - User engagement
3. Map View for Shops - Discovery
4. Push Notifications - User retention

### Medium Priority (Enhancement)
5. Shop Recommendations - Personalization
6. Trending Shops - Discovery
7. Replace Emojis with Icons - Visual polish
8. Achievements/Badges - Gamification
9. Dark Mode - User preference

### Lower Priority (Nice-to-have)
10. Coffee Passport - Gamification
11. Design System - Maintainability
12. shadcn/ui Components - Consistency
13. Animations - UX polish
14. Better Forms - UX improvement

---

## Notes

### Current Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **Maps:** Google Places API
- **Icons:** Heroicons (being replaced with lucide-react)

### Database Tables
- `profiles` - User profiles and preferences
- `posts` - Drink posts with photos and ratings
- `visits` - Shop visit history
- `favorites` - Favorited shops
- `friendships` - Friend connections
- `likes` - Post likes
- `reviews` - Shop reviews (Google Places)

### To Add
- `comments` - Post comments
- `notifications` - User notifications
- `badges` - Achievement badges
- `user_badges` - User's earned badges

---

**Last Updated:** February 5, 2026
