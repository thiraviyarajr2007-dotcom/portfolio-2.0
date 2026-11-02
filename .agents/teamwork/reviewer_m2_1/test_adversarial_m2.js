/**
 * Independent Adversarial Test Suite for Milestone 2 (script.js)
 * Authored by reviewer_m2_1 (adversarial critic)
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('='.repeat(75));
console.log('ADVERSARIAL STRESS TEST & INTEGRITY AUDIT — REVIEWER M2-1');
console.log('='.repeat(75));

// --- MOCK DOM INFRASTRUCTURE ---
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
    this.value = '';
    this.style = {};
    this.dataset = {};
    this.listeners = {};
    this.parentElement = null;
    this.children = [];
    this.offsetParent = {}; // truthy by default
  }

  reset() {
    this.value = '';
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
    return this.attributes[name] !== undefined;
  }

  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }

  removeEventListener(type, fn) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter(f => f !== fn);
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

  focus() {
    global.document.activeElement = this;
  }

  querySelectorAll(selector) {
    let matches = [];
    if (selector.includes('a[href]') && this.tagName === 'A' && this.hasAttribute('href')) matches.push(this);
    if (selector.includes('.filter-chip') && this.classList.contains('filter-chip')) matches.push(this);
    if (selector.includes('.project-card') && this.classList.contains('project-card')) matches.push(this);
    if (selector.includes('.reveal-on-scroll') && this.classList.contains('reveal-on-scroll')) matches.push(this);
    if (selector.includes('.stat-number') && this.classList.contains('stat-number')) matches.push(this);
    if (selector.includes('.nav-link') && this.classList.contains('nav-link')) matches.push(this);
    if (selector.includes('button') && this.tagName === 'BUTTON') matches.push(this);
    if (selector.includes('a') && this.tagName === 'A') matches.push(this);

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

// Global Storage Mock
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

// DOM tree construction
const docElem = new MockElement('html', '', [], { 'data-theme': 'dark' });
const bodyElem = new MockElement('body');

const themeToggleBtn = new MockElement('button', 'theme-toggle', ['theme-toggle-btn'], {
  'aria-label': 'Switch to light theme',
  'title': 'Switch to light theme'
});

const navToggleBtn = new MockElement('button', 'nav-toggle', ['nav-toggle-btn'], {
  'aria-label': 'Open navigation menu',
  'aria-expanded': 'false',
  'aria-controls': 'nav-menu'
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

// Outside element before nav (e.g. logo)
const logoLink = new MockElement('a', 'site-logo', ['site-logo'], { 'href': '#hero' });

// Outside element after nav (e.g. hero CTA)
const mainCta = new MockElement('a', 'hero-cta', ['btn'], { 'href': '#projects' });

// Filters
const filterBar = new MockElement('div', '', ['project-filters', 'filter-bar'], { 'role': 'toolbar' });
const filterChips = [
  new MockElement('button', '', ['filter-chip', 'active'], { 'data-filter': 'all', 'aria-pressed': 'true' }),
  new MockElement('button', '', ['filter-chip'], { 'data-filter': 'mobile', 'aria-pressed': 'false' }),
  new MockElement('button', '', ['filter-chip'], { 'data-filter': 'web', 'aria-pressed': 'false' }),
  new MockElement('button', '', ['filter-chip'], { 'data-filter': 'ai', 'aria-pressed': 'false' })
];
filterChips.forEach(c => { c.parentElement = filterBar; filterBar.children.push(c); });

// Project Cards
const projectData = [
  { name: 'Namma Nellai', cat: 'mobile' },
  { name: 'SwiftShare', cat: 'mobile' },
  { name: 'HabitAI', cat: 'web ai' },
  { name: 'AI Notes', cat: 'web ai' },
  { name: 'GPS Tracker', cat: 'web mobile' },
  { name: 'Road Safety', cat: 'ai' },
  { name: 'Medicine Platform', cat: 'web' }
];
const projectCards = projectData.map(p => new MockElement('article', '', ['project-card'], { 'data-category': p.cat }));

// Role Rotator
const roleRotatorElem = new MockElement('span', 'role-rotator', ['role-rotator'], {
  'data-roles': '["AI/ML Engineer", "Flutter & Firebase Developer", "Full-stack Builder"]',
  'aria-live': 'polite',
  'aria-atomic': 'true'
});
roleRotatorElem.textContent = 'AI/ML Engineer';
const roleWrapper = new MockElement('div', '', ['hero-role-wrapper']);
roleWrapper.children.push(roleRotatorElem);
roleRotatorElem.parentElement = roleWrapper;

// Stat Counters
const statCgpa = new MockElement('span', '', ['stat-number'], { 'data-target': '9.46', 'data-decimals': '2' });
const statProj = new MockElement('span', '', ['stat-number'], { 'data-target': '7' });
const statHack = new MockElement('span', '', ['stat-number'], { 'data-target': '9' });
const badgeCeh = new MockElement('span', '', ['stat-badge']); // No data-target
badgeCeh.textContent = 'CEH';

// Reveal elements
const revealElements = Array.from({ length: 51 }, () => new MockElement('div', '', ['reveal-on-scroll']));

// Contact Form
const contactForm = new MockElement('form', 'contact-form', ['contact-form'], {
  'action': 'https://formspree.io/f/placeholder'
});
const nameInput = new MockElement('input', 'contact-name');
const emailInput = new MockElement('input', 'contact-email');
const messageInput = new MockElement('textarea', 'contact-message');
const formStatus = new MockElement('div', 'form-status');

// Setup mock window & document
let mediaQueryReducedMotion = false;
let mediaQueryDarkMode = true;
let mediaQueryDesktop = false; // default mobile viewport

const listenersDoc = {};

global.window = {
  innerWidth: 375, // mobile
  innerHeight: 667,
  pageYOffset: 0,
  localStorage: mockLocalStorage,
  matchMedia: (query) => {
    let matches = false;
    if (query.includes('prefers-reduced-motion: reduce')) matches = mediaQueryReducedMotion;
    if (query.includes('prefers-color-scheme: dark')) matches = mediaQueryDarkMode;
    if (query.includes('min-width: 1024px')) matches = mediaQueryDesktop;
    return {
      matches,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {}
    };
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  requestAnimationFrame: (cb) => setTimeout(cb, 10),
  cancelAnimationFrame: (id) => clearTimeout(id),
  dispatchEvent: () => {}
};

global.document = {
  documentElement: docElem,
  body: bodyElem,
  activeElement: null,
  hidden: false,
  getElementById: (id) => {
    if (id === 'theme-toggle') return themeToggleBtn;
    if (id === 'nav-toggle') return navToggleBtn;
    if (id === 'site-nav') return navMenu;
    if (id === 'nav-menu') return navMenuUl;
    if (id === 'role-rotator') return roleRotatorElem;
    if (id === 'contact-form') return contactForm;
    if (id === 'contact-name') return nameInput;
    if (id === 'contact-email') return emailInput;
    if (id === 'contact-message') return messageInput;
    if (id === 'form-status') return formStatus;
    if (sectionIds.includes(id)) return new MockElement('section', id);
    return null;
  },
  querySelector: (sel) => {
    if (sel === '.theme-toggle-btn') return themeToggleBtn;
    if (sel === '.nav-toggle-btn') return navToggleBtn;
    if (sel === '.nav-menu') return navMenu;
    if (sel === '.project-filters') return filterBar;
    if (sel === '.role-rotator') return roleRotatorElem;
    if (sel === '.contact-form') return contactForm;
    return null;
  },
  querySelectorAll: (sel) => {
    if (sel.includes('.filter-chip')) return filterChips;
    if (sel.includes('.project-card')) return projectCards;
    if (sel.includes('.reveal-on-scroll')) return revealElements;
    if (sel.includes('.stat-number')) return [statCgpa, statProj, statHack];
    if (sel.includes('.nav-link')) return navLinks;
    if (sel.includes('a[href^="#"]')) return navLinks;
    if (sel.includes('.back-to-top')) return [];
    return [];
  },
  addEventListener: (type, fn) => {
    if (!listenersDoc[type]) listenersDoc[type] = [];
    listenersDoc[type].push(fn);
  },
  removeEventListener: (type, fn) => {
    if (!listenersDoc[type]) return;
    listenersDoc[type] = listenersDoc[type].filter(f => f !== fn);
  },
  dispatchEvent: (e) => {
    const list = listenersDoc[e.type] || [];
    list.forEach(fn => fn(e));
  }
};

// Load script.js
const scriptPath = path.resolve(__dirname, '../../../script.js');
const Portfolio = require(scriptPath);

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    testsFailed++;
  }
}

// -----------------------------------------------------------------------------
// TEST SUITE 1: THEME TOGGLE ENGINE
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 1: THEME TOGGLE ENGINE STRESS TESTS ---');

runTest('ThemeManager toggles dark -> light -> dark and updates attributes', () => {
  Portfolio.ThemeManager.init();
  Portfolio.ThemeManager.setTheme('dark', true);
  assert.strictEqual(Portfolio.ThemeManager.getTheme(), 'dark');
  assert.strictEqual(docElem.getAttribute('data-theme'), 'dark');
  assert.strictEqual(mockLocalStorage.getItem('theme'), 'dark');
  assert.strictEqual(mockLocalStorage.getItem('portfolio-theme'), 'dark');
  assert.strictEqual(themeToggleBtn.getAttribute('aria-label'), 'Switch to light theme');

  Portfolio.ThemeManager.toggleTheme();
  assert.strictEqual(Portfolio.ThemeManager.getTheme(), 'light');
  assert.strictEqual(docElem.getAttribute('data-theme'), 'light');
  assert.strictEqual(mockLocalStorage.getItem('theme'), 'light');
  assert.strictEqual(mockLocalStorage.getItem('portfolio-theme'), 'light');
  assert.strictEqual(themeToggleBtn.getAttribute('aria-label'), 'Switch to dark theme');

  Portfolio.ThemeManager.toggleTheme();
  assert.strictEqual(Portfolio.ThemeManager.getTheme(), 'dark');
});

runTest('ThemeManager gracefully survives SecurityError / sandboxed iframe storage', () => {
  storageFails = true;
  try {
    Portfolio.ThemeManager.setTheme('light', true);
    assert.strictEqual(Portfolio.ThemeManager.getTheme(), 'light');
    assert.strictEqual(docElem.getAttribute('data-theme'), 'light');
  } finally {
    storageFails = false;
  }
});

runTest('ThemeManager sanitizes invalid or corrupted theme values', () => {
  Portfolio.ThemeManager.setTheme('neon-green', true);
  // Must normalize to 'dark'
  assert.strictEqual(Portfolio.ThemeManager.getTheme(), 'dark');
  assert.strictEqual(docElem.getAttribute('data-theme'), 'dark');
});

// -----------------------------------------------------------------------------
// TEST SUITE 2: MOBILE NAVIGATION & FOCUS TRAP
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 2: MOBILE NAVIGATION & FOCUS TRAP STRESS TESTS ---');

runTest('MobileNavManager open & close lifecycle manages classes & ARIA', () => {
  Portfolio.MobileNavManager.init();
  Portfolio.MobileNavManager.open();
  assert.strictEqual(Portfolio.MobileNavManager.isOpen(), true);
  assert.strictEqual(navMenu.classList.contains('is-open'), true);
  assert.strictEqual(bodyElem.classList.contains('menu-open'), true);
  assert.strictEqual(navToggleBtn.getAttribute('aria-expanded'), 'true');
  assert.strictEqual(navMenu.getAttribute('aria-hidden'), 'false');

  Portfolio.MobileNavManager.close(false);
  assert.strictEqual(Portfolio.MobileNavManager.isOpen(), false);
  assert.strictEqual(navMenu.classList.contains('is-open'), false);
  assert.strictEqual(bodyElem.classList.contains('menu-open'), false);
  assert.strictEqual(navToggleBtn.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(navMenu.getAttribute('aria-hidden'), 'true');
});

runTest('Escape key dismisses drawer and restores focus to toggle button', () => {
  Portfolio.MobileNavManager.open();
  global.document.activeElement = navLinks[2];

  let prevented = false;
  const escEvent = {
    key: 'Escape',
    preventDefault: () => { prevented = true; }
  };

  const keydownHandlers = listenersDoc['keydown'] || [];
  keydownHandlers.forEach(h => h(escEvent));

  assert.strictEqual(prevented, true, 'Escape must call preventDefault()');
  assert.strictEqual(Portfolio.MobileNavManager.isOpen(), false, 'Drawer must be closed');
  assert.strictEqual(global.document.activeElement, navToggleBtn, 'Focus must be restored to navToggleBtn');
});

runTest('Adversarial Focus Trap: Last element Tab forward wraps to first', () => {
  Portfolio.MobileNavManager.open();
  const lastLink = navLinks[navLinks.length - 1]; // '#contact'
  global.document.activeElement = lastLink;

  let prevented = false;
  const tabEvent = {
    key: 'Tab',
    shiftKey: false,
    preventDefault: () => { prevented = true; }
  };

  const keydownHandlers = listenersDoc['keydown'] || [];
  keydownHandlers.forEach(h => h(tabEvent));

  assert.strictEqual(prevented, true, 'Tab on last element must preventDefault()');
  assert.strictEqual(global.document.activeElement, navToggleBtn, 'Focus must wrap to navToggleBtn');
  Portfolio.MobileNavManager.close(false);
});

runTest('Adversarial Focus Trap: Shift+Tab on first ring element wraps to last', () => {
  Portfolio.MobileNavManager.open();
  global.document.activeElement = navToggleBtn;

  let prevented = false;
  const shiftTabEvent = {
    key: 'Tab',
    shiftKey: true,
    preventDefault: () => { prevented = true; }
  };

  const keydownHandlers = listenersDoc['keydown'] || [];
  keydownHandlers.forEach(h => h(shiftTabEvent));

  assert.strictEqual(prevented, true, 'Shift+Tab on navToggleBtn must preventDefault()');
  assert.strictEqual(global.document.activeElement, navLinks[navLinks.length - 1], 'Focus must wrap to last nav link');
  Portfolio.MobileNavManager.close(false);
});

runTest('Adversarial Focus Trap: Forward Tab from navToggleBtn must wrap to first link', () => {
  Portfolio.MobileNavManager.open();
  global.document.activeElement = navToggleBtn;

  let prevented = false;
  const tabEvent = {
    key: 'Tab',
    shiftKey: false,
    preventDefault: () => { prevented = true; }
  };

  const keydownHandlers = listenersDoc['keydown'] || [];
  keydownHandlers.forEach(h => h(tabEvent));

  assert.strictEqual(prevented, true, 'Tab forward on navToggleBtn must preventDefault() to avoid leaking to <main>');
  assert.strictEqual(global.document.activeElement, navLinks[0], 'Focus must wrap to first nav link (#hero)');
  Portfolio.MobileNavManager.close(false);
});

runTest('Adversarial Focus Trap: Shift+Tab on first link (#hero) must wrap to navToggleBtn', () => {
  Portfolio.MobileNavManager.open();
  global.document.activeElement = navLinks[0];

  let prevented = false;
  const shiftTabEvent = {
    key: 'Tab',
    shiftKey: true,
    preventDefault: () => { prevented = true; }
  };

  const keydownHandlers = listenersDoc['keydown'] || [];
  keydownHandlers.forEach(h => h(shiftTabEvent));

  assert.strictEqual(prevented, true, 'Shift+Tab on first link must preventDefault() to avoid leaking to .site-logo');
  assert.strictEqual(global.document.activeElement, navToggleBtn, 'Focus must wrap to navToggleBtn');
  Portfolio.MobileNavManager.close(false);
});

// -----------------------------------------------------------------------------
// TEST SUITE 3: PROJECT CATEGORY FILTERING
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 3: PROJECT CATEGORY FILTERING STRESS TESTS ---');

runTest('ProjectFilter accurately filters single and compound category tags', () => {
  Portfolio.ProjectFilter.init();

  // 'all' -> 7 visible
  Portfolio.ProjectFilter.applyFilter('all', filterChips[0]);
  let visible = projectCards.filter(c => !c.classList.contains('is-hidden')).length;
  assert.strictEqual(visible, 7, 'Filter "all" must show 7 cards');
  assert.strictEqual(filterChips[0].getAttribute('aria-pressed'), 'true');
  assert.strictEqual(filterChips[1].getAttribute('aria-pressed'), 'false');

  // 'mobile' -> matches 'mobile' (Namma Nellai, SwiftShare) + 'web mobile' (GPS Tracker) = 3
  Portfolio.ProjectFilter.applyFilter('mobile', filterChips[1]);
  visible = projectCards.filter(c => !c.classList.contains('is-hidden')).length;
  assert.strictEqual(visible, 3, 'Filter "mobile" must show 3 cards');
  assert.strictEqual(projectCards[0].classList.contains('is-hidden'), false); // Namma Nellai (mobile)
  assert.strictEqual(projectCards[1].classList.contains('is-hidden'), false); // SwiftShare (mobile)
  assert.strictEqual(projectCards[4].classList.contains('is-hidden'), false); // GPS Tracker (web mobile)
  assert.strictEqual(projectCards[2].classList.contains('is-hidden'), true);  // HabitAI (web ai)

  // 'web' -> matches 'web ai' (HabitAI, AI Notes) + 'web mobile' (GPS Tracker) + 'web' (Medicine) = 4
  Portfolio.ProjectFilter.applyFilter('web', filterChips[2]);
  visible = projectCards.filter(c => !c.classList.contains('is-hidden')).length;
  assert.strictEqual(visible, 4, 'Filter "web" must show 4 cards');

  // 'ai' -> matches 'web ai' (HabitAI, AI Notes) + 'ai' (Road Safety) = 3 cards or 4 if another has ai
  // HabitAI (web ai), AI Notes (web ai), Road Safety (ai) = 3
  Portfolio.ProjectFilter.applyFilter('ai', filterChips[3]);
  visible = projectCards.filter(c => !c.classList.contains('is-hidden')).length;
  // HabitAI: web ai, AI Notes: web ai, Road Safety: ai
  assert.strictEqual(visible, 3, 'Filter "ai" must show 3 cards for this dataset');
});

runTest('ProjectFilter toolbar supports arrow keys & Home/End', () => {
  const chips = filterChips;
  let keyHandler = filterBar.listeners['keydown'] ? filterBar.listeners['keydown'][0] : null;
  assert.ok(keyHandler, 'Keydown listener must exist on filterBar');

  // Active element is chips[0]
  chips[0].focus();
  assert.strictEqual(global.document.activeElement, chips[0]);

  let prevented = false;
  keyHandler({
    key: 'ArrowRight',
    preventDefault: () => { prevented = true; }
  });
  assert.strictEqual(prevented, true);
  assert.strictEqual(global.document.activeElement, chips[1]);
  assert.strictEqual(Portfolio.ProjectFilter.getActiveFilter(), 'mobile');

  // End key
  keyHandler({
    key: 'End',
    preventDefault: () => { prevented = true; }
  });
  assert.strictEqual(global.document.activeElement, chips[3]);
  assert.strictEqual(Portfolio.ProjectFilter.getActiveFilter(), 'ai');

  // Home key
  keyHandler({
    key: 'Home',
    preventDefault: () => { prevented = true; }
  });
  assert.strictEqual(global.document.activeElement, chips[0]);
  assert.strictEqual(Portfolio.ProjectFilter.getActiveFilter(), 'all');
});

// -----------------------------------------------------------------------------
// TEST SUITE 4: HERO ROLE ROTATOR
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 4: HERO ACCESSIBLE ROLE ROTATOR STRESS TESTS ---');

runTest('RoleRotator parses roles and advances properly', () => {
  Portfolio.RoleRotator.init();
  const roles = Portfolio.RoleRotator.getRoles();
  assert.deepStrictEqual(roles, [
    'AI/ML Engineer',
    'Flutter & Firebase Developer',
    'Full-stack Builder'
  ]);

  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'AI/ML Engineer');
  Portfolio.RoleRotator.next();
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'Flutter & Firebase Developer');
  Portfolio.RoleRotator.next();
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'Full-stack Builder');
  Portfolio.RoleRotator.next();
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'AI/ML Engineer');
});

runTest('RoleRotator pauses on hover and focus (WCAG 2.2.2)', () => {
  const wrapperListeners = roleWrapper.listeners;
  assert.ok(wrapperListeners['mouseenter'], 'mouseenter listener must be registered');
  assert.ok(wrapperListeners['mouseleave'], 'mouseleave listener must be registered');
  assert.ok(wrapperListeners['focusin'], 'focusin listener must be registered');
  assert.ok(wrapperListeners['focusout'], 'focusout listener must be registered');

  wrapperListeners['mouseenter'][0]();
  const roleBefore = Portfolio.RoleRotator.getCurrentRole();
  Portfolio.RoleRotator.next();
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), roleBefore, 'Must not advance while hovered');

  wrapperListeners['mouseleave'][0]();
  Portfolio.RoleRotator.next();
  assert.notStrictEqual(Portfolio.RoleRotator.getCurrentRole(), roleBefore, 'Must advance after mouse leaves');
  Portfolio.RoleRotator.stopTimer();
});

// -----------------------------------------------------------------------------
// TEST SUITE 5: MOTION SUBSYSTEM & PREFERS-REDUCED-MOTION
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 5: MOTION SUBSYSTEM & PREFERS-REDUCED-MOTION STRESS TESTS ---');

runTest('easeOutExpo curve math properties', () => {
  const ease = Portfolio.utils.easeOutExpo;
  assert.strictEqual(ease(0), 0);
  assert.strictEqual(ease(1), 1);
  assert.ok(ease(0.5) > 0.95, 'easeOutExpo must reach >95% at midpoint');
  assert.ok(ease(0.1) > 0.45, 'easeOutExpo must be fast-starting');
});

runTest('formatNumber formats decimals accurately', () => {
  assert.strictEqual(Portfolio.utils.formatNumber(9.46, 2), '9.46');
  assert.strictEqual(Portfolio.utils.formatNumber(7, 0), '7');
  assert.strictEqual(Portfolio.utils.formatNumber(9, 0), '9');
});

runTest('MotionSubsystem forceFinalStatValues populates targets and leaves CEH badge intact', () => {
  Portfolio.MotionSubsystem.forceFinalStatValues();
  assert.strictEqual(statCgpa.textContent, '9.46');
  assert.strictEqual(statProj.textContent, '7');
  assert.strictEqual(statHack.textContent, '9');
  assert.strictEqual(badgeCeh.textContent, 'CEH', 'CEH badge must remain untouched');
});

runTest('MotionSubsystem forceRevealAll reveals all 51 elements', () => {
  Portfolio.MotionSubsystem.forceRevealAll();
  const allRevealed = revealElements.every(el => el.classList.contains('revealed'));
  assert.strictEqual(allRevealed, true, 'All 51 elements must be revealed');
});

// -----------------------------------------------------------------------------
// TEST SUITE 6: CONTACT FORM
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 6: CONTACT FORM UTILITY STRESS TESTS ---');

runTest('Contact form validation catches empty fields without alert()', () => {
  Portfolio.UtilityHandlers.init();

  let prevented = false;
  nameInput.value = '';
  emailInput.value = '';
  messageInput.value = '';

  contactForm.dispatchEvent({
    type: 'submit',
    preventDefault: () => { prevented = true; }
  });

  assert.strictEqual(prevented, true, 'Form submission must be intercepted');
  assert.ok(formStatus.textContent.includes('fill out all required fields'));
});

runTest('Contact form submission with values gives accessible feedback', () => {
  let prevented = false;
  nameInput.value = 'Hiring Manager';
  emailInput.value = 'recruiter@company.com';
  messageInput.value = 'Interested in ML internship';

  contactForm.dispatchEvent({
    type: 'submit',
    preventDefault: () => { prevented = true; }
  });

  assert.strictEqual(prevented, true);
  assert.ok(formStatus.textContent.includes('Thank you, Hiring Manager'));
  assert.ok(formStatus.textContent.includes('thiraviyaraj2007@gmail.com'));
});

// -----------------------------------------------------------------------------
// TEST SUITE 7: INTEGRITY CHECK (Anti-Cheat / Anti-Facade Verification)
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 7: INTEGRITY VIOLATION & FACADE AUDIT ---');

runTest('Integrity: Source code has no hardcoded test scores or bypass flags', () => {
  const code = fs.readFileSync(scriptPath, 'utf8');

  // Check for test mock bypasses or hardcoded test runner detections
  const forbiddenPatterns = [
    /if\s*\(\s*process\.env\.TEST/i,
    /if\s*\(\s*isTest/i,
    /return\s*97;/i,
    /__test_runner_override__/i,
    /window\.__FAKED__/i
  ];

  for (let pattern of forbiddenPatterns) {
    assert.strictEqual(pattern.test(code), false, `Forbidden fake test pattern detected: ${pattern}`);
  }
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('='.repeat(75));
console.log(`TOTAL ADVERSARIAL TESTS: ${testsPassed + testsFailed}`);
console.log(`PASSED: ${testsPassed}`);
console.log(`FAILED: ${testsFailed}`);
console.log('='.repeat(75));

if (testsFailed > 0) {
  process.exit(1);
}
