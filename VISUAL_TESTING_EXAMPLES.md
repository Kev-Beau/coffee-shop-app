# Visual Regression Testing - Real-World Examples

## Example 1: Catching the Bottom Navigation Bug

### The Problem
You've noticed that the bottom navigation bar overlaps content on mobile devices when the keyboard is open, but it's hard to reproduce consistently.

### Step 1: Run Visual Tests

```bash
npm run test:visual:mobile
```

### Step 2: Review Failed Tests

Output shows:
```
✗ Bottom Navigation Visual Tests (4/4)
  ✗ bottom navigation on /feed - mobile
  ✗ bottom navigation on /search - mobile
  ✗ bottom navigation on /friends - mobile
  ✗ bottom navigation on /profile - mobile
```

### Step 3: Open HTML Report

```bash
npm run test:visual:report
```

The report shows:
- **Baseline screenshot:** Bottom nav properly positioned
- **Current screenshot:** Bottom nav overlapping search input
- **Diff image:** Red highlights showing the overlap area

### Step 4: Investigate the Issue

Looking at the diffs, you notice:
- The bottom nav is visible when it should be hidden
- It overlaps the search input field
- This happens when an input is focused

### Step 5: Fix the Issue

Update `/app/components/BottomNavigation.tsx`:

```typescript
useEffect(() => {
  const handleFocusIn = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      setIsVisible(false); // Hide nav when input focused
    }
  };

  const handleFocusOut = () => {
    setTimeout(() => setIsVisible(true), 100);
  };

  document.addEventListener('focusin', handleFocusIn, true);
  document.addEventListener('focusout', handleFocusOut, true);

  return () => {
    document.removeEventListener('focusin', handleFocusIn, true);
    document.removeEventListener('focusout', handleFocusOut, true);
  };
}, []);
```

### Step 6: Verify the Fix

```bash
# Run tests again
npm run test:visual:mobile

# All bottom nav tests should now pass!
✓ Bottom Navigation Visual Tests (4/4)
```

### Step 7: Update Baselines (if needed)

If the fix changed the appearance intentionally:

```bash
npm run test:visual:update
```

**Result:** Visual regression testing caught a bug that was hard to reproduce manually!

---

## Example 2: Redesigning the Landing Page

### The Scenario
You're redesigning the landing page with a new hero section and updated styling.

### Step 1: Make Your Changes

Update `/app/page.tsx` with new design:
- New hero layout
- Updated color scheme
- New button styles
- Different spacing

### Step 2: Run Visual Tests

```bash
npm run test:visual
```

### Expected: Tests Fail

```
✗ Landing Page Visual Tests (3/3)
  ✗ should match baseline on desktop
  ✗ should match baseline on mobile
  ✗ should match hero section on desktop
```

This is **expected** - you made intentional changes!

### Step 3: Review the HTML Report

```bash
npm run test:visual:report
```

Check each diff:
- ✅ Hero section changes look good
- ✅ New colors are correct
- ✅ Layout improvements are as intended
- ⚠️  Wait - there's an unexpected alignment issue on mobile!

### Step 4: Fix the Unexpected Issue

The diff shows the CTA button is misaligned on mobile. Fix it:

```css
/* Update the button alignment */
.cta-button {
  margin-top: 1rem;
  text-align: center;
}
```

### Step 5: Re-run Tests

```bash
npm run test:visual
```

Now all diffs show only your intentional changes.

### Step 6: Update Baselines

```bash
npm run test:visual:update
```

### Step 7: Commit Everything

```bash
git add .
git commit -m "redesign: update landing page with new hero section

- Redesigned hero section with new layout
- Updated color scheme to match brand
- Fixed mobile button alignment
- Updated visual test baselines"
```

**Result:** Visual regression testing helped you catch an unintended issue during a redesign!

---

## Example 3: Responsive Design Breakage

### The Problem
Your layout works on mobile (375px) and desktop (1280px), but breaks on tablet (810px).

### Step 1: Run All Viewport Tests

```bash
npm run test:visual
```

### Step 2: Identify the Failure

```
✓ Landing Page Visual Tests (3/3) - chromium-mobile
✓ Landing Page Visual Tests (3/3) - chromium-desktop
✗ Landing Page Visual Tests (2/3) - chromium-tablet
  ✗ should match baseline on desktop
  ✓ should match baseline on mobile
  ✓ should match hero section on desktop
```

Only the tablet test fails!

### Step 3: Review the Diff

Open HTML report and check the tablet failure:
- The feature grid has 2 columns instead of 3
- Cards are too wide
- Text wraps awkwardly

### Step 4: Fix the Responsive CSS

```css
/* Add tablet-specific breakpoint */
@media (min-width: 768px) and (max-width: 1024px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .feature-card {
    max-width: 100%;
  }
}
```

