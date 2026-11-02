# Exploration & Investigation Report: Robust Focus Trap & Keyboard Navigation Unit Testing

**Agent**: `explorer_m2_it2_2`  
**Working Directory**: `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_it2_2\`  
**Target Files**: 
- `script.js` (lines 412–444: `MobileNavManager.handleKeyDown`)
- `.agents/teamwork/worker_m2_1/test_script_unified.js` (lines 210–241: DOM mock, lines 282–306: Test 2)
- `.agents/teamwork/reviewer_m2_1/test_adversarial_m2.js`  
**Date**: 2026-11-02T06:28:00Z  

---

## 1. Observation

Direct examination of the codebase and test harnesses revealed the following empirical findings:

### 1.1 Omission of Synthetic Keyboard Events in `worker_m2_1/test_script_unified.js`
In `.agents/teamwork/worker_m2_1/test_script_unified.js` (lines 282–306):
```javascript
// TEST 2: ACCESSIBLE MOBILE NAVIGATION DRAWER
console.log('\n--- 2. Testing Accessible Mobile Navigation Drawer ---');
Portfolio.MobileNavManager.init();

// Open Drawer
Portfolio.MobileNavManager.open();
assert.strictEqual(Portfolio.MobileNavManager.isOpen(), true, 'Drawer should be open');
...
// Close Drawer
Portfolio.MobileNavManager.close();
assert.strictEqual(Portfolio.MobileNavManager.isOpen(), false, 'Drawer should be closed');
...
console.log('[PASS] Mobile Drawer verified (state transitions, a11y, body lock)');
```
**Finding**: The test only invokes `open()` and `close()`. It never dispatches any `keydown` events (`Tab`, `Shift+Tab`, or `Escape`), nor does it assert focus trapping or wrapping.

### 1.2 Fatal Mock Infrastructure Defect in `worker_m2_1/test_script_unified.js`
In `.agents/teamwork/worker_m2_1/test_script_unified.js` (lines 210–241):
```javascript
global.document = {
  documentElement: docElem,
  body: bodyElem,
  activeElement: null,
  ...
  addEventListener: () => {},
  removeEventListener: () => {}
};
```
**Finding**: `global.document.addEventListener` and `removeEventListener` are dummy empty stubs (`() => {}`). When `MobileNavManager.open()` calls `document.addEventListener('keydown', handleKeyDown)`, the listener function `handleKeyDown` is dropped. `global.document.dispatchEvent` is entirely undefined. Consequently, any attempted synthetic event dispatch in the current test harness fails silently.

### 1.3 Physical DOM Order in `index.html`
In `index.html` (lines 104–145):
```html
<!-- Nav menu with focusable links (first in header) -->
<nav class="site-nav nav-menu" id="site-nav" aria-label="Main Navigation">
  <ul class="nav-list nav-links" id="nav-menu">
    <li><a href="#hero" class="nav-link active">Home</a></li>
    ...
    <li><a href="#contact" class="nav-link">Contact</a></li>
  </ul>
</nav>

<!-- Action controls (after nav menu) -->
<div class="header-controls nav-actions">
  <button id="theme-toggle" class="theme-toggle-btn" ...>...</button>
  <button id="nav-toggle" class="nav-toggle-btn" ...>...</button>
</div>
```
**Physical DOM sequence**:
`.skip-link` -> `.site-logo` -> `#hero` (link 0) -> ... -> `#contact` (link 6) -> `#theme-toggle` -> `#nav-toggle` -> `<main id="main-content">`.

### 1.4 Defect in Focus Ring Definition in `script.js`
In `script.js` (lines 421–444):
```javascript
if (e.key === 'Tab' || e.keyCode === 9) {
  var focusables = getFocusableElements();
  if (focusables.length === 0) {
    e.preventDefault();
    return;
  }

  var ring = [navToggle].concat(focusables);
  var first = ring[0];
  var last = ring[ring.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
```
**Finding**:
- `ring` is defined as `[navToggle].concat(focusables)`. Thus `first = navToggle` and `last = focusables[focusables.length - 1]` (`#contact`).
- In physical DOM order, `#nav-toggle` is at the *end* of the header.
- When focus is on `#nav-toggle` and the user presses forward `Tab`: `activeElement !== last` (since `#nav-toggle !== #contact`). The browser's default behavior moves focus forward to `<main id="main-content">`, leaking out of the modal drawer.
- When focus is on `#hero` (`focusables[0]`) and the user presses reverse `Shift + Tab`: `activeElement !== first` (since `#hero !== #nav-toggle`). The browser's default behavior moves focus backward to `.site-logo` and `.skip-link`, leaking backwards.
- When `#contact` (`focusables[last]`) is focused and the user presses forward `Tab`: native DOM navigation would hit `#theme-toggle` (which is located between `<nav>` and `#nav-toggle`) unless intercepted and routed directly to `#nav-toggle`.

