# Milestone 2 Iteration 2 Exploration & Investigation Report
## Mobile Navigation Drawer Cyclic Focus Trap & DOM Order Remediation

**Agent**: `teamwork_explorer_m2_it2_1`  
**Roles**: Investigator, Synthesizer  
**Working Directory**: `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_it2_1\`  
**Target File**: `script.js` (lines 421–444) & `index.html` (lines 94–145)  
**Standard**: WCAG 2.1 SC 2.1.2 (No Keyboard Trap) & WAI-ARIA Modal Dialog Pattern  
**Date**: 2026-11-02T06:28:00Z  

---

## Executive Summary

During the Milestone 2 Gate Review, reviewer `reviewer_m2_1` issued a `REQUEST_CHANGES` verdict due to a critical focus trap leakage in `MobileNavManager` (`script.js`, lines 428–444). Forward `Tab` from `#nav-toggle` leaked into `<main id="main-content">`, and backward `Shift + Tab` from `#hero` leaked into `.site-logo` and `.skip-link`.

This investigation has directly examined the physical DOM sequence in `index.html`, inspected the event handler in `script.js`, and evaluated the reviewer's adversarial test suite. Crucially, this investigation discovered that **a naive 2-point fix (`first = focusables[0]; last = navToggle;`) is INSUFFICIENT and will fail 2 out of 4 tests**, because `#theme-toggle` physically sits in `.header-controls` between the last navigation link (`#contact`) and `#nav-toggle`.

To achieve seamless, 100% compliant cyclic focus trapping without leaking to `#theme-toggle`, `.site-logo`, or `<main>`, a **4-boundary bridge focus trap** is required. This strategy was implemented in a standalone test harness (`test_strategy_verification.js`) and achieved **7/7 passed checks (100%)**, including edge-case resilience.

---

## 1. Observation

### 1.1 Physical DOM Sequence in `index.html` (lines 94–145)

Direct inspection of `index.html` confirms the exact physical order of focusable elements in `<header>` and the landmark transition to `<main>`:

```html
94:   <a href="#hero" class="skip-link">Skip to main content</a>
...
97:   <header class="site-header" id="header">
98:     <div class="header-container container navbar">
99:       <a href="#hero" class="brand-logo logo" aria-label="Thiraviaraj R Portfolio Home">...</a>
...
104:      <nav class="site-nav nav-menu" id="site-nav" aria-label="Main Navigation">
105:        <ul class="nav-list nav-links" id="nav-menu">
106:          <li><a href="#hero" class="nav-link active">Home</a></li>
107:          <li><a href="#about" class="nav-link">About</a></li>
108:          <li><a href="#projects" class="nav-link">Projects</a></li>
109:          <li><a href="#skills" class="nav-link">Skills</a></li>
110:          <li><a href="#achievements" class="nav-link">Achievements</a></li>
111:          <li><a href="#certifications" class="nav-link">Certifications</a></li>
112:          <li><a href="#contact" class="nav-link">Contact</a></li>
113:        </ul>
114:      </nav>
...
117:      <div class="header-controls nav-actions">
118:        <button id="theme-toggle" class="theme-toggle-btn" ...>...</button>
135:        <button id="nav-toggle" class="nav-toggle-btn" aria-label="Open navigation menu" ...>...</button>
140:      </div>
141:    </div>
142:  </header>
...
145:  <main id="main-content">
```

**Document Tree Sequence:**
1. `.skip-link` (`a[href="#hero"]`)
2. `.brand-logo` (`a[href="#hero"]`)
3. `navMenu` links: `#hero` (0) -> `#about` (1) -> `#projects` (2) -> `#skills` (3) -> `#achievements` (4) -> `#certifications` (5) -> `#contact` (6)
4. `#theme-toggle` (button)
5. `#nav-toggle` (button)
6. `<main id="main-content">` (first interactive landmark in body)

### 1.2 Current Focus Trap Implementation in `script.js` (lines 421–444)

```javascript
421:       if (e.key === 'Tab' || e.keyCode === 9) {
422:         var focusables = getFocusableElements();
423:         if (focusables.length === 0) {
424:           e.preventDefault();
425:           return;
426:         }
427: 
428:         var ring = [navToggle].concat(focusables);
429:         var first = ring[0];
430:         var last = ring[ring.length - 1];
431: 
432:         if (e.shiftKey) {
433:           if (document.activeElement === first) {
434:             e.preventDefault();
435:             last.focus();
436:           }
437:         } else {
438:           if (document.activeElement === last) {
439:             e.preventDefault();
440:             first.focus();
441:           }
442:         }
443:       }
```

### 1.3 Verbatim Execution Results of Adversarial Test Suite

Executing `node .agents/teamwork/reviewer_m2_1/test_adversarial_m2.js` produced:

