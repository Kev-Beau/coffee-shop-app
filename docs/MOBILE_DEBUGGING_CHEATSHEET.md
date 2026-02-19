# Mobile Debugging Quick Reference

**File:** `/Users/kevinbeaudin/coffee-shop-app/docs/MOBILE_DEBUGGING_CHEATSHEET.md`

## 5-Minute Setup (iOS)

### 1. iPhone Setup (one-time)
```
Settings → Safari → Advanced → Web Inspector: ON
```

### 2. Connect & Debug (repeat each session)
```bash
# Terminal 1: Start dev server
cd ~/coffee-shop-app
npm run dev

# Terminal 2: Get your IP
ipconfig getifaddr en0
# Example output: 192.168.1.100
```

### 3. On iPhone
1. Connect via USB (Trust computer)
2. Open Safari
3. Go to: `http://192.168.1.100:3000` (use your actual IP)
4. Tap "Advanced" → "Visit Website"

### 4. On Mac Safari
1. Click **Develop** menu (top bar)
2. Find your iPhone name
3. Click **localhost:3000**
4. Web Inspector opens!

---

## Quick Console Debugging

Copy-paste these into the Console tab:

### Check Bottom Nav Element
```javascript
const nav = document.querySelector('nav.fixed.bottom-0');
console.log('Nav element:', nav);
console.log('Display:', getComputedStyle(nav).display);
console.log('Visible:', getComputedStyle(nav).visibility);
console.log('Z-index:', getComputedStyle(nav).zIndex);
```

### Monitor Focus Events
```javascript
document.addEventListener('focusin', (e) => {
  console.log('✅ Focus in:', e.target.tagName, e.target.className);
});
document.addEventListener('focusout', (e) => {
  console.log('❌ Focus out:', e.target.tagName, e.target.className);
});
```

### Test Nav Visibility State
```javascript
// Check if React state is updating
// (Only works if React DevTools is connected)
console.log('Check React DevTools Components tab for isVisible state');
```

### Check Viewport & Safe Area
```javascript
console.log('Viewport:', window.innerWidth, 'x', window.innerHeight);
console.log('User Agent:', navigator.userAgent);
console.log('Touch support:', 'ontouchstart' in window);
```

---

## Quick Visual Inspection

### In Elements Tab
1. Click crosshair icon (Select Element)
2. Tap bottom nav on iPhone
3. Check these styles:
   - ✓ `position: fixed`
   - ✓ `bottom: 0`
   - ✓ `z-index: 9999`
   - ✓ `display: block` (not `none`!)
   - ✓ `visibility: visible`
   - ✓ `opacity: 1`

### Common Issues
- **Display: none** → Nav is hidden by state
- **Z-index too low** → Other elements covering it
- **Pointer-events: none** → Not clickable
- **Transform issues** → Nav positioned off-screen

---

## Test Procedure

### 1. Initial State (5 seconds)
- [ ] Page loads
- [ ] Bottom nav visible
- [ ] All 5 icons show
- [ ] No console errors

### 2. Navigation Test (10 seconds)
- [ ] Tap Feed → navigates
- [ ] Tap Search → navigates
- [ ] Tap Log → navigates
- [ ] Tap Friends → navigates
- [ ] Tap Profile → navigates

### 3. Keyboard Test (15 seconds)
- [ ] Go to Search page
- [ ] Tap search input → keyboard appears
- [ ] Bottom nav DISAPPEARS ✅
- [ ] Tap outside → keyboard dismisses
- [ ] Bottom nav REAPPEARS ✅

### 4. Stress Test (10 seconds)
- [ ] Rapidly tap input (5x)
- [ ] Bottom nav toggles each time
- [ ] No flickering or lag
- [ ] No console errors

---

## Android Quick Setup

### 1. Enable USB Debugging (one-time)
```
Settings → About Phone → Tap Build Number 7x
Settings → System → Developer Options → USB Debugging: ON
```

### 2. Connect & Debug
```bash
# Install ADB (one-time)
brew install android-platform-tools

# Connect device via USB
# Allow USB debugging on phone

# Verify connection
adb devices

# Forward port
adb forward tcp:3000 tcp:3000

# On Mac Chrome, go to: chrome://inspect
# Click "inspect" next to your device
```

---

## Troubleshooting (30 seconds each)

### iPhone not showing in Develop menu?
1. Unplug USB → reconnect
2. On iPhone: Re-trust computer
3. Restart Safari on both devices
4. Try different USB cable/port

### Can't connect to iPhone?
1. Both devices on same WiFi network
2. Check firewall settings
3. Update iOS and macOS
4. Restart both devices

### Bottom nav not hiding?
```javascript
// Check if event listener is attached
const listeners = getEventListeners(document);
console.log('Has focusin?', listeners.focusin);
console.log('Has focusout?', listeners.focusout);
```

### Bottom nav not reappearing?
```javascript
// Check state in React DevTools
// Look for isVisible: true/false
// Check if timeout is working
```

---

## Quick Commands Reference

```bash
# Get IP address
ipconfig getifaddr en0

# Start dev server
npm run dev

# React DevTools
react-devtools

# Android ADB
adb devices
adb forward tcp:3000 tcp:3000
```

---

## One-Page Debugging Flow

```
┌─────────────────────────────────────────────┐
│  1. SETUP (2 min)                            │
│     • npm run dev                           │
│     • Connect iPhone                        │
│     • Open Safari → Develop → iPhone        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  2. INSPECT (1 min)                          │
│     • Elements tab → Select bottom nav       │
│     • Check styles (position, z-index)      │
│     • Verify display: block                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  3. TEST (2 min)                             │
│     • Tap all nav items ✓                   │
│     • Focus input → nav hides ✓             │
│     • Blur input → nav shows ✓              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  4. DIAGNOSE (if broken)                    │
│     • Console tab → paste monitoring code    │
│     • Watch focus events                    │
│     • Check React DevTools state            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  5. FIX & VERIFY                             │
│     • Make code changes                     │
│     • Refresh on iPhone                     │
│     • Re-test                               │
└─────────────────────────────────────────────┘
```

---

## Emergency Fixes

### Bottom nav stuck hidden?
```javascript
// In browser console, force show
document.querySelector('nav.fixed.bottom-0').style.display = 'block';
```

### Bottom nav not clickable?
```javascript
// Force clickable
document.querySelector('nav.fixed.bottom-0').style.pointerEvents = 'auto';
```

### Z-index conflict?
```javascript
// Force on top
document.querySelector('nav.fixed.bottom-0').style.zIndex = '99999';
```

---

## Key Files to Check

- `/Users/kevinbeaudin/coffee-shop-app/app/components/BottomNavigation.tsx`
  - Lines 20-40: Focus/blur event listeners
  - Line 50: `isVisible` state check
  - Line 53: z-index and positioning

---

## Success Criteria

✅ Bottom nav visible on page load
✅ All navigation items work
✅ Nav hides when keyboard appears
✅ Nav shows when keyboard dismisses
✅ No console errors
✅ Smooth transitions (200ms)
✅ Works on real iPhone, not just simulator

---

## Need More Help?

See full guide: `/Users/kevinbeaudin/coffee-shop-app/docs/MOBILE_DEBUGGING_GUIDE.md`

---

**Last Updated:** 2026-02-19
**Tested On:** iOS Safari 15+, Android Chrome 90+
