/**
 * Prototype test verifying focus trap behavior in script.js
 * Demonstrating both the failure on unpatched script.js and the pass on patched logic.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('='.repeat(70));
console.log('PROTOTYPE TEST: FOCUS TRAP & KEYBOARD NAVIGATION VERIFICATION');
console.log('='.repeat(70));

// --- MOCK DOM INFRASTRUCTURE ---
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
    if (selector.includes('.nav-link') && this.classList.contains('nav-link')) matches.push(this);
    for (let c of this.children) {
      matches = matches.concat(c.querySelectorAll(selector));
    }
    return matches;
  }
}

// Global Event Bus for document
const docListeners = {};

const docElem = new MockElement('html', '', [], { 'data-theme': 'dark' });
const bodyElem = new MockElement('body');

const themeToggleBtn = new MockElement('button', 'theme-toggle', ['theme-toggle-btn'], {
  'aria-label': 'Switch to light theme'
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

global.window = {
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  innerWidth: 375,
  innerHeight: 800,
  pageYOffset: 0
};

global.document = {
  documentElement: docElem,
  body: bodyElem,
  activeElement: null,
  getElementById: (id) => {
    if (id === 'theme-toggle') return themeToggleBtn;
    if (id === 'nav-toggle') return navToggleBtn;
    if (id === 'site-nav') return navMenu;
    if (id === 'nav-menu') return navMenuUl;
    return null;
  },
  querySelector: (sel) => {
    if (sel === '.theme-toggle-btn') return themeToggleBtn;
    if (sel === '.nav-toggle-btn') return navToggleBtn;
    if (sel === '.nav-menu') return navMenu;
    return null;
  },
  querySelectorAll: (sel) => {
    if (sel.includes('.nav-link')) return navLinks;
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
    const list = docListeners[event.type] || [];
    list.forEach(fn => fn(event));
  }
};

function createKeyEvent(key, options = {}) {
  let defaultPrevented = false;
  return {
    type: 'keydown',
    key: key,
    keyCode: options.keyCode || (key === 'Tab' ? 9 : (key === 'Escape' ? 27 : 0)),
    shiftKey: Boolean(options.shiftKey),
    preventDefault() { defaultPrevented = true; },
    get defaultPrevented() { return defaultPrevented; }
  };
}

const scriptPath = path.resolve(__dirname, '../../../script.js');
const Portfolio = require(scriptPath);

console.log('MobileNavManager loaded.');
Portfolio.MobileNavManager.init();

// --- TEST 1: Escape key handling ---
console.log('\n--- 1. Testing Escape Key Handling ---');
Portfolio.MobileNavManager.open();
assert.strictEqual(Portfolio.MobileNavManager.isOpen(), true);
navLinks[2].focus(); // Focus on '#projects'

const escEvent = createKeyEvent('Escape');
global.document.dispatchEvent(escEvent);

assert.strictEqual(escEvent.defaultPrevented, true, 'Escape must call preventDefault()');
assert.strictEqual(Portfolio.MobileNavManager.isOpen(), false, 'Drawer must be closed after Escape');
assert.strictEqual(navToggleBtn.getAttribute('aria-expanded'), 'false');
assert.strictEqual(global.document.activeElement, navToggleBtn, 'Focus must return to navToggleBtn');
console.log('[PASS] Escape key handling verified');

// --- TEST 2: Tab on navToggleBtn (wrapping to first link) ---
console.log('\n--- 2. Testing Tab keydown on navToggleBtn (wrap to first link) ---');
Portfolio.MobileNavManager.open();
navToggleBtn.focus();
assert.strictEqual(global.document.activeElement, navToggleBtn);

const tabFromToggle = createKeyEvent('Tab', { shiftKey: false });
global.document.dispatchEvent(tabFromToggle);

try {
  assert.strictEqual(tabFromToggle.defaultPrevented, true, 'Tab on navToggleBtn must call preventDefault()');
  assert.strictEqual(global.document.activeElement, navLinks[0], 'Focus must wrap to first link (#hero)');
  console.log('[PASS] Tab on navToggleBtn wraps to first link');
} catch (e) {
  console.log('[EXPECTED CURRENT BUG] Tab on navToggleBtn failed: ' + e.message);
}

// --- TEST 3: Shift+Tab on first link (wrapping to navToggleBtn) ---
console.log('\n--- 3. Testing Shift+Tab on first link (#hero) (wrap to navToggleBtn) ---');
navLinks[0].focus();
assert.strictEqual(global.document.activeElement, navLinks[0]);

const shiftTabFromFirst = createKeyEvent('Tab', { shiftKey: true });
global.document.dispatchEvent(shiftTabFromFirst);

try {
  assert.strictEqual(shiftTabFromFirst.defaultPrevented, true, 'Shift+Tab on first link must call preventDefault()');
  assert.strictEqual(global.document.activeElement, navToggleBtn, 'Focus must wrap to navToggleBtn');
  console.log('[PASS] Shift+Tab on first link wraps to navToggleBtn');
} catch (e) {
  console.log('[EXPECTED CURRENT BUG] Shift+Tab on first link failed: ' + e.message);
}

// --- TEST 4: Normal Tab navigation between inner links ---
console.log('\n--- 4. Testing Normal Tab navigation on inner links ---');
navLinks[1].focus(); // '#about'
assert.strictEqual(global.document.activeElement, navLinks[1]);

const innerTab = createKeyEvent('Tab', { shiftKey: false });
global.document.dispatchEvent(innerTab);
assert.strictEqual(innerTab.defaultPrevented, false, 'Inner Tab must NOT call preventDefault()');
assert.strictEqual(global.document.activeElement, navLinks[1], 'Focus must not be hijacked on inner Tab');

const innerShiftTab = createKeyEvent('Tab', { shiftKey: true });
global.document.dispatchEvent(innerShiftTab);
assert.strictEqual(innerShiftTab.defaultPrevented, false, 'Inner Shift+Tab must NOT call preventDefault()');
assert.strictEqual(global.document.activeElement, navLinks[1], 'Focus must not be hijacked on inner Shift+Tab');
console.log('[PASS] Inner link navigation does not trigger focus hijacking');

Portfolio.MobileNavManager.close(false);
console.log('\nPrototype test complete.');
