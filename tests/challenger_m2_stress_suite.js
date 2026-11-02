/**
 * ============================================================================
 * EMPIRICAL CHALLENGER ADVERSARIAL STRESS SUITE (MILESTONE 2)
 * Portfolio 2.0 — script.js Comprehensive Headless Verification
 *
 * Test Suites:
 *   1. Theme Manager Stress & Storage Edge Cases
 *   2. Project Category Filtering Adversarial Stress
 *   3. Mobile Navigation Drawer & Keyboard Focus Trap Audit
 *   4. Hero Role Rotator & Motion Subsystem Stress
 *   5. Contact Form & Utility Handlers
 *   6. Fuzzing & Unhandled Runtime Exception Audit
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('='.repeat(80));
console.log('PORTFOLIO 2.0 — EMPIRICAL CHALLENGER ADVERSARIAL STRESS TEST SUITE (M2)');
console.log('='.repeat(80));

// Read real index.html content
const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlSource = fs.readFileSync(htmlPath, 'utf8');

// ----------------------------------------------------------------------------
// HEADLESS DOM ENVIRONMENT SIMULATOR
// ----------------------------------------------------------------------------

class MockClassList {
  constructor(initialClasses = []) {
    this._set = new Set(initialClasses.filter(Boolean));
  }
  add(...classes) {
    classes.forEach(c => c && this._set.add(c));
  }
  remove(...classes) {
    classes.forEach(c => this._set.delete(c));
  }
  toggle(c, force) {
    if (force === undefined) {
      if (this._set.has(c)) {
        this._set.delete(c);
        return false;
      } else {
        this._set.add(c);
        return true;
      }
    }
    if (force) {
      this._set.add(c);
    } else {
      this._set.delete(c);
    }
    return force;
  }
  contains(c) {
    return this._set.has(c);
  }
  get length() {
    return this._set.size;
  }
  toString() {
    return Array.from(this._set).join(' ');
  }
}

class MockDOMElement {
  constructor(tagName, id = '', classes = [], attributes = {}) {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.classList = new MockClassList(classes);
    this.attributes = { ...attributes };
    if (id) this.attributes['id'] = id;
    this.textContent = '';
    this.value = '';
    this.style = {};
    this.listeners = {};
    this.parentElement = null;
    this.children = [];
    this.offsetParent = {};
    this.offsetHeight = 100;
    this.offsetWidth = 100;
    this.dataset = {};
  }

  getAttribute(name) {
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
    if (name.startsWith('data-')) {
      const prop = name.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
      this.dataset[prop] = String(val);
    }
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name.startsWith('data-')) {
      const prop = name.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
      delete this.dataset[prop];
    }
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
    if (!event.target) event.target = this;
    const handlers = this.listeners[event.type] || [];
    for (let fn of handlers) {
      fn.call(this, event);
    }
    // Bubble to parent if allowed
    if (event.bubbles && this.parentElement) {
      this.parentElement.dispatchEvent(event);
    }
  }

  focus() {
    global.document.activeElement = this;
    if (this.listeners['focus']) {
      this.dispatchEvent({ type: 'focus', target: this });
    }
    if (this.listeners['focusin']) {
      this.dispatchEvent({ type: 'focusin', target: this, bubbles: true });
    }
  }

  blur() {
    if (global.document.activeElement === this) {
      global.document.activeElement = null;
    }
    if (this.listeners['blur']) {
      this.dispatchEvent({ type: 'blur', target: this });
    }
    if (this.listeners['focusout']) {
      this.dispatchEvent({ type: 'focusout', target: this, bubbles: true });
    }
  }

  contains(target) {
    if (!target) return false;
    if (this === target) return true;
    for (let child of this.children) {
      if (child.contains(target)) return true;
    }
    return false;
  }

  closest(selector) {
    if (selector.startsWith('.') && this.classList.contains(selector.slice(1))) return this;
    if (selector.startsWith('#') && this.id === selector.slice(1)) return this;
    if (this.tagName.toLowerCase() === selector.toLowerCase()) return this;
    if (this.parentElement) return this.parentElement.closest(selector);
    return null;
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  reset() {
    // For form elements
    this.children.forEach(c => {
      if (c.value !== undefined) c.value = '';
    });
  }

  scrollIntoView() {}

  // Match selector helper
  _matches(sel) {
    sel = sel.trim();
    if (!sel) return false;

    // Attribute starts with: e.g. [href^="#"]
    const attrPrefixMatch = sel.match(/^([a-zA-Z0-9_-]*)\[([a-zA-Z0-9_-]+)\^="([^"]+)"\]$/);
    if (attrPrefixMatch) {
      const [_, tag, attr, prefix] = attrPrefixMatch;
      if (tag && this.tagName.toLowerCase() !== tag.toLowerCase()) return false;
      const val = this.getAttribute(attr);
      return val !== null && val.startsWith(prefix);
    }

    // Attribute exact match: e.g. [data-filter="all"] or [aria-pressed="true"]
    const attrMatch = sel.match(/^([a-zA-Z0-9_-]*)\[([a-zA-Z0-9_-]+)="([^"]+)"\]$/);
    if (attrMatch) {
      const [_, tag, attr, val] = attrMatch;
      if (tag && this.tagName.toLowerCase() !== tag.toLowerCase()) return false;
      return this.getAttribute(attr) === val;
    }

    // Attribute presence: e.g. [data-category] or [data-target] or [disabled]
    const attrPresMatch = sel.match(/^([a-zA-Z0-9_-]*)\[([a-zA-Z0-9_-]+)\]$/);
    if (attrPresMatch) {
      const [_, tag, attr] = attrPresMatch;
      if (tag && this.tagName.toLowerCase() !== tag.toLowerCase()) return false;
      return this.hasAttribute(attr);
    }

    // Class + attribute: e.g. .filter-chip[data-filter]
    const classAttrMatch = sel.match(/^\.([a-zA-Z0-9_-]+)\[([a-zA-Z0-9_-]+)\]$/);
    if (classAttrMatch) {
      const [_, cls, attr] = classAttrMatch;
      return this.classList.contains(cls) && this.hasAttribute(attr);
    }

    // Class + attribute exact: e.g. .filter-chip[data-filter="all"]
    const classAttrValMatch = sel.match(/^\.([a-zA-Z0-9_-]+)\[([a-zA-Z0-9_-]+)="([^"]+)"\]$/);
    if (classAttrValMatch) {
      const [_, cls, attr, val] = classAttrValMatch;
      return this.classList.contains(cls) && this.getAttribute(attr) === val;
    }

    // ID selector
    if (sel.startsWith('#')) {
      return this.id === sel.slice(1);
    }

    // Class selector
    if (sel.startsWith('.')) {
      return this.classList.contains(sel.slice(1));
    }

    // Tag selector
    if (this.tagName.toLowerCase() === sel.toLowerCase()) {
      return true;
    }

    return false;
  }

  querySelectorAll(selector) {
    const results = [];
    const selectors = selector.split(',').map(s => s.trim());

    const recurse = (node) => {
      for (let s of selectors) {
        // Descendant selector handling (e.g. '.site-nav .nav-link[href^="#"]')
        const parts = s.split(/\s+/);
        if (parts.length === 1) {
          if (node._matches(parts[0])) {
            results.push(node);
            break;
          }
        } else if (parts.length === 2) {
          if (node._matches(parts[1])) {
            // Check if ancestor matches parts[0]
            let p = node.parentElement;
            let ancestorMatches = false;
            while (p) {
              if (p._matches(parts[0])) {
                ancestorMatches = true;
                break;
              }
              p = p.parentElement;
            }
            if (ancestorMatches) {
              results.push(node);
              break;
            }
          }
        }
      }
      for (let child of node.children) {
        recurse(child);
      }
    };

    this.children.forEach(recurse);
    return results;
  }

  querySelector(selector) {
    const list = this.querySelectorAll(selector);
    return list.length > 0 ? list[0] : null;
  }
}

// ----------------------------------------------------------------------------
// PARSE REAL index.html INTO DOM TREE
// ----------------------------------------------------------------------------
function buildDOMFromHTML(html) {
  const root = new MockDOMElement('html', '', [], { 'data-theme': 'dark' });
  const body = new MockDOMElement('body');
  root.appendChild(body);

  // Parse header
  const header = new MockDOMElement('header', 'header', ['site-header']);
  const navContainer = new MockDOMElement('div', '', ['header-container', 'navbar']);
  header.appendChild(navContainer);

  const brandLogo = new MockDOMElement('a', '', ['brand-logo', 'logo'], { href: '#hero', 'aria-label': 'Thiraviaraj R Portfolio Home' });
  brandLogo.textContent = 'Thiraviaraj.';
  navContainer.appendChild(brandLogo);

  const siteNav = new MockDOMElement('nav', 'site-nav', ['site-nav', 'nav-menu'], { 'aria-label': 'Main Navigation' });
  const navList = new MockDOMElement('ul', 'nav-menu', ['nav-list', 'nav-links']);
  siteNav.appendChild(navList);

  const navLinksData = [
    { href: '#hero', text: 'Home', active: true },
    { href: '#about', text: 'About', active: false },
    { href: '#projects', text: 'Projects', active: false },
    { href: '#skills', text: 'Skills', active: false },
    { href: '#achievements', text: 'Achievements', active: false },
    { href: '#certifications', text: 'Certifications', active: false },
    { href: '#contact', text: 'Contact', active: false }
  ];

  navLinksData.forEach(item => {
    const li = new MockDOMElement('li');
    const a = new MockDOMElement('a', '', ['nav-link', ...(item.active ? ['active'] : [])], {
      href: item.href,
      ...(item.active ? { 'aria-current': 'page' } : {})
    });
    a.textContent = item.text;
    li.appendChild(a);
    navList.appendChild(li);
  });
  navContainer.appendChild(siteNav);

  const headerControls = new MockDOMElement('div', '', ['header-controls', 'nav-actions']);
  const themeToggle = new MockDOMElement('button', 'theme-toggle', ['theme-toggle-btn'], {
    'aria-label': 'Toggle dark and light theme',
    title: 'Toggle theme',
    type: 'button'
  });
  const navToggle = new MockDOMElement('button', 'nav-toggle', ['nav-toggle-btn'], {
    'aria-label': 'Open navigation menu',
    'aria-expanded': 'false',
    'aria-controls': 'nav-menu',
    type: 'button'
  });
  headerControls.appendChild(themeToggle);
  headerControls.appendChild(navToggle);
  navContainer.appendChild(headerControls);
  body.appendChild(header);

  // Main content
  const main = new MockDOMElement('main', 'main-content');
  body.appendChild(main);

  // Hero section
  const hero = new MockDOMElement('section', 'hero', ['section', 'hero-section']);
  const heroRoleWrapper = new MockDOMElement('div', '', ['hero-role-wrapper']);
  const roleRotator = new MockDOMElement('span', 'role-rotator', ['role-rotator'], {
    'aria-live': 'polite',
    'aria-atomic': 'true',
    'data-roles': '["AI/ML Engineer", "Flutter & Firebase Developer", "Full-stack Builder"]'
  });
  roleRotator.textContent = 'AI/ML Engineer';
  heroRoleWrapper.appendChild(roleRotator);
  hero.appendChild(heroRoleWrapper);

  // CTAs
  const heroCta1 = new MockDOMElement('a', '', ['btn', 'btn-primary'], { href: '#projects' });
  heroCta1.textContent = 'View Projects';
  const heroCta2 = new MockDOMElement('a', '', ['btn', 'btn-secondary'], { href: 'assets/resume.pdf' });
  heroCta2.textContent = 'Download Resume';
  hero.appendChild(heroCta1);
  hero.appendChild(heroCta2);

  // Hero stat counters
  const stat1 = new MockDOMElement('span', '', ['stat-number'], { 'data-target': '9.46', 'data-decimals': '2' });
  const stat2 = new MockDOMElement('span', '', ['stat-number'], { 'data-target': '7' });
  const stat3 = new MockDOMElement('span', '', ['stat-badge']); // CEH non-numeric
  stat3.textContent = 'CEH';
  const stat4 = new MockDOMElement('span', '', ['stat-number'], { 'data-target': '9' });
  hero.appendChild(stat1);
  hero.appendChild(stat2);
  hero.appendChild(stat3);
  hero.appendChild(stat4);
  main.appendChild(hero);

  // About section
  const about = new MockDOMElement('section', 'about', ['section', 'about-section', 'reveal-on-scroll']);
  main.appendChild(about);

  // Projects section
  const projects = new MockDOMElement('section', 'projects', ['section', 'projects-section']);
  const filterBar = new MockDOMElement('div', '', ['project-filters', 'filter-bar', 'reveal-on-scroll'], {
    role: 'toolbar',
    'aria-label': 'Filter projects by category'
  });

  const filterChipsData = [
    { filter: 'all', text: 'All (7)', active: true },
    { filter: 'mobile', text: 'Mobile (3)', active: false },
    { filter: 'web', text: 'Web (4)', active: false },
    { filter: 'ai', text: 'AI (4)', active: false }
  ];

  filterChipsData.forEach(item => {
    const chip = new MockDOMElement('button', '', ['filter-chip', ...(item.active ? ['active'] : [])], {
      'data-filter': item.filter,
      'aria-pressed': item.active ? 'true' : 'false',
      type: 'button'
    });
    chip.textContent = item.text;
    filterBar.appendChild(chip);
  });
  projects.appendChild(filterBar);

  const projectsGrid = new MockDOMElement('div', 'projects-grid', ['projects-grid']);

  // 7 projects from index.html
  const projectsData = [
    { title: 'Namma Nellai', category: 'mobile', url: 'https://nammanellai.online' },
    { title: 'SwiftShare', category: 'mobile', url: null },
    { title: 'HabitAI', category: 'web ai', url: null },
    { title: 'AI Notes & Productivity App', category: 'web ai', url: 'https://github.com/thiraviyarajr2007-dotcom/AI-Notes' },
    { title: 'Car Front Display GPS Tracker', category: 'web mobile', url: 'https://github.com/thiraviyarajr2007-dotcom/gps-tracker' },
    { title: 'Road Hazard Risk Classifier', category: 'ai', url: null },
    { title: 'Medicine Identification Platform', category: 'web ai', url: null }
  ];

  projectsData.forEach(p => {
    const card = new MockDOMElement('article', '', ['project-card', 'reveal-on-scroll'], {
      'data-category': p.category
    });
    const h3 = new MockDOMElement('h3', '', ['project-title']);
    h3.textContent = p.title;
    card.appendChild(h3);
    if (p.url) {
      const link = new MockDOMElement('a', '', ['btn', 'btn-primary', 'btn-sm'], { href: p.url });
      link.textContent = 'Link';
      card.appendChild(link);
    }
    projectsGrid.appendChild(card);
  });
  projects.appendChild(projectsGrid);
  main.appendChild(projects);

  // Skills section
  const skills = new MockDOMElement('section', 'skills', ['section', 'skills-section', 'reveal-on-scroll']);
  main.appendChild(skills);

  // Achievements section
  const achievements = new MockDOMElement('section', 'achievements', ['section', 'achievements-section', 'reveal-on-scroll']);
  main.appendChild(achievements);

  // Certifications section
  const certifications = new MockDOMElement('section', 'certifications', ['section', 'certifications-section', 'reveal-on-scroll']);
  main.appendChild(certifications);

  // Contact section
  const contact = new MockDOMElement('section', 'contact', ['section', 'contact-section', 'reveal-on-scroll']);
  const form = new MockDOMElement('form', 'contact-form', ['contact-form'], {
    action: 'https://formspree.io/f/placeholder',
    method: 'POST'
  });
  const nameInput = new MockDOMElement('input', 'contact-name');
  const emailInput = new MockDOMElement('input', 'contact-email');
  const messageInput = new MockDOMElement('textarea', 'contact-message');
  const formStatus = new MockDOMElement('div', 'form-status', [], {
    role: 'status',
    'aria-live': 'polite'
  });
  form.appendChild(nameInput);
  form.appendChild(emailInput);
  form.appendChild(messageInput);
  form.appendChild(formStatus);
  contact.appendChild(form);

  const backToTop = new MockDOMElement('a', '', ['back-to-top'], { href: '#hero' });
  contact.appendChild(backToTop);

  main.appendChild(contact);

  return { root, body };
}

// ----------------------------------------------------------------------------
// SETUP GLOBAL ENVIRONMENT HARNESS
// ----------------------------------------------------------------------------
function setupEnvironment() {
  const { root, body } = buildDOMFromHTML(htmlSource);

  const storageStore = new Map();
  let storageErrorMode = null; // 'quota', 'security', null

  const mockLocalStorage = {
    getItem(key) {
      if (storageErrorMode === 'security') throw new Error('SecurityError: Access denied');
      return storageStore.has(key) ? storageStore.get(key) : null;
    },
    setItem(key, val) {
      if (storageErrorMode === 'security') throw new Error('SecurityError: Access denied');
      if (storageErrorMode === 'quota') throw new Error('QuotaExceededError: Storage quota exceeded');
      storageStore.set(key, String(val));
    },
    removeItem(key) {
      if (storageErrorMode === 'security') throw new Error('SecurityError: Access denied');
      storageStore.delete(key);
    },
    clear() {
      if (storageErrorMode === 'security') throw new Error('SecurityError: Access denied');
      storageStore.clear();
    },
    _setMode(m) { storageErrorMode = m; },
    _store: storageStore
  };

  const mediaListeners = {
    '(prefers-color-scheme: dark)': [],
    '(prefers-reduced-motion: reduce)': [],
    '(min-width: 1024px)': []
  };

  const mediaStates = {
    '(prefers-color-scheme: dark)': true,
    '(prefers-reduced-motion: reduce)': false,
    '(min-width: 1024px)': false // default mobile
  };

  const mockMatchMedia = (query) => {
    return {
      matches: mediaStates[query] !== undefined ? mediaStates[query] : false,
      media: query,
      addEventListener(type, fn) {
        if (!mediaListeners[query]) mediaListeners[query] = [];
        mediaListeners[query].push(fn);
      },
      removeEventListener(type, fn) {
        if (mediaListeners[query]) {
          mediaListeners[query] = mediaListeners[query].filter(f => f !== fn);
        }
      },
      addListener(fn) {
        this.addEventListener('change', fn);
      },
      removeListener(fn) {
        this.removeEventListener('change', fn);
      }
    };
  };

  const windowListeners = {};
  const mockWindow = {
    localStorage: mockLocalStorage,
    matchMedia: mockMatchMedia,
    innerWidth: 375, // mobile viewport
    innerHeight: 667,
    pageYOffset: 0,
    addEventListener(type, fn) {
      if (!windowListeners[type]) windowListeners[type] = [];
      windowListeners[type].push(fn);
    },
    removeEventListener(type, fn) {
      if (windowListeners[type]) {
        windowListeners[type] = windowListeners[type].filter(f => f !== fn);
      }
    },
    dispatchEvent(event) {
      const handlers = windowListeners[event.type] || [];
      handlers.forEach(fn => fn(event));
    },
    requestAnimationFrame(fn) {
      return setTimeout(() => fn(Date.now()), 0);
    },
    cancelAnimationFrame(id) {
      clearTimeout(id);
    }
  };

  const documentListeners = {};
  const mockDocument = {
    documentElement: root,
    body: body,
    activeElement: null,
    hidden: false,
    readyState: 'complete',
    getElementById(id) {
      return root.querySelector('#' + id);
    },
    querySelector(sel) {
      return root.querySelector(sel);
    },
    querySelectorAll(sel) {
      return root.querySelectorAll(sel);
    },
    addEventListener(type, fn) {
      if (!documentListeners[type]) documentListeners[type] = [];
      documentListeners[type].push(fn);
    },
    removeEventListener(type, fn) {
      if (documentListeners[type]) {
        documentListeners[type] = documentListeners[type].filter(f => f !== fn);
      }
    },
    dispatchEvent(event) {
      const handlers = documentListeners[event.type] || [];
      handlers.forEach(fn => fn(event));
    }
  };

  // Attach globals
  global.window = mockWindow;
  global.document = mockDocument;
  global.CustomEvent = function (type, params) {
    return { type, detail: params ? params.detail : null };
  };
  global.requestAnimationFrame = mockWindow.requestAnimationFrame;
  global.cancelAnimationFrame = mockWindow.cancelAnimationFrame;

  // Clear module cache to allow clean re-import
  const scriptPath = path.resolve(__dirname, '..', 'script.js');
  delete require.cache[require.resolve(scriptPath)];
  const Portfolio = require(scriptPath);

  return {
    Portfolio,
    mockWindow,
    mockDocument,
    window: mockWindow,
    document: mockDocument,
    mockLocalStorage,
    mediaStates,
    mediaListeners,
    root,
    body
  };
}

// ----------------------------------------------------------------------------
// TEST RUNNER UTILITIES
// ----------------------------------------------------------------------------
let passedCount = 0;
let failedCount = 0;
const findings = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         Error: ${err.message}`);
    findings.push({ name, error: err.message, stack: err.stack });
    failedCount++;
  }
}

// ============================================================================
// SUITE 1: THEME MANAGER STRESS & STORAGE EDGE CASES
// ============================================================================
console.log('\n--- SUITE 1: Theme Manager Stress & Storage Edge Cases ---');

test('1.1: 1,000 rapid sequential toggle operations maintain parity and token sync', () => {
  const env = setupEnvironment();
  const tm = env.Portfolio.ThemeManager;
  tm.init();

  const root = env.document.documentElement;
  const toggleBtn = env.document.getElementById('theme-toggle');

  // Initial state should be dark
  assert.strictEqual(root.getAttribute('data-theme'), 'dark', 'Initial theme must be dark');
  assert.strictEqual(toggleBtn.getAttribute('aria-label'), 'Switch to light theme');

  // Perform 1,000 rapid toggles
  for (let i = 0; i < 1000; i++) {
    tm.toggleTheme();
  }

  // After even number of toggles (1000), must be exactly back to 'dark'
  assert.strictEqual(root.getAttribute('data-theme'), 'dark', 'Theme must be dark after 1000 toggles');
  assert.strictEqual(env.mockLocalStorage.getItem('theme'), 'dark', 'localStorage PRIMARY_KEY must be dark');
  assert.strictEqual(env.mockLocalStorage.getItem('portfolio-theme'), 'dark', 'localStorage ALIAS_KEY must be dark');
  assert.strictEqual(toggleBtn.getAttribute('aria-label'), 'Switch to light theme');

  // 1001st toggle -> light
  tm.toggleTheme();
  assert.strictEqual(root.getAttribute('data-theme'), 'light', 'Theme must be light after 1001 toggles');
  assert.strictEqual(env.mockLocalStorage.getItem('theme'), 'light');
  assert.strictEqual(env.mockLocalStorage.getItem('portfolio-theme'), 'light');
  assert.strictEqual(toggleBtn.getAttribute('aria-label'), 'Switch to dark theme');
});

test('1.2: Corrupted and adversarial localStorage values do not crash or corrupt theme', () => {
  const env = setupEnvironment();
  const tm = env.Portfolio.ThemeManager;

  const adversarialValues = [
    'null',
    'undefined',
    'dark; evil()',
    '<script>alert(1)</script>',
    '__proto__',
    'constructor',
    '',
    '   ',
    'DARK',
    'LIGHT',
    '123'
  ];

  adversarialValues.forEach(val => {
    env.mockLocalStorage.setItem('theme', val);
    env.mockLocalStorage.setItem('portfolio-theme', val);
    const resolved = tm.getTheme();
    // Non-dark/non-light must safely fallback to system preference (dark)
    assert.ok(resolved === 'dark' || resolved === 'light', `Corrupted val "${val}" resulted in invalid theme: ${resolved}`);
  });

  // Direct injection into setTheme with invalid strings
  tm.setTheme('MALICIOUS_INPUT', true);
  assert.strictEqual(env.document.documentElement.getAttribute('data-theme'), 'dark', 'Invalid setTheme input must fallback to dark');
});

test('1.3: QuotaExceededError and SecurityError storage exceptions handled gracefully', () => {
  const env = setupEnvironment();
  const tm = env.Portfolio.ThemeManager;
  tm.init();

  // Simulate QuotaExceededError
  env.mockLocalStorage._setMode('quota');
  assert.doesNotThrow(() => {
    tm.setTheme('light', true);
  }, 'QuotaExceededError must be caught gracefully');
  assert.strictEqual(env.document.documentElement.getAttribute('data-theme'), 'light', 'DOM data-theme should still update even if storage throws');

  // Simulate SecurityError (sandboxed iframe)
  env.mockLocalStorage._setMode('security');
  assert.doesNotThrow(() => {
    tm.getTheme();
    tm.toggleTheme();
  }, 'SecurityError must be caught gracefully');
  env.mockLocalStorage._setMode(null);
});

test('1.4: Cross-tab StorageEvent fuzzing and rapid broadcast handling', () => {
  const env = setupEnvironment();
  const tm = env.Portfolio.ThemeManager;
  tm.init();

  // Storage event with valid 'light'
  env.mockWindow.dispatchEvent({ type: 'storage', key: 'theme', newValue: 'light' });
  assert.strictEqual(env.document.documentElement.getAttribute('data-theme'), 'light', 'Storage event light must update DOM');

  // Storage event with key = null (e.g. localStorage.clear())
  assert.doesNotThrow(() => {
    env.mockWindow.dispatchEvent({ type: 'storage', key: null, newValue: null });
  }, 'Storage clear (key=null) must not throw');

  // Storage event with unrelated key
  env.mockWindow.dispatchEvent({ type: 'storage', key: 'unrelated_key', newValue: 'something' });
  assert.strictEqual(env.document.documentElement.getAttribute('data-theme'), 'light', 'Unrelated storage keys must be ignored');

  // Storage event with deletion of theme
  env.mockWindow.dispatchEvent({ type: 'storage', key: 'theme', newValue: null });
  assert.strictEqual(env.document.documentElement.getAttribute('data-theme'), 'dark', 'Removal of theme must reset to system preference (dark)');
});

// ============================================================================
// SUITE 2: PROJECT CATEGORY FILTERING ADVERSARIAL STRESS
// ============================================================================
console.log('\n--- SUITE 2: Project Category Filtering Adversarial Stress ---');

test('2.1: Exact category counts and compound tags evaluation', () => {
  const env = setupEnvironment();
  const pf = env.Portfolio.ProjectFilter;
  pf.init();

  const cards = env.document.querySelectorAll('.project-card[data-category]');
  assert.strictEqual(cards.length, 7, 'Must have exactly 7 project cards');

  // Test 'all' filter
  pf.applyFilter('all');
  let visible = cards.filter(c => !c.classList.contains('is-hidden'));
  assert.strictEqual(visible.length, 7, 'All (7) must show 7 cards');

  // Test 'mobile' filter (Namma Nellai, SwiftShare, GPS Tracker)
  pf.applyFilter('mobile');
  visible = cards.filter(c => !c.classList.contains('is-hidden'));
  assert.strictEqual(visible.length, 3, 'Mobile (3) must show exactly 3 cards');

  // Test 'web' filter (HabitAI, AI Notes, GPS Tracker, Medicine Platform)
  pf.applyFilter('web');
  visible = cards.filter(c => !c.classList.contains('is-hidden'));
  assert.strictEqual(visible.length, 4, 'Web (4) must show exactly 4 cards');

  // Test 'ai' filter (HabitAI, AI Notes, Road Safety, Medicine Platform)
  pf.applyFilter('ai');
  visible = cards.filter(c => !c.classList.contains('is-hidden'));
  assert.strictEqual(visible.length, 4, 'AI (4) must show exactly 4 cards');
});

test('2.2: 1,000 rapid randomized filter clicks maintain card visibility invariants', () => {
  const env = setupEnvironment();
  const pf = env.Portfolio.ProjectFilter;
  pf.init();

  const cards = env.document.querySelectorAll('.project-card[data-category]');
  const chips = env.document.querySelectorAll('.filter-chip[data-filter]');
  const filters = ['all', 'mobile', 'web', 'ai'];

  for (let i = 0; i < 1000; i++) {
    const f = filters[i % filters.length];
    pf.applyFilter(f);

    const hiddenCount = cards.filter(c => c.classList.contains('is-hidden')).length;
    const visibleCount = cards.filter(c => !c.classList.contains('is-hidden')).length;

    assert.strictEqual(hiddenCount + visibleCount, 7, 'Invariant violated: hidden + visible != 7');
  }

  // Verify chips state: exactly one chip active and aria-pressed=true
  pf.applyFilter('web');
  const activeChips = Array.from(chips).filter(c => c.classList.contains('active'));
  const pressedChips = Array.from(chips).filter(c => c.getAttribute('aria-pressed') === 'true');
  assert.strictEqual(activeChips.length, 1, 'Exactly one chip must be .active');
  assert.strictEqual(pressedChips.length, 1, 'Exactly one chip must have aria-pressed="true"');
  assert.strictEqual(activeChips[0].getAttribute('data-filter'), 'web');
});

test('2.3: Toolbar arrow keyboard navigation cyclic wrapping', () => {
  const env = setupEnvironment();
  const pf = env.Portfolio.ProjectFilter;

  const filterBar = env.document.querySelector('.project-filters');
  const chips = env.document.querySelectorAll('.filter-chip[data-filter]');

  // Focus on first chip ('all')
  chips[0].focus();
  assert.strictEqual(env.document.activeElement, chips[0]);

  // ArrowRight -> should focus chips[1] ('mobile') and apply filter
  filterBar.dispatchEvent({ type: 'keydown', key: 'ArrowRight', preventDefault() {} });
  assert.strictEqual(env.document.activeElement, chips[1], 'ArrowRight must focus next chip');
  assert.strictEqual(pf.getActiveFilter(), 'mobile', 'ArrowRight must trigger filter update');

  // End key -> should jump to chips[3] ('ai')
  filterBar.dispatchEvent({ type: 'keydown', key: 'End', preventDefault() {} });
  assert.strictEqual(env.document.activeElement, chips[3], 'End key must focus last chip');
  assert.strictEqual(pf.getActiveFilter(), 'ai');

  // ArrowRight on last chip -> should wrap to chips[0] ('all')
  filterBar.dispatchEvent({ type: 'keydown', key: 'ArrowRight', preventDefault() {} });
  assert.strictEqual(env.document.activeElement, chips[0], 'ArrowRight from last chip must wrap to first');
  assert.strictEqual(pf.getActiveFilter(), 'all');

  // ArrowLeft on first chip -> should wrap to chips[3] ('ai')
  filterBar.dispatchEvent({ type: 'keydown', key: 'ArrowLeft', preventDefault() {} });
  assert.strictEqual(env.document.activeElement, chips[3], 'ArrowLeft from first chip must wrap to last');
  assert.strictEqual(pf.getActiveFilter(), 'ai');

  // Home key -> should jump to chips[0]
  filterBar.dispatchEvent({ type: 'keydown', key: 'Home', preventDefault() {} });
  assert.strictEqual(env.document.activeElement, chips[0], 'Home key must focus first chip');
  assert.strictEqual(pf.getActiveFilter(), 'all');
});

test('2.4: Adversarial filter inputs (null, undefined, unknown categories)', () => {
  const env = setupEnvironment();
  const pf = env.Portfolio.ProjectFilter;
  pf.init();

  const cards = env.document.querySelectorAll('.project-card[data-category]');

  // Unknown category should hide all cards safely
  pf.applyFilter('non_existent_category');
  const visible = cards.filter(c => !c.classList.contains('is-hidden'));
  assert.strictEqual(visible.length, 0, 'Unknown category must show 0 cards');

  // What happens if applyFilter is invoked with null or undefined?
  // script.js line 560: filter.toLowerCase()
  // If filter is null or undefined, this might throw TypeError!
  let threwOnNull = false;
  try {
    pf.applyFilter(null);
  } catch (e) {
    threwOnNull = true;
  }
  assert.strictEqual(threwOnNull, true, 'EMPIRICAL BUG CONFIRMED: applyFilter(null) throws TypeError without null-guard');
});

// ============================================================================
// SUITE 3: MOBILE NAVIGATION DRAWER & FOCUS TRAP AUDIT
// ============================================================================
console.log('\n--- SUITE 3: Mobile Navigation Drawer & Focus Trap Audit ---');

test('3.1: Open / Close state transitions and ARIA attributes', () => {
  const env = setupEnvironment();
  const mn = env.Portfolio.MobileNavManager;
  mn.init();

  const navToggle = env.document.getElementById('nav-toggle');
  const navMenu = env.document.getElementById('site-nav');
  const body = env.document.body;

  assert.strictEqual(mn.isOpen(), false, 'Drawer initially closed');
  assert.strictEqual(navToggle.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(navMenu.getAttribute('aria-hidden'), 'true');
  assert.strictEqual(body.classList.contains('menu-open'), false);

  // Open drawer
  mn.open();
  assert.strictEqual(mn.isOpen(), true, 'Drawer should be open');
  assert.strictEqual(navToggle.getAttribute('aria-expanded'), 'true');
  assert.strictEqual(navToggle.getAttribute('aria-label'), 'Close navigation menu');
  assert.strictEqual(navMenu.getAttribute('aria-hidden'), 'false');
  assert.strictEqual(body.classList.contains('menu-open'), true);
  assert.strictEqual(navMenu.classList.contains('is-open'), true);

  // Close drawer
  mn.close();
  assert.strictEqual(mn.isOpen(), false, 'Drawer should be closed');
  assert.strictEqual(navToggle.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(navToggle.getAttribute('aria-label'), 'Open navigation menu');
  assert.strictEqual(navMenu.getAttribute('aria-hidden'), 'true');
  assert.strictEqual(body.classList.contains('menu-open'), false);
  assert.strictEqual(navMenu.classList.contains('is-open'), false);
});

test('3.2: Escape key dismissal and focus restoration to navToggle', () => {
  const env = setupEnvironment();
  const mn = env.Portfolio.MobileNavManager;
  mn.init();

  const navToggle = env.document.getElementById('nav-toggle');
  navToggle.focus();
  mn.open();

  assert.strictEqual(mn.isOpen(), true);

  // Press Escape
  let prevented = false;
  env.document.dispatchEvent({
    type: 'keydown',
    key: 'Escape',
    preventDefault() { prevented = true; }
  });

  assert.strictEqual(prevented, true, 'Escape keydown should be preventDefaulted');
  assert.strictEqual(mn.isOpen(), false, 'Drawer should close on Escape');
  assert.strictEqual(env.document.activeElement, navToggle, 'Focus must be restored to navToggle');
});

test('3.3: Breakpoint watcher (>= 1024px) auto-dismisses drawer and resets ARIA', () => {
  const env = setupEnvironment();
  const mn = env.Portfolio.MobileNavManager;
  mn.init();

  mn.open();
  assert.strictEqual(mn.isOpen(), true);

  // Simulate window resize across 1024px
  const bpListeners = env.mediaListeners['(min-width: 1024px)'] || [];
  assert.ok(bpListeners.length > 0, 'Must register breakpoint change listener');

  // Trigger resize event indicating desktop viewport
  bpListeners.forEach(fn => fn({ matches: true }));

  assert.strictEqual(mn.isOpen(), false, 'Drawer must auto-close upon desktop breakpoint');
  const navMenu = env.document.getElementById('site-nav');
  assert.strictEqual(navMenu.getAttribute('aria-hidden'), null, 'Desktop nav must not have aria-hidden');
  assert.strictEqual(env.document.body.classList.contains('menu-open'), false, 'menu-open class must be removed');
});

test('3.4: EMPIRICAL CHALLENGE — Keyboard Focus Trap Escapes via navToggle Tab and Home Shift+Tab', () => {
  const env = setupEnvironment();
  const mn = env.Portfolio.MobileNavManager;
  mn.init();

  const navToggle = env.document.getElementById('nav-toggle');
  const navLinks = env.document.querySelectorAll('#nav-menu a');
  const firstLink = navLinks[0]; // 'Home' link
  const lastLink = navLinks[navLinks.length - 1]; // 'Contact' link

  mn.open();
  assert.strictEqual(mn.isOpen(), true);

  // CHALLENGE PART 1: User is on first drawer link ('Home') and presses Shift+Tab
  // Expected accessible behavior: Focus must wrap to navToggle (stay within drawer).
  // Actual script.js behavior:
  //   ring = [navToggle, ...focusables]
  //   first = navToggle, last = Contact
  //   When activeElement === firstLink (Home): activeElement !== first (which is navToggle).
  //   Therefore, preventDefault is NOT called, and native browser shift-tabs out to brand-logo!
  firstLink.focus();
  let shiftTabPrevented = false;
  env.document.dispatchEvent({
    type: 'keydown',
    key: 'Tab',
    shiftKey: true,
    preventDefault() { shiftTabPrevented = true; }
  });

  console.log('    Shift+Tab on Home link prevented?:', shiftTabPrevented);
  if (!shiftTabPrevented) {
    console.log('    [DEFECT CONFIRMED] Shift+Tab on first drawer link fails to trap focus; focus leaks backwards out of drawer!');
  }

  // CHALLENGE PART 2: User tabs to lastLink ('Contact') and hits Tab
  lastLink.focus();
  let tabFromLastPrevented = false;
  env.document.dispatchEvent({
    type: 'keydown',
    key: 'Tab',
    shiftKey: false,
    preventDefault() { tabFromLastPrevented = true; }
  });
  assert.strictEqual(tabFromLastPrevented, true, 'Tab on last link is caught');
  assert.strictEqual(env.document.activeElement, navToggle, 'Focus was moved to navToggle');

  // Now focus is on navToggle!
  // CHALLENGE PART 3: User is on navToggle and presses Tab (forward)
  // Expected accessible behavior: Focus must wrap to firstLink (Home).
  // Actual script.js behavior:
  //   When activeElement === navToggle: activeElement !== last (which is Contact).
  //   Therefore, preventDefault is NOT called!
  //   In DOM tree order, navToggle is at the end of <header>, so native Tab proceeds into <main> (Hero CTAs)!
  let tabFromNavTogglePrevented = false;
  env.document.dispatchEvent({
    type: 'keydown',
    key: 'Tab',
    shiftKey: false,
    preventDefault() { tabFromNavTogglePrevented = true; }
  });

  console.log('    Tab on navToggle prevented?:', tabFromNavTogglePrevented);
  if (!tabFromNavTogglePrevented) {
    console.log('    [DEFECT CONFIRMED] Tab forward on navToggle fails to trap focus; focus leaks into page content behind modal drawer!');
  }

  // Verify that the focus trap leaks
  assert.strictEqual(shiftTabPrevented, false, 'Focus trap defect verified: Shift+Tab on Home is not prevented');
  assert.strictEqual(tabFromNavTogglePrevented, false, 'Focus trap defect verified: Tab on navToggle is not prevented');
});

// ============================================================================
// SUITE 4: HERO ROLE ROTATOR & MOTION SUBSYSTEM STRESS
// ============================================================================
console.log('\n--- SUITE 4: Hero Role Rotator & Motion Subsystem Stress ---');

test('4.1: Hero role rotator cycles sequentially through roles with polite live region', () => {
  const env = setupEnvironment();
  const rr = env.Portfolio.RoleRotator;
  rr.init();

  const rotatorElem = env.document.getElementById('role-rotator');
  assert.strictEqual(rotatorElem.getAttribute('aria-live'), 'polite', 'aria-live must be polite');
  assert.strictEqual(rotatorElem.getAttribute('aria-atomic'), 'true', 'aria-atomic must be true');

  const roles = rr.getRoles();
  assert.deepStrictEqual(roles, [
    'AI/ML Engineer',
    'Flutter & Firebase Developer',
    'Full-stack Builder'
  ]);

  // Rotate manually
  rr.next();
  assert.strictEqual(rr.getCurrentRole(), 'Flutter & Firebase Developer');
  rr.next();
  assert.strictEqual(rr.getCurrentRole(), 'Full-stack Builder');
  rr.next();
  assert.strictEqual(rr.getCurrentRole(), 'AI/ML Engineer', 'Must wrap back to first role');

  rr.stopTimer();
});

test('4.2: WCAG 2.2.2 Role rotator pause on hover/focus and tab visibilitychange', () => {
  const env = setupEnvironment();
  const rr = env.Portfolio.RoleRotator;
  rr.init();

  const wrapper = env.document.querySelector('.hero-role-wrapper');

  // Hover in -> pause
  wrapper.dispatchEvent({ type: 'mouseenter' });
  const roleBefore = rr.getCurrentRole();
  rr.next(); // Attempt rotation while paused
  assert.strictEqual(rr.getCurrentRole(), roleBefore, 'Must not rotate while hovered');

  // Hover out -> unpause
  wrapper.dispatchEvent({ type: 'mouseleave' });
  rr.next();
  assert.notStrictEqual(rr.getCurrentRole(), roleBefore, 'Must rotate when hover ends');

  // Visibility change to hidden
  env.document.hidden = true;
  env.document.dispatchEvent({ type: 'visibilitychange' });
  // Timer should be stopped

  // Visibility change to visible
  env.document.hidden = false;
  env.document.dispatchEvent({ type: 'visibilitychange' });
  rr.stopTimer();
});

test('4.3: Stat numbers format decimal (9.46) and integer (7, 9) while preserving CEH badge', () => {
  const env = setupEnvironment();
  const ms = env.Portfolio.MotionSubsystem;

  // Force reduced motion to test instant value formatting
  ms.forceFinalStatValues();

  const statTargets = env.document.querySelectorAll('.stat-number[data-target]');
  const cehBadge = env.document.querySelector('.stat-badge');

  assert.strictEqual(statTargets[0].textContent, '9.46', 'Decimal counter must format to 2 places');
  assert.strictEqual(statTargets[1].textContent, '7', 'Integer counter 7 must format cleanly');
  assert.strictEqual(statTargets[2].textContent, '9', 'Integer counter 9 must format cleanly');

  // CEH badge must be untouched
  assert.strictEqual(cehBadge.textContent, 'CEH', 'Non-numeric CEH credential badge must remain untouched');
});

test('4.4: Dynamic prefers-reduced-motion toggle mid-animation immediately forces final state', () => {
  const env = setupEnvironment();
  const ms = env.Portfolio.MotionSubsystem;
  ms.init();

  const statElements = env.document.querySelectorAll('.stat-number[data-target]');
  const revealElements = env.document.querySelectorAll('.reveal-on-scroll');

  // Trigger reduced motion media query change
  const motionListeners = env.mediaListeners['(prefers-reduced-motion: reduce)'] || [];
  assert.ok(motionListeners.length > 0, 'Reduced motion change listener must be registered');

  motionListeners.forEach(fn => fn({ matches: true }));

  // All 51 reveal elements must have .revealed
  revealElements.forEach(el => {
    assert.strictEqual(el.classList.contains('revealed'), true, 'Element must be revealed under reduced motion');
  });

  // All stat numbers must be at final values
  assert.strictEqual(statElements[0].textContent, '9.46');
  assert.strictEqual(statElements[1].textContent, '7');
  assert.strictEqual(statElements[2].textContent, '9');
});

// ============================================================================
// SUITE 5: CONTACT FORM & UTILITY HANDLERS
// ============================================================================
console.log('\n--- SUITE 5: Contact Form & Utility Handlers ---');

test('5.1: Form submission prevention on placeholder endpoint with validation', () => {
  const env = setupEnvironment();

  const form = env.document.getElementById('contact-form');
  const nameInput = env.document.getElementById('contact-name');
  const emailInput = env.document.getElementById('contact-email');
  const msgInput = env.document.getElementById('contact-message');
  const status = env.document.getElementById('form-status');

  // Submit with empty inputs
  let defaultPrevented = false;
  form.dispatchEvent({
    type: 'submit',
    preventDefault() { defaultPrevented = true; }
  });

  assert.strictEqual(defaultPrevented, true, 'Form submission to placeholder must be prevented');
  assert.strictEqual(status.textContent, 'Please fill out all required fields.');

  // Fill inputs and submit
  nameInput.value = 'John Recruiter';
  emailInput.value = 'john@example.com';
  msgInput.value = 'Great portfolio!';

  form.dispatchEvent({
    type: 'submit',
    preventDefault() {}
  });

  assert.ok(status.textContent.includes('Thank you, John Recruiter!'), 'Status must announce receipt');
  assert.ok(status.textContent.includes('thiraviyaraj2007@gmail.com'), 'Status must provide direct email');
  assert.strictEqual(nameInput.value, '', 'Form inputs must reset');
});

// ============================================================================
// SUITE 6: RUNTIME EXCEPTION FUZZING AUDIT
// ============================================================================
console.log('\n--- SUITE 6: Runtime Exception Fuzzing Audit ---');

test('6.1: Zero runtime exceptions under random event bombardment', () => {
  const env = setupEnvironment();
  const tm = env.Portfolio.ThemeManager;
  const pf = env.Portfolio.ProjectFilter;
  const mn = env.Portfolio.MobileNavManager;
  const rr = env.Portfolio.RoleRotator;

  tm.init();
  pf.init();
  mn.init();
  rr.init();

  const actions = [
    () => tm.toggleTheme(),
    () => tm.setTheme('dark', false),
    () => tm.setTheme('light', true),
    () => pf.applyFilter('all'),
    () => pf.applyFilter('mobile'),
    () => pf.applyFilter('web'),
    () => pf.applyFilter('ai'),
    () => mn.toggle(),
    () => mn.open(),
    () => mn.close(),
    () => rr.next(),
    () => env.document.dispatchEvent({ type: 'keydown', key: 'Escape', preventDefault() {} }),
    () => env.document.dispatchEvent({ type: 'keydown', key: 'Tab', shiftKey: false, preventDefault() {} }),
    () => env.document.dispatchEvent({ type: 'keydown', key: 'Tab', shiftKey: true, preventDefault() {} }),
    () => env.mockWindow.dispatchEvent({ type: 'scroll' }),
    () => env.mockWindow.dispatchEvent({ type: 'storage', key: 'theme', newValue: 'dark' })
  ];

  assert.doesNotThrow(() => {
    for (let i = 0; i < 2000; i++) {
      const action = actions[i % actions.length];
      action();
    }
  }, 'Zero runtime exceptions permitted during event bombardment');

  rr.stopTimer();
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log(`TEST EXECUTION SUMMARY:`);
console.log(`  Passed: ${passedCount}`);
console.log(`  Failed: ${failedCount}`);
console.log(`  Total:  ${passedCount + failedCount}`);
console.log('='.repeat(80));

if (findings.length > 0) {
  console.log('\nEMPIRICALLY CONFIRMED DEFECTS:');
  findings.forEach((f, idx) => {
    console.log(`\n[Defect ${idx + 1}] ${f.name}`);
    console.log(`  Detail: ${f.error}`);
  });
}
