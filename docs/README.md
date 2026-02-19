# Debugging Documentation

This folder contains comprehensive debugging guides and resources for the CoffeeConnect application.

## Available Documentation

### 1. [Mobile Debugging Guide](./MOBILE_DEBUGGING_GUIDE.md)
Complete guide for debugging mobile devices (iOS Safari and Android Chrome).

**Covers:**
- Safari Web Inspector setup for iOS
- Chrome DevTools Remote Debugging for Android
- React DevTools integration
- Step-by-step debugging procedures
- Troubleshooting common issues
- Advanced debugging techniques

**Best for:** First-time setup or deep debugging sessions

---

### 2. [Mobile Debugging Cheatsheet](./MOBILE_DEBUGGING_CHEATSHEET.md)
Quick reference guide for rapid debugging sessions.

**Covers:**
- 5-minute iOS setup
- Quick console debugging snippets
- One-page debugging flow
- Emergency fixes
- Key command reference

**Best for:** Daily debugging or quick reference

---

## Quick Start

### Debug on iPhone (iOS)

```bash
# 1. Start your dev server
npm run dev

# 2. Get your local IP
ipconfig getifaddr en0
# Example output: 192.168.1.100

# 3. On iPhone Safari, go to:
http://192.168.1.100:3000

# 4. On Mac Safari: Develop → [Your iPhone] → localhost:3000
```

### Debug on Android

```bash
# 1. Start your dev server
npm run dev

# 2. Enable USB debugging on Android
# Settings → About Phone → Tap Build Number 7x
# Settings → System → Developer Options → USB Debugging: ON

# 3. Connect and forward port
adb devices
adb forward tcp:3000 tcp:3000

# 4. On Mac Chrome: chrome://inspect
# Click "inspect" next to your device
```

---

## Debugging Scripts

### Mobile Debugging Helper

Run the automated debugging helper:

```bash
npm run debug:mobile
```

This script will:
- Check if your dev server is running
- Display your local IP address
- Generate a QR code for easy mobile access
- Provide ready-to-use debugging snippets
- Show a debugging checklist
- Save snippets to `debug-snippets.js`

---

## Common Debugging Scenarios

### Bottom Navigation Issues

**Problem:** Bottom nav not hiding when keyboard appears

**Diagnosis:**
1. Open Web Inspector/DevTools
2. Go to Console tab
3. Paste this snippet:

```javascript
document.addEventListener('focusin', (e) => {
  console.log('Focus in:', e.target.tagName);
});
document.addEventListener('focusout', (e) => {
  console.log('Focus out:', e.target.tagName);
});
```

4. Focus an input field
5. Check console logs
6. Verify bottom nav hides

**See:** [Mobile Debugging Guide](./MOBILE_DEBUGGING_GUIDE.md) → Debugging Checklist

---

### Styling Different on Real Device

**Problem:** Looks good in emulator but wrong on real device

**Diagnosis:**
1. Inspect element on real device
2. Compare computed styles with emulator
3. Check for:
   - Different viewport sizes
   - User agent differences
   - CSS browser prefixes
   - Safe area insets (iPhone notch)

**See:** [Mobile Debugging Guide](./MOBILE_DEBUGGING_GUIDE.md) → Device-Specific Checks

---

### Z-Index or Overlapping Elements

**Problem:** Bottom nav not clickable or covered by other elements

**Diagnosis:**
```javascript
const nav = document.querySelector('nav.fixed.bottom-0');
console.log('Z-index:', getComputedStyle(nav).zIndex);

// Find overlapping elements
const rect = nav.getBoundingClientRect();
const topElement = document.elementFromPoint(
  rect.left + rect.width / 2,
  rect.top + rect.height / 2
);
console.log('Element on top:', topElement);
```

**See:** [Mobile Debugging Cheatsheet](./MOBILE_DEBUGGING_CHEATSHEET.md) → Emergency Fixes

---

## Debugging Workflow

### Standard Workflow

```
1. Reproduce the issue on real device
2. Connect device to Mac
3. Open Web Inspector/DevTools
4. Inspect the problematic element
5. Check console for errors
6. Use debugging snippets
7. Identify root cause
8. Test fix on real device
9. Verify fix works on multiple devices
```

