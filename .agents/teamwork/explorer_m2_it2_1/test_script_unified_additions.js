/**
 * Proposed Keydown Unit Tests for worker_m2_1/test_script_unified.js (Test Suite 2)
 */

// --- Keyboard Focus Trap & Keydown Verification ---
Portfolio.MobileNavManager.open();
const allNavLinks = Array.from(navMenu.querySelectorAll('a[href]'));
const firstDrawerLink = allNavLinks[0];
const lastDrawerLink = allNavLinks[allNavLinks.length - 1];

// 1. Forward Tab on last link -> wraps to navToggle
global.document.activeElement = lastDrawerLink;
let tabLastPrevented = false;
global.document.dispatchEvent({
  type: 'keydown',
  key: 'Tab',
  shiftKey: false,
  preventDefault: () => { tabLastPrevented = true; }
});
assert.strictEqual(tabLastPrevented, true, 'Tab forward on last drawer link must be preventDefaulted');
assert.strictEqual(global.document.activeElement, navToggleBtn, 'Focus must wrap to navToggleBtn');

// 2. Shift+Tab on navToggle -> wraps to last link
global.document.activeElement = navToggleBtn;
let shiftTabTogglePrevented = false;
global.document.dispatchEvent({
  type: 'keydown',
  key: 'Tab',
  shiftKey: true,
  preventDefault: () => { shiftTabTogglePrevented = true; }
});
assert.strictEqual(shiftTabTogglePrevented, true, 'Shift+Tab on navToggleBtn must be preventDefaulted');
assert.strictEqual(global.document.activeElement, lastDrawerLink, 'Focus must wrap to last drawer link');

// 3. Forward Tab on navToggle -> wraps to first link
global.document.activeElement = navToggleBtn;
let tabTogglePrevented = false;
global.document.dispatchEvent({
  type: 'keydown',
  key: 'Tab',
  shiftKey: false,
  preventDefault: () => { tabTogglePrevented = true; }
});
assert.strictEqual(tabTogglePrevented, true, 'Tab forward on navToggleBtn must be preventDefaulted');
assert.strictEqual(global.document.activeElement, firstDrawerLink, 'Focus must wrap to first drawer link');

// 4. Shift+Tab on first link -> wraps to navToggle
global.document.activeElement = firstDrawerLink;
let shiftTabFirstPrevented = false;
global.document.dispatchEvent({
  type: 'keydown',
  key: 'Tab',
  shiftKey: true,
  preventDefault: () => { shiftTabFirstPrevented = true; }
});
assert.strictEqual(shiftTabFirstPrevented, true, 'Shift+Tab on first drawer link must be preventDefaulted');
assert.strictEqual(global.document.activeElement, navToggleBtn, 'Focus must wrap to navToggleBtn');

// 5. Escape key dismisses drawer and restores focus
let escPrevented = false;
global.document.dispatchEvent({
  type: 'keydown',
  key: 'Escape',
  preventDefault: () => { escPrevented = true; }
});
assert.strictEqual(escPrevented, true, 'Escape key must be preventDefaulted');
assert.strictEqual(Portfolio.MobileNavManager.isOpen(), false, 'Drawer must be closed on Escape');
assert.strictEqual(global.document.activeElement, navToggleBtn, 'Focus must be restored to navToggleBtn');

console.log('[PASS] Focus trap & Escape key verified (bidirectional cyclic trap, zero leaks)');
