#!/usr/bin/env node

/**
 * Mobile Debugging Helper Script
 *
 * This script helps you debug mobile issues by:
 * 1. Checking if dev server is running
 * 2. Getting your local IP address
 * 3. Providing QR code for easy mobile access
 * 4. Generating debugging snippets
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getTitle(title) {
  return `\n${colors.bright}${colors.cyan}${'='.repeat(60)}\n${' '.repeat((60 - title.length) / 2)}${title}\n${'='.repeat(60)}${colors.reset}\n`;
}

// Get local IP address
function getLocalIP() {
  try {
    const ip = execSync('ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "127.0.0.1"')
      .toString()
      .trim();
    return ip;
  } catch (error) {
    return 'localhost';
  }
}

// Check if dev server is running
function checkDevServer(ip, port = 3000) {
  const fetch = require('node-fetch');
  return fetch(`http://${ip}:${port}`)
    .then(response => true)
    .catch(error => false);
}

// Generate console debugging snippets
function generateDebugSnippets() {
  return {
    checkNavElement: `// Check bottom nav element
const nav = document.querySelector('nav.fixed.bottom-0');
console.log('✅ Nav element:', nav);
console.log('Display:', getComputedStyle(nav).display);
console.log('Visible:', getComputedStyle(nav).visibility);
console.log('Z-index:', getComputedStyle(nav).zIndex);
console.log('Position:', getComputedStyle(nav).position);
console.log('Bottom:', getComputedStyle(nav).bottom);`,

    monitorFocusEvents: `// Monitor focus events
console.log('🎯 Focus monitoring started...');
document.addEventListener('focusin', (e) => {
  const target = e.target;
  console.log('📱 Focus IN:', {
    tag: target.tagName,
    className: target.className,
    id: target.id,
    type: target.type,
  });
  const nav = document.querySelector('nav.fixed.bottom-0');
  console.log('   Nav visible:', getComputedStyle(nav).display !== 'none');
});

document.addEventListener('focusout', (e) => {
  const target = e.target;
  console.log('📤 Focus OUT:', {
    tag: target.tagName,
    className: target.className,
  });
  setTimeout(() => {
    const nav = document.querySelector('nav.fixed.bottom-0');
    console.log('   Nav visible after 100ms:', getComputedStyle(nav).display !== 'none');
  }, 150);
});`,

    testKeyboardInteraction: `// Test keyboard interaction
async function testKeyboardInteraction() {
  const nav = document.querySelector('nav.fixed.bottom-0');
  const searchInput = document.querySelector('input[type="search"]');

  console.log('🧪 Starting keyboard test...');
  console.log('Initial nav state:', getComputedStyle(nav).display);

  // Simulate focus
  searchInput.focus();
  await new Promise(r => setTimeout(r, 300));
  console.log('After input focus:', getComputedStyle(nav).display);

  // Simulate blur
  searchInput.blur();
  await new Promise(r => setTimeout(r, 300));
  console.log('After input blur:', getComputedStyle(nav).display);
}

testKeyboardInteraction();`,

    checkSafeArea: `// Check safe area insets
const root = document.documentElement;
const style = getComputedStyle(root);
console.log('📐 Safe Area Insets:');
console.log('   Top:', style.getPropertyValue('env(safe-area-inset-top)'));
console.log('   Right:', style.getPropertyValue('env(safe-area-inset-right)'));
console.log('   Bottom:', style.getPropertyValue('env(safe-area-inset-bottom)'));
console.log('   Left:', style.getPropertyValue('env(safe-area-inset-left)'));
console.log('Viewport:', window.innerWidth, 'x', window.innerHeight);`,

    findOverlappingElements: `// Find elements that might overlap bottom nav
const nav = document.querySelector('nav.fixed.bottom-0');
const rect = nav.getBoundingClientRect();

console.log('🔍 Checking for overlapping elements...');
console.log('Nav rect:', rect);

// Check elements at nav position
const leftPoint = document.elementFromPoint(rect.left + 10, rect.top + 10);
const centerPoint = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
const rightPoint = document.elementFromPoint(rect.right - 10, rect.top + 10);

console.log('Element at left:', leftPoint);
console.log('Element at center:', centerPoint);
console.log('Element at right:', rightPoint);

// Check z-index stacking
const allFixed = document.querySelectorAll('*');
const highZ = [];
allFixed.forEach(el => {
  const z = parseInt(getComputedStyle(el).zIndex);
  if (z > 100 && getComputedStyle(el).position === 'fixed') {
    highZ.push({ el, z });
  }
});
console.log('Elements with z-index > 100:', highZ.sort((a, b) => b.z - a.z));`,

    monitorStateChanges: `// Monitor React state changes (requires React DevTools)
console.log('💡 Open React DevTools Components tab');
console.log('💡 Select BottomNavigation component');
console.log('💡 Watch the "isVisible" state value');
console.log('');
console.log('Expected behavior:');
console.log('  • isVisible: true when no input is focused');
console.log('  • isVisible: false when input is focused');
console.log('');
console.log('Test by focusing different inputs and watching the state toggle');`,

    runFullDiagnostic: `// Run full diagnostic
function runDiagnostic() {
  console.log('🔬 Running Bottom Navigation Diagnostic...');
  console.log('');

  // 1. Check element exists
  const nav = document.querySelector('nav.fixed.bottom-0');
  if (!nav) {
    console.error('❌ Bottom nav element NOT found!');
    return;
  }
  console.log('✅ Bottom nav element found');

  // 2. Check styles
  const styles = getComputedStyle(nav);
  const issues = [];

  if (styles.position !== 'fixed') issues.push('Position is not fixed');
  if (styles.display === 'none') issues.push('Display is none (hidden)');
  if (styles.visibility !== 'visible') issues.push('Not visible');
  if (parseInt(styles.zIndex) < 9999) issues.push('Z-index too low: ' + styles.zIndex);

  if (issues.length > 0) {
    console.warn('⚠️  Style issues found:');
    issues.forEach(issue => console.warn('   •', issue));
  } else {
    console.log('✅ All styles look good');
  }

  // 3. Check nav items
  const navLinks = nav.querySelectorAll('a');
  console.log('✅ Found', navLinks.length, 'navigation items');

  // 4. Check event listeners
  console.log('💡 Focus monitoring:');
  console.log('   Run the "Monitor Focus Events" snippet separately');
  console.log('   to see real-time focus/blur events');

  // 5. Device info
  console.log('');
  console.log('📱 Device Info:');
  console.log('   User Agent:', navigator.userAgent);
  console.log('   Viewport:', window.innerWidth, 'x', window.innerHeight);
  console.log('   Touch support:', 'ontouchstart' in window ? 'Yes' : 'No');

  return {
    elementExists: true,
    styles,
    navLinksCount: navLinks.length,
    issues,
  };
}

runDiagnostic();`,
  };
}

// Main execution
async function main() {
  console.log(getTitle('Mobile Debugging Helper'));

  // Get local IP
  const ip = getLocalIP();
  const port = 3000;
  const url = `http://${ip}:${port}`;

  log(`Local IP Address: ${ip}`, 'bright');
  log(`Dev Server URL: ${url}`, 'bright');

  // Check if server is running
  log('\nChecking if dev server is running...', 'yellow');
  try {
    // Try to fetch the page
    const fetch = require('node-fetch');
    await fetch(`http://${ip}:${port}`, { timeout: 2000 });
    log('✅ Dev server is running!\n', 'green');
  } catch (error) {
    log('❌ Dev server is NOT running', 'red');
    log('Start it with: npm run dev\n', 'yellow');

    // Offer to start it
    log('Do you want to start the dev server? (y/n)', 'yellow');
    process.exit(1);
  }

  // Generate QR code (if qrcode-terminal is available)
  try {
    const qrcode = require('qrcode-terminal');
    log('\nScan this QR code with your phone:\n', 'cyan');
    qrcode.generate(url, { small: true });
  } catch (error) {
    // qrcode-terminal not installed, skip
    log('\n💡 Install qrcode-terminal for QR code: npm install -g qrcode-terminal', 'yellow');
  }

  // Show setup instructions
  console.log(getTitle('Setup Instructions'));
  log('For iOS (iPhone):', 'cyan');
  log(`  1. Connect iPhone to Mac via USB`, 'reset');
  log(`  2. Open Safari on iPhone and go to: ${url}`, 'green');
  log(`  3. On Mac Safari: Develop → [Your iPhone] → localhost:3000`, 'green');

  log('\nFor Android:', 'cyan');
  log(`  1. Enable USB Debugging on Android`, 'reset');
  log(`  2. Connect to Mac and run: adb devices`, 'reset');
  log(`  3. Forward port: adb forward tcp:3000 tcp:3000`, 'reset');
  log(`  4. Open Chrome on Android: ${url}`, 'green');
  log(`  5. On Mac Chrome: chrome://inspect`, 'green');

  // Show debugging snippets
  console.log(getTitle('Debugging Snippets'));
  log('Copy-paste these into the browser console:\n', 'cyan');

  const snippets = generateDebugSnippets();
  Object.entries(snippets).forEach(([name, snippet]) => {
    log(`📋 ${name}`, 'yellow');
    log('─'.repeat(60), 'cyan');
    log(snippet, 'reset');
    console.log();
  });

  // Save snippets to file
  const snippetsPath = path.join(__dirname, '../debug-snippets.js');
  fs.writeFileSync(snippetsPath, Object.values(snippets).join('\n\n'));
  log(`\n💾 Snippets saved to: ${snippetsPath}`, 'green');

  // Show quick checklist
  console.log(getTitle('Quick Debugging Checklist'));
  const checklist = [
    'Bottom nav visible on page load',
    'All 5 navigation items present (Feed, Search, Log, Friends, Profile)',
    'Tap each nav item → navigation works',
    'Tap search input → keyboard appears',
    'When keyboard appears → bottom nav hides',
    'Dismiss keyboard → bottom nav reappears',
    'No console errors',
    'Smooth transitions (no flickering)',
  ];

  checklist.forEach((item, index) => {
    log(`  [${index + 1}] ${item}`, 'reset');
  });

  // Show key files
  console.log(getTitle('Key Files to Check'));
  log(
    `  • BottomNavigation Component:
     /Users/kevinbeaudin/coffee-shop-app/app/components/BottomNavigation.tsx`,
    'cyan'
  );
  log(
    `  • E2E Tests:
     /Users/kevinbeaudin/coffee-shop-app/e2e/bottom-navigation.spec.ts`,
    'cyan'
  );
  log(
    `  • Full Debugging Guide:
     /Users/kevinbeaudin/coffee-shop-app/docs/MOBILE_DEBUGGING_GUIDE.md`,
    'cyan'
  );
  log(
    `  • Quick Reference:
     /Users/kevinbeaudin/coffee-shop-app/docs/MOBILE_DEBUGGING_CHEATSHEET.md`,
    'cyan'
  );

  console.log(getTitle('Ready to Debug!'));
  log('Good luck! 🚀', 'green');
  console.log('');
}

// Run the script
main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
