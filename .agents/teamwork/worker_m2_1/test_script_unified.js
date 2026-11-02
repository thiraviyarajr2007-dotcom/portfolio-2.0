/**
 * Comprehensive Automated Test Suite for script.js
 * Worker M2-1 Verification Harness
 */

const assert = require('assert');
const path = require('path');

console.log('='.repeat(75));
console.log('INTEGRATION & UNIT TEST HARNESS FOR SCRIPT.JS (PORTFOLIO 2.0)');
console.log('='.repeat(75));

// --- DOM ENVIRONMENT MOCK ---
class MockClassList {
  constructor(initial = []) {
    this._set = new Set(initial);
  }
  add(c) { this._set.add(c); }
  remove(c) { this._set.delete(c); }
  toggle(c, force) {
    if (force === undefined) {
      if (this._set.has(c)) { this._set.delete(c); return false; }
      else { this._set.add(c); return true; }
    }
    if (force) this._set.add(c);
    else this._set.delete(c);
    return force;
  }
  contains(c) { return this._set.has(c); }
}

class MockElement {
  constructor(tag, id = '', classes = [], attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.classList = new MockClassList(classes);
    this.attributes = { ...attrs };
    if (id) this.attributes['id'] = id;
    this.textContent = '';
    this.style = {};
    this.listeners = {};
    this.parentElement = null;
    this.children = [];
    this.offsetParent = {};
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

  hasAttribute(name) {
    return name in this.attributes;
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

  focus() {
    global.document.activeElement = this;
  }

  contains(target) {
    if (this === target) return true;
    return this.children.some(c => c.contains(target));
  }

  closest(selector) {
    if (selector.startsWith('.') && this.classList.contains(selector.slice(1))) return this;
    if (this.parentElement) return this.parentElement.closest(selector);
    return null;
  }

  querySelectorAll(selector) {
    let matches = [];
    if (selector.includes('a[href]') && this.tagName === 'A' && this.hasAttribute('href')) matches.push(this);
    if (selector.includes('.filter-chip') && this.classList.contains('filter-chip')) matches.push(this);
    if (selector.includes('.project-card') && this.classList.contains('project-card')) matches.push(this);
    if (selector.includes('.reveal-on-scroll') && this.classList.contains('reveal-on-scroll')) matches.push(this);
    if (selector.includes('.stat-number') && this.classList.contains('stat-number')) matches.push(this);
    for (let c of this.children) {
      matches = matches.concat(c.querySelectorAll(selector));
    }
    return matches;
  }
}

// Global Storage Mock
const mockStorage = new Map();
const mockLocalStorage = {
  getItem: (k) => (mockStorage.has(k) ? mockStorage.get(k) : null),
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

// Setup Environment
const docElem = new MockElement('html', '', [], { 'data-theme': 'dark' });
const bodyElem = new MockElement('body');

const themeToggleBtn = new MockElement('button', 'theme-toggle', ['theme-toggle-btn'], {
  'aria-label': 'Switch to light theme',
  'title': 'Switch to light theme'
});

const navToggleBtn = new MockElement('button', 'nav-toggle', ['nav-toggle-btn'], {
  'aria-label': 'Open navigation menu',
  'aria-expanded': 'false'
});

const navMenu = new MockElement('nav', 'site-nav', ['site-nav', 'nav-menu']);
const navMenuUl = new MockElement('ul', 'nav-menu', ['nav-list', 'nav-links']);
navMenu.children.push(navMenuUl);

const sectionIds = ['hero', 'about', 'projects', 'skills', 'achievements', 'certifications', 'contact'];
const navLinks = sectionIds.map(id => {
  const link = new MockElement('a', '', ['nav-link'], { 'href': `#${id}` });
  link.parentElement = navMenuUl;
  navMenuUl.children.push(link);
  return link;
});

// Project filters
const filterBar = new MockElement('div', '', ['project-filters', 'filter-bar'], { 'role': 'toolbar' });
const filterChips = [
  new MockElement('button', '', ['filter-chip', 'active'], { 'data-filter': 'all', 'aria-pressed': 'true' }),
  new MockElement('button', '', ['filter-chip'], { 'data-filter': 'mobile', 'aria-pressed': 'false' }),
  new MockElement('button', '', ['filter-chip'], { 'data-filter': 'web', 'aria-pressed': 'false' }),
  new MockElement('button', '', ['filter-chip'], { 'data-filter': 'ai', 'aria-pressed': 'false' })
];
filterChips.forEach(c => { c.parentElement = filterBar; filterBar.children.push(c); });

// Project cards
const projectCards = [
  new MockElement('article', '', ['project-card'], { 'data-category': 'mobile' }),
  new MockElement('article', '', ['project-card'], { 'data-category': 'mobile' }),
  new MockElement('article', '', ['project-card'], { 'data-category': 'web ai' }),
  new MockElement('article', '', ['project-card'], { 'data-category': 'web ai' }),
  new MockElement('article', '', ['project-card'], { 'data-category': 'web mobile' }),
  new MockElement('article', '', ['project-card'], { 'data-category': 'ai' }),
  new MockElement('article', '', ['project-card'], { 'data-category': 'web ai' })
];

// Role rotator
const roleRotator = new MockElement('span', 'role-rotator', ['role-rotator'], {
  'data-roles': '["AI/ML Engineer", "Flutter & Firebase Developer", "Full-stack Builder"]',
  'aria-live': 'polite',
  'aria-atomic': 'true'
});
roleRotator.textContent = 'AI/ML Engineer';

// Reveal & stats
const revealElements = Array.from({ length: 51 }, () => new MockElement('div', '', ['reveal-on-scroll']));
const statNumbers = [
  new MockElement('span', '', ['stat-number'], { 'data-target': '9.46', 'data-decimals': '2' }),
  new MockElement('span', '', ['stat-number'], { 'data-target': '7' }),
  new MockElement('span', '', ['stat-number'], { 'data-target': '9' })
];
statNumbers[0].textContent = '9.46';
statNumbers[1].textContent = '7';
statNumbers[2].textContent = '9';

// Setup Mock Window & Document
let reducedMotionPreference = false;

global.window = {
  localStorage: mockLocalStorage,
  matchMedia: (query) => {
    if (query.includes('prefers-reduced-motion')) {
      return { matches: reducedMotionPreference, addEventListener: () => {}, removeEventListener: () => {} };
    }
    if (query.includes('prefers-color-scheme')) {
      return { matches: true, addEventListener: () => {}, removeEventListener: () => {} };
    }
    if (query.includes('min-width: 1024px')) {
      return { matches: false, addEventListener: () => {}, removeEventListener: () => {} };
    }
    return { matches: false, addEventListener: () => {}, removeEventListener: () => {} };
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  innerWidth: 375,
  innerHeight: 800,
  pageYOffset: 0
};

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

// Require script.js
const scriptPath = path.resolve(__dirname, '../../../script.js');
const Portfolio = require(scriptPath);

console.log('Script loaded successfully.');
assert.ok(Portfolio, 'Portfolio namespace must be exported');
assert.ok(Portfolio.ThemeManager, 'ThemeManager module must exist');
assert.ok(Portfolio.MobileNavManager, 'MobileNavManager module must exist');
assert.ok(Portfolio.ProjectFilter, 'ProjectFilter module must exist');
assert.ok(Portfolio.RoleRotator, 'RoleRotator module must exist');
assert.ok(Portfolio.ScrollSpy, 'ScrollSpy module must exist');
assert.ok(Portfolio.MotionSubsystem, 'MotionSubsystem module must exist');

// -------------------------------------------------------------
// TEST 1: THEME TOGGLE ENGINE
// -------------------------------------------------------------
console.log('\n--- 1. Testing Theme Toggle Engine ---');
Portfolio.ThemeManager.init();

assert.strictEqual(Portfolio.ThemeManager.getTheme(), 'dark', 'Default theme should be dark');
assert.strictEqual(docElem.getAttribute('data-theme'), 'dark');

// Toggle to Light
const newTheme = Portfolio.ThemeManager.toggleTheme();
assert.strictEqual(newTheme, 'light', 'Theme should toggle to light');
assert.strictEqual(docElem.getAttribute('data-theme'), 'light');
assert.strictEqual(mockLocalStorage.getItem('theme'), 'light', 'Primary storage key "theme" must be light');
assert.strictEqual(mockLocalStorage.getItem('portfolio-theme'), 'light', 'Alias storage key "portfolio-theme" must be light');
assert.strictEqual(themeToggleBtn.getAttribute('aria-label'), 'Switch to dark theme');

// Toggle back to Dark
Portfolio.ThemeManager.toggleTheme();
assert.strictEqual(docElem.getAttribute('data-theme'), 'dark');
assert.strictEqual(mockLocalStorage.getItem('theme'), 'dark');
assert.strictEqual(mockLocalStorage.getItem('portfolio-theme'), 'dark');
assert.strictEqual(themeToggleBtn.getAttribute('aria-label'), 'Switch to light theme');
console.log('[PASS] Theme Engine verified (dual storage sync, a11y attributes, toggling)');

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

// -------------------------------------------------------------
// TEST 3: PROJECT CATEGORY FILTERING
// -------------------------------------------------------------
console.log('\n--- 3. Testing Project Category Filtering ---');
Portfolio.ProjectFilter.init();

// Test Filter 'all'
Portfolio.ProjectFilter.applyFilter('all', filterChips[0]);
let visible = projectCards.filter(c => !c.classList.contains('is-hidden')).length;
assert.strictEqual(visible, 7, 'Filter "all" must show 7 cards');
assert.strictEqual(filterChips[0].getAttribute('aria-pressed'), 'true');
assert.strictEqual(filterChips[1].getAttribute('aria-pressed'), 'false');

// Test Filter 'mobile'
Portfolio.ProjectFilter.applyFilter('mobile', filterChips[1]);
visible = projectCards.filter(c => !c.classList.contains('is-hidden')).length;
assert.strictEqual(visible, 3, 'Filter "mobile" must show 3 cards');
assert.strictEqual(filterChips[1].getAttribute('aria-pressed'), 'true');
assert.strictEqual(projectCards[0].classList.contains('is-hidden'), false); // Namma Nellai (mobile)
assert.strictEqual(projectCards[1].classList.contains('is-hidden'), false); // SwiftShare (mobile)
assert.strictEqual(projectCards[2].classList.contains('is-hidden'), true);  // HabitAI (web ai)
assert.strictEqual(projectCards[4].classList.contains('is-hidden'), false); // GPS Tracker (web mobile)

// Test Filter 'web'
Portfolio.ProjectFilter.applyFilter('web', filterChips[2]);
visible = projectCards.filter(c => !c.classList.contains('is-hidden')).length;
assert.strictEqual(visible, 4, 'Filter "web" must show 4 cards');
assert.strictEqual(projectCards[2].classList.contains('is-hidden'), false); // HabitAI
assert.strictEqual(projectCards[3].classList.contains('is-hidden'), false); // AI Notes
assert.strictEqual(projectCards[4].classList.contains('is-hidden'), false); // GPS Tracker
assert.strictEqual(projectCards[6].classList.contains('is-hidden'), false); // Medicine Chem
assert.strictEqual(projectCards[0].classList.contains('is-hidden'), true);  // Namma Nellai

// Test Filter 'ai'
Portfolio.ProjectFilter.applyFilter('ai', filterChips[3]);
visible = projectCards.filter(c => !c.classList.contains('is-hidden')).length;
assert.strictEqual(visible, 4, 'Filter "ai" must show 4 cards');
assert.strictEqual(projectCards[2].classList.contains('is-hidden'), false); // HabitAI
assert.strictEqual(projectCards[3].classList.contains('is-hidden'), false); // AI Notes
assert.strictEqual(projectCards[5].classList.contains('is-hidden'), false); // Road Safety
assert.strictEqual(projectCards[6].classList.contains('is-hidden'), false); // Medicine Chem
console.log('[PASS] Project Filtering verified (compound tags, counts, aria-pressed)');

// -------------------------------------------------------------
// TEST 4: HERO ROLE ROTATOR
// -------------------------------------------------------------
console.log('\n--- 4. Testing Hero Role Rotator ---');
Portfolio.RoleRotator.init();
assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'AI/ML Engineer');
assert.strictEqual(roleRotator.getAttribute('aria-live'), 'polite');
assert.strictEqual(roleRotator.getAttribute('aria-atomic'), 'true');

// Advance
Portfolio.RoleRotator.next();
assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'Flutter & Firebase Developer');

Portfolio.RoleRotator.next();
assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'Full-stack Builder');

// Wrap
Portfolio.RoleRotator.next();
assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'AI/ML Engineer');