### Step 5: Verify the Fix

```bash
npm run test:visual
```

Now all viewport tests pass:
```
✓ Landing Page Visual Tests (3/3) - chromium-mobile
✓ Landing Page Visual Tests (3/3) - chromium-desktop
✓ Landing Page Visual Tests (3/3) - chromium-tablet
```

### Step 6: Update Tablet Baselines

```bash
npm run test:visual:update
```

**Result:** Visual regression testing caught a responsive design issue that you would have missed!

---

## Example 4: Cross-Browser Inconsistency

### The Problem
Your app looks perfect in Chrome, but breaks in Safari and Firefox.

### Step 1: Run All Browser Tests

```bash
npm run test:visual
```

### Step 2: Check Browser-Specific Failures

```
✓ Landing Page - chromium-desktop (3/3)
✗ Landing Page - firefox-desktop (2/3)
  ✗ should match baseline on desktop
  ✓ should match baseline on mobile
  ✗ should match hero section on desktop

✗ Landing Page - webkit-desktop (1/3)
  ✗ should match baseline on desktop
  ✗ should match baseline on mobile
  ✓ should match hero section on desktop
```

### Step 3: Investigate Browser Differences

Open HTML report and compare browsers:
- **Firefox:** Flexbox layout wraps differently
- **Safari:** Custom font not loading, falls back to system font
- **Chrome:** Everything looks correct

### Step 4: Fix Cross-Browser Issues

**Fix 1: Firefox flexbox issue**
```css
.feature-container {
  display: flex;
  flex-wrap: wrap; /* Added for Firefox */
  justify-content: center;
}
```

**Fix 2: Safari font loading**
```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* Added for Safari */
}
```

### Step 5: Re-run Tests

```bash
npm run test:visual
```

All browser tests now pass:
```
✓ Landing Page - chromium-desktop (3/3)
✓ Landing Page - firefox-desktop (3/3)
✓ Landing Page - webkit-desktop (3/3)
```

### Step 6: Update Baselines

```bash
npm run test:visual:update
```

**Result:** Visual regression testing ensures cross-browser consistency!

---

## Example 5: Detecting Unintended Side Effects

### The Scenario
You're making a small change to fix a button color, but accidentally break something else.

### Step 1: Make Your Change

Update button color in `globals.css`:
```css
.btn-primary {
  background-color: #8B4513; /* Changed from #D2691E */
}
```

### Step 2: Run Tests

```bash
npm run test:visual
```

### Step 3: Unexpected Failures!

```
✓ Authentication Pages Visual Tests (4/4)
✗ Landing Page Visual Tests (1/3)
  ✗ should match baseline on desktop
  ✓ should match baseline on mobile
  ✓ should match hero section on desktop

✓ Feed Page Visual Tests (2/2)
✗ Shops Page Visual Tests (1/2)
  ✗ shops listing should match baseline on mobile
  ✓ shops listing should match baseline on desktop
```

Wait, why did the landing page and shops page fail? You only changed the button color!

### Step 4: Review the Diffs

Open HTML report:
- **Landing page:** The CTA button color change is correct ✅
- **Shops page:** There's also a button here that changed ✅
- **Unexpected:** The hero section has a different background color!

### Step 5: Find the Mistake

Looking at your CSS change, you realize:
```css
/* Oops! You used a class selector that was too broad */
.btn-primary, .hero-section {  /* Accidentally added hero-section! */
  background-color: #8B4513;
}
```

### Step 6: Fix the Mistake

```css
.btn-primary {
  background-color: #8B4513;
}

/* Remove the accidental hero-section change */
```

### Step 7: Verify and Update

```bash
npm run test:visual
```

Now only the intended tests fail (button color changes):
```
✗ Landing Page Visual Tests (1/3)
✗ Shops Page Visual Tests (1/2)
✗ Authentication Pages Visual Tests (4/4)
```

Update baselines:
```bash
npm run test:visual:update
```

**Result:** Visual regression testing caught unintended side effects of your change!

---

## Summary: Why Visual Regression Testing Matters

These examples show how visual regression testing helps you:

1. **Catch hard-to-reproduce bugs** (keyboard + bottom nav)
2. **Find unintended side effects** (CSS selector too broad)
3. **Ensure cross-browser consistency** (Firefox, Safari, Chrome)
4. **Test responsive design** (mobile, tablet, desktop)
5. **Validate redesigns** (catch misalignments during redesign)
6. **Prevent regressions** (catch issues before deployment)

### Key Takeaway

Visual regression testing is your **safety net** for UI changes. It catches issues that:
- Unit tests miss (visual/layout problems)
- Manual testing misses (inconsistent across devices/browsers)
- Code review misses (unintended side effects)

**Run visual tests before every deployment to catch these issues early!**
