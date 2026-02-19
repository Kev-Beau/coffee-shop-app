// Check bottom nav element
const nav = document.querySelector('nav.fixed.bottom-0');
console.log('✅ Nav element:', nav);
console.log('Display:', getComputedStyle(nav).display);
console.log('Visible:', getComputedStyle(nav).visibility);
console.log('Z-index:', getComputedStyle(nav).zIndex);
console.log('Position:', getComputedStyle(nav).position);
console.log('Bottom:', getComputedStyle(nav).bottom);

// Monitor focus events
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
});

// Test keyboard interaction
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

testKeyboardInteraction();

// Check safe area insets
const root = document.documentElement;
const style = getComputedStyle(root);
console.log('📐 Safe Area Insets:');
console.log('   Top:', style.getPropertyValue('env(safe-area-inset-top)'));
console.log('   Right:', style.getPropertyValue('env(safe-area-inset-right)'));
console.log('   Bottom:', style.getPropertyValue('env(safe-area-inset-bottom)'));
console.log('   Left:', style.getPropertyValue('env(safe-area-inset-left)'));
console.log('Viewport:', window.innerWidth, 'x', window.innerHeight);

// Find elements that might overlap bottom nav
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
console.log('Elements with z-index > 100:', highZ.sort((a, b) => b.z - a.z));

// Monitor React state changes (requires React DevTools)
console.log('💡 Open React DevTools Components tab');
console.log('💡 Select BottomNavigation component');
console.log('💡 Watch the "isVisible" state value');
console.log('');
console.log('Expected behavior:');
console.log('  • isVisible: true when no input is focused');
console.log('  • isVisible: false when input is focused');
console.log('');
console.log('Test by focusing different inputs and watching the state toggle');

// Run full diagnostic
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

runDiagnostic();