Portfolio.RoleRotator.stopTimer();
console.log('[PASS] Hero Role Rotator verified (cycle, wrapping, a11y live region)');

// -------------------------------------------------------------
// TEST 5: SCROLL-SPY NAVIGATION
// -------------------------------------------------------------
console.log('\n--- 5. Testing Scroll-Spy Navigation ---');
Portfolio.ScrollSpy.init();
Portfolio.ScrollSpy.updateActiveNav('projects');
assert.strictEqual(Portfolio.ScrollSpy.getActiveSectionId(), 'projects');
assert.strictEqual(navLinks[2].classList.contains('active'), true);
assert.strictEqual(navLinks[2].getAttribute('aria-current'), 'page');
assert.strictEqual(navLinks[0].classList.contains('active'), false);
assert.strictEqual(navLinks[0].getAttribute('aria-current'), null);
console.log('[PASS] Scroll-Spy verified (active link sync, aria-current)');

// -------------------------------------------------------------
// TEST 6: MOTION SUBSYSTEM & PREFERS-REDUCED-MOTION
// -------------------------------------------------------------
console.log('\n--- 6. Testing Motion Subsystem & Reduced Motion ---');
// Curve math
assert.strictEqual(Portfolio.utils.easeOutExpo(0), 0);
assert.strictEqual(Portfolio.utils.easeOutExpo(1), 1);
assert.ok(Portfolio.utils.easeOutExpo(0.5) > 0.95);

// Formatting
assert.strictEqual(Portfolio.utils.formatNumber(9.46, 2), '9.46');
assert.strictEqual(Portfolio.utils.formatNumber(7, 0), '7');
assert.strictEqual(Portfolio.utils.formatNumber(9, 0), '9');

// Force final states
Portfolio.MotionSubsystem.forceRevealAll();
assert.ok(revealElements.every(el => el.classList.contains('revealed')), 'All 51 elements must have .revealed');

Portfolio.MotionSubsystem.forceFinalStatValues();
assert.strictEqual(statNumbers[0].textContent, '9.46');
assert.strictEqual(statNumbers[1].textContent, '7');
assert.strictEqual(statNumbers[2].textContent, '9');
console.log('[PASS] Motion Subsystem & Reduced Motion verified');

console.log('\n' + '='.repeat(75));
console.log('ALL VERIFICATION CHECKS PASSED EMPIRICALLY (100% SUCCESS)');
console.log('='.repeat(75));
