# Beany E2E Test Suite Structure

Complete overview of the comprehensive E2E test suite for the Beany coffee shop application.

## File Structure

```
coffee-shop-app/
├── e2e/                                    # E2E test directory
│   ├── auth.spec.ts                       # Authentication tests
│   ├── feed.spec.ts                       # Feed functionality tests
│   ├── search.spec.ts                     # Search feature tests
│   ├── logging.spec.ts                    # Coffee logging tests
│   ├── profile.spec.ts                    # Profile page tests
│   ├── navigation.spec.ts                 # Bottom navigation tests
│   ├── mobile.spec.ts                     # Mobile-specific tests
│   ├── responsive.spec.ts                 # Responsive design tests
│   │
│   ├── utils/                             # Test utilities
│   │   ├── helpers.ts                     # Reusable helper functions
│   │   └── test-data.ts                   # Test data generators
│   │
│   ├── setup.ts                           # Global test setup
│   ├── teardown.ts                        # Global test cleanup
│   └── README.md                          # Detailed documentation
│
├── playwright.config.ts                   # Playwright configuration
├── package.json                           # NPM scripts
├── E2E_TESTING_GUIDE.md                   # Quick start guide
└── E2E_SUITE_STRUCTURE.md                 # This file
```

## Test Files Overview

### 1. Authentication Tests (`auth.spec.ts`)

**Purpose**: Test user authentication flows

**Test Scenarios**:
- Sign up page display and validation
- Email format validation
- Password matching validation
- Password length validation
- Username validation and sanitization
- Sign in page display and validation
- Error handling for invalid credentials
- Loading states on forms
- Navigation between auth pages
- Password recovery flow
- Email confirmation flow

**Key Assertions**:
- Form elements are visible
- Validation errors display correctly
- Error messages show for invalid input
- Loading states appear during submission
- Navigation redirects work correctly

---

### 2. Feed Tests (`feed.spec.ts`)

**Purpose**: Test the main feed functionality

**Test Scenarios**:
- Feed page layout
- Friends and Explore tab switching
- Post display and rendering
- Like/unlike interactions
- Pull to refresh functionality
- Empty states (no posts)
- Loading states
- Refresh button functionality
- Feed scrolling behavior

**Key Assertions**:
- Tab navigation works
- Active tab is highlighted
- Posts render correctly
- Interactions update UI
- Refresh indicators appear
- Empty states show helpful messages

---

### 3. Search Tests (`search.spec.ts`)

**Purpose**: Test search across users, posts, and shops

**Test Scenarios**:
- Search page display
- Search input behavior
- Clear button functionality
- Tab switching (Friends/Explore/Shops)
- Search debouncing
- Loading states
- No results handling
- Result count display
- Keyboard navigation (Enter, Escape)

**Key Assertions**:
- Search input focuses on load
- Clear button appears with text
- Tabs maintain active state
- Debounced search executes
- Loading indicators show
- Results display correctly

---

### 4. Logging Tests (`logging.spec.ts`)

**Purpose**: Test coffee drink logging functionality

**Test Scenarios**:
- Quick log modal display
- Modal close interactions
- Shop search within modal
- Recent shops display
- Shop selection
- Drink log modal appearance
- Navigation to/from log page
- Empty state handling

**Key Assertions**:
- Modal renders with proper styling
- Search works within modal
- Recent shops appear or empty state shows
- Modal closes on backdrop/button click
- Navigation returns to previous page

---

### 5. Profile Tests (`profile.spec.ts`)

**Purpose**: Test user profile page

**Test Scenarios**:
- Profile page layout
- User avatar and info display
- Stats cards (Posts, Visits, Friends)
- Coffee preferences display
- Tab switching (Posts/Visits/Favorites)
- Empty states for each tab
- Edit button and navigation
- Pull to refresh

**Key Assertions**:
- Profile card displays correctly
- Stats show proper counts
- Tabs switch active state
- Grid displays content or empty state
- Edit button is accessible

---

### 6. Navigation Tests (`navigation.spec.ts`)

**Purpose**: Test bottom navigation bar

**Test Scenarios**:
- Bottom nav visibility on all pages
- All navigation items present
- Active tab highlighting
- Navigation between sections
- Special Log button styling
- Nav hide on input focus
- Nav show on input blur
- Proper z-index layering
- Navigation state preservation
- Accessibility features

**Key Assertions**:
- Bottom nav visible on authenticated pages
- Active tab highlighted
- Clicking nav items navigates correctly
- Nav hides when input focused
- Nav stays above content (z-index)
- Touch targets are large enough

---

### 7. Mobile Tests (`mobile.spec.ts`)