### 1.5 Reproduction in Reviewer's Adversarial Test & Prototype Verification
Executing `node .agents/teamwork/reviewer_m2_1/test_adversarial_m2.js` reproduced:
```
[FAIL] Adversarial Focus Trap: Forward Tab from navToggleBtn must wrap to first link
       Error: Tab forward on navToggleBtn must preventDefault() to avoid leaking to <main>
       false !== true

[FAIL] Adversarial Focus Trap: Shift+Tab on first link (#hero) must wrap to navToggleBtn
       Error: Shift+Tab on first link must preventDefault() to avoid leaking to .site-logo
       false !== true
```
Executing our independent verification script `.agents/teamwork/explorer_m2_it2_2/test_prototype.js` reproduced the exact same failure on current `script.js`, and `.agents/teamwork/explorer_m2_it2_2/test_prototype_patched.js` passed all 7 checks with zero errors.

---

## 2. Logic Chain

1. **Root Cause**:
   - The focus trap in `script.js` assumes `first = navToggle` precedes `focusables` in the DOM. However, by Observation 1.3, `<nav id="site-nav">` precedes `#nav-toggle` in the DOM tree.
   - Because of this inversion, when focus is on the DOM boundary elements (`navToggle` at the DOM end, or `#hero` at the DOM start), `document.activeElement` does not match the conditional checks in `script.js`, causing `preventDefault()` not to be called and focus to leak into the rest of the page.
   - Furthermore, between `#contact` (last in `navMenu`) and `#nav-toggle`, `<button id="theme-toggle">` exists. Without explicitly jumping between `#contact` and `#nav-toggle`, focus would leak to `#theme-toggle`.

2. **Test Harness Deficiency**:
   - By Observation 1.1 and 1.2, `test_script_unified.js` never tested `keydown` events because `global.document.addEventListener` was an empty stub that threw away all event registrations.
   - To make the test authentic and robust, `global.document` must register listeners in a dictionary and execute them via `dispatchEvent`, and synthetic `KeyboardEvent` objects must track `defaultPrevented`.