### Quick Workflow (< 5 minutes)

1. Run `npm run debug:mobile`
2. Scan QR code with phone
3. Follow setup instructions
4. Paste relevant snippet in console
5. Check output
6. Make fix if needed

---

## Console Snippets

Ready-to-use snippets are available in the debugging helper script. Run:

```bash
npm run debug:mobile
```

Or access saved snippets:
```bash
cat debug-snippets.js
```

Available snippets:
- `checkNavElement` - Verify nav element exists and has correct styles
- `monitorFocusEvents` - Watch focus/blur events in real-time
- `testKeyboardInteraction` - Automated keyboard test
- `checkSafeArea` - Check device safe area insets
- `findOverlappingElements` - Find elements covering the nav
- `monitorStateChanges` - Instructions for monitoring React state
- `runFullDiagnostic` - Complete diagnostic check

---

## Key Files

When debugging mobile issues, these files are most relevant:

- **Component:** `/Users/kevinbeaudin/coffee-shop-app/app/components/BottomNavigation.tsx`
  - Lines 20-40: Focus/blur event listeners
  - Line 50: Visibility state check
  - Line 53: CSS positioning and z-index

- **E2E Tests:** `/Users/kevinbeaudin/coffee-shop-app/e2e/bottom-navigation.spec.ts`
  - Test coverage for keyboard interactions
  - Device-specific tests
  - Accessibility tests

- **Debugging Helper:** `/Users/kevinbeaudin/coffee-shop-app/scripts/debug-mobile.js`
  - Automated setup and diagnostics
  - Console snippet generation

---

## Troubleshooting

### iPhone Not Showing in Safari Develop Menu

**Solutions:**
1. Unplug and reconnect USB cable
2. On iPhone: Settings → Safari → Advanced → Web Inspector: ON
3. Restart Safari on both devices
4. Try different USB cable or port
5. Ensure both devices are on same network

### Android Device Not Connecting

**Solutions:**
1. Enable USB debugging (see setup guide)
2. Run `adb devices` to verify connection
3. Allow USB debugging on phone when prompted
4. Install ADB: `brew install android-platform-tools`
5. Try different USB cable or port

### Dev Server Not Accessible from Phone

**Solutions:**
1. Verify dev server is running: `npm run dev`
2. Check both devices on same WiFi network
3. Use local IP instead of localhost
4. Check firewall settings
5. Try: `ipconfig getifaddr en0` to get correct IP

---

## Advanced Topics

### React DevTools on Mobile

React DevTools works with mobile browsers when using remote debugging. See:
- [Mobile Debugging Guide](./MOBILE_DEBUGGING_GUIDE.md) → React DevTools Setup

### Network Debugging

For debugging API calls and network requests:

**iOS:** Use Charles Proxy or Proxyman
**Android:** Chrome DevTools Network tab

### Performance Profiling

- **iOS:** Safari Web Inspector → Timelines tab
- **Android:** Chrome DevTools → Performance tab

### Memory Debugging

Check for memory leaks by comparing heap snapshots before and after interactions.

---

## Additional Resources

- [Safari Web Inspector Guide](https://webkit.org/web-inspector/)
- [Chrome Remote Debugging](https://developer.chrome.com/docs/devtools/remote-debugging/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Next.js Debugging](https://nextjs.org/docs/app/building-your-application/debugging)
- [iOS Safe Areas](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

---

## Need Help?

1. Check the [Mobile Debugging Guide](./MOBILE_DEBUGGING_GUIDE.md) for detailed instructions
2. Use the [Cheatsheet](./MOBILE_DEBUGGING_CHEATSHEET.md) for quick reference
3. Run the debugging helper: `npm run debug:mobile`
4. Review the [BottomNavigation.tsx](../app/components/BottomNavigation.tsx) component code
5. Check E2E tests: [bottom-navigation.spec.ts](../e2e/bottom-navigation.spec.ts)

---

**Last Updated:** 2026-02-19
**Tested On:** iOS Safari 15+, Android Chrome 90+
