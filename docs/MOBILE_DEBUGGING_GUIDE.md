# Mobile Debugging Guide for Bottom Navigation Issue

This guide provides step-by-step instructions for connecting your iPhone or Android device to your Mac and debugging the bottom navigation issue in CoffeeConnect.

## Table of Contents

1. [Safari Web Inspector (iOS)](#safari-web-inspector-ios)
2. [Chrome DevTools Remote Debugging (Android)](#chrome-devtools-remote-debugging-android)
3. [React DevTools Setup](#react-devtools-setup)
4. [Debugging Checklist](#debugging-checklist)
5. [Common Issues & Solutions](#common-issues--solutions)

---

## Safari Web Inspector (iOS)

### Prerequisites

- Mac with macOS 12 Monterey or later
- iPhone with iOS 15 or later
- USB lightning cable
- Safari browser on both devices
- Your development server running (`npm run dev`)

### Step 1: Enable Web Inspector on iPhone

1. **Unlock your iPhone** and open **Settings**
2. Navigate to: **Settings** → **Safari** → **Advanced**
3. Toggle **Web Inspector** to **ON** (green)

### Step 2: Connect iPhone to Mac

1. **Connect iPhone to Mac** using USB cable
2. **Trust the computer** if prompted:
   - iPhone will show: "Trust This Computer?"
   - Tap **Trust**
   - Enter your iPhone passcode if required

### Step 3: Enable Developer Menu on Mac Safari

1. Open **Safari** on your Mac
2. In the menu bar, click **Safari** → **Settings** (or Preferences)
3. Click the **Advanced** tab
4. Check the box: **"Show Develop menu in menu bar"**
5. Close Safari settings

### Step 4: Open Your App on iPhone

1. Make sure your dev server is running:
   ```bash
   cd ~/coffee-shop-app
   npm run dev
   ```

2. Find your Mac's local IP address:
   ```bash
   # On Mac
   ipconfig getifaddr en0
   # or
   ipconfig getifaddr en1
   ```
   This will show something like: `192.168.1.100`

3. On your iPhone, open **Safari**
4. Type in the address bar: `http://192.168.1.100:3000` (use your actual IP)
5. **Important:** You'll see a "Not Secure" warning - this is normal for local development
6. Tap **Advanced** → **Visit Website** or similar

### Step 5: Open Web Inspector on Mac

1. On Mac Safari, click **Develop** in the menu bar
2. Look for your iPhone's name in the dropdown
3. Hover over your iPhone name → you'll see a list of open websites
4. Click on **localhost:3000** or **192.168.1.100:3000**
5. Web Inspector will open in a new window

### Step 6: Debug the Bottom Navigation

#### Check Console Logs
```javascript
// In Web Inspector Console tab, run:
console.log('Bottom nav element:', document.querySelector('nav.fixed.bottom-0'));
console.log('Bottom nav visible:', getComputedStyle(document.querySelector('nav.fixed.bottom-0')).display);
```

#### Inspect Element Styles
1. Click the **Elements** tab (Inspector)
2. Click the **Select Element** tool (crosshair icon)
3. Tap on the bottom navigation on your iPhone
4. The element will be highlighted in the Inspector
5. Check the **Styles** panel for:
   - `position: fixed`
   - `bottom: 0`
   - `z-index: 9999`
   - `display` value (should not be `none`)

#### Monitor Focus Events
1. Go to **Console** tab
2. Paste this code to log focus events:
   ```javascript
   document.addEventListener('focusin', (e) => {
     console.log('Focusin:', e.target.tagName, e.target.className);
   });
   document.addEventListener('focusout', (e) => {
     console.log('Focusout:', e.target.tagName, e.target.className);
   });
   ```

#### Test Keyboard Behavior
1. On your iPhone, tap any input field (search, comment, etc.)
2. Watch the Console for focus events
3. Observe if the bottom nav disappears
4. Tap outside the input to dismiss keyboard
5. Check if nav reappears

#### Check Computed Properties
1. Select the bottom nav element in Elements tab
2. Go to **Computed** panel on the right
3. Look for:
   - `display` - should be `block` (not `none`)
   - `visibility` - should be `visible`
   - `opacity` - should be `1`
   - `transform` - should be `none` or check for unexpected transforms

#### Test Live Editing
1. In Elements tab, find the `<nav>` element
2. Double-click any attribute to edit it live
3. Try changing the z-index to see if it fixes stacking issues:
   ```
   z-index: 99999
   ```
4. Check if changes appear immediately on your iPhone

---

## Chrome DevTools Remote Debugging (Android)

### Prerequisites

- Mac with Chrome browser
- Android phone with Chrome browser
- USB cable
- Android SDK (optional - for adb)
- Your development server running (`npm run dev`)

### Step 1: Enable USB Debugging on Android

1. Open **Settings** on your Android device
2. Go to **About Phone**
3. Tap **Build Number** 7 times to enable Developer Options
4. Go back to **Settings** → **System** → **Developer Options**
5. Toggle **USB Debugging** to **ON**
6. If prompted, allow USB debugging from this computer

### Step 2: Install ADB (if not installed)

```bash
# Check if adb is installed
adb version

# If not installed, install via Homebrew
brew install android-platform-tools

# Verify installation
adb version
```

### Step 3: Connect Android to Mac

1. **Connect Android to Mac** via USB
2. **Allow USB debugging** on Android when prompted
3. Verify connection:
   ```bash
   adb devices
   ```
   You should see your device listed

### Step 4: Set Up Port Forwarding

```bash
# Forward local port 3000 to device
adb forward tcp:3000 tcp:3000
```

### Step 5: Enable USB Debugging in Chrome

1. Open **Chrome** on your Android device
2. Type in address bar: `chrome://inspect`
3. Tap **Enable USB debugging** if not already enabled

### Step 6: Open DevTools on Mac

1. Open **Chrome** on your Mac
2. Type in address bar: `chrome://inspect`
3. You should see your Android device listed under "Remote Target"
4. Find your app (localhost:3000) and click **inspect**
5. DevTools will open

### Step 7: Debug Bottom Navigation

The debugging steps are similar to Safari:

#### Check Console
```javascript
// Run in Console tab
console.log('Bottom nav:', document.querySelector('nav.fixed.bottom-0'));
console.log('Display:', getComputedStyle(document.querySelector('nav.fixed.bottom-0')).display);
```

#### Monitor Elements
1. Use **Elements** tab to inspect the nav
2. Check **Styles** panel for proper CSS
3. Use **Computed** tab to see final computed values

#### Test Interactions
1. Tap inputs on your Android device
2. Watch the Console for events
3. Verify nav behavior matches expectations

---

## React DevTools Setup

### Can we use React DevTools with mobile Safari?

**Yes!** React DevTools works with mobile browsers when debugging remotely.

### Setup for iOS Safari

1. **Install React DevTools browser extension**:
   - On Mac Safari, install from App Store or Chrome Web Store
   - Or use the standalone app:
     ```bash
     npm install -g react-devtools
     ```

2. **Using standalone React DevTools** (recommended):
   ```bash
   # Install globally
   npm install -g react-devtools

   # Run DevTools (do this before opening your app)
   react-devtools
   ```

3. **Connect your app**:
   - React DevTools will automatically connect to your React app
   - Open Web Inspector as described above
   - You'll see a React tab in the Inspector

### Using React DevTools

1. With Web Inspector/DevTools open:
   - Click the **React** tab (if using browser extension)
   - Or use the standalone DevTools window

2. **Inspect the BottomNavigation component**:
   - Find `<BottomNavigation>` in the component tree
   - Check its `props` (pathname, isVisible state)
   - Check the `state` values

3. **Monitor state changes**:
   - Click on the **BottomNavigation** component
   - In the right panel, check the `isVisible` state
   - Focus/unfocus inputs and watch the state toggle

4. **Profile performance**:
   - Click the **Profiler** tab
   - Start recording
   - Interact with the bottom nav
   - Stop recording and analyze

---

## Debugging Checklist

Use this checklist when debugging the bottom navigation issue:

### Pre-Debugging Setup
- [ ] Development server running (`npm run dev`)
- [ ] Device connected via USB
- [ ] Web Inspector/DevTools open and connected
- [ ] Can see the app on the device
- [ ] Console is clear (or note any existing errors)

### Visual Inspection
- [ ] Bottom navigation is visible on page load
- [ ] All 5 icons are visible (Feed, Search, Log, Friends, Profile)
- [ ] Icons are properly aligned
- [ ] Colors look correct (active vs inactive states)
- [ ] Log button has special styling (circle background)

### Interactive Testing
- [ ] Tap each nav item - navigation works
- [ ] Tap an input field - keyboard appears
- [ ] When keyboard appears - bottom nav hides
- [ ] Dismiss keyboard - bottom nav reappears
- [ ] Rapid focus/blur - no flickering or errors

### Console & Code Inspection
- [ ] No console errors or warnings
- [ ] Focus events firing correctly
- [ ] Bottom nav element has correct CSS classes
- [ ] `isVisible` state toggles correctly
- [ ] z-index is 9999 or higher

### Device-Specific Checks

#### iOS Safari
- [ ] Test on real iPhone (not simulator)
- [ ] Check in both portrait and landscape
- [ ] Test with different iOS versions (if possible)
- [ ] Verify safe area handling (notch, home indicator)

#### Android Chrome
- [ ] Test on real Android device
- [ ] Test on different screen sizes
- [ ] Check navigation bar behavior
- [ ] Verify touch targets are adequate (48x48px minimum)

### Performance
- [ ] No lag when toggling visibility
- [ ] Smooth animations (200ms duration working)
- [ ] No memory leaks (check after extended use)
- [ ] Battery usage reasonable

---

## Common Issues & Solutions

### Issue 1: iPhone Not Showing in Develop Menu

**Solution:**
1. Disconnect and reconnect USB cable
2. On iPhone: Settings → Safari → Advanced → Ensure Web Inspector is ON
3. On Mac: Safari → Settings → Advanced → Ensure "Show Develop menu" is checked
4. Restart both Safari browsers
5. Try a different USB cable or port

### Issue 2: "Cannot Connect to iPhone"

**Solution:**
1. Trust the computer again (unplug, reconnect, re-trust)
2. Restart both devices
3. Update iOS and macOS to latest versions
4. Ensure both devices are on the same network

### Issue 3: Bottom Nav Not Hiding on Keyboard

**Diagnosis:**
In Web Inspector Console:
```javascript
// Check if focus events are firing
document.addEventListener('focusin', (e) => {
  console.log('Focused:', e.target);
});

// Check state
const navComponent = document.querySelector('nav.fixed.bottom-0');
console.log('Current display:', getComputedStyle(navComponent).display);
```

**Potential Fixes:**
1. Verify the `useEffect` hook is running
2. Check for event propagation issues
3. Look for `e.stopPropagation()` calls that might block events
4. Test different event listener options (capture phase vs bubble)

### Issue 4: Bottom Nav Not Reappearing

**Diagnosis:**
```javascript
// Check focusout behavior
document.addEventListener('focusout', (e) => {
  console.log('Blurred:', e.target);
});

// Check if timeout is working
// Look in Network tab for delayed updates
```

**Potential Fixes:**
1. Increase the timeout delay in the component (currently 100ms)
2. Check for CSS transitions that might be interfering
3. Verify the state update is triggering re-render
4. Look for other focus/focusout handlers that might conflict

### Issue 5: Nav Visible but Not Clickable

**Diagnosis:**
```javascript
// Check for overlay elements
const nav = document.querySelector('nav.fixed.bottom-0');
const rect = nav.getBoundingClientRect();
console.log('Nav rect:', rect);

// Check what's on top
const topElement = document.elementFromPoint(rect.left + 50, rect.top + 50);
console.log('Top element:', topElement);
```

**Potential Fixes:**
1. Check z-index of other elements
2. Look for fixed/sticky positioned elements
3. Check for invisible overlays
4. Verify pointer-events CSS property

### Issue 6: Styling Different on Real Device vs Emulator

**Diagnosis:**
1. In Elements tab, compare computed styles
2. Check user agent string:
   ```javascript
   console.log('User Agent:', navigator.userAgent);
   ```
3. Check viewport dimensions:
   ```javascript
   console.log('Viewport:', window.innerWidth, window.innerHeight);
   ```

**Potential Fixes:**
1. Add device-specific CSS if needed
2. Check for CSS that only applies to certain browsers
3. Verify Tailwind classes are being applied
4. Look for browser-specific CSS prefixes

### Issue 7: Safe Area Issues (iPhone Notch/Home Indicator)

**Diagnosis:**
```javascript
// Check safe area insets
console.log('Safe area inset bottom:', getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)'));
```

**Potential Fixes:**
1. Add safe area padding:
   ```css
   padding-bottom: env(safe-area-inset-bottom);
   ```
2. Use `safe-bottom` utility (if Tailwind safe-area plugin installed)
3. Adjust bottom positioning to account for home indicator

---

## Advanced Debugging Techniques

### Network Debugging

To debug network requests from your device:

**iOS:**
1. Use **Charles Proxy** or **Proxyman**
2. Set up HTTPS certificate on device
3. Monitor all API calls

**Android:**
1. Use Chrome DevTools **Network** tab
2. All requests are visible automatically

### Performance Profiling

**iOS Safari:**
1. In Web Inspector, go to **Timelines** tab
2. Start recording
3. Interact with bottom nav
4. Stop and analyze frames

**Android Chrome:**
1. In DevTools, go to **Performance** tab
2. Click **Record**
3. Interact with bottom nav
4. Stop and analyze

### Memory Debugging

Check for memory leaks:
1. Open **Memory** tab (Chrome) or **Timelines** → **Memory** (Safari)
2. Take heap snapshot before interaction
3. Interact with bottom nav (focus/blur multiple times)
4. Take another snapshot
5. Compare to find retained objects

### Source Map Debugging

To see your original source code (not compiled):

1. Ensure your Next.js dev server generates source maps (default in dev)
2. In Web Inspector/DevTools:
   - Go to **Sources** (Chrome) or **Resources** (Safari)
   - Look for `webpack://` or your original files
   - Set breakpoints in `.tsx` files
   - Debug directly in React components

---

## Quick Reference Commands

### Get Mac's IP Address
```bash
ipconfig getifaddr en0
```

### Check ADB Connection
```bash
adb devices
```

### Forward Ports (Android)
```bash
adb forward tcp:3000 tcp:3000
```

### Start React DevTools
```bash
react-devtools
```

### Start Dev Server
```bash
cd ~/coffee-shop-app
npm run dev
```

---

## Tips for Effective Debugging

1. **Start Clean**: Clear browser cache and cookies before debugging session
2. **Use Console Logging**: Add strategic `console.log` statements
3. **Take Screenshots**: Document what you see on the device
4. **Test Multiple Devices**: Behavior can vary between iPhone models
5. **Test Both Orientations**: Portrait and landscape can behave differently
6. **Check Real Network Conditions**: Emulate slow 3G if testing network-dependent features
7. **Keep Notes**: Document what you tried and what worked
8. **Use Version Control**: Commit working state before debugging experiments

---

## Next Steps After Debugging

Once you've identified the issue:

1. **Document the Root Cause**: What's actually causing the problem?
2. **Create a Minimal Reproduction**: Can you reproduce it consistently?
3. **Test the Fix**: Make changes and verify on real device
4. **Add Tests**: Update e2e tests to catch regressions
5. **Deploy Safely**: Test on multiple devices before deploying

---

## Additional Resources

- [Apple Safari Web Inspector Guide](https://webkit.org/web-inspector/)
- [Chrome Remote Debugging Guide](https://developer.chrome.com/docs/devtools/remote-debugging/)
- [React DevTools Documentation](https://react.dev/learn/react-developer-tools)
- [Next.js Debugging Guide](https://nextjs.org/docs/app/building-your-application/debugging)
- [iOS Safe Area Guide](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)