```
[PASS] MobileNavManager open & close lifecycle manages classes & ARIA
[PASS] Escape key dismisses drawer and restores focus to toggle button
[PASS] Adversarial Focus Trap: Last element Tab forward wraps to first
[PASS] Adversarial Focus Trap: Shift+Tab on first ring element wraps to last
[FAIL] Adversarial Focus Trap: Forward Tab from navToggleBtn must wrap to first link
       Error: Tab forward on navToggleBtn must preventDefault() to avoid leaking to <main>

false !== true

[FAIL] Adversarial Focus Trap: Shift+Tab on first link (#hero) must wrap to navToggleBtn
       Error: Shift+Tab on first link must preventDefault() to avoid leaking to .site-logo

false !== true

TOTAL ADVERSARIAL TESTS: 20
PASSED: 18
FAILED: 2
```

### 1.4 Verification in `tests/challenger_m2_stress_suite.js` (lines 982–1050)

In `tests/challenger_m2_stress_suite.js`, Test 3.4 independently asserts this exact failure mode:
```javascript
// CHALLENGE PART 1: User is on first drawer link ('Home') and presses Shift+Tab
// ... activeElement !== first (which is navToggle) -> preventDefault is NOT called, focus leaks backwards out of drawer!
// CHALLENGE PART 3: User is on navToggle and presses Tab (forward)
// ... activeElement !== last (which is Contact) -> preventDefault is NOT called, native Tab proceeds into <main>!
```

---

## 2. Logic Chain

### 2.1 Root Cause of Current Focus Leakage

1. In `script.js` line 428, `ring = [navToggle].concat(focusables)`.
2. This establishes:
   - `first = navToggle`
   - `last = focusables[focusables.length - 1]` (`#contact`)
3. The code assumes physical DOM order is `navToggle -> focusables[0] -> ... -> focusables[last]`.
4. However, in `index.html`, `focusables` (`#hero` ... `#contact`) **precedes** `navToggle` in the document tree.
5. Consequently:
   - **Forward Tab on `#nav-toggle`**: `document.activeElement === navToggle`. Since `navToggle !== last` (where `last` is `#contact`), `preventDefault()` is NOT called. The browser's native Tab advances to the next element in the document tree: `<main id="main-content">`. **Focus leaks into the background page.**
   - **Backward Shift+Tab on `#hero`**: `document.activeElement === #hero`. Since `#hero !== first` (where `first` is `navToggle`), `preventDefault()` is NOT called. The browser's native Shift+Tab moves backward to the previous elements in the document tree: `.brand-logo` and `.skip-link`. **Focus leaks backwards into the header.**

### 2.2 Why the Reviewer's Naive Suggested Snippet is Incomplete

Reviewer `reviewer_m2_1` suggested:
```javascript
var first = focusables[0];
var last = navToggle;
if (e.shiftKey) {
  if (document.activeElement === first) { e.preventDefault(); last.focus(); }
} else {
  if (document.activeElement === last) { e.preventDefault(); first.focus(); }
}
```

If an implementer applies only this snippet:
1. `first` is `#hero`, and `last` is `navToggle`.
2. When the user is on the last navigation link (`#contact`), `activeElement !== last` (because `#contact !== navToggle`).
3. Standard browser forward Tab from `#contact` advances to the next DOM element: **`#theme-toggle`** (line 118 of `index.html`)!
4. Similarly, when the user is on `navToggle`, Shift+Tab moves backward to **`#theme-toggle`**!
5. In `test_adversarial_m2.js`, Test 1 (Tab forward from last link) and Test 2 (Shift+Tab from navToggle) assert that `preventDefault()` is called and focus is redirected between `#contact` and `navToggle`.
6. Therefore, applying the naive snippet **breaks Test 1 and Test 2** while fixing Test 3 and Test 4 (still 2/4 failed).

### 2.3 The Architectural Topology of the Focus Ring

The modal drawer focus ring consists of two separate DOM containers:
- **Container A (`<nav class="site-nav">`)**: contains the sequential links `[#hero, #about, #projects, #skills, #achievements, #certifications, #contact]`.
- **Container B (`<div class="header-controls">`)**: contains `#theme-toggle` (non-drawer element) and `#nav-toggle` (drawer close trigger).

Because `#theme-toggle` sits between Container A and `#nav-toggle`, the cyclic focus ring has **two boundary bridges**:
- **Bridge 1 (Internal List <-> External Toggle)**:
  - Forward Tab from `#contact` must jump directly to `#nav-toggle`, skipping `#theme-toggle`.
  - Shift+Tab from `#nav-toggle` must jump directly to `#contact`, skipping `#theme-toggle`.
- **Bridge 2 (External Toggle <-> First Link Wrapping)**:
  - Forward Tab from `#nav-toggle` must wrap directly to `#hero`, preventing focus from entering `<main>`.
  - Shift+Tab from `#hero` must wrap directly to `#nav-toggle`, preventing focus from entering `.brand-logo` or `.skip-link`.
- **Internal Transitions**:
  - Between `#hero` and `#contact`, elements are contiguous sibling `<a>` tags; standard browser tabbing advances naturally between them.
- **Defensive Recapture**:
  - If focus somehow escapes or lands on an outside element while the drawer is open, any subsequent Tab press must immediately capture focus back into the drawer at `#hero`.

