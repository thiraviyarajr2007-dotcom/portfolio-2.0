/**
 * Independent Adversarial Audit & Verification Test Suite for script.js
 * Reviewer & Adversarial Critic: reviewer_m2_it2_2
 * Milestone: Milestone 2 Iteration 2
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('='.repeat(80));
console.log('INDEPENDENT ADVERSARIAL AUDIT & VERIFICATION — REVIEWER M2-IT2-2');
console.log('='.repeat(80));

// --- 1. MOCK ENVIRONMENT SETUP ---
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
    this.value = '';
    this.style = {};
    this.dataset = {};
    this.listeners = {};
    this.parentElement = null;
    this.children = [];
    this.offsetParent = {};
    this.offsetHeight = 100;
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

  reset() {
    this.value = '';
  }

  querySelectorAll(selector) {
    let matches = [];
    if (selector.includes('a[href]') && this.tagName === 'A' && this.hasAttribute('href')) matches.push(this);
    if (selector.includes('.filter-chip') && this.classList.contains('filter-chip')) matches.push(this);
    if (selector.includes('.project-card') && this.classList.contains('project-card')) matches.push(this);
    if (selector.includes('.reveal-on-scroll') && this.classList.contains('reveal-on-scroll')) matches.push(this);
    if (selector.includes('.stat-number') && this.classList.contains('stat-number')) matches.push(this);
    if (selector.includes('.nav-link') && this.classList.contains('nav-link')) matches.push(this);
    if (selector.includes('a[href^="#"]') && this.tagName === 'A' && (this.getAttribute('href') || '').startsWith('#')) matches.push(this);
    if (selector.includes('a') && this.tagName === 'A') matches.push(this);
    if (selector.includes('button') && this.tagName === 'BUTTON') matches.push(this);

    for (let c of this.children) {
      matches = matches.concat(c.querySelectorAll(selector));
    }
    return matches;
  }

  querySelector(selector) {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }
}

// Storage Mock
let storageFails = false;
const mockStorage = new Map();
const mockLocalStorage = {
  getItem: (k) => {
    if (storageFails) throw new Error('SecurityError: DOMException');
    return mockStorage.has(k) ? mockStorage.get(k) : null;
  },
  setItem: (k, v) => {
    if (storageFails) throw new Error('SecurityError: DOMException');
    mockStorage.set(k, String(v));
  },
  removeItem: (k) => {
    if (storageFails) throw new Error('SecurityError: DOMException');
    mockStorage.delete(k);
  },
  clear: () => mockStorage.clear()
};

// Build DOM representation matching index.html
const docElem = new MockElement('html', '', [], { 'data-theme': 'dark' });
const bodyElem = new MockElement('body');

const skipLink = new MockElement('a', '', ['skip-link'], { href: '#hero' });
const siteLogo = new MockElement('a', '', ['brand-logo', 'logo'], { href: '#hero' });

const headerControls = new MockElement('div', '', ['header-controls', 'nav-actions']);
const themeToggleBtn = new MockElement('button', 'theme-toggle', ['theme-toggle-btn'], {
  'aria-label': 'Switch to light theme',
  title: 'Switch to light theme'
});
const navToggleBtn = new MockElement('button', 'nav-toggle', ['nav-toggle-btn'], {
  'aria-label': 'Open navigation menu',
  'aria-expanded': 'false',
  'aria-controls': 'nav-menu'
});
headerControls.children.push(themeToggleBtn, navToggleBtn);
themeToggleBtn.parentElement = headerControls;
navToggleBtn.parentElement = headerControls;

const siteNav = new MockElement('nav', 'site-nav', ['site-nav', 'nav-menu'], {
  'aria-label': 'Main Navigation'
});
const navMenuUl = new MockElement('ul', 'nav-menu', ['nav-list', 'nav-links']);
siteNav.children.push(navMenuUl);
navMenuUl.parentElement = siteNav;

const sectionIds = ['hero', 'about', 'projects', 'skills', 'achievements', 'certifications', 'contact'];
const navLinks = sectionIds.map(id => {
  const link = new MockElement('a', '', ['nav-link'], { href: `#${id}` });
  link.parentElement = navMenuUl;
  navMenuUl.children.push(link);
  return link;
});

// Role Rotator
const heroRoleWrapper = new MockElement('div', '', ['hero-role-wrapper']);
const roleRotator = new MockElement('span', 'role-rotator', ['role-rotator'], {
  'aria-live': 'polite',
  'aria-atomic': 'true',
  'data-roles': '["AI/ML Engineer", "Flutter & Firebase Developer", "Full-stack Builder"]'
});
roleRotator.textContent = 'AI/ML Engineer';
heroRoleWrapper.children.push(roleRotator);
roleRotator.parentElement = heroRoleWrapper;

// Stat Numbers
const statCgpa = new MockElement('span', '', ['stat-number'], { 'data-target': '9.46', 'data-decimals': '2' });
const statProj = new MockElement('span', '', ['stat-number'], { 'data-target': '7' });
const badgeCeh = new MockElement('span', '', ['stat-badge']);
badgeCeh.textContent = 'CEH';
const statHack = new MockElement('span', '', ['stat-number'], { 'data-target': '9' });

// Project Filter Bar & Cards
const filterBar = new MockElement('div', '', ['project-filters', 'filter-bar'], { role: 'toolbar' });
const filterChips = [
  new MockElement('button', '', ['filter-chip', 'active'], { 'data-filter': 'all', 'aria-pressed': 'true' }),
  new MockElement('button', '', ['filter-chip'], { 'data-filter': 'mobile', 'aria-pressed': 'false' }),
  new MockElement('button', '', ['filter-chip'], { 'data-filter': 'web', 'aria-pressed': 'false' }),
  new MockElement('button', '', ['filter-chip'], { 'data-filter': 'ai', 'aria-pressed': 'false' })
];
filterChips.forEach(c => { c.parentElement = filterBar; filterBar.children.push(c); });

const projectCardsData = [
  { name: 'Namma Nellai', cat: 'mobile' },
  { name: 'SwiftShare', cat: 'mobile' },
  { name: 'HabitAI', cat: 'web ai' },
  { name: 'AI Notes & Productivity App', cat: 'web ai' },
  { name: 'Car Front Display GPS Tracker', cat: 'web mobile' },
  { name: 'Road Hazard Risk Classifier', cat: 'ai' },
  { name: 'Medicine Identification Platform', cat: 'web ai' }
];
const projectCards = projectCardsData.map(p => new MockElement('article', '', ['project-card', 'reveal-on-scroll'], { 'data-category': p.cat }));

// 51 Reveal Elements
const revealElements = Array.from({ length: 51 }, () => new MockElement('div', '', ['reveal-on-scroll']));

// Contact Form
const contactForm = new MockElement('form', 'contact-form', ['contact-form'], {
  action: 'https://formspree.io/f/placeholder'
});
const contactName = new MockElement('input', 'contact-name');
const contactEmail = new MockElement('input', 'contact-email');
const contactMessage = new MockElement('textarea', 'contact-message');
const formStatus = new MockElement('div', 'form-status');

// Global Window / Document Environment
let reducedMotionSetting = false;
let darkModeSetting = true;
let desktopViewport = false;

const docListeners = {};
const winListeners = {};

global.window = {
  innerWidth: 375,
  innerHeight: 800,
  pageYOffset: 0,
  localStorage: mockLocalStorage,
  matchMedia: (query) => {
    let matches = false;
    if (query.includes('prefers-reduced-motion')) matches = reducedMotionSetting;
    if (query.includes('prefers-color-scheme')) matches = darkModeSetting;
    if (query.includes('min-width: 1024px')) matches = desktopViewport;
    return {
      matches,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {}
    };
  },
  addEventListener: (type, fn) => {
    if (!winListeners[type]) winListeners[type] = [];
    winListeners[type].push(fn);
  },
  removeEventListener: (type, fn) => {
    if (winListeners[type]) winListeners[type] = winListeners[type].filter(f => f !== fn);
  },
  dispatchEvent: (e) => {
    const list = winListeners[e.type] || [];
    list.forEach(fn => fn(e));
  },
  requestAnimationFrame: (cb) => setTimeout(cb, 10),
  cancelAnimationFrame: (id) => clearTimeout(id)
};

global.document = {
  documentElement: docElem,
  body: bodyElem,
  activeElement: null,
  hidden: false,
  getElementById: (id) => {
    if (id === 'theme-toggle') return themeToggleBtn;
    if (id === 'nav-toggle') return navToggleBtn;
    if (id === 'site-nav') return siteNav;
    if (id === 'nav-menu') return navMenuUl;
    if (id === 'role-rotator') return roleRotator;
    if (id === 'contact-form') return contactForm;
    if (id === 'contact-name') return contactName;
    if (id === 'contact-email') return contactEmail;
    if (id === 'contact-message') return contactMessage;
    if (id === 'form-status') return formStatus;
    if (sectionIds.includes(id)) return new MockElement('section', id);
    return null;
  },
  querySelector: (sel) => {
    if (sel === '.theme-toggle-btn') return themeToggleBtn;
    if (sel === '.nav-toggle-btn') return navToggleBtn;
    if (sel === '.nav-menu' || sel === '#site-nav') return siteNav;
    if (sel === '.project-filters') return filterBar;
    if (sel === '.role-rotator') return roleRotator;
    if (sel === '.contact-form') return contactForm;
    return null;
  },
  querySelectorAll: (sel) => {
    if (sel.includes('.filter-chip')) return filterChips;
    if (sel.includes('.project-card')) return projectCards;
    if (sel.includes('.reveal-on-scroll')) return revealElements;
    if (sel.includes('.stat-number')) return [statCgpa, statProj, statHack];
    if (sel.includes('.nav-link') || sel.includes('a[href^="#"]')) return navLinks;
    if (sel.includes('.back-to-top')) return [];
    return [];
  },
  addEventListener: (type, fn) => {
    if (!docListeners[type]) docListeners[type] = [];
    docListeners[type].push(fn);
  },
  removeEventListener: (type, fn) => {
    if (docListeners[type]) docListeners[type] = docListeners[type].filter(f => f !== fn);
  },
  dispatchEvent: (e) => {
    const list = docListeners[e.type] || [];
    list.forEach(fn => fn(e));
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
    preventDefault() { defaultPrevented = true; },
    get defaultPrevented() { return defaultPrevented; }
  };
}

// Load script.js
const scriptPath = path.resolve(__dirname, '../../../script.js');
const Portfolio = require(scriptPath);

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       ${err.message}`);
    failed++;
  }
}

// ============================================================================
// AUDIT SUITE 1: THEME ENGINE
// ============================================================================
console.log('\n--- 1. ThemeManager Audit ---');

check('ThemeManager initializes dark mode by default and syncs HTML data-theme', () => {
  mockStorage.clear();
  Portfolio.ThemeManager.init();
  assert.strictEqual(Portfolio.ThemeManager.getTheme(), 'dark');
  assert.strictEqual(docElem.getAttribute('data-theme'), 'dark');
  assert.strictEqual(themeToggleBtn.getAttribute('aria-label'), 'Switch to light theme');
});

check('ThemeManager toggleTheme persists to dual localStorage keys (theme & portfolio-theme)', () => {
  const next = Portfolio.ThemeManager.toggleTheme();
  assert.strictEqual(next, 'light');
  assert.strictEqual(docElem.getAttribute('data-theme'), 'light');
  assert.strictEqual(mockLocalStorage.getItem('theme'), 'light');
  assert.strictEqual(mockLocalStorage.getItem('portfolio-theme'), 'light');
  assert.strictEqual(themeToggleBtn.getAttribute('aria-label'), 'Switch to dark theme');
  assert.strictEqual(themeToggleBtn.getAttribute('title'), 'Switch to dark theme');

  // Toggle back
  const back = Portfolio.ThemeManager.toggleTheme();
  assert.strictEqual(back, 'dark');
  assert.strictEqual(docElem.getAttribute('data-theme'), 'dark');
  assert.strictEqual(mockLocalStorage.getItem('theme'), 'dark');
  assert.strictEqual(mockLocalStorage.getItem('portfolio-theme'), 'dark');
});

check('ThemeManager survives sandboxed iframe / restricted storage errors', () => {
  storageFails = true;
  try {
    Portfolio.ThemeManager.setTheme('light', true);
    assert.strictEqual(Portfolio.ThemeManager.getTheme(), 'light');
    assert.strictEqual(docElem.getAttribute('data-theme'), 'light');
  } finally {
    storageFails = false;
  }
  Portfolio.ThemeManager.setTheme('dark', false);
});

check('ThemeManager normalizes corrupt theme values to dark default', () => {
  Portfolio.ThemeManager.setTheme('corrupted-theme-xyz', true);
  assert.strictEqual(Portfolio.ThemeManager.getTheme(), 'dark');
  assert.strictEqual(docElem.getAttribute('data-theme'), 'dark');
});

// ============================================================================
// AUDIT SUITE 2: MOBILE NAVIGATION & FOCUS TRAP
// ============================================================================
console.log('\n--- 2. MobileNavManager & Focus Trap Audit ---');

check('MobileNavManager toggles drawer state, menu-open body lock, and ARIA attributes', () => {
  Portfolio.MobileNavManager.init();
  assert.strictEqual(Portfolio.MobileNavManager.isOpen(), false);
  assert.strictEqual(bodyElem.classList.contains('menu-open'), false);

  Portfolio.MobileNavManager.open();
  assert.strictEqual(Portfolio.MobileNavManager.isOpen(), true);
  assert.strictEqual(siteNav.classList.contains('is-open'), true);
  assert.strictEqual(bodyElem.classList.contains('menu-open'), true);
  assert.strictEqual(navToggleBtn.getAttribute('aria-expanded'), 'true');
  assert.strictEqual(siteNav.getAttribute('aria-hidden'), 'false');
});

check('Focus Trap: Forward Tab from navToggleBtn wraps to first link (#hero)', () => {
  navToggleBtn.focus();
  assert.strictEqual(global.document.activeElement, navToggleBtn);

  const evt = createKeyEvent('Tab', { shiftKey: false });
  global.document.dispatchEvent(evt);

  assert.strictEqual(evt.defaultPrevented, true, 'Must prevent default to avoid leaking to <main>');
  assert.strictEqual(global.document.activeElement, navLinks[0], 'Must focus #hero');
});

check('Focus Trap: Backward Shift+Tab from first link (#hero) wraps to navToggleBtn', () => {
  navLinks[0].focus();
  assert.strictEqual(global.document.activeElement, navLinks[0]);

  const evt = createKeyEvent('Tab', { shiftKey: true });
  global.document.dispatchEvent(evt);

  assert.strictEqual(evt.defaultPrevented, true, 'Must prevent default to avoid leaking to .site-logo');
  assert.strictEqual(global.document.activeElement, navToggleBtn, 'Must focus navToggleBtn');
});

check('Focus Trap: Forward Tab from last link (#contact) bridges to navToggleBtn', () => {
  const lastLink = navLinks[navLinks.length - 1];
  lastLink.focus();
  assert.strictEqual(global.document.activeElement, lastLink);

  const evt = createKeyEvent('Tab', { shiftKey: false });
  global.document.dispatchEvent(evt);

  assert.strictEqual(evt.defaultPrevented, true, 'Must prevent default to avoid skipping to #theme-toggle');
  assert.strictEqual(global.document.activeElement, navToggleBtn, 'Must focus navToggleBtn');
});

check('Focus Trap: Backward Shift+Tab from navToggleBtn bridges to last link (#contact)', () => {
  navToggleBtn.focus();
  assert.strictEqual(global.document.activeElement, navToggleBtn);

  const evt = createKeyEvent('Tab', { shiftKey: true });
  global.document.dispatchEvent(evt);

  assert.strictEqual(evt.defaultPrevented, true, 'Must prevent default to avoid skipping to #theme-toggle');
  assert.strictEqual(global.document.activeElement, navLinks[navLinks.length - 1], 'Must focus #contact');
});

check('Focus Trap: Inner links (navLinks[1] through navLinks[5]) do NOT call preventDefault()', () => {
  for (let i = 1; i < navLinks.length - 1; i++) {
    navLinks[i].focus();
    const fwd = createKeyEvent('Tab', { shiftKey: false });
    global.document.dispatchEvent(fwd);
    assert.strictEqual(fwd.defaultPrevented, false, `Link ${i} forward Tab must preserve browser flow`);

    const back = createKeyEvent('Tab', { shiftKey: true });
    global.document.dispatchEvent(back);
    assert.strictEqual(back.defaultPrevented, false, `Link ${i} backward Shift+Tab must preserve browser flow`);
  }
});

check('Focus Trap: Drifting focus outside ring is automatically recaptured', () => {
  global.document.activeElement = siteLogo; // outside element
  const evt = createKeyEvent('Tab', { shiftKey: false });
  global.document.dispatchEvent(evt);

  assert.strictEqual(evt.defaultPrevented, true, 'Drifted focus must be intercepted');
  assert.strictEqual(global.document.activeElement, navLinks[0], 'Drifted focus must be recaptured to first link');
});

check('Escape key dismisses drawer, removes body.menu-open, and restores focus to navToggleBtn', () => {
  navLinks[2].focus();
  const esc = createKeyEvent('Escape', { keyCode: 27 });
  global.document.dispatchEvent(esc);

  assert.strictEqual(esc.defaultPrevented, true);
  assert.strictEqual(Portfolio.MobileNavManager.isOpen(), false);
  assert.strictEqual(bodyElem.classList.contains('menu-open'), false);
  assert.strictEqual(navToggleBtn.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(siteNav.getAttribute('aria-hidden'), 'true');
  assert.strictEqual(global.document.activeElement, navToggleBtn);
});

// ============================================================================
// AUDIT SUITE 3: PROJECT FILTERING
// ============================================================================
console.log('\n--- 3. ProjectFilter Audit ---');

check('ProjectFilter initializes and filters accurately across single and compound tags', () => {
  Portfolio.ProjectFilter.init();

  // All
  Portfolio.ProjectFilter.applyFilter('all');
  let visible = projectCards.filter(c => !c.classList.contains('is-hidden'));
  assert.strictEqual(visible.length, 7, 'All (7) must show 7 cards');
  assert.strictEqual(filterChips[0].getAttribute('aria-pressed'), 'true');

  // Mobile
  Portfolio.ProjectFilter.applyFilter('mobile');
  visible = projectCards.filter(c => !c.classList.contains('is-hidden'));
  assert.strictEqual(visible.length, 3, 'Mobile (3) must show 3 cards');
  assert.strictEqual(filterChips[1].getAttribute('aria-pressed'), 'true');

  // Web
  Portfolio.ProjectFilter.applyFilter('web');
  visible = projectCards.filter(c => !c.classList.contains('is-hidden'));
  assert.strictEqual(visible.length, 4, 'Web (4) must show 4 cards');
  assert.strictEqual(filterChips[2].getAttribute('aria-pressed'), 'true');

  // AI
  Portfolio.ProjectFilter.applyFilter('ai');
  visible = projectCards.filter(c => !c.classList.contains('is-hidden'));
  assert.strictEqual(visible.length, 4, 'AI (4) must show 4 cards');
  assert.strictEqual(filterChips[3].getAttribute('aria-pressed'), 'true');
});

check('ProjectFilter keyboard navigation supports ArrowRight, ArrowLeft, Home, End on toolbar', () => {
  filterChips[0].focus();
  const keyHandler = filterBar.listeners['keydown'][0];
  assert.ok(keyHandler, 'Toolbar keydown handler must be registered');

  // Right
  let prevented = false;
  keyHandler({ key: 'ArrowRight', preventDefault: () => { prevented = true; } });
  assert.strictEqual(prevented, true);
  assert.strictEqual(global.document.activeElement, filterChips[1]);
  assert.strictEqual(Portfolio.ProjectFilter.getActiveFilter(), 'mobile');

  // End
  keyHandler({ key: 'End', preventDefault: () => {} });
  assert.strictEqual(global.document.activeElement, filterChips[3]);
  assert.strictEqual(Portfolio.ProjectFilter.getActiveFilter(), 'ai');

  // Home
  keyHandler({ key: 'Home', preventDefault: () => {} });
  assert.strictEqual(global.document.activeElement, filterChips[0]);
  assert.strictEqual(Portfolio.ProjectFilter.getActiveFilter(), 'all');
});

// ============================================================================
// AUDIT SUITE 4: HERO ROLE ROTATOR
// ============================================================================
console.log('\n--- 4. RoleRotator Audit ---');

check('RoleRotator initializes 3 roles with aria-live="polite" and aria-atomic="true"', () => {
  Portfolio.RoleRotator.init();
  const roles = Portfolio.RoleRotator.getRoles();
  assert.deepStrictEqual(roles, [
    'AI/ML Engineer',
    'Flutter & Firebase Developer',
    'Full-stack Builder'
  ]);
  assert.strictEqual(roleRotator.getAttribute('aria-live'), 'polite');
  assert.strictEqual(roleRotator.getAttribute('aria-atomic'), 'true');
});

check('RoleRotator cycles roles in order and wraps back to start', () => {
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'AI/ML Engineer');
  Portfolio.RoleRotator.next();
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'Flutter & Firebase Developer');
  Portfolio.RoleRotator.next();
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'Full-stack Builder');
  Portfolio.RoleRotator.next();
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'AI/ML Engineer');
});

check('RoleRotator pauses on hover and focus per WCAG 2.2.2', () => {
  const listeners = heroRoleWrapper.listeners;
  assert.ok(listeners['mouseenter'], 'mouseenter registered');
  assert.ok(listeners['mouseleave'], 'mouseleave registered');
  assert.ok(listeners['focusin'], 'focusin registered');
  assert.ok(listeners['focusout'], 'focusout registered');

  listeners['mouseenter'][0]();
  const before = Portfolio.RoleRotator.getCurrentRole();
  Portfolio.RoleRotator.next();
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), before, 'Must not advance during hover');

  listeners['mouseleave'][0]();
  Portfolio.RoleRotator.next();
  assert.notStrictEqual(Portfolio.RoleRotator.getCurrentRole(), before, 'Advances when mouse leaves');
  Portfolio.RoleRotator.stopTimer();
});

// ============================================================================
// AUDIT SUITE 5: SCROLL-SPY NAVIGATION
// ============================================================================
console.log('\n--- 5. ScrollSpy Audit ---');

check('ScrollSpy updates active section and sets aria-current="page"', () => {
  Portfolio.ScrollSpy.init();
  Portfolio.ScrollSpy.updateActiveNav('skills');
  assert.strictEqual(Portfolio.ScrollSpy.getActiveSectionId(), 'skills');

  const skillsLink = navLinks.find(l => l.getAttribute('href') === '#skills');
  assert.strictEqual(skillsLink.classList.contains('active'), true);
  assert.strictEqual(skillsLink.getAttribute('aria-current'), 'page');

  const homeLink = navLinks[0];
  assert.strictEqual(homeLink.classList.contains('active'), false);
  assert.strictEqual(homeLink.getAttribute('aria-current'), null);
});

// ============================================================================
// AUDIT SUITE 6: MOTION SUBSYSTEM & PREFERS-REDUCED-MOTION
// ============================================================================
console.log('\n--- 6. MotionSubsystem Audit ---');

check('easeOutExpo strictly maps 0 -> 0, 1 -> 1, and reaches >95% at midpoint', () => {
  const ease = Portfolio.utils.easeOutExpo;
  assert.strictEqual(ease(0), 0);
  assert.strictEqual(ease(1), 1);
  assert.ok(ease(0.5) > 0.95);
});

check('formatNumber formats 9.46 to 2 decimals and 7, 9 to integers', () => {
  const fmt = Portfolio.utils.formatNumber;
  assert.strictEqual(fmt(9.46, 2), '9.46');
  assert.strictEqual(fmt(7, 0), '7');
  assert.strictEqual(fmt(9, 0), '9');
});

check('forceFinalStatValues sets targets and preserves non-numeric CEH badge', () => {
  Portfolio.MotionSubsystem.forceFinalStatValues();
  assert.strictEqual(statCgpa.textContent, '9.46');
  assert.strictEqual(statProj.textContent, '7');
  assert.strictEqual(statHack.textContent, '9');
  assert.strictEqual(badgeCeh.textContent, 'CEH', 'CEH badge must remain untouched');
});

check('forceRevealAll sets .revealed on all 51 reveal elements', () => {
  Portfolio.MotionSubsystem.forceRevealAll();
  const allRevealed = revealElements.every(el => el.classList.contains('revealed'));
  assert.strictEqual(allRevealed, true, 'All 51 elements must be revealed');
});

// ============================================================================
// AUDIT SUITE 7: UTILITIES & ANTI-CHEAT AUDIT
// ============================================================================
console.log('\n--- 7. UtilityHandlers & Anti-Cheat / Integrity Audit ---');

check('Contact form submission intercepts placeholder without browser alert()', () => {
  Portfolio.UtilityHandlers.init();

  contactName.value = '';
  contactEmail.value = '';
  contactMessage.value = '';

  let prevented = false;
  contactForm.dispatchEvent({
    type: 'submit',
    preventDefault: () => { prevented = true; }
  });

  assert.strictEqual(prevented, true);
  assert.ok(formStatus.textContent.includes('fill out all required fields'));
});

check('Contact form valid submission displays recruiter email and success feedback', () => {
  contactName.value = 'Dr. Sarah Connor';
  contactEmail.value = 'sarah@ai-labs.org';
  contactMessage.value = 'SWE internship opening';

  let prevented = false;
  contactForm.dispatchEvent({
    type: 'submit',
    preventDefault: () => { prevented = true; }
  });

  assert.strictEqual(prevented, true);
  assert.ok(formStatus.textContent.includes('Thank you, Dr. Sarah Connor'));
  assert.ok(formStatus.textContent.includes('thiraviyaraj2007@gmail.com'));
});

check('Integrity Check: Zero hardcoded bypasses, test environment cheats, or fake facades', () => {
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');

  // Verify zero alert() calls
  assert.strictEqual(/\balert\s*\(/.test(scriptContent), false, 'Zero alert() calls allowed');

  // Verify zero hardcoded test bypasses
  const bypassKeywords = [
    /process\.env\.TEST/i,
    /window\.__TEST_BYPASS/i,
    /isTestMode/i,
    /fakeVerification/i
  ];
  bypassKeywords.forEach(pattern => {
    assert.strictEqual(pattern.test(scriptContent), false, `Forbidden bypass pattern: ${pattern}`);
  });
});

console.log('\n' + '='.repeat(80));
console.log(`TOTAL AUDIT CHECKS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('='.repeat(80));

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL INDEPENDENT ADVERSARIAL CHECKS PASSED EMPIRICALLY (100% SUCCESS)');
}
