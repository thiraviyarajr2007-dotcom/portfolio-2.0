/**
 * Prototype test verifying patched focus trap behavior
 */

const assert = require('assert');
const path = require('path');

console.log('='.repeat(70));
console.log('VERIFYING PATCHED FOCUS TRAP LOGIC');
console.log('='.repeat(70));

class MockClassList {
  constructor(initial = []) { this._set = new Set(initial); }
  add(c) { this._set.add(c); }
  remove(c) { this._set.delete(c); }
  contains(c) { return this._set.has(c); }
}

class MockElement {
  constructor(tag, id = '', classes = [], attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.classList = new MockClassList(classes);
    this.attributes = { ...attrs };
    if (id) this.attributes['id'] = id;
    this.listeners = {};
    this.children = [];
    this.offsetParent = {};
  }
  getAttribute(name) { return this.attributes[name] !== undefined ? this.attributes[name] : null; }
  setAttribute(name, val) { this.attributes[name] = String(val); }
  hasAttribute(name) { return name in this.attributes; }
  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }
  removeEventListener(type, fn) {
    if (this.listeners[type]) this.listeners[type] = this.listeners[type].filter(f => f !== fn);
  }
  dispatchEvent(event) {
    (this.listeners[event.type] || []).forEach(fn => fn(event));
  }
  focus() { global.document.activeElement = this; }
  querySelectorAll(selector) {
    let matches = [];
    if (selector.includes('a[href]') && this.tagName === 'A' && this.hasAttribute('href')) matches.push(this);
    for (let c of this.children) matches = matches.concat(c.querySelectorAll(selector));
    return matches;
  }
}

const docListeners = {};
const docElem = new MockElement('html');
const bodyElem = new MockElement('body');
const themeToggleBtn = new MockElement('button', 'theme-toggle');
const navToggleBtn = new MockElement('button', 'nav-toggle', ['nav-toggle-btn'], { 'aria-expanded': 'false' });
const navMenu = new MockElement('nav', 'site-nav', ['site-nav', 'nav-menu']);
const navMenuUl = new MockElement('ul', 'nav-menu');
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
  innerWidth: 375, innerHeight: 800, pageYOffset: 0
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
    (docListeners[event.type] || []).forEach(fn => fn(event));
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

// Patched handleKeyDown logic:
let isOpen = true;

function patchedHandleKeyDown(e) {
  if (!isOpen) return;

  if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
    e.preventDefault();
    isOpen = false;
    navToggleBtn.setAttribute('aria-expanded', 'false');
    navToggleBtn.focus();
    return;
  }

  if (e.key === 'Tab' || e.keyCode === 9) {
    var focusables = navLinks; // simulated getFocusableElements()
    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }

    var firstLink = focusables[0];
    var lastLink = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstLink) {
        e.preventDefault();
        if (navToggleBtn) navToggleBtn.focus();
      } else if (document.activeElement === navToggleBtn) {
        e.preventDefault();
        lastLink.focus();
      }
    } else {
      if (document.activeElement === lastLink) {
        e.preventDefault();
        if (navToggleBtn) navToggleBtn.focus();
      } else if (document.activeElement === navToggleBtn) {
        e.preventDefault();
        firstLink.focus();
      }
    }
  }
}

docListeners['keydown'] = [patchedHandleKeyDown];

// 1. Tab forward on navToggleBtn -> wrap to firstLink
navToggleBtn.focus();
let ev1 = createKeyEvent('Tab', { shiftKey: false });
global.document.dispatchEvent(ev1);
assert.strictEqual(ev1.defaultPrevented, true, 'Tab on navToggleBtn must preventDefault');
assert.strictEqual(global.document.activeElement, navLinks[0], 'Must wrap to navLinks[0]');
console.log('[PASS] 1. Tab on navToggleBtn wraps to firstLink (#hero)');

// 2. Shift+Tab on firstLink -> wrap to navToggleBtn
navLinks[0].focus();
let ev2 = createKeyEvent('Tab', { shiftKey: true });
global.document.dispatchEvent(ev2);
assert.strictEqual(ev2.defaultPrevented, true, 'Shift+Tab on firstLink must preventDefault');
assert.strictEqual(global.document.activeElement, navToggleBtn, 'Must wrap to navToggleBtn');
console.log('[PASS] 2. Shift+Tab on firstLink (#hero) wraps to navToggleBtn');

// 3. Tab on lastLink -> wrap to navToggleBtn
navLinks[navLinks.length - 1].focus();
let ev3 = createKeyEvent('Tab', { shiftKey: false });
global.document.dispatchEvent(ev3);
assert.strictEqual(ev3.defaultPrevented, true, 'Tab on lastLink must preventDefault');
assert.strictEqual(global.document.activeElement, navToggleBtn, 'Must wrap to navToggleBtn');
console.log('[PASS] 3. Tab on lastLink (#contact) wraps to navToggleBtn');

// 4. Shift+Tab on navToggleBtn -> wrap to lastLink
navToggleBtn.focus();
let ev4 = createKeyEvent('Tab', { shiftKey: true });
global.document.dispatchEvent(ev4);
assert.strictEqual(ev4.defaultPrevented, true, 'Shift+Tab on navToggleBtn must preventDefault');
assert.strictEqual(global.document.activeElement, navLinks[navLinks.length - 1], 'Must wrap to lastLink');
console.log('[PASS] 4. Shift+Tab on navToggleBtn wraps to lastLink (#contact)');

// 5. Normal inner Tab navigation
navLinks[1].focus();
let ev5 = createKeyEvent('Tab', { shiftKey: false });
global.document.dispatchEvent(ev5);
assert.strictEqual(ev5.defaultPrevented, false, 'Inner Tab must NOT preventDefault');
assert.strictEqual(global.document.activeElement, navLinks[1], 'Focus must remain unchanged');
console.log('[PASS] 5. Inner Tab navigation is untouched (allows natural DOM tab)');

// 6. Normal inner Shift+Tab navigation
navLinks[2].focus();
let ev6 = createKeyEvent('Tab', { shiftKey: true });
global.document.dispatchEvent(ev6);
assert.strictEqual(ev6.defaultPrevented, false, 'Inner Shift+Tab must NOT preventDefault');
assert.strictEqual(global.document.activeElement, navLinks[2], 'Focus must remain unchanged');
console.log('[PASS] 6. Inner Shift+Tab navigation is untouched');

// 7. Escape key handling
navLinks[3].focus();
let ev7 = createKeyEvent('Escape');
global.document.dispatchEvent(ev7);
assert.strictEqual(ev7.defaultPrevented, true, 'Escape must call preventDefault');
assert.strictEqual(isOpen, false, 'Drawer must be marked closed');
assert.strictEqual(global.document.activeElement, navToggleBtn, 'Focus must return to navToggleBtn');
console.log('[PASS] 7. Escape key handling verified');

console.log('\nALL 7 CHECKS PASSED PERFECTLY!');