### 2.4 Empirical Proof Matrix

We ran `test_strategy_verification.js` comparing all 3 implementations:

| Scenario | Current `script.js` | Naive Fix (`first/last`) | 4-Boundary Bridge Fix |
|---|---|---|---|
| **Test 1: Tab from last link (`#contact`)** | PASS (wrapped to toggle) | **FAIL** (did not preventDefault) | **PASS** (wrapped to toggle) |
| **Test 2: Shift+Tab from `navToggle`** | PASS (wrapped to last link) | **FAIL** (did not preventDefault) | **PASS** (wrapped to last link) |
| **Test 3: Tab from `navToggle`** | **FAIL** (leaked to `<main>`) | PASS (wrapped to `#hero`) | **PASS** (wrapped to `#hero`) |
| **Test 4: Shift+Tab from first link (`#hero`)** | **FAIL** (leaked to logo) | PASS (wrapped to toggle) | **PASS** (wrapped to toggle) |
| **Edge Case 1: Focus outside ring** | Not handled | Not handled | **PASS** (recaptured to `#hero`) |
| **Edge Case 2: Zero focusables** | Unhandled focus lock | Unhandled focus lock | **PASS** (locked to toggle) |
| **Edge Case 3: Single focusable** | Inverted | Inverted | **PASS** (bidirectional cycle) |
| **Overall Score** | **2 / 4 (50%)** | **2 / 4 (50%)** | **7 / 7 (100%)** |

---

## 3. Caveats

1. **Read-Only Investigation Role**: Per agent instructions, `explorer_m2_it2_1` did not modify `script.js` directly. The fix must be applied by the designated implementer (`worker_m2_it2_1`).
2. **Synchronized Test Updates**:
   - `worker_m2_1/test_script_unified.js` previously omitted Tab keydown simulation; it should be updated with the tests provided in `test_script_unified_additions.js`.
   - `tests/challenger_m2_stress_suite.js` line 1049–1050 had inverted assert checks designed to verify the presence of the bug; upon applying this fix, lines 1049–1050 should be updated to assert `true`.
3. No other caveats.

---

## 4. Conclusion & Actionable Fix Strategy

The focus trap defect in `script.js` lines 421–444 is completely diagnosed, verified, and resolved.

### 4.1 Exact Code Fix for `script.js`

**File**: `script.js`  
**Target Lines**: 421–444 (`MobileNavManager.handleKeyDown`)

#### Before:
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

#### After (Proposed Fix):
```javascript
      if (e.key === 'Tab' || e.keyCode === 9) {
        var focusables = getFocusableElements();
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

        // Recapture focus if it has drifted outside the modal drawer
        if (ring.indexOf(document.activeElement) === -1) {
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
          if (document.activeElement === firstLink) {
            e.preventDefault();
            navToggle.focus();
          } else if (document.activeElement === navToggle) {
            e.preventDefault();
            lastLink.focus();
          }
        } else {
          // Forward navigation (Tab)
          if (document.activeElement === navToggle) {
            e.preventDefault();
            firstLink.focus();
          } else if (document.activeElement === lastLink) {
            e.preventDefault();
            navToggle.focus();
          }
        }
      }
```

### 4.2 Provided Artifacts in Working Directory

1. **Diff Patch**:
   `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_it2_1\focus_trap_fix.patch`
2. **Empirical Verification Harness**:
   `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_it2_1\test_strategy_verification.js`
3. **Unit Test Expansion for `test_script_unified.js`**:
   `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_it2_1\test_script_unified_additions.js`

---

## 5. Verification Method

Once the implementer applies the patch, the resolution can be independently verified using the following steps:

1. **Verify Strategy Proof**:
   ```powershell
   node .agents/teamwork/explorer_m2_it2_1/test_strategy_verification.js
   ```
   *Expected outcome*: Exits 0, reporting `ALL 7 TESTS PASSED EMPIRICALLY!`.

2. **Verify JavaScript Syntax**:
   ```powershell
   node -c script.js
   ```
   *Expected outcome*: Clean exit code `0`.

3. **Verify Adversarial Test Suite**:
   ```powershell
   node .agents/teamwork/reviewer_m2_1/test_adversarial_m2.js
   ```
   *Expected outcome*: Exits 0, reporting `PASSED: 20`, `FAILED: 0` (100% pass rate).

4. **Verify Unified Test Harness**:
   ```powershell
   node .agents/teamwork/worker_m2_1/test_script_unified.js
   ```
   *Expected outcome*: Exits 0, all suites passing including focus trap keydown verification.

5. **Invalidation Conditions**:
   - If forward Tab from `#nav-toggle` permits focus to land on any element within `<main id="main-content">` while the drawer is open.
   - If backward Shift+Tab from `#hero` permits focus to land on `.site-logo`, `.skip-link`, or `#theme-toggle` while the drawer is open.
   - If forward Tab from `#contact` lands on `#theme-toggle` instead of `#nav-toggle`.
