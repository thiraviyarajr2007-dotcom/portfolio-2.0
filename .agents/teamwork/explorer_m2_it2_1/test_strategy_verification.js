/**
 * Verification Script for Focus Trap Strategies
 * Tests both standard transitions and edge cases
 */

const assert = require('assert');

// Mock elements
const navToggle = { id: 'nav-toggle', focus() { currentActive = this; } };
const outsideElement = { id: 'site-logo', focus() { currentActive = this; } };
const links = [
  { id: 'hero', focus() { currentActive = this; } },
  { id: 'about', focus() { currentActive = this; } },
  { id: 'contact', focus() { currentActive = this; } }
];

let currentActive = null;

function completeBridgeFix(e, customLinks) {
  var focusables = customLinks !== undefined ? customLinks : links;
  if (focusables.length === 0) {
    e.preventDefault();
    if (navToggle && typeof navToggle.focus === 'function') {
      navToggle.focus();
    }
    return;
  }

  var ring = focusables.concat([navToggle]);
  var firstLink = focusables[0];
  var lastLink = focusables[focusables.length - 1];

  // Defensive recapture if focus somehow escaped
  if (ring.indexOf(currentActive) === -1) {
    e.preventDefault();
    if (firstLink && typeof firstLink.focus === 'function') {
      firstLink.focus();
    } else if (navToggle && typeof navToggle.focus === 'function') {
      navToggle.focus();
    }
    return;
  }

  if (e.shiftKey) {
    // Backward navigation (Shift + Tab)
    if (currentActive === firstLink) {
      e.preventDefault();
      navToggle.focus();
    } else if (currentActive === navToggle) {
      e.preventDefault();
      lastLink.focus();
    }
  } else {
    // Forward navigation (Tab)
    if (currentActive === navToggle) {
      e.preventDefault();
      firstLink.focus();
    } else if (currentActive === lastLink) {
      e.preventDefault();
      navToggle.focus();
    }
  }
}

console.log('--- Testing Complete 4-Boundary Bridge Fix ---');

// Standard 4 Tests
// Test 1: Tab forward from last link (contact) -> navToggle
currentActive = links[2];
let p1 = false;
completeBridgeFix({ key: 'Tab', shiftKey: false, preventDefault() { p1 = true; } });
assert.strictEqual(p1, true);
assert.strictEqual(currentActive, navToggle);
console.log('[PASS] Test 1: Tab forward on last link -> navToggle');

// Test 2: Shift+Tab on navToggle -> last link (contact)
currentActive = navToggle;
let p2 = false;
completeBridgeFix({ key: 'Tab', shiftKey: true, preventDefault() { p2 = true; } });
assert.strictEqual(p2, true);
assert.strictEqual(currentActive, links[2]);
console.log('[PASS] Test 2: Shift+Tab on navToggle -> last link');

// Test 3: Forward Tab on navToggle -> first link (hero)
currentActive = navToggle;
let p3 = false;
completeBridgeFix({ key: 'Tab', shiftKey: false, preventDefault() { p3 = true; } });
assert.strictEqual(p3, true);
assert.strictEqual(currentActive, links[0]);
console.log('[PASS] Test 3: Forward Tab on navToggle -> first link');

// Test 4: Shift+Tab on first link (hero) -> navToggle
currentActive = links[0];
let p4 = false;
completeBridgeFix({ key: 'Tab', shiftKey: true, preventDefault() { p4 = true; } });
assert.strictEqual(p4, true);
assert.strictEqual(currentActive, navToggle);
console.log('[PASS] Test 4: Shift+Tab on first link -> navToggle');

// Edge Case 1: Focus outside ring -> recaptured to firstLink
currentActive = outsideElement;
let p5 = false;
completeBridgeFix({ key: 'Tab', shiftKey: false, preventDefault() { p5 = true; } });
assert.strictEqual(p5, true);
assert.strictEqual(currentActive, links[0]);
console.log('[PASS] Edge Case 1: Focus outside ring recaptured on Tab');

// Edge Case 2: Zero focusables -> locked to navToggle
currentActive = navToggle;
let p6 = false;
completeBridgeFix({ key: 'Tab', shiftKey: false, preventDefault() { p6 = true; } }, []);
assert.strictEqual(p6, true);
assert.strictEqual(currentActive, navToggle);
console.log('[PASS] Edge Case 2: Zero focusables locks focus to navToggle');

// Edge Case 3: Single focusable link -> cyclic between single link and navToggle
const singleLink = [{ id: 'single', focus() { currentActive = this; } }];
currentActive = singleLink[0];
let p7 = false;
completeBridgeFix({ key: 'Tab', shiftKey: false, preventDefault() { p7 = true; } }, singleLink);
assert.strictEqual(p7, true);
assert.strictEqual(currentActive, navToggle);

currentActive = navToggle;
let p8 = false;
completeBridgeFix({ key: 'Tab', shiftKey: false, preventDefault() { p8 = true; } }, singleLink);
assert.strictEqual(p8, true);
assert.strictEqual(currentActive, singleLink[0]);

currentActive = singleLink[0];
let p9 = false;
completeBridgeFix({ key: 'Tab', shiftKey: true, preventDefault() { p9 = true; } }, singleLink);
assert.strictEqual(p9, true);
assert.strictEqual(currentActive, navToggle);

currentActive = navToggle;
let p10 = false;
completeBridgeFix({ key: 'Tab', shiftKey: true, preventDefault() { p10 = true; } }, singleLink);
assert.strictEqual(p10, true);
assert.strictEqual(currentActive, singleLink[0]);
console.log('[PASS] Edge Case 3: Single focusable cycles bidirectionally with navToggle');

console.log('\nALL 7 TESTS PASSED EMPIRICALLY!');