3. **Required Cyclic Invariant**:
   The full cyclic focus ring when the mobile drawer is open is:
   $$\text{navLinks}[0] \text{ (\#hero)} \longleftrightarrow \dots \longleftrightarrow \text{navLinks}[6] \text{ (\#contact)} \longleftrightarrow \text{navToggleBtn}$$
   - **Forward Tab Wrapping**:
     - When on `navToggleBtn` + `Tab` ($\text{shiftKey} = \text{false}$): must call `preventDefault()` and focus `navLinks[0]` (`#hero`).
     - When on `navLinks[6]` (`#contact`) + `Tab` ($\text{shiftKey} = \text{false}$): must call `preventDefault()` and focus `navToggleBtn` (skipping `#theme-toggle`).
   - **Backward Shift+Tab Wrapping**:
     - When on `navLinks[0]` (`#hero`) + `Shift+Tab` ($\text{shiftKey} = \text{true}$): must call `preventDefault()` and focus `navToggleBtn`.
     - When on `navToggleBtn` + `Shift+Tab` ($\text{shiftKey} = \text{true}$): must call `preventDefault()` and focus `navLinks[6]` (`#contact`) (skipping `#theme-toggle`).
   - **Inner Links Navigation**:
     - When on any intermediate link (e.g., `#about` or `#projects`) + `Tab` or `Shift+Tab`: must **NOT** call `preventDefault()`, allowing standard browser navigation without hijacking.
   - **Escape Key Dismissal**:
     - When drawer is open + `Escape`: must call `preventDefault()`, close the drawer (`isOpen() === false`, `body.menu-open` removed, `aria-expanded="false"`), and return focus to `navToggleBtn`.
     - When drawer is closed + `Escape`: must be a safe no-op (`preventDefault()` not called).
   - **Event Listener Teardown**:
     - Upon drawer closure, `handleKeyDown` must be detached from `document` so subsequent keystrokes on the page are unaffected.

---

## 3. Concrete Code Proposals

### A. Fix for `script.js` (lines 421–444)

Replace lines 421–444 in `script.js` with:

```javascript
      if (e.key === 'Tab' || e.keyCode === 9) {
        var focusables = getFocusableElements();
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        var firstLink = focusables[0];
        var lastLink = focusables[focusables.length - 1];

        if (e.shiftKey) {
          // Backward / reverse tabbing:
          // 1. From first nav link (#hero), wrap backwards to navToggle (last element in header DOM)
          if (document.activeElement === firstLink) {
            e.preventDefault();
            if (navToggle) navToggle.focus();
          }
          // 2. From navToggle, move backwards to last nav link (#contact)
          else if (document.activeElement === navToggle) {
            e.preventDefault();
            lastLink.focus();
          }
        } else {
          // Forward tabbing:
          // 1. From last nav link (#contact), advance forward to navToggle (skipping background theme-toggle)
          if (document.activeElement === lastLink) {
            e.preventDefault();
            if (navToggle) navToggle.focus();
          }
          // 2. From navToggle, wrap forward to first nav link (#hero)
          else if (document.activeElement === navToggle) {
            e.preventDefault();
            firstLink.focus();
          }
        }
      }
```

### B. Mock Infrastructure Upgrade in `test_script_unified.js`

In `worker_m2_1/test_script_unified.js`:

1. Replace lines 239–241 with active listener management:
```javascript
const docListeners = {};

global.document = {
  documentElement: docElem,
  body: bodyElem,
  activeElement: null,
  getElementById: (id) => {
    if (id === 'theme-toggle') return themeToggleBtn;
    if (id === 'nav-toggle') return navToggleBtn;
    if (id === 'site-nav') return navMenu;
    if (id === 'nav-menu') return navMenuUl;
    if (id === 'role-rotator') return roleRotator;
    if (id === 'contact-form') return contactForm;
    if (sectionIds.includes(id)) return new MockElement('section', id);
    return null;
  },
  querySelector: (sel) => {
    if (sel === '.theme-toggle-btn') return themeToggleBtn;
    if (sel === '.nav-toggle-btn') return navToggleBtn;
    if (sel === '.nav-menu') return navMenu;
    if (sel === '.role-rotator') return roleRotator;
    if (sel === '.project-filters') return filterBar;
    return null;
  },
  querySelectorAll: (sel) => {
    if (sel.includes('.filter-chip')) return filterChips;
    if (sel.includes('.project-card')) return projectCards;
    if (sel.includes('.nav-link')) return navLinks;
    if (sel.includes('.reveal-on-scroll')) return revealElements;
    if (sel.includes('.stat-number')) return statNumbers;
    return [];
  },
  addEventListener: (type, fn) => {
    if (!docListeners[type]) docListeners[type] = [];
    docListeners[type].push(fn);
  },
  removeEventListener: (type, fn) => {
    if (!docListeners[type]) return;
    docListeners[type] = docListeners[type].filter(f => f !== fn);
  },
  dispatchEvent: (event) => {
    const handlers = docListeners[event.type] || [];
    handlers.forEach(fn => fn(event));
  }
};

function createKeyEvent(key, options = {}) {
  let defaultPrevented = false;
  return {
    type: 'keydown',
    key: key,
    keyCode: options.keyCode || (key === 'Tab' ? 9 : (key === 'Escape' ? 27 : 0)),
    shiftKey: Boolean(options.shiftKey),
    altKey: Boolean(options.altKey),
    ctrlKey: Boolean(options.ctrlKey),
    metaKey: Boolean(options.metaKey),
    preventDefault() {
      defaultPrevented = true;
    },
    get defaultPrevented() {
      return defaultPrevented;
    }
  };
}
```

### C. Proposed Replacement for TEST 2 in `test_script_unified.js`

Replace lines 281–306 in `worker_m2_1/test_script_unified.js` with the following comprehensive, authentic unit tests:

```javascript
// -------------------------------------------------------------
// TEST 2: ACCESSIBLE MOBILE NAVIGATION DRAWER & FOCUS TRAP
// -------------------------------------------------------------
console.log('\n--- 2. Testing Accessible Mobile Navigation Drawer & Focus Trap ---');
Portfolio.MobileNavManager.init();

// 2.1 State Transitions, ARIA Attributes, and Body Scroll Lock
Portfolio.MobileNavManager.open();
assert.strictEqual(Portfolio.MobileNavManager.isOpen(), true, 'Drawer should be open');
assert.strictEqual(navMenu.classList.contains('is-open'), true, 'navMenu must have is-open');
assert.strictEqual(navMenuUl.classList.contains('is-open'), true, 'navMenuUl must have is-open');
assert.strictEqual(bodyElem.classList.contains('menu-open'), true, 'body must have menu-open');
assert.strictEqual(navToggleBtn.getAttribute('aria-expanded'), 'true');
assert.strictEqual(navToggleBtn.getAttribute('aria-label'), 'Close navigation menu');
assert.strictEqual(navMenu.getAttribute('aria-hidden'), 'false');
console.log('[PASS] 2.1 State transitions, ARIA attributes, and body scroll lock verified');

// 2.2 Tab Forward on navToggleBtn (Last in DOM) -> Wraps to First Link (#hero)
navToggleBtn.focus();
assert.strictEqual(global.document.activeElement, navToggleBtn, 'Active element must be navToggleBtn');
const tabFromToggle = createKeyEvent('Tab', { shiftKey: false });
global.document.dispatchEvent(tabFromToggle);
assert.strictEqual(tabFromToggle.defaultPrevented, true, 'Tab on navToggleBtn must call preventDefault() to prevent leakage to main');
assert.strictEqual(global.document.activeElement, navLinks[0], 'Focus must wrap to first nav link (#hero)');
console.log('[PASS] 2.2 Forward Tab on navToggleBtn wraps focus to first nav link (#hero) with preventDefault()');

// 2.3 Shift+Tab Backward on First Link (#hero) -> Wraps to navToggleBtn (Last in DOM)
navLinks[0].focus();
assert.strictEqual(global.document.activeElement, navLinks[0], 'Active element must be #hero');
const shiftTabFromFirst = createKeyEvent('Tab', { shiftKey: true });
global.document.dispatchEvent(shiftTabFromFirst);
assert.strictEqual(shiftTabFromFirst.defaultPrevented, true, 'Shift+Tab on first link must call preventDefault() to prevent backward leakage');
assert.strictEqual(global.document.activeElement, navToggleBtn, 'Focus must wrap backwards to navToggleBtn');
console.log('[PASS] 2.3 Backward Shift+Tab on first nav link (#hero) wraps focus to navToggleBtn with preventDefault()');

// 2.4 Tab Forward on Last Link (#contact) -> Advances to navToggleBtn
const lastLink = navLinks[navLinks.length - 1];
lastLink.focus();
assert.strictEqual(global.document.activeElement, lastLink, 'Active element must be #contact');
const tabFromLast = createKeyEvent('Tab', { shiftKey: false });
global.document.dispatchEvent(tabFromLast);
assert.strictEqual(tabFromLast.defaultPrevented, true, 'Tab on last link must call preventDefault() to skip background theme-toggle');
assert.strictEqual(global.document.activeElement, navToggleBtn, 'Focus must advance to navToggleBtn');
console.log('[PASS] 2.4 Forward Tab on last link (#contact) advances focus to navToggleBtn with preventDefault()');

// 2.5 Shift+Tab Backward on navToggleBtn -> Retreats to Last Link (#contact)
navToggleBtn.focus();
const shiftTabFromToggle = createKeyEvent('Tab', { shiftKey: true });
global.document.dispatchEvent(shiftTabFromToggle);
assert.strictEqual(shiftTabFromToggle.defaultPrevented, true, 'Shift+Tab on navToggleBtn must call preventDefault() to skip background theme-toggle');
assert.strictEqual(global.document.activeElement, lastLink, 'Focus must retreat backwards to last link (#contact)');
console.log('[PASS] 2.5 Backward Shift+Tab on navToggleBtn retreats focus to last link (#contact) with preventDefault()');

// 2.6 Normal Tab and Shift+Tab Between Inner Links (No Focus Hijacking)
navLinks[1].focus(); // '#about'
assert.strictEqual(global.document.activeElement, navLinks[1], 'Active element must be #about');
const innerTab = createKeyEvent('Tab', { shiftKey: false });
global.document.dispatchEvent(innerTab);
assert.strictEqual(innerTab.defaultPrevented, false, 'Forward Tab on inner link must NOT call preventDefault()');
assert.strictEqual(global.document.activeElement, navLinks[1], 'Focus must not be modified by focus trap on inner links');

const innerShiftTab = createKeyEvent('Tab', { shiftKey: true });
global.document.dispatchEvent(innerShiftTab);
assert.strictEqual(innerShiftTab.defaultPrevented, false, 'Backward Shift+Tab on inner link must NOT call preventDefault()');
assert.strictEqual(global.document.activeElement, navLinks[1], 'Focus must not be modified by focus trap on inner links');
console.log('[PASS] 2.6 Normal inner link Tab and Shift+Tab preserve native browser event propagation');

// 2.7 Escape Key Dismissal & Focus Restoration
navLinks[3].focus(); // '#skills'
assert.strictEqual(global.document.activeElement, navLinks[3], 'Active element must be #skills');
const escEvent = createKeyEvent('Escape', { keyCode: 27 });
global.document.dispatchEvent(escEvent);
assert.strictEqual(escEvent.defaultPrevented, true, 'Escape must call preventDefault()');
assert.strictEqual(Portfolio.MobileNavManager.isOpen(), false, 'Drawer must be closed after Escape');
assert.strictEqual(navMenu.classList.contains('is-open'), false, 'navMenu must not have is-open');
assert.strictEqual(bodyElem.classList.contains('menu-open'), false, 'body must not have menu-open');
assert.strictEqual(navToggleBtn.getAttribute('aria-expanded'), 'false');
assert.strictEqual(navToggleBtn.getAttribute('aria-label'), 'Open navigation menu');
assert.strictEqual(navMenu.getAttribute('aria-hidden'), 'true');
assert.strictEqual(global.document.activeElement, navToggleBtn, 'Focus must be restored to navToggleBtn');
console.log('[PASS] 2.7 Escape key dismisses drawer, locks DOM, and restores focus to navToggleBtn');

// 2.8 Escape Key on Closed Drawer (No-Op Guard)
const closedEscEvent = createKeyEvent('Escape', { keyCode: 27 });
global.document.dispatchEvent(closedEscEvent);
assert.strictEqual(closedEscEvent.defaultPrevented, false, 'Escape on closed drawer must not call preventDefault()');
console.log('[PASS] 2.8 Escape key on closed drawer is a safe no-op');

// 2.9 Keydown Listener Cleanup After Drawer Close
const postCloseTab = createKeyEvent('Tab', { shiftKey: false });
global.document.dispatchEvent(postCloseTab);
assert.strictEqual(postCloseTab.defaultPrevented, false, 'Tab key after drawer close must not be intercepted');
console.log('[PASS] 2.9 Keydown listener successfully detached upon drawer closure');
```

---

## 4. Caveats

- Node.js synthetic testing tests JS-level event interceptors and assertions (`preventDefault()`, `activeElement`). Native browser default focus progression between inner elements (e.g. from `#about` to `#projects`) is executed by the browser engine; in unit tests, verifying that `preventDefault()` is **not** called on inner elements correctly guarantees that browser native focus movement is not obstructed.
- Touch gesture events (e.g. touch swipe to close) are handled via CSS pointer events and media queries and are not part of keyboard navigation.
- No other caveats.

---

## 5. Conclusion

1. The critical defect in `MobileNavManager` (`script.js` lines 428–444) is the inversion of physical DOM order and failure to guard the boundary between `#contact` and `#nav-toggle` against leakage into `#theme-toggle` and `<main>`.
2. The testing blind spot in `worker_m2_1/test_script_unified.js` stemmed from `global.document.addEventListener: () => {}`, which prevented any synthetic keyboard event from reaching `handleKeyDown`.
3. The proposed 9-point unit test suite and event bus mock completely close this verification gap. When executed against the current `script.js`, it reliably fails (reproducing the reviewer's finding), and against the fixed code, all 9 checks pass cleanly and deterministically.
4. Implementing these edits in `script.js` and `test_script_unified.js` will resolve Reviewer `reviewer_m2_1`'s `REQUEST_CHANGES` verdict and allow Milestone 2 to achieve an unassailable `PASS`.

---

## 6. Verification Method

To independently verify these findings:

1. **Verify Prototype Failure on Current `script.js`**:
   ```powershell
   node .agents/teamwork/explorer_m2_it2_2/test_prototype.js
   ```
   *Expected Result*: Demonstrates the exact failure on `navToggleBtn` and `#hero` wrapping (`false !== true`).

2. **Verify Prototype Pass on Patched Logic**:
   ```powershell
   node .agents/teamwork/explorer_m2_it2_2/test_prototype_patched.js
   ```
   *Expected Result*: Exits 0, reporting all 7 checks passed.

3. **Verify Proposed Section 2 Implementation**:
   ```powershell
   node .agents/teamwork/explorer_m2_it2_2/test_proposed_unified_section2.js
   ```
   *Expected Result*: Exits 0, reporting:
   `[ALL MODULE 2 UNIT TESTS PASSED SUCCESSFULLY]` (9/9 sub-checks passed).

4. **Verify Adversarial Suite**:
   ```powershell
   node .agents/teamwork/reviewer_m2_1/test_adversarial_m2.js
   ```
   *Expected Result*: Once `script.js` is patched with Section 3.A, `test_adversarial_m2.js` passes 20/20 checks with exit code 0.
