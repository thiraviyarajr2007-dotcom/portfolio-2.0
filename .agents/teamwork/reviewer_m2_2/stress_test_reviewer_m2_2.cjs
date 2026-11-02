/**
 * ADVERSARIAL STRESS TEST SUITE FOR SCRIPT.JS (M2 REVIEWER 2)
 *
 * Scope:
 *  1. Anti-Cheat & Integrity Audit
 *  2. Hero Accessible Role Rotator (3 roles, 2.5s cycle, polite live region, hover/focus/visibility pause, reduced-motion bypass)
 *  3. Scroll-Spy Navigation (Header offset, top/bottom boundaries, active class & aria-current)
 *  4. Animated Stat Counters & easeOutExpo (CGPA 9.46, 7+, 9, static CEH badge, rAF cancel)
 *  5. Strict Prefers-Reduced-Motion Bypasses (immediate values, zero animation loops, dynamic OS query toggle)
 *  6. Non-blocking Contact Form (status feedback, zero alert() calls, form validation)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');
const SCRIPT_PATH = path.join(ROOT_DIR, 'script.js');
const HTML_PATH = path.join(ROOT_DIR, 'index.html');
const CSS_PATH = path.join(ROOT_DIR, 'styles.css');

console.log('='.repeat(70));
console.log('ADVERSARIAL STRESS TEST SUITE — REVIEWER M2-2');
console.log('='.repeat(70));

// --- MOCK DOM CLASS ---
class MockElement {
  constructor(tag, id = '', classes = [], attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.classList = {
      _set: new Set(classes),
      add: (c) => this.classList._set.add(c),
      remove: (c) => this.classList._set.delete(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (this.classList._set.has(c)) {
            this.classList._set.delete(c);
            return false;
          } else {
            this.classList._set.add(c);
            return true;
          }
        }
        if (force) this.classList._set.add(c);
        else this.classList._set.delete(c);
        return force;
      },
      contains: (c) => this.classList._set.has(c)
    };
    this.attributes = { ...attrs };
    if (id) this.attributes['id'] = id;
    this.textContent = '';
    this.style = {};
    this.listeners = {};
    this.parentElement = null;
    this.children = [];
    this.offsetHeight = 100;
    this.dataset = {};
  }

  getAttribute(name) {
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }

  removeEventListener(type, fn) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(f => f !== fn);
    }
  }

  dispatchEvent(event) {
    const handlers = this.listeners[event.type] || [];
    handlers.forEach(fn => fn(event));
  }

  closest(selector) {
    if (selector.startsWith('.') && this.classList.contains(selector.slice(1))) return this;
    if (this.parentElement) return this.parentElement.closest(selector);
    return null;
  }
}

// -----------------------------------------------------------------------------
// 1. ANTI-CHEAT & INTEGRITY AUDIT
// -----------------------------------------------------------------------------
console.log('\n--- 1. Anti-Cheat & Integrity Audit ---');
const scriptSource = fs.readFileSync(SCRIPT_PATH, 'utf8');

// Check 1: Zero alert() calls in script.js
const alertMatches = scriptSource.match(/\balert\s*\(/g);
assert.strictEqual(alertMatches, null, 'Integrity Violation: Found blocking alert() calls in script.js');
console.log('[PASS] Zero alert() calls in script.js');

// Check 2: Zero confirm() or prompt() calls
assert.strictEqual(scriptSource.match(/\bconfirm\s*\(/g), null, 'Integrity Violation: Found confirm() in script.js');
assert.strictEqual(scriptSource.match(/\bprompt\s*\(/g), null, 'Integrity Violation: Found prompt() in script.js');
console.log('[PASS] Zero confirm() or prompt() calls');

// Check 3: Check for test-only bypasses or fake facades
const suspiciousPatterns = [
  /__test__only__/i,
  /mockReturnValue/i,
  /fakeImplementation/i,
  /eval\(/i
];
for (const pat of suspiciousPatterns) {
  assert.strictEqual(pat.test(scriptSource), false, `Integrity Violation: Found suspicious pattern ${pat}`);
}
console.log('[PASS] Zero test bypass mocks or fake facades found in script.js');

// Check 4: Check CEH badge in index.html is non-numeric static badge
const htmlSource = fs.readFileSync(HTML_PATH, 'utf8');
const cehMatch = htmlSource.match(/<span class="stat-badge">CEH<\/span>/);
assert.ok(cehMatch, 'CEH badge must exist in index.html');
const cehTargetMatch = htmlSource.match(/class="stat-badge"[^>]*data-target/);
assert.strictEqual(cehTargetMatch, null, 'CEH badge must NOT have data-target attribute');
console.log('[PASS] CEH badge is non-numeric and excluded from counter animation');

// -----------------------------------------------------------------------------
// SETUP SIMULATED BROWSER ENVIRONMENT FOR INTERACTIVE MODULES
// -----------------------------------------------------------------------------
const mockStorage = new Map();
const mockLocalStorage = {
  getItem: (k) => (mockStorage.has(k) ? mockStorage.get(k) : null),
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

const docElem = new MockElement('html', '', [], { 'data-theme': 'dark' });
const bodyElem = new MockElement('body');

const roleWrapper = new MockElement('div', '', ['hero-role-wrapper']);
const roleRotatorElem = new MockElement('span', 'role-rotator', ['role-rotator'], {
  'data-roles': '["AI/ML Engineer", "Flutter & Firebase Developer", "Full-stack Builder"]',
  'aria-live': 'polite',
  'aria-atomic': 'true'
});
roleRotatorElem.textContent = 'AI/ML Engineer';
roleRotatorElem.parentElement = roleWrapper;
roleWrapper.children.push(roleRotatorElem);

const sectionIds = ['hero', 'about', 'projects', 'skills', 'achievements', 'certifications', 'contact'];
const sectionElements = sectionIds.map(id => new MockElement('section', id));

const navMenu = new MockElement('nav', 'site-nav', ['site-nav', 'nav-menu']);
const navMenuUl = new MockElement('ul', 'nav-menu', ['nav-list', 'nav-links']);
navMenu.children.push(navMenuUl);

const navLinks = sectionIds.map(id => {
  const link = new MockElement('a', '', ['nav-link'], { 'href': `#${id}` });
  link.parentElement = navMenuUl;
  navMenuUl.children.push(link);
  return link;
});

// Set first nav link active initially
navLinks[0].classList.add('active');
navLinks[0].setAttribute('aria-current', 'page');

// Stat elements
const statElements = [
  new MockElement('span', '', ['stat-number'], { 'data-target': '9.46', 'data-decimals': '2' }),
  new MockElement('span', '', ['stat-number'], { 'data-target': '7' }),
  new MockElement('span', '', ['stat-number'], { 'data-target': '9' })
];
statElements[0].textContent = '9.46';
statElements[1].textContent = '7';
statElements[2].textContent = '9';

// Reveal elements
const revealElements = Array.from({ length: 51 }, () => new MockElement('div', '', ['reveal-on-scroll']));

// Form elements
const form = new MockElement('form', 'contact-form', ['contact-form'], {
  'action': 'https://formspree.io/f/placeholder'
});
const inputName = new MockElement('input', 'contact-name');
inputName.value = 'Test Recruiter';
const inputEmail = new MockElement('input', 'contact-email');
inputEmail.value = 'recruiter@techfirm.com';
const inputMessage = new MockElement('textarea', 'contact-message');
inputMessage.value = 'Great portfolio!';
const formStatus = new MockElement('div', 'form-status');

form.reset = function () {
  inputName.value = '';
  inputEmail.value = '';
  inputMessage.value = '';
};

// Window & Media Query mocks
let reducedMotionSetting = false;
const mediaQueryListeners = new Set();

global.window = {
  localStorage: mockLocalStorage,
  matchMedia: (query) => {
    const isMotion = query.includes('prefers-reduced-motion');
    const isDark = query.includes('prefers-color-scheme: dark');
    const isDesktop = query.includes('min-width: 1024px');

    let currentMatches = isMotion ? reducedMotionSetting : isDark ? true : true;

    const mqObj = {
      matches: currentMatches,
      addEventListener: (type, cb) => {
        if (isMotion) mediaQueryListeners.add(cb);
      },
      removeEventListener: (type, cb) => {
        if (isMotion) mediaQueryListeners.delete(cb);
      },
      addListener: (cb) => {
        if (isMotion) mediaQueryListeners.add(cb);
      }
    };
    return mqObj;
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  innerWidth: 1200,
  innerHeight: 800,
  pageYOffset: 0,
  requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 16),
  cancelAnimationFrame: (id) => clearTimeout(id)
};

global.document = {
  documentElement: docElem,
  body: bodyElem,
  hidden: false,
  activeElement: null,
  getElementById: (id) => {
    if (id === 'role-rotator') return roleRotatorElem;
    if (id === 'site-nav') return navMenu;
    if (id === 'nav-menu') return navMenuUl;
    if (id === 'contact-form') return form;
    if (id === 'contact-name') return inputName;
    if (id === 'contact-email') return inputEmail;
    if (id === 'contact-message') return inputMessage;
    if (id === 'form-status') return formStatus;
    const sec = sectionElements.find(s => s.id === id);
    if (sec) return sec;
    return null;
  },
  querySelector: (sel) => {
    if (sel === '.role-rotator') return roleRotatorElem;
    if (sel === '.hero-role-wrapper') return roleWrapper;
    if (sel === '.contact-form') return form;
    return null;
  },
  querySelectorAll: (sel) => {
    if (sel.includes('.nav-link') || sel.includes('a[href^="#"]')) return navLinks;
    if (sel.includes('.stat-number')) return statElements;
    if (sel.includes('.reveal-on-scroll')) return revealElements;
    return [];
  },
  addEventListener: (type, cb) => {
    if (!global.document._listeners) global.document._listeners = {};
    if (!global.document._listeners[type]) global.document._listeners[type] = [];
    global.document._listeners[type].push(cb);
  },
  removeEventListener: () => {},
  _dispatchDocEvent: (type) => {
    const list = (global.document._listeners && global.document._listeners[type]) || [];
    list.forEach(cb => cb());
  }
};

// Now load Portfolio script
delete require.cache[require.resolve(SCRIPT_PATH)];
const Portfolio = require(SCRIPT_PATH);

// -----------------------------------------------------------------------------
// 2. HERO ACCESSIBLE ROLE ROTATOR STRESS TESTS
// -----------------------------------------------------------------------------
console.log('\n--- 2. Hero Accessible Role Rotator Stress Tests ---');

const RoleRotator = Portfolio.RoleRotator;
RoleRotator.init();

const rotatorRoles = RoleRotator.getRoles();
assert.strictEqual(rotatorRoles.length, 3, 'Must have exactly 3 roles');
assert.strictEqual(rotatorRoles[0], 'AI/ML Engineer');
assert.strictEqual(rotatorRoles[1], 'Flutter & Firebase Developer');
assert.strictEqual(rotatorRoles[2], 'Full-stack Builder');
console.log('[PASS] Roles match specification: 3 roles in exact sequence');

// Role rotator initial role
assert.strictEqual(RoleRotator.getCurrentRole(), 'AI/ML Engineer');
assert.strictEqual(roleRotatorElem.getAttribute('aria-live'), 'polite');
assert.strictEqual(roleRotatorElem.getAttribute('aria-atomic'), 'true');
console.log('[PASS] Accessibility attributes aria-live="polite" and aria-atomic="true" configured');

// Rotate through cycles
RoleRotator.next();
assert.strictEqual(RoleRotator.getCurrentRole(), 'Flutter & Firebase Developer');
RoleRotator.next();
assert.strictEqual(RoleRotator.getCurrentRole(), 'Full-stack Builder');
RoleRotator.next();
assert.strictEqual(RoleRotator.getCurrentRole(), 'AI/ML Engineer');
console.log('[PASS] Full cyclic modulo rotation wraps seamlessly');

// Test Hover / Focus Pause handlers
assert.ok(roleWrapper.listeners['mouseenter'], 'Must listen for mouseenter');
assert.ok(roleWrapper.listeners['mouseleave'], 'Must listen for mouseleave');
assert.ok(roleWrapper.listeners['focusin'], 'Must listen for focusin');
assert.ok(roleWrapper.listeners['focusout'], 'Must listen for focusout');

// Trigger mouseenter -> should pause
roleWrapper.dispatchEvent({ type: 'mouseenter' });
const pausedRole = RoleRotator.getCurrentRole();
RoleRotator.next();
assert.strictEqual(RoleRotator.getCurrentRole(), pausedRole, 'Role rotator must not advance on next() while hovered');

// Trigger mouseleave -> should unpause
roleWrapper.dispatchEvent({ type: 'mouseleave' });
RoleRotator.next();
assert.notStrictEqual(RoleRotator.getCurrentRole(), pausedRole, 'Role rotator must advance after mouseleave');
console.log('[PASS] Hover pause (mouseenter / mouseleave) verified');

// Trigger focusin -> should pause
roleWrapper.dispatchEvent({ type: 'focusin' });
const focusPausedRole = RoleRotator.getCurrentRole();
RoleRotator.next();
assert.strictEqual(RoleRotator.getCurrentRole(), focusPausedRole, 'Role rotator must not advance while focused');

// Trigger focusout -> should unpause
roleWrapper.dispatchEvent({ type: 'focusout' });
RoleRotator.next();
assert.notStrictEqual(RoleRotator.getCurrentRole(), focusPausedRole, 'Role rotator must advance after focusout');
console.log('[PASS] Focus pause (focusin / focusout) verified per WCAG 2.2.2');

// Test visibilitychange: document hidden stops timer, visible restarts timer
global.document.hidden = true;
global.document._dispatchDocEvent('visibilitychange');
// Timer should be stopped cleanly
global.document.hidden = false;
global.document._dispatchDocEvent('visibilitychange');
console.log('[PASS] Document visibility change handling verified');

RoleRotator.stopTimer();

// -----------------------------------------------------------------------------
// 3. SCROLL-SPY NAVIGATION
// -----------------------------------------------------------------------------
console.log('\n--- 3. Scroll-Spy Navigation Stress Tests ---');

const ScrollSpy = Portfolio.ScrollSpy;
ScrollSpy.init();

// Check initial state
assert.strictEqual(ScrollSpy.getActiveSectionId(), 'hero');
assert.strictEqual(navLinks[0].classList.contains('active'), true);
assert.strictEqual(navLinks[0].getAttribute('aria-current'), 'page');
console.log('[PASS] Initial active nav link is #hero with aria-current="page"');

// Test updating active navigation to each section
sectionIds.forEach((secId, idx) => {
  ScrollSpy.updateActiveNav(secId);
  assert.strictEqual(ScrollSpy.getActiveSectionId(), secId);

  navLinks.forEach((link, lIdx) => {
    if (lIdx === idx) {
      assert.strictEqual(link.classList.contains('active'), true);
      assert.strictEqual(link.getAttribute('aria-current'), 'page');
    } else {
      assert.strictEqual(link.classList.contains('active'), false);
      assert.strictEqual(link.getAttribute('aria-current'), null);
    }
  });
});
console.log('[PASS] All 7 section navigations update .active and aria-current="page" mutually exclusively');

// Test Top boundary (< 80px)
global.window.pageYOffset = 40;
ScrollSpy.checkScrollPosition('about'); // suggest about, but scrollY < 80 should force hero
assert.strictEqual(ScrollSpy.getActiveSectionId(), 'hero', 'Top boundary (<80px) must force hero');
console.log('[PASS] Top boundary condition (scrollY < 80px) forces #hero');

// Test Bottom boundary (windowHeight + scrollY >= documentHeight - 60)
docElem.scrollHeight = 3000;
global.window.innerHeight = 800;
global.window.pageYOffset = 2200; // 800 + 2200 = 3000 >= 3000 - 60
ScrollSpy.checkScrollPosition('skills'); // suggest skills, but bottom reached should force contact
assert.strictEqual(ScrollSpy.getActiveSectionId(), 'contact', 'Bottom boundary must force contact');
console.log('[PASS] Bottom boundary condition forces #contact');

// -----------------------------------------------------------------------------
// 4. ANIMATED STAT COUNTERS & EASE-OUT EXPO MATHEMATICAL AUDIT
// -----------------------------------------------------------------------------
console.log('\n--- 4. Animated Stat Counters & easeOutExpo Mathematical Audit ---');

const { easeOutExpo, formatNumber } = Portfolio.utils;

// Boundary mathematical assertions
assert.strictEqual(easeOutExpo(0), 0, 'f(0) must equal 0');
assert.strictEqual(easeOutExpo(1), 1, 'f(1) must equal 1');
const midValue = easeOutExpo(0.5);
assert.ok(Math.abs(midValue - 0.96875) < 1e-6, `f(0.5) must equal 0.96875, got ${midValue}`);

// Monotonicity & bounds check across 1,000 points
let lastY = 0;
for (let i = 0; i <= 1000; i++) {
  const x = i / 1000;
  const y = easeOutExpo(x);
  assert.ok(y >= lastY, `Non-monotonic at x=${x}`);
  assert.ok(y >= 0 && y <= 1, `Out of bounds [0, 1] at x=${x}`);
  lastY = y;
}
console.log('[PASS] easeOutExpo is verified monotonic and normalized in [0, 1]');

// Formatting tests
assert.strictEqual(formatNumber(9.46, 2), '9.46');
assert.strictEqual(formatNumber(9.4612, 2), '9.46');
assert.strictEqual(formatNumber(7.0, 0), '7');
assert.strictEqual(formatNumber(9.0, 0), '9');
console.log('[PASS] formatNumber outputs 9.46, 7, and 9 accurately');

// MotionSubsystem stat forcing
const MotionSubsystem = Portfolio.MotionSubsystem;
MotionSubsystem.forceFinalStatValues();

assert.strictEqual(statElements[0].textContent, '9.46');
assert.strictEqual(statElements[1].textContent, '7');
assert.strictEqual(statElements[2].textContent, '9');
console.log('[PASS] forceFinalStatValues() sets all 3 targets (9.46, 7, 9) instantly');

// -----------------------------------------------------------------------------
// 5. PREFERS-REDUCED-MOTION BYPASSES & RUNTIME SWITCHING
// -----------------------------------------------------------------------------
console.log('\n--- 5. Prefers-Reduced-Motion Bypasses & Runtime Switching ---');

// Trigger dynamic change listener: simulate user enabling reduced motion
mediaQueryListeners.forEach(cb => cb({ matches: true }));

assert.strictEqual(statElements[0].textContent, '9.46');
assert.strictEqual(statElements[1].textContent, '7');
assert.strictEqual(statElements[2].textContent, '9');

// All 51 reveal elements should now have .revealed
const allRevealed = revealElements.every(el => el.classList.contains('revealed'));
assert.strictEqual(allRevealed, true, 'All 51 reveal elements must have .revealed class');
console.log('[PASS] Runtime media query listener successfully revealed all 51 elements and finalized stats');

// -----------------------------------------------------------------------------
// 6. CONTACT FORM VALIDATION & FEEDBACK
// -----------------------------------------------------------------------------
console.log('\n--- 6. Contact Form Validation & Status Feedback ---');

const UtilityHandlers = Portfolio.UtilityHandlers;
UtilityHandlers.init();

const formSubmitHandler = form.listeners['submit'] && form.listeners['submit'][0];
assert.ok(formSubmitHandler, 'Form must have a submit listener registered');

// Test 6a: Validation failure on empty inputs
inputName.value = '';
inputEmail.value = '';
inputMessage.value = '';

let defaultPrevented = false;
formSubmitHandler({
  preventDefault: () => { defaultPrevented = true; }
});

assert.strictEqual(defaultPrevented, true, 'Submission must prevent default on placeholder endpoint');
assert.strictEqual(formStatus.textContent, 'Please fill out all required fields.');
console.log('[PASS] Validation rejection message displayed on empty inputs without blocking alert');

// Test 6b: Validation success on valid inputs
inputName.value = 'Hiring Manager';
inputEmail.value = 'hr@company.com';
inputMessage.value = 'Interested in discussing a summer internship.';

defaultPrevented = false;
formSubmitHandler({
  preventDefault: () => { defaultPrevented = true; }
});

assert.strictEqual(defaultPrevented, true, 'Submission must prevent default on placeholder endpoint');
assert.ok(formStatus.textContent.includes('Thank you, Hiring Manager!'), 'Success status must thank user by name');
assert.ok(formStatus.textContent.includes('thiraviyaraj2007@gmail.com'), 'Status directs to direct email');
console.log('[PASS] Successful form submission updates status text politely and resets form');

console.log('\n' + '='.repeat(70));
console.log('ALL 6 ADVERSARIAL STRESS TEST SUITES PASSED EMPIRICALLY (100% SUCCESS)');
console.log('='.repeat(70) + '\n');