**Purpose**: Test mobile-specific functionality

**Test Scenarios**:
- Viewport rendering on iPhones
- Touch interactions (tap, long press)
- Pinch zoom prevention
- Touch target sizes
- Keyboard types for inputs
- Autocorrect handling
- Safe area insets
- Notch handling
- Orientation changes
- Pull to refresh
- Android back button
- VoiceOver accessibility
- Performance metrics

**Key Assertions**:
- Content fits viewport
- Touch targets ≥44x44 points
- Correct keyboard appears for inputs
- Safe areas respected
- Works in landscape
- Accessible labels present

---

### 8. Responsive Tests (`responsive.spec.ts`)

**Purpose**: Test responsive design across viewports

**Test Scenarios**:
- Render on all device sizes
- Typography scaling
- Padding adjustments
- Feed card width
- Profile layout
- Search tab layout
- Auth form centering
- Modal adjustments
- Breakpoint behavior
- Image scaling
- Orientation changes
- Edge cases (narrow/wide screens)

**Key Assertions**:
- No horizontal overflow
- Font sizes scale appropriately
- Layouts adapt to viewport
- Images scale correctly
- Content stays visible in all orientations

---

## Helper Utilities

### `utils/helpers.ts`

**Classes**:
- `AuthHelpers` - Authentication operations
- `NavigationHelpers` - Navigation operations
- `SearchHelpers` - Search operations
- `FeedHelpers` - Feed operations
- `ProfileHelpers` - Profile operations

**Functions**:
- `waitForStable()` - Wait for element to stop animating
- `captureFailure()` - Screenshot on test failure
- `isInViewport()` - Check element visibility

### `utils/test-data.ts`

**Functions**:
- `generateTestUser()` - Create unique test user
- `generateTestDrink()` - Create unique test drink

**Data**:
- `testUsers` - Valid/invalid test credentials
- `testShop` - Sample shop data
- `testDrink` - Sample drink data

## Test Configuration

### Projects

The suite runs on multiple configured projects:

1. **Desktop Browsers**
   - Chromium Desktop (1280x720)
   - Firefox Desktop (1280x720)
   - Safari/WebKit Desktop (1280x720)

2. **Mobile Devices**
   - iPhone 12 Pro (390x844)
   - Pixel 5 (393x851)

3. **Tablets**
   - iPad (810x1080)

### Features

- Auto server startup (`npm run dev`)
- Parallel test execution
- Screenshot on failure
- Video recording on failure
- Trace replay on retry
- HTML reports
- JSON reports
- Multiple reporters (HTML, list, JSON)

## Running Tests

### Command Reference

```bash
# All E2E tests
npm run test:e2e

# Specific suites
npm run test:e2e:auth
npm run test:e2e:feed
npm run test:e2e:search
npm run test:e2e:logging
npm run test:e2e:profile
npm run test:e2e:navigation
npm run test:e2e:mobile
npm run test:e2e:responsive

# With UI
npm run test:e2e:headed
npm run test:e2e:ui
npm run test:e2e:debug

# Specific browsers
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:mobile
```

## Test Metrics

| Metric | Count |
|--------|-------|
| Test Files | 8 |
| Helper Files | 2 |
| Total Lines | ~3,400 |
| Test Cases | 200+ |
| Viewports | 8 |
| Browsers | 3 |

## Coverage Areas

### Authentication
- ✅ Signup flow
- ✅ Login flow
- ✅ Password recovery
- ✅ Form validation
- ✅ Error handling

### Core Features
- ✅ Feed navigation
- ✅ Search functionality
- ✅ Coffee logging
- ✅ Profile management
- ✅ Bottom navigation

### Mobile
- ✅ Touch interactions
- ✅ Keyboard handling
- ✅ Viewport rendering
- ✅ Orientation support
- ✅ Accessibility

### Responsive
- ✅ Multiple breakpoints
- ✅ Layout adaptation
- ✅ Typography scaling
- ✅ Edge case handling

## Best Practices Implemented

1. **Independent Tests** - Each test can run alone
2. **Descriptive Names** - Clear test descriptions
3. **Proper Waits** - No arbitrary timeouts
4. **Reusable Helpers** - DRY principle
5. **User Flows** - Test what users do
6. **Multiple Viewports** - Responsive testing
7. **Accessibility** - ARIA labels and keyboard nav
8. **Error Handling** - Test failure states

## Documentation

- **Quick Start**: `E2E_TESTING_GUIDE.md`
- **Full Documentation**: `e2e/README.md`
- **This File**: `E2E_SUITE_STRUCTURE.md`

---

Created: 2025-02-17
Framework: Playwright 1.58+
Application: Beany Coffee Shop App
