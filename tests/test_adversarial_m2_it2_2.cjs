/**
 * ============================================================================
 * EMPIRICAL CHALLENGER ADVERSARIAL STRESS TEST SUITE — MILESTONE 2 ITERATION 2
 * Agent: challenger_m2_it2_2
 * Target: script.js (Portfolio 2.0)
 *
 * Core Stress Test Areas:
 *   1. Rapid Theme Toggling (100+ flips) & Storage Error Recovery
 *      (QuotaExceededError, SecurityError, sandboxed iframe, adversarial storage)
 *   2. Rapid Project Category Filter Switches (100+ random switches) & Compound Tags
 *      (Strict truth table verification of all 7 cards, compound tags, reduced-motion)
 *   3. Dynamic prefers-reduced-motion Toggling During rAF Counter Loops
 *      (Mid-flight interruption, cancelAnimationFrame, instant target value settling, CEH intact)
 *   4. Breakpoint Resizing Across 1024px with Open Mobile Drawer
 *      (Auto-dismissal, body scroll lock release, 100 rapid oscillations, ARIA state sync)
 *   5. High-Frequency Cross-Module Concurrency & Bombardment Fuzzing
 * ============================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('='.repeat(80));
console.log('CHALLENGER M2-IT2-2: EMPIRICAL MOTION, REDUCED-MOTION & STATE TRANSITIONS SUITE');
console.log('='.repeat(80));

// --- TEST TRACKING ---
let passedCount = 0;
let failedCount = 0;
const testResults = [];

function test(name, fn) {
  try {
    fn();
    passedCount++;
    console.log(`  [PASS] ${name}`);
    testResults.push({ name, status: 'PASS' });
  } catch (err) {
    failedCount++;
    const shortErr = err.message ? err.message.split('\n')[0] : String(err);
    console.error(`  [FAIL] ${name}`);
    console.error(`         Error: ${shortErr}`);
    testResults.push({ name, status: 'FAIL', error: shortErr, stack: err.stack });
  }
}

// ----------------------------------------------------------------------------
// HIGH-FIDELITY DOM SIMULATION INFRASTRUCTURE
// ----------------------------------------------------------------------------

class MockClassList {
  constructor(initial = []) {
    this._classes = new Set(initial.filter(Boolean));
  }
  add(...names) { names.forEach(n => n && this._classes.add(n)); }
  remove(...names) { names.forEach(n => this._classes.delete(n)); }
  contains(name) { return this._classes.has(name); }
  toggle(name, force) {
    if (force === undefined) {
      if (this._classes.has(name)) {
        this._classes.delete(name);
        return false;
      } else {
        this._classes.add(name);
        return true;
      }
    }
    if (force) this._classes.add(name);
    else this._classes.delete(name);
    return force;
  }
  get length() { return this._classes.size; }
  toString() { return Array.from(this._classes).join(' '); }
}

class MockElement {
  constructor(tagName, id = '', classes = [], attrs = {}) {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.classList = new MockClassList(classes);
    this.attributes = { ...attrs };
    if (id) this.attributes['id'] = id;
    this.dataset = {};
    for (const key of Object.keys(attrs)) {
      if (key.startsWith('data-')) {
        const camel = key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        this.dataset[camel] = attrs[key];
      }
    }
    this.textContent = '';
    this.value = '';
    this.style = {};
    this.listeners = {};
    this.parentElement = null;
    this.children = [];
    this.offsetParent = {};
    this.offsetHeight = 100;
    this.offsetWidth = 100;
    this._ownerDocument = null;
  }

  getAttribute(name) {
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
    if (name.startsWith('data-')) {
      const camel = name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      this.dataset[camel] = String(val);
    }
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name.startsWith('data-')) {
      const camel = name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      delete this.dataset[camel];
    }
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
    event.target = this;
    const list = this.listeners[event.type] || [];
    list.forEach(fn => fn(event));
  }

  focus() {
    if (this._ownerDocument) {
      this._ownerDocument.activeElement = this;
    }
  }

  closest(selector) {
    if (selector.startsWith('.') && this.classList.contains(selector.slice(1))) return this;
    if (selector.startsWith('#') && this.id === selector.slice(1)) return this;
    if (this.parentElement) return this.parentElement.closest(selector);
    return null;
  }

  appendChild(child) {
    this.children.push(child);
    child.parentElement = this;
    if (this._ownerDocument) {
      child._ownerDocument = this._ownerDocument;
    }
  }

  querySelectorAll(selector) {
    const results = [];
    function traverse(node) {
      for (const child of node.children) {
        if (matches(child, selector)) results.push(child);
        traverse(child);
      }
    }
    traverse(this);
    return results;
  }

  querySelector(selector) {
    const list = this.querySelectorAll(selector);
    return list.length > 0 ? list[0] : null;
  }
}

function matches(element, selector) {
  if (selector.startsWith('#')) return element.id === selector.slice(1);
  if (selector.startsWith('.')) {
    const cls = selector.slice(1).split('[')[0];
    if (!element.classList.contains(cls)) return false;
    if (selector.includes('[') && selector.includes(']')) {
      const attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)(?:=([^\]]+))?\]/);
      if (attrMatch) {
        const attrName = attrMatch[1];
        const attrVal = attrMatch[2] ? attrMatch[2].replace(/['"]/g, '') : null;
        if (!element.hasAttribute(attrName)) return false;
        if (attrVal !== null && element.getAttribute(attrName) !== attrVal) return false;
      }
    }
    return true;
  }
  if (selector.includes('[data-category]')) {
    return element.classList.contains('project-card') && element.hasAttribute('data-category');
  }
  if (selector.includes('[data-filter]')) {
    return element.classList.contains('filter-chip') && element.hasAttribute('data-filter');
  }
  if (selector.includes('[data-target]')) {
    return element.classList.contains('stat-number') && element.hasAttribute('data-target');
  }
  return element.tagName.toLowerCase() === selector.toLowerCase();
}

class MockLocalStorage {
  constructor() {
    this._store = {};
    this._errorMode = null; // 'quota', 'security', 'inaccessible'
  }
  _setErrorMode(mode) {
    this._errorMode = mode;
  }
  getItem(key) {
    if (this._errorMode === 'security') {
      const err = new Error('The operation is insecure.');
      err.name = 'SecurityError';
      throw err;
    }
    return Object.prototype.hasOwnProperty.call(this._store, key) ? this._store[key] : null;
  }
  setItem(key, val) {
    if (this._errorMode === 'quota') {
      const err = new Error('QuotaExceededError: storage limit reached');
      err.name = 'QuotaExceededError';
      throw err;
    }
    if (this._errorMode === 'security') {
      const err = new Error('The operation is insecure.');
      err.name = 'SecurityError';
      throw err;
    }
    this._store[key] = String(val);
  }
  removeItem(key) {
    if (this._errorMode === 'security') {
      const err = new Error('The operation is insecure.');
      err.name = 'SecurityError';
      throw err;
    }
    delete this._store[key];
  }
  clear() {
    this._store = {};
  }
}

class MockIntersectionObserver {
  constructor(callback, options = {}) {
    this.callback = callback;
    this.options = options;
    this.observed = new Set();
    MockIntersectionObserver.instances.push(this);
  }
  observe(target) {
    this.observed.add(target);
  }
  unobserve(target) {
    this.observed.delete(target);
  }
  disconnect() {
    this.observed.clear();
  }
  trigger(target, isIntersecting = true, ratio = 1.0) {
    this.callback([{ target, isIntersecting, intersectionRatio: ratio }], this);
  }
}
MockIntersectionObserver.instances = [];

/**
 * Creates an isolated mock environment matching production index.html
 */
