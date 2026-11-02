/**
 * Exact proposed code for test_script_unified.js Test 2
 */

const assert = require('assert');

// DOM MOCK SIMULATION AS IN test_script_unified.js
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
    this.children = [];
    this.listeners = {};
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

global.document = {
  documentElement: docElem,
  body: bodyElem,
  activeElement: null,
  getElementById: (id) => {
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
    preventDefault() { defaultPrevented = true; },
    get defaultPrevented() { return defaultPrevented; }
  };
}

// SIMULATE MobileNavManager WITH PATCHED LOGIC
const Portfolio = {
  MobileNavManager: (function () {
    let isOpen = false;
    let previousFocusedElement = null;

    function getFocusableElements() {
      return navLinks;
    }

    function open() {
      if (isOpen) return;
      isOpen = true;
      previousFocusedElement = global.document.activeElement;
      navMenu.classList.add('is-open');
      navMenuUl.classList.add('is-open');
      bodyElem.classList.add('menu-open');
      navToggleBtn.setAttribute('aria-expanded', 'true');
      navToggleBtn.setAttribute('aria-label', 'Close navigation menu');
      navMenu.setAttribute('aria-hidden', 'false');
      global.document.addEventListener('keydown', handleKeyDown);
      navLinks[0].focus();
    }

    function close(restoreFocus) {
      if (!isOpen) return;
      if (restoreFocus === undefined) restoreFocus = true;
      isOpen = false;
      navMenu.classList.remove('is-open');
      navMenuUl.classList.remove('is-open');
      bodyElem.classList.remove('menu-open');
      navToggleBtn.setAttribute('aria-expanded', 'false');
      navToggleBtn.setAttribute('aria-label', 'Open navigation menu');
      navMenu.setAttribute('aria-hidden', 'true');
      global.document.removeEventListener('keydown', handleKeyDown);
      if (restoreFocus && navToggleBtn) {
        navToggleBtn.focus();
      }
    }

    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
        e.preventDefault();
        close(true);
        return;
      }

      if (e.key === 'Tab' || e.keyCode === 9) {
        var focusables = getFocusableElements();
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        var firstLink = focusables[0];
        var lastLink = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (global.document.activeElement === firstLink) {
            e.preventDefault();
            if (navToggleBtn) navToggleBtn.focus();
          } else if (global.document.activeElement === navToggleBtn) {
            e.preventDefault();
            lastLink.focus();
          }
        } else {
          if (global.document.activeElement === lastLink) {
            e.preventDefault();
            if (navToggleBtn) navToggleBtn.focus();
          } else if (global.document.activeElement === navToggleBtn) {
            e.preventDefault();
            firstLink.focus();
          }
        }
      }
    }

    return {
      init: () => {},
      open,
      close,
      isOpen: () => isOpen
    };
  })()
};

// ==============================================================================
// TEST EXECUTION (Matches proposed test_script_unified.js)
// ==============================================================================
console.log('\n--- 2. Testing Accessible Mobile Navigation Drawer & Focus Trap ---');
Portfolio.MobileNavManager.init();

// 2.1 State Transitions, ARIA, and Body Scroll Lock
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

// 2.4 Tab Forward on Last Link (#contact) -> Moves to navToggleBtn
const lastLink = navLinks[navLinks.length - 1];
lastLink.focus();
assert.strictEqual(global.document.activeElement, lastLink, 'Active element must be #contact');
const tabFromLast = createKeyEvent('Tab', { shiftKey: false });
global.document.dispatchEvent(tabFromLast);
assert.strictEqual(tabFromLast.defaultPrevented, true, 'Tab on last link must call preventDefault() to skip background theme-toggle');
assert.strictEqual(global.document.activeElement, navToggleBtn, 'Focus must advance to navToggleBtn');
console.log('[PASS] 2.4 Forward Tab on last link (#contact) advances focus to navToggleBtn with preventDefault()');

// 2.5 Shift+Tab Backward on navToggleBtn -> Moves to Last Link (#contact)
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

console.log('\n[ALL MODULE 2 UNIT TESTS PASSED SUCCESSFULLY]');