function createEnvironment(config = {}) {
  const {
    prefersReduced = false,
    colorScheme = 'dark',
    innerWidth = 1200,
    localStorageMode = null
  } = config;

  MockIntersectionObserver.instances = [];

  const mediaListeners = {
    colorScheme: [],
    reducedMotion: [],
    breakpoint: []
  };

  let currentReduced = prefersReduced;
  let currentColor = colorScheme;
  let currentWidth = innerWidth;

  const mockStorage = new MockLocalStorage();
  mockStorage._setErrorMode(localStorageMode);

  const registeredElements = new Map();
  const allElements = [];

  const docListeners = {};
  const winListeners = {};

  const mockDoc = {
    documentElement: null,
    body: null,
    hidden: false,
    readyState: 'complete',
    activeElement: null,
    getElementById: (id) => registeredElements.get(id) || null,
    querySelector: (sel) => {
      if (sel === 'html') return mockDoc.documentElement;
      if (sel === 'body') return mockDoc.body;
      if (sel.startsWith('#')) return registeredElements.get(sel.slice(1)) || null;
      if (sel.startsWith('.')) {
        const cls = sel.slice(1);
        return allElements.find(e => e.classList.contains(cls)) || null;
      }
      return null;
    },
    querySelectorAll: (sel) => {
      if (sel.includes('.filter-chip')) return allElements.filter(e => e.classList.contains('filter-chip'));
      if (sel.includes('.project-card')) return allElements.filter(e => e.classList.contains('project-card'));
      if (sel.includes('.stat-number[data-target]')) return allElements.filter(e => e.classList.contains('stat-number') && e.hasAttribute('data-target'));
      if (sel.includes('.reveal-on-scroll')) {
        return allElements.filter(e => e.classList.contains('reveal-on-scroll'));
      }
      if (sel.includes('.site-nav .nav-link') || sel.includes('.nav-links a') || sel.includes('a[href]')) {
        return allElements.filter(e => e.tagName === 'A');
      }
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
    dispatchEvent: (evt) => {
      (docListeners[evt.type] || []).forEach(f => f(evt));
    }
  };

  function register(el) {
    el._ownerDocument = mockDoc;
    allElements.push(el);
    if (el.id) registeredElements.set(el.id, el);
    return el;
  }

  const documentElement = register(new MockElement('html', '', [], { 'data-theme': 'dark' }));
  const body = register(new MockElement('body'));
  documentElement.appendChild(body);
  mockDoc.documentElement = documentElement;
  mockDoc.body = body;
  mockDoc.activeElement = body;

  // --- HEADER & NAV ELEMENTS ---
  const header = register(new MockElement('header', 'site-header', ['site-header']));
  const navToggleBtn = register(new MockElement('button', 'nav-toggle', ['nav-toggle-btn'], {
    'aria-label': 'Open navigation menu',
    'aria-expanded': 'false',
    'aria-controls': 'nav-menu'
  }));
  const themeToggleBtn = register(new MockElement('button', 'theme-toggle', ['theme-toggle-btn'], {
    'aria-label': 'Switch to light theme',
    'title': 'Switch to light theme'
  }));
  const siteNav = register(new MockElement('nav', 'site-nav', ['nav-menu', 'site-nav']));
  const navMenuUl = register(new MockElement('ul', 'nav-menu', ['nav-links']));
  siteNav.appendChild(navMenuUl);

  const navSections = ['hero', 'about', 'projects', 'skills', 'achievements', 'certifications', 'contact'];
  const navLinks = navSections.map(sec => {
    const a = register(new MockElement('a', '', ['nav-link'], { href: '#' + sec }));
    a.textContent = sec.charAt(0).toUpperCase() + sec.slice(1);
    navMenuUl.appendChild(a);
    return a;
  });

  header.appendChild(themeToggleBtn);
  header.appendChild(navToggleBtn);
  header.appendChild(siteNav);
  body.appendChild(header);

  // --- HERO & ROLE ROTATOR & STAT COUNTERS ---
  const heroSection = register(new MockElement('section', 'hero', ['section', 'hero-section']));
  const roleRotator = register(new MockElement('span', 'role-rotator', ['role-rotator'], {
    'aria-live': 'polite',
    'aria-atomic': 'true',
    'data-roles': '["AI/ML Engineer", "Flutter & Firebase Developer", "Full-stack Builder"]'
  }));
  roleRotator.textContent = 'AI/ML Engineer';
  heroSection.appendChild(roleRotator);

  // 4 Quantifiable Recruiter Metric Counters:
  // 1. CGPA 9.46 (target 9.46, decimals 2)
  // 2. 7+ Projects Built (target 7)
  // 3. CEH Badge (static, NO target)
  // 4. 9 Hackathons (target 9)
  const statCgpa = register(new MockElement('span', '', ['stat-number', 'reveal-on-scroll'], { 'data-target': '9.46', 'data-decimals': '2' }));
  statCgpa.textContent = '9.46';
  const statProjects = register(new MockElement('span', '', ['stat-number', 'reveal-on-scroll'], { 'data-target': '7' }));
  statProjects.textContent = '7';
  const statCeh = register(new MockElement('span', '', ['stat-badge', 'reveal-on-scroll']));
  statCeh.textContent = 'CEH';
  const statHackathons = register(new MockElement('span', '', ['stat-number', 'reveal-on-scroll'], { 'data-target': '9' }));
  statHackathons.textContent = '9';

  heroSection.appendChild(statCgpa);
  heroSection.appendChild(statProjects);
  heroSection.appendChild(statCeh);
  heroSection.appendChild(statHackathons);
  body.appendChild(heroSection);

  // --- PROJECTS SECTION WITH 7 REAL CARDS & COMPOUND TAGS ---
  const projectsSection = register(new MockElement('section', 'projects', ['section', 'projects-section']));
  const filterToolbar = register(new MockElement('div', '', ['project-filters', 'filter-bar'], {
    'role': 'toolbar',
    'aria-label': 'Filter projects by category'
  }));

  const chipAll = register(new MockElement('button', '', ['filter-chip', 'active'], { 'data-filter': 'all', 'aria-pressed': 'true' }));
  chipAll.textContent = 'All (7)';
  const chipMobile = register(new MockElement('button', '', ['filter-chip'], { 'data-filter': 'mobile', 'aria-pressed': 'false' }));
  chipMobile.textContent = 'Mobile (3)';
  const chipWeb = register(new MockElement('button', '', ['filter-chip'], { 'data-filter': 'web', 'aria-pressed': 'false' }));
  chipWeb.textContent = 'Web (4)';
  const chipAi = register(new MockElement('button', '', ['filter-chip'], { 'data-filter': 'ai', 'aria-pressed': 'false' }));
  chipAi.textContent = 'AI (4)';

  filterToolbar.appendChild(chipAll);
  filterToolbar.appendChild(chipMobile);
  filterToolbar.appendChild(chipWeb);
  filterToolbar.appendChild(chipAi);
  projectsSection.appendChild(filterToolbar);

  // The 7 uniform project cards from index.html:
  const cardData = [
    { title: 'Namma Nellai', category: 'mobile' },
    { title: 'SwiftShare', category: 'mobile' },
    { title: 'HabitAI', category: 'web ai' },
    { title: 'AI Notes & Productivity App', category: 'web ai' },
    { title: 'Car Front Display GPS Tracker', category: 'web mobile' },
    { title: 'Road Hazard Risk Classifier', category: 'ai' },
    { title: 'Medicine Identification Platform', category: 'web ai' }
  ];

  const projectCards = cardData.map(c => {
    const card = register(new MockElement('article', '', ['project-card', 'reveal-on-scroll'], {
      'data-category': c.category
    }));
    const h3 = new MockElement('h3', '', ['project-title']);
    h3.textContent = c.title;
    card.appendChild(h3);
    projectsSection.appendChild(card);
    return card;
  });
  body.appendChild(projectsSection);

  // Other landmark sections for ScrollSpy:
  ['about', 'skills', 'achievements', 'certifications', 'contact'].forEach(id => {
    const sec = register(new MockElement('section', id, ['section', 'reveal-on-scroll']));
    body.appendChild(sec);
  });

  // Time & rAF management
  let currentTime = 1000;
  const rafCallbacks = new Map();
  let nextRafId = 1;
  const intervals = new Map();
  let nextIntervalId = 1;
  const timeouts = new Map();
  let nextTimeoutId = 1;
  const canceledRafIds = new Set();

  const mockWin = {
    document: mockDoc,
    innerWidth: currentWidth,
    innerHeight: 900,
    pageYOffset: 0,
    localStorage: mockStorage,
    matchMedia: (q) => {
      const isMotion = q.includes('prefers-reduced-motion');
      const isColor = q.includes('prefers-color-scheme');
      const isBreakpoint = q.includes('min-width: 1024px');

      let matches = false;
      if (isMotion) matches = currentReduced;
      else if (isColor) matches = currentColor === 'dark';
      else if (isBreakpoint) matches = currentWidth >= 1024;

      return {
        matches,
        media: q,
        addEventListener: (event, fn) => {
          if (event === 'change') {
            if (isMotion) mediaListeners.reducedMotion.push(fn);
            if (isColor) mediaListeners.colorScheme.push(fn);
            if (isBreakpoint) mediaListeners.breakpoint.push(fn);
          }
        },
        removeEventListener: (event, fn) => {
          if (event === 'change') {
            if (isMotion) mediaListeners.reducedMotion = mediaListeners.reducedMotion.filter(f => f !== fn);
            if (isColor) mediaListeners.colorScheme = mediaListeners.colorScheme.filter(f => f !== fn);
            if (isBreakpoint) mediaListeners.breakpoint = mediaListeners.breakpoint.filter(f => f !== fn);
          }
        },
        addListener: (fn) => {
          if (isMotion) mediaListeners.reducedMotion.push(fn);
          if (isColor) mediaListeners.colorScheme.push(fn);
          if (isBreakpoint) mediaListeners.breakpoint.push(fn);
        },
        removeListener: (fn) => {
          if (isMotion) mediaListeners.reducedMotion = mediaListeners.reducedMotion.filter(f => f !== fn);
          if (isColor) mediaListeners.colorScheme = mediaListeners.colorScheme.filter(f => f !== fn);
          if (isBreakpoint) mediaListeners.breakpoint = mediaListeners.breakpoint.filter(f => f !== fn);
        }
      };
    },
    requestAnimationFrame: (cb) => {
      const id = nextRafId++;
      rafCallbacks.set(id, cb);
      return id;
    },
    cancelAnimationFrame: (id) => {
      canceledRafIds.add(id);
      rafCallbacks.delete(id);
    },
    setTimeout: (cb, delay) => {
      const id = nextTimeoutId++;
      timeouts.set(id, { cb, due: currentTime + (delay || 0) });
      return id;
    },
    clearTimeout: (id) => {
      timeouts.delete(id);
    },
    setInterval: (cb, interval) => {
      const id = nextIntervalId++;
      intervals.set(id, { cb, interval, next: currentTime + interval });
      return id;
    },
    clearInterval: (id) => {
      intervals.delete(id);
    },
    addEventListener: (type, fn) => {
      if (!winListeners[type]) winListeners[type] = [];
      winListeners[type].push(fn);
    },
    removeEventListener: (type, fn) => {
      if (!winListeners[type]) return;
      winListeners[type] = winListeners[type].filter(f => f !== fn);
    },
    dispatchEvent: (evt) => {
      (winListeners[evt.type] || []).forEach(f => f(evt));
    },
    CustomEvent: function (type, params) {
      return { type, detail: params ? params.detail : null };
    },
    IntersectionObserver: MockIntersectionObserver
  };

  // Wire NodeJS globals for script.js execution
  global.window = mockWin;
  global.document = mockDoc;
  global.CustomEvent = mockWin.CustomEvent;
  global.requestAnimationFrame = mockWin.requestAnimationFrame;
  global.cancelAnimationFrame = mockWin.cancelAnimationFrame;
  global.IntersectionObserver = MockIntersectionObserver;

  // Clear module cache to get fresh script instance
  const scriptPath = path.resolve(__dirname, '..', 'script.js');
  delete require.cache[require.resolve(scriptPath)];
  const Portfolio = require(scriptPath);

  return {
    Portfolio,
    mockWin,
    mockDoc,
    mockStorage,
    mediaListeners,
    elements: {
      documentElement,
      body,
      themeToggleBtn,
      navToggleBtn,
      siteNav,
      navMenuUl,
      navLinks,
      roleRotator,
      statCgpa,
      statProjects,
      statCeh,
      statHackathons,
      filterToolbar,
      chips: { all: chipAll, mobile: chipMobile, web: chipWeb, ai: chipAi },
      projectCards
    },
    time: {
      get: () => currentTime,
      advance: (ms) => {
        const target = currentTime + ms;
        while (currentTime < target) {
          currentTime += Math.min(16.67, target - currentTime);
          const currentRafs = Array.from(rafCallbacks.entries());
          rafCallbacks.clear();
          for (const [id, cb] of currentRafs) {
            cb(currentTime);
          }
          for (const [id, t] of Array.from(timeouts.entries())) {
            if (currentTime >= t.due) {
              timeouts.delete(id);
              t.cb();
            }
          }
        }
      },
      tickRaf: () => {
        currentTime += 16.67;
        const currentRafs = Array.from(rafCallbacks.entries());
        rafCallbacks.clear();
        for (const [id, cb] of currentRafs) {
          cb(currentTime);
        }
      },
      getPendingRafCount: () => rafCallbacks.size,
      getCanceledRafIds: () => canceledRafIds
    },
    setReducedMotion: (reduced) => {
      currentReduced = reduced;
      mediaListeners.reducedMotion.forEach(fn => fn({ matches: reduced }));
    },
    setBreakpoint: (desktop) => {
      currentWidth = desktop ? 1280 : 768;
      mockWin.innerWidth = currentWidth;
      mediaListeners.breakpoint.forEach(fn => fn({ matches: desktop }));
    },
    cleanup: () => {
      if (Portfolio.RoleRotator && Portfolio.RoleRotator.stopTimer) {
        Portfolio.RoleRotator.stopTimer();
      }
    }
  };
}

// ============================================================================
// SUITE 1: RAPID THEME TOGGLING & LOCALSTORAGE ERROR RECOVERY
// ============================================================================
console.log('\n--- SUITE 1: Rapid Theme Toggling & Storage Error Recovery ---');

test('1.1: 100+ rapid sequential flips maintain parity, DOM tokens, and storage sync', () => {
  const env = createEnvironment();
  const tm = env.Portfolio.ThemeManager;
  tm.init();

  const root = env.elements.documentElement;
  const toggleBtn = env.elements.themeToggleBtn;

  assert.strictEqual(root.getAttribute('data-theme'), 'dark', 'Initial theme must be dark');
  assert.strictEqual(toggleBtn.getAttribute('aria-label'), 'Switch to light theme');

  // Perform 100 rapid flips
  for (let i = 0; i < 100; i++) {
    tm.toggleTheme();
  }

  // After an even number of flips (100), state must return precisely to 'dark'
  assert.strictEqual(root.getAttribute('data-theme'), 'dark', 'Theme must be dark after 100 toggles');
  assert.strictEqual(env.mockStorage.getItem('theme'), 'dark', 'localStorage PRIMARY_KEY must be dark');
  assert.strictEqual(env.mockStorage.getItem('portfolio-theme'), 'dark', 'localStorage ALIAS_KEY must be dark');
  assert.strictEqual(toggleBtn.getAttribute('aria-label'), 'Switch to light theme');

  // 101st flip -> must become 'light'
  const next = tm.toggleTheme();
  assert.strictEqual(next, 'light');
  assert.strictEqual(root.getAttribute('data-theme'), 'light');
  assert.strictEqual(env.mockStorage.getItem('theme'), 'light');
  assert.strictEqual(toggleBtn.getAttribute('aria-label'), 'Switch to dark theme');

  env.cleanup();
});

test('1.2: Event propagation audit: themechange CustomEvent fires with correct detail payload on flips', () => {
  const env = createEnvironment();
  const tm = env.Portfolio.ThemeManager;
  tm.init();

  const recordedEvents = [];
  env.mockWin.addEventListener('themechange', (e) => {
    recordedEvents.push(e.detail);
  });

  // Toggle 10 times
  for (let i = 0; i < 10; i++) {
    tm.toggleTheme();
  }

  assert.strictEqual(recordedEvents.length, 10, 'Must dispatch exactly 10 themechange events');
  assert.strictEqual(recordedEvents[0].theme, 'light');
  assert.strictEqual(recordedEvents[0].isUserAction, true);
  assert.strictEqual(recordedEvents[1].theme, 'dark');
  assert.strictEqual(recordedEvents[1].isUserAction, true);

  env.cleanup();
});

test('1.3: Storage recovery: QuotaExceededError during setItem does not crash and updates DOM', () => {
  const env = createEnvironment({ localStorageMode: 'quota' });
  const tm = env.Portfolio.ThemeManager;
  tm.init();

  // Storage setItem will throw QuotaExceededError
  assert.doesNotThrow(() => {
    tm.setTheme('light', true);
  }, 'QuotaExceededError must be caught gracefully by setStoredTheme');

  // DOM attribute and button label must still update smoothly
  assert.strictEqual(env.elements.documentElement.getAttribute('data-theme'), 'light');
  assert.strictEqual(env.elements.themeToggleBtn.getAttribute('aria-label'), 'Switch to dark theme');

  // Toggle must also succeed without throwing
  assert.doesNotThrow(() => {
    const next = tm.toggleTheme();
    assert.strictEqual(next, 'dark');
  }, 'toggleTheme must not throw when storage is full');

  assert.strictEqual(env.elements.documentElement.getAttribute('data-theme'), 'dark');
  env.cleanup();
});

test('1.4: Storage recovery: SecurityError (sandboxed iframe / cookies blocked) handled cleanly', () => {
  const env = createEnvironment({ localStorageMode: 'security' });
  const tm = env.Portfolio.ThemeManager;

  // Both getItem and setItem throw SecurityError
  assert.doesNotThrow(() => {
    tm.init();
  }, 'init must not throw under SecurityError');

  assert.doesNotThrow(() => {
    const th = tm.getTheme();
    assert.ok(th === 'dark' || th === 'light', 'Must return fallback valid theme');
  }, 'getTheme must handle SecurityError gracefully');

  assert.doesNotThrow(() => {
    tm.toggleTheme();
  }, 'toggleTheme must handle SecurityError gracefully');

  env.cleanup();
});

test('1.5: Adversarial and malformed storage values sanitize safely to valid themes', () => {
  const env = createEnvironment();
  const tm = env.Portfolio.ThemeManager;

  const adversarialInputs = [
    null,
    undefined,
    '',
    '   ',
    'DARK',
    'LIGHT',
    'true',
    'false',
    'null',
    'undefined',
    '<script>alert(1)</script>',
    '__proto__',
    'constructor',
    '[object Object]',
    '{"theme":"dark"}'
  ];

  adversarialInputs.forEach(input => {
    env.mockStorage.setItem('theme', input);
    env.mockStorage.setItem('portfolio-theme', input);
    const resolved = tm.getTheme();
    assert.ok(resolved === 'dark' || resolved === 'light',
      `Input "${input}" produced non-standard theme "${resolved}"`);
  });

  // Direct injection into setTheme with invalid strings falls back to 'dark'
  tm.setTheme('UNRECOGNIZED_THEME_TOKEN', true);
  assert.strictEqual(env.elements.documentElement.getAttribute('data-theme'), 'dark');

  env.cleanup();
});

// ============================================================================
// SUITE 2: RAPID PROJECT CATEGORY FILTER SWITCHES & COMPOUND TAG RESOLUTION
// ============================================================================
console.log('\n--- SUITE 2: Rapid Category Filter Switches & Compound Tags ---');

test('2.1: Truth table baseline: All 7 project cards and compound tags match specs', () => {
  const env = createEnvironment();
  const pf = env.Portfolio.ProjectFilter;
  pf.init();

  const cards = env.elements.projectCards;
  assert.strictEqual(cards.length, 7, 'Must have exactly 7 project cards matching index.html');

  // Verify ground truth categories from HTML:
  // 1. Namma Nellai -> mobile
  // 2. SwiftShare -> mobile
  // 3. HabitAI -> web ai (compound)
  // 4. AI Notes -> web ai (compound)
  // 5. GPS Tracker -> web mobile (compound)
  // 6. Road Hazard -> ai
  // 7. Medicine Platform -> web ai (compound)
  const expectedCategories = ['mobile', 'mobile', 'web ai', 'web ai', 'web mobile', 'ai', 'web ai'];
  cards.forEach((c, idx) => {
    assert.strictEqual(c.getAttribute('data-category'), expectedCategories[idx]);
  });

  // Test 'all' filter: all 7 visible
  pf.applyFilter('all');
  assert.strictEqual(cards.filter(c => !c.classList.contains('is-hidden')).length, 7);

  // Test 'mobile' filter: cards 0, 1, 4 visible (3 cards)
  pf.applyFilter('mobile');
  const visibleMobile = cards.filter(c => !c.classList.contains('is-hidden'));
  assert.strictEqual(visibleMobile.length, 3, 'Mobile category must show exactly 3 cards');
  assert.strictEqual(cards[0].classList.contains('is-hidden'), false, 'Namma Nellai visible');
  assert.strictEqual(cards[1].classList.contains('is-hidden'), false, 'SwiftShare visible');
  assert.strictEqual(cards[4].classList.contains('is-hidden'), false, 'GPS Tracker visible (compound web mobile)');
  assert.strictEqual(cards[2].classList.contains('is-hidden'), true, 'HabitAI hidden');

  // Test 'web' filter: cards 2, 3, 4, 6 visible (4 cards)
  pf.applyFilter('web');
  const visibleWeb = cards.filter(c => !c.classList.contains('is-hidden'));
  assert.strictEqual(visibleWeb.length, 4, 'Web category must show exactly 4 cards');
  assert.strictEqual(cards[2].classList.contains('is-hidden'), false, 'HabitAI visible (compound web ai)');
  assert.strictEqual(cards[3].classList.contains('is-hidden'), false, 'AI Notes visible (compound web ai)');
  assert.strictEqual(cards[4].classList.contains('is-hidden'), false, 'GPS Tracker visible (compound web mobile)');
  assert.strictEqual(cards[6].classList.contains('is-hidden'), false, 'Medicine visible (compound web ai)');
  assert.strictEqual(cards[0].classList.contains('is-hidden'), true, 'Namma Nellai hidden');

  // Test 'ai' filter: cards 2, 3, 5, 6 visible (4 cards)
  pf.applyFilter('ai');
  const visibleAi = cards.filter(c => !c.classList.contains('is-hidden'));
  assert.strictEqual(visibleAi.length, 4, 'AI category must show exactly 4 cards');
  assert.strictEqual(cards[2].classList.contains('is-hidden'), false, 'HabitAI visible (compound web ai)');
  assert.strictEqual(cards[3].classList.contains('is-hidden'), false, 'AI Notes visible (compound web ai)');
  assert.strictEqual(cards[5].classList.contains('is-hidden'), false, 'Road Hazard visible');
  assert.strictEqual(cards[6].classList.contains('is-hidden'), false, 'Medicine visible (compound web ai)');
  assert.strictEqual(cards[0].classList.contains('is-hidden'), true, 'Namma Nellai hidden');

  env.cleanup();
});

test('2.2: 100 random rapid category filter switches maintain 100% state precision', () => {
  const env = createEnvironment();
  const pf = env.Portfolio.ProjectFilter;
  pf.init();

  const categories = ['all', 'mobile', 'web', 'ai'];
  const expectedCounts = { all: 7, mobile: 3, web: 4, ai: 4 };
  const cards = env.elements.projectCards;
  const chips = [env.elements.chips.all, env.elements.chips.mobile, env.elements.chips.web, env.elements.chips.ai];

  // Seeded deterministic pseudorandom sequence
  let seed = 42;
  function pseudoRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  for (let step = 0; step < 100; step++) {
    const selectedCat = categories[Math.floor(pseudoRandom() * categories.length)];
    const matchingChip = chips.find(c => c.getAttribute('data-filter') === selectedCat);

    pf.applyFilter(selectedCat, matchingChip);

    // 1. Verify active filter getter
    assert.strictEqual(pf.getActiveFilter(), selectedCat, `Active filter must be ${selectedCat}`);

    // 2. Verify chip visual & ARIA states
    chips.forEach(chip => {
      const isTarget = chip.getAttribute('data-filter') === selectedCat;
      assert.strictEqual(chip.classList.contains('active'), isTarget, `Chip ${chip.getAttribute('data-filter')} active class mismatch`);
      assert.strictEqual(chip.getAttribute('aria-pressed'), isTarget ? 'true' : 'false', `Chip ${chip.getAttribute('data-filter')} aria-pressed mismatch`);
    });

    // 3. Verify card visibility and count
    const visibleCards = cards.filter(c => !c.classList.contains('is-hidden'));
    assert.strictEqual(visibleCards.length, expectedCounts[selectedCat],
      `Step ${step}: Expected ${expectedCounts[selectedCat]} visible for '${selectedCat}', found ${visibleCards.length}`);

    // 4. Verify compound tag correctness for each card
    cards.forEach(card => {
      const cardCats = card.getAttribute('data-category').toLowerCase().trim().split(/\s+/);
      const shouldBeVisible = selectedCat === 'all' || cardCats.includes(selectedCat);
      assert.strictEqual(!card.classList.contains('is-hidden'), shouldBeVisible,
        `Card ${card.querySelector('.project-title').textContent} visibility mismatch on filter ${selectedCat}`);
    });
  }

  env.cleanup();
});

test('2.3: prefers-reduced-motion bypass prevents lingering inline style artifacts during filtering', () => {
  const env = createEnvironment({ prefersReduced: true });
  const pf = env.Portfolio.ProjectFilter;
  pf.init();

  const cards = env.elements.projectCards;

  // Filter with reduced motion active
  pf.applyFilter('mobile');

  cards.forEach(card => {
    // Under reduced motion, no inline opacity/transform/transition should linger
    assert.strictEqual(card.style.opacity, '', 'Opacity style must be cleared under reduced motion');
    assert.strictEqual(card.style.transform, '', 'Transform style must be cleared under reduced motion');
    assert.strictEqual(card.style.transition, '', 'Transition style must be cleared under reduced motion');
  });

  env.cleanup();
});

test('2.4: Toolbar keyboard navigation (ArrowLeft/Right/Home/End) wrap-around and focus sync', () => {
  const env = createEnvironment();
  const pf = env.Portfolio.ProjectFilter;
  pf.init();

  const toolbar = env.elements.filterToolbar;
  const chips = [env.elements.chips.all, env.elements.chips.mobile, env.elements.chips.web, env.elements.chips.ai];

  // Start with focus on chip 0 ('all')
  chips[0].focus();
  assert.strictEqual(env.mockDoc.activeElement, chips[0]);

  // ArrowRight -> chip 1 ('mobile')
  toolbar.dispatchEvent({ type: 'keydown', key: 'ArrowRight', preventDefault() {} });
  assert.strictEqual(env.mockDoc.activeElement, chips[1]);
  assert.strictEqual(pf.getActiveFilter(), 'mobile');

  // End key -> chip 3 ('ai')
  toolbar.dispatchEvent({ type: 'keydown', key: 'End', preventDefault() {} });
  assert.strictEqual(env.mockDoc.activeElement, chips[3]);
  assert.strictEqual(pf.getActiveFilter(), 'ai');

  // ArrowRight from last chip -> wraps to chip 0 ('all')
  toolbar.dispatchEvent({ type: 'keydown', key: 'ArrowRight', preventDefault() {} });
  assert.strictEqual(env.mockDoc.activeElement, chips[0]);
  assert.strictEqual(pf.getActiveFilter(), 'all');

  // ArrowLeft from first chip -> wraps to chip 3 ('ai')
  toolbar.dispatchEvent({ type: 'keydown', key: 'ArrowLeft', preventDefault() {} });
  assert.strictEqual(env.mockDoc.activeElement, chips[3]);
  assert.strictEqual(pf.getActiveFilter(), 'ai');

  // Home key -> chip 0 ('all')
  toolbar.dispatchEvent({ type: 'keydown', key: 'Home', preventDefault() {} });
  assert.strictEqual(env.mockDoc.activeElement, chips[0]);
  assert.strictEqual(pf.getActiveFilter(), 'all');

  env.cleanup();
});

// ============================================================================
// SUITE 3: DYNAMIC PREFERS-REDUCED-MOTION TOGGLING DURING rAF COUNTER LOOPS
// ============================================================================
console.log('\n--- SUITE 3: Dynamic prefers-reduced-motion Toggles During rAF Counters ---');

test('3.1: Stat counter math: easeOutExpo monotonicity, boundary settling, and formatNumber decimals', () => {
  const env = createEnvironment();
  const motion = env.Portfolio.MotionSubsystem;

  // Boundary checks on easeOutExpo
  assert.strictEqual(motion.easeOutExpo(0), 0, 'easeOutExpo(0) must be 0');
  assert.strictEqual(motion.easeOutExpo(1), 1, 'easeOutExpo(1) must be 1');

  // Strict monotonicity check across 1,000 steps
  let lastVal = -1;
  for (let i = 0; i <= 1000; i++) {
    const x = i / 1000;
    const y = motion.easeOutExpo(x);
    assert.ok(y >= lastVal, `easeOutExpo non-monotonic at x=${x}`);
    assert.ok(y >= 0 && y <= 1, `easeOutExpo out of bounds [0, 1] at x=${x}: y=${y}`);
    lastVal = y;
  }

  // formatNumber decimal precision checks
  assert.strictEqual(motion.formatNumber(9.46, 2), '9.46');
  assert.strictEqual(motion.formatNumber(9.46000001, 2), '9.46');
  assert.strictEqual(motion.formatNumber(7, 0), '7');
  assert.strictEqual(motion.formatNumber(9, 0), '9');
  assert.strictEqual(motion.formatNumber(0, 2), '0.00');

  env.cleanup();
});

test('3.2: Dynamic prefers-reduced-motion toggle mid-animation immediately cancels rAF and forces targets', () => {
  const env = createEnvironment({ prefersReduced: false });
  const motion = env.Portfolio.MotionSubsystem;
  motion.init();

  const statCgpa = env.elements.statCgpa; // target 9.46, decimals 2
  const statProjects = env.elements.statProjects; // target 7
  const statHackathons = env.elements.statHackathons; // target 9
  const statCeh = env.elements.statCeh; // CEH badge (untouched)

  // Trigger stat counter animations
  motion.animateStatCounter(statCgpa, 9.46, 2, 1800);
  motion.animateStatCounter(statProjects, 7, 0, 1800);
  motion.animateStatCounter(statHackathons, 9, 0, 1800);

  // Advance time to 500ms (~28% elapsed): animations are actively running
  env.time.advance(500);

  // Verify counters are mid-animation
  const midCgpa = parseFloat(statCgpa.textContent);
  const midProjects = parseInt(statProjects.textContent, 10);
  assert.ok(midCgpa > 0 && midCgpa < 9.46, `CGPA should be in-flight (was: ${midCgpa})`);
  assert.ok(midProjects >= 0 && midProjects <= 7, `Projects should be in-flight (was: ${midProjects})`);
  assert.ok(env.time.getPendingRafCount() > 0, 'rAF callbacks must be actively queued in-flight');

  // ADVERSARIAL ACTION: User dynamically enables prefers-reduced-motion in OS settings mid-flight!
  env.setReducedMotion(true);

  // VERIFICATION 1: All in-flight rAF callbacks must be immediately cancelled
  assert.strictEqual(env.time.getPendingRafCount(), 0, 'All pending rAF callbacks must be canceled immediately');
  assert.ok(env.time.getCanceledRafIds().size > 0, 'cancelAnimationFrame must have been called on active frames');

  // VERIFICATION 2: All stat elements must be immediately forced to their final formatted target strings
  assert.strictEqual(statCgpa.textContent, '9.46', 'CGPA counter must immediately display 9.46');
  assert.strictEqual(statProjects.textContent, '7', 'Projects counter must immediately display 7');
  assert.strictEqual(statHackathons.textContent, '9', 'Hackathons counter must immediately display 9');

  // VERIFICATION 3: CEH badge was completely untouched
  assert.strictEqual(statCeh.textContent, 'CEH', 'CEH static badge must remain intact');

  // VERIFICATION 4: Advance time by 3000ms — no late callbacks should overwrite or alter target values
  env.time.advance(3000);
  assert.strictEqual(statCgpa.textContent, '9.46', 'CGPA must not be mutated by ghost callbacks');
  assert.strictEqual(statProjects.textContent, '7', 'Projects must not be mutated by ghost callbacks');
  assert.strictEqual(statHackathons.textContent, '9', 'Hackathons must not be mutated by ghost callbacks');

  env.cleanup();
});

test('3.3: Initializing with prefers-reduced-motion active bypasses rAF entirely and forces final values', () => {
  const env = createEnvironment({ prefersReduced: true });
  const motion = env.Portfolio.MotionSubsystem;
  motion.init();

  // Elements must be immediately at final state upon initialization
  assert.strictEqual(env.elements.statCgpa.textContent, '9.46');
  assert.strictEqual(env.elements.statProjects.textContent, '7');
  assert.strictEqual(env.elements.statHackathons.textContent, '9');
  assert.strictEqual(env.elements.statCeh.textContent, 'CEH');

  // Zero animation frames should have been requested
  assert.strictEqual(env.time.getPendingRafCount(), 0);

  // Calling animateStatCounter under reduced motion immediately formats and returns
  const testEl = new MockElement('span', '', ['stat-number'], { 'data-target': '100' });
  motion.animateStatCounter(testEl, 100, 0, 1000);
  assert.strictEqual(testEl.textContent, '100');
  assert.strictEqual(env.time.getPendingRafCount(), 0);

  env.cleanup();
});

test('3.4: Rapid oscillating prefers-reduced-motion toggling (50 cycles) does not corrupt state or throw', () => {
  const env = createEnvironment({ prefersReduced: false });
  const motion = env.Portfolio.MotionSubsystem;
  motion.init();

  assert.doesNotThrow(() => {
    for (let i = 0; i < 50; i++) {
      env.setReducedMotion(i % 2 === 0);
      env.time.tickRaf();
    }
  }, 'Rapid reduced-motion oscillations must not throw');

  // Final values must be settled cleanly
  assert.strictEqual(env.elements.statCgpa.textContent, '9.46');
  assert.strictEqual(env.elements.statProjects.textContent, '7');
  assert.strictEqual(env.elements.statHackathons.textContent, '9');

  env.cleanup();
});

// ============================================================================
// SUITE 4: RESIZING ACROSS 1024PX DESKTOP BREAKPOINT WHILE MOBILE DRAWER IS OPEN
// ============================================================================
console.log('\n--- SUITE 4: Resizing Across 1024px Breakpoint with Open Mobile Drawer ---');

test('4.1: Desktop resize (>= 1024px) while drawer is open triggers auto-dismissal and unlocks body scroll', () => {
  const env = createEnvironment({ innerWidth: 375 }); // Mobile viewport
  const nav = env.Portfolio.MobileNavManager;
  nav.init();

  const navToggle = env.elements.navToggleBtn;
  const siteNav = env.elements.siteNav;
  const body = env.elements.body;

  // Initially closed on mobile
  assert.strictEqual(nav.isOpen(), false);
  assert.strictEqual(navToggle.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(siteNav.getAttribute('aria-hidden'), 'true');
  assert.strictEqual(body.classList.contains('menu-open'), false);

  // Open mobile drawer
  nav.open();
  assert.strictEqual(nav.isOpen(), true, 'Drawer must be open');
  assert.strictEqual(siteNav.classList.contains('is-open'), true);
  assert.strictEqual(body.classList.contains('menu-open'), true, 'Body scroll must be locked');
  assert.strictEqual(navToggle.getAttribute('aria-expanded'), 'true');
  assert.strictEqual(navToggle.getAttribute('aria-label'), 'Close navigation menu');
  assert.strictEqual(siteNav.getAttribute('aria-hidden'), 'false');

  // ADVERSARIAL ACTION: Viewport is resized across 1024px to desktop (e.g. tablet rotated to landscape)
  env.setBreakpoint(true); // >= 1024px

  // VERIFICATION 1: Drawer is automatically dismissed
  assert.strictEqual(nav.isOpen(), false, 'Drawer must auto-dismiss on desktop breakpoint');
  assert.strictEqual(siteNav.classList.contains('is-open'), false);

  // VERIFICATION 2: Body scroll lock is immediately released
  assert.strictEqual(body.classList.contains('menu-open'), false, 'Body scroll lock must be released on desktop');

  // VERIFICATION 3: ARIA attributes are updated for desktop
  assert.strictEqual(navToggle.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(siteNav.getAttribute('aria-hidden'), null, 'Desktop nav must not have aria-hidden (must be accessible to desktop assistive tech)');

  env.cleanup();
});

test('4.2: 100 rapid breakpoint crossings alternating mobile/desktop never leave body scroll locked', () => {
  const env = createEnvironment({ innerWidth: 375 });
  const nav = env.Portfolio.MobileNavManager;
  nav.init();

  const body = env.elements.body;
  const siteNav = env.elements.siteNav;

  for (let cycle = 0; cycle < 100; cycle++) {
    // 1. Mobile width (< 1024px)
    env.setBreakpoint(false);
    assert.strictEqual(nav.isOpen(), false);

    // 2. User opens drawer on mobile
    nav.open();
    assert.strictEqual(nav.isOpen(), true);
    assert.strictEqual(body.classList.contains('menu-open'), true);

    // 3. User rotates screen or resizes to desktop (>= 1024px)
    env.setBreakpoint(true);

    // 4. Assert invariant: on desktop, drawer MUST be closed and body MUST NOT be locked
    assert.strictEqual(nav.isOpen(), false, `Cycle ${cycle}: Drawer must be closed on desktop`);
    assert.strictEqual(body.classList.contains('menu-open'), false, `Cycle ${cycle}: Body scroll must NOT be locked on desktop`);
    assert.strictEqual(siteNav.getAttribute('aria-hidden'), null, `Cycle ${cycle}: Desktop nav must not have aria-hidden`);
  }

  env.cleanup();
});

test('4.3: Keyboard trap and click listeners are cleanly unbound upon desktop auto-dismissal', () => {
  const env = createEnvironment({ innerWidth: 375 });
  const nav = env.Portfolio.MobileNavManager;
  nav.init();

  nav.open();
  assert.strictEqual(nav.isOpen(), true);

  // Resize to desktop
  env.setBreakpoint(true);
  assert.strictEqual(nav.isOpen(), false);

  // Dispatch Tab keydown on document — focus trap must NOT intervene or prevent default
  let tabPrevented = false;
  env.mockDoc.dispatchEvent({
    type: 'keydown',
    key: 'Tab',
    shiftKey: false,
    preventDefault: () => { tabPrevented = true; }
  });
  assert.strictEqual(tabPrevented, false, 'Tab keydown must not be trapped when drawer was auto-dismissed');

  // Dispatch Escape keydown — should not cause errors
  let escPrevented = false;
  assert.doesNotThrow(() => {
    env.mockDoc.dispatchEvent({
      type: 'keydown',
      key: 'Escape',
      preventDefault: () => { escPrevented = true; }
    });
  });
  assert.strictEqual(escPrevented, false);

  env.cleanup();
});

test('4.4: Desktop to mobile resize with closed drawer properly initializes aria-hidden="true"', () => {
  const env = createEnvironment({ innerWidth: 1280 }); // Desktop start
  const nav = env.Portfolio.MobileNavManager;
  nav.init();

  const siteNav = env.elements.siteNav;
  assert.strictEqual(siteNav.getAttribute('aria-hidden'), null, 'Desktop initial nav has no aria-hidden');

  // Resize to mobile
  env.setBreakpoint(false);
  assert.strictEqual(siteNav.getAttribute('aria-hidden'), 'true', 'Mobile nav must have aria-hidden="true" when closed');
  assert.strictEqual(env.elements.body.classList.contains('menu-open'), false);

  env.cleanup();
});

// ============================================================================
// SUITE 5: HIGH-FREQUENCY CROSS-MODULE CONCURRENCY & BOMBARDMENT FUZZING
// ============================================================================
console.log('\n--- SUITE 5: High-Frequency Cross-Module Concurrency & Bombardment ---');

test('5.1: 500 concurrent randomized operations across all modules complete with 0 unhandled exceptions', () => {
  const env = createEnvironment();
  env.Portfolio.init();

  const tm = env.Portfolio.ThemeManager;
  const nav = env.Portfolio.MobileNavManager;
  const pf = env.Portfolio.ProjectFilter;
  const motion = env.Portfolio.MotionSubsystem;
  const rr = env.Portfolio.RoleRotator;

  const filterOpts = ['all', 'mobile', 'web', 'ai'];

  const operations = [
    () => tm.toggleTheme(),
    () => nav.toggle(),
    () => nav.open(),
    () => nav.close(false),
    () => pf.applyFilter(filterOpts[Math.floor(Math.random() * filterOpts.length)]),
    () => rr.next(),
    () => env.setBreakpoint(Math.random() > 0.5),
    () => env.setReducedMotion(Math.random() > 0.5),
    () => env.time.tickRaf(),
    () => env.mockDoc.dispatchEvent({ type: 'keydown', key: 'Tab', shiftKey: false, preventDefault() {} }),
    () => env.mockDoc.dispatchEvent({ type: 'keydown', key: 'Tab', shiftKey: true, preventDefault() {} }),
    () => env.mockDoc.dispatchEvent({ type: 'keydown', key: 'Escape', preventDefault() {} }),
    () => env.mockWin.dispatchEvent({ type: 'scroll' }),
    () => env.mockWin.dispatchEvent({ type: 'storage', key: 'theme', newValue: 'light' })
  ];

  assert.doesNotThrow(() => {
    for (let i = 0; i < 500; i++) {
      const op = operations[i % operations.length];
      op();
    }
  }, 'Bombardment of 500 mixed concurrent operations must not throw unhandled exceptions');

  env.cleanup();
});

// ============================================================================
// FINAL VERDICT & SUMMARY REPORT
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('ADVERSARIAL STRESS TEST EXECUTION VERDICT');
console.log('='.repeat(80));
console.log(`TOTAL TESTS EXECUTED : ${passedCount + failedCount}`);
console.log(`PASSED               : ${passedCount}`);
console.log(`FAILED               : ${failedCount}`);
console.log(`PASS RATE            : ${((passedCount / (passedCount + failedCount)) * 100).toFixed(1)}%`);
console.log('='.repeat(80));

if (failedCount > 0) {
  console.error('\nFAILURES RECORDED:');
  testResults.filter(r => r.status === 'FAIL').forEach((f, i) => {
    console.error(`\n[${i + 1}] ${f.name}`);
    console.error(`    ${f.error}`);
  });
  process.exit(1);
} else {
  console.log('\nALL EMPIRICAL ADVERSARIAL STRESS TESTS PASSED WITH 100% SUCCESS.');
  process.exit(0);
}